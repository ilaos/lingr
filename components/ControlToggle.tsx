import React from "react";
import { View, Switch, StyleSheet, Pressable } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { Colors, Spacing } from "@/constants/theme";

interface ControlToggleProps {
  label: string;
  description?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
}

export function ControlToggle({
  label,
  description,
  value,
  onValueChange,
  disabled = false,
}: ControlToggleProps) {
  return (
    <Pressable
      style={styles.container}
      onPress={() => !disabled && onValueChange(!value)}
      disabled={disabled}
    >
      <View style={styles.textContainer}>
        <ThemedText style={styles.label}>{label}</ThemedText>
        {description ? (
          <ThemedText style={styles.description}>{description}</ThemedText>
        ) : null}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{
          false: Colors.dark.border,
          true: Colors.dark.accent,
        }}
        thumbColor={Colors.dark.text}
        ios_backgroundColor={Colors.dark.border}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing.md,
    gap: Spacing.lg,
  },
  textContainer: {
    flex: 1,
    gap: Spacing.xs,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
  },
  description: {
    fontSize: 13,
    color: Colors.dark.dimmed,
  },
});
