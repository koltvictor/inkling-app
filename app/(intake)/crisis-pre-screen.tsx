import { useState } from 'react';
import { View, StyleSheet, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { colors } from '../../design/colors';
import { typography } from '../../design/typography';
import { spacing } from '../../design/spacing';

type Choice = 'yes' | 'no' | null;

const QUESTIONS = [
  'Have you wished you were dead, or wished you could go to sleep and not wake up?',
  'Have you actually had any thoughts of killing yourself?',
];

export default function CrisisPreScreen() {
  const [answers, setAnswers] = useState<Choice[]>([null, null]);

  const setAnswer = (index: number, value: Choice) => {
    Haptics.selectionAsync();
    const next = [...answers];
    next[index] = value;
    setAnswers(next);
  };

  const allAnswered = answers.every((a) => a !== null);
  const anyYes = answers.some((a) => a === 'yes');

  const handleContinue = () => {
    if (!allAnswered) return;
    Haptics.selectionAsync();
    if (anyYes) {
      router.replace('/resources');
    } else {
      router.replace('/demographics');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Text style={styles.title}>Two questions before we go further.</Text>
        <Text style={styles.subhead}>
          Inkling can connect you to support right now if you need it. Your answers stay on your device.
        </Text>
      </View>

      <View style={styles.questions}>
        {QUESTIONS.map((q, i) => (
          <View key={i} style={styles.questionBlock}>
            <Text style={styles.questionText}>{q}</Text>
            <View style={styles.choices}>
              <Choice
                label="Yes"
                selected={answers[i] === 'yes'}
                onPress={() => setAnswer(i, 'yes')}
              />
              <Choice
                label="No"
                selected={answers[i] === 'no'}
                onPress={() => setAnswer(i, 'no')}
              />
            </View>
          </View>
        ))}
      </View>

      <View style={styles.footer}>
        <Pressable
          style={({ pressed }) => [
            styles.continueButton,
            !allAnswered && styles.continueButtonDisabled,
            pressed && allAnswered && styles.continueButtonPressed,
          ]}
          onPress={handleContinue}
          disabled={!allAnswered}
        >
          <Text style={[styles.continueLabel, !allAnswered && styles.continueLabelDisabled]}>
            Continue
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function Choice({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.choice,
        selected && styles.choiceSelected,
        pressed && styles.choicePressed,
      ]}
      onPress={onPress}
    >
      <Text style={[styles.choiceLabel, selected && styles.choiceLabelSelected]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.light.paper, paddingHorizontal: spacing.l },
  header: { paddingTop: spacing.xl, gap: spacing.s },
  title: { ...typography.headline, color: colors.light.ink, fontSize: 26 },
  subhead: { ...typography.body, color: colors.light.inkSoft, lineHeight: 24 },
  questions: { flex: 1, justifyContent: 'center', gap: spacing.xl },
  questionBlock: { gap: spacing.m },
  questionText: { ...typography.bodyLarge, color: colors.light.ink, lineHeight: 28 },
  choices: { flexDirection: 'row', gap: spacing.m },
  choice: {
    flex: 1, paddingVertical: spacing.m, borderRadius: 12,
    backgroundColor: colors.light.paperDim, alignItems: 'center',
    borderWidth: 1, borderColor: colors.light.rule,
  },
  choiceSelected: { backgroundColor: colors.light.ink, borderColor: colors.light.ink },
  choicePressed: { opacity: 0.85 },
  choiceLabel: { ...typography.body, color: colors.light.ink, fontWeight: '500' },
  choiceLabelSelected: { color: colors.light.paper },
  footer: { paddingBottom: spacing.l },
  continueButton: {
    backgroundColor: colors.light.ink, paddingVertical: spacing.m,
    paddingHorizontal: spacing.xl, borderRadius: 999, alignItems: 'center',
  },
  continueButtonDisabled: { backgroundColor: colors.light.rule },
  continueButtonPressed: { opacity: 0.85 },
  continueLabel: { ...typography.body, color: colors.light.paper, fontWeight: '500' },
  continueLabelDisabled: { color: colors.light.inkSoft },
});
