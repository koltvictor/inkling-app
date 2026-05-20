import { useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  Pressable,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { colors } from '../../design/colors';
import { typography } from '../../design/typography';
import { spacing } from '../../design/spacing';
import { useAppStore } from '../../lib/storage/store';
import { tap } from '../../lib/haptics';
import { getAllPaths, type PathId } from '../../lib/paths';
import { getScreener } from '../../lib/scoring/loader';
import { classify, type Recommendation } from '../../lib/api/client';
import { QUESTIONS, type Answer, type Selection, synthesize } from '../../lib/intake/guided-triage';

import { CrisisAffordance } from '../../components/CrisisAffordance';
type Mode = 'question' | 'loading' | 'recommendations' | 'error';

export default function TriageGuidedScreen() {
  const setSelectedPath = useAppStore((s) => s.setSelectedPath);
  const setIntakeFreeText = useAppStore((s) => s.setIntakeFreeText);
  const completedScreeners = useAppStore((s) => s.completedScreeners);

  const paths = getAllPaths();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selections, setSelections] = useState<Array<Selection | null>>(
    Array(QUESTIONS.length).fill(null)
  );
  const [mode, setMode] = useState<Mode>('question');
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const currentQuestion = QUESTIONS[currentIdx];
  const isLastQuestion = currentIdx === QUESTIONS.length - 1;

  const handleSelectAnswer = (answer: Answer) => {
    tap.selection();

    if (answer.action === 'route-to-routing') {
      router.replace('/routing');
      return;
    }

    const newSelections = [...selections];
    newSelections[currentIdx] = {
      questionId: currentQuestion.id,
      synthesized: answer.synthesized,
    };
    setSelections(newSelections);

    if (isLastQuestion) {
      handleComplete(newSelections);
    } else {
      setCurrentIdx(currentIdx + 1);
    }
  };

  const handleBack = () => {
    tap.selection();
    if (currentIdx === 0) {
      router.back();
    } else {
      setCurrentIdx(currentIdx - 1);
    }
  };

  const handleComplete = async (finalSelections: Array<Selection | null>) => {
    const synthesizedText = synthesize(finalSelections);

    if (!synthesizedText.trim()) {
      router.replace('/routing');
      return;
    }

    setIntakeFreeText(synthesizedText);
    setMode('loading');
    setErrorMsg(null);

    try {
      const response = await classify(synthesizedText);
      if (response.crisis) {
        setMode('question');
        router.push('/resources');
        return;
      }
      if (response.outOfScope) {
        setMode('question');
        router.push({
          pathname: '/different-care',
          params: { categoryId: response.outOfScope.category },
        });
        return;
      }
      if (response.recommendations.length === 0) {
        router.replace('/routing');
        return;
      }
      setRecommendations(response.recommendations);
      setMode('recommendations');
    } catch (err) {
      setErrorMsg('Something went wrong. You can try again or go back to the home screen.');
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
    router.replace('/');
  };

  const handleRetry = () => {
    tap.selection();
    setMode('question');
    setErrorMsg(null);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <CrisisAffordance />
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {mode === 'question' && (
          <>
            <View style={styles.header}>
              <Text style={styles.progress}>
                {currentIdx + 1} of {QUESTIONS.length}
              </Text>
              <Text style={styles.questionText}>{currentQuestion.questionText}</Text>
              {currentIdx === 0 && (
                <Text style={styles.subhead}>
                  Six short questions. Tap an answer and I will move you forward. There is no wrong choice — pick whichever feels closest.
                </Text>
              )}
            </View>

            <View style={styles.answersContainer}>
              {currentQuestion.answers.map((answer) => (
                <Pressable
                  key={answer.buttonLabel}
                  onPress={() => handleSelectAnswer(answer)}
                  style={({ pressed }) => [
                    styles.answerButton,
                    pressed && styles.answerButtonPressed,
                  ]}
                >
                  <Text style={styles.answerLabel}>{answer.buttonLabel}</Text>
                </Pressable>
              ))}
            </View>

            <Pressable
              onPress={handleBack}
              style={({ pressed }) => [styles.backLink, pressed && styles.backLinkPressed]}
              hitSlop={12}
            >
              <Text style={styles.backLinkText}>
                {currentIdx === 0 ? '← Back' : '← Previous question'}
              </Text>
            </Pressable>
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
            <Text style={styles.errorBody}>{errorMsg ?? 'Please try again.'}</Text>
            <Pressable
              style={({ pressed }) => [styles.retryButton, pressed && styles.retryButtonPressed]}
              onPress={handleRetry}
            >
              <Text style={styles.retryLabel}>Try again</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.light.paper, paddingHorizontal: spacing.l },
  scrollContent: { paddingTop: spacing.xl, paddingBottom: spacing.xl, gap: spacing.xl },
  header: { gap: spacing.s },
  progress: {
    ...typography.caption,
    color: colors.light.inkSoft,
    fontSize: 13,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  questionText: {
    ...typography.headline,
    color: colors.light.ink,
    fontSize: 24,
    lineHeight: 32,
    marginTop: spacing.xs,
  },
  subhead: {
    ...typography.body,
    color: colors.light.inkSoft,
    lineHeight: 22,
    marginTop: spacing.s,
  },
  answersContainer: { gap: spacing.m },
  answerButton: {
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.l,
    borderRadius: 12,
    backgroundColor: colors.light.paperDim,
    borderWidth: 1,
    borderColor: colors.light.rule,
  },
  answerButtonPressed: { opacity: 0.7 },
  answerLabel: {
    ...typography.body,
    color: colors.light.ink,
    fontSize: 16,
    lineHeight: 22,
  },
  backLink: { alignSelf: 'flex-start', paddingVertical: spacing.s },
  backLinkPressed: { opacity: 0.6 },
  backLinkText: { ...typography.body, color: colors.light.inkSoft },
  title: { ...typography.headline, color: colors.light.ink, fontSize: 26 },
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
  retryButton: {
    backgroundColor: colors.light.ink,
    paddingVertical: spacing.s,
    paddingHorizontal: spacing.l,
    borderRadius: 999,
  },
  retryButtonPressed: { opacity: 0.85 },
  retryLabel: { ...typography.body, color: colors.light.paper, fontWeight: '500' },
});
