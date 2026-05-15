import { useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { colors } from '../../design/colors';
import { typography } from '../../design/typography';
import { spacing } from '../../design/spacing';
import { useAppStore } from '../../lib/storage/store';
import { prefilter } from '../../lib/crisis/prefilter';

const MAX_LENGTH = 2000;
const MIN_LENGTH = 10;

export default function TriageScreen() {
  const [text, setText] = useState('');
  const setIntakeFreeText = useAppStore((s) => s.setIntakeFreeText);

  const canContinue = text.trim().length >= MIN_LENGTH;
  const charsRemaining = MAX_LENGTH - text.length;

  const handleContinue = () => {
    if (!canContinue) return;
    Haptics.selectionAsync();

    // Layer 1: deterministic prefilter — runs locally, never reaches Claude
    const filterResult = prefilter(text);
    if (filterResult.triggered) {
      // Don't store the text; route immediately to crisis resources
      router.replace('/resources');
      return;
    }

    // Store the text for Week 2 /triage call
    setIntakeFreeText(text.trim());

    // TODO Week 2: POST to /triage endpoint with text + demographics,
    // route based on Claude's recommendedScreeners (or crisisFlag).
    // For now, route directly to AQ-10 (the only Phase 1 path).
    router.replace('/aq-10');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.kav}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.title}>What brings you to Inkling today?</Text>
            <Text style={styles.subhead}>
              In your own words. A sentence or a paragraph — whatever feels right. This helps Inkling suggest the right screening instruments for what you're noticing.
            </Text>
          </View>

          <TextInput
            style={styles.input}
            multiline
            placeholder="Start typing..."
            placeholderTextColor={colors.light.inkSoft}
            value={text}
            onChangeText={setText}
            maxLength={MAX_LENGTH}
            textAlignVertical="top"
            autoFocus
          />

          <Text style={styles.counter}>
            {text.trim().length < MIN_LENGTH
              ? 'A few sentences is plenty.'
              : `${charsRemaining} characters left`}
          </Text>
        </ScrollView>

        <View style={styles.footer}>
          <Pressable
            style={({ pressed }) => [
              styles.continueButton,
              !canContinue && styles.continueButtonDisabled,
              pressed && canContinue && styles.continueButtonPressed,
            ]}
            onPress={handleContinue}
            disabled={!canContinue}
          >
            <Text
              style={[
                styles.continueLabel,
                !canContinue && styles.continueLabelDisabled,
              ]}
            >
              Continue
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.light.paper, paddingHorizontal: spacing.l },
  kav: { flex: 1 },
  scrollContent: { paddingTop: spacing.xl, paddingBottom: spacing.l, gap: spacing.l },
  header: { gap: spacing.s },
  title: { ...typography.headline, color: colors.light.ink, fontSize: 26 },
  subhead: { ...typography.body, color: colors.light.inkSoft, lineHeight: 24 },
  input: {
    minHeight: 180,
    backgroundColor: colors.light.paperDim,
    borderRadius: 12,
    padding: spacing.m,
    ...typography.body,
    color: colors.light.ink,
    borderWidth: 1,
    borderColor: colors.light.rule,
  },
  counter: { ...typography.caption, color: colors.light.inkSoft, textAlign: 'right' },
  footer: { paddingBottom: spacing.l, paddingTop: spacing.s },
  continueButton: {
    backgroundColor: colors.light.ink,
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.xl,
    borderRadius: 999,
    alignItems: 'center',
  },
  continueButtonDisabled: { backgroundColor: colors.light.rule },
  continueButtonPressed: { opacity: 0.85 },
  continueLabel: { ...typography.body, color: colors.light.paper, fontWeight: '500' },
  continueLabelDisabled: { color: colors.light.inkSoft },
});
