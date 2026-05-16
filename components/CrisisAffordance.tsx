import { useSegments, router } from 'expo-router';
import { Pressable, Text, View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { tap } from '../lib/haptics';
import { colors } from '../design/colors';
import { typography } from '../design/typography';

/**
 * Persistent affordance that routes to /resources from any screen
 * where surfacing crisis support adds value rather than competes with
 * existing UI. Editorial register: small underlined text, top-right.
 */
const HIDDEN_PATTERNS = [
  '(crisis)',
  'under-18',
  '(intake)/age-gate',
  '(intake)/crisis-pre-screen',
  '(screener)',
  'settings',
];

export function CrisisAffordance() {
  const segments = useSegments();
  const insets = useSafeAreaInsets();

  const currentPath = segments.join('/');
  const isHidden = HIDDEN_PATTERNS.some((p) => currentPath.includes(p));

  if (isHidden) return null;

  const handlePress = () => {
    tap.selection();
    router.push('/resources');
  };

  return (
    <View
      style={[styles.container, { top: insets.top + 12 }]}
      pointerEvents="box-none"
    >
      <Pressable
        onPress={handlePress}
        hitSlop={16}
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}
      >
        <Text style={styles.label}>Need support</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 20,
    zIndex: 100,
  },
  button: {
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  pressed: { opacity: 0.5 },
  label: {
    ...typography.caption,
    fontSize: 13,
    color: colors.light.inkSoft,
    textDecorationLine: 'underline',
  },
});
