import { describe, it, expect } from 'vitest';
import phq9 from './lib/screeners/phq-9.json';
import { score } from './lib/scoring/score';
import type { Screener } from './lib/scoring/types';

describe('PHQ-9 safety smoke', () => {
  it('flags item 9 endorsement at any non-zero level', () => {
    const responses = (phq9 as Screener).items.map((item) => ({
      itemId: item.id,
      responseIndex: item.id === 'phq-9-9' ? 1 : 0,
    }));
    const result = score(phq9 as Screener, responses);
    expect(result.safetyEndorsed).toBe(true);
    expect(result.safetyItemIds).toEqual(['phq-9-9']);
    expect(result.totalScore).toBe(1);
    expect(result.cutoffMet).toBe(false);
  });

  it('does not flag when item 9 is "Not at all"', () => {
    const responses = (phq9 as Screener).items.map((item) => ({
      itemId: item.id,
      responseIndex: 0,
    }));
    const result = score(phq9 as Screener, responses);
    expect(result.safetyEndorsed).toBe(false);
    expect(result.safetyItemIds).toEqual([]);
  });
});
