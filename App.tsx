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

export default function App() {
  React.useEffect(() => {
    eventsScheduler.start();

    const initializeNotifications = async () => {
      await ambientNotificationScheduler.initialize(
        false,
        "normal",
        { start: "23:00", end: "07:00" }
      );
    };

    initializeNotifications();

    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === "active") {
        ambientNotificationScheduler.checkAndRescheduleIfNewDay();
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
