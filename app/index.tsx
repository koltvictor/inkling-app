import { View, StyleSheet, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { BlotMark } from '../components/system/BlotMark';
import { CrisisAffordance } from '../components/CrisisAffordance';
import { colors } from '../design/colors';
import { typography } from '../design/typography';
import { spacing } from '../design/spacing';
import { useAppStore } from '../lib/storage/store';
import { getScreener } from '../lib/scoring/loader';
import { tap } from '../lib/haptics';

export default function WelcomeScreen() {
  const inProgress = useAppStore((s) => s.inProgressScreener);
  const completedCount = useAppStore((s) => s.completedScreeners.length);

  const inProgressScreener = inProgress ? getScreener(inProgress.screenerId) : null;
  const hasResume = !!(inProgress && inProgressScreener);
  const hasCompleted = completedCount > 0;

  const handleBegin = () => {
    tap.selection();
    router.push('/age-gate');
  };

  const handleResume = () => {
    if (!inProgress) return;
    tap.selection();
    router.push(`/${inProgress.screenerId}` as any);
  };

  const handleViewResults = () => {
    tap.selection();
    router.push('/interpretation');
  };

  const handleBeginAnotherPath = () => {
    tap.selection();
    // Returning users already cleared age-gate / crisis-pre-screen /
    // demographics. Jump straight to triage so they can write fresh
    // intake text and pick a new path.
    router.push('/triage' as any);
  };

  const handleSettings = () => {
    tap.selection();
    router.push('/settings');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <CrisisAffordance />
      <View style={styles.hero}>
        <View style={styles.markWrap}>
          <BlotMark size={88} color={colors.light.ink} />
        </View>
        <Text style={styles.title}>Inkling</Text>
        <Text style={styles.tagline}>
          A quiet space to consider patterns in how your mind works.
        </Text>
      </View>

      <View style={styles.footer}>
        {hasResume ? (
          // State 2: in-progress screener exists.
          <View style={styles.primaryAction}>
            <Pressable
              style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
              onPress={handleResume}
            >
              <Text style={styles.buttonLabel}>
                Resume {inProgressScreener!.shortName}
              </Text>
            </Pressable>
            <Text style={styles.resumeCaption}>
              Question {inProgress!.currentIndex + 1} of{' '}
              {inProgressScreener!.items.length}
            </Text>
            {hasCompleted && (
              <Pressable onPress={handleViewResults} hitSlop={12} style={styles.secondaryWrap}>
                <Text style={styles.secondaryLink}>View previous results {'\u2192'}</Text>
              </Pressable>
            )}
          </View>
        ) : hasCompleted ? (
          // State 3: completed at least one screener, nothing in progress.
          // The relevant primary action is to revisit results, with a
          // secondary affordance to start a different path entirely.
          <View style={styles.primaryAction}>
            <Pressable
              style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
              onPress={handleViewResults}
            >
              <Text style={styles.buttonLabel}>View your results</Text>
            </Pressable>
            <Pressable onPress={handleBeginAnotherPath} hitSlop={12} style={styles.secondaryWrap}>
              <Text style={styles.secondaryLink}>Begin another path {'\u2192'}</Text>
            </Pressable>
          </View>
        ) : (
          // State 1: brand new user.
          <View style={styles.primaryAction}>
            <Pressable
              style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
              onPress={handleBegin}
            >
              <Text style={styles.buttonLabel}>Begin</Text>
            </Pressable>
          </View>
        )}

        <Text style={styles.disclaimer}>
          Inkling administers validated screening instruments. It does not diagnose.
        </Text>
      </View>

      <Pressable
        onPress={handleSettings}
        hitSlop={12}
        testID="settings-link"
        style={({ pressed }) => [settingsStyles.settingsLink, pressed && { opacity: 0.5 }]}
      >
        <Text style={settingsStyles.settingsLinkText}>Settings</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light.paper,
    paddingHorizontal: spacing.l,
  },
  hero: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  markWrap: { marginBottom: spacing.l },
  title: {
    ...typography.display,
    color: colors.light.ink,
    marginBottom: spacing.s,
    textAlign: 'center',
  },
  tagline: {
    ...typography.bodyLarge,
    color: colors.light.inkSoft,
    textAlign: 'center',
    maxWidth: 320,
  },
  footer: {
    paddingBottom: spacing.l,
    gap: spacing.l,
    alignItems: 'center',
  },
  primaryAction: {
    gap: spacing.s,
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  button: {
    backgroundColor: colors.light.ink,
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.xl,
    borderRadius: 999,
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  buttonPressed: { opacity: 0.85 },
  buttonLabel: {
    ...typography.body,
    color: colors.light.paper,
    fontWeight: '500',
  },
  resumeCaption: {
    ...typography.caption,
    color: colors.light.inkSoft,
  },
  secondaryWrap: {
    paddingTop: spacing.xs,
  },
  secondaryLink: {
    ...typography.body,
    color: colors.light.inkSoft,
    textDecorationLine: 'underline',
  },
  disclaimer: {
    ...typography.caption,
    color: colors.light.inkSoft,
    textAlign: 'center',
    maxWidth: 320,
  },
});

const settingsStyles = StyleSheet.create({
  settingsLink: {
    position: 'absolute',
    bottom: 24,
    right: 24,
  },
  settingsLinkText: {
    fontSize: 13,
    color: colors.light.inkSoft,
    textDecorationLine: 'underline',
  },
});
