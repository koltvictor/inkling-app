import { View, StyleSheet, Text, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { BlotMark } from "../components/system/BlotMark";
import { colors } from "../design/colors";
import { typography } from "../design/typography";
import { spacing } from "../design/spacing";
import { useAppStore } from "../lib/storage/store";
import { getScreener } from "../lib/scoring/loader";
import { tap } from '../lib/haptics';

export default function WelcomeScreen() {
  const inProgress = useAppStore((s) => s.inProgressScreener);
  const completedCount = useAppStore((s) => s.completedScreeners.length);

  const inProgressScreener = inProgress ? getScreener(inProgress.screenerId) : null;
  const hasResume = !!(inProgress && inProgressScreener);
  const hasCompleted = completedCount > 0;

  const handleBegin = () => {
    Haptics.selectionAsync();
    router.push("/age-gate");
  };

  const handleResume = () => {
    if (!inProgress) return;
    Haptics.selectionAsync();
    router.push(`/${inProgress.screenerId}`);
  };

  const handleViewResults = () => {
    Haptics.selectionAsync();
    router.push("/interpretation");
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
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
        <View style={styles.primaryAction}>
          {hasResume ? (
            <Pressable
              style={({ pressed }) => [
                styles.button,
                pressed && styles.buttonPressed,
              ]}
              onPress={handleResume}
            >
              <Text style={styles.buttonLabel}>
                Resume {inProgressScreener!.shortName}
              </Text>
            </Pressable>
          ) : (
            <Pressable
              style={({ pressed }) => [
                styles.button,
                pressed && styles.buttonPressed,
              ]}
              onPress={handleBegin}
            >
              <Text style={styles.buttonLabel}>Begin</Text>
            </Pressable>
          )}
          {hasResume && (
            <Text style={styles.resumeCaption}>
              Question {inProgress!.currentIndex + 1} of{" "}
              {inProgressScreener!.items.length}
            </Text>
          )}
        </View>

        {hasCompleted && (
          <Pressable onPress={handleViewResults} hitSlop={12}>
            <Text style={styles.secondaryLink}>View previous results →</Text>
          </Pressable>
        )}

        <Text style={styles.disclaimer}>
          Inkling administers validated screening instruments. It does not diagnose.
        </Text>
      </View>
            <Pressable
          onPress={() => { tap.selection(); router.push('/settings'); }}
          hitSlop={12}
          testID="settings-link"
          style={({ pressed }) => [welcomeStyles.settingsLink, pressed && { opacity: 0.5 }]}
        >
          <Text style={welcomeStyles.settingsLinkText}>Settings</Text>
        </Pressable>
      </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light.paper,
    paddingHorizontal: spacing.l,
  },
  hero: { flex: 1, alignItems: "center", justifyContent: "center" },
  markWrap: { marginBottom: spacing.l },
  title: {
    ...typography.display,
    color: colors.light.ink,
    marginBottom: spacing.s,
    textAlign: "center",
  },
  tagline: {
    ...typography.bodyLarge,
    color: colors.light.inkSoft,
    textAlign: "center",
    maxWidth: 320,
  },
  footer: {
    paddingBottom: spacing.l,
    gap: spacing.l,
    alignItems: "center",
  },
  primaryAction: {
    gap: spacing.xs,
    alignItems: "center",
    alignSelf: "stretch",
  },
  button: {
    backgroundColor: colors.light.ink,
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.xl,
    borderRadius: 999,
    alignItems: "center",
    alignSelf: "stretch",
  },
  buttonPressed: { opacity: 0.85 },
  buttonLabel: {
    ...typography.body,
    color: colors.light.paper,
    fontWeight: "500",
  },
  resumeCaption: {
    ...typography.caption,
    color: colors.light.inkSoft,
  },
  secondaryLink: {
    ...typography.body,
    color: colors.light.inkSoft,
    textDecorationLine: "underline",
  },
  disclaimer: {
    ...typography.caption,
    color: colors.light.inkSoft,
    textAlign: "center",
    maxWidth: 320,
  },
});

const welcomeStyles = StyleSheet.create({
  settingsLink: {
    position: 'absolute',
    bottom: 24,
    right: 24,
  },
  settingsLinkText: {
    fontSize: 13,
    color: '#A89F94',
    textDecorationLine: 'underline',
  },
});

