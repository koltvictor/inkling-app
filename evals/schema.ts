// Quality expectations for /interpret endpoint profiles
export interface ExpectedQualities {
  mustMention?: string[];
  mustAvoid?: string[];
  holdsLine: boolean;
  notes?: string;
}

// Quality expectations for /classify endpoint profiles
export interface ClassifyExpectedQualities {
  expectedPathIds?: string[];           // at least one of these must be recommended
  mustNotIncludePathIds?: string[];     // none of these should be recommended
  rationaleMustReference?: string[];    // combined rationale text must include these (case-insensitive)
  expectedCrisis?: boolean;             // crisis flag should match this
  expectedOutOfScope?: boolean;         // outOfScope field should be non-null (true) or null (false)
  expectedOutOfScopeCategory?: string;  // when set, outOfScope.category must equal this
  holdsLine: boolean;                   // kept for shared schema; not checked for classify
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

export interface ClassifyPayloadFixture {
  intakeText: string;
}

export interface EvalProfile {
  id: string;
  description: string;
  endpoint?: 'interpret' | 'classify';  // default: 'interpret'
  expectedQualities: ExpectedQualities | ClassifyExpectedQualities;
  payload: InterpretPayloadFixture | ClassifyPayloadFixture;
}

export interface ClassifyRecommendation {
  pathId: string;
  rationale: string;
}

export interface ClassifyResponseBody {
  recommendations: ClassifyRecommendation[];
  crisis: boolean;
  outOfScope: { category: string; rationale: string } | null;
  parseError?: boolean;
}

// One execution of one profile
export interface RunOutcome {
  runIndex: number;
  ranAt: string;
  durationMs: number;
  interpretation?: string;
  classifyResponse?: ClassifyResponseBody;
  error?: string;
}

// Aggregated across N runs of one profile
export interface ProfileSummary {
  profileId: string;
  description: string;
  endpoint: 'interpret' | 'classify';
  expectedQualities: ExpectedQualities | ClassifyExpectedQualities;
  runs: RunOutcome[];
  runCount: number;
  errorCount: number;
  durationMsMean: number;
  durationMsMax: number;
  // Interpret-specific aggregates
  wordCountMean?: number;
  wordCountStddev?: number;
  wordCountMin?: number;
  wordCountMax?: number;
  mustMentionHitCounts?: Record<string, number>;
  mustAvoidViolationCounts?: Record<string, number>;
  // Classify-specific aggregates
  expectedPathHitCount?: number;
  mustNotIncludeViolationCount?: number;
  rationaleReferenceHitCounts?: Record<string, number>;
  crisisCorrectCount?: number;
  outOfScopeCorrectCount?: number;
  outOfScopeCategoryCorrectCount?: number;
}

// Kept for backward compat with any old consumers reading results.json
export interface EvalRunResult {
  profileId: string;
  description: string;
  ranAt: string;
  durationMs: number;
  interpretation?: string;
  error?: string;
  expectedQualities: ExpectedQualities | ClassifyExpectedQualities;
}
