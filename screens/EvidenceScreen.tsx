import React from "react";
import { View, StyleSheet, FlatList, Image, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedText } from "@/components/ThemedText";
import { EvidenceCard, EvidenceType } from "@/components/EvidenceCard";
import { BackgroundGrain } from "@/components/BackgroundGrain";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Colors, Spacing, Typography, BorderRadius } from "@/constants/theme";
import { useEvidenceState } from "@/hooks/useEvidenceState";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

type FilterType = "all" | "capture" | "message" | "anomaly";

function VoidParticle({ delay }: { delay: number }) {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0.3);

  React.useEffect(() => {
    translateY.value = withRepeat(
      withSequence(
        withTiming(-20, { duration: 3000 + delay * 100 }),
        withTiming(20, { duration: 3000 + delay * 100 })
      ),
      -1,
      false
    );

    opacity.value = withRepeat(
      withSequence(
        withTiming(0.1, { duration: 2000 + delay * 50 }),
        withTiming(0.4, { duration: 2000 + delay * 50 })
      ),
      -1,
      false
    );
  }, [delay]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          left: `${Math.random() * 80 + 10}%`,
          top: `${Math.random() * 80 + 10}%`,
        },
        animatedStyle,
      ]}
    />
  );
}

export default function EvidenceScreen() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const { evidence } = useEvidenceState();
  const [filter, setFilter] = React.useState<FilterType>("all");

  const filteredEvidence =
    filter === "all"
      ? evidence
      : evidence.filter((item) => item.type === filter);

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      {[...Array(8)].map((_, i) => (
        <VoidParticle key={i} delay={i} />
      ))}
      <Image
        source={require("../assets/images/evidence-empty.png")}
        style={styles.emptyImage}
        resizeMode="contain"
      />
      <ThemedText style={styles.emptyText}>
        No evidence captured... yet
      </ThemedText>
      <ThemedText style={styles.emptyHint}>
        Use the Detector to capture presence manifestations
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

  const FilterButton = ({
    label,
    value,
  }: {
    label: string;
    value: FilterType;
  }) => (
    <Pressable
      style={[styles.filterButton, filter === value && styles.filterButtonActive]}
      onPress={() => setFilter(value)}
    >
      <ThemedText
        style={[
          styles.filterButtonText,
          filter === value && styles.filterButtonTextActive,
        ]}
      >
        {label}
      </ThemedText>
    </Pressable>
  );

  return (
    <View style={styles.root}>
      <BackgroundGrain />
      <View style={styles.container}>
        <View style={[styles.filterContainer, { paddingTop: insets.top + 60 }]}>
          <FilterButton label="ALL" value="all" />
          <FilterButton label="AR" value="capture" />
          <FilterButton label="MESSAGES" value="message" />
          <FilterButton label="ANOMALY" value="anomaly" />
        </View>

        <FlatList
          data={filteredEvidence}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={[
            styles.listContent,
            {
              paddingTop: Spacing.lg,
              paddingBottom: tabBarHeight + Spacing.xl,
            },
          ]}
          columnWrapperStyle={filteredEvidence.length > 0 ? styles.row : undefined}
          ListEmptyComponent={renderEmpty}
        />
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
  filterContainer: {
    flexDirection: "row",
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    gap: Spacing.sm,
  },
  filterButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.xs,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    backgroundColor: Colors.dark.backgroundSecondary,
  },
  filterButtonActive: {
    borderColor: Colors.dark.accent,
    backgroundColor: Colors.dark.backgroundTertiary,
  },
  filterButtonText: {
    fontSize: 11,
    fontWeight: "600",
    color: Colors.dark.dimmed,
    letterSpacing: 1,
  },
  filterButtonTextActive: {
    color: Colors.dark.accent,
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
    gap: Spacing.md,
    position: "relative",
  },
  particle: {
    position: "absolute",
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.dark.accent,
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
  emptyHint: {
    fontSize: Typography.caption.fontSize,
    color: Colors.dark.dimmed,
    textAlign: "center",
    opacity: 0.6,
  },
});
