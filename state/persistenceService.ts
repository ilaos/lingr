import AsyncStorage from "@react-native-async-storage/async-storage";

const STATE_VERSION = "1.0.0";

const STORAGE_KEYS = {
  ENTITY_STATE: "@lingr/entity_state",
  EVIDENCE: "@lingr/evidence",
  EPISODES: "@lingr/episodes",
  CONTROL_SETTINGS: "@lingr/control_settings",
  APP_METADATA: "@lingr/app_metadata",
  SUMMON_EXCHANGES: "@lingr/summon_exchanges",
  ENVIRONMENT_DATA: "@lingr/environment_data",
} as const;

interface VersionedState {
  version: string;
  data: unknown;
}

export interface EntityPersistedState {
  mood: "dormant" | "restless" | "active" | "agitated";
  intensity: number;
  lastActivityAt: number;
  personality: {
    volatility: number;
    aggression: number;
    patience: number;
    curiosity: number;
  };
  scanCount: number;
  detectionCount: number;
  interactionCount: number;
}

export interface EvidenceEntry {
  id: string;
  type: "capture" | "message" | "anomaly";
  description: string;
  timestamp: number;
  thumbnail?: string;
  metadata?: {
    intensity?: number;
    mood?: string;
    location?: string;
    [key: string]: any;
  };
}

export interface EpisodesPersistedState {
  unlockedEpisodeIds: string[];
  completedEpisodeIds: string[];
}

export interface ControlPersistedSettings {
  presenceActive: boolean;
  notificationsEnabled: boolean;
  cameraEnabled: boolean;
  cameraManifestationsEnabled: boolean;
  ambientNotificationsEnabled: boolean;
  notificationFrequency: "low" | "normal" | "high";
  quietHours: {
    start: string;
    end: string;
  };
  hapticsEnabled: boolean;
  locationEnabled: boolean;
}

export interface AppMetadata {
  lastOpenedAt: number;
  lastEvidenceCount: number;
  lastMood: string;
}

export interface EnvironmentData {
  homeBase: { latitude: number; longitude: number } | null;
  locationAwarenessEnabled: boolean;
  lastEnvironmentMode: "UNKNOWN" | "HOME" | "AWAY";
  lastEnvironmentUpdate: number;
}

class PersistenceService {
  private saveTimers: Map<string, NodeJS.Timeout> = new Map();
  private readonly DEBOUNCE_MS = 1000;

  private async saveWithVersion<T>(key: string, data: T): Promise<void> {
    const versionedState: VersionedState = {
      version: STATE_VERSION,
      data,
    };

    try {
      await AsyncStorage.setItem(key, JSON.stringify(versionedState));
    } catch (error) {
      console.error(`[PersistenceService] Failed to save ${key}:`, error);
    }
  }

  private async loadWithVersion<T>(key: string): Promise<T | null> {
    try {
      const stored = await AsyncStorage.getItem(key);
      if (!stored) return null;

      const parsed: VersionedState = JSON.parse(stored);

      if (parsed.version !== STATE_VERSION) {
        console.warn(
          `[PersistenceService] Version mismatch for ${key}: stored=${parsed.version}, current=${STATE_VERSION}`
        );
        return null;
      }

      return parsed.data as T;
    } catch (error) {
      console.error(`[PersistenceService] Failed to load ${key}:`, error);
      return null;
    }
  }

  async saveEntityState(state: EntityPersistedState): Promise<void> {
    await this.saveWithVersion(STORAGE_KEYS.ENTITY_STATE, state);
  }

  async loadEntityState(): Promise<EntityPersistedState | null> {
    return this.loadWithVersion<EntityPersistedState>(
      STORAGE_KEYS.ENTITY_STATE
    );
  }

  debouncedSaveEntityState(getState: () => EntityPersistedState): void {
    const key = STORAGE_KEYS.ENTITY_STATE;

    if (this.saveTimers.has(key)) {
      clearTimeout(this.saveTimers.get(key)!);
    }

    const timer = setTimeout(async () => {
      const state = getState();
      await this.saveEntityState(state);
      this.saveTimers.delete(key);
    }, this.DEBOUNCE_MS);

    this.saveTimers.set(key, timer);
  }

  async saveEvidence(evidence: EvidenceEntry[]): Promise<void> {
    const capped = evidence.slice(0, 100);
    await this.saveWithVersion(STORAGE_KEYS.EVIDENCE, capped);
  }

  async loadEvidence(): Promise<EvidenceEntry[]> {
    const evidence = await this.loadWithVersion<EvidenceEntry[]>(
      STORAGE_KEYS.EVIDENCE
    );
    return evidence || [];
  }

  async clearEvidence(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.EVIDENCE);
    } catch (error) {
      console.error("[PersistenceService] Failed to clear evidence:", error);
    }
  }

  async saveEpisodes(state: EpisodesPersistedState): Promise<void> {
    await this.saveWithVersion(STORAGE_KEYS.EPISODES, state);
  }

  async loadEpisodes(): Promise<EpisodesPersistedState | null> {
    return this.loadWithVersion<EpisodesPersistedState>(STORAGE_KEYS.EPISODES);
  }

  async saveControlSettings(settings: ControlPersistedSettings): Promise<void> {
    await this.saveWithVersion(STORAGE_KEYS.CONTROL_SETTINGS, settings);
  }

  async loadControlSettings(): Promise<ControlPersistedSettings | null> {
    return this.loadWithVersion<ControlPersistedSettings>(
      STORAGE_KEYS.CONTROL_SETTINGS
    );
  }

  async saveAppMetadata(metadata: AppMetadata): Promise<void> {
    await this.saveWithVersion(STORAGE_KEYS.APP_METADATA, metadata);
  }

  async loadAppMetadata(): Promise<AppMetadata | null> {
    return this.loadWithVersion<AppMetadata>(STORAGE_KEYS.APP_METADATA);
  }

  async saveSummonExchanges(exchanges: any[]): Promise<void> {
    await this.saveWithVersion(STORAGE_KEYS.SUMMON_EXCHANGES, exchanges);
  }

  async loadSummonExchanges(): Promise<any[] | null> {
    return this.loadWithVersion<any[]>(STORAGE_KEYS.SUMMON_EXCHANGES);
  }

  async saveEnvironmentData(data: EnvironmentData): Promise<void> {
    await this.saveWithVersion(STORAGE_KEYS.ENVIRONMENT_DATA, data);
  }

  async loadEnvironmentData(): Promise<EnvironmentData | null> {
    return this.loadWithVersion<EnvironmentData>(STORAGE_KEYS.ENVIRONMENT_DATA);
  }

  async clearAllState(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.ENTITY_STATE,
        STORAGE_KEYS.EVIDENCE,
        STORAGE_KEYS.EPISODES,
        STORAGE_KEYS.APP_METADATA,
        STORAGE_KEYS.SUMMON_EXCHANGES,
        STORAGE_KEYS.ENVIRONMENT_DATA,
      ]);
    } catch (error) {
      console.error("[PersistenceService] Failed to clear all state:", error);
    }
  }
}

export const persistenceService = new PersistenceService();
