import type { MoodType } from "@/components/EntityMood";
import type { EnvironmentMode } from "./environmentEngine";
import { persistenceService } from "@/state/persistenceService";

export type EpisodeTrigger =
  | "open_app"
  | "scan"
  | "evidence_added"
  | "summon_message"
  | "timer"
  | "notification_sent";

export type EpisodeAction =
  | "show_message"
  | "toast"
  | "notification"
  | "auto_add_evidence"
  | "intensity_spike"
  | "spawn_apparition";

export interface EpisodeStepCondition {
  mood?: MoodType[];
  intensityAbove?: number;
  environment?: EnvironmentMode[];
}

export interface EpisodeStep {
  id: string;
  trigger: EpisodeTrigger;
  condition?: EpisodeStepCondition;
  action: EpisodeAction;
  data: Record<string, any>;
  waitSeconds?: number;
}

export interface EpisodeState {
  episodeId: string;
  currentStepIndex: number;
  startedAt: number;
  completedAt?: number;
  stepCompletedAt?: number;
}

class EpisodeEngine {
  private activeEpisode: EpisodeState | null = null;
  private completedEpisodes: Set<string> = new Set();
  private isInitialized = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    const saved = await persistenceService.loadEpisodeProgress();

    if (saved) {
      this.activeEpisode = saved.activeEpisode;
      this.completedEpisodes = new Set(saved.completedEpisodeIds);

      if (__DEV__) {
        console.log(
          `[EpisodeEngine] Restored progress - Active: ${this.activeEpisode?.episodeId || "none"}, Completed: ${this.completedEpisodes.size}`
        );
      }
    }

    this.isInitialized = true;
  }

  public startEpisode(episodeId: string): boolean {
    if (this.activeEpisode) {
      if (__DEV__) {
        console.warn(
          `[EpisodeEngine] Cannot start ${episodeId} - ${this.activeEpisode.episodeId} is already active`
        );
      }
      return false;
    }

    this.activeEpisode = {
      episodeId,
      currentStepIndex: 0,
      startedAt: Date.now(),
    };

    this.saveState();

    if (__DEV__) {
      console.log(`[EpisodeEngine] Started episode: ${episodeId}`);
    }

    return true;
  }

  public advanceStep(): boolean {
    if (!this.activeEpisode) return false;

    this.activeEpisode.currentStepIndex += 1;
    this.activeEpisode.stepCompletedAt = Date.now();

    this.saveState();

    if (__DEV__) {
      console.log(
        `[EpisodeEngine] Advanced to step ${this.activeEpisode.currentStepIndex} in ${this.activeEpisode.episodeId}`
      );
    }

    return true;
  }

  public completeEpisode(): { episodeId: string; unlockNext: boolean } | null {
    if (!this.activeEpisode) return null;

    const episodeId = this.activeEpisode.episodeId;
    this.activeEpisode.completedAt = Date.now();
    this.completedEpisodes.add(episodeId);

    this.activeEpisode = null;

    this.saveState();

    if (__DEV__) {
      console.log(`[EpisodeEngine] Completed episode: ${episodeId}`);
    }

    return { episodeId, unlockNext: true };
  }

  public getActiveEpisode(): EpisodeState | null {
    return this.activeEpisode ? { ...this.activeEpisode } : null;
  }

  public getEpisodeState(episodeId: string): "not_started" | "active" | "completed" {
    if (this.completedEpisodes.has(episodeId)) return "completed";
    if (this.activeEpisode?.episodeId === episodeId) return "active";
    return "not_started";
  }

  public isEpisodeCompleted(episodeId: string): boolean {
    return this.completedEpisodes.has(episodeId);
  }

  public getCompletedEpisodes(): string[] {
    return Array.from(this.completedEpisodes);
  }

  public getCurrentStep(): number {
    return this.activeEpisode?.currentStepIndex ?? 0;
  }

  public canTriggerStep(
    trigger: EpisodeTrigger,
    condition?: EpisodeStepCondition,
    context?: {
      mood?: MoodType;
      intensity?: number;
      environment?: EnvironmentMode;
    }
  ): boolean {
    if (!condition || !context) return true;

    if (condition.mood && context.mood) {
      if (!condition.mood.includes(context.mood)) return false;
    }

    if (
      condition.intensityAbove !== undefined &&
      context.intensity !== undefined
    ) {
      if (context.intensity <= condition.intensityAbove) return false;
    }

    if (condition.environment && context.environment) {
      if (!condition.environment.includes(context.environment)) return false;
    }

    return true;
  }

  private async saveState(): Promise<void> {
    await persistenceService.saveEpisodeProgress({
      activeEpisode: this.activeEpisode,
      completedEpisodeIds: Array.from(this.completedEpisodes),
    });
  }
}

export const episodeEngine = new EpisodeEngine();
