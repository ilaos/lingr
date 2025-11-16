import { useEffect, useRef } from "react";
import { ambientNotificationScheduler } from "@/data/ambientNotificationScheduler";
import type { FrequencyLevel } from "@/data/ambientNotificationScheduler";

interface QuietHours {
  start: string;
  end: string;
}

interface NotificationSettings {
  enabled: boolean;
  frequency: FrequencyLevel;
  quietHours: QuietHours;
  presenceActive: boolean;
}

export function useNotificationSync(settings: NotificationSettings) {
  const prevSettingsRef = useRef<NotificationSettings | null>(null);

  useEffect(() => {
    const prevSettings = prevSettingsRef.current;

    if (
      prevSettings &&
      (prevSettings.enabled !== settings.enabled ||
        prevSettings.frequency !== settings.frequency ||
        prevSettings.quietHours.start !== settings.quietHours.start ||
        prevSettings.quietHours.end !== settings.quietHours.end ||
        prevSettings.presenceActive !== settings.presenceActive)
    ) {
      const shouldEnable = settings.enabled && settings.presenceActive;

      ambientNotificationScheduler.updateSettings(
        shouldEnable,
        settings.frequency,
        settings.quietHours
      );

      if (__DEV__) {
        console.log("[NotificationSync] Settings updated:", {
          enabled: shouldEnable,
          frequency: settings.frequency,
          quietHours: settings.quietHours,
        });
      }
    }

    prevSettingsRef.current = settings;
  }, [settings]);
}
