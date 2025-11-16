import React from "react";
import { View, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { ThemedText } from "@/components/ThemedText";
import { Colors, Spacing, Typography, Shadows } from "@/constants/theme";

export type MoodType = "dormant" | "restless" | "active" | "agitated";

interface EntityMoodProps {
  mood: MoodType;
  intensity: number;
  recentActivity: string;
}

const MOOD_LABELS: Record<MoodType, string> = {
  dormant: "DORMANT",
  restless: "RESTLESS",
  active: "ACTIVE",
  agitated: "AGITATED",
};

const MOOD_COLORS: Record<MoodType, string> = {
  dormant: Colors.dark.dimmed,
  restless: Colors.dark.accent,
  active: Colors.dark.success,
  agitated: Colors.dark.warning,
};

export function EntityMood({ mood, intensity, recentActivity }: EntityMoodProps) {
  const pulseOpacity = useSharedValue(1);

  React.useEffect(() => {
    pulseOpacity.value = withRepeat(
      withSequence(
        withTiming(0.6, { duration: 1500 }),
        withTiming(1, { duration: 1500 })
      ),
      -1,
      false
    );
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: pulseOpacity.value,
  }));

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <ThemedText style={styles.label}>MOOD</ThemedText>
        <View style={styles.moodContainer}>
          <Animated.View
            style={[
              styles.moodDot,
              { backgroundColor: MOOD_COLORS[mood] },
              pulseStyle,
            ]}
          />
          <ThemedText style={[styles.moodText, { color: MOOD_COLORS[mood] }]}>
            {MOOD_LABELS[mood]}
          </ThemedText>
        </View>
      </View>

      <View style={styles.row}>
        <ThemedText style={styles.label}>INTENSITY</ThemedText>
        <ThemedText style={styles.value}>
          {Math.round(intensity * 100)}%
        </ThemedText>
      </View>

      <View style={styles.row}>
        <ThemedText style={styles.label}>RECENT ACTIVITY</ThemedText>
        <ThemedText style={styles.timestamp}>{recentActivity}</ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.dark.backgroundSecondary,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    padding: Spacing.lg,
    gap: Spacing.md,
    ...Shadows.soft,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    fontSize: Typography.caption.fontSize,
    fontWeight: Typography.caption.fontWeight,
    color: Colors.dark.dimmed,
    letterSpacing: Typography.caption.letterSpacing,
  },
  moodContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  moodDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  moodText: {
    fontSize: Typography.caption.fontSize,
    fontWeight: Typography.caption.fontWeight,
    letterSpacing: Typography.caption.letterSpacing,
  },
  value: {
    fontSize: Typography.monospace.fontSize,
    fontFamily: "monospace",
    color: Colors.dark.accent,
  },
  timestamp: {
    fontSize: 11,
    fontFamily: "monospace",
    color: Colors.dark.dimmed,
  },
});
