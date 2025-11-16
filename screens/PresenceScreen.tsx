import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { ScreenScrollView } from "@/components/ScreenScrollView";
import { ThemedText } from "@/components/ThemedText";
import { PresenceVisual } from "@/components/PresenceVisual";
import { ActivityMeter } from "@/components/ActivityMeter";
import { EntityMood } from "@/components/EntityMood";
import { BackgroundGrain } from "@/components/BackgroundGrain";
import { Colors, Spacing, Typography } from "@/constants/theme";
import { usePresenceState } from "@/hooks/usePresenceState";
import { persistenceService, type AppMetadata } from "@/state/persistenceService";
import { evidenceStore } from "@/data/evidence";
import { environmentEngine, type EnvironmentMode } from "@/data/environmentEngine";
import { type PresenceStackParamList } from "@/navigation/PresenceStackNavigator";

function formatTimeSince(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ${hours % 24}h ago`;
  if (hours > 0) return `${hours}h ${minutes % 60}m ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return "moments ago";
}

function LastKnownStateCard({ metadata, currentMood }: { metadata: AppMetadata; currentMood: string }) {
  const now = Date.now();
  const timeSince = now - metadata.lastOpenedAt;
  const evidenceAdded = evidenceStore.getEvidenceCount() - metadata.lastEvidenceCount;
  const moodChanged = metadata.lastMood !== currentMood;

  if (timeSince < 60000) {
    return null;
  }

  let atmosphericMessage = "The air hasn't settled since you left.";
  if (moodChanged && currentMood === "agitated") {
    atmosphericMessage = "It grew restless in your absence.";
  } else if (moodChanged && currentMood === "dormant") {
    atmosphericMessage = "Something calmed while you were away.";
  } else if (evidenceAdded > 5) {
    atmosphericMessage = "Activity continued without witness.";
  } else if (timeSince > 86400000) {
    atmosphericMessage = "The presence lingered, waiting.";
  }

  return (
    <View style={styles.lastKnownCard}>
      <ThemedText style={styles.lastKnownTitle}>LAST KNOWN STATE</ThemedText>
      <View style={styles.lastKnownContent}>
        <View style={styles.lastKnownRow}>
          <ThemedText style={styles.lastKnownLabel}>Last activity</ThemedText>
          <ThemedText style={styles.lastKnownValue}>
            {formatTimeSince(timeSince)}
          </ThemedText>
        </View>

        {evidenceAdded > 0 ? (
          <View style={styles.lastKnownRow}>
            <ThemedText style={styles.lastKnownLabel}>Evidence added</ThemedText>
            <ThemedText style={styles.lastKnownValue}>+{evidenceAdded}</ThemedText>
          </View>
        ) : null}

        {moodChanged ? (
          <View style={styles.lastKnownRow}>
            <ThemedText style={styles.lastKnownLabel}>Mood changed</ThemedText>
            <ThemedText style={[styles.lastKnownValue, styles.lastKnownMood]}>
              {metadata.lastMood} → {currentMood}
            </ThemedText>
          </View>
        ) : null}

        <View style={styles.atmosphericMessageContainer}>
          <ThemedText style={styles.atmosphericMessage}>
            "{atmosphericMessage}"
          </ThemedText>
        </View>
      </View>
    </View>
  );
}

type PresenceScreenNavigationProp = NativeStackNavigationProp<
  PresenceStackParamList,
  "PresenceHome"
>;

const ENVIRONMENT_MESSAGES: Record<EnvironmentMode, string> = {
  HOME: "It knows this place well.",
  AWAY: "It follows quietly.",
  UNKNOWN: "It has not settled anywhere.",
};

