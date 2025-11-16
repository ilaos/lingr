import { useState, useEffect } from "react";
import { MoodType } from "@/components/EntityMood";
import { entityEngine } from "@/data/entityEngine";
import { messageSystem } from "@/data/messages";

interface Entity {
  name: string;
  message: string;
}

export function usePresenceState() {
  const [entity] = useState<Entity>({
    name: "Unknown",
    message: "",
  });

  const [lastActivity, setLastActivity] = useState<string>("");
  const [activityIntensity, setActivityIntensity] = useState<number>(0.3);
  const [mood, setMood] = useState<MoodType>("restless");
  const [message, setMessage] = useState<string>("");

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

    const stateInterval = setInterval(() => {
      const state = entityEngine.getState();
      setActivityIntensity(state.intensity);
      setMood(state.mood);
    }, 1000);

    const messageInterval = setInterval(() => {
      const currentMood = entityEngine.getMood();
      const newMessage = messageSystem.getMessage(currentMood);
      setMessage(newMessage);
    }, 25000);

    const initialMessage = messageSystem.getMessage(entityEngine.getMood());
    setMessage(initialMessage);

    return () => {
      clearInterval(timestampInterval);
      clearInterval(stateInterval);
      clearInterval(messageInterval);
    };
  }, []);

  return {
    entity: {
      ...entity,
      message,
    },
    lastActivity,
    activityIntensity,
    mood,
  };
}
