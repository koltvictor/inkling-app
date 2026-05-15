import { Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../design/colors';
import { typography } from '../../design/typography';

export default function AQ10Placeholder() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>AQ-10</Text>
      <Text style={styles.sub}>Screener engine — built next</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light.paper,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  title: { ...typography.display, color: colors.light.ink },
  sub: { ...typography.caption, color: colors.light.inkSoft },
});
