import React from "react";
import { View, StyleSheet, Pressable, Modal } from "react-native";
import { ScreenScrollView } from "@/components/ScreenScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/Button";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  Easing,
} from "react-native-reanimated";
import { Colors, Spacing, Typography, BorderRadius, Shadows } from "@/constants/theme";
import { Episode, episodeManager } from "@/data/episodes";
import { episodeEngine } from "@/data/episodeEngine";

function EpisodeCard({
  episode,
  isActive,
  onPress,
}: {
  episode: Episode;
  isActive: boolean;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const borderOpacity = useSharedValue(0.3);

  React.useEffect(() => {
    if (isActive) {
      borderOpacity.value = withRepeat(
        withSequence(
          withSpring(1, { damping: 10, stiffness: 100 }),
          withSpring(0.3, { damping: 10, stiffness: 100 })
        ),
        -1,
        false
      );
    } else {
      borderOpacity.value = withSpring(0.3, { damping: 10, stiffness: 100 });
    }
  }, [isActive]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const animatedBorderStyle = useAnimatedStyle(() => ({
    borderColor: isActive
      ? `rgba(139, 127, 245, ${borderOpacity.value})`
      : Colors.dark.border,
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
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={episode.status === "locked"}
      >
        <Animated.View
          style={[
            styles.card,
            animatedBorderStyle,
            episode.status === "locked" && styles.lockedCard,
            isActive && styles.activeCard,
          ]}
        >
          <View style={styles.cardHeader}>
            <View style={styles.numberContainer}>
              <ThemedText style={styles.episodeNumber}>
                {String(episode.number).padStart(2, "0")}
              </ThemedText>
            </View>
            <View style={styles.statusBadge}>
              {isActive ? (
                <View style={styles.activePill}>
                  <ThemedText style={styles.activePillText}>ACTIVE</ThemedText>
                </View>
              ) : episode.status === "locked" ? (
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
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

export default function EpisodesScreen() {
  const [episodes, setEpisodes] = React.useState<Episode[]>([]);
  const [selectedEpisode, setSelectedEpisode] = React.useState<Episode | null>(null);
  const [activeEpisodeId, setActiveEpisodeId] = React.useState<string | null>(null);

  React.useEffect(() => {
    setEpisodes(episodeManager.getEpisodes());
    const activeEpisode = episodeEngine.getActiveEpisode();
    setActiveEpisodeId(activeEpisode?.episodeId || null);
  }, []);

  const handleEpisodePress = (episode: Episode) => {
    if (episode.status === "available") {
      setSelectedEpisode(episode);
    }
  };

  const handleStartEpisode = () => {
    if (selectedEpisode) {
      const success = episodeEngine.startEpisode(selectedEpisode.id);
      if (success) {
        setActiveEpisodeId(selectedEpisode.id);
        setSelectedEpisode(null);
      }
    }
  };

  const handleCloseModal = () => {
    setSelectedEpisode(null);
  };

  return (
    <>
      <ScreenScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <ThemedText style={styles.headerTitle}>HAUNTS</ThemedText>
          <ThemedText style={styles.headerSubtitle}>
            Episodic manifestations
          </ThemedText>
        </View>

        <View style={styles.episodeList}>
          {episodes.map((episode) => (
            <EpisodeCard
              key={episode.id}
              episode={episode}
              isActive={activeEpisodeId === episode.id}
              onPress={() => handleEpisodePress(episode)}
            />
          ))}
        </View>
      </ScreenScrollView>

      <Modal
        visible={selectedEpisode !== null}
        transparent
        animationType="fade"
        onRequestClose={handleCloseModal}
      >
        <Pressable style={styles.modalOverlay} onPress={handleCloseModal}>
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>
                {selectedEpisode?.title}
              </ThemedText>
              <Pressable onPress={handleCloseModal} style={styles.closeButton}>
                <Feather name="x" size={24} color={Colors.dark.text} />
              </Pressable>
            </View>

            <ThemedText style={styles.modalDescription}>
              {selectedEpisode?.description}
            </ThemedText>

            {selectedEpisode?.teaser ? (
              <ThemedText style={styles.modalTeaser}>
                {selectedEpisode.teaser}
              </ThemedText>
            ) : null}

            <View style={styles.modalActions}>
              <Button
                title="Begin Episode"
                onPress={handleStartEpisode}
                variant="primary"
              />
              <Pressable onPress={handleCloseModal} style={styles.cancelButton}>
                <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
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
  activeCard: {
    borderWidth: 2,
  },
  activePill: {
    backgroundColor: Colors.dark.accent,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.xs,
  },
  activePillText: {
    fontSize: 10,
    fontWeight: "700",
    fontFamily: "monospace",
    letterSpacing: 1,
    color: Colors.dark.background,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
  },
  modalContent: {
    backgroundColor: Colors.dark.backgroundSecondary,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    padding: Spacing.xl,
    gap: Spacing.lg,
    width: "100%",
    maxWidth: 500,
    ...Shadows.medium,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  modalTitle: {
    fontSize: Typography.title.fontSize,
    fontWeight: Typography.title.fontWeight,
    letterSpacing: Typography.title.letterSpacing,
    flex: 1,
  },
  closeButton: {
    padding: Spacing.xs,
    marginRight: -Spacing.xs,
  },
  modalDescription: {
    fontSize: Typography.body.fontSize,
    color: Colors.dark.dimmed,
    fontStyle: "italic",
  },
  modalTeaser: {
    fontSize: Typography.caption.fontSize,
    color: Colors.dark.textSecondary,
    lineHeight: 20,
  },
  modalActions: {
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  cancelButton: {
    padding: Spacing.md,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: Typography.body.fontSize,
    color: Colors.dark.dimmed,
  },
});
