import { useEffect, useRef } from "react";
import { episodeEngine } from "@/data/episodeEngine";
import { EPISODES } from "@/data/episodes";
import type { EpisodeTrigger, EpisodeStep } from "@/data/episodeEngine";
import type { MoodType } from "@/components/EntityMood";
import type { EnvironmentMode } from "@/data/environmentEngine";
import { entityEngine } from "@/data/entityEngine";
import { environmentEngine } from "@/data/environmentEngine";
import { evidenceStore } from "@/data/evidence";
import { notificationService } from "@/services/notificationService";
import * as Haptics from "expo-haptics";

export interface EpisodeRunnerCallbacks {
  onShowMessage?: (message: string) => void;
  onToast?: (message: string) => void;
  onEpisodeComplete?: (episodeId: string) => void;
}

export function useEpisodeRunner(callbacks: EpisodeRunnerCallbacks) {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const lastStepRef = useRef<number>(-1);
  const currentEpisodeRef = useRef<string | null>(null);

  const getContext = () => {
    const entityState = entityEngine.getState();
    const envState = environmentEngine.getEnvironmentState();

    return {
      mood: entityState.mood as MoodType,
      intensity: entityState.intensity,
      environment: envState.mode as EnvironmentMode,
    };
  };

  const executeAction = async (step: EpisodeStep) => {
    const { action, data } = step;

    try {
      switch (action) {
        case "show_message":
          if (callbacks.onShowMessage && data.message) {
            callbacks.onShowMessage(data.message);
          }
          break;

        case "toast":
          if (callbacks.onToast && data.message) {
            callbacks.onToast(data.message);
          }
          break;

        case "notification":
          if (data.title && data.body) {
            const notificationTime = new Date(Date.now() + 1000);
            await notificationService.scheduleAmbientNotification(
              notificationTime,
              {
                title: data.title,
                body: data.body,
                tag: "episode",
              }
            );
          }
          break;

        case "auto_add_evidence":
          if (data.type && data.description) {
            evidenceStore.addEvidence(data.type, data.description, {
              source: "episode",
              mood: getContext().mood,
              intensity: getContext().intensity,
              environment: getContext().environment,
            });
          }
          break;

        case "intensity_spike":
          if (data.amount) {
            entityEngine.stimulate(data.amount);
          }
          break;

        case "spawn_apparition":
          break;

        default:
          if (__DEV__) {
            console.warn(`[EpisodeRunner] Unknown action: ${action}`);
          }
      }
    } catch (error) {
      console.error(`[EpisodeRunner] Error executing action ${action}:`, error);
    }
  };

  const checkAndExecuteStep = async (trigger: EpisodeTrigger) => {
    const activeEpisode = episodeEngine.getActiveEpisode();
    if (!activeEpisode) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      currentEpisodeRef.current = null;
      return;
    }

    if (currentEpisodeRef.current !== activeEpisode.episodeId) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      currentEpisodeRef.current = activeEpisode.episodeId;
    }

    const episode = EPISODES.find((ep) => ep.id === activeEpisode.episodeId);
    if (!episode || !episode.steps) return;

    const currentStep = episode.steps[activeEpisode.currentStepIndex];
    if (!currentStep) {
      const result = episodeEngine.completeEpisode();
      if (result && callbacks.onEpisodeComplete) {
        callbacks.onEpisodeComplete(result.episodeId);
      }
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      currentEpisodeRef.current = null;
      return;
    }

    if (currentStep.trigger !== trigger) return;

    const context = getContext();
    const canTrigger = episodeEngine.canTriggerStep(
      trigger,
      currentStep.condition,
      context
    );

    if (!canTrigger) {
      if (__DEV__) {
        console.log(
          `[EpisodeRunner] Conditions not met for step ${activeEpisode.currentStepIndex}`
        );
      }
      return;
    }

    if (__DEV__) {
      console.log(
        `[EpisodeRunner] Executing step ${activeEpisode.currentStepIndex} (${currentStep.id}) - ${currentStep.action}`
      );
    }

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    await executeAction(currentStep);

    if (currentStep.waitSeconds) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      timerRef.current = setTimeout(() => {
        if (__DEV__) {
          console.log(
            `[EpisodeRunner] Timer completed for step ${currentStep.id}`
          );
        }
        episodeEngine.advanceStep();
        checkAndExecuteStep("timer");
      }, currentStep.waitSeconds * 1000);
    } else {
      episodeEngine.advanceStep();
    }
  };

  const handleOpenApp = () => {
    checkAndExecuteStep("open_app");
  };

  const handleScan = () => {
    checkAndExecuteStep("scan");
  };

  const handleEvidenceAdded = () => {
    checkAndExecuteStep("evidence_added");
  };

  const handleSummonMessage = () => {
    checkAndExecuteStep("summon_message");
  };

  const handleNotificationSent = () => {
    checkAndExecuteStep("notification_sent");
  };

  useEffect(() => {
    const activeEpisode = episodeEngine.getActiveEpisode();
    if (activeEpisode && activeEpisode.currentStepIndex !== lastStepRef.current) {
      lastStepRef.current = activeEpisode.currentStepIndex;
    }
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return {
    handleOpenApp,
    handleScan,
    handleEvidenceAdded,
    handleSummonMessage,
    handleNotificationSent,
    checkAndExecuteStep,
  };
}
