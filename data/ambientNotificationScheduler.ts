import AsyncStorage from "@react-native-async-storage/async-storage";
import { notificationService, AmbientPayload } from "@/services/notificationService";
import { entityEngine } from "./entityEngine";
import { messageSystem } from "./messages";

export type FrequencyLevel = "low" | "normal" | "high";

interface QuietHours {
  start: string;
  end: string;
}

interface DailyNotificationState {
  date: string;
  count: number;
  scheduledIds: string[];
}

const FREQUENCY_CAPS = {
  low: 2,
  normal: 5,
  high: 10,
};

const STORAGE_KEY_DAILY_STATE = "@lingr/daily_notification_state";

class AmbientNotificationScheduler {
  private isEnabled: boolean = false;
  private frequency: FrequencyLevel = "normal";
  private quietHours: QuietHours = { start: "23:00", end: "07:00" };
  private dailyState: DailyNotificationState | null = null;

  async initialize(
    enabled: boolean,
    frequency: FrequencyLevel,
    quietHours: QuietHours
  ): Promise<void> {
    this.isEnabled = enabled;
    this.frequency = frequency;
    this.quietHours = quietHours;

    await this.loadDailyState();

    if (this.isEnabled) {
      await this.scheduleNotifications();
    } else {
      await this.cancelAll();
    }
  }

  async updateSettings(
    enabled: boolean,
    frequency: FrequencyLevel,
    quietHours: QuietHours
  ): Promise<void> {
    const wasEnabled = this.isEnabled;
    this.isEnabled = enabled;
    this.frequency = frequency;
    this.quietHours = quietHours;

    if (this.isEnabled && !wasEnabled) {
      await this.scheduleNotifications();
    } else if (!this.isEnabled && wasEnabled) {
      await this.cancelAll();
    } else if (this.isEnabled) {
      await this.rescheduleNotifications();
    }
  }

  private async loadDailyState(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY_DAILY_STATE);
      if (stored) {
        const state: DailyNotificationState = JSON.parse(stored);
        const today = this.getTodayDateString();
        
        if (state.date === today) {
          this.dailyState = state;
        } else {
          this.dailyState = this.createFreshDailyState();
          await this.saveDailyState();
        }
      } else {
        this.dailyState = this.createFreshDailyState();
        await this.saveDailyState();
      }
    } catch (error) {
      console.error("[AmbientScheduler] Failed to load daily state:", error);
      this.dailyState = this.createFreshDailyState();
    }
  }

  private async saveDailyState(): Promise<void> {
    if (!this.dailyState) return;
    
    try {
      await AsyncStorage.setItem(
        STORAGE_KEY_DAILY_STATE,
        JSON.stringify(this.dailyState)
      );
    } catch (error) {
      console.error("[AmbientScheduler] Failed to save daily state:", error);
    }
  }

  private createFreshDailyState(): DailyNotificationState {
    return {
      date: this.getTodayDateString(),
      count: 0,
      scheduledIds: [],
    };
  }

  private getTodayDateString(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  }

  private async scheduleNotifications(): Promise<void> {
    if (!this.isEnabled) return;

    await this.loadDailyState();
    if (!this.dailyState) return;

    const cap = FREQUENCY_CAPS[this.frequency];
    const remaining = cap - this.dailyState.count;

    if (remaining <= 0) {
      if (__DEV__) {
        console.log(`[AmbientScheduler] Daily cap reached (${cap}), no more notifications today`);
      }
      return;
    }

    const mood = entityEngine.getMood();
    const intensity = entityEngine.getIntensity();
    
    let notificationsToSchedule = remaining;
    
    if (mood === "dormant" && intensity < 0.2) {
      notificationsToSchedule = Math.max(1, Math.floor(remaining * 0.3));
    }

    const times = this.generateRandomTimes(notificationsToSchedule);

    for (const time of times) {
      const message = messageSystem.getMessage(mood);
      const payload: AmbientPayload = {
        title: "LINGR",
        body: message,
        tag: mood,
      };

      try {
        const notificationId = await notificationService.scheduleAmbientNotification(
          time,
          payload
        );
        
        this.dailyState.scheduledIds.push(notificationId);
        this.dailyState.count++;
      } catch (error) {
        console.error("[AmbientScheduler] Failed to schedule notification:", error);
      }
    }

    await this.saveDailyState();
  }

  private generateRandomTimes(count: number): Date[] {
    const now = new Date();
    const times: Date[] = [];
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    const windowStart = new Date(now.getTime() + 30 * 60 * 1000);
    const windowEnd = endOfDay;

    for (let i = 0; i < count; i++) {
      let attempts = 0;
      let validTime: Date | null = null;

      while (attempts < 20 && !validTime) {
        const randomTime = new Date(
          windowStart.getTime() +
            Math.random() * (windowEnd.getTime() - windowStart.getTime())
        );

        if (!this.isInQuietHours(randomTime) && !this.isTooCloseToOthers(randomTime, times)) {
          validTime = randomTime;
        }
        attempts++;
      }

      if (validTime) {
        times.push(validTime);
      }
    }

    return times.sort((a, b) => a.getTime() - b.getTime());
  }

  private isInQuietHours(time: Date): boolean {
    const timeString = `${String(time.getHours()).padStart(2, "0")}:${String(time.getMinutes()).padStart(2, "0")}`;
    
    const start = this.quietHours.start;
    const end = this.quietHours.end;

    if (start < end) {
      return timeString >= start && timeString < end;
    } else {
      return timeString >= start || timeString < end;
    }
  }

  private isTooCloseToOthers(time: Date, others: Date[]): boolean {
    const minGapMinutes = 30;
    
    for (const other of others) {
      const diffMinutes = Math.abs(time.getTime() - other.getTime()) / (1000 * 60);
      if (diffMinutes < minGapMinutes) {
        return true;
      }
    }
    
    return false;
  }

  private async rescheduleNotifications(): Promise<void> {
    await this.cancelAll();
    await this.loadDailyState();
    
    if (this.dailyState) {
      this.dailyState.count = 0;
      this.dailyState.scheduledIds = [];
      await this.saveDailyState();
    }
    
    await this.scheduleNotifications();
  }

  async cancelAll(): Promise<void> {
    await notificationService.cancelAllAmbientNotifications();
    
    if (this.dailyState) {
      this.dailyState.scheduledIds = [];
      await this.saveDailyState();
    }
  }

  async sendTestNotification(): Promise<void> {
    const canSend = await notificationService.canSendNotifications();
    if (!canSend) {
      console.warn("[AmbientScheduler] Cannot send test notification - permission not granted");
      return;
    }

    const mood = entityEngine.getMood();
    const message = messageSystem.getMessage(mood);
    
    const payload: AmbientPayload = {
      title: "LINGR [TEST]",
      body: message,
      tag: `test_${mood}`,
    };

    const now = new Date(Date.now() + 2000);
    
    try {
      await notificationService.scheduleAmbientNotification(now, payload);
      if (__DEV__) {
        console.log("[AmbientScheduler] Test notification scheduled for 2 seconds from now");
      }
    } catch (error) {
      console.error("[AmbientScheduler] Failed to send test notification:", error);
    }
  }

  getDailyCount(): number {
    return this.dailyState?.count || 0;
  }

  getDailyCap(): number {
    return FREQUENCY_CAPS[this.frequency];
  }
}

export const ambientNotificationScheduler = new AmbientNotificationScheduler();
