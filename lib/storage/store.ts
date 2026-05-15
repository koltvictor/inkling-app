import { create } from 'zustand';

export type AgeBucket = '18-29' | '30-39' | '40-49' | '50-59' | '60-69' | '70+';
export type SexAtBirth = 'female' | 'male' | 'intersex' | 'prefer-not-to-say';

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
  sexAtBirth: SexAtBirth | null;
  intakeFreeText: string | null;
  setAge: (bucket: AgeBucket) => void;
  setSexAtBirth: (s: SexAtBirth) => void;
  setIntakeFreeText: (text: string) => void;
  reset: () => void;
};

export const useAppStore = create<AppState>((set) => ({
  ageBucket: null,
  ageAttestedAt: null,
  sexAtBirth: null,
  intakeFreeText: null,
  setAge: (bucket) => set({ ageBucket: bucket, ageAttestedAt: Date.now() }),
  setSexAtBirth: (s) => set({ sexAtBirth: s }),
  setIntakeFreeText: (text) => set({ intakeFreeText: text }),
  reset: () =>
    set({
      ageBucket: null,
      ageAttestedAt: null,
      sexAtBirth: null,
      intakeFreeText: null,
    }),
}));
