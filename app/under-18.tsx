import { View, StyleSheet, Text, Pressable, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { colors } from '../design/colors';
import { typography } from '../design/typography';
import { spacing } from '../design/spacing';

type Resource = {
  name: string;
  description: string;
  action: { label: string; url: string };
};

const RESOURCES: Resource[] = [
  {
    name: '988 Suicide & Crisis Lifeline',
    description: 'Call or text 988. Available 24 hours, every day.',
    action: { label: 'Call or text 988', url: 'tel:988' },
  },
  {
    name: 'Crisis Text Line',
    description: 'Trained counselors, free, 24 hours.',
    action: { label: 'Text HOME to 741741', url: 'sms:741741&body=HOME' },
  },
  {
    name: 'The Trevor Project',
    description: 'Crisis support for LGBTQ+ young people. Call, text, or chat, 24 hours.',
    action: { label: 'Call 1-866-488-7386', url: 'tel:18664887386' },
  },
];

export default function Under18Screen() {
  const handleResource = (url: string) => {
    Haptics.selectionAsync();
    Linking.openURL(url);
  };

  const handleBack = () => {
    Haptics.selectionAsync();
    router.replace('/');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Text style={styles.title}>Inkling is for adults.</Text>
        <Text style={styles.subhead}>
          The screening instruments Inkling uses are validated for adults 18 and older. If you're looking for support, these resources are designed with younger people in mind.
        </Text>
      </View>

      <View style={styles.resources}>
        {RESOURCES.map((r) => (
          <View key={r.name} style={styles.resourceCard}>
            <Text style={styles.resourceName}>{r.name}</Text>
            <Text style={styles.resourceDescription}>{r.description}</Text>
            <Pressable
              style={({ pressed }) => [styles.resourceAction, pressed && styles.resourceActionPressed]}
              onPress={() => handleResource(r.action.url)}
            >
              <Text style={styles.resourceActionLabel}>{r.action.label}</Text>
            </Pressable>
          </View>
        ))}
      </View>

      <View style={styles.footer}>
        <Pressable
          style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]}
          onPress={handleBack}
        >
          <Text style={styles.backLabel}>Go back</Text>
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
  resources: { flex: 1, justifyContent: 'center', gap: spacing.m },
  resourceCard: { backgroundColor: colors.light.paperDim, padding: spacing.l, borderRadius: 12, gap: spacing.xs },
  resourceName: { ...typography.bodyLarge, color: colors.light.ink, fontWeight: '500' },
  resourceDescription: { ...typography.body, color: colors.light.inkSoft },
  resourceAction: { marginTop: spacing.s, alignSelf: 'flex-start' },
  resourceActionPressed: { opacity: 0.65 },
  resourceActionLabel: { ...typography.body, color: colors.light.accent, fontWeight: '500', textDecorationLine: 'underline' },
  footer: { paddingBottom: spacing.l },
  backButton: { paddingVertical: spacing.m, alignItems: 'center' },
  backButtonPressed: { opacity: 0.65 },
  backLabel: { ...typography.body, color: colors.light.inkSoft },
});
