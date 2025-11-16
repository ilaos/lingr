import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { ScreenScrollView } from "@/components/ScreenScrollView";
import { ThemedText } from "@/components/ThemedText";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { Colors, Spacing, Typography, BorderRadius, Shadows } from "@/constants/theme";

interface Episode {
  id: string;
  number: number;
  title: string;
  status: "locked" | "available" | "completed";
  description: string;
}

const EPISODES: Episode[] = [
  {
    id: "1",
    number: 1,
    title: "First Contact",
    status: "available",
    description: "Something has attached itself to your device...",
  },
  {
    id: "2",
    number: 2,
    title: "The Watcher",
    status: "locked",
    description: "It knows when you're watching back.",
  },
  {
    id: "3",
    number: 3,
    title: "Echoes",
    status: "locked",
    description: "Fragments of something that was never alive.",
  },
];

function EpisodeCard({ episode }: { episode: Episode }) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePressIn = () => {
    if (episode.status === "available") {
      scale.value = withSpring(0.98, { damping: 10, stiffness: 400 });
      opacity.value = withSpring(0.85, { damping: 10, stiffness: 400 });
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 10, stiffness: 400 });
    opacity.value = withSpring(1, { damping: 10, stiffness: 400 });
  };

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPress={() => {}}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={episode.status === "locked"}
        style={[
          styles.card,
          episode.status === "locked" && styles.lockedCard,
        ]}
      >
        <View style={styles.cardHeader}>
          <View style={styles.numberContainer}>
            <ThemedText style={styles.episodeNumber}>
              {String(episode.number).padStart(2, "0")}
            </ThemedText>
          </View>
          <View style={styles.statusBadge}>
            {episode.status === "locked" ? (
              <Feather name="lock" size={14} color={Colors.dark.dimmed} />
            ) : episode.status === "completed" ? (
              <Feather name="check" size={14} color={Colors.dark.success} />
            ) : (
              <Feather name="unlock" size={14} color={Colors.dark.accent} />
            )}
          </View>
        </View>

        <ThemedText style={styles.episodeTitle}>{episode.title}</ThemedText>
        <ThemedText
          style={[
            styles.episodeDescription,
            episode.status === "locked" && styles.lockedText,
          ]}
        >
          {episode.description}
        </ThemedText>
      </Pressable>
    </Animated.View>
  );
}

export default function EpisodesScreen() {
  return (
    <ScreenScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.headerTitle}>HAUNTS</ThemedText>
        <ThemedText style={styles.headerSubtitle}>
          Episodic manifestations
        </ThemedText>
      </View>

      <View style={styles.episodeList}>
        {EPISODES.map((episode) => (
          <EpisodeCard key={episode.id} episode={episode} />
        ))}
      </View>
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.xl,
  },
  header: {
    paddingVertical: Spacing["2xl"],
    gap: Spacing.sm,
  },
  headerTitle: {
    fontSize: Typography.title.fontSize,
    fontWeight: Typography.title.fontWeight,
    letterSpacing: Typography.title.letterSpacing,
    textAlign: "center",
  },
  headerSubtitle: {
    fontSize: Typography.caption.fontSize,
    color: Colors.dark.dimmed,
    textAlign: "center",
    letterSpacing: Typography.caption.letterSpacing,
  },
  episodeList: {
    gap: Spacing.lg,
    paddingBottom: Spacing["2xl"],
  },
  card: {
    backgroundColor: Colors.dark.backgroundSecondary,
    borderRadius: BorderRadius.xs,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    padding: Spacing.lg,
    gap: Spacing.md,
    ...Shadows.soft,
  },
  lockedCard: {
    opacity: 0.5,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  numberContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.dark.backgroundTertiary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  episodeNumber: {
    fontSize: 16,
    fontWeight: "700",
    fontFamily: "monospace",
    color: Colors.dark.accent,
  },
  statusBadge: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  episodeTitle: {
    fontSize: Typography.heading.fontSize,
    fontWeight: Typography.heading.fontWeight,
    letterSpacing: Typography.heading.letterSpacing,
  },
  episodeDescription: {
    fontSize: Typography.body.fontSize,
    color: Colors.dark.dimmed,
    fontStyle: "italic",
  },
  lockedText: {
    opacity: 0.6,
  },
});
