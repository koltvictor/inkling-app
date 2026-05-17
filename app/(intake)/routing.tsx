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
  ActivityIndicator,
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
import { classify, type Recommendation } from '../../lib/api/client';

const MAX_LENGTH = 2000;
const MIN_LENGTH = 10;

type Mode = 'input' | 'loading' | 'recommendations' | 'error';

export default function RoutingScreen() {
  const storedText = useAppStore((s) => s.intakeFreeText);
  const setIntakeFreeText = useAppStore((s) => s.setIntakeFreeText);
  const setSelectedPath = useAppStore((s) => s.setSelectedPath);
  const completedScreeners = useAppStore((s) => s.completedScreeners);

  const [text, setText] = useState(storedText ?? '');
  const [mode, setMode] = useState<Mode>('input');
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const paths = getAllPaths();
  const textOk = text.trim().length >= MIN_LENGTH;
  const charsRemaining = MAX_LENGTH - text.length;

  const handleSubmit = async () => {
    if (!textOk) return;
    tap.commit();

    const filterResult = prefilter(text);
    if (filterResult.triggered) {
      router.push('/resources');
      return;
    }

    setIntakeFreeText(text.trim());
    setMode('loading');
    setErrorMsg(null);

    try {
      const response = await classify(text.trim());
      if (response.crisis) {
        router.push('/resources');
        return;
      }
      if (response.recommendations.length === 0) {
        router.replace('/triage');
        return;
      }
      setRecommendations(response.recommendations);
      setMode('recommendations');
    } catch (err) {
      setErrorMsg('Something went wrong. You can try again or pick a path directly.');
      setMode('error');
    }
  };

  const handleSelectRecommendation = (pathId: PathId) => {
    tap.selection();
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

  const handleSeeAll = () => {
    tap.selection();
    router.back();
  };

  const handleRetry = () => {
    tap.selection();
    setMode('input');
    setErrorMsg(null);
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
          {mode === 'input' && (
            <>
              <View style={styles.header}>
                <Text style={styles.title}>Tell me a little about what you have been noticing.</Text>
                <Text style={styles.subhead}>
                  In your own words. I will suggest one or two paths that look most relevant to what you describe.
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
            </>
          )}

          {mode === 'loading' && (
            <View style={styles.centerState}>
              <ActivityIndicator size="large" color={colors.light.ink} />
              <Text style={styles.loadingText}>Looking at what you described...</Text>
            </View>
          )}

          {mode === 'recommendations' && (
            <>
              <View style={styles.header}>
                <Text style={styles.title}>Here is what I would suggest.</Text>
                <Text style={styles.subhead}>
                  {recommendations.length === 1
                    ? 'Based on what you described, this is the path that would look at what you are noticing most directly.'
                    : 'Based on what you described, these are the paths that would look at what you are noticing most directly.'}
                </Text>
              </View>

              <View style={styles.recommendationsContainer}>
                {recommendations.map((rec) => {
                  const path = paths.find((p) => p.id === rec.pathId);
                  if (!path) return null;
                  return (
                    <Pressable
                      key={rec.pathId}
                      onPress={() => handleSelectRecommendation(rec.pathId as PathId)}
                      style={({ pressed }) => [
                        styles.recommendationCard,
                        pressed && styles.recommendationCardPressed,
                      ]}
                    >
                      <Text style={styles.recommendationLabel}>{path.label}</Text>
                      <Text style={styles.recommendationRationale}>{rec.rationale}</Text>
                    </Pressable>
                  );
                })}
              </View>

              <Pressable
                style={({ pressed }) => [styles.linkButton, pressed && styles.linkButtonPressed]}
                onPress={handleSeeAll}
              >
                <Text style={styles.linkLabelSoft}>I'd rather see all paths</Text>
              </Pressable>
            </>
          )}

          {mode === 'error' && (
            <View style={styles.centerState}>
              <Text style={styles.errorTitle}>Something went wrong.</Text>
              <Text style={styles.errorBody}>{errorMsg ?? 'Please try again or pick a path directly.'}</Text>
              <View style={styles.errorActions}>
                <Pressable
                  style={({ pressed }) => [styles.retryButton, pressed && styles.retryButtonPressed]}
                  onPress={handleRetry}
                >
                  <Text style={styles.retryLabel}>Try again</Text>
                </Pressable>
                <Pressable
                  style={({ pressed }) => [styles.linkButton, pressed && styles.linkButtonPressed]}
                  onPress={handleSeeAll}
                >
                  <Text style={styles.linkLabelSoft}>Pick a path directly</Text>
                </Pressable>
              </View>
            </View>
          )}
        </ScrollView>

        {mode === 'input' && (
          <View style={styles.footer}>
            <Pressable
              style={({ pressed }) => [
                styles.submitButton,
                !textOk && styles.submitButtonDisabled,
                pressed && textOk && styles.submitButtonPressed,
              ]}
              onPress={handleSubmit}
              disabled={!textOk}
            >
              <Text style={[styles.submitLabel, !textOk && styles.submitLabelDisabled]}>
                Find my path
              </Text>
            </Pressable>
          </View>
        )}
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
  centerState: { paddingTop: spacing.xl, gap: spacing.l, alignItems: 'center' },
  loadingText: { ...typography.body, color: colors.light.inkSoft, textAlign: 'center' },
  recommendationsContainer: { gap: spacing.m },
  recommendationCard: {
    paddingVertical: spacing.l,
    paddingHorizontal: spacing.l,
    borderRadius: 12,
    backgroundColor: colors.light.paperDim,
    borderWidth: 1,
    borderColor: colors.light.rule,
    gap: spacing.s,
  },
  recommendationCardPressed: { opacity: 0.85 },
  recommendationLabel: {
    ...typography.body,
    color: colors.light.ink,
    fontWeight: '500',
    fontSize: 17,
  },
  recommendationRationale: {
    ...typography.body,
    color: colors.light.inkSoft,
    fontSize: 15,
    lineHeight: 22,
  },
  linkButton: { paddingVertical: spacing.s, alignItems: 'center' },
  linkButtonPressed: { opacity: 0.6 },
  linkLabelSoft: { ...typography.body, color: colors.light.inkSoft },
  errorTitle: { ...typography.headline, color: colors.light.ink, fontSize: 20, textAlign: 'center' },
  errorBody: { ...typography.body, color: colors.light.inkSoft, textAlign: 'center', lineHeight: 22 },
  errorActions: { gap: spacing.s, alignItems: 'center' },
  retryButton: {
    backgroundColor: colors.light.ink,
    paddingVertical: spacing.s,
    paddingHorizontal: spacing.l,
    borderRadius: 999,
  },
  retryButtonPressed: { opacity: 0.85 },
  retryLabel: { ...typography.body, color: colors.light.paper, fontWeight: '500' },
  footer: { paddingBottom: spacing.l, paddingTop: spacing.s },
  submitButton: {
    backgroundColor: colors.light.ink,
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.xl,
    borderRadius: 999,
    alignItems: 'center',
  },
  submitButtonDisabled: { backgroundColor: colors.light.rule },
  submitButtonPressed: { opacity: 0.85 },
  submitLabel: { ...typography.body, color: colors.light.paper, fontWeight: '500' },
  submitLabelDisabled: { color: colors.light.inkSoft },
});
