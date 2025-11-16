import React, { useState, useRef } from "react";
import { View, StyleSheet, Platform } from "react-native";
import { CameraView as ExpoCameraView, useCameraPermissions } from "expo-camera";
import { ThemedText } from "./ThemedText";
import { Colors, Spacing } from "@/constants/theme";

interface CameraViewProps {
  isActive: boolean;
  cameraEnabled: boolean;
}

export function CameraView({ isActive, cameraEnabled }: CameraViewProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef(null);

  if (!cameraEnabled) {
    return (
      <View style={styles.fallback}>
        <ThemedText style={styles.fallbackText}>Camera disabled</ThemedText>
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

  if (Platform.OS === "web") {
    return (
      <View style={styles.fallback}>
        <ThemedText style={styles.fallbackText}>
          Camera not available on web
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
  },
  fallbackText: {
    fontSize: 14,
    color: Colors.dark.dimmed,
    textAlign: "center",
    marginBottom: Spacing.md,
  },
  fallbackLink: {
    fontSize: 14,
    color: Colors.dark.accent,
    textAlign: "center",
    textDecorationLine: "underline",
  },
});
