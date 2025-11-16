import React from "react";
import { Image, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

interface PresenceVisualProps {
  intensity?: number;
}

export function PresenceVisual({ intensity = 0.5 }: PresenceVisualProps) {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0.85);

  React.useEffect(() => {
    translateY.value = withRepeat(
      withSequence(
        withTiming(-3, { duration: 4000 }),
        withTiming(3, { duration: 4000 })
      ),
      -1,
      false
    );

    opacity.value = withRepeat(
      withSequence(
        withTiming(0.85, { duration: 2000 }),
        withTiming(1.0, { duration: 2000 })
      ),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <Image
        source={require("../assets/images/entity-presence.png")}
        style={styles.image}
        resizeMode="contain"
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 300,
    height: 300,
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: "100%",
    height: "100%",
  },
});
