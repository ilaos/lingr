import { useState, useEffect } from "react";

interface Entity {
  name: string;
  message: string;
}

export function usePresenceState() {
  const [entity] = useState<Entity>({
    name: "Unknown",
    message: "It watches... waiting in the spaces between moments.",
  });

  const [lastActivity, setLastActivity] = useState<string>("");
  const [activityIntensity, setActivityIntensity] = useState<number>(0.3);

  useEffect(() => {
    const updateTimestamp = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      const seconds = String(now.getSeconds()).padStart(2, "0");
      setLastActivity(`${hours}:${minutes}:${seconds}`);
    };

    updateTimestamp();
    const interval = setInterval(updateTimestamp, 1000);

    const intensityInterval = setInterval(() => {
      setActivityIntensity(Math.random() * 0.6 + 0.2);
    }, 5000);

    return () => {
      clearInterval(interval);
      clearInterval(intensityInterval);
    };
  }, []);

  return {
    entity,
    lastActivity,
    activityIntensity,
  };
}
