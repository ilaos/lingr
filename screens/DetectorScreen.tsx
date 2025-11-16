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
} from "react-native-reanimated";
import { ThemedText } from "@/components/ThemedText";
import { FloatingButton } from "@/components/FloatingButton";
import { Colors, Spacing, Typography } from "@/constants/theme";
import { useDetectorState } from "@/hooks/useDetectorState";

export default function DetectorScreen() {
  const insets = useSafeAreaInsets();
  const { isScanning, isPresenceDetected, startScan, stopScan, capture } =
    useDetectorState();

  const scanLineY = useSharedValue(0);

  React.useEffect(() => {
    if (isScanning) {
      scanLineY.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 2000 }),
          withTiming(0, { duration: 2000 })
        ),
        -1,
        false
      );
    }
  }, [isScanning]);

  const scanLineStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: scanLineY.value * 400 }],
  }));

  const handleToggleScan = () => {
    if (isScanning) {
      stopScan();
    } else {
      startScan();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.cameraPlaceholder}>
        <View style={styles.reticle}>
          <View style={styles.reticleCorner} />
          <View style={[styles.reticleCorner, styles.reticleTopRight]} />
          <View style={[styles.reticleCorner, styles.reticleBottomLeft]} />
          <View style={[styles.reticleCorner, styles.reticleBottomRight]} />
        </View>

        {isScanning ? (
          <Animated.View style={[styles.scanLine, scanLineStyle]} />
        ) : null}

        <View style={[styles.topOverlay, { paddingTop: insets.top + Spacing.xl }]}>
          <ThemedText style={styles.scanningText}>
            {isScanning
              ? isPresenceDetected
                ? "PRESENCE DETECTED"
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
  );
}

const styles = StyleSheet.create({
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
    width: 200,
    height: 200,
    position: "relative",
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
  scanLine: {
    position: "absolute",
    width: 200,
    height: 2,
    backgroundColor: Colors.dark.accent,
    opacity: 0.8,
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
    letterSpacing: 2,
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
