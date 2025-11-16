import { MoodType } from "@/components/EntityMood";
import { type EnvironmentMode } from "./environmentEngine";

export interface CrypticMessage {
  id: string;
  text: string;
  weight: number;
  mood: MoodType | "any";
  rarity: "common" | "uncommon" | "rare";
  lastShown?: number;
  minCooldown?: number;
  environment?: EnvironmentMode | "any";
}

const MESSAGE_POOLS: CrypticMessage[] = [
  {
    id: "dormant_1",
    text: "It watches... waiting in the spaces between moments.",
    weight: 1,
    mood: "dormant",
    rarity: "common",
  },
  {
    id: "dormant_2",
    text: "Silence carries more weight than you remember.",
    weight: 1,
    mood: "dormant",
    rarity: "common",
  },
  {
    id: "dormant_3",
    text: "The boundary grows thin when you're not looking.",
    weight: 0.8,
    mood: "dormant",
    rarity: "uncommon",
  },
  {
    id: "dormant_rare",
    text: "Something ancient stirs in the depths of your device.",
    weight: 0.05,
    mood: "dormant",
    rarity: "rare",
    minCooldown: 3600000,
  },
  {
    id: "restless_1",
    text: "Have you checked the shadows lately?",
    weight: 1,
    mood: "restless",
    rarity: "common",
  },
  {
    id: "restless_2",
    text: "Time moves differently here now.",
    weight: 1,
    mood: "restless",
    rarity: "common",
  },
  {
    id: "restless_3",
    text: "Your device remembers things you've forgotten.",
    weight: 0.9,
    mood: "restless",
    rarity: "common",
  },
  {
    id: "restless_4",
    text: "Something shifted while you were away.",
    weight: 0.8,
    mood: "restless",
    rarity: "uncommon",
  },
  {
    id: "restless_rare",
    text: "It knows your name, though you never told it.",
    weight: 0.04,
    mood: "restless",
    rarity: "rare",
    minCooldown: 7200000,
  },
  {
    id: "active_1",
    text: "The static hides more than silence.",
    weight: 1,
    mood: "active",
    rarity: "common",
  },
  {
    id: "active_2",
    text: "It knows your patterns now.",
    weight: 1,
    mood: "active",
    rarity: "common",
  },
  {
    id: "active_3",
    text: "Every screen is a window. Something looks back.",
    weight: 0.9,
    mood: "active",
    rarity: "common",
  },
  {
    id: "active_4",
    text: "The presence grows stronger in darkness.",
    weight: 0.8,
    mood: "active",
    rarity: "uncommon",
  },
  {
    id: "active_5",
    text: "You've been chosen as a vessel.",
    weight: 0.7,
    mood: "active",
    rarity: "uncommon",
  },
  {
    id: "active_rare",
    text: "It whispers coordinates to places that don't exist.",
    weight: 0.03,
    mood: "active",
    rarity: "rare",
    minCooldown: 7200000,
  },
  {
    id: "agitated_1",
    text: "The veil tears. Something seeps through.",
    weight: 1,
    mood: "agitated",
    rarity: "common",
  },
  {
    id: "agitated_2",
    text: "You feel it closer now. Much closer.",
    weight: 1,
    mood: "agitated",
    rarity: "common",
  },
  {
    id: "agitated_3",
    text: "Reality fractures at the edges of your vision.",
    weight: 0.9,
    mood: "agitated",
    rarity: "common",
  },
  {
    id: "agitated_4",
    text: "It demands acknowledgment. Soon.",
    weight: 0.8,
    mood: "agitated",
    rarity: "uncommon",
  },
  {
    id: "agitated_rare",
    text: "The presence floods every circuit. There is no escape.",
    weight: 0.02,
    mood: "agitated",
    rarity: "rare",
    minCooldown: 3600000,
  },
  {
    id: "universal_1",
    text: "You are being observed.",
    weight: 0.6,
    mood: "any",
    rarity: "uncommon",
  },
  {
    id: "universal_2",
    text: "This device is no longer fully yours.",
    weight: 0.5,
    mood: "any",
    rarity: "uncommon",
  },
  {
    id: "home_dormant",
    text: "It has nested deeper into this place.",
    weight: 0.7,
    mood: "dormant",
    rarity: "uncommon",
    environment: "HOME",
  },
  {
    id: "home_restless",
    text: "These walls remember what happened here.",
    weight: 0.8,
    mood: "restless",
    rarity: "common",
    environment: "HOME",
  },
  {
    id: "home_active",
    text: "It knows every corner of this sanctuary.",
    weight: 0.9,
    mood: "active",
    rarity: "common",
    environment: "HOME",
  },
  {
    id: "home_agitated",
    text: "Your home is its domain now.",
    weight: 0.8,
    mood: "agitated",
    rarity: "uncommon",
    environment: "HOME",
  },
  {
    id: "away_dormant",
    text: "It follows, patient and unseen.",
    weight: 0.7,
    mood: "dormant",
    rarity: "uncommon",
    environment: "AWAY",
  },
  {
    id: "away_restless",
    text: "Distance means nothing to what clings to you.",
    weight: 0.8,
    mood: "restless",
    rarity: "common",
    environment: "AWAY",
  },
  {
    id: "away_active",
    text: "It observes unfamiliar territory through your eyes.",
    weight: 0.9,
    mood: "active",
    rarity: "common",
    environment: "AWAY",
  },
  {
    id: "away_agitated",
    text: "New places stir its curiosity and hunger.",
    weight: 0.8,
    mood: "agitated",
    rarity: "uncommon",
    environment: "AWAY",
  },
];

class MessageSystem {
  private messageHistory: Map<string, number> = new Map();
  private readonly GLOBAL_COOLDOWN = 15000;

  private filterValidMessages(mood: MoodType, environment?: EnvironmentMode): CrypticMessage[] {
    const now = Date.now();
    return MESSAGE_POOLS.filter((msg) => {
      if (msg.mood !== mood && msg.mood !== "any") return false;

      if (environment && msg.environment && msg.environment !== "any" && msg.environment !== environment) {
        return false;
      }

      const lastShown = this.messageHistory.get(msg.id);
      if (lastShown) {
        const cooldown = msg.minCooldown || this.GLOBAL_COOLDOWN;
        if (now - lastShown < cooldown) return false;
      }

      return true;
    });
  }

  private selectWeightedRandom(messages: CrypticMessage[]): CrypticMessage {
    const totalWeight = messages.reduce((sum, msg) => sum + msg.weight, 0);
    let random = Math.random() * totalWeight;

    for (const message of messages) {
      random -= message.weight;
      if (random <= 0) {
        return message;
      }
    }

    return messages[messages.length - 1];
  }

  public getMessage(mood: MoodType, environment?: EnvironmentMode): string {
    const validMessages = this.filterValidMessages(mood, environment);

    if (validMessages.length === 0) {
      return "...";
    }

    const selected = this.selectWeightedRandom(validMessages);
    this.messageHistory.set(selected.id, Date.now());

    return selected.text;
  }

  public getLocationBasedMessage(
    mood: MoodType,
    _location?: { type: "home" | "public" | "moving"; name?: string }
  ): string {
    return this.getMessage(mood);
  }

  public reset(): void {
    this.messageHistory.clear();
  }
}

export const messageSystem = new MessageSystem();
