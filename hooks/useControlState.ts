import { useState, useEffect } from "react";
import type { FrequencyLevel } from "@/data/ambientNotificationScheduler";
import { persistenceService } from "@/state/persistenceService";

interface QuietHours {
  start: string;
  end: string;
}

interface Controls {
  presenceActive: boolean;
  notifications: boolean;
  haptics: boolean;
  camera: boolean;
  cameraManifestations: boolean;
  locationEnabled: boolean;
  publicSpaceBehavior: boolean;
  ambientNotifications: boolean;
  notificationFrequency: FrequencyLevel;
  quietHours: QuietHours;
}

const DEFAULT_CONTROLS: Controls = {
  presenceActive: true,
  notifications: true,
  haptics: true,
  camera: true,
  cameraManifestations: true,
  locationEnabled: false,
  publicSpaceBehavior: true,
  ambientNotifications: false,
  notificationFrequency: "normal",
  quietHours: { start: "23:00", end: "07:00" },
};

export function useControlState() {
  const [controls, setControls] = useState<Controls>(DEFAULT_CONTROLS);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      const saved = await persistenceService.loadControlSettings();

      if (saved) {
        setControls({
          presenceActive: saved.presenceActive,
          notifications: saved.notificationsEnabled,
          haptics: saved.hapticsEnabled,
          camera: saved.cameraEnabled,
          cameraManifestations: saved.cameraManifestationsEnabled,
          locationEnabled: saved.locationEnabled,
          publicSpaceBehavior: true,
          ambientNotifications: saved.ambientNotificationsEnabled,
          notificationFrequency: saved.notificationFrequency,
          quietHours: saved.quietHours,
        });

        if (__DEV__) {
          console.log("[useControlState] Restored settings from storage");
        }
      }

      setIsLoaded(true);
    };

    loadSettings();
  }, []);

  useEffect(() => {
    if (!isLoaded) return;

    const saveSettings = async () => {
      await persistenceService.saveControlSettings({
        presenceActive: controls.presenceActive,
        notificationsEnabled: controls.notifications,
        cameraEnabled: controls.camera,
        cameraManifestationsEnabled: controls.cameraManifestations,
        ambientNotificationsEnabled: controls.ambientNotifications,
        notificationFrequency: controls.notificationFrequency,
        quietHours: controls.quietHours,
        hapticsEnabled: controls.haptics,
        locationEnabled: controls.locationEnabled,
      });
    };

    saveSettings();
  }, [controls, isLoaded]);

  const updateControl = (key: keyof Controls, value: boolean | FrequencyLevel | QuietHours) => {
    setControls((prev) => ({ ...prev, [key]: value }));
  };

  const pausePresence = () => {
    setControls((prev) => ({ ...prev, presenceActive: false }));
  };

  const clearEvidence = () => {
    const { evidenceStore } = require("@/data/evidence");
    evidenceStore.clearEvidence();
  };

  const removePresence = () => {
    setControls({
      presenceActive: false,
      notifications: false,
      haptics: false,
      camera: false,
      cameraManifestations: false,
      locationEnabled: false,
      publicSpaceBehavior: false,
      ambientNotifications: false,
      notificationFrequency: "normal",
      quietHours: { start: "23:00", end: "07:00" },
    });
  };

  return {
    controls,
    updateControl,
    pausePresence,
    clearEvidence,
    removePresence,
  };
}
