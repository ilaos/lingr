import React from "react";
import { View, StyleSheet, Pressable, Alert } from "react-native";
import { ScreenScrollView } from "@/components/ScreenScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ControlToggle } from "@/components/ControlToggle";
import { EntityMood } from "@/components/EntityMood";
import { BackgroundGrain } from "@/components/BackgroundGrain";
import { Colors, Spacing, Typography, BorderRadius } from "@/constants/theme";
import { useControlState } from "@/hooks/useControlState";
import { usePresenceState } from "@/hooks/usePresenceState";

export default function ControlScreen() {
  const { controls, updateControl, pausePresence, clearEvidence, removePresence } =
    useControlState();
  const { lastActivity, activityIntensity, mood } = usePresenceState();

  const handlePausePress = () => {
    Alert.alert(
      "Pause Presence",
      "The presence will be paused for 24 hours. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Pause",
          style: "default",
          onPress: pausePresence,
        },
      ]
    );
  };

  const handleClearEvidence = () => {
    Alert.alert(
      "Clear All Evidence",
      "This will permanently delete all captured evidence. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: clearEvidence,
        },
      ]
    );
  };

  const handleRemovePresence = () => {
    Alert.alert(
      "Remove Presence",
      "This will completely remove the presence from your device. This cannot be undone. Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => {
            Alert.alert(
              "Final Confirmation",
              "This is your last chance. Remove the presence permanently?",
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Remove Forever",
                  style: "destructive",
                  onPress: removePresence,
                },
              ]
            );
          },
        },
      ]
    );
  };

  return (
    <View style={styles.root}>
      <BackgroundGrain />
      <ScreenScrollView contentContainerStyle={styles.container}>
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>ENTITY STATUS</ThemedText>
          <EntityMood
            mood={mood}
            intensity={activityIntensity}
            recentActivity={lastActivity}
          />
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <View style={styles.statusContainer}>
            <View
              style={[
                styles.statusDot,
                !controls.presenceActive && styles.statusDotInactive,
              ]}
            />
            <ThemedText
              style={[
                styles.statusText,
                !controls.presenceActive && styles.statusTextInactive,
              ]}
            >
              {controls.presenceActive ? "PRESENCE ACTIVE" : "PRESENCE INACTIVE"}
            </ThemedText>
          </View>
          <ControlToggle
            label="Master Control"
            description="Enable or disable all presence activity"
            value={controls.presenceActive}
            onValueChange={(value) => updateControl("presenceActive", value)}
          />
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>AMBIENT</ThemedText>
          <ControlToggle
            label="Push Notifications"
            description="Receive cryptic messages and alerts"
            value={controls.notifications}
            onValueChange={(value) => updateControl("notifications", value)}
            disabled={!controls.presenceActive}
          />
          <ControlToggle
            label="Haptic Feedback"
            description="Feel presence through vibrations"
            value={controls.haptics}
            onValueChange={(value) => updateControl("haptics", value)}
            disabled={!controls.presenceActive}
          />
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>VISUAL & AR</ThemedText>
          <ControlToggle
            label="Camera Access"
            description="Allow AR presence detection"
            value={controls.camera}
            onValueChange={(value) => updateControl("camera", value)}
            disabled={!controls.presenceActive}
          />
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>LOCATION</ThemedText>
          <ControlToggle
            label="Location Awareness"
            description="Adapt behavior to your location"
            value={controls.location}
            onValueChange={(value) => updateControl("location", value)}
            disabled={!controls.presenceActive}
          />
          <ControlToggle
            label="Public Space Behavior"
            description="Reduce activity in public places"
            value={controls.publicSpaceBehavior}
            onValueChange={(value) => updateControl("publicSpaceBehavior", value)}
            disabled={!controls.presenceActive || !controls.location}
          />
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>SAFETY</ThemedText>
          <Pressable
            style={styles.actionButton}
            onPress={handlePausePress}
            disabled={!controls.presenceActive}
          >
            <ThemedText style={styles.actionButtonText}>
              Pause for 24 Hours
            </ThemedText>
          </Pressable>

          <Pressable style={styles.actionButton} onPress={handleClearEvidence}>
            <ThemedText style={styles.actionButtonText}>
              Clear All Evidence
            </ThemedText>
          </Pressable>

          <Pressable
            style={[styles.actionButton, styles.destructiveButton]}
            onPress={handleRemovePresence}
          >
            <ThemedText
              style={[styles.actionButtonText, styles.destructiveText]}
            >
              Remove Presence
            </ThemedText>
          </Pressable>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.aboutText}>LINGR v1.0.0</ThemedText>
          <ThemedText style={styles.aboutText}>
            An ambient presence experience
          </ThemedText>
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
    paddingHorizontal: Spacing.xl,
  },
  section: {
    gap: Spacing.md,
    paddingVertical: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.caption.fontSize,
    fontWeight: Typography.caption.fontWeight,
    color: Colors.dark.dimmed,
    letterSpacing: Typography.caption.letterSpacing,
    marginBottom: Spacing.sm,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.dark.border,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    paddingVertical: Spacing.md,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.dark.accent,
  },
  statusDotInactive: {
    backgroundColor: Colors.dark.dimmed,
  },
  statusText: {
    fontSize: Typography.caption.fontSize,
    fontWeight: Typography.caption.fontWeight,
    color: Colors.dark.accent,
    letterSpacing: Typography.caption.letterSpacing,
  },
  statusTextInactive: {
    color: Colors.dark.dimmed,
  },
  actionButton: {
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    backgroundColor: Colors.dark.backgroundSecondary,
    borderRadius: BorderRadius.xs,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    alignItems: "center",
  },
  actionButtonText: {
    fontSize: Typography.body.fontSize,
    fontWeight: "500",
  },
  destructiveButton: {
    borderColor: Colors.dark.warning,
  },
  destructiveText: {
    color: Colors.dark.warning,
  },
  aboutText: {
    fontSize: Typography.caption.fontSize,
    color: Colors.dark.dimmed,
    textAlign: "center",
  },
});
