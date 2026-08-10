import {
  accidentalSideFor,
  assignedFeature,
  BLUES_HOMES,
  isDominantIdiom,
} from '@/lib/key-analysis';
import type { ChordFeature, KeyCandidate, Mode, ProgressionChord } from '@/lib/key-analysis';
import { buildScale, maskOf } from '@/lib/scale-library';
import type { Scale } from '@/lib/scale-library';
import type { RootName } from '@/lib/chord-library';

import { buildExceptionSpans } from './deltas';
import type { PentatonicVerdict, ScalePlan } from './types';

function mod12(n: number): number {
  return ((n % 12) + 12) % 12;
}

// Chromatic spellings per accidental side. These agree with the key-name tables
// in key-analysis: a flat key names its tones in flats, a sharp key in sharps.
const FLAT_NAMES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'] as const;
const SHARP_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const;

function sideNames(side: 'sharp' | 'flat'): readonly RootName[] {
  return (side === 'sharp' ? SHARP_NAMES : FLAT_NAMES) as readonly RootName[];
}

/**
 * The colours a tonal centre can carry for a whole progression: the modes of the
 * major scale whose tonic triad agrees with the key's own, in the order a player
 * is likely to want them. A progression that never leaves one of these is better
 * described by it than by the key's plain scale and a list of exceptions — a
 * ♭VII in a major key is Mixolydian, a major IV in a minor key is Dorian.
 *
 * The rest of the catalogue is deliberately absent. Harmonic minor, melodic
 * minor, the altered scale and the chord-scales describe a *local* alteration —
 * a leading tone raised to carry a dominant, one scale over one chord — not the
 * colour of a tune. Those belong in the exception spans, which is what keeps
 * Am–Dm–E7–Am reading as A natural minor with a raised 7th over the E7 rather
 * than as A harmonic minor from end to end. Locrian is absent for a plainer
 * reason: its tonic triad is diminished, so it can never agree with a key.
 */
const GLOBAL_MODES: Record<Mode, readonly string[]> = {
  major: ['major', 'mixolydian', 'lydian'],
  minor: ['minor', 'dorian', 'phrygian'],
};

function coverageOf(mask: number, features: readonly ChordFeature[]): number {
  let covered = 0;
  for (const feature of features) {
    if (feature.pitchClasses.every((pc) => ((mask >> pc) & 1) === 1)) covered += 1;
  }
  return covered;
}

/**
 * Which scale to hear the progression in. The key's own scale is the default and
 * keeps the job unless another mode of the same tonic covers *strictly* more
 * chords: a tie is no reason to leave the familiar frame, and trying the modes
 * in preference order means the first of several equals wins.
 */
function chooseGlobal(
  features: readonly ChordFeature[],
  tonicPc: number,
  mode: Mode,
  names: readonly RootName[],
): Scale {
  const [defaultId, ...alternates] = GLOBAL_MODES[mode];
  let best = buildScale(names[tonicPc], defaultId);
  let bestCoverage = coverageOf(maskOf(best), features);

  for (const id of alternates) {
    const candidate = buildScale(names[tonicPc], id);
    const coverage = coverageOf(maskOf(candidate), features);
    if (coverage > bestCoverage) {
      best = candidate;
      bestCoverage = coverage;
    }
  }
  return best;
}

/**
 * The scale plan for a progression against one key: the mode of the key's tonic
 * that best covers it, the pentatonic lens on that, and the minimal note changes
 * where it stops covering the chords. Consumes the key engine's verdict the same
 * way romanLabelsFor does — `key.assignment` picks each chord's reading, so the
 * advice always describes the analysis the user is looking at.
 *
 * The key fixes the tonic and the plan fixes the colour: those are separate
 * questions, and answering the second one is the difference between "G major,
 * one spot to watch" and "G Mixolydian" for the same four chords.
 */
export function scalePlanFor(
  chords: readonly ProgressionChord[],
  key: KeyCandidate,
  accidentalPreference: 'sharp' | 'flat' = 'flat',
): ScalePlan | null {
  if (chords.length === 0) return null;

  const { tonicPc, mode } = key;
  const features = chords.map((chord, i) => assignedFeature(chord, key, i));
  const side = accidentalSideFor(tonicPc, mode, accidentalPreference);
  const names = sideNames(side);

  const global = chooseGlobal(features, tonicPc, mode, names);
  const globalMask = maskOf(global);

  const covered = features.map((f) => f.pitchClasses.every((pc) => ((globalMask >> pc) & 1) === 1));

  // The blues gate: with dom7s saturating I/IV/V, the tonic minor pentatonic and
  // blues scale are the idiomatic answer, and the ♭7 rubs are the sound rather
  // than clashes. Major keys only — the same saturation in minor never reads as
  // an idiom the key engine recognises.
  const blues = mode === 'major' && isDominantIdiom(features, tonicPc);

  const relativePc = mode === 'major' ? mod12(tonicPc + 9) : mod12(tonicPc + 3);

  // Which five notes count as "the" pentatonic: the tonic minor pentatonic for a
  // blues or a minor key, the relative minor pentatonic for a plain major key —
  // the same five notes as the tonic major pentatonic, under the name guitarists
  // reach for first.
  const pentRootPc = blues || mode === 'minor' ? tonicPc : relativePc;
  const pentScale = buildScale(names[pentRootPc], 'minor-pentatonic');
  const alias = blues
    ? null
    : buildScale(names[mode === 'major' ? tonicPc : relativePc], 'major-pentatonic');

  // A chord the key's scale covers is idiomatic ground — the classic avoid notes
  // (C over G7 in C) live there and are a phrasing concern, not a switch-scales
  // concern — so only chords from outside the scale are worth testing. That
  // shortcut holds only while the pentatonic is itself *inside* the scale, which
  // is true of every diatonic pentatonic and false of the blues one: it brings
  // its own ♭3 and ♭7, and grinds against chords the major scale covers happily.
  const pentInsideGlobal = pentScale.pitchClasses.every((pc) => ((globalMask >> pc) & 1) === 1);

  const clashes: number[] = [];
  features.forEach((feature, index) => {
    // Inside the idiom the exemption is stated directly instead: a chord on I,
    // IV or V is the blues, and the rubs against it are the sound.
    if (blues) {
      if (BLUES_HOMES.has(mod12(feature.rootPc - tonicPc))) return;
    } else if (pentInsideGlobal && covered[index]) {
      return;
    }
    const pcs = new Set(feature.pitchClasses);
    const hit = pentScale.pitchClasses.some(
      (p) => !pcs.has(p) && (pcs.has(mod12(p - 1)) || pcs.has(mod12(p + 1))),
    );
    if (hit) clashes.push(index);
  });

  const pentatonic: PentatonicVerdict = {
    scale: pentScale,
    alias,
    survives: clashes.length === 0,
    clashes,
  };

  return {
    global,
    pentatonic,
    blues: blues ? buildScale(names[tonicPc], 'blues') : null,
    covered,
    exceptions: buildExceptionSpans(features, covered, global, relativePc, names),
  };
}
