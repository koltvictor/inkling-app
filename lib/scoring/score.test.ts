import { describe, it, expect } from 'vitest';
import { score } from './score';
import aq10Json from '../screeners/aq-10.json';
import type { Screener, UserResponse } from './types';

const aq10: Screener = aq10Json as Screener;

describe('AQ-10 scoring', () => {
  it('scores 0 when every response is autism-inconsistent', () => {
    const responses: UserResponse[] = [
      { itemId: 'aq10-1', responseIndex: 3 },
      { itemId: 'aq10-2', responseIndex: 0 },
      { itemId: 'aq10-3', responseIndex: 0 },
      { itemId: 'aq10-4', responseIndex: 0 },
      { itemId: 'aq10-5', responseIndex: 0 },
      { itemId: 'aq10-6', responseIndex: 0 },
      { itemId: 'aq10-7', responseIndex: 3 },
      { itemId: 'aq10-8', responseIndex: 3 },
      { itemId: 'aq10-9', responseIndex: 0 },
      { itemId: 'aq10-10', responseIndex: 3 },
    ];
    const result = score(aq10, responses);
    expect(result.totalScore).toBe(0);
    expect(result.cutoffMet).toBe(false);
  });

  it('scores 10 when every response is autism-consistent', () => {
    const responses: UserResponse[] = [
      { itemId: 'aq10-1', responseIndex: 0 },
      { itemId: 'aq10-2', responseIndex: 3 },
      { itemId: 'aq10-3', responseIndex: 3 },
      { itemId: 'aq10-4', responseIndex: 3 },
      { itemId: 'aq10-5', responseIndex: 3 },
      { itemId: 'aq10-6', responseIndex: 3 },
      { itemId: 'aq10-7', responseIndex: 0 },
      { itemId: 'aq10-8', responseIndex: 0 },
      { itemId: 'aq10-9', responseIndex: 3 },
      { itemId: 'aq10-10', responseIndex: 0 },
    ];
    const result = score(aq10, responses);
    expect(result.totalScore).toBe(10);
    expect(result.cutoffMet).toBe(true);
  });

  it('returns cutoffMet=true at exactly the cutoff of 6', () => {
    const responses: UserResponse[] = [
      { itemId: 'aq10-1', responseIndex: 0 },
      { itemId: 'aq10-2', responseIndex: 3 },
      { itemId: 'aq10-3', responseIndex: 3 },
      { itemId: 'aq10-4', responseIndex: 3 },
      { itemId: 'aq10-5', responseIndex: 3 },
      { itemId: 'aq10-6', responseIndex: 3 },
      { itemId: 'aq10-7', responseIndex: 3 },
      { itemId: 'aq10-8', responseIndex: 3 },
      { itemId: 'aq10-9', responseIndex: 0 },
      { itemId: 'aq10-10', responseIndex: 3 },
    ];
    const result = score(aq10, responses);
    expect(result.totalScore).toBe(6);
    expect(result.cutoffMet).toBe(true);
  });

  it('returns cutoffMet=false at 5 (below cutoff)', () => {
    const responses: UserResponse[] = [
      { itemId: 'aq10-1', responseIndex: 0 },
      { itemId: 'aq10-2', responseIndex: 3 },
      { itemId: 'aq10-3', responseIndex: 3 },
      { itemId: 'aq10-4', responseIndex: 3 },
      { itemId: 'aq10-5', responseIndex: 3 },
      { itemId: 'aq10-6', responseIndex: 0 },
      { itemId: 'aq10-7', responseIndex: 3 },
      { itemId: 'aq10-8', responseIndex: 3 },
      { itemId: 'aq10-9', responseIndex: 0 },
      { itemId: 'aq10-10', responseIndex: 3 },
    ];
    const result = score(aq10, responses);
    expect(result.totalScore).toBe(5);
    expect(result.cutoffMet).toBe(false);
  });

  it('weights "Slightly" answers the same as "Definitely" per published scoring', () => {
    const responses: UserResponse[] = [
      { itemId: 'aq10-1', responseIndex: 1 },
      { itemId: 'aq10-2', responseIndex: 2 },
      { itemId: 'aq10-3', responseIndex: 1 },
      { itemId: 'aq10-4', responseIndex: 2 },
      { itemId: 'aq10-5', responseIndex: 1 },
      { itemId: 'aq10-6', responseIndex: 2 },
      { itemId: 'aq10-7', responseIndex: 1 },
      { itemId: 'aq10-8', responseIndex: 2 },
      { itemId: 'aq10-9', responseIndex: 1 },
      { itemId: 'aq10-10', responseIndex: 2 },
    ];
    const result = score(aq10, responses);
    expect(result.totalScore).toBe(5);
  });

  it('returns subscales=null for screeners without subscales (AQ-10)', () => {
    const responses: UserResponse[] = aq10.items.map((item) => ({
      itemId: item.id,
      responseIndex: 0,
    }));
    const result = score(aq10, responses);
    expect(result.subscales).toBeNull();
  });
});
