import React from "react";
import { View, StyleSheet, FlatList, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedText } from "@/components/ThemedText";
import { EvidenceCard, EvidenceType } from "@/components/EvidenceCard";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Colors, Spacing, Typography } from "@/constants/theme";
import { useEvidenceState } from "@/hooks/useEvidenceState";

export default function EvidenceScreen() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const { evidence } = useEvidenceState();

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Image
        source={require("../assets/images/evidence-empty.png")}
        style={styles.emptyImage}
        resizeMode="contain"
      />
      <ThemedText style={styles.emptyText}>
        No evidence captured... yet
      </ThemedText>
    </View>
  );

  const renderItem = ({ item }: { item: typeof evidence[0] }) => (
    <EvidenceCard
      type={item.type}
      timestamp={item.timestamp}
      thumbnail={item.thumbnail}
      onPress={() => {}}
    />
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={evidence}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={[
          styles.listContent,
          {
            paddingTop: Spacing.xl,
            paddingBottom: tabBarHeight + Spacing.xl,
          },
        ]}
        columnWrapperStyle={styles.row}
        ListEmptyComponent={renderEmpty}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.backgroundRoot,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
  },
  row: {
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing["5xl"],
    gap: Spacing.xl,
  },
  emptyImage: {
    width: 120,
    height: 120,
    opacity: 0.4,
  },
  emptyText: {
    fontSize: Typography.body.fontSize,
    color: Colors.dark.dimmed,
    textAlign: "center",
  },
});
