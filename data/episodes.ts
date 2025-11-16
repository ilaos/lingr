import type { EpisodeStep } from "./episodeEngine";

export interface Episode {
  id: string;
  number: number;
  title: string;
  description: string;
  teaser?: string;
  status: "locked" | "available" | "completed";
  rarity: "common" | "rare" | "legendary";
  unlockConditions?: {
    minIntensity?: number;
    minEvidence?: number;
    previousEpisode?: string;
  };
  steps: EpisodeStep[];
}

export const EPISODES: Episode[] = [
  {
    id: "ep_001",
    number: 1,
    title: "First Contact",
    description: "Something has attached itself to your device...",
    teaser: "The presence makes itself known for the first time.",
    status: "available",
    rarity: "common",
    steps: [
      {
        id: "ep_001_step_001",
        trigger: "open_app",
        action: "toast",
        data: { message: "Something stirs..." },
      },
      {
        id: "ep_001_step_002",
        trigger: "scan",
        condition: { intensityAbove: 0.15 },
        action: "spawn_apparition",
        data: { duration: 200 },
      },
      {
        id: "ep_001_step_003",
        trigger: "evidence_added",
        action: "intensity_spike",
        data: { amount: 0.15, duration: 10000 },
      },
      {
        id: "ep_001_step_004",
        trigger: "timer",
        waitSeconds: 30,
        action: "auto_add_evidence",
        data: {
          type: "anomaly",
          description: "Interference pattern detected. Source unknown.",
        },
      },
      {
        id: "ep_001_step_005",
        trigger: "summon_message",
        action: "show_message",
        data: {
          message: "You opened the channel. Now it knows you're listening.",
        },
      },
    ],
  },
  {
    id: "ep_002",
    number: 2,
    title: "The Watcher",
    description: "It knows when you're watching back.",
    teaser:
      "Evidence suggests the entity is not merely passive. It observes. It learns.",
    status: "locked",
    rarity: "common",
    unlockConditions: {
      minEvidence: 3,
      previousEpisode: "ep_001",
    },
    steps: [
      {
        id: "ep_002_step_001",
        trigger: "scan",
        action: "toast",
        data: { message: "Something is watching through the lens..." },
      },
      {
        id: "ep_002_step_002",
        trigger: "scan",
        condition: { mood: ["restless", "active", "agitated"] },
        action: "spawn_apparition",
        data: { duration: 300 },
      },
      {
        id: "ep_002_step_003",
        trigger: "evidence_added",
        action: "notification",
        data: {
          title: "Pattern recognized",
          body: "The entity is cataloging your behavior.",
        },
        waitSeconds: 5,
      },
      {
        id: "ep_002_step_004",
        trigger: "timer",
        waitSeconds: 60,
        action: "auto_add_evidence",
        data: {
          type: "anomaly",
          description: "Camera activated without user input. Duration: 0.3s",
        },
      },
      {
        id: "ep_002_step_005",
        trigger: "summon_message",
        action: "intensity_spike",
        data: { amount: 0.2, duration: 15000 },
      },
      {
        id: "ep_002_step_006",
        trigger: "notification_sent",
        action: "show_message",
        data: {
          message:
            "It has learned your patterns. The observation phase is complete.",
        },
      },
    ],
  },
  {
    id: "ep_003",
    number: 3,
    title: "Echoes",
    description: "Fragments of something that was never alive.",
    teaser: "Audio anomalies reveal a pattern. A message? A warning?",
    status: "locked",
    rarity: "common",
    unlockConditions: {
      minEvidence: 7,
      previousEpisode: "ep_002",
    },
    steps: [
      {
        id: "ep_003_step_001",
        trigger: "open_app",
        condition: { intensityAbove: 0.3 },
        action: "toast",
        data: { message: "Static interference detected..." },
      },
      {
        id: "ep_003_step_002",
        trigger: "timer",
        waitSeconds: 15,
        action: "auto_add_evidence",
        data: {
          type: "anomaly",
          description: "Audio signature recorded. Pattern repeating.",
        },
      },
      {
        id: "ep_003_step_003",
        trigger: "scan",
        condition: { mood: ["active", "agitated"] },
        action: "spawn_apparition",
        data: { duration: 150 },
      },
      {
        id: "ep_003_step_004",
        trigger: "evidence_added",
        action: "notification",
        data: {
          title: "Echo sequence",
          body: "Three pulses. Repeated at 23-second intervals.",
        },
        waitSeconds: 23,
      },
      {
        id: "ep_003_step_005",
        trigger: "summon_message",
        condition: { environment: ["HOME", "UNKNOWN"] },
        action: "intensity_spike",
        data: { amount: 0.25, duration: 20000 },
      },
      {
        id: "ep_003_step_006",
        trigger: "notification_sent",
        action: "auto_add_evidence",
        data: {
          type: "message",
          description: "Decoded fragment: '...still here...'",
        },
      },
      {
        id: "ep_003_step_007",
        trigger: "timer",
        waitSeconds: 45,
        action: "show_message",
        data: {
          message:
            "The echoes are not random. They are attempts at communication.",
        },
      },
    ],
  },
  {
    id: "ep_004",
    number: 4,
    title: "Threshold",
    description: "The boundary between device and reality dissolves.",
    teaser: "AR captures show distortions that shouldn't be possible.",
    status: "locked",
    rarity: "rare",
    unlockConditions: {
      minIntensity: 0.6,
      minEvidence: 12,
      previousEpisode: "ep_003",
    },
    steps: [
      {
        id: "ep_004_step_001",
        trigger: "scan",
        condition: { intensityAbove: 0.5, mood: ["active", "agitated"] },
        action: "spawn_apparition",
        data: { duration: 400 },
      },
      {
        id: "ep_004_step_002",
        trigger: "evidence_added",
        action: "toast",
        data: { message: "Reality distortion detected" },
      },
      {
        id: "ep_004_step_003",
        trigger: "timer",
        waitSeconds: 90,
        action: "show_message",
        data: {
          message: "The threshold is crossed. There is no separation now.",
        },
      },
    ],
  },
  {
    id: "ep_005",
    number: 5,
    title: "Recognition",
    description: "It calls you by name. You never told it.",
    teaser: "Personal data corruption. Messages referencing your location, habits, fears.",
    status: "locked",
    rarity: "rare",
    unlockConditions: {
      minIntensity: 0.75,
      minEvidence: 18,
      previousEpisode: "ep_004",
    },
    steps: [
      {
        id: "ep_005_step_001",
        trigger: "summon_message",
        action: "intensity_spike",
        data: { amount: 0.3, duration: 25000 },
      },
      {
        id: "ep_005_step_002",
        trigger: "notification_sent",
        action: "toast",
        data: { message: "It knows more than it should..." },
      },
      {
        id: "ep_005_step_003",
        trigger: "timer",
        waitSeconds: 120,
        action: "show_message",
        data: {
          message: "Recognition complete. You are catalogued. You are known.",
        },
      },
    ],
  },
  {
    id: "ep_006",
    number: 6,
    title: "Possession",
    description: "Your device acts without input. Keys press themselves.",
    teaser: "Total loss of control. The presence no longer asks permission.",
    status: "locked",
    rarity: "legendary",
    unlockConditions: {
      minIntensity: 0.85,
      minEvidence: 25,
      previousEpisode: "ep_005",
    },
    steps: [
      {
        id: "ep_006_step_001",
        trigger: "open_app",
        condition: { intensityAbove: 0.8 },
        action: "spawn_apparition",
        data: { duration: 500 },
      },
      {
        id: "ep_006_step_002",
        trigger: "timer",
        waitSeconds: 150,
        action: "show_message",
        data: {
          message:
            "Control is an illusion. The device was never yours to command.",
        },
      },
    ],
  },
  {
    id: "ep_007",
    number: 7,
    title: "Emergence",
    description: "It wants to leave the screen.",
    teaser: "Environmental manifestations. Objects move. Lights flicker. Reality bends.",
    status: "locked",
    rarity: "legendary",
    unlockConditions: {
      minIntensity: 0.9,
      minEvidence: 35,
      previousEpisode: "ep_006",
    },
    steps: [
      {
        id: "ep_007_step_001",
        trigger: "scan",
        condition: { intensityAbove: 0.85, environment: ["HOME"] },
        action: "spawn_apparition",
        data: { duration: 600 },
      },
      {
        id: "ep_007_step_002",
        trigger: "timer",
        waitSeconds: 180,
        action: "show_message",
        data: {
          message:
            "The screen is no longer a barrier. It is a doorway. And it is open.",
        },
      },
    ],
  },
  {
    id: "ep_008",
    number: 8,
    title: "???",
    description: "...",
    status: "locked",
    rarity: "legendary",
    unlockConditions: {
      minIntensity: 0.95,
      minEvidence: 50,
      previousEpisode: "ep_007",
    },
    steps: [
      {
        id: "ep_008_step_001",
        trigger: "open_app",
        condition: { intensityAbove: 0.9 },
        action: "toast",
        data: { message: "..." },
      },
      {
        id: "ep_008_step_002",
        trigger: "timer",
        waitSeconds: 240,
        action: "show_message",
        data: { message: "The final boundary dissolves..." },
      },
    ],
  },
];

