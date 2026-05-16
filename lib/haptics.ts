import * as Haptics from 'expo-haptics';

/**
 * Inkling haptic vocabulary. Three tiers, used sparingly.
 *
 * tap.selection() — light selection feedback for routine taps
 *   (answer chosen, continue, back, link tap, conversation send)
 *
 * tap.commit() — light impact for meaningful actions
 *   (finishing a screener, generating a letter, saving a quote card)
 *
 * tap.arrival() — success notification for the moment of arrival
 *   (interpretation rendered, letter generated)
 *
 * Crisis routing intentionally has no haptic. The soft visual transition
 * is the signal, not a vibration. Errors also have no haptic — they show
 * visually without bodily emphasis.
 */
export const tap = {
  selection: () => {
    Haptics.selectionAsync().catch(() => {});
  },
  commit: () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  },
  arrival: () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  },
};
