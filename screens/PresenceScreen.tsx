import React from "react";
import { View, StyleSheet } from "react-native";
import { ScreenScrollView } from "@/components/ScreenScrollView";
import { ThemedText } from "@/components/ThemedText";
import { PresenceVisual } from "@/components/PresenceVisual";
import { ActivityMeter } from "@/components/ActivityMeter";
import { Colors, Spacing, Typography } from "@/constants/theme";
import { usePresenceState } from "@/hooks/usePresenceState";

export default function PresenceScreen() {
  const { entity, lastActivity, activityIntensity } = usePresenceState();

  return (
    <ScreenScrollView contentContainerStyle={styles.container}>
      <View style={styles.visualContainer}>
        <PresenceVisual intensity={activityIntensity} />
      </View>

      <View style={styles.infoContainer}>
        <ThemedText style={styles.entityName}>{entity.name}</ThemedText>
        
        <View style={styles.lastActivityContainer}>
          <ThemedText style={styles.label}>LAST ACTIVITY</ThemedText>
          <ThemedText style={styles.timestamp}>{lastActivity}</ThemedText>
        </View>

        <View style={styles.meterContainer}>
          <ThemedText style={styles.label}>INTENSITY</ThemedText>
          <ActivityMeter intensity={activityIntensity} />
        </View>

        <View style={styles.messageContainer}>
          <ThemedText style={styles.message}>{entity.message}</ThemedText>
        </View>
      </View>
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing["4xl"],
  },
  visualContainer: {
    marginVertical: Spacing["3xl"],
    alignItems: "center",
  },
  infoContainer: {
    width: "100%",
    gap: Spacing["2xl"],
  },
  entityName: {
    fontSize: Typography.title.fontSize,
    fontWeight: Typography.title.fontWeight,
    textAlign: "center",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  lastActivityContainer: {
    gap: Spacing.sm,
  },
  label: {
    fontSize: Typography.caption.fontSize,
    fontWeight: Typography.caption.fontWeight,
    color: Colors.dark.dimmed,
    letterSpacing: 1.5,
  },
  timestamp: {
    fontSize: Typography.monospace.fontSize,
    fontFamily: "monospace",
    color: Colors.dark.accent,
  },
  meterContainer: {
    gap: Spacing.sm,
  },
  messageContainer: {
    marginTop: Spacing.lg,
    padding: Spacing.lg,
    backgroundColor: Colors.dark.backgroundSecondary,
    borderRadius: 8,
    borderLeftWidth: 2,
    borderLeftColor: Colors.dark.accent,
  },
  message: {
    fontSize: Typography.body.fontSize,
    fontStyle: "italic",
    color: Colors.dark.text,
    lineHeight: 24,
  },
});
