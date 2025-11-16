import React from "react";
import { Pressable, StyleSheet, ViewStyle } from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
} from "react-native-reanimated";
import { Colors, Shadows } from "@/constants/theme";

interface FloatingButtonProps {
  icon: keyof typeof Feather.glyphMap;
  onPress: () => void;
  active?: boolean;
  style?: ViewStyle;
}

export function FloatingButton({
  icon,
  onPress,
  active = false,
  style,
}: FloatingButtonProps) {
  const scale = useSharedValue(1);
  const pulseScale = useSharedValue(1);

  React.useEffect(() => {
    if (active) {
      pulseScale.value = withRepeat(
        withSequence(
          withSpring(1.1, { damping: 2, stiffness: 100 }),
          withSpring(1, { damping: 2, stiffness: 100 })
        ),
        -1,
        false
      );
    } else {
      pulseScale.value = withSpring(1);
    }
  }, [active]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value * pulseScale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 10, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 10, stiffness: 400 });
  };

  return (
    <Animated.View style={[styles.container, animatedStyle, style]}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[styles.button, active && styles.activeButton]}
      >
        <Feather
          name={icon}
          size={28}
          color={active ? Colors.dark.accent : Colors.dark.text}
        />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 64,
    height: 64,
  },
  button: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.dark.backgroundSecondary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.dark.border,
    ...Shadows.floating,
  },
  activeButton: {
    backgroundColor: Colors.dark.backgroundTertiary,
    ...Shadows.glow,
  },
});
