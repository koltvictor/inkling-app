import { Pressable, Text, View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { tap } from '../lib/haptics';
import { colors } from '../design/colors';
import { typography } from '../design/typography';

/**
 * Inline crisis affordance. Render at the top of any screen where
 * surfacing crisis support adds value. Each screen decides — there
 * is no global overlay.
 */
export function CrisisAffordance() {
  const handlePress = () => {
    tap.selection();
    router.push('/resources');
  };

  return (
    <View style={styles.container}>
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
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  button: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: colors.light.crisis,
    borderRadius: 999,
    backgroundColor: colors.light.paper,
  },
  pressed: { opacity: 0.6 },
  label: {
    ...typography.caption,
    fontSize: 13,
    fontWeight: '500',
    color: colors.light.crisis,
  },
});
