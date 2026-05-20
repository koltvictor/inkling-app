import { useState } from 'react';
import { View, StyleSheet, Text, Pressable, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { differenceInYears } from 'date-fns';
import { colors } from '../../design/colors';
import { typography } from '../../design/typography';
import { spacing } from '../../design/spacing';
import { useAppStore, ageToBucket } from '../../lib/storage/store';

export default function AgeGateScreen() {
  const [dob, setDob] = useState<Date | null>(null);
  const [attested, setAttested] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const setAge = useAppStore((s) => s.setAge);
  const acceptTerms = useAppStore((s) => s.acceptTerms);

  const canContinue = dob !== null && attested && termsAccepted;

  const handleContinue = () => {
    if (!dob || !attested || !termsAccepted) return;
    Haptics.selectionAsync();
    const age = differenceInYears(new Date(), dob);
    if (age < 18) {
      router.replace('/under-18');
      return;
    }
    const bucket = ageToBucket(age);
    if (bucket) setAge(bucket);
    acceptTerms();
    router.replace('/crisis-pre-screen');
  };

  const toggleAttested = () => {
    Haptics.selectionAsync();
    setAttested(!attested);
  };

  const toggleTermsAccepted = () => {
    Haptics.selectionAsync();
    setTermsAccepted(!termsAccepted);
  };

  const openTerms = () => Linking.openURL('https://inklingapp.org/terms');
  const openPrivacy = () => Linking.openURL('https://inklingapp.org/privacy');

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Text style={styles.title}>First, your age.</Text>
        <Text style={styles.subhead}>
          Inkling is for adults. We use your date of birth to confirm you're 18 or older, then discard it. Only an age range is stored.
        </Text>
      </View>

      <View style={styles.pickerWrap}>
        <DateTimePicker
          value={dob ?? new Date(1990, 0, 1)}
          mode="date"
          display="spinner"
          onChange={(_, selectedDate) => {
            if (selectedDate) setDob(selectedDate);
          }}
          maximumDate={new Date()}
          minimumDate={new Date(1900, 0, 1)}
          textColor={colors.light.ink}
        />
      </View>

      <View style={styles.footer}>
        <Pressable style={styles.attestRow} onPress={toggleAttested}>
          <View style={[styles.checkbox, attested && styles.checkboxChecked]}>
            {attested && <View style={styles.checkboxDot} />}
          </View>
          <Text style={styles.attestLabel}>I confirm I am 18 years of age or older.</Text>
        </Pressable>

        <Pressable style={styles.attestRow} onPress={toggleTermsAccepted}>
          <View style={[styles.checkbox, termsAccepted && styles.checkboxChecked]}>
            {termsAccepted && <View style={styles.checkboxDot} />}
          </View>
          <Text style={styles.attestLabel}>
            I have read and agree to the{' '}
            <Text style={styles.attestLink} onPress={openTerms}>
              Terms of Service
            </Text>
            {' '}and{' '}
            <Text style={styles.attestLink} onPress={openPrivacy}>
              Privacy Policy
            </Text>
            .
          </Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.button,
            !canContinue && styles.buttonDisabled,
            pressed && canContinue && styles.buttonPressed,
          ]}
          onPress={handleContinue}
          disabled={!canContinue}
        >
          <Text style={[styles.buttonLabel, !canContinue && styles.buttonLabelDisabled]}>Continue</Text>
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
  pickerWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  footer: { paddingBottom: spacing.l, gap: spacing.m },
  attestRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.s, paddingVertical: spacing.s },
  checkbox: {
    width: 22, height: 22, borderRadius: 4, borderWidth: 1.5,
    borderColor: colors.light.inkSoft, justifyContent: 'center', alignItems: 'center',
    marginTop: 2,
  },
  checkboxChecked: { backgroundColor: colors.light.ink, borderColor: colors.light.ink },
  checkboxDot: { width: 10, height: 10, borderRadius: 2, backgroundColor: colors.light.paper },
  attestLabel: { ...typography.body, color: colors.light.ink, flex: 1, lineHeight: 22 },
  attestLink: { textDecorationLine: 'underline', color: colors.light.ink },
  button: {
    backgroundColor: colors.light.ink, paddingVertical: spacing.m,
    paddingHorizontal: spacing.xl, borderRadius: 999, alignItems: 'center',
  },
  buttonDisabled: { backgroundColor: colors.light.rule },
  buttonPressed: { opacity: 0.85 },
  buttonLabel: { ...typography.body, color: colors.light.paper, fontWeight: '500' },
  buttonLabelDisabled: { color: colors.light.inkSoft },
});
