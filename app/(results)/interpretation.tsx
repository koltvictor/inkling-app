import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '../../lib/storage/store';
import { getScreener } from '../../lib/scoring/loader';
import { colors } from '../../design/colors';
import { typography } from '../../design/typography';
import { spacing } from '../../design/spacing';

const AUTISM_PATH = ['aq-10', 'raads-r', 'cat-q'];

const formatSubscale = (raw: string) =>
  raw
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
    .replace('Sensory Motor', 'Sensory–Motor');

export default function InterpretationScreen() {
  const router = useRouter();
  const completedScreeners = useAppStore((s) => s.completedScreeners);

  const nextScreenerId = AUTISM_PATH.find((id) => {
    const isCompleted = completedScreeners.some((s) => s.screenerId === id);
    const isLoaded = getScreener(id) !== undefined;
    return !isCompleted && isLoaded;
  });
  const nextScreener = nextScreenerId ? getScreener(nextScreenerId) : undefined;

  const handleHome = () => {
    router.replace('/');
  };

  const handleNext = () => {
    if (nextScreenerId) router.push(`/${nextScreenerId}`);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.kicker}>Your responses</Text>

        {completedScreeners.map((result, idx) => {
          const screener = getScreener(result.screenerId);
          if (!screener) return null;
          const max = screener.scoring.scoreRange.max;
          const cutoff = screener.scoring.cutoff;
          const hasFullName =
            screener.fullName && screener.fullName !== screener.shortName;
          const subscaleDefs = screener.scoring.subscales || {};
          const hasSubscales =
            result.subscales && Object.keys(result.subscales).length > 0;

          return (
            <View key={`${result.screenerId}-${idx}`} style={styles.screenerSection}>
              <Text style={styles.screenerName}>{screener.shortName}</Text>
              {hasFullName && (
                <Text style={styles.screenerFullName}>{screener.fullName}</Text>
              )}

              <View style={styles.scoreLine}>
                <Text style={styles.scoreValue}>{result.totalScore}</Text>
                <Text style={styles.scoreMax}> of {max}</Text>
              </View>

              {cutoff !== null && (
                <Text style={styles.cutoffStatus}>
                  {result.cutoffMet
                    ? `At or above cutoff (${cutoff})`
                    : `Below cutoff (${cutoff})`}
                </Text>
              )}

              {hasSubscales && (
                <View style={styles.subscales}>
                  {Object.entries(result.subscales!).map(([name, value]) => {
                    const subscaleMax = (subscaleDefs[name]?.length || 0) * 3;
                    return (
                      <View key={name} style={styles.subscaleRow}>
                        <Text style={styles.subscaleName}>{formatSubscale(name)}</Text>
                        <Text style={styles.subscaleValue}>
                          {value}{subscaleMax > 0 ? ` of ${subscaleMax}` : ''}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          );
        })}

        {nextScreener && (
          <View style={styles.continueSection}>
            <Text style={styles.continueLabel}>Continue if you'd like</Text>
            <Text style={styles.continueBody}>
              Inkling can administer the {nextScreener.fullName} ({nextScreener.shortName}) for a fuller picture. {nextScreener.items.length} items, about {nextScreener.estimatedMinutes} minutes.
            </Text>
            <Pressable
              onPress={handleNext}
              style={({ pressed }) => [styles.cta, pressed && styles.pressed]}
              hitSlop={12}
            >
              <Text style={styles.ctaText}>Begin {nextScreener.shortName} →</Text>
            </Pressable>
          </View>
        )}

        <View style={styles.footer}>
          <Pressable onPress={handleHome} hitSlop={12}>
            <Text style={styles.secondaryLink}>
              {nextScreener ? 'Stop here and go home' : 'Done — go home'}
            </Text>
          </Pressable>
        </View>

        <Text style={styles.disclaimer}>
          Inkling administers validated screening instruments. It does not diagnose.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.light.paper },
  scroll: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xxxl,
  },

  kicker: {
    ...typography.caption,
    fontSize: 13,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: colors.light.inkSoft,
    marginBottom: spacing.xxxl,
  },

  screenerSection: {
    marginBottom: spacing.xxxl,
  },
  screenerName: {
    ...typography.display,
    fontSize: 40,
    lineHeight: 44,
    color: colors.light.ink,
  },
  screenerFullName: {
    ...typography.display,
    fontSize: 18,
    lineHeight: 26,
    letterSpacing: 0,
    fontStyle: 'italic',
    color: colors.light.inkSoft,
    marginTop: spacing.xs,
  },

  scoreLine: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: spacing.xxl,
  },
  scoreValue: {
    ...typography.display,
    fontSize: 88,
    lineHeight: 96,
    letterSpacing: -2,
    color: colors.light.ink,
    fontVariant: ['tabular-nums'],
  },
  scoreMax: {
    ...typography.headline,
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: 0,
    color: colors.light.inkSoft,
    fontVariant: ['tabular-nums'],
    marginLeft: spacing.sm,
  },
  cutoffStatus: {
    ...typography.body,
    color: colors.light.ink,
    marginTop: spacing.md,
  },

  subscales: {
    marginTop: spacing.xxl,
  },
  subscaleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingVertical: spacing.sm,
  },
  subscaleName: {
    ...typography.body,
    fontSize: 16,
    color: colors.light.ink,
  },
  subscaleValue: {
    ...typography.body,
    fontSize: 16,
    color: colors.light.inkSoft,
    fontVariant: ['tabular-nums'],
  },

  continueSection: {
    marginTop: spacing.xl,
    marginBottom: spacing.xxxl,
    paddingTop: spacing.xxl,
    borderTopWidth: 1,
    borderTopColor: colors.light.rule,
  },
  continueLabel: {
    ...typography.caption,
    fontSize: 13,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: colors.light.inkSoft,
    marginBottom: spacing.lg,
  },
  continueBody: {
    ...typography.display,
    fontSize: 18,
    lineHeight: 28,
    letterSpacing: 0,
    color: colors.light.ink,
    marginBottom: spacing.xl,
  },
  cta: {
    alignSelf: 'flex-start',
  },
  ctaText: {
    ...typography.headline,
    fontSize: 20,
    letterSpacing: 0,
    color: colors.light.ink,
    textDecorationLine: 'underline',
  },
  pressed: {
    opacity: 0.4,
  },

  footer: {
    paddingTop: spacing.xxl,
    borderTopWidth: 1,
    borderTopColor: colors.light.rule,
  },
  secondaryLink: {
    ...typography.body,
    fontSize: 16,
    color: colors.light.inkSoft,
    textDecorationLine: 'underline',
  },

  disclaimer: {
    ...typography.caption,
    fontSize: 13,
    fontStyle: 'italic',
    color: colors.light.inkSoft,
    marginTop: spacing.xxxl,
    textAlign: 'center',
  },
});
