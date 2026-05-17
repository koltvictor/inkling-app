import type { Screener } from '../scoring/types';
import type { CompletedScreener } from '../storage/store';
import { getScreener } from '../scoring/loader';
import { debugLog } from '../debug';

const API_URL = process.env.EXPO_PUBLIC_API_URL;
const API_SECRET = process.env.EXPO_PUBLIC_API_SECRET;

export type InterpretRequest = {
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
    intake: {
      ageBucket: intake.ageBucket ?? undefined,
      sexAtBirth: intake.sexAtBirth ?? undefined,
      intakeFreeText: intake.intakeFreeText ?? undefined,
    },
    screeners: completed.map((result) => {
      const screener = getScreener(result.screenerId);
      const subscaleMaxes = screener ? getSubscaleMaxes(screener) : null;

      let subscales: Record<string, { value: number; max: number }> | null = null;
      if (result.subscales && subscaleMaxes) {
        subscales = Object.fromEntries(
          Object.entries(result.subscales).map(([name, value]) => [
            name,
            { value: value as number, max: subscaleMaxes[name] ?? 0 },
          ])
        );
      }

      return {
        screenerId: result.screenerId,
        screenerVersion: result.screenerVersion ?? screener?.version ?? '1.0',
        shortName: screener?.shortName ?? result.screenerId,
        fullName: screener?.fullName ?? result.screenerId,
        totalScore: result.totalScore,
        scoreRange: screener?.scoring.scoreRange ?? { min: 0, max: 0 },
        cutoff: result.cutoff,
        cutoffMeaning: screener?.scoring.cutoffMeaning ?? null,
        cutoffMet: result.cutoffMet,
        subscales,
      };
    }),
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
    debugLog('API not configured', {
      hasUrl: !!API_URL,
      hasSecret: !!API_SECRET,
    });
    throw new Error(
      'API not configured. Check .env contains EXPO_PUBLIC_API_URL and EXPO_PUBLIC_API_SECRET.'
    );
  }

  debugLog('fetchInterpretation start', {
    url: `${API_URL}/interpret`,
    secretPrefix: API_SECRET.slice(0, 8),
    screenerCount: payload.screeners.length,
    payloadKeys: Object.keys(payload),
  });

  let response: Response;
  try {
    response = await fetch(`${API_URL}/interpret`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_SECRET}`,
      },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    debugLog('Fetch network error:', err);
    throw err;
  }

  debugLog('Response status:', response.status);

  if (!response.ok) {
    let errBody = '';
    try {
      errBody = await response.text();
    } catch {}
    debugLog('Error body:', errBody);
    throw new Error(`Interpretation API ${response.status}: ${errBody}`);
  }

  const data = await response.json();
  debugLog('Response received, keys:', Object.keys(data));
  return data;
}
