import React from "react";
import { View, StyleSheet } from "react-native";
import { ScreenScrollView } from "@/components/ScreenScrollView";
import { ThemedText } from "@/components/ThemedText";
import { PresenceVisual } from "@/components/PresenceVisual";
import { ActivityMeter } from "@/components/ActivityMeter";
import { EntityMood } from "@/components/EntityMood";
import { BackgroundGrain } from "@/components/BackgroundGrain";
import { Colors, Spacing, Typography } from "@/constants/theme";
import { usePresenceState } from "@/hooks/usePresenceState";

export default function PresenceScreen() {
  const { entity, lastActivity, activityIntensity, mood } = usePresenceState();

  return (
    <View style={styles.root}>
      <BackgroundGrain />
      <ScreenScrollView contentContainerStyle={styles.container}>
        <View style={styles.visualContainer}>
          <PresenceVisual intensity={activityIntensity} />
        </View>

        <View style={styles.infoContainer}>
          <ThemedText style={styles.entityName}>{entity.name}</ThemedText>

          <EntityMood
            mood={mood}
            intensity={activityIntensity}
            recentActivity={lastActivity}
          />

          <View style={styles.meterContainer}>
            <ThemedText style={styles.label}>PRESENCE STRENGTH</ThemedText>
            <ActivityMeter intensity={activityIntensity} />
          </View>

          <View style={styles.messageContainer}>
            <ThemedText style={styles.message}>{entity.message}</ThemedText>
          </View>
        </View>
      </ScreenScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
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
    letterSpacing: Typography.title.letterSpacing,
    textAlign: "center",
    textTransform: "uppercase",
  },
  label: {
    fontSize: Typography.caption.fontSize,
    fontWeight: Typography.caption.fontWeight,
    color: Colors.dark.dimmed,
    letterSpacing: Typography.caption.letterSpacing,
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