import {
  persistenceService,
  type EpisodesPersistedState,
} from "@/state/persistenceService";

class EpisodeManager {
  private isInitialized = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    const saved = await persistenceService.loadEpisodes();

    if (saved) {
      for (const episodeId of saved.unlockedEpisodeIds) {
        const episode = EPISODES.find((ep) => ep.id === episodeId);
        if (episode && episode.status === "locked") {
          episode.status = "available";
        }
      }

      for (const episodeId of saved.completedEpisodeIds) {
        const episode = EPISODES.find((ep) => ep.id === episodeId);
        if (episode && episode.status !== "completed") {
          episode.status = "completed";
        }
      }

      if (__DEV__) {
        console.log(
          `[EpisodeManager] Restored ${saved.unlockedEpisodeIds.length} unlocked, ${saved.completedEpisodeIds.length} completed episodes`
        );
      }
    }

    this.isInitialized = true;
  }

  public getEpisodes(): Episode[] {
    return [...EPISODES];
  }

  public getEpisodeById(id: string): Episode | undefined {
    return EPISODES.find((ep) => ep.id === id);
  }

  public getAvailableEpisodes(): Episode[] {
    return EPISODES.filter((ep) => ep.status === "available");
  }

  public getLockedEpisodes(): Episode[] {
    return EPISODES.filter((ep) => ep.status === "locked");
  }

  public canUnlockEpisode(
    episodeId: string,
    currentIntensity: number,
    evidenceCount: number,
    completedEpisodes: string[]
  ): boolean {
    const episode = this.getEpisodeById(episodeId);
    if (!episode || episode.status !== "locked") return false;

    const conditions = episode.unlockConditions;
    if (!conditions) return true;

    if (
      conditions.minIntensity !== undefined &&
      currentIntensity < conditions.minIntensity
    ) {
      return false;
    }

    if (
      conditions.minEvidence !== undefined &&
      evidenceCount < conditions.minEvidence
    ) {
      return false;
    }

    if (
      conditions.previousEpisode &&
      !completedEpisodes.includes(conditions.previousEpisode)
    ) {
      return false;
    }

    return true;
  }

  public unlockEpisode(episodeId: string): void {
    const episode = EPISODES.find((ep) => ep.id === episodeId);
    if (episode && episode.status === "locked") {
      episode.status = "available";
      this.saveState();
    }
  }

  public completeEpisode(episodeId: string): void {
    const episode = EPISODES.find((ep) => ep.id === episodeId);
    if (episode && episode.status === "available") {
      episode.status = "completed";
      this.saveState();
    }
  }

  private async saveState(): Promise<void> {
    const unlockedEpisodeIds: string[] = [];
    const completedEpisodeIds: string[] = [];

    for (const episode of EPISODES) {
      if (episode.status === "available" || episode.status === "completed") {
        unlockedEpisodeIds.push(episode.id);
      }
      if (episode.status === "completed") {
        completedEpisodeIds.push(episode.id);
      }
    }

    const state: EpisodesPersistedState = {
      unlockedEpisodeIds,
      completedEpisodeIds,
    };

    await persistenceService.saveEpisodes(state);
  }
}

export const episodeManager = new EpisodeManager();
