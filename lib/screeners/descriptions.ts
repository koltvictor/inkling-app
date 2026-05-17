/**
 * Editorial copy for screener UX.
 *
 * `valueAdd` is the one-sentence "what this adds" line shown in the
 * interpretation page's "Continue if you would like" section. Keep these
 * grounded in what the instrument actually measures and what the user
 * gains by taking it next — no marketing tone, no hedging.
 */
export type ScreenerDescription = {
  valueAdd: string;
};

export const SCREENER_DESCRIPTIONS: Record<string, ScreenerDescription> = {
  'aq-10': {
    valueAdd:
      'a brief check on whether the autism question has signal worth taking further',
  },
  'raads-r': {
    valueAdd:
      'developmental history, sensory experience, and the lifetime patterns brief screeners cannot reach',
  },
  'cat-q': {
    valueAdd:
      'masking specifically — the conscious work of presenting an acceptable surface, which surface-behavior screeners systematically under-detect',
  },
  'gad-7': {
    valueAdd:
      'a brief picture of anxiety over the past two weeks — worry, restlessness, irritability, and physical tension',
  },
  'phq-9': {
    valueAdd:
      'a brief picture of depressive patterns over the past two weeks — mood, energy, sleep, appetite, and the presence of intrusive thoughts',
  },
};

export function getScreenerDescription(id: string): ScreenerDescription | undefined {
  return SCREENER_DESCRIPTIONS[id];
}
