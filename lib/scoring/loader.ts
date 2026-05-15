import aq10 from '../screeners/aq-10.json';
import raadsr from '../screeners/raads-r.json';
import { Screener } from './types';

const screeners: Record<string, Screener> = {
  'aq-10': aq10 as unknown as Screener,
  'raads-r': raadsr as unknown as Screener,
};

export function getScreener(id: string): Screener | undefined {
  return screeners[id];
}

export function getAllScreeners(): Screener[] {
  return Object.values(screeners);
}
