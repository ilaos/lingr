import AsyncStorage from "@react-native-async-storage/async-storage";
import { notificationService, AmbientPayload } from "@/services/notificationService";
import { entityEngine } from "./entityEngine";
import { messageSystem } from "./messages";
import { environmentEngine } from "./environmentEngine";

export type FrequencyLevel = "low" | "normal" | "high";

interface QuietHours {
  start: string;
  end: string;
}

interface DailyNotificationState {
  date: string;
  count: number;
  scheduledIds: string[];
  lastScheduledAt: number;
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
  private isScheduling: boolean = false;
  private pendingReschedule: boolean = false;

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

  async checkAndRescheduleIfNewDay(): Promise<void> {
    if (!this.isEnabled || this.isScheduling) {
      if (this.isScheduling && __DEV__) {
        console.log("[AmbientScheduler] Scheduling in progress, deferring rollover check");
      }
      return;
    }

    await this.loadDailyState(true);
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

  private async loadDailyState(autoScheduleIfNewDay: boolean = false): Promise<boolean> {
    if (this.isScheduling) {
      if (__DEV__) {
        console.log("[AmbientScheduler] Scheduling in progress, skipping state reload");
      }
      return false;
    }
    
    let isNewDay = false;
    
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY_DAILY_STATE);
      const today = this.getTodayDateString();
      const now = Date.now();
      
      if (stored) {
        const state: DailyNotificationState = JSON.parse(stored);
        
        if (state.date === today) {
          this.dailyState = state;
          
          const timeSinceLastSchedule = now - (state.lastScheduledAt || 0);
          const fiveMinutes = 5 * 60 * 1000;
          
          if (autoScheduleIfNewDay && this.isEnabled && timeSinceLastSchedule < fiveMinutes) {
            if (__DEV__) {
              console.log(`[AmbientScheduler] Recently scheduled (${Math.floor(timeSinceLastSchedule / 1000)}s ago), skipping duplicate`);
            }
            return false;
          }
        } else {
          if (__DEV__) {
            console.log(`[AmbientScheduler] New day detected: ${state.date} → ${today}`);
          }
          isNewDay = true;
          this.dailyState = this.createFreshDailyState();
          await this.saveDailyState();
          
          if (autoScheduleIfNewDay && this.isEnabled) {
            await this.scheduleNotifications();
          }
        }
      } else {
        this.dailyState = this.createFreshDailyState();
        await this.saveDailyState();
      }
    } catch (error) {
      console.error("[AmbientScheduler] Failed to load daily state:", error);
      this.dailyState = this.createFreshDailyState();
    }
    
    return isNewDay;
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
      lastScheduledAt: 0,
    };
  }

  private getTodayDateString(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  }

  private async scheduleNotifications(): Promise<void> {
    if (!this.isEnabled || !this.dailyState || this.isScheduling) {
      if (this.isScheduling && __DEV__) {
        console.log(`[AmbientScheduler] Already scheduling, skipping duplicate call`);
      }
      return;
    }

    this.isScheduling = true;

    try {
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
        if (!this.isEnabled) {
          if (__DEV__) {
            console.log("[AmbientScheduler] Notifications disabled mid-schedule, stopping");
          }
          break;
        }

        const envState = environmentEngine.getEnvironmentState();
        const message = messageSystem.getMessage(mood, envState.mode);
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
          
          if (!this.isEnabled) {
            if (__DEV__) {
              console.log("[AmbientScheduler] Notifications disabled during await, cancelling just-created notification");
            }
            await notificationService.cancelNotification(notificationId);
            break;
          }
          
          this.dailyState.scheduledIds.push(notificationId);
          this.dailyState.count++;
        } catch (error) {
          console.error("[AmbientScheduler] Failed to schedule notification:", error);
        }
      }

      this.dailyState.lastScheduledAt = Date.now();
      await this.saveDailyState();
    } finally {
      this.isScheduling = false;
      
      if (this.pendingReschedule) {
        this.pendingReschedule = false;
        if (__DEV__) {
          console.log("[AmbientScheduler] Applying pending reschedule");
        }
        await this.rescheduleNotifications();
      }
    }
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
    if (this.isScheduling) {
      if (__DEV__) {
        console.log("[AmbientScheduler] Scheduling in progress, queuing reschedule");
      }
      this.pendingReschedule = true;
      return;
    }

    await this.cancelAll();
    await this.scheduleNotifications();
  }

  async cancelAll(): Promise<void> {
    await notificationService.cancelAllAmbientNotifications();
    
    if (this.dailyState) {
      this.dailyState.scheduledIds = [];
      this.dailyState.count = 0;
      this.dailyState.lastScheduledAt = 0;
      await this.saveDailyState();
      
      if (__DEV__) {
        console.log("[AmbientScheduler] Cancelled all notifications and reset daily state");
      }
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
