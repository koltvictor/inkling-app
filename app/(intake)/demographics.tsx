import { useState } from 'react';
import { View, StyleSheet, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { colors } from '../../design/colors';
import { typography } from '../../design/typography';
import { spacing } from '../../design/spacing';
import { useAppStore, type SexAtBirth } from '../../lib/storage/store';

import { CrisisAffordance } from '../../components/CrisisAffordance';
const OPTIONS: { value: SexAtBirth; label: string }[] = [
  { value: 'female', label: 'Female' },
  { value: 'male', label: 'Male' },
  { value: 'intersex', label: 'Intersex' },
  { value: 'prefer-not-to-say', label: 'Prefer not to say' },
];

export default function DemographicsScreen() {
  const [selected, setSelected] = useState<SexAtBirth | null>(null);
  const setSexAtBirth = useAppStore((s) => s.setSexAtBirth);

  const handleSelect = (value: SexAtBirth) => {
    Haptics.selectionAsync();
    setSelected(value);
  };

  const handleContinue = () => {
    if (!selected) return;
    Haptics.selectionAsync();
    setSexAtBirth(selected);
    router.replace('/triage');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <CrisisAffordance />
      <View style={styles.header}>
        <Text style={styles.title}>One more detail.</Text>
        <Text style={styles.subhead}>
          Sex assigned at birth affects how some screening instruments are interpreted. This is for clinical context only — Inkling doesn't draw conclusions about identity from it.
        </Text>
      </View>

      <View style={styles.options}>
        {OPTIONS.map((opt) => (
          <Pressable
            key={opt.value}
            style={({ pressed }) => [
              styles.option,
              selected === opt.value && styles.optionSelected,
              pressed && styles.optionPressed,
            ]}
            onPress={() => handleSelect(opt.value)}
          >
            <Text
              style={[
                styles.optionLabel,
                selected === opt.value && styles.optionLabelSelected,
              ]}
            >
              {opt.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.footer}>
        <Pressable
          style={({ pressed }) => [
            styles.continueButton,
            !selected && styles.continueButtonDisabled,
            pressed && selected && styles.continueButtonPressed,
          ]}
          onPress={handleContinue}
          disabled={!selected}
        >
          <Text
            style={[styles.continueLabel, !selected && styles.continueLabelDisabled]}
          >
            Continue
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.light.paper, paddingHorizontal: spacing.l },
  header: { paddingTop: spacing.xl, gap: spacing.s },
  title: { ...typography.headline, color: colors.light.ink, fontSize: 28 },
  subhead: { ...typography.body, color: colors.light.inkSoft, lineHeight: 24 },
  options: { flex: 1, justifyContent: 'center', gap: spacing.s },
  option: {
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.l,
    borderRadius: 12,
    backgroundColor: colors.light.paperDim,
    borderWidth: 1,
    borderColor: colors.light.rule,
  },
  optionSelected: {
    backgroundColor: colors.light.ink,
    borderColor: colors.light.ink,
  },
  optionPressed: { opacity: 0.85 },
  optionLabel: { ...typography.body, color: colors.light.ink, fontWeight: '500' },
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
