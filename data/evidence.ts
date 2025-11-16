import { persistenceService } from "@/state/persistenceService";

export type EvidenceType = "capture" | "message" | "anomaly";

export interface EvidenceEntry {
  id: string;
  type: EvidenceType;
  timestamp: number;
  description: string;
  thumbnail?: string;
  metadata?: {
    location?: string;
    intensity?: number;
    mood?: string;
    [key: string]: any;
  };
}

class EvidenceStore {
  private evidence: EvidenceEntry[] = [];
  private idCounter = 1;
  private isInitialized = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    const saved = await persistenceService.loadEvidence();

    if (saved && saved.length > 0) {
      this.evidence = saved.slice(0, 100);

      const maxId = Math.max(
        0,
        ...this.evidence.map((e) => {
          const match = e.id.match(/_(\d+)$/);
          return match ? parseInt(match[1], 10) : 0;
        })
      );
      this.idCounter = maxId + 1;

      if (__DEV__) {
        console.log(`[EvidenceStore] Restored ${this.evidence.length} evidence entries`);
      }
    }

    this.isInitialized = true;
  }

  public addEvidence(
    type: EvidenceType,
    description: string,
    metadata?: EvidenceEntry["metadata"]
  ): EvidenceEntry {
    const entry: EvidenceEntry = {
      id: `evidence_${Date.now()}_${this.idCounter++}`,
      type,
      timestamp: Date.now(),
      description,
      metadata,
    };

    this.evidence.unshift(entry);

    if (this.evidence.length > 100) {
      this.evidence = this.evidence.slice(0, 100);
    }

    this.saveEvidence();

    return entry;
  }

  public getEvidence(): EvidenceEntry[] {
    return [...this.evidence];
  }

  public getEvidenceByType(type: EvidenceType): EvidenceEntry[] {
    return this.evidence.filter((e) => e.type === type);
  }

  public getEvidenceById(id: string): EvidenceEntry | undefined {
    return this.evidence.find((e) => e.id === id);
  }

  public getRecentEvidence(limit: number = 10): EvidenceEntry[] {
    return this.evidence.slice(0, limit);
  }

  public getEvidenceCount(): number {
    return this.evidence.length;
  }

  public async clearEvidence(): Promise<void> {
    this.evidence = [];
    this.idCounter = 1;
    await persistenceService.clearEvidence();
  }

  public removeEvidence(id: string): boolean {
    const index = this.evidence.findIndex((e) => e.id === id);
    if (index !== -1) {
      this.evidence.splice(index, 1);
      this.saveEvidence();
      return true;
    }
    return false;
  }

  private async saveEvidence(): Promise<void> {
    await persistenceService.saveEvidence(this.evidence);
  }
}

export const evidenceStore = new EvidenceStore();

export const EVIDENCE_DESCRIPTIONS = {
  capture: [
    "Distortion detected in visual field",
    "Anomalous presence captured on camera",
    "Reality fracture documented",
    "Spectral manifestation recorded",
    "Unidentified entity signature",
    "Spatial anomaly visualized",
  ],
  message: [
    "Cryptic transmission received",
    "Unsolicited communication logged",
    "Message from unknown source",
    "Corrupted text fragment decoded",
    "Unexplained notification archived",
    "Entity broadcast intercepted",
  ],
  anomaly: [
    "Unexplained system behavior detected",
    "Temporal displacement recorded",
    "Environmental interference logged",
    "Electromagnetic anomaly measured",
    "Reality coherence failure noted",
    "Quantum uncertainty spike observed",
  ],
};

export function generateEvidenceDescription(type: EvidenceType): string {
  const descriptions = EVIDENCE_DESCRIPTIONS[type];
  return descriptions[Math.floor(Math.random() * descriptions.length)];
}
