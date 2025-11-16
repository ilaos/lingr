import { useState, useEffect, useCallback } from "react";
import * as Haptics from "expo-haptics";
import { evidenceStore, generateEvidenceDescription } from "@/data/evidence";
import { entityEngine } from "@/data/entityEngine";
import { apparitionSystem } from "@/data/apparitions";

export function useDetectorState(cameraEnabled: boolean, manifestationsEnabled: boolean) {
  const [isScanning, setIsScanning] = useState(false);
  const [isPresenceDetected, setIsPresenceDetected] = useState(false);
  const [apparitionVisible, setApparitionVisible] = useState(false);
  const [apparitionDuration, setApparitionDuration] = useState(200);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [lastProcessedApparitionId, setLastProcessedApparitionId] = useState<string | null>(null);

  useEffect(() => {
    if (!isScanning || !cameraEnabled) {
      setIsPresenceDetected(false);
      apparitionSystem.stop();
      return;
    }

    if (manifestationsEnabled) {
      apparitionSystem.start();
    } else {
      apparitionSystem.stop();
    }

    const detectionInterval = setInterval(() => {
      const intensity = entityEngine.getIntensity();
      const shouldDetect = Math.random() < intensity * 0.4;
      setIsPresenceDetected(shouldDetect);

      if (shouldDetect) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    }, 3000);

    const scanInterval = setInterval(() => {
      if (Math.random() < 0.05) {
        entityEngine.stimulate(0.02);
      }

      if (Math.random() < 0.01) {
        const mood = entityEngine.getMood();
        const moodShiftMap: Record<string, string> = {
          dormant: "restless",
          restless: "active",
          active: "agitated",
          agitated: "agitated",
        };
        const intensityMap: Record<string, number> = {
          restless: 0.4,
          active: 0.6,
          agitated: 0.85,
        };
        
        const targetMood = moodShiftMap[mood];
        const targetIntensity = intensityMap[targetMood];
        
        if (targetIntensity !== undefined) {
          entityEngine.stimulate(targetIntensity - entityEngine.getIntensity());
        }
      }
    }, 5000);

    return () => {
      clearInterval(detectionInterval);
      clearInterval(scanInterval);
      apparitionSystem.stop();
    };
  }, [isScanning, cameraEnabled, manifestationsEnabled]);

  useEffect(() => {
    if (!cameraEnabled || !manifestationsEnabled) return;

    const checkApparitions = setInterval(() => {
      const recentApparitions = apparitionSystem.getRecentApparitions(1);
      if (recentApparitions.length > 0) {
        const lastApparition = recentApparitions[0];
        
        if (lastApparition.id !== lastProcessedApparitionId && !apparitionVisible) {
          setLastProcessedApparitionId(lastApparition.id);
          triggerApparition(lastApparition.duration);
          
          if (Math.random() < 0.6) {
            handleApparitionCapture();
          }
        }
      }
    }, 500);

    return () => clearInterval(checkApparitions);
  }, [cameraEnabled, manifestationsEnabled, apparitionVisible, lastProcessedApparitionId]);

  const triggerApparition = (duration: number) => {
    setApparitionDuration(duration);
    setApparitionVisible(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  };

  const handleApparitionComplete = () => {
    setApparitionVisible(false);
  };

  const handleApparitionCapture = () => {
    const description = generateEvidenceDescription("anomaly");
    evidenceStore.addEvidence("anomaly", description, {
      source: "detector",
      intensity: entityEngine.getIntensity(),
      mood: entityEngine.getMood(),
    });
  };

  const startScan = () => {
    setIsScanning(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const stopScan = () => {
    setIsScanning(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const capture = useCallback(() => {
    if (!cameraEnabled) {
      showToast("Camera disabled");
      return;
    }

    const description = isPresenceDetected
      ? generateEvidenceDescription("capture")
      : generateEvidenceDescription("anomaly");
    
    const type = isPresenceDetected ? "capture" : "anomaly";
    
    evidenceStore.addEvidence(type, description, {
      source: "detector",
      intensity: entityEngine.getIntensity(),
      mood: entityEngine.getMood(),
    });

    entityEngine.stimulate(0.05);

    const messages = [
      "Anomaly recorded.",
      "Trace logged.",
      "Evidence captured.",
      "Manifestation documented.",
    ];
    showToast(messages[Math.floor(Math.random() * messages.length)]);

    if (isPresenceDetected) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  }, [isPresenceDetected, cameraEnabled]);

  const forceApparition = useCallback(() => {
    if (!cameraEnabled || !manifestationsEnabled) return;
    apparitionSystem.forceApparition();
  }, [cameraEnabled, manifestationsEnabled]);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 2000);
  };

  return {
    isScanning,
    isPresenceDetected,
    apparitionVisible,
    apparitionDuration,
    toastMessage,
    startScan,
    stopScan,
    capture,
    forceApparition,
    handleApparitionComplete,
  };
}
