import React from "react";
import { View, StyleSheet } from "react-native";
import Animated, {
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { Colors, BorderRadius, Spacing } from "@/constants/theme";

interface ActivityMeterProps {
  intensity: number;
}

export function ActivityMeter({ intensity }: ActivityMeterProps) {
  const animatedStyle = useAnimatedStyle(() => ({
    width: withSpring(`${Math.max(5, intensity * 100)}%`, {
      damping: 10,
      stiffness: 100,
    }),
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.fill, animatedStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 8,
    backgroundColor: Colors.dark.backgroundSecondary,
    borderRadius: BorderRadius.xs,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  fill: {
    height: "100%",
    backgroundColor: Colors.dark.accent,
    borderRadius: BorderRadius.xs,
    shadowColor: Colors.dark.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
});
