import { MoodType } from "@/components/EntityMood";
import {
  persistenceService,
  type EntityPersistedState,
} from "@/state/persistenceService";

export interface EntityState {
  mood: MoodType;
  intensity: number;
  lastMoodChange: number;
  lastIntensityChange: number;
  cooldownUntil: number;
  personality: EntityPersonality;
  scanCount: number;
  detectionCount: number;
  interactionCount: number;
  lastActivityAt: number;
}

export interface EntityPersonality {
  volatility: number;
  aggression: number;
  patience: number;
  curiosity: number;
}

const DEFAULT_PERSONALITY: EntityPersonality = {
  volatility: 0.6,
  aggression: 0.5,
  patience: 0.4,
  curiosity: 0.7,
};

const MOOD_THRESHOLDS = {
  dormant: 0.3,
  restless: 0.5,
  active: 0.7,
  agitated: 1.0,
};

const MOOD_PROGRESSION_INTERVALS = {
  min: 45000,
  max: 180000,
};

const INTENSITY_FLUCTUATION_INTERVALS = {
  min: 5000,
  max: 15000,
};

const COOLDOWN_DURATION = {
  min: 120000,
  max: 300000,
};

class EntityEngine {
  private state: EntityState = {
    mood: "restless",
    intensity: 0.3,
    lastMoodChange: Date.now(),
    lastIntensityChange: Date.now(),
    cooldownUntil: 0,
    personality: DEFAULT_PERSONALITY,
    scanCount: 0,
    detectionCount: 0,
    interactionCount: 0,
    lastActivityAt: Date.now(),
  };

  private moodTimer: NodeJS.Timeout | null = null;
  private intensityTimer: NodeJS.Timeout | null = null;
  private isInitialized: boolean = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    const saved = await persistenceService.loadEntityState();

    if (saved) {
      const now = Date.now();
      const timeSinceLastActivity = now - saved.lastActivityAt;
      const fortyEightHours = 48 * 60 * 60 * 1000;

      if (timeSinceLastActivity > fortyEightHours) {
        const decayFactor = Math.min(
          1,
          (timeSinceLastActivity - fortyEightHours) / fortyEightHours
        );
        saved.intensity = Math.max(
          0.15,
          saved.intensity * (1 - decayFactor * 0.4)
        );

        if (__DEV__) {
          console.log(
            `[EntityEngine] State aged ${Math.floor(timeSinceLastActivity / (1000 * 60 * 60))}hrs, intensity decayed to ${saved.intensity.toFixed(2)}`
          );
        }
      }

      this.state = {
        mood: saved.mood,
        intensity: saved.intensity,
        lastMoodChange: now,
        lastIntensityChange: now,
        cooldownUntil: 0,
        personality: saved.personality,
        scanCount: saved.scanCount,
        detectionCount: saved.detectionCount,
        interactionCount: saved.interactionCount,
        lastActivityAt: now,
      };

      if (__DEV__) {
        console.log(
          `[EntityEngine] Restored state: mood=${saved.mood}, intensity=${saved.intensity.toFixed(2)}, scans=${saved.scanCount}`
        );
      }
    }

