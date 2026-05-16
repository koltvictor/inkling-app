export type ScreenerCategory = 'diagnostic-screener' | 'behavior-measure' | string;

export type Response = {
  label: string;
  scoringValue: number;
};

export type Item = {
  id: string;
  text: string;
  responses: Response[];
  safetyItem?: boolean;
};

export type SubscaleDefinition = Record<string, string[]>;

export type ScreenerScoring = {
  method?: 'sum';
  cutoff: number | null;
  cutoffInterpretation?: string;
  cutoffMeaning?: string;
  scoreRange?: { min: number; max: number };
  subscales: SubscaleDefinition | null;
};

export type Screener = {
  id: string;
  shortName: string;
  fullName?: string;
  name?: string;
  version: string;
  estimatedMinutes: number;
  category: string;
  citation?: string;
  copyright?: string;
  license?: string;
  publicDomain?: boolean;
  validityNotes?: string;
  instructions?: string;
  items: Item[];
  scoring: ScreenerScoring;
};

export type UserResponse = {
  itemId: string;
  responseIndex: number;
};

export type ScreenerScore = {
  totalScore: number;
  cutoff: number | null;
  cutoffMet: boolean;
  subscales: Record<string, number> | null;
  safetyEndorsed: boolean;
  safetyItemIds: string[];
};
