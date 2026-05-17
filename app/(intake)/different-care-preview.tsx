// DEV-ONLY: preview screen for the different-care page variants.
// Lists all seven categories with buttons to navigate to each render.
// Remove this file before production launch.
import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { tap } from '../../lib/haptics';
import { getAllDifferentCareCategories } from '../../lib/resources/different-care';
import { colors } from '../../design/colors';
import { typography } from '../../design/typography';
import { spacing } from '../../design/spacing';

export default function DifferentCarePreviewScreen() {
  const router = useRouter();
  const categories = getAllDifferentCareCategories();

  if (!__DEV__) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.content}>
          <Text style={styles.body}>This screen is only available in development.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.content}>
          <Text style={styles.kicker}>Dev preview</Text>
          <Text style={styles.headline}>Different-care page variants</Text>
          <Text style={styles.body}>
            Tap each category to render its variant. Read the copy out loud. Mark anything
            that lands wrong.
          </Text>
          {categories.map((cat) => (
            <Pressable
              key={cat.id}
              onPress={() => {
                tap.selection();
                router.push(`/different-care?categoryId=${cat.id}` as any);
              }}
              style={({ pressed }) => [styles.button, pressed && styles.pressed]}
              hitSlop={8}
            >
              <Text style={styles.buttonLabel}>{cat.id}</Text>
              <Text style={styles.buttonSub}>{cat.displayLabel}</Text>
            </Pressable>
          ))}
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
    marginBottom: spacing.l,
  },
  body: {
    ...typography.body,
    color: colors.light.inkSoft,
    marginBottom: spacing.xl,
  },
  button: {
    paddingVertical: spacing.l,
    borderTopWidth: 1,
    borderTopColor: colors.light.rule,
  },
  buttonLabel: {
    ...typography.body,
    fontWeight: '600',
    color: colors.light.ink,
    marginBottom: 4,
  },
  buttonSub: {
    ...typography.body,
    fontSize: 15,
    color: colors.light.inkSoft,
  },
  pressed: { opacity: 0.4 },
});
