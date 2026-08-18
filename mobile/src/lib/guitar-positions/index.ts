// Carving a scale on the neck into boxes you can actually hold.
//
// CAGED windows (windows.ts) suit any scale: they are fret spans anchored on the
// root, and a span holding too few notes to be worth paging to is dropped there
// rather than here. What the note count decides is the *second* system offered
// alongside them:
//   seven notes → three-per-string shapes (nps.ts), which need a scale that fills
//                 a string three notes at a time
//   five or six → the pentatonic boxes, a different five-window tiling
//
// Pure number math over @/lib/theory's neck. No React, no native modules.

import { noteToPitchClass, type Scale } from '@/lib/scale-library';
import type { Tuning } from '@/lib/tuning';

import { NPS_SCALE_SIZE, npsPositions } from './nps';
import type { Position, PositionSystem } from './types';
import { boxPositions, cagedPositions } from './windows';

export {
  CAGED_FORM_OFFSETS,
  CAGED_FORMS,
  CAGED_QUALITIES,
  cagedFillMarks,
  cagedFormWindow,
  cagedFormWindows,
  cagedLadderLanes,
  cagedMarks,
  type CagedFill,
  type CagedForm,
  type CagedLayer,
  type CagedMark,
  type CagedQuality,
  type CagedWindow,
} from './caged';
export { nextScalePitch, positionKey, scaleKeys, stringPitches } from './neck';
export {
  STRING_SET_INDICES,
  STRING_SETS,
  TRIAD_INVERSIONS,
  TRIAD_QUALITIES,
  TRIAD_SYMBOL,
  triadLadder,
  triadLadderLanes,
  triadVoicing,
  triadVoicings,
  type StringSet,
  type TriadInversion,
  type TriadNote,
  type TriadQuality,
  type TriadVoicing,
} from './triads';
export type { Position, PositionSystem } from './types';

/** Which systems this scale can be carved into, in the order a toggle shows them. */
export function systemsFor(scale: Scale): PositionSystem[] {
  return scale.type.semitones.length === NPS_SCALE_SIZE ? ['caged', 'nps'] : ['caged', 'boxes'];
}

export const SYSTEM_LABELS: Record<PositionSystem, string> = {
  caged: 'CAGED',
  nps: '3/str',
  boxes: 'Boxes',
};

export function positionsFor(
  tuning: Tuning,
  scale: Scale,
  system: PositionSystem,
): Position[] {
  const rootPc = noteToPitchClass(scale.root);

  if (system === 'nps') return npsPositions(tuning, scale.pitchClasses);
  if (system === 'boxes') return boxPositions(tuning, rootPc, scale.pitchClasses);
  return cagedPositions(tuning, rootPc, scale.pitchClasses);
}
