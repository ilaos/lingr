import { useState, useEffect } from "react";
import * as Haptics from "expo-haptics";

export function useDetectorState() {
  const [isScanning, setIsScanning] = useState(false);
  const [isPresenceDetected, setIsPresenceDetected] = useState(false);

  useEffect(() => {
    if (!isScanning) {
      setIsPresenceDetected(false);
      return;
    }

    const detectionInterval = setInterval(() => {
      const shouldDetect = Math.random() > 0.7;
      setIsPresenceDetected(shouldDetect);
      
      if (shouldDetect) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    }, 3000);

    return () => clearInterval(detectionInterval);
  }, [isScanning]);

  const startScan = () => {
    setIsScanning(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const stopScan = () => {
    setIsScanning(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const capture = () => {
    if (isPresenceDetected) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  return {
    isScanning,
    isPresenceDetected,
    startScan,
    stopScan,
    capture,
  };
}
