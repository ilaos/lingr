import { locationService, type Coordinates } from "@/services/locationService";
import { persistenceService } from "@/state/persistenceService";

export type EnvironmentMode = "UNKNOWN" | "HOME" | "AWAY";

export type EnvironmentState = {
  mode: EnvironmentMode;
  lastUpdated: number;
  distanceFromHome?: number;
};

const HOME_RADIUS_METERS = 100;
const UPDATE_INTERVAL_MS = 45000;

class EnvironmentEngine {
  private environmentState: EnvironmentState = {
    mode: "UNKNOWN",
    lastUpdated: Date.now(),
  };

  private homeBase: Coordinates | null = null;
  private isLocationAwarenessEnabled = false;
  private updateInterval: NodeJS.Timeout | null = null;
  private isInitialized = false;

  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    const envData = await persistenceService.loadEnvironmentData();

    if (envData) {
      this.homeBase = envData.homeBase || null;
      this.isLocationAwarenessEnabled = envData.locationAwarenessEnabled || false;
      this.environmentState = {
        mode: envData.lastEnvironmentMode || "UNKNOWN",
        lastUpdated: envData.lastEnvironmentUpdate || Date.now(),
      };

      if (__DEV__) {
        console.log("[EnvironmentEngine] Initialized:", {
          hasHomeBase: !!this.homeBase,
          locationEnabled: this.isLocationAwarenessEnabled,
          mode: this.environmentState.mode,
        });
      }
    }

    this.isInitialized = true;

    if (this.isLocationAwarenessEnabled && this.homeBase) {
      this.startTracking();
    }
  }

  public async setLocationAwarenessEnabled(enabled: boolean): Promise<void> {
    this.isLocationAwarenessEnabled = enabled;

    await persistenceService.saveEnvironmentData({
      homeBase: this.homeBase,
      locationAwarenessEnabled: enabled,
      lastEnvironmentMode: this.environmentState.mode,
      lastEnvironmentUpdate: this.environmentState.lastUpdated,
    });

    if (enabled && this.homeBase) {
      this.startTracking();
      await this.updateEnvironment();
    } else {
      this.stopTracking();
      this.setEnvironmentMode("UNKNOWN");
    }
  }

  public isLocationAwarenessOn(): boolean {
    return this.isLocationAwarenessEnabled;
  }

  public async setHomeBase(coordinates: Coordinates): Promise<void> {
    this.homeBase = coordinates;

    await persistenceService.saveEnvironmentData({
      homeBase: coordinates,
      locationAwarenessEnabled: this.isLocationAwarenessEnabled,
      lastEnvironmentMode: this.environmentState.mode,
      lastEnvironmentUpdate: this.environmentState.lastUpdated,
    });

    if (this.isLocationAwarenessEnabled) {
      await this.updateEnvironment();
      this.startTracking();
    }

    if (__DEV__) {
      console.log("[EnvironmentEngine] Home base set:", coordinates);
    }
  }

  public getHomeBase(): Coordinates | null {
    return this.homeBase;
  }

  public getEnvironmentState(): EnvironmentState {
    return { ...this.environmentState };
  }

  private async updateEnvironment(): Promise<void> {
    if (!this.isLocationAwarenessEnabled || !this.homeBase) {
      return;
    }

    const currentLocation = await locationService.getCurrentLocation();

    if (!currentLocation) {
      return;
    }

    const distance = locationService.calculateDistance(
      this.homeBase,
      currentLocation
    );

    const newMode: EnvironmentMode =
      distance <= HOME_RADIUS_METERS ? "HOME" : "AWAY";

    if (newMode !== this.environmentState.mode) {
      if (__DEV__) {
        console.log(
          `[EnvironmentEngine] Environment changed: ${this.environmentState.mode} → ${newMode} (${Math.round(distance)}m)`
        );
      }
    }

    this.setEnvironmentMode(newMode, distance);
  }

  private setEnvironmentMode(mode: EnvironmentMode, distance?: number): void {
    this.environmentState = {
      mode,
      lastUpdated: Date.now(),
      distanceFromHome: distance,
    };

    persistenceService.saveEnvironmentData({
      homeBase: this.homeBase,
      locationAwarenessEnabled: this.isLocationAwarenessEnabled,
      lastEnvironmentMode: mode,
      lastEnvironmentUpdate: this.environmentState.lastUpdated,
    });
  }

  private startTracking(): void {
    if (this.updateInterval) {
      return;
    }

    this.updateInterval = setInterval(() => {
      this.updateEnvironment();
    }, UPDATE_INTERVAL_MS);

    if (__DEV__) {
      console.log("[EnvironmentEngine] Started tracking environment");
    }
  }

  private stopTracking(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;

      if (__DEV__) {
        console.log("[EnvironmentEngine] Stopped tracking environment");
      }
    }
  }

  public async forceUpdate(): Promise<void> {
    await this.updateEnvironment();
  }
}

export const environmentEngine = new EnvironmentEngine();
