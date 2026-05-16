import { View, Text, Pressable, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Constants from 'expo-constants';
import { useAppStore } from '../lib/storage/store';
import { tap } from '../lib/haptics';
import { colors } from '../design/colors';
import { typography } from '../design/typography';
import { spacing } from '../design/spacing';

export default function SettingsScreen() {
  const reset = useAppStore((s) => s.reset);
  const completedScreeners = useAppStore((s) => s.completedScreeners);
  const inProgressScreener = useAppStore((s) => s.inProgressScreener);
  const interpretations = useAppStore((s) => s.interpretations);

  const handleBack = () => {
    tap.selection();
    router.back();
  };

  const handleDeleteData = () => {
    tap.selection();
    const completedCount = completedScreeners.length;
    const interpretationCount = Object.keys(interpretations).length;
    const inProgress = inProgressScreener ? 1 : 0;
    const total = completedCount + interpretationCount + inProgress;

    const summary =
      total === 0
        ? 'Inkling does not have any data to delete right now.'
        : 'This will permanently remove ' +
          [
            completedCount > 0 ? `${completedCount} completed screening${completedCount === 1 ? '' : 's'}` : null,
            inProgress > 0 ? 'your in-progress screener' : null,
            interpretationCount > 0 ? `${interpretationCount} interpretation${interpretationCount === 1 ? '' : 's'}` : null,
          ]
            .filter(Boolean)
            .join(', ') +
          ', plus your intake responses. Inkling will return to its starting state. This cannot be undone.';

    if (total === 0) {
      Alert.alert('Nothing to delete', summary, [{ text: 'OK' }]);
      return;
    }

    Alert.alert('Delete all your data?', summary, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete everything',
        style: 'destructive',
        onPress: () => {
          reset();
          tap.commit();
          router.replace('/');
        },
      },
    ]);
  };

  const version = Constants.expoConfig?.version || '0.1.0';

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={handleBack} hitSlop={12}>
          <Text style={styles.backLabel}>{'\u2190'} Back</Text>
        </Pressable>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Settings</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your data</Text>
          <Text style={styles.sectionBody}>
            Inkling stores your screening responses, interpretations, and intake notes on this device only. Nothing is uploaded to a server or shared. You can delete everything at any time.
          </Text>
          <Pressable
            onPress={handleDeleteData}
            hitSlop={12}
            style={({ pressed }) => [styles.dangerLink, pressed && styles.pressed]}
          >
            <Text style={styles.dangerLinkText}>Delete all my data {'\u2192'}</Text>
          </Pressable>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About Inkling</Text>
          <Text style={styles.sectionBody}>
            Inkling administers validated screening instruments and offers thoughtful interpretation of results. It does not diagnose. For diagnostic clarity, consult a qualified clinician.
          </Text>
          <Text style={styles.versionText}>Version {version}</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light.paper,
    paddingHorizontal: spacing.xl,
  },
  header: {
    paddingTop: spacing.m,
    paddingBottom: spacing.l,
  },
  backLabel: {
    ...typography.body,
    color: colors.light.ink,
    fontWeight: '500',
  },
  content: { flex: 1 },
  title: {
    ...typography.display,
    fontSize: 40,
    color: colors.light.ink,
    marginBottom: spacing.xxxl,
  },
  section: { marginBottom: spacing.xxxl },
  sectionTitle: {
    ...typography.headline,
    fontSize: 22,
    color: colors.light.ink,
    marginBottom: spacing.m,
  },
  sectionBody: {
    ...typography.body,
    color: colors.light.ink,
    lineHeight: 24,
    marginBottom: spacing.l,
  },
  dangerLink: { alignSelf: 'flex-start' },
  dangerLinkText: {
    ...typography.body,
    color: colors.light.crisis,
    textDecorationLine: 'underline',
  },
  pressed: { opacity: 0.5 },
  versionText: {
    ...typography.caption,
    fontSize: 13,
    color: colors.light.inkSoft,
    fontVariant: ['tabular-nums'],
  },
});
