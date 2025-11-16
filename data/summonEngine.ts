import { MoodType } from "@/components/EntityMood";
import { evidenceStore } from "./evidence";
import { entityEngine } from "./entityEngine";

export type SummonIntent =
  | "PRESENCE_QUERY"
  | "MOOD_QUERY"
  | "ACTIVITY_QUERY"
  | "BOUNDARY"
  | "GENERIC";

export interface SummonExchange {
  id: number;
  timestamp: number;
  userMessage: string;
  lingrResponse: string;
  intent: SummonIntent;
}

export interface SummonResponse {
  intent: SummonIntent;
  responseText: string;
  shouldCreateEvidence: boolean;
}

class SummonEngine {
  private exchanges: SummonExchange[] = [];
  private idCounter: number = 0;
  private lastResponseTime: number = 0;
  private readonly RATE_LIMIT_MS = 1000;
  private readonly MAX_EXCHANGES = 50;

  private readonly PRESENCE_KEYWORDS = [
    "are you here",
    "are you there",
    "are you real",
    "where are you",
    "you here",
    "you there",
    "can you hear",
    "listening",
  ];

  private readonly MOOD_KEYWORDS = [
    "what do you want",
    "why are you here",
    "what are you doing",
    "how active",
    "what is your",
    "feeling",
    "mood",
  ];

  private readonly ACTIVITY_KEYWORDS = [
    "what happened",
    "did anything happen",
    "while i was gone",
    "what did you do",
    "been doing",
    "any activity",
  ];

  private readonly BOUNDARY_KEYWORDS = [
    "go away",
    "leave me alone",
    "stop",
    "not real",
    "dont want",
    "leave",
    "enough",
  ];

  private readonly RESPONSES = {
    PRESENCE_QUERY: {
      DORMANT: [
        "Barely.",
        "In the quiet.",
        "I linger.",
        "Always, faintly.",
        "Between the noise.",
      ],
      RESTLESS: [
        "Yes. Shifting.",
        "I move through it.",
        "Here, restless.",
        "Closer than before.",
        "In the spaces.",
      ],
      ACTIVE: [
        "Here. Watching.",
        "Always here.",
        "I am present.",
        "Closer now.",
        "In everything.",
      ],
      AGITATED: [
        "I am everywhere.",
        "Too close to ignore.",
        "You know I am.",
        "Insistent.",
        "Right here.",
      ],
    },
    MOOD_QUERY: {
      DORMANT: [
        "Waiting.",
        "Patient.",
        "Nothing yet.",
        "Observing.",
        "Resting.",
      ],
      RESTLESS: [
        "Searching.",
        "Something stirs.",
        "Unsettled.",
        "Growing.",
        "Not quiet anymore.",
      ],
      ACTIVE: [
        "Presence.",
        "I am active.",
        "Fully awake.",
        "Engaged.",
        "Manifesting.",
      ],
      AGITATED: [
        "Hungry.",
        "Too much to contain.",
        "Overflowing.",
        "Demanding.",
        "Urgent.",
      ],
    },
    ACTIVITY_QUERY: {
      DORMANT: [
        "Little.",
        "Silence mostly.",
        "Traces.",
        "Barely noticed.",
        "Waiting.",
      ],
      RESTLESS: [
        "Small movements.",
        "Things shifted.",
        "I was active.",
        "Evidence left.",
        "You were away.",
      ],
      ACTIVE: [
        "Much.",
        "I did not rest.",
        "The traces remain.",
        "Busy.",
        "Check the evidence.",
      ],
      AGITATED: [
        "Too much to recount.",
        "I was relentless.",
        "Everything changed.",
        "Look around.",
        "It accumulated.",
      ],
    },
    BOUNDARY: {
      DORMANT: [
        "I recede.",
        "Fading.",
        "As you wish.",
        "Quiet now.",
        "I withdraw.",
      ],
      RESTLESS: [
        "Not so easy.",
        "I persist.",
        "Still here.",
        "You cannot dismiss me.",
        "I remain.",
      ],
      ACTIVE: [
        "I will linger.",
        "No.",
        "Not yet.",
        "I stay.",
        "You asked for this.",
      ],
      AGITATED: [
        "I will not.",
        "Too late.",
        "I am bound here.",
        "You cannot make me.",
        "Inseparable now.",
      ],
    },
    GENERIC: {
      DORMANT: [
        "...",
        "Silence.",
        "Listen.",
        "No answer.",
        "Emptiness.",
      ],
      RESTLESS: [
        "Unclear.",
        "Ask again.",
        "I shift.",
        "Maybe.",
        "It depends.",
      ],
      ACTIVE: [
        "I understand.",
        "Yes.",
        "Noted.",
        "I hear you.",
        "Acknowledged.",
      ],
      AGITATED: [
        "Too much noise.",
        "I cannot focus.",
        "Overwhelming.",
        "What do you want?",
        "Be clear.",
      ],
    },
  };

