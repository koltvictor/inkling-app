import aq10 from '../screeners/aq-10.json';
import raadsr from '../screeners/raads-r.json';
import { Screener } from './types';
import phq9Json from '../screeners/phq-9.json';
import gad7Json from '../screeners/gad-7.json';

const screeners: Record<string, Screener> = {
  'aq-10': aq10 as unknown as Screener,
  'raads-r': raadsr,
  'phq-9': phq9Json as Screener,
  'gad-7': gad7Json as Screener,
  as unknown as Screener,
};

export function getScreener(id: string): Screener | undefined {
  return screeners[id];
}

export function getAllScreeners(): Screener[] {
  return Object.values(screeners);
}
