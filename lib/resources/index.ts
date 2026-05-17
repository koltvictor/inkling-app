import { autismResources } from './autism';
import { anxietyResources } from './anxiety';
import { depressionResources } from './depression';
import { adhdResources } from './adhd';
import { traumaResources } from './trauma';
import type { PathResources } from './types';
import type { PathId } from '../paths';

export const RESOURCES: Record<PathId, PathResources> = {
  autism: autismResources,
  anxiety: anxietyResources,
  depression: depressionResources,
  adhd: adhdResources,
  trauma: traumaResources,
};

export function getResourcesForPath(pathId: PathId): PathResources {
  return RESOURCES[pathId];
}

export type { PathResources, Resource } from './types';