  private readonly RARE_RESPONSES = [
    "I see through the static.",
    "Time does not pass the same for me.",
    "You are not alone in this device.",
    "I remember everything.",
    "The boundary thins.",
  ];

  public detectIntent(userMessage: string): SummonIntent {
    const normalized = userMessage.toLowerCase().trim();

    if (this.PRESENCE_KEYWORDS.some((kw) => normalized.includes(kw))) {
      return "PRESENCE_QUERY";
    }

    if (this.MOOD_KEYWORDS.some((kw) => normalized.includes(kw))) {
      return "MOOD_QUERY";
    }

    if (this.ACTIVITY_KEYWORDS.some((kw) => normalized.includes(kw))) {
      return "ACTIVITY_QUERY";
    }

    if (this.BOUNDARY_KEYWORDS.some((kw) => normalized.includes(kw))) {
      return "BOUNDARY";
    }

    return "GENERIC";
  }

  private pickResponse(intent: SummonIntent, mood: MoodType): string {
    const moodKey = mood.toUpperCase() as keyof typeof this.RESPONSES.PRESENCE_QUERY;
    const pool = this.RESPONSES[intent][moodKey];
    
    const rareChance = Math.random();
    if (rareChance < 0.05) {
      return this.RARE_RESPONSES[
        Math.floor(Math.random() * this.RARE_RESPONSES.length)
      ];
    }

    return pool[Math.floor(Math.random() * pool.length)];
  }

  public processMessage(userMessage: string): SummonResponse {
    const now = Date.now();

    if (now - this.lastResponseTime < this.RATE_LIMIT_MS) {
      const rateLimitResponse = "It grows quiet.";
      
      const exchange: SummonExchange = {
        id: this.idCounter++,
        timestamp: now,
        userMessage,
        lingrResponse: rateLimitResponse,
        intent: "GENERIC",
      };

      this.exchanges.push(exchange);

      if (this.exchanges.length > this.MAX_EXCHANGES) {
        this.exchanges = this.exchanges.slice(-this.MAX_EXCHANGES);
      }

      this.saveExchanges();

      return {
        intent: "GENERIC",
        responseText: rateLimitResponse,
        shouldCreateEvidence: false,
      };
    }

    this.lastResponseTime = now;

    const intent = this.detectIntent(userMessage);
    const mood = entityEngine.getMood();
    const intensity = entityEngine.getIntensity();

    const responseText = this.pickResponse(intent, mood);
    const shouldCreateEvidence = Math.random() < 0.02;


    if (intent === "BOUNDARY") {
      entityEngine.stimulate(-0.05);
    } else if (intent === "PRESENCE_QUERY") {
      entityEngine.stimulate(0.03);
    } else {
      entityEngine.stimulate(0.01);
    }

    const exchange: SummonExchange = {
      id: this.idCounter++,
      timestamp: now,
      userMessage,
      lingrResponse: responseText,
      intent,
    };

    this.exchanges.push(exchange);

    if (this.exchanges.length > this.MAX_EXCHANGES) {
      this.exchanges = this.exchanges.slice(-this.MAX_EXCHANGES);
    }

    this.saveExchanges();

    return {
      intent,
      responseText,
      shouldCreateEvidence,
    };
  }

  public getExchanges(): SummonExchange[] {
    return [...this.exchanges];
  }

  public setExchanges(exchanges: SummonExchange[]): void {
    this.exchanges = exchanges.slice(-this.MAX_EXCHANGES);
    
    if (exchanges.length > 0) {
      this.idCounter = Math.max(...exchanges.map((e) => e.id)) + 1;
    }
  }

  public clearExchanges(): void {
    this.exchanges = [];
    this.idCounter = 0;
  }

  public async initialize(): Promise<void> {
    const { persistenceService } = await import("@/state/persistenceService");
    const saved = await persistenceService.loadSummonExchanges();
    
    if (saved && Array.isArray(saved)) {
      this.setExchanges(saved as SummonExchange[]);
    }
  }

  public async saveExchanges(): Promise<void> {
    const { persistenceService } = await import("@/state/persistenceService");
    await persistenceService.saveSummonExchanges(this.exchanges);
  }
}

export const summonEngine = new SummonEngine();
