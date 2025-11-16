import React from "react";
import { Pressable, StyleSheet, Image, View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { Colors, BorderRadius, Spacing } from "@/constants/theme";

export type EvidenceType = "capture" | "message" | "anomaly";

interface EvidenceCardProps {
  type: EvidenceType;
  timestamp: string;
  thumbnail?: string;
  onPress: () => void;
}

const EVIDENCE_ICONS: Record<EvidenceType, keyof typeof Feather.glyphMap> = {
  capture: "camera",
  message: "message-square",
  anomaly: "alert-triangle",
};

export function EvidenceCard({
  type,
  timestamp,
  thumbnail,
  onPress,
}: EvidenceCardProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 10, stiffness: 400 });
    opacity.value = withSpring(0.85, { damping: 10, stiffness: 400 });
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
        style={styles.container}
      >
        <View style={styles.thumbnailContainer}>
          {thumbnail ? (
            <Image source={{ uri: thumbnail }} style={styles.thumbnail} />
          ) : (
            <View style={styles.placeholderThumbnail}>
              <Feather
                name={EVIDENCE_ICONS[type]}
                size={32}
                color={Colors.dark.dimmed}
              />
            </View>
          )}
        </View>
        <View style={styles.footer}>
          <Feather
            name={EVIDENCE_ICONS[type]}
            size={14}
            color={Colors.dark.accent}
          />
          <ThemedText style={styles.timestamp}>{timestamp}</ThemedText>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.dark.backgroundDefault,
    borderRadius: BorderRadius.xs,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    overflow: "hidden",
  },
  thumbnailContainer: {
    aspectRatio: 1,
    width: "100%",
  },
  thumbnail: {
    width: "100%",
    height: "100%",
  },
  placeholderThumbnail: {
    width: "100%",
    height: "100%",
    backgroundColor: Colors.dark.backgroundSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.sm,
    gap: Spacing.xs,
  },
  timestamp: {
    fontSize: 11,
    color: Colors.dark.dimmed,
    fontFamily: "monospace",
  },
});
