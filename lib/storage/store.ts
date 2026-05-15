import { create } from 'zustand';

export type AgeBucket = '18-29' | '30-39' | '40-49' | '50-59' | '60-69' | '70+';

export function ageToBucket(age: number): AgeBucket | null {
  if (age < 18) return null;
  if (age < 30) return '18-29';
  if (age < 40) return '30-39';
  if (age < 50) return '40-49';
  if (age < 60) return '50-59';
  if (age < 70) return '60-69';
  return '70+';
}

type AppState = {
  ageBucket: AgeBucket | null;
  ageAttestedAt: number | null;
  setAge: (bucket: AgeBucket) => void;
  reset: () => void;
};

export const useAppStore = create<AppState>((set) => ({
  ageBucket: null,
  ageAttestedAt: null,
  setAge: (bucket) => set({ ageBucket: bucket, ageAttestedAt: Date.now() }),
  reset: () => set({ ageBucket: null, ageAttestedAt: null }),
}));
