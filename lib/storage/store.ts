import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { UserResponse } from '../scoring/types';
import { sqliteStorage } from './persist';

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

export type CompletedScreener = {
  screenerId: string;
  screenerVersion: string;
  totalScore: number;
  cutoff: number | null;
  cutoffMet: boolean;
  subscales: Record<string, number> | null;
  responses: UserResponse[];
  completedAt: number;
};

export type InProgressScreener = {
  screenerId: string;
  currentIndex: number;
  responses: Record<string, number>;
  startedAt: number;
};

export type InterpretationEntry = {
  body: string;
  generatedAt: number;
};

type AppState = {
  ageBucket: AgeBucket | null;
  ageAttestedAt: number | null;
  sexAtBirth: SexAtBirth | null;
  intakeFreeText: string | null;
  completedScreeners: CompletedScreener[];
  inProgressScreener: InProgressScreener | null;
  interpretations: Record<string, InterpretationEntry>;

  setAge: (bucket: AgeBucket) => void;
  setSexAtBirth: (s: SexAtBirth) => void;
  setIntakeFreeText: (text: string) => void;

  startOrResumeScreener: (screenerId: string) => void;
  setScreenerIndex: (n: number) => void;
  recordResponse: (itemId: string, responseIndex: number) => void;
  exitScreener: () => void;
  completeScreener: (result: CompletedScreener) => void;

  setInterpretation: (cacheKey: string, body: string) => void;
  clearInterpretations: () => void;

  reset: () => void;
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      ageBucket: null,
      ageAttestedAt: null,
      sexAtBirth: null,
      intakeFreeText: null,
      completedScreeners: [],
      inProgressScreener: null,
      interpretations: {},

      setAge: (bucket) => set({ ageBucket: bucket, ageAttestedAt: Date.now() }),
      setSexAtBirth: (s) => set({ sexAtBirth: s }),
      setIntakeFreeText: (text) => set({ intakeFreeText: text }),

      startOrResumeScreener: (screenerId) =>
        set((state) => {
          if (state.inProgressScreener?.screenerId === screenerId) return {};
          return {
            inProgressScreener: {
              screenerId,
              currentIndex: 0,
              responses: {},
              startedAt: Date.now(),
            },
          };
        }),

      setScreenerIndex: (n) =>
        set((state) => {
          if (!state.inProgressScreener) return {};
          return {
            inProgressScreener: { ...state.inProgressScreener, currentIndex: n },
          };
        }),

      recordResponse: (itemId, responseIndex) =>
        set((state) => {
          if (!state.inProgressScreener) return {};
          return {
            inProgressScreener: {
              ...state.inProgressScreener,
              responses: {
                ...state.inProgressScreener.responses,
                [itemId]: responseIndex,
              },
            },
          };
        }),

      exitScreener: () => set({ inProgressScreener: null }),

      completeScreener: (result) =>
        set((state) => ({
          completedScreeners: [...state.completedScreeners, result],
          inProgressScreener: null,
        })),

      setInterpretation: (cacheKey, body) =>
        set((state) => ({
          interpretations: {
            ...state.interpretations,
            [cacheKey]: { body, generatedAt: Date.now() },
          },
        })),

      clearInterpretations: () => set({ interpretations: {} }),

      reset: () =>
        set({
          ageBucket: null,
          ageAttestedAt: null,
          sexAtBirth: null,
          intakeFreeText: null,
          completedScreeners: [],
          inProgressScreener: null,
          interpretations: {},
        }),
    }),
    {
      name: 'inkling-app-state',
      storage: createJSONStorage(() => sqliteStorage),
      partialize: (state) => ({
        ageBucket: state.ageBucket,
        ageAttestedAt: state.ageAttestedAt,
        sexAtBirth: state.sexAtBirth,
        intakeFreeText: state.intakeFreeText,
        completedScreeners: state.completedScreeners,
        inProgressScreener: state.inProgressScreener,
        interpretations: state.interpretations,
      }),
    }
  )
);
