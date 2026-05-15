import { Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../design/colors';
import { typography } from '../../design/typography';

export default function CrisisPreScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Crisis pre-screen</Text>
      <Text style={styles.sub}>placeholder — built next</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.light.paper, alignItems: 'center', justifyContent: 'center', gap: 8 },
  title: { ...typography.headline, color: colors.light.ink },
  sub: { ...typography.caption, color: colors.light.inkSoft },
});
