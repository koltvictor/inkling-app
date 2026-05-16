export const PATHS = {
  autism: {
    id: 'autism' as const,
    label: 'Mind, senses, and patterns',
    shortDescription:
      'How attention, sensory experience, and social processing work — and what does not quite fit the standard frame.',
    screenerIds: ['aq-10', 'raads-r', 'cat-q'] as const,
  },
  anxiety: {
    id: 'anxiety' as const,
    label: 'Anxiety and persistent worry',
    shortDescription:
      'Patterns of fear, restlessness, and physical tension that show up across many areas of life.',
    screenerIds: ['gad-7'] as const,
  },
  depression: {
    id: 'depression' as const,
    label: 'Low mood and lack of interest',
    shortDescription:
      'Patterns of sadness, fatigue, loss of pleasure, and the weight of feeling stuck.',
    screenerIds: ['phq-9'] as const,
  },
} as const;

export type PathId = keyof typeof PATHS;
export type Path = (typeof PATHS)[PathId];

const SCREENER_TO_PATH: Record<string, PathId> = (() => {
  const map: Record<string, PathId> = {};
  for (const path of Object.values(PATHS)) {
    for (const screenerId of path.screenerIds) {
      map[screenerId] = path.id;
    }
  }
  return map;
})();

export function pathForScreener(screenerId: string): PathId | null {
  return SCREENER_TO_PATH[screenerId] ?? null;
}

export function getAllPaths(): Path[] {
  return Object.values(PATHS);
}

export function getPath(pathId: PathId): Path {
  return PATHS[pathId];
}
