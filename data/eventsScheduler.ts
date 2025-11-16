import { entityEngine } from "./entityEngine";
import { evidenceStore, generateEvidenceDescription } from "./evidence";
import { messageSystem } from "./messages";
import { environmentEngine } from "./environmentEngine";

interface PresenceEvent {
  type: "intensity_change" | "mood_shift" | "evidence_generation" | "message_refresh";
  timestamp: number;
  data?: any;
}

class EventsScheduler {
  private eventTimer: NodeJS.Timeout | null = null;
  private isRunning = false;
  private eventHistory: PresenceEvent[] = [];
  private callbacks: Map<string, (event: PresenceEvent) => void> = new Map();

  private readonly EVENT_INTERVALS = {
    min: 20000,
    max: 60000,
  };

  public start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.scheduleNextEvent();
  }

  public stop(): void {
    this.isRunning = false;
    if (this.eventTimer) {
      clearTimeout(this.eventTimer);
      this.eventTimer = null;
    }
  }

  private scheduleNextEvent(): void {
    if (!this.isRunning) return;

    const delay =
      Math.random() * (this.EVENT_INTERVALS.max - this.EVENT_INTERVALS.min) +
      this.EVENT_INTERVALS.min;

    this.eventTimer = setTimeout(() => {
      this.generateEvent();
      this.scheduleNextEvent();
    }, delay);
  }

  private generateEvent(): void {
    const eventType = this.selectEventType();
    const event: PresenceEvent = {
      type: eventType,
      timestamp: Date.now(),
    };

    switch (eventType) {
      case "intensity_change":
        this.handleIntensityChange(event);
        break;
      case "mood_shift":
        this.handleMoodShift(event);
        break;
      case "evidence_generation":
        this.handleEvidenceGeneration(event);
        break;
      case "message_refresh":
        this.handleMessageRefresh(event);
        break;
    }

    this.eventHistory.unshift(event);
    if (this.eventHistory.length > 50) {
      this.eventHistory = this.eventHistory.slice(0, 50);
    }

    this.notifyCallbacks(event);
  }

  private selectEventType(): PresenceEvent["type"] {
    const intensity = entityEngine.getIntensity();
    const roll = Math.random();

    if (intensity > 0.7) {
      if (roll < 0.4) return "evidence_generation";
      if (roll < 0.6) return "intensity_change";
      if (roll < 0.8) return "mood_shift";
      return "message_refresh";
    }

    if (intensity > 0.4) {
      if (roll < 0.3) return "evidence_generation";
      if (roll < 0.5) return "intensity_change";
      if (roll < 0.7) return "message_refresh";
      return "mood_shift";
    }

    if (roll < 0.15) return "evidence_generation";
    if (roll < 0.45) return "intensity_change";
    if (roll < 0.75) return "message_refresh";
    return "mood_shift";
  }

  private handleIntensityChange(event: PresenceEvent): void {
    const currentIntensity = entityEngine.getIntensity();
    const delta = (Math.random() - 0.5) * 0.15;

    entityEngine.stimulate(delta);

    event.data = {
      previousIntensity: currentIntensity,
      newIntensity: entityEngine.getIntensity(),
      delta,
    };
  }

  private handleMoodShift(event: PresenceEvent): void {
    const currentMood = entityEngine.getMood();
    const stimulation = Math.random() * 0.1 - 0.05;

    entityEngine.stimulate(stimulation);

    event.data = {
      previousMood: currentMood,
      newMood: entityEngine.getMood(),
      stimulation,
    };
  }

  private handleEvidenceGeneration(event: PresenceEvent): void {
    const intensity = entityEngine.getIntensity();
    const mood = entityEngine.getMood();

    if (Math.random() > intensity * 0.8) return;

    let evidenceType: "capture" | "message" | "anomaly";
    const roll = Math.random();

    if (intensity > 0.7) {
      evidenceType = roll < 0.4 ? "capture" : roll < 0.7 ? "anomaly" : "message";
    } else if (intensity > 0.4) {
      evidenceType = roll < 0.3 ? "capture" : roll < 0.6 ? "message" : "anomaly";
    } else {
      evidenceType = roll < 0.2 ? "capture" : roll < 0.5 ? "anomaly" : "message";
    }

    const description = generateEvidenceDescription(evidenceType);
    const envState = environmentEngine.getEnvironmentState();
    const entry = evidenceStore.addEvidence(evidenceType, description, {
      intensity,
      mood,
      environment: envState.mode,
    });

    event.data = {
      evidenceId: entry.id,
      evidenceType,
      description,
    };
  }

  private handleMessageRefresh(event: PresenceEvent): void {
    const mood = entityEngine.getMood();
    const message = messageSystem.getMessage(mood);

    event.data = {
      mood,
      message,
    };
  }

  public on(eventId: string, callback: (event: PresenceEvent) => void): void {
    this.callbacks.set(eventId, callback);
  }

  public off(eventId: string): void {
    this.callbacks.delete(eventId);
  }

  private notifyCallbacks(event: PresenceEvent): void {
    this.callbacks.forEach((callback) => {
      try {
        callback(event);
      } catch (error) {
        console.error("Event callback error:", error);
      }
    });
  }

  public getEventHistory(): PresenceEvent[] {
    return [...this.eventHistory];
  }

  public getRecentEvents(limit: number = 10): PresenceEvent[] {
    return this.eventHistory.slice(0, limit);
  }

  public cleanup(): void {
    this.stop();
    this.callbacks.clear();
    this.eventHistory = [];
  }
}

export const eventsScheduler = new EventsScheduler();
