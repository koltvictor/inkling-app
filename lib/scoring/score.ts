import type { Screener, UserResponse, ScreenerScore } from './types';

export function score(screener: Screener, responses: UserResponse[]): ScreenerScore {
  let total = 0;
  for (const response of responses) {
    const item = screener.items.find((i) => i.id === response.itemId);
    if (!item) continue;
    const option = item.responses[response.responseIndex];
    if (!option) continue;
    total += option.scoringValue;
  }

  const cutoff = screener.scoring.cutoff;
  const cutoffMet = cutoff !== null && total >= cutoff;
  const subscales = screener.scoring.subscales
    ? calculateSubscales(screener, responses)
    : null;

  return { totalScore: total, cutoff, cutoffMet, subscales };
}

function calculateSubscales(
  screener: Screener,
  responses: UserResponse[]
): Record<string, number> {
  if (!screener.scoring.subscales) return {};
  const result: Record<string, number> = {};

  for (const [subscaleName, itemIds] of Object.entries(screener.scoring.subscales)) {
    let subscaleScore = 0;
    for (const itemId of itemIds) {
      const response = responses.find((r) => r.itemId === itemId);
      if (!response) continue;
      const item = screener.items.find((i) => i.id === itemId);
      if (!item) continue;
      const option = item.responses[response.responseIndex];
      if (!option) continue;
      subscaleScore += option.scoringValue;
    }
    result[subscaleName] = subscaleScore;
  }

  return result;
}
