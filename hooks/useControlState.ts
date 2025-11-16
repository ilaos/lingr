import { useState } from "react";
import type { FrequencyLevel } from "@/data/ambientNotificationScheduler";

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
  location: boolean;
  publicSpaceBehavior: boolean;
  ambientNotifications: boolean;
  notificationFrequency: FrequencyLevel;
  quietHours: QuietHours;
}

export function useControlState() {
  const [controls, setControls] = useState<Controls>({
    presenceActive: true,
    notifications: true,
    haptics: true,
    camera: true,
    cameraManifestations: true,
    location: false,
    publicSpaceBehavior: true,
    ambientNotifications: false,
    notificationFrequency: "normal",
    quietHours: { start: "23:00", end: "07:00" },
  });

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
      location: false,
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
