import { entityEngine } from "./entityEngine";
import { environmentEngine } from "./environmentEngine";

export interface ApparitionEvent {
  id: string;
  timestamp: number;
  intensity: number;
  duration: number;
}

const APPARITION_PROBABILITY = {
  dormant: 0.02,
  restless: 0.08,
  active: 0.15,
  agitated: 0.25,
};

const APPARITION_DURATION = {
  min: 100,
  max: 400,
};

const APPARITION_CHECK_INTERVAL = 3000;
const MIN_TIME_BETWEEN_APPARITIONS = 8000;

class ApparitionSystem {
  private history: ApparitionEvent[] = [];
  private lastApparitionTime: number = 0;
  private checkTimer: NodeJS.Timeout | null = null;
  private isActive: boolean = false;
  private forceNextApparition: boolean = false;

  private getEnvironmentProbabilityMultiplier(): number {
    const envState = environmentEngine.getEnvironmentState();
    
    switch (envState.mode) {
      case "HOME":
        return 1.0;
      case "AWAY":
        return 0.4;
      case "UNKNOWN":
        return 0.7;
      default:
        return 1.0;
    }
  }

  start(): void {
    if (this.isActive) return;
    this.isActive = true;
    this.scheduleCheck();
  }

  stop(): void {
    this.isActive = false;
    if (this.checkTimer) {
      clearTimeout(this.checkTimer);
      this.checkTimer = null;
    }
  }

  private scheduleCheck(): void {
    if (!this.isActive) return;
    if (this.checkTimer) clearTimeout(this.checkTimer);

    this.checkTimer = setTimeout(() => {
      this.checkForApparition();
      this.scheduleCheck();
    }, APPARITION_CHECK_INTERVAL);
  }

  private checkForApparition(): void {
    const now = Date.now();
    const timeSinceLastApparition = now - this.lastApparitionTime;

    if (timeSinceLastApparition < MIN_TIME_BETWEEN_APPARITIONS && !this.forceNextApparition) {
      return;
    }

    const mood = entityEngine.getMood();
    const baseProbability = APPARITION_PROBABILITY[mood];
    const envMultiplier = this.getEnvironmentProbabilityMultiplier();
    const probability = baseProbability * envMultiplier;
    const shouldTrigger = this.forceNextApparition || Math.random() < probability;

    if (shouldTrigger) {
      this.triggerApparition();
      this.forceNextApparition = false;
    }
  }

  private triggerApparition(): void {
    const now = Date.now();
    const duration =
      Math.random() * (APPARITION_DURATION.max - APPARITION_DURATION.min) +
      APPARITION_DURATION.min;

    const event: ApparitionEvent = {
      id: `apparition_${now}`,
      timestamp: now,
      intensity: entityEngine.getIntensity(),
      duration,
    };

    this.history.push(event);
    if (this.history.length > 50) {
      this.history.shift();
    }

    this.lastApparitionTime = now;
  }

  forceApparition(): void {
    this.forceNextApparition = true;
    this.checkForApparition();
  }

  getRecentApparitions(limit: number = 10): ApparitionEvent[] {
    return this.history.slice(-limit);
  }

  cleanup(): void {
    this.stop();
    this.history = [];
    this.lastApparitionTime = 0;
  }
}

export const apparitionSystem = new ApparitionSystem();
