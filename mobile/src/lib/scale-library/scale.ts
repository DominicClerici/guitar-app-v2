import type { RootName } from '@/lib/chord-library';

import { scaleTypeById, SCALE_TYPES } from './catalog';
import { noteToPitchClass, spellScale } from './spell';
import type { Scale, ScaleType } from './types';

/** A scale fixed to a root, with its tones spelled and reduced to pitch classes. */
export function buildScale(root: RootName, typeId: string): Scale {
  const type = scaleTypeById(typeId) ?? SCALE_TYPES[0];
  const rootPc = noteToPitchClass(root);

  return {
    root,
    type,
    notes: spellScale(root, type),
    pitchClasses: type.semitones.map((semitone) => (rootPc + semitone) % 12),
  };
}

/**
 * The scale as a 12-bit set of pitch classes. Reducing a scale to one integer is
 * what makes comparing every scale against every other cheap enough to do on
 * every render — see neighbours.ts.
 */
export function pitchClassMask(rootPc: number, type: ScaleType): number {
  let mask = 0;
  for (const semitone of type.semitones) mask |= 1 << ((rootPc + semitone) % 12);
  return mask;
}

export function maskOf(scale: Scale): number {
  let mask = 0;
  for (const pc of scale.pitchClasses) mask |= 1 << pc;
  return mask;
}

/** Which of a scale's tones carries the degree the catalogue marks as its accent. */
export function accentPitchClass(scale: Scale): number | null {
  const accent = scale.type.accent;
  if (!accent) return null;

  const index = scale.type.degrees.indexOf(accent.degree);
  return index < 0 ? null : scale.pitchClasses[index];
}

/** Degree label for a pitch class in this scale, or null if it isn't in it. */
export function degreeAt(scale: Scale, pitchClass: number): string | null {
  const index = scale.pitchClasses.indexOf(pitchClass);
  return index < 0 ? null : scale.type.degrees[index];
}
