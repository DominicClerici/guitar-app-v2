import type { ZodError } from 'zod';

/**
 * A Zod failure flattened to one message per field, keyed by the field name a form holds its state
 * under. Only the first issue per field survives: showing a field two complaints at once reads as
 * noise, and the second is usually a consequence of the first.
 *
 * Issues with no field path — a whole-object refinement, say — are dropped, so a form must attach
 * those to a field with `path` if it wants them shown.
 */
export function fieldErrors(error: ZodError): Record<string, string> {
  const result: Record<string, string> = {};

  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === 'string' && !(key in result)) result[key] = issue.message;
  }

  return result;
}
