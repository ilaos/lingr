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
  },
];

class EpisodeManager {
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
    }
  }

  public completeEpisode(episodeId: string): void {
    const episode = EPISODES.find((ep) => ep.id === episodeId);
    if (episode && episode.status === "available") {
      episode.status = "completed";
    }
  }
}

export const episodeManager = new EpisodeManager();
