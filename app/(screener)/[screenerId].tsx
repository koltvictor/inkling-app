import { useEffect, useMemo } from 'react';
import { View, StyleSheet, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import Animated, { FadeIn } from 'react-native-reanimated';
import { colors } from '../../design/colors';
import { typography } from '../../design/typography';
import { spacing } from '../../design/spacing';
import { getScreener } from '../../lib/scoring/loader';
import { score } from '../../lib/scoring/score';
import { useAppStore } from '../../lib/storage/store';
import type { UserResponse } from '../../lib/scoring/types';

export default function ScreenerScreen() {
  const params = useLocalSearchParams<{ screenerId: string }>();
  const screenerId = params.screenerId;
  const screener = useMemo(
    () => (screenerId ? getScreener(screenerId) : null),
    [screenerId]
  );

  const inProgress = useAppStore((s) => s.inProgressScreener);
  const startOrResumeScreener = useAppStore((s) => s.startOrResumeScreener);
  const setScreenerIndex = useAppStore((s) => s.setScreenerIndex);
  const recordResponse = useAppStore((s) => s.recordResponse);
  const completeScreener = useAppStore((s) => s.completeScreener);

  useEffect(() => {
    if (screenerId) {
      startOrResumeScreener(screenerId);
    }
  }, [screenerId, startOrResumeScreener]);

  if (!screener) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.errorWrap}>
          <Text style={styles.title}>Screener not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!inProgress || inProgress.screenerId !== screenerId) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View />
      </SafeAreaView>
    );
  }

  const currentIndex = inProgress.currentIndex;
  const responses = inProgress.responses;
  const currentItem = screener.items[currentIndex];

  if (!currentItem) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.errorWrap}>
          <Text style={styles.title}>Item not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const selectedIndex = responses[currentItem.id];
  const hasSelected = selectedIndex !== undefined;
  const isLastQuestion = currentIndex === screener.items.length - 1;
  const isFirstQuestion = currentIndex === 0;

  const handleSelect = (responseIndex: number) => {
    Haptics.selectionAsync();
    recordResponse(currentItem.id, responseIndex);
  };

  const handleContinue = () => {
    if (!hasSelected) return;
    Haptics.selectionAsync();

    if (isLastQuestion) {
      const userResponses: UserResponse[] = screener.items.map((item) => ({
        itemId: item.id,
        responseIndex: responses[item.id]!,
      }));
      const result = score(screener, userResponses);

      completeScreener({
        screenerId: screener.id,
        screenerVersion: screener.version,
        totalScore: result.totalScore,
        cutoff: result.cutoff,
        cutoffMet: result.cutoffMet,
        subscales: result.subscales,
        responses: userResponses,
        completedAt: Date.now(),
      });

      router.replace('/interpretation');
    } else {
      setScreenerIndex(currentIndex + 1);
    }
  };

  const handleBack = () => {
    if (isFirstQuestion) return;
    Haptics.selectionAsync();
    setScreenerIndex(currentIndex - 1);
  };

  const handleSaveQuit = () => {
    Haptics.selectionAsync();
    router.back();
  };

  const total = screener.items.length;
  const padded = (n: number) => String(n).padStart(2, '0');

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <View style={styles.headerSlotLeft}>
          {!isFirstQuestion && (
            <Pressable onPress={handleBack} hitSlop={12}>
              <Text style={styles.backLabel}>{'\u2190'} Back</Text>
            </Pressable>
          )}
        </View>
        <Text style={styles.progress}>
          {padded(currentIndex + 1)} / {padded(total)}
        </Text>
        <View style={styles.headerSlotRight}>
          <Pressable onPress={handleSaveQuit} hitSlop={12}>
            <Text style={styles.saveQuitLabel}>Save & quit</Text>
          </Pressable>
        </View>
      </View>

      <Animated.View
        key={`question-${currentIndex}`}
        entering={FadeIn.duration(280)}
        style={styles.questionBlock}
      >
        <Text style={styles.questionText}>{currentItem.text}</Text>

        <View style={styles.options}>
          {currentItem.responses.map((response, idx) => {
            const isSelected = selectedIndex === idx;
            return (
              <Pressable
                key={idx}
                style={({ pressed }) => [
                  styles.option,
                  isSelected && styles.optionSelected,
                  pressed && styles.optionPressed,
                ]}
                onPress={() => handleSelect(idx)}
              >
                <Text
                  style={[
                    styles.optionLabel,
                    isSelected && styles.optionLabelSelected,
                  ]}
                >
                  {response.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </Animated.View>

      <View style={styles.footer}>
        <Pressable
          style={({ pressed }) => [
            styles.continueButton,
            !hasSelected && styles.continueButtonDisabled,
            pressed && hasSelected && styles.continueButtonPressed,
          ]}
          onPress={handleContinue}
          disabled={!hasSelected}
        >
          <Text
            style={[
              styles.continueLabel,
              !hasSelected && styles.continueLabelDisabled,
            ]}
          >
            {isLastQuestion ? 'Finish' : 'Continue'}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.light.paper, paddingHorizontal: spacing.l },
  errorWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { ...typography.headline, color: colors.light.ink },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: spacing.m,
    paddingBottom: spacing.l,
  },
  headerSlotLeft: { flex: 1, alignItems: 'flex-start' },
  headerSlotRight: { flex: 1, alignItems: 'flex-end' },
  backLabel: { ...typography.body, color: colors.light.ink, fontWeight: '500' },
  saveQuitLabel: {
    ...typography.body,
    color: colors.light.inkSoft,
    textDecorationLine: 'underline',
  },
  progress: {
    ...typography.caption,
    color: colors.light.inkSoft,
    fontVariant: ['tabular-nums'],
    flex: 1,
    textAlign: 'center',
  },
  questionBlock: { flex: 1, justifyContent: 'center', gap: spacing.xl },
  questionText: {
    ...typography.headline,
    color: colors.light.ink,
    fontSize: 22,
    lineHeight: 30,
  },
  options: { gap: spacing.s },
  option: {
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.l,
    borderRadius: 12,
    backgroundColor: colors.light.paperDim,
    borderWidth: 1,
    borderColor: colors.light.rule,
  },
  optionSelected: { backgroundColor: colors.light.ink, borderColor: colors.light.ink },
  optionPressed: { opacity: 0.85 },
  optionLabel: { ...typography.body, color: colors.light.ink },
  optionLabelSelected: { color: colors.light.paper },
  footer: { paddingBottom: spacing.l },
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
