import React, { useState, useRef } from "react";
import { View, StyleSheet, Platform } from "react-native";
import { ThemedText } from "./ThemedText";
import { Colors, Spacing } from "@/constants/theme";

interface CameraViewProps {
  isActive: boolean;
  cameraEnabled: boolean;
}

export function CameraView({ isActive, cameraEnabled }: CameraViewProps) {
  if (Platform.OS === "web") {
    return (
      <View style={styles.fallback}>
        <ThemedText style={styles.fallbackText}>
          Camera not available on web
        </ThemedText>
        <ThemedText style={styles.fallbackHint}>
          Use Expo Go on a mobile device for AR detection
        </ThemedText>
      </View>
    );
  }

  const { CameraView: ExpoCameraView, useCameraPermissions } = require("expo-camera");
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef(null);

  if (!cameraEnabled) {
    return (
      <View style={styles.fallback}>
        <ThemedText style={styles.fallbackText}>Camera disabled</ThemedText>
        <ThemedText style={styles.fallbackHint}>
          Enable in Control settings
        </ThemedText>
      </View>
    );
  }

  if (!permission) {
    return (
      <View style={styles.fallback}>
        <ThemedText style={styles.fallbackText}>Loading camera...</ThemedText>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.fallback}>
        <ThemedText style={styles.fallbackText}>
          Camera access required for AR detection
        </ThemedText>
        <ThemedText
          style={styles.fallbackLink}
          onPress={requestPermission}
        >
          Grant Permission
        </ThemedText>
      </View>
    );
  }

  return (
    <ExpoCameraView
      ref={cameraRef}
      style={styles.camera}
      facing="back"
      animateShutter={false}
    />
  );
}

const styles = StyleSheet.create({
  camera: {
    ...StyleSheet.absoluteFillObject,
  },
  fallback: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#000000",
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  fallbackText: {
    fontSize: 14,
    color: Colors.dark.dimmed,
    textAlign: "center",
  },
  fallbackHint: {
    fontSize: 12,
    color: Colors.dark.dimmed,
    textAlign: "center",
    opacity: 0.6,
  },
  fallbackLink: {
    fontSize: 14,
    color: Colors.dark.accent,
    textAlign: "center",
    textDecorationLine: "underline",
    marginTop: Spacing.md,
  },
});
