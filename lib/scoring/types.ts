export type ScreenerCategory = 'diagnostic-screener' | 'behavior-measure';

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
  method: 'sum';
  cutoff: number | null;
  cutoffInterpretation?: string;
  subscales: SubscaleDefinition | null;
};

export type Screener = {
  id: string;
  name: string;
  shortName: string;
  version: string;
  estimatedMinutes: number;
  citation: string;
  publicDomain: boolean;
  validityNotes: string;
  category: ScreenerCategory;
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
};
