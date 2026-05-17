import { ScrollView, View, StyleSheet, Text, Pressable, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { tap } from '../../lib/haptics';
import { colors } from '../../design/colors';
import { typography } from '../../design/typography';
import { spacing } from '../../design/spacing';

type Resource = {
  name: string;
  description: string;
  action: { label: string; url: string };
};

const RESOURCES: Resource[] = [
  {
    name: '988 Suicide & Crisis Lifeline',
    description: 'Free, confidential support, 24 hours.',
    action: { label: 'Call or text 988', url: 'tel:988' },
  },
  {
    name: 'Crisis Text Line',
    description: 'Trained counselors, free, 24 hours.',
    action: { label: 'Text HOME to 741741', url: 'sms:741741&body=HOME' },
  },
  {
    name: 'The Trevor Project',
    description: 'Crisis support for LGBTQ+ young people, 24 hours.',
    action: { label: 'Call 1-866-488-7386', url: 'tel:18664887386' },
  },
  {
    name: 'Veterans Crisis Line',
    description: 'Call 988 and press 1, or text 838255.',
    action: { label: 'Call 988', url: 'tel:988' },
  },
  {
    name: 'Outside the US',
    description: 'Find crisis support in your country through Befrienders Worldwide.',
    action: { label: 'Open befrienders.org', url: 'https://befrienders.org' },
  },
];

export default function CrisisResources() {
  const handleResource = (url: string) => {
    tap.selection();
    Linking.openURL(url);
  };

  const handleContinue = () => {
    tap.selection();
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };

  const handleHome = () => {
    tap.selection();
    router.replace('/');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Text style={styles.title}>Help is one tap away.</Text>
        <Text style={styles.subhead}>
          Whatever brought you here, you don't have to be alone in it. These lines are answered by trained counselors.
        </Text>
      </View>

      <ScrollView
        style={styles.resourcesScroll}
        contentContainerStyle={styles.resources}
        showsVerticalScrollIndicator={false}
      >
        {RESOURCES.map((r) => (
          <Pressable
            key={r.name}
            style={({ pressed }) => [styles.resourceCard, pressed && styles.resourceCardPressed]}
            onPress={() => handleResource(r.action.url)}
          >
            <Text style={styles.resourceName}>{r.name}</Text>
            <Text style={styles.resourceDescription}>{r.description}</Text>
            <Text style={styles.resourceAction}>{r.action.label}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          style={({ pressed }) => [styles.linkButton, pressed && styles.linkButtonPressed]}
          onPress={handleContinue}
        >
          <Text style={styles.linkLabel}>I'm safe right now — continue</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.linkButton, pressed && styles.linkButtonPressed]}
          onPress={handleHome}
        >
          <Text style={styles.linkLabelSoft}>Take me to the home screen</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.light.paper, paddingHorizontal: spacing.l },
  header: { paddingTop: spacing.xl, gap: spacing.s, paddingBottom: spacing.l },
  title: { ...typography.headline, color: colors.light.ink, fontSize: 26 },
  subhead: { ...typography.body, color: colors.light.inkSoft, lineHeight: 24 },
  resourcesScroll: { flex: 1 },
  resources: { gap: spacing.m, paddingBottom: spacing.l },
  resourceCard: { backgroundColor: colors.light.paperDim, padding: spacing.l, borderRadius: 12, gap: spacing.xs },
  resourceCardPressed: { opacity: 0.85 },
  resourceName: { ...typography.bodyLarge, color: colors.light.ink, fontWeight: '500' },
  resourceDescription: { ...typography.body, color: colors.light.inkSoft },
  resourceAction: { ...typography.body, color: colors.light.accent, fontWeight: '500', marginTop: spacing.xs },
  footer: { paddingBottom: spacing.l, gap: spacing.xs, alignItems: 'center' },
  linkButton: { paddingVertical: spacing.s },
  linkButtonPressed: { opacity: 0.6 },
  linkLabel: { ...typography.body, color: colors.light.ink, fontWeight: '500' },
  linkLabelSoft: { ...typography.body, color: colors.light.inkSoft },
});
