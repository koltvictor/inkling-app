/**
 * Dev-only logging. Calls are no-ops in TestFlight and production builds
 * because __DEV__ is false there. Metro also strips dead branches during
 * production bundling, so these calls have zero runtime cost in release.
 */
export function debugLog(message: string, ...rest: unknown[]): void {
  if (__DEV__) {
    // eslint-disable-next-line no-console
    console.log(`[INKLING DEBUG] ${message}`, ...rest);
  }
}
