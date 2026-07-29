// Carving a scale on the neck into boxes you can actually hold.
//
// Two mechanisms, picked by how many notes the scale has:
//   seven notes → CAGED windows (windows.ts) or three-per-string shapes (nps.ts)
//   five or six → the pentatonic boxes, since neither of the above means anything
//                 for a scale that doesn't fill a string three notes at a time
//
// Pure number math over @/lib/theory's neck. No React, no native modules.

import { noteToPitchClass, type Scale } from '@/lib/scale-library';

import { NPS_SCALE_SIZE, npsPositions } from './nps';
import type { Position, PositionSystem } from './types';
import { boxPositions, cagedPositions } from './windows';

export { nextScalePitch, positionKey, scaleKeys, stringPitches } from './neck';
export type { Position, PositionSystem } from './types';

/** Which systems this scale can be carved into, in the order a toggle shows them. */
export function systemsFor(scale: Scale): PositionSystem[] {
  return scale.type.semitones.length === NPS_SCALE_SIZE ? ['caged', 'nps'] : ['boxes'];
}

export const SYSTEM_LABELS: Record<PositionSystem, string> = {
  caged: 'CAGED',
  nps: '3/str',
  boxes: 'Boxes',
};

export function positionsFor(scale: Scale, system: PositionSystem): Position[] {
  const rootPc = noteToPitchClass(scale.root);

  if (system === 'nps') return npsPositions(scale.pitchClasses);
  if (system === 'boxes') return boxPositions(rootPc, scale.pitchClasses);
  return cagedPositions(rootPc, scale.pitchClasses);
}
