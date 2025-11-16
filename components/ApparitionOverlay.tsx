import React, { useEffect } from "react";
import { StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  runOnJS,
} from "react-native-reanimated";
import { Colors } from "@/constants/theme";

interface ApparitionOverlayProps {
  visible: boolean;
  duration: number;
  onComplete: () => void;
}

export function ApparitionOverlay({
  visible,
  duration,
  onComplete,
}: ApparitionOverlayProps) {
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      opacity.value = withSequence(
        withTiming(0.4, { duration: 50 }),
        withTiming(0.2, { duration: duration * 0.7 }),
        withTiming(0, { duration: duration * 0.3 }, () => {
          runOnJS(onComplete)();
        })
      );
    } else {
      opacity.value = 0;
    }
  }, [visible, duration]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  if (!visible) return null;

  return (
    <Animated.View
      style={[styles.overlay, animatedStyle]}
      pointerEvents="none"
    />
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.dark.accent,
  },
});
