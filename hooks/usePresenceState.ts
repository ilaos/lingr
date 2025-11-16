import { useState, useEffect } from "react";
import { MoodType } from "@/components/EntityMood";

interface Entity {
  name: string;
  message: string;
}

const CRYPTIC_MESSAGES = [
  "It watches... waiting in the spaces between moments.",
  "The boundary thins when you're not looking.",
  "Have you checked the shadows lately?",
  "Time moves differently here now.",
  "Your device remembers things you've forgotten.",
  "Something shifted while you were away.",
  "The static hides more than silence.",
  "It knows your patterns now.",
];

export function usePresenceState() {
  const [entity] = useState<Entity>({
    name: "Unknown",
    message: CRYPTIC_MESSAGES[0],
  });

  const [lastActivity, setLastActivity] = useState<string>("");
  const [activityIntensity, setActivityIntensity] = useState<number>(0.3);
  const [mood, setMood] = useState<MoodType>("restless");
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const updateTimestamp = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      const seconds = String(now.getSeconds()).padStart(2, "0");
      setLastActivity(`${hours}:${minutes}:${seconds}`);
    };

    updateTimestamp();
    const timestampInterval = setInterval(updateTimestamp, 1000);

    const intensityInterval = setInterval(() => {
      const newIntensity = Math.random() * 0.6 + 0.2;
      setActivityIntensity(newIntensity);

      if (newIntensity < 0.3) setMood("dormant");
      else if (newIntensity < 0.5) setMood("restless");
      else if (newIntensity < 0.7) setMood("active");
      else setMood("agitated");
    }, 8000);

    const messageInterval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % CRYPTIC_MESSAGES.length);
    }, 20000);

    return () => {
      clearInterval(timestampInterval);
      clearInterval(intensityInterval);
      clearInterval(messageInterval);
    };
  }, []);

  return {
    entity: {
      ...entity,
      message: CRYPTIC_MESSAGES[messageIndex],
    },
    lastActivity,
    activityIntensity,
    mood,
  };
}
