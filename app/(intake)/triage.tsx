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
import { router } from 'expo-router';
import { colors } from '../../design/colors';
import { typography } from '../../design/typography';
import { spacing } from '../../design/spacing';
import { useAppStore } from '../../lib/storage/store';
import { prefilter } from '../../lib/crisis/prefilter';
import { tap } from '../../lib/haptics';
import { getAllPaths, type PathId } from '../../lib/paths';
import { getScreener } from '../../lib/scoring/loader';

import { CrisisAffordance } from '../../components/CrisisAffordance';
const MAX_LENGTH = 2000;
const MIN_LENGTH = 10;

export default function TriageScreen() {
  const storedText = useAppStore((s) => s.intakeFreeText);
  const [text, setText] = useState(storedText ?? '');
  const [pathId, setPathId] = useState<PathId | null>(null);

  const setIntakeFreeText = useAppStore((s) => s.setIntakeFreeText);
  const setSelectedPath = useAppStore((s) => s.setSelectedPath);
  const completedScreeners = useAppStore((s) => s.completedScreeners);

  const paths = getAllPaths();
  const textOk = text.trim().length >= MIN_LENGTH;
  const canContinue = textOk && pathId !== null;
  const charsRemaining = MAX_LENGTH - text.length;

  const handleSelectPath = (id: PathId) => {
    tap.selection();
    setPathId(id);
  };

  const handleContinue = () => {
    if (!canContinue || pathId === null) return;
    tap.commit();

    const filterResult = prefilter(text);
    if (filterResult.triggered) {
      router.push('/resources');
      return;
    }

    setIntakeFreeText(text.trim());
    setSelectedPath(pathId);

    const path = paths.find((p) => p.id === pathId);
    if (!path) return;

    const completedIds = new Set(completedScreeners.map((s) => s.screenerId));
    const nextScreenerId = path.screenerIds.find(
      (id) => !completedIds.has(id) && getScreener(id) !== undefined
    );

    if (nextScreenerId) {
      router.replace(`/${nextScreenerId}` as any);
    } else {
      router.replace('/interpretation');
    }
  };

  const handleGuidedTriage = () => {
    tap.selection();
    if (text.trim().length > 0) {
      setIntakeFreeText(text.trim());
    }
    router.push('/triage-guided');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <CrisisAffordance />
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
              In your own words. A sentence or a paragraph — whatever feels right. This helps Inkling understand the context behind what you are noticing.
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

          <View style={styles.rule} />

          <View style={styles.pathSection}>
            <Text style={styles.pathQuestion}>
              And which of these feels most relevant to you right now?
            </Text>
            <Text style={styles.pathHelp}>
              You can change paths later. Inkling can also screen for the others once you finish.
            </Text>
          </View>

          <View style={styles.pathCards}>
            {paths.map((path) => {
              const isSelected = pathId === path.id;
              return (
                <Pressable
                  key={path.id}
                  onPress={() => handleSelectPath(path.id)}
                  style={({ pressed }) => [
                    styles.pathCard,
                    isSelected && styles.pathCardSelected,
                    pressed && styles.pathCardPressed,
                  ]}
                >
                  <Text
                    style={[
                      styles.pathCardLabel,
                      isSelected && styles.pathCardLabelSelected,
                    ]}
                  >
                    {path.label}
                  </Text>
                  <Text
                    style={[
                      styles.pathCardDescription,
                      isSelected && styles.pathCardDescriptionSelected,
                    ]}
                  >
                    {path.shortDescription}
                  </Text>
                </Pressable>
              );
            })}
            <Pressable
              onPress={handleGuidedTriage}
              style={({ pressed }) => [styles.pathCard, pressed && styles.pathCardPressed]}
            >
              <Text style={styles.pathCardLabel}>Help me figure out where to start</Text>
              <Text style={styles.pathCardDescription}>
                A short guided check-in. No typing needed.
              </Text>
            </Pressable>
          </View>
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
    minHeight: 140,
    backgroundColor: colors.light.paperDim,
    borderRadius: 12,
    padding: spacing.m,
    ...typography.body,
    color: colors.light.ink,
    borderWidth: 1,
    borderColor: colors.light.rule,
  },
  counter: { ...typography.caption, color: colors.light.inkSoft, textAlign: 'right' },
  rule: {
    height: 1,
    backgroundColor: colors.light.rule,
    marginTop: spacing.l,
    marginBottom: spacing.s,
  },
  pathSection: { gap: spacing.xs },
  pathQuestion: {
    ...typography.headline,
    color: colors.light.ink,
    fontSize: 20,
    lineHeight: 28,
  },
  pathHelp: {
    ...typography.body,
    color: colors.light.inkSoft,
    lineHeight: 22,
    fontSize: 14,
  },
  pathCards: { gap: spacing.m, marginTop: spacing.s },
  pathCard: {
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.l,
    borderRadius: 12,
    backgroundColor: colors.light.paperDim,
    borderWidth: 1,
    borderColor: colors.light.rule,
    gap: spacing.xs,
  },
  pathCardSelected: {
    backgroundColor: colors.light.ink,
    borderColor: colors.light.ink,
  },
  pathCardPressed: { opacity: 0.85 },
  pathCardLabel: {
    ...typography.body,
    color: colors.light.ink,
    fontWeight: '500',
    fontSize: 17,
  },
  pathCardLabelSelected: { color: colors.light.paper },
  pathCardDescription: {
    ...typography.body,
    color: colors.light.inkSoft,
    fontSize: 14,
    lineHeight: 20,
  },
  pathCardDescriptionSelected: { color: colors.light.paperDim },
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
