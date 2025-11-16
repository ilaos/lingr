import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { ThemedText } from "@/components/ThemedText";
import { FloatingButton } from "@/components/FloatingButton";
import { BackgroundGrain } from "@/components/BackgroundGrain";
import { Colors, Spacing, Typography } from "@/constants/theme";
import { useDetectorState } from "@/hooks/useDetectorState";

export default function DetectorScreen() {
  const insets = useSafeAreaInsets();
  const { isScanning, isPresenceDetected, startScan, stopScan, capture } =
    useDetectorState();

  const scanLineY = useSharedValue(0);
  const distortionOpacity = useSharedValue(0);
  const reticleScale = useSharedValue(1);
  const flickerOpacity = useSharedValue(0);

  React.useEffect(() => {
    if (isScanning) {
      scanLineY.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 2500, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      );

      distortionOpacity.value = withRepeat(
        withSequence(
          withTiming(0.1, { duration: 1000 }),
          withTiming(0, { duration: 1000 })
        ),
        -1,
        false
      );
    } else {
      scanLineY.value = withTiming(0);
      distortionOpacity.value = withTiming(0);
    }
  }, [isScanning]);

  React.useEffect(() => {
    if (isPresenceDetected) {
      reticleScale.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: 400 }),
          withTiming(1, { duration: 400 })
        ),
        -1,
        false
      );

      flickerOpacity.value = withRepeat(
        withSequence(
          withTiming(0.3, { duration: 100 }),
          withTiming(0, { duration: 100 }),
          withTiming(0.2, { duration: 150 }),
          withTiming(0, { duration: 300 })
        ),
        -1,
        false
      );
    } else {
      reticleScale.value = withTiming(1);
      flickerOpacity.value = withTiming(0);
    }
  }, [isPresenceDetected]);

  const scanLineStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: scanLineY.value * 500 }],
  }));

  const distortionStyle = useAnimatedStyle(() => ({
    opacity: distortionOpacity.value,
  }));

  const reticleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: reticleScale.value }],
  }));

  const flickerStyle = useAnimatedStyle(() => ({
    opacity: flickerOpacity.value,
  }));

  const handleToggleScan = () => {
    if (isScanning) {
      stopScan();
    } else {
      startScan();
    }
  };

  return (
    <View style={styles.root}>
      <BackgroundGrain />
      <View style={styles.container}>
        <View style={styles.cameraPlaceholder}>
          {isPresenceDetected ? (
            <Animated.View style={[styles.flicker, flickerStyle]} />
          ) : null}

          {isScanning ? (
            <Animated.View style={[styles.distortion, distortionStyle]} />
          ) : null}

          <Animated.View style={[styles.reticle, reticleStyle]}>
            <View
              style={[
                styles.reticleCorner,
                isPresenceDetected && styles.reticleCornerActive,
              ]}
            />
            <View
              style={[
                styles.reticleCorner,
                styles.reticleTopRight,
                isPresenceDetected && styles.reticleCornerActive,
              ]}
            />
            <View
              style={[
                styles.reticleCorner,
                styles.reticleBottomLeft,
                isPresenceDetected && styles.reticleCornerActive,
              ]}
            />
            <View
              style={[
                styles.reticleCorner,
                styles.reticleBottomRight,
                isPresenceDetected && styles.reticleCornerActive,
              ]}
            />
            {isPresenceDetected ? (
              <View style={styles.reticleCenter}>
                <Feather name="alert-circle" size={32} color={Colors.dark.warning} />
              </View>
            ) : null}
          </Animated.View>

          {isScanning ? (
            <Animated.View style={[styles.scanLine, scanLineStyle]} />
          ) : null}

          <View
            style={[styles.topOverlay, { paddingTop: insets.top + Spacing.xl }]}
          >
            <ThemedText
              style={[
                styles.scanningText,
                isPresenceDetected && styles.scanningTextAlert,
              ]}
            >
              {isScanning
                ? isPresenceDetected
                  ? "⚠ PRESENCE DETECTED"
                  : "SCANNING..."
                : "TAP TO SCAN"}
            </ThemedText>
          </View>

          <View style={styles.bottomOverlay}>
            <Pressable style={styles.closeButton} onPress={() => {}}>
              <Feather name="x" size={24} color={Colors.dark.text} />
            </Pressable>

            <FloatingButton
              icon="aperture"
              onPress={capture}
              active={isPresenceDetected}
            />

            <Pressable style={styles.toggleButton} onPress={handleToggleScan}>
              <Feather
                name={isScanning ? "pause" : "play"}
                size={20}
                color={Colors.dark.text}
              />
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.dark.backgroundRoot,
  },
  cameraPlaceholder: {
    flex: 1,
    backgroundColor: "#000000",
    alignItems: "center",
    justifyContent: "center",
  },
  reticle: {
    width: 220,
    height: 220,
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  reticleCorner: {
    position: "absolute",
    width: 40,
    height: 40,
    top: 0,
    left: 0,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderColor: Colors.dark.dimmed,
  },
  reticleCornerActive: {
    borderColor: Colors.dark.warning,
  },
  reticleTopRight: {
    left: undefined,
    right: 0,
    borderLeftWidth: 0,
    borderRightWidth: 2,
  },
  reticleBottomLeft: {
    top: undefined,
    bottom: 0,
    borderTopWidth: 0,
    borderBottomWidth: 2,
  },
  reticleBottomRight: {
    top: undefined,
    left: undefined,
    right: 0,
    bottom: 0,
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 2,
    borderBottomWidth: 2,
  },
  reticleCenter: {
    alignItems: "center",
    justifyContent: "center",
  },
  scanLine: {
    position: "absolute",
    width: 220,
    height: 2,
    backgroundColor: Colors.dark.accent,
    opacity: 0.6,
  },
  distortion: {
    position: "absolute",
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: Colors.dark.accent,
    opacity: 0.1,
  },
  flicker: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.dark.warning,
  },
  topOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  scanningText: {
    fontSize: Typography.caption.fontSize,
    fontWeight: Typography.caption.fontWeight,
    color: Colors.dark.accent,
    letterSpacing: Typography.caption.letterSpacing,
  },
  scanningTextAlert: {
    color: Colors.dark.warning,
  },
  bottomOverlay: {
    position: "absolute",
    bottom: Spacing["4xl"],
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing["3xl"],
  },
  closeButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  toggleButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
});
