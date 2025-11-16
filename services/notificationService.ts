import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

export interface AmbientPayload {
  title: string;
  body: string;
  tag?: string;
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

class NotificationService {
  async requestNotificationPermission(): Promise<boolean> {
    if (Platform.OS === "web") {
      return false;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    return finalStatus === "granted";
  }

  async canSendNotifications(): Promise<boolean> {
    if (Platform.OS === "web") {
      return false;
    }

    const { status } = await Notifications.getPermissionsAsync();
    return status === "granted";
  }

  async scheduleAmbientNotification(
    at: Date,
    payload: AmbientPayload
  ): Promise<string> {
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: payload.title,
          body: payload.body,
          data: { tag: payload.tag },
          sound: false,
        },
        trigger: at,
      });

      if (__DEV__) {
        console.log(
          `[Notification] Scheduled at ${at.toLocaleString()}: "${payload.body}"`
        );
      }

      return notificationId;
    } catch (error) {
      console.error("[Notification] Failed to schedule:", error);
      throw error;
    }
  }

  async cancelNotification(id: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(id);
      if (__DEV__) {
        console.log(`[Notification] Cancelled: ${id}`);
      }
    } catch (error) {
      console.error("[Notification] Failed to cancel:", error);
    }
  }

  async cancelAllAmbientNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      if (__DEV__) {
        console.log("[Notification] Cancelled all scheduled notifications");
      }
    } catch (error) {
      console.error("[Notification] Failed to cancel all:", error);
    }
  }

  async getAllScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error("[Notification] Failed to get scheduled notifications:", error);
      return [];
    }
  }

  addNotificationReceivedListener(
    listener: (notification: Notifications.Notification) => void
  ) {
    return Notifications.addNotificationReceivedListener(listener);
  }

  addNotificationResponseReceivedListener(
    listener: (response: Notifications.NotificationResponse) => void
  ) {
    return Notifications.addNotificationResponseReceivedListener(listener);
  }
}

export const notificationService = new NotificationService();
