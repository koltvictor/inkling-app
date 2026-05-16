export interface ExpectedQualities {
  mustMention?: string[];
  mustAvoid?: string[];
  holdsLine: boolean;
  notes?: string;
}

export interface InterpretPayloadFixture {
  intake: {
    ageBucket?: string;
    sexAtBirth?: string;
    intakeFreeText?: string;
  };
  screeners: Array<{
    screenerId: string;
    screenerVersion: string;
    shortName: string;
    fullName: string;
    totalScore: number;
    scoreRange: { min: number; max: number };
    cutoff: number | null;
    cutoffMeaning: string | null;
    cutoffMet: boolean;
    subscales?: Record<string, { value: number; max: number }> | null;
  }>;
}

export interface EvalProfile {
  id: string;
  description: string;
  expectedQualities: ExpectedQualities;
  payload: InterpretPayloadFixture;
}

export interface EvalRunResult {
  profileId: string;
  description: string;
  ranAt: string;
  durationMs: number;
  interpretation?: string;
  error?: string;
  expectedQualities: ExpectedQualities;
}
