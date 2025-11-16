import React from "react";
import { StyleSheet, AppState, AppStateStatus } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

import MainTabNavigator from "@/navigation/MainTabNavigator";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { eventsScheduler } from "@/data/eventsScheduler";
import { ambientNotificationScheduler } from "@/data/ambientNotificationScheduler";
import { notificationService } from "@/services/notificationService";
import { entityEngine } from "@/data/entityEngine";
import { evidenceStore } from "@/data/evidence";
import { episodeManager } from "@/data/episodes";
import { episodeEngine } from "@/data/episodeEngine";
import { summonEngine } from "@/data/summonEngine";
import { environmentEngine } from "@/data/environmentEngine";
import { persistenceService } from "@/state/persistenceService";
import { useEpisodeRunner } from "@/hooks/useEpisodeRunner";

export default function App() {
  const [isToastVisible, setIsToastVisible] = React.useState(false);
  const [toastMessage, setToastMessage] = React.useState("");
  const [messageVisible, setMessageVisible] = React.useState(false);
  const [message, setMessage] = React.useState("");

  const { handleOpenApp, handleNotificationSent } = useEpisodeRunner({
    onToast: (msg) => {
      setToastMessage(msg);
      setIsToastVisible(true);
      setTimeout(() => setIsToastVisible(false), 3000);
    },
    onShowMessage: (msg) => {
      setMessage(msg);
      setMessageVisible(true);
    },
    onEpisodeComplete: async (episodeId) => {
      episodeManager.completeEpisode(episodeId);
      
      const nextEpisode = episodeManager
        .getEpisodes()
        .find((ep) => ep.unlockConditions?.previousEpisode === episodeId);
      
      if (nextEpisode) {
        episodeManager.unlockEpisode(nextEpisode.id);
      }

      if (__DEV__) {
        console.log(`[App] Episode ${episodeId} completed, next unlocked: ${nextEpisode?.id || 'none'}`);
      }
    },
  });

  React.useEffect(() => {
    const initializeApp = async () => {
      await entityEngine.initialize();
      await evidenceStore.initialize();
      await episodeManager.initialize();
      await episodeEngine.initialize();
      await summonEngine.initialize();
      await environmentEngine.initialize();

      eventsScheduler.start();

      handleOpenApp();

      await ambientNotificationScheduler.initialize(
        false,
        "normal",
        { start: "23:00", end: "07:00" }
      );

      if (__DEV__) {
        console.log("[App] Persistence systems initialized");
      }

      setTimeout(async () => {
        await persistenceService.saveAppMetadata({
          lastOpenedAt: Date.now(),
          lastEvidenceCount: evidenceStore.getEvidenceCount(),
          lastMood: entityEngine.getMood(),
        });

        if (__DEV__) {
          console.log("[App] Saved initial app metadata after delay");
        }
      }, 3000);
    };

    initializeApp();

    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === "active") {
        ambientNotificationScheduler.checkAndRescheduleIfNewDay();
      } else if (nextAppState === "background" || nextAppState === "inactive") {
        const saveMetadata = async () => {
          await persistenceService.saveAppMetadata({
            lastOpenedAt: Date.now(),
            lastEvidenceCount: evidenceStore.getEvidenceCount(),
            lastMood: entityEngine.getMood(),
          });

          if (__DEV__) {
            console.log("[App] Saved app metadata on background");
          }
        };

        saveMetadata();
      }
    };

    const appStateSubscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );

    const notificationListener =
      notificationService.addNotificationReceivedListener((notification) => {
        if (__DEV__) {
          console.log("[Notification] Received:", notification.request.content.body);
        }
      });

    const responseListener =
      notificationService.addNotificationResponseReceivedListener((response) => {
        if (__DEV__) {
          console.log("[Notification] Response:", response.notification.request.content.body);
        }
        handleNotificationSent();
      });

    return () => {
      eventsScheduler.cleanup();
      appStateSubscription.remove();
      notificationListener.remove();
      responseListener.remove();
    };
  }, []);

  return (
  <ErrorBoundary>
    <SafeAreaProvider>
        <GestureHandlerRootView style={styles.root}>
          <KeyboardProvider>
            <NavigationContainer>
              <MainTabNavigator />
            </NavigationContainer>
            <StatusBar style="light" />
          </KeyboardProvider>
        </GestureHandlerRootView>
      </SafeAreaProvider>
  </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
