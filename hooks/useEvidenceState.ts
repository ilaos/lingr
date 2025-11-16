import { useState } from "react";
import { EvidenceType } from "@/components/EvidenceCard";

interface Evidence {
  id: string;
  type: EvidenceType;
  timestamp: string;
  thumbnail?: string;
}

export function useEvidenceState() {
  const [evidence] = useState<Evidence[]>([]);

  return {
    evidence,
  };
}
