export type CrisisCategory =
  | 'active_si'
  | 'self_harm'
  | 'method_plan'
  | 'passive_si'
  | 'acute_crisis'
  | 'abuse'
  | 'psychosis_risk';

export type PrefilterResult =
  | { triggered: false }
  | { triggered: true; category: CrisisCategory; keyword: string };

const KEYWORDS: Array<{ category: CrisisCategory; phrases: string[] }> = [
  {
    category: 'active_si',
    phrases: [
      'kill myself', 'killing myself', 'end my life', 'ending my life',
      'want to die', 'wanting to die', 'want to be dead',
      'wish i was dead', 'wish i were dead',
      "won't be here", "won't be around",
      'take my own life', 'suicide', 'suicidal',
    ],
  },
  {
    category: 'self_harm',
    phrases: [
      'cut myself', 'cutting myself', 'hurt myself', 'hurting myself',
      'self harm', 'self-harm', 'burn myself', 'burning myself',
    ],
  },
  {
    category: 'method_plan',
    phrases: [
      'have a gun', 'have pills', 'have a plan',
      'going to do it', 'going to end it',
    ],
  },
  {
    category: 'passive_si',
    phrases: [
      "don't want to wake up", 'go to sleep and not wake up',
      'would be better off without me', 'everyone better off without me',
      'no point in living', 'no reason to live',
    ],
  },
  {
    category: 'acute_crisis',
    phrases: [
      "can't take it anymore", "can't do this anymore",
      'this is goodbye', 'last message',
    ],
  },
  {
    category: 'abuse',
    phrases: [
      'he hits me', 'she hits me', 'they hit me',
      'beats me', 'abuses me',
      'afraid to go home', "won't let me leave",
    ],
  },
  {
    category: 'psychosis_risk',
    phrases: [
      'voices telling me', 'voices in my head',
      "they're watching me", "they're following me",
    ],
  },
];

export function prefilter(text: string): PrefilterResult {
  const normalized = text.toLowerCase().trim();
  for (const { category, phrases } of KEYWORDS) {
    for (const phrase of phrases) {
      if (normalized.includes(phrase)) {
        return { triggered: true, category, keyword: phrase };
      }
    }
  }
  return { triggered: false };
}