    this.isInitialized = true;
    this.scheduleMoodChange();
    this.scheduleIntensityFluctuation();
  }

  private getMoodFromIntensity(intensity: number): MoodType {
    if (intensity < MOOD_THRESHOLDS.dormant) return "dormant";
    if (intensity < MOOD_THRESHOLDS.restless) return "restless";
    if (intensity < MOOD_THRESHOLDS.active) return "active";
    return "agitated";
  }

  private scheduleMoodChange(): void {
    if (this.moodTimer) clearTimeout(this.moodTimer);

    const delay =
      Math.random() *
        (MOOD_PROGRESSION_INTERVALS.max - MOOD_PROGRESSION_INTERVALS.min) +
      MOOD_PROGRESSION_INTERVALS.min;

    this.moodTimer = setTimeout(() => {
      this.updateMood();
      this.scheduleMoodChange();
    }, delay);
  }

  private scheduleIntensityFluctuation(): void {
    if (this.intensityTimer) clearTimeout(this.intensityTimer);

    const delay =
      Math.random() *
        (INTENSITY_FLUCTUATION_INTERVALS.max -
          INTENSITY_FLUCTUATION_INTERVALS.min) +
      INTENSITY_FLUCTUATION_INTERVALS.min;

    this.intensityTimer = setTimeout(() => {
      this.fluctuateIntensity();
      this.scheduleIntensityFluctuation();
    }, delay);
  }

  private updateMood(): void {
    const now = Date.now();

    if (now < this.state.cooldownUntil) {
      this.state.intensity = Math.max(0.1, this.state.intensity * 0.95);
      this.state.mood = this.getMoodFromIntensity(this.state.intensity);
      this.saveState();
      return;
    }

    const { volatility, aggression } = this.state.personality;
    const intensityDelta = (Math.random() - 0.3) * volatility * 0.15;

    this.state.intensity = Math.max(
      0.1,
      Math.min(0.95, this.state.intensity + intensityDelta)
    );

    if (Math.random() < aggression * 0.1) {
      this.state.intensity = Math.min(0.9, this.state.intensity + 0.1);
    }

    this.state.mood = this.getMoodFromIntensity(this.state.intensity);
    this.state.lastMoodChange = now;
    this.state.lastActivityAt = now;

    if (this.state.intensity > 0.85 && Math.random() < 0.2) {
      this.enterCooldown();
    }

    this.saveState();
  }

  private fluctuateIntensity(): void {
    const now = Date.now();

    if (now < this.state.cooldownUntil) {
      this.state.intensity = Math.max(0.1, this.state.intensity * 0.98);
      this.saveState();
      return;
    }

    const { volatility, curiosity } = this.state.personality;
    const delta = (Math.random() - 0.5) * volatility * 0.08;

    this.state.intensity = Math.max(
      0.1,
      Math.min(0.95, this.state.intensity + delta)
    );

    if (Math.random() < curiosity * 0.05) {
      this.state.intensity = Math.min(0.7, this.state.intensity + 0.05);
    }

    this.state.lastIntensityChange = now;
    this.state.lastActivityAt = now;
    this.state.mood = this.getMoodFromIntensity(this.state.intensity);

    this.saveState();
  }

  private enterCooldown(): void {
    const duration =
      Math.random() * (COOLDOWN_DURATION.max - COOLDOWN_DURATION.min) +
      COOLDOWN_DURATION.min;

    this.state.cooldownUntil = Date.now() + duration;
    this.state.intensity = Math.max(0.2, this.state.intensity * 0.6);
  }

  public getState(): EntityState {
    return { ...this.state };
  }

  public getMood(): MoodType {
    return this.state.mood;
  }

  public getIntensity(): number {
    return this.state.intensity;
  }

  public isInCooldown(): boolean {
    return Date.now() < this.state.cooldownUntil;
  }

  public stimulate(amount: number): void {
    if (this.isInCooldown()) return;

    this.state.intensity = Math.min(0.95, this.state.intensity + amount);
    this.state.mood = this.getMoodFromIntensity(this.state.intensity);
    this.state.interactionCount++;
    this.state.lastActivityAt = Date.now();

    this.saveState();
  }

  public recordScan(): void {
    this.state.scanCount++;
    this.state.lastActivityAt = Date.now();
    this.saveState();
  }

  public recordDetection(): void {
    this.state.detectionCount++;
    this.state.lastActivityAt = Date.now();
    this.saveState();
  }

  public getScanCount(): number {
    return this.state.scanCount;
  }

  public getDetectionCount(): number {
    return this.state.detectionCount;
  }

  public getInteractionCount(): number {
    return this.state.interactionCount;
  }

  private saveState(): void {
    persistenceService.debouncedSaveEntityState(() => ({
      mood: this.state.mood,
      intensity: this.state.intensity,
      lastActivityAt: this.state.lastActivityAt,
      personality: this.state.personality,
      scanCount: this.state.scanCount,
      detectionCount: this.state.detectionCount,
      interactionCount: this.state.interactionCount,
    }));
  }

  public setPersonality(personality: Partial<EntityPersonality>): void {
    this.state.personality = {
      ...this.state.personality,
      ...personality,
    };
  }

  public cleanup(): void {
    if (this.moodTimer) clearTimeout(this.moodTimer);
    if (this.intensityTimer) clearTimeout(this.intensityTimer);
  }
}

export const entityEngine = new EntityEngine();
