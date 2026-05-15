import { View, StyleSheet, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { BlotMark } from '../components/system/BlotMark';
import { colors } from '../design/colors';
import { typography } from '../design/typography';
import { spacing } from '../design/spacing';

export default function WelcomeScreen() {
  const handleBegin = () => {
    Haptics.selectionAsync();
    router.push('/age-gate');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
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
        <Pressable
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
          onPress={handleBegin}
        >
          <Text style={styles.buttonLabel}>Begin</Text>
        </Pressable>
        <Text style={styles.disclaimer}>
          Inkling administers validated screening instruments. It does not diagnose.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.light.paper, paddingHorizontal: spacing.l },
  hero: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  markWrap: { marginBottom: spacing.l },
  title: { ...typography.display, color: colors.light.ink, marginBottom: spacing.s, textAlign: 'center' },
  tagline: { ...typography.bodyLarge, color: colors.light.inkSoft, textAlign: 'center', maxWidth: 320 },
  footer: { paddingBottom: spacing.l, gap: spacing.l },
  button: {
    backgroundColor: colors.light.ink, paddingVertical: spacing.m,
    paddingHorizontal: spacing.xl, borderRadius: 999, alignItems: 'center',
  },
  buttonPressed: { opacity: 0.85 },
  buttonLabel: { ...typography.body, color: colors.light.paper, fontWeight: '500' },
  disclaimer: { ...typography.caption, color: colors.light.inkSoft, textAlign: 'center', maxWidth: 320, alignSelf: 'center' },
});
