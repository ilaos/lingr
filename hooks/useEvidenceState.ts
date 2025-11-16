import { useState, useEffect } from "react";
import { evidenceStore, EvidenceEntry } from "@/data/evidence";

export function useEvidenceState() {
  const [evidence, setEvidence] = useState<EvidenceEntry[]>([]);

  useEffect(() => {
    const updateEvidence = () => {
      setEvidence(evidenceStore.getEvidence());
    };

    updateEvidence();

    const interval = setInterval(updateEvidence, 2000);

    return () => clearInterval(interval);
  }, []);

  const clearAllEvidence = () => {
    evidenceStore.clearEvidence();
    setEvidence([]);
  };

  return {
    evidence,
    clearEvidence: clearAllEvidence,
  };
}
