import { useState } from "react";

interface Controls {
  presenceActive: boolean;
  notifications: boolean;
  haptics: boolean;
  camera: boolean;
  cameraManifestations: boolean;
  location: boolean;
  publicSpaceBehavior: boolean;
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
  });

  const updateControl = (key: keyof Controls, value: boolean) => {
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
