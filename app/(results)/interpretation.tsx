import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '../../lib/storage/store';
import type { CompletedScreener } from '../../lib/storage/store';
import { getScreener } from '../../lib/scoring/loader';
import {
  buildInterpretPayload,
  computeInterpretationCacheKey,
  fetchInterpretation,
} from '../../lib/api/client';
import { tap } from '../../lib/haptics';
import { getAllPaths, pathForScreener, type PathId, type Path } from '../../lib/paths';
import { getResourcesForPath, type PathResources } from '../../lib/resources';
import { colors } from '../../design/colors';
import { typography } from '../../design/typography';
import { spacing } from '../../design/spacing';

const formatSubscale = (raw: string) =>
  raw
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
    .replace('Sensory Motor', 'Sensory-Motor');

const openUrl = (url: string) => {
  tap.selection();
  Linking.openURL(url).catch(() => {});
};

function inferPathFromCompleted(completed: CompletedScreener[]): PathId | null {
  if (completed.length === 0) return null;
  const sorted = [...completed].sort((a, b) => b.completedAt - a.completedAt);
  for (const result of sorted) {
    const pathId = pathForScreener(result.screenerId);
    if (pathId) return pathId;
  }
  return null;
}

function ResourcesSection({ resources }: { resources: PathResources }) {
  return (
    <View style={styles.resourcesSection}>
      <View style={styles.rule} />
      <Text style={styles.kicker}>Some places to explore</Text>

      <Text style={styles.resourceCategory}>Books and first-hand accounts</Text>
      <View style={styles.resourceGroup}>
        {resources.books.map((book) => (
          <Text key={book.title} style={styles.resourceItem}>
            {book.title}
            {book.author ? (
              <Text style={styles.resourceMeta}> {'\u2014'} {book.author}</Text>
            ) : null}
          </Text>
        ))}
      </View>

      <Text style={styles.resourceCategory}>Communities and organizations</Text>
      <View style={styles.resourceGroup}>
        {resources.communities.map((c) => (
          <Pressable
            key={c.title}
            onPress={() => (c.url ? openUrl(c.url) : undefined)}
            hitSlop={8}
            style={({ pressed }) => [pressed && styles.pressed]}
          >
            <Text style={c.url ? styles.resourceLink : styles.resourceItem}>{c.title}</Text>
            {c.note ? <Text style={styles.resourceMeta}>{c.note}</Text> : null}
          </Pressable>
        ))}
      </View>

      <Text style={styles.resourceCategory}>When you are ready for a clinician</Text>
      <Text style={styles.resourceProse}>{resources.clinicalGuidance}</Text>
    </View>
  );
}