export default function PresenceScreen() {
  const navigation = useNavigation<PresenceScreenNavigationProp>();
  const { entity, lastActivity, activityIntensity, mood } = usePresenceState();
  const [lastKnownState, setLastKnownState] = React.useState<AppMetadata | null>(null);
  const [environmentMode, setEnvironmentMode] = React.useState<EnvironmentMode>("UNKNOWN");

  React.useEffect(() => {
    const loadLastKnownState = async () => {
      const metadata = await persistenceService.loadAppMetadata();
      if (metadata) {
        setLastKnownState(metadata);
      }
    };

    loadLastKnownState();

    const updateEnvironment = () => {
      const envState = environmentEngine.getEnvironmentState();
      setEnvironmentMode(envState.mode);
    };

    updateEnvironment();
    const intervalId = setInterval(updateEnvironment, 5000);

    return () => clearInterval(intervalId);
  }, []);

  const handleAskLingr = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate("Summon");
  };

  return (
    <View style={styles.root}>
      <BackgroundGrain />
      <ScreenScrollView contentContainerStyle={styles.container}>
        <View style={styles.visualContainer}>
          <PresenceVisual intensity={activityIntensity} />
        </View>

        <View style={styles.infoContainer}>
          <ThemedText style={styles.entityName}>{entity.name}</ThemedText>

          <EntityMood
            mood={mood}
            intensity={activityIntensity}
            recentActivity={lastActivity}
          />

          <View style={styles.environmentIndicator}>
            <ThemedText style={styles.environmentText}>
              {ENVIRONMENT_MESSAGES[environmentMode]}
            </ThemedText>
          </View>

          <View style={styles.meterContainer}>
            <ThemedText style={styles.label}>PRESENCE STRENGTH</ThemedText>
            <ActivityMeter intensity={activityIntensity} />
          </View>

          <View style={styles.messageContainer}>
            <ThemedText style={styles.message}>{entity.message}</ThemedText>
          </View>

          {lastKnownState ? (
            <LastKnownStateCard metadata={lastKnownState} currentMood={mood} />
          ) : null}

          <Pressable style={styles.askLingrButton} onPress={handleAskLingr}>
            <Feather
              name="radio"
              size={16}
              color={Colors.dark.dimmed}
              style={styles.askLingrIcon}
            />
            <ThemedText style={styles.askLingrText}>ASK LINGR</ThemedText>
          </Pressable>
        </View>
      </ScreenScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  container: {
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing["4xl"],
  },
  visualContainer: {
    marginVertical: Spacing["3xl"],
    alignItems: "center",
  },
  infoContainer: {
    width: "100%",
    gap: Spacing["2xl"],
  },
  entityName: {
    fontSize: Typography.title.fontSize,
    fontWeight: Typography.title.fontWeight,
    letterSpacing: Typography.title.letterSpacing,
    textAlign: "center",
    textTransform: "uppercase",
  },
  label: {
    fontSize: Typography.caption.fontSize,
    fontWeight: Typography.caption.fontWeight,
    color: Colors.dark.dimmed,
    letterSpacing: Typography.caption.letterSpacing,
  },
  meterContainer: {
    gap: Spacing.sm,
  },
  messageContainer: {
    marginTop: Spacing.lg,
    padding: Spacing.lg,
    backgroundColor: Colors.dark.backgroundSecondary,
    borderRadius: 8,
    borderLeftWidth: 2,
    borderLeftColor: Colors.dark.accent,
  },
  message: {
    fontSize: Typography.body.fontSize,
    fontStyle: "italic",
    color: Colors.dark.text,
    lineHeight: 24,
  },
  lastKnownCard: {
    marginTop: Spacing["2xl"],
    padding: Spacing.lg,
    backgroundColor: Colors.dark.backgroundSecondary,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    gap: Spacing.md,
  },
  lastKnownTitle: {
    fontSize: Typography.caption.fontSize,
    fontWeight: Typography.caption.fontWeight,
    color: Colors.dark.dimmed,
    letterSpacing: Typography.caption.letterSpacing,
  },
  lastKnownContent: {
    gap: Spacing.sm,
  },
  lastKnownRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.xs,
  },
  lastKnownLabel: {
    fontSize: Typography.caption.fontSize,
    color: Colors.dark.dimmed,
  },
  lastKnownValue: {
    fontSize: Typography.caption.fontSize,
    color: Colors.dark.text,
    fontFamily: "monospace",
  },
  lastKnownMood: {
    color: Colors.dark.accent,
    textTransform: "uppercase",
  },
  atmosphericMessageContainer: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
  },
  atmosphericMessage: {
    fontSize: Typography.caption.fontSize,
    fontStyle: "italic",
    color: Colors.dark.dimmed,
    lineHeight: 18,
  },
  askLingrButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    backgroundColor: Colors.dark.backgroundSecondary,
    marginTop: Spacing.lg,
    alignSelf: "center",
  },
  askLingrIcon: {
    marginRight: Spacing.sm,
  },
  askLingrText: {
    fontFamily: "monospace",
    fontSize: 12,
    letterSpacing: 2,
    color: Colors.dark.dimmed,
  },
  environmentIndicator: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    borderRadius: 12,
    backgroundColor: `${Colors.dark.accent}10`,
    borderWidth: 1,
    borderColor: `${Colors.dark.accent}30`,
    alignSelf: "center",
  },
  environmentText: {
    fontSize: Typography.caption.fontSize - 1,
    color: Colors.dark.dimmed,
    fontStyle: "italic",
    letterSpacing: 0.5,
  },
});
