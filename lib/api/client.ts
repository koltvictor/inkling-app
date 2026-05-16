import type { Screener } from '../scoring/types';
import type { CompletedScreener } from '../storage/store';
import { getScreener } from '../scoring/loader';

const API_URL = process.env.EXPO_PUBLIC_API_URL;
const API_SECRET = process.env.EXPO_PUBLIC_API_SECRET;

export type InterpretRequest = {
  sessionId: string;
  screenerResults: Array<{
    screenerId: string;
    shortName: string;
    fullName: string;
    totalScore: number;
    scoreMax: number;
    cutoff: number | null;
    cutoffMet: boolean;
    subscales: Record<string, number> | null;
    subscaleMaxes: Record<string, number> | null;
  }>;
  intakeContext?: {
    ageBucket?: string;
    sexAtBirth?: string;
    triageSummary?: string;
  };
};

export type InterpretResponse = {
  interpretation: string;
  generatedAt: number;
};

function getSubscaleMaxes(screener: Screener): Record<string, number> | null {
  if (!screener.scoring.subscales) return null;
  return Object.fromEntries(
    Object.entries(screener.scoring.subscales).map(([name, itemIds]) => [
      name,
      itemIds.reduce((sum, itemId) => {
        const item = screener.items.find((i) => i.id === itemId);
        if (!item) return sum;
        return sum + Math.max(...item.responses.map((r) => r.scoringValue));
      }, 0),
    ])
  );
}

export function buildInterpretPayload(
  completed: CompletedScreener[],
  intake: {
    ageBucket: string | null;
    sexAtBirth: string | null;
    intakeFreeText: string | null;
  }
): InterpretRequest {
  return {
    sessionId: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
    screenerResults: completed.map((result) => {
      const screener = getScreener(result.screenerId);
      return {
        screenerId: result.screenerId,
        shortName: screener?.shortName ?? result.screenerId,
        fullName: screener?.fullName ?? result.screenerId,
        totalScore: result.totalScore,
        scoreMax: screener?.scoring.scoreRange.max ?? 0,
        cutoff: result.cutoff,
        cutoffMet: result.cutoffMet,
        subscales: result.subscales,
        subscaleMaxes: screener ? getSubscaleMaxes(screener) : null,
      };
    }),
    intakeContext: {
      ageBucket: intake.ageBucket ?? undefined,
      sexAtBirth: intake.sexAtBirth ?? undefined,
      triageSummary: intake.intakeFreeText ?? undefined,
    },
  };
}

export function computeInterpretationCacheKey(
  completed: CompletedScreener[]
): string {
  return completed
    .map((s) => `${s.screenerId}@${s.completedAt}`)
    .sort()
    .join(',');
}

export async function fetchInterpretation(
  payload: InterpretRequest
): Promise<InterpretResponse> {
  if (!API_URL || !API_SECRET) {
    throw new Error(
      'API not configured. Check .env contains EXPO_PUBLIC_API_URL and EXPO_PUBLIC_API_SECRET.'
    );
  }

  const response = await fetch(`${API_URL}/interpret`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_SECRET}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Interpretation API ${response.status}`);
  }

  return response.json();
}