export default function InterpretationScreen() {
  const router = useRouter();
  const completedScreeners = useAppStore((s) => s.completedScreeners);
  const ageBucket = useAppStore((s) => s.ageBucket);
  const sexAtBirth = useAppStore((s) => s.sexAtBirth);
  const intakeFreeText = useAppStore((s) => s.intakeFreeText);
  const storeSelectedPath = useAppStore((s) => s.selectedPath);
  const interpretations = useAppStore((s) => s.interpretations);
  const setInterpretation = useAppStore((s) => s.setInterpretation);

  const displayedScreeners = useMemo(() => {
    const latest = new Map<string, (typeof completedScreeners)[number]>();
    for (const c of completedScreeners) {
      const existing = latest.get(c.screenerId);
      if (!existing || c.completedAt > existing.completedAt) {
        latest.set(c.screenerId, c);
      }
    }
    return Array.from(latest.values()).sort(
      (a, b) => a.completedAt - b.completedAt
    );
  }, [completedScreeners]);

  const activePathId: PathId | null = useMemo(
    () => storeSelectedPath ?? inferPathFromCompleted(displayedScreeners),
    [storeSelectedPath, displayedScreeners]
  );

  const activePath: Path | null = useMemo(() => {
    if (!activePathId) return null;
    return getAllPaths().find((p) => p.id === activePathId) ?? null;
  }, [activePathId]);

  const pathResources = activePathId ? getResourcesForPath(activePathId) : null;

  const cacheKey = useMemo(
    () => computeInterpretationCacheKey(displayedScreeners),
    [displayedScreeners]
  );

  const cached = cacheKey ? interpretations[cacheKey] : undefined;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAndCache = useCallback(async () => {
    if (!cacheKey || displayedScreeners.length === 0) return;
    setLoading(true);
    setError(null);
    try {
      const payload = buildInterpretPayload(displayedScreeners, {
        ageBucket,
        sexAtBirth,
        intakeFreeText,
      });
      const response = await fetchInterpretation(payload);
      setInterpretation(cacheKey, response.interpretation);
      tap.arrival();
    } catch (err) {
      console.log('[INKLING DEBUG] Fetch threw:', err);
      if (err instanceof Error) {
        console.log('[INKLING DEBUG] Error name:', err.name);
        console.log('[INKLING DEBUG] Error message:', err.message);
        console.log('[INKLING DEBUG] Error stack:', err.stack);
      }
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [
    cacheKey,
    displayedScreeners,
    ageBucket,
    sexAtBirth,
    intakeFreeText,
    setInterpretation,
  ]);

  useEffect(() => {
    if (!cached && !loading && !error && displayedScreeners.length > 0) {
      fetchAndCache();
    }
  }, [cached, loading, error, displayedScreeners.length, fetchAndCache]);

  const nextScreenerId = activePath?.screenerIds.find((id) => {
    const isCompleted = completedScreeners.some((s) => s.screenerId === id);
    const isLoaded = getScreener(id) !== undefined;
    return !isCompleted && isLoaded;
  });
  const nextScreener = nextScreenerId ? getScreener(nextScreenerId) : undefined;

  const handleHome = () => {
    tap.selection();
    router.replace('/');
  };
  const handleNext = () => {
    tap.selection();
    if (nextScreenerId) router.push(`/${nextScreenerId}` as any);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.kicker}>Your responses</Text>

        {displayedScreeners.map((result, idx) => {
          const screener = getScreener(result.screenerId);
          if (!screener) return null;
          const max = screener.scoring.scoreRange?.max ?? 0;
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

        {displayedScreeners.length > 0 && (
          <View style={styles.interpretationSection}>
            <View style={styles.rule} />
            <Text style={styles.kicker}>An interpretation</Text>

            {cached ? (
              <View>
                {cached.body
                  .split(/\n\s*\n/)
                  .map((p) => p.trim())
                  .filter(Boolean)
                  .map((paragraph, i) => (
                    <Text key={i} style={styles.proseParagraph}>
                      {paragraph}
                    </Text>
                  ))}
              </View>
            ) : loading ? (
              <Text style={styles.loadingText}>
                Inkling is reflecting on your responses...
              </Text>
            ) : error ? (
              <View>
                <Text style={styles.errorText}>
                  Inkling could not generate an interpretation just now.
                </Text>
                <Pressable onPress={fetchAndCache} hitSlop={12}>
                  <Text style={styles.retryLink}>Try again {'\u2192'}</Text>
                </Pressable>
              </View>
            ) : null}
          </View>
        )}

        {cached && pathResources && <ResourcesSection resources={pathResources} />}

        {nextScreener && (
          <View style={styles.continueSection}>
            <Text style={styles.continueLabel}>Continue if you would like</Text>
            <Text style={styles.continueBody}>
              Inkling can administer the {nextScreener.fullName ?? nextScreener.shortName} ({nextScreener.shortName}) for a fuller picture. {nextScreener.items.length} items, about {nextScreener.estimatedMinutes} minutes.
            </Text>
            <Pressable
              onPress={handleNext}
              style={({ pressed }) => [styles.cta, pressed && styles.pressed]}
              hitSlop={12}
            >
              <Text style={styles.ctaText}>Begin {nextScreener.shortName} {'\u2192'}</Text>
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
  screenerSection: { marginBottom: spacing.xxxl },
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
    marginLeft: spacing.s,
  },
  cutoffStatus: {
    ...typography.body,
    color: colors.light.ink,
    marginTop: spacing.m,
  },
  subscales: { marginTop: spacing.xxl },
  subscaleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingVertical: spacing.s,
  },
  subscaleName: { ...typography.body, fontSize: 16, color: colors.light.ink },
  subscaleValue: {
    ...typography.body,
    fontSize: 16,
    color: colors.light.inkSoft,
    fontVariant: ['tabular-nums'],
  },
  interpretationSection: { marginBottom: spacing.xxxl },
  rule: {
    height: 1,
    backgroundColor: colors.light.rule,
    marginBottom: spacing.xxl,
  },
  proseParagraph: {
    ...typography.display,
    fontSize: 18,
    lineHeight: 30,
    letterSpacing: 0,
    color: colors.light.ink,
    marginBottom: spacing.l,
  },
  loadingText: {
    ...typography.display,
    fontSize: 18,
    lineHeight: 28,
    letterSpacing: 0,
    fontStyle: 'italic',
    color: colors.light.inkSoft,
  },
  errorText: {
    ...typography.body,
    color: colors.light.ink,
    marginBottom: spacing.m,
  },
  retryLink: {
    ...typography.body,
    color: colors.light.ink,
    textDecorationLine: 'underline',
  },
  resourcesSection: { marginBottom: spacing.xxxl },
  resourceCategory: {
    ...typography.body,
    fontSize: 14,
    fontWeight: '600',
    color: colors.light.ink,
    marginBottom: spacing.m,
    marginTop: spacing.l,
  },
  resourceGroup: { marginBottom: spacing.m },
  resourceItem: {
    ...typography.body,
    fontSize: 16,
    color: colors.light.ink,
    marginBottom: spacing.s,
  },
  resourceLink: {
    ...typography.body,
    fontSize: 16,
    color: colors.light.ink,
    textDecorationLine: 'underline',
    marginBottom: 2,
  },
  resourceMeta: {
    ...typography.caption,
    fontSize: 13,
    color: colors.light.inkSoft,
    marginBottom: spacing.m,
  },
  resourceProse: {
    ...typography.display,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0,
    color: colors.light.ink,
    marginTop: spacing.xs,
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
    marginBottom: spacing.l,
  },
  continueBody: {
    ...typography.display,
    fontSize: 18,
    lineHeight: 28,
    letterSpacing: 0,
    color: colors.light.ink,
    marginBottom: spacing.xl,
  },
  cta: { alignSelf: 'flex-start' },
  ctaText: {
    ...typography.headline,
    fontSize: 20,
    letterSpacing: 0,
    color: colors.light.ink,
    textDecorationLine: 'underline',
  },
  pressed: { opacity: 0.4 },
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
