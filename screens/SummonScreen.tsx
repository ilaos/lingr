import React, { useState, useEffect, useRef } from "react";
import {
  View,
  TextInput,
  Pressable,
  StyleSheet,
  Platform,
  ScrollView,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { ThemedText } from "@/components/ThemedText";
import { ScreenKeyboardAwareScrollView } from "@/components/ScreenKeyboardAwareScrollView";
import { Colors, Spacing } from "@/constants/theme";
import { summonEngine, type SummonExchange } from "@/data/summonEngine";
import { entityEngine } from "@/data/entityEngine";
import { evidenceStore } from "@/data/evidence";
import { MoodType } from "@/components/EntityMood";

const theme = Colors.dark;
const fontMono = { fontFamily: "monospace" };

const MOOD_SUBTITLES: Record<MoodType, string> = {
  dormant: "It is quiet, but listening.",
  restless: "It shifts when you speak.",
  active: "It answers quickly now.",
  agitated: "Careful what you ask.",
};

export function SummonScreen() {
  const [exchanges, setExchanges] = useState<SummonExchange[]>([]);
  const [inputText, setInputText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [mood, setMood] = useState<MoodType>(entityEngine.getMood());
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    const loadExchanges = async () => {
      await summonEngine.initialize();
      setExchanges(summonEngine.getExchanges());
    };

    loadExchanges();

    const moodInterval = setInterval(() => {
      setMood(entityEngine.getMood());
    }, 2000);

    return () => clearInterval(moodInterval);
  }, []);

  const handleSend = async () => {
    if (!inputText.trim() || isProcessing) return;

    const userMessage = inputText.trim();
    setInputText("");
    setIsProcessing(true);

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const response = summonEngine.processMessage(userMessage);

    setTimeout(async () => {
      if (response) {
        if (response.shouldCreateEvidence) {
          evidenceStore.addEvidence("message", response.responseText, {
            source: "summoning",
            intent: response.intent,
          });
        }

        const updatedExchanges = summonEngine.getExchanges();
        setExchanges(updatedExchanges);

        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }

      setIsProcessing(false);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }, Math.random() * 500 + 300);
  };

  const handleMicPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <ScreenKeyboardAwareScrollView
      ref={scrollViewRef}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.header}>
        <ThemedText style={styles.title}>Summoning Channel</ThemedText>
        <ThemedText style={styles.subtitle}>{MOOD_SUBTITLES[mood]}</ThemedText>
      </View>

      <View style={styles.conversationContainer}>
        {exchanges.length === 0 ? (
          <View style={styles.emptyContainer}>
            <ThemedText style={styles.emptyText}>
              Ask it something...
            </ThemedText>
          </View>
        ) : (
          exchanges.map((exchange) => (
            <View key={exchange.id} style={styles.exchangeContainer}>
              <View style={styles.userMessageContainer}>
                <ThemedText style={styles.userMessage}>
                  {exchange.userMessage}
                </ThemedText>
              </View>
              <View style={styles.lingrMessageContainer}>
                <ThemedText style={styles.lingrMessage}>
                  {exchange.lingrResponse}
                </ThemedText>
              </View>
            </View>
          ))
        )}
      </View>

      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Ask it something..."
            placeholderTextColor={theme.dimmed}
            onSubmitEditing={handleSend}
            returnKeyType="send"
            editable={!isProcessing}
          />
          <Pressable
            onPress={handleMicPress}
            style={styles.micButton}
            hitSlop={8}
          >
            <Feather name="mic" size={18} color={theme.dimmed} />
          </Pressable>
        </View>
        <Pressable
          onPress={handleSend}
          style={[
            styles.sendButton,
            (!inputText.trim() || isProcessing) && styles.sendButtonDisabled,
          ]}
          disabled={!inputText.trim() || isProcessing}
        >
          <Feather
            name="send"
            size={18}
            color={
              !inputText.trim() || isProcessing
                ? theme.dimmed
                : theme.text
            }
          />
        </Pressable>
      </View>
    </ScreenKeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: theme.backgroundDefault,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  title: {
    ...fontMono,
    fontSize: 16,
    letterSpacing: 2,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    ...fontMono,
    fontSize: 11,
    color: theme.dimmed,
    letterSpacing: 1,
  },
  conversationContainer: {
    flex: 1,
    padding: Spacing.lg,
  },
  emptyContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: Spacing["5xl"],
    minHeight: 300,
  },
  emptyText: {
    ...fontMono,
    fontSize: 13,
    color: theme.dimmed,
    letterSpacing: 1,
  },
  exchangeContainer: {
    marginBottom: Spacing.lg,
  },
  userMessageContainer: {
    alignSelf: "flex-end",
    maxWidth: "80%",
    backgroundColor: theme.backgroundSecondary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  userMessage: {
    ...fontMono,
    fontSize: 13,
    lineHeight: 20,
    color: theme.dimmed,
  },
  lingrMessageContainer: {
    alignSelf: "flex-start",
    maxWidth: "80%",
    backgroundColor: "transparent",
    borderLeftWidth: 2,
    borderLeftColor: theme.accent,
    paddingLeft: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  lingrMessage: {
    ...fontMono,
    fontSize: 13,
    lineHeight: 20,
    letterSpacing: 1.5,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.border,
    backgroundColor: theme.backgroundDefault,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.backgroundSecondary,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: theme.border,
    paddingHorizontal: Spacing.md,
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    ...fontMono,
    fontSize: 13,
    color: theme.text,
    paddingVertical: Spacing.sm,
    letterSpacing: 0.5,
  },
  micButton: {
    padding: Spacing.xs,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.backgroundSecondary,
    borderWidth: 1,
    borderColor: theme.border,
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});
