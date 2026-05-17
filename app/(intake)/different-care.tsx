import React from 'react';
import { View, Text, ScrollView, Pressable, Linking } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native';
import { tap } from '../../lib/haptics';
import { getDifferentCareCategory } from '../../lib/resources/different-care';
import { colors } from '../../design/colors';
import { typography } from '../../design/typography';
import { spacing } from '../../design/spacing';

export default function DifferentCareScreen() {
  const router = useRouter();
  const { categoryId } = useLocalSearchParams<{
    categoryId?: string;
  }>();

  const category = categoryId ? getDifferentCareCategory(categoryId) : undefined;

  const handleBack = () => {
    tap.selection();
    if (router.canGoBack()) router.back();
    else router.replace('/');
  };

  const handleHome = () => {
    tap.selection();
    router.replace('/');
  };

  const handleOrgLink = (url?: string) => {
    if (!url) return;
    tap.selection();
    Linking.openURL(url).catch(() => {});
  };

  // Fallback if categoryId is missing or unknown
  if (!category) {
    return (
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.content}>
            <Text style={styles.kicker}>A different kind of attention</Text>
            <Text style={styles.headline}>
              What you described may need care Inkling is not built to offer.
            </Text>
            <Text style={styles.body}>
              If you'd like to type what's been going on in your own words, the routing
              screen can help find the right next step.
            </Text>
            <View style={styles.actions}>
              <Pressable onPress={handleHome} hitSlop={12}>
                <Text style={styles.secondaryLink}>Take me home</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.content}>
          <Text style={styles.kicker}>A different kind of attention</Text>
          <Text style={styles.headline}>
            What you described needs care Inkling is not built to offer.
          </Text>

          <Text style={styles.body}>
            Inkling administers screening instruments for autism, ADHD, anxiety,
            depression, and trauma in adults. What you brought us — {category.displayLabel} —
            is outside the territory those instruments cover. That is not a judgment, and
            it is not us turning you away. It is information about where Inkling's tools
            stop being the right ones, and where to find tools that fit.
          </Text>

          <Text style={styles.sectionLabel}>What this covers</Text>
          <Text style={styles.body}>{category.whatThisCovers}</Text>

          <Text style={styles.sectionLabel}>The kind of clinician to look for</Text>
          <Text style={styles.body}>{category.clinicianType}</Text>

          <Text style={styles.sectionLabel}>Organizations that can help</Text>
          {category.organizations.map((org) => (
            <Pressable
              key={org.name}
              onPress={() => handleOrgLink(org.url)}
              style={({ pressed }) => [styles.orgCard, pressed && styles.pressed]}
              hitSlop={8}
            >
              <Text style={styles.orgName}>{org.name}</Text>
              <Text style={styles.orgDescription}>{org.description}</Text>
            </Pressable>
          ))}

          {category.crisisLine ? (
            <View style={styles.crisisCallout}>
              <Text style={styles.crisisLabel}>If you want to talk to someone now</Text>
              <Text style={styles.crisisBody}>
                {category.crisisLine.name}: {category.crisisLine.number}
              </Text>
            </View>
          ) : null}

          <Text style={styles.honestyNote}>
            If you'd like to use Inkling for something else you've been carrying, you can
            go back and choose a different path. We wanted to be honest with you first.
          </Text>

          <View style={styles.actions}>
            <Pressable onPress={handleBack} hitSlop={12}>
              <Text style={styles.secondaryLink}>Go back</Text>
            </Pressable>
            <Pressable onPress={handleHome} hitSlop={12}>
              <Text style={styles.secondaryLink}>Take me home</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.light.bg },
  scroll: { flexGrow: 1, paddingHorizontal: spacing.xl, paddingVertical: spacing.xl },
  content: { maxWidth: 640, alignSelf: 'center', width: '100%' },
  kicker: {
    ...typography.caption,
    fontSize: 13,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: colors.light.inkSoft,
    marginBottom: spacing.m,
  },
  headline: {
    ...typography.headline,
    color: colors.light.ink,
    marginBottom: spacing.xl,
  },
  body: {
    ...typography.body,
    color: colors.light.ink,
    marginBottom: spacing.l,
  },
  sectionLabel: {
    ...typography.caption,
    fontSize: 13,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: colors.light.inkSoft,
    marginTop: spacing.xl,
    marginBottom: spacing.m,
  },
  orgCard: {
    paddingVertical: spacing.m,
    borderTopWidth: 1,
    borderTopColor: colors.light.rule,
  },
  orgName: {
    ...typography.body,
    fontWeight: '600',
    color: colors.light.ink,
    marginBottom: spacing.xs,
  },
  orgDescription: {
    ...typography.body,
    fontSize: 15,
    lineHeight: 22,
    color: colors.light.inkSoft,
  },
  crisisCallout: {
    marginTop: spacing.xl,
    padding: spacing.l,
    borderWidth: 1,
    borderColor: colors.light.rule,
  },
  crisisLabel: {
    ...typography.caption,
    fontSize: 13,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: colors.light.inkSoft,
    marginBottom: spacing.s,
  },
  crisisBody: {
    ...typography.body,
    color: colors.light.ink,
  },
  honestyNote: {
    ...typography.body,
    fontStyle: 'italic',
    color: colors.light.inkSoft,
    marginTop: spacing.xxxl,
    marginBottom: spacing.xl,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.xl,
    marginTop: spacing.l,
  },
  secondaryLink: {
    ...typography.body,
    color: colors.light.ink,
    textDecorationLine: 'underline',
  },
  pressed: { opacity: 0.4 },
});
