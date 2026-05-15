import { describe, it, expect } from 'vitest';
import { score } from './score';
import raadsr from '../screeners/raads-r.json';
import { Screener, UserResponse, Item } from './types';

const screener = raadsr as unknown as Screener;

function responsesAtTargetValue(getTarget: (item: Item) => number): UserResponse[] {
  return screener.items.map((item) => {
    const responseIndex = item.responses.findIndex(
      (r) => r.scoringValue === getTarget(item)
    );
    if (responseIndex === -1) {
      throw new Error(`No response with target value for ${item.id}`);
    }
    return { itemId: item.id, responseIndex };
  });
}

describe('RAADS-R structure', () => {
  it('has 80 items', () => {
    expect(screener.items).toHaveLength(80);
  });

  it('has 17 reverse-scored items (asterisked normative)', () => {
    const reverseScored = screener.items.filter(
      (item) => item.responses[0].scoringValue === 0
    );
    expect(reverseScored).toHaveLength(17);
  });

  it('has 63 symptom-direction items', () => {
    const symptom = screener.items.filter(
      (item) => item.responses[0].scoringValue === 3
    );
    expect(symptom).toHaveLength(63);
  });

  it('reverse-scored item IDs match the appendix (1, 6, 11, 18, 23, 26, 33, 37, 43, 47, 48, 53, 58, 62, 68, 72, 77)', () => {
    const expectedReverseIds = [1, 6, 11, 18, 23, 26, 33, 37, 43, 47, 48, 53, 58, 62, 68, 72, 77].map(
      (n) => `raadsr-${n}`
    );
    const actualReverseIds = screener.items
      .filter((item) => item.responses[0].scoringValue === 0)
      .map((item) => item.id);
    expect(actualReverseIds.sort()).toEqual(expectedReverseIds.sort());
  });

  it('every item has exactly 4 response options', () => {
    screener.items.forEach((item) => {
      expect(item.responses).toHaveLength(4);
    });
  });

  it('every item response uses the canonical 4-point labels', () => {
    const canonicalLabels = [
      'True now and when I was young',
      'True only now',
      'True only when I was younger than 16',
      'Never true',
    ];
    screener.items.forEach((item) => {
      expect(item.responses.map((r) => r.label)).toEqual(canonicalLabels);
    });
  });

  it('all 80 items appear in exactly one subscale', () => {
    const subscales = screener.scoring.subscales!;
    const allItems = Object.values(subscales).flat();
    expect(allItems).toHaveLength(80);
    expect(new Set(allItems).size).toBe(80);
  });

  it('subscale counts match the paper (39 social, 14 interests, 7 language, 20 sensory-motor)', () => {
    const subscales = screener.scoring.subscales!;
    expect(subscales.social_relatedness).toHaveLength(39);
    expect(subscales.circumscribed_interests).toHaveLength(14);
    expect(subscales.language).toHaveLength(7);
    expect(subscales.sensory_motor).toHaveLength(20);
  });
});

describe('RAADS-R scoring', () => {
  it('scores 0 when all responses are minimum', () => {
    const responses = responsesAtTargetValue(() => 0);
    const result = score(screener, responses);
    expect(result.totalScore).toBe(0);
    expect(result.cutoffMet).toBe(false);
  });

  it('scores 240 when all responses are maximum', () => {
    const responses = responsesAtTargetValue(() => 3);
    const result = score(screener, responses);
    expect(result.totalScore).toBe(240);
    expect(result.cutoffMet).toBe(true);
  });

  it('meets cutoff at exactly 65', () => {
    const responses = screener.items.map((item, i) => {
      const target = i < 21 ? 3 : i === 21 ? 2 : 0;
      return {
        itemId: item.id,
        responseIndex: item.responses.findIndex((r) => r.scoringValue === target),
      };
    });
    const result = score(screener, responses);
    expect(result.totalScore).toBe(65);
    expect(result.cutoffMet).toBe(true);
  });

  it('does not meet cutoff at 64', () => {
    const responses = screener.items.map((item, i) => {
      const target = i < 21 ? 3 : i === 21 ? 1 : 0;
      return {
        itemId: item.id,
        responseIndex: item.responses.findIndex((r) => r.scoringValue === target),
      };
    });
    const result = score(screener, responses);
    expect(result.totalScore).toBe(64);
    expect(result.cutoffMet).toBe(false);
  });

  it('symptom item: "True now and when I was young" gives 3 points', () => {
    const item2 = screener.items.find((i) => i.id === 'raadsr-2')!;
    expect(item2.responses[0].label).toBe('True now and when I was young');
    expect(item2.responses[0].scoringValue).toBe(3);
    expect(item2.responses[3].label).toBe('Never true');
    expect(item2.responses[3].scoringValue).toBe(0);
  });

  it('normative item: "True now and when I was young" gives 0 points (reverse)', () => {
    const item1 = screener.items.find((i) => i.id === 'raadsr-1')!;
    expect(item1.responses[0].label).toBe('True now and when I was young');
    expect(item1.responses[0].scoringValue).toBe(0);
    expect(item1.responses[3].label).toBe('Never true');
    expect(item1.responses[3].scoringValue).toBe(3);
  });
});

describe('RAADS-R subscale computation', () => {
  it('social_relatedness subscale max is 117 (39 items x 3)', () => {
    const responses = responsesAtTargetValue(() => 3);
    const result = score(screener, responses);
    expect(result.subscales!.social_relatedness).toBe(117);
  });

  it('circumscribed_interests subscale max is 42 (14 items x 3)', () => {
    const responses = responsesAtTargetValue(() => 3);
    const result = score(screener, responses);
    expect(result.subscales!.circumscribed_interests).toBe(42);
  });

  it('language subscale max is 21 (7 items x 3)', () => {
    const responses = responsesAtTargetValue(() => 3);
    const result = score(screener, responses);
    expect(result.subscales!.language).toBe(21);
  });

  it('sensory_motor subscale max is 60 (20 items x 3)', () => {
    const responses = responsesAtTargetValue(() => 3);
    const result = score(screener, responses);
    expect(result.subscales!.sensory_motor).toBe(60);
  });

  it('subscale sum equals total score', () => {
    const responses = responsesAtTargetValue(() => 3);
    const result = score(screener, responses);
    const subscaleSum = Object.values(result.subscales!).reduce((a, b) => a + b, 0);
    expect(subscaleSum).toBe(result.totalScore);
  });
});
