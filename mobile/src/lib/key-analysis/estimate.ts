import { qualityOf } from './extract';
import {
  KS_MAJOR_PROFILE,
  KS_MINOR_PROFILE,
  MAJOR_BORROWED_OFFSETS,
  MINOR_BORROWED_OFFSETS,
  THIRDLESS_QUALITIES,
  slotFor,
  toleranceSet,
} from './scales';
import type {
  ChordFeature,
  KeyCandidate,
  KeyEstimate,
  Mode,
  ProgressionChord,
  Quality,
} from './types';

const W_CHORD_FIT = 1.0;
const W_KS = 0.6;
const W_POSITION = 0.5;

const REWARD_FULL = 1.0;
const REWARD_SEVENTH_BONUS = 0.3;
const REWARD_PARTIAL = 0.4;
const REWARD_BORROWED = 0.15;
const PENALTY_ACCIDENTAL = 0.1;

const BONUS_FIRST_TONIC = 0.3;
const BONUS_LAST_TONIC = 0.3;
const BONUS_CADENCE = 0.4;

// Chord roots carry extra harmonic weight in the pitch-class histogram, on top
// of their membership in pitchClasses (so a root totals this + 1).
const ROOT_HISTOGRAM_BONUS = 2;

const SOFTMAX_TEMPERATURE = 0.3;
const AMBIGUITY_EPSILON = 0.18;

// Coordinate ascent over reading choices converges in one or two sweeps in
// practice; the cap is a guard, not a budget that gets spent.
const MAX_ASCENT_SWEEPS = 4;
const SCORE_IMPROVEMENT_EPSILON = 1e-9;

const SEVENTH_QUALITIES = new Set<Quality>(['dom7', 'maj7', 'min7', 'min7b5', 'dim7', 'minMaj7']);

// Blues and blues-derived rock put a dominant 7th on I and IV as tonic colour,
// not as a functional dominant: a 12-bar in C is C7–F7–G7 and never leaves C.
// Scored functionally, each of those I7/IV7 chords reads as a flawless V7 of the
// subdominant, so every blues lands a fourth too high (C blues → F major).
//
// The allowance can't be unconditional — an isolated I7 in functional harmony
// really is V/IV (C–C7–F). It's gated instead on the progression as a whole
// reading as a dominant idiom, which is what actually distinguishes the two:
// blues saturates I, IV and V with dom7 and goes nowhere else, while functional
// harmony spends its dominants driving to other degrees.
const BLUES_DOM7_RATIO = 0.5;
// I, IV and V — the three degrees a blues lives on. A dom7 anywhere else is a
// dominant pointing out of the key, so it rules the idiom out for that key
// however many dom7s the progression holds.
export const BLUES_HOMES = new Set([0, 5, 7]);
// Degree 1 and degree 4 — the two blues-idiomatic homes for a dom7 besides V.
const BLUES_DOM7_OFFSETS = new Set([0, 5]);
// Parity with a functional V7 (REWARD_FULL + REWARD_SEVENTH_BONUS): inside the
// idiom a I7 is as idiomatic as a V7, and the key is then decided by the chord
// that only fits one of the candidates — the actual V.
const REWARD_BLUES_DOM7 = REWARD_FULL + REWARD_SEVENTH_BONUS;

function mod12(n: number): number {
  return ((n % 12) + 12) % 12;
}

// Conventional key names (fewest accidentals in the key signature) for each
// tonic pitch class, indexed [0..11]. Because the spelling of an enharmonic key
// depends on the mode, major and minor need separate tables:
//   - Major C♯(7♯) vs D♭(5♭) → D♭; G♯(8♯) vs A♭(4♭) → A♭, etc.
//   - Minor C♯(4♯) vs D♭(8♭) → C♯; G♯(5♯) vs A♭(7♭) → G♯, etc.
// Each table has exactly one genuinely-tied tonic (equal accidental counts),
// left empty here and resolved by the caller's accidental preference below:
// F♯/G♭ major (pc 6) and D♯/E♭ minor (pc 3).
const MAJOR_TIE_PC = 6;
const MINOR_TIE_PC = 3;
const MAJOR_KEY_NAMES = ['C', 'D♭', 'D', 'E♭', 'E', 'F', '', 'G', 'A♭', 'A', 'B♭', 'B'] as const;
const MINOR_KEY_NAMES = ['C', 'C♯', 'D', '', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'B♭', 'B'] as const;

function keyDisplayName(tonicPc: number, mode: Mode, preference: 'sharp' | 'flat'): string {
  let base: string;
  if (mode === 'major') {
    base =
      tonicPc === MAJOR_TIE_PC ? (preference === 'flat' ? 'G♭' : 'F♯') : MAJOR_KEY_NAMES[tonicPc];
  } else {
    base =
      tonicPc === MINOR_TIE_PC ? (preference === 'flat' ? 'E♭' : 'D♯') : MINOR_KEY_NAMES[tonicPc];
  }
  return `${base} ${mode}`;
}

// Which side of the enharmonic fence a key's signature lives on, per tonic pc.
// Follows the key-name tables above: a key spelled with flats spells its chords
// with flats (B♭, not A♯, in F major). Keys with an empty signature (C major,
// A minor) have no side of their own; chromatic chords in them conventionally
// take flats (♭III/♭VI/♭VII borrowings), which also matches the app default.
const MAJOR_SIDES = [
  'flat',
  'flat',
  'sharp',
  'flat',
  'sharp',
  'flat',
  '',
  'sharp',
  'flat',
  'sharp',
  'flat',
  'sharp',
] as const;
const MINOR_SIDES = [
  'flat',
  'sharp',
  'flat',
  '',
  'sharp',
  'flat',
  'sharp',
  'flat',
  'sharp',
  'flat',
  'flat',
  'sharp',
] as const;

/**
 * The accidental side chords should be spelled on inside a key. The two tied
 * tonics (F♯/G♭ major, D♯/E♭ minor) fall back to the caller's preference, the
 * same way keyDisplayName resolves their names.
 */
export function accidentalSideFor(
  tonicPc: number,
  mode: Mode,
  preference: 'sharp' | 'flat',
): 'sharp' | 'flat' {
  const side = (mode === 'major' ? MAJOR_SIDES : MINOR_SIDES)[tonicPc];
  return side === '' ? preference : side;
}

/**
 * True when dominant 7ths saturate the progression *and* all of them sit on this
 * key's I, IV or V, at least one of them on I or IV — see BLUES_DOM7_RATIO.
 * Asked per candidate key rather than once for the progression, because a count
 * alone cannot tell a blues from a descending-fifths chain of secondary
 * dominants: E7–A7–D7–G7–C is 80% dom7 and functional throughout. Against C that
 * chain's dom7s land on III, VI, II and V, so the idiom is refused; a real blues
 * in C puts them only on I, IV and V.
 *
 * The I-or-IV requirement is what makes the ratio mean something. A dom7 on V is
 * a cadence every tonal idiom owns, and half the chords of a short progression
 * being one is nothing unusual: G7–C, Dm7–G7 and C–G7–C–G7 all clear the ratio
 * on a bare V7. What no functional progression does is treat the *tonic* or the
 * subdominant as a standing dominant — that is the blues, and it is the only
 * case the allowance was ever meant to cover.
 */
export function isDominantIdiom(features: readonly ChordFeature[], tonicPc: number): boolean {
  let dom7 = 0;
  let atHome = false;
  for (const feature of features) {
    if (qualityOf(feature) !== 'dom7') continue;
    const offset = mod12(feature.rootPc - tonicPc);
    if (!BLUES_HOMES.has(offset)) return false;
    if (BLUES_DOM7_OFFSETS.has(offset)) atHome = true;
    dom7 += 1;
  }
  return atHome && dom7 / features.length >= BLUES_DOM7_RATIO;
}

function isTonicChord(feature: ChordFeature, tonicPc: number, mode: Mode, blues: boolean): boolean {
  if (mod12(feature.rootPc - tonicPc) !== 0) return false;
  const q = qualityOf(feature);
  // A chord with no third names a tonic without committing to a mode, and a
  // riff that opens and closes on E5 or Esus4 is still telling us its tonic is
  // E. Both modes take the bonus and the other chords settle which one wins.
  if (THIRDLESS_QUALITIES.has(q)) return true;
  return mode === 'major'
    ? // Inside the idiom the I7 *is* the tonic arrival; without this the position
      // term keeps voting for the subdominant even once chord-fit is corrected.
      q === 'maj' || q === 'maj7' || (blues && q === 'dom7')
    : q === 'min' || q === 'min7' || q === 'minMaj7';
}

function chordFitScore(feature: ChordFeature, tonicPc: number, mode: Mode, blues: boolean): number {
  const offset = mod12(feature.rootPc - tonicPc);
  const quality = qualityOf(feature);
  const slot = slotFor(mode, offset, quality);
  const inKey = toleranceSet(mode);
  const bluesDom7 =
    blues && mode === 'major' && quality === 'dom7' && BLUES_DOM7_OFFSETS.has(offset);

  // Penalize every pitch class outside the key's tolerance set, regardless of
  // whether the chord's root is diatonic — chromatic tones from secondary
  // dominants / borrowed chords still count as evidence against this key.
  // Exception: the ♭7 an idiomatic I7/IV7 carries is a blue note, not evidence
  // of another key. (On I that ♭7 is scale-degree ♭7; on IV it is ♭3.)
  const bluesNote = mod12(feature.rootPc + 10);
  let penalty = 0;
  for (const pc of feature.pitchClasses) {
    if (bluesDom7 && pc === bluesNote) continue;
    if (!inKey.has(mod12(pc - tonicPc))) penalty += PENALTY_ACCIDENTAL;
  }

  let reward: number;
  if (slot.expected !== null) {
    // A thirdless chord takes the full reward on a diatonic root: it cannot
    // disagree with the degree's expected quality, having no third to disagree
    // with. Scoring it as a mismatch made every sus and power chord read as
    // weak evidence for its own key.
    if (slot.expected.has(quality) || THIRDLESS_QUALITIES.has(quality)) {
      reward = REWARD_FULL + (SEVENTH_QUALITIES.has(quality) ? REWARD_SEVENTH_BONUS : 0);
    } else if (bluesDom7) {
      reward = REWARD_BLUES_DOM7;
    } else {
      reward = REWARD_PARTIAL;
    }
  } else {
    const borrowed = mode === 'major' ? MAJOR_BORROWED_OFFSETS : MINOR_BORROWED_OFFSETS;
    reward = borrowed.has(offset) ? REWARD_BORROWED : 0;
  }

  return reward - penalty;
}

function pearson(a: readonly number[], b: readonly number[]): number {
  const n = a.length;
  const mean = (xs: readonly number[]) => xs.reduce((s, x) => s + x, 0) / xs.length;
  const ma = mean(a);
  const mb = mean(b);
  let num = 0;
  let da = 0;
  let db = 0;
  for (let i = 0; i < n; i += 1) {
    const xa = a[i] - ma;
    const xb = b[i] - mb;
    num += xa * xb;
    da += xa * xa;
    db += xb * xb;
  }
  const denom = Math.sqrt(da * db);
  return denom === 0 ? 0 : num / denom;
}

function ksCorrelation(features: readonly ChordFeature[], tonicPc: number, mode: Mode): number {
  const hist = new Array(12).fill(0);
  for (const f of features) {
    for (const pc of f.pitchClasses) {
      hist[mod12(pc - tonicPc)] += 1;
    }
    // Root appears once via pitchClasses above; this adds its extra weight.
    hist[mod12(f.rootPc - tonicPc)] += ROOT_HISTOGRAM_BONUS;
  }
  const profile = mode === 'major' ? KS_MAJOR_PROFILE : KS_MINOR_PROFILE;
  return pearson(hist, profile);
}

function positionBonus(
  features: readonly ChordFeature[],
  tonicPc: number,
  mode: Mode,
  blues: boolean,
): number {
  let bonus = 0;
  if (isTonicChord(features[0], tonicPc, mode, blues)) bonus += BONUS_FIRST_TONIC;
  if (isTonicChord(features[features.length - 1], tonicPc, mode, blues)) bonus += BONUS_LAST_TONIC;
  let cadences = 0;
  for (let i = 0; i < features.length - 1; i += 1) {
    const a = mod12(features[i].rootPc - tonicPc);
    const b = mod12(features[i + 1].rootPc - tonicPc);
    const aq = qualityOf(features[i]);
    const dominant = a === 7 && (aq === 'maj' || aq === 'dom7');
    // A descending fifth onto another dominant seventh is not an arrival: the
    // target is itself unresolved and the motion carries on through it. True of
    // the I7→IV7 move in a stock 12-bar, which would otherwise hand the
    // subdominant two spurious cadences (bars 1→2 and 4→5), and equally true of
    // every link but the last in a chain of secondary dominants. Chord fit and
    // the first/last-tonic bonus carry the key instead.
    const unresolved = qualityOf(features[i + 1]) === 'dom7';
    if (dominant && b === 0 && !unresolved) cadences += 1;
  }
  // Saturating rather than cumulative. chordFitScore is averaged over the
  // progression and the KS correlation is scale-free, so an uncapped sum here
  // was the score's only length-dependent term: looping a vamp multiplied its
  // cadence evidence without diluting it, and confidence grew on repetition
  // alone (C–Am–F–G looped 1x/2x/3x scored gaps of 0.231 / 0.455 / 0.647 for
  // identical music). Hearing V–I six times is the same evidence six times over,
  // not six independent pieces of it.
  //
  // Saturating at a cadence every other transition, rather than dividing by the
  // transition count outright: plain density inverts the bug instead of fixing
  // it, thinning a repeated V–I vamp until D–G–D–G–D–G reads *less* certain than
  // D–G. Below the saturation point cadences still accrue, so a lone V–I in a
  // long progression stays weaker than one in a short progression — which is
  // what keeps C–C7–F–Fm–C in C major instead of hearing the C7–F as a cadence
  // into F.
  const saturationPoint = Math.max(1, (features.length - 1) / 2);
  return bonus + BONUS_CADENCE * Math.min(1, cadences / saturationPoint);
}

/**
 * The full hybrid score of one concrete analysis: every chord committed to one
 * reading. The blues gate is re-derived per evaluation because whether the
 * progression reads as a dominant idiom depends on which readings were chosen.
 */
function scoreFeatures(features: readonly ChordFeature[], tonicPc: number, mode: Mode): number {
  const blues = isDominantIdiom(features, tonicPc);
  const fit =
    features.reduce((s, f) => s + chordFitScore(f, tonicPc, mode, blues), 0) / features.length;
  const ks = ksCorrelation(features, tonicPc, mode);
  const pos = positionBonus(features, tonicPc, mode, blues);
  return W_CHORD_FIT * fit + W_KS * ks + W_POSITION * pos;
}

interface Assignment {
  score: number;
  assignment: number[];
}

/**
 * Coordinate ascent: sweep the unpinned chords, and for each one try every
 * alternate reading against the full score with the rest of the assignment held
 * fixed, keeping any strict improvement. Repeats until a sweep changes nothing.
 *
 * Ascent rather than exact DP because the score doesn't decompose over chords:
 * the KS correlation is a nonlinear function of the whole pitch histogram, and
 * the blues gate and cadence saturation are properties of the assignment as a
 * whole. Each accepted step re-evaluates the true score, so the search can never
 * "win" through an approximation — the risk is only a local maximum, which the
 * two seeds in bestAssignmentFor guard against.
 */
function ascend(
  chords: readonly ProgressionChord[],
  seed: readonly number[],
  tonicPc: number,
  mode: Mode,
): Assignment {
  const assignment = [...seed];
  const features = assignment.map((idx, i) => chords[i].readings[idx]);
  let score = scoreFeatures(features, tonicPc, mode);

  for (let sweep = 0; sweep < MAX_ASCENT_SWEEPS; sweep += 1) {
    let improved = false;
    for (let i = 0; i < chords.length; i += 1) {
      const { readings, pinned } = chords[i];
      if (pinned !== null || readings.length < 2) continue;
      for (let r = 0; r < readings.length; r += 1) {
        if (r === assignment[i]) continue;
        features[i] = readings[r];
        const s = scoreFeatures(features, tonicPc, mode);
        if (s > score + SCORE_IMPROVEMENT_EPSILON) {
          score = s;
          assignment[i] = r;
          improved = true;
        } else {
          features[i] = readings[assignment[i]];
        }
      }
    }
    if (!improved) break;
  }

  return { score, assignment };
}

/**
 * The best reading-per-chord this key can make of the progression, pins held
 * fixed. Seeded twice — from the analyzer's primary readings and from the
 * per-chord best diatonic fit for this key — because ascent moves one chord at
 * a time and a pair of chords that only pay off together (a manufactured V–I,
 * say) needs at least one seed to start on the right side of the ridge.
 */
function bestAssignmentFor(
  chords: readonly ProgressionChord[],
  tonicPc: number,
  mode: Mode,
): Assignment {
  const primary = chords.map((c) => c.pinned ?? 0);

  // Nothing to optimize: one reading everywhere (or every choice pinned).
  if (chords.every((c) => c.pinned !== null || c.readings.length < 2)) {
    const features = primary.map((idx, i) => chords[i].readings[idx]);
    return { score: scoreFeatures(features, tonicPc, mode), assignment: primary };
  }

  const greedy = chords.map((c) => {
    if (c.pinned !== null) return c.pinned;
    let best = 0;
    let bestFit = -Infinity;
    for (let r = 0; r < c.readings.length; r += 1) {
      const fit = chordFitScore(c.readings[r], tonicPc, mode, false);
      if (fit > bestFit) {
        bestFit = fit;
        best = r;
      }
    }
    return best;
  });

  const a = ascend(chords, primary, tonicPc, mode);
  if (greedy.every((idx, i) => idx === primary[i])) return a;
  const b = ascend(chords, greedy, tonicPc, mode);
  return b.score > a.score ? b : a;
}

function softmax(scores: number[], temperature: number): number[] {
  const max = Math.max(...scores);
  const exps = scores.map((s) => Math.exp((s - max) / temperature));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map((e) => e / sum);
}

/**
 * Rank all 24 keys (12 major + 12 minor) against a progression. Hybrid of
 * diatonic chord fit, a Krumhansl–Schmuckler pitch-class correlation (which is
 * what breaks relative-major/minor ties), and cadence/position bonuses. Weights
 * are heuristic constants tuned against known progressions.
 *
 * Estimation is joint over key and chord readings: each key is scored with the
 * combination of per-chord readings that best explains it (user pins excepted),
 * and reports that combination in its `assignment`. All keys get their
 * best-case analysis, so the comparison stays symmetric; wrong keys can't
 * rename their way past the reading-independent accidental penalty, because
 * every reading of a voicing sounds the same pitch classes.
 */
export function estimateKey(
  chords: ProgressionChord[],
  accidentalPreference: 'sharp' | 'flat' = 'flat',
): KeyEstimate {
  if (chords.length < 2 || chords.some((c) => c.readings.length === 0)) {
    return { best: null, candidates: [], status: 'insufficient' };
  }

  const raw: KeyCandidate[] = [];
  for (let tonicPc = 0; tonicPc < 12; tonicPc += 1) {
    for (const mode of ['major', 'minor'] as Mode[]) {
      const { score, assignment } = bestAssignmentFor(chords, tonicPc, mode);
      raw.push({
        tonicPc,
        mode,
        name: keyDisplayName(tonicPc, mode, accidentalPreference),
        score,
        confidence: 0,
        assignment,
      });
    }
  }

  raw.sort((a, b) => b.score - a.score);
  const confidences = softmax(
    raw.map((c) => c.score),
    SOFTMAX_TEMPERATURE,
  );
  raw.forEach((c, i) => {
    c.confidence = confidences[i];
  });

  const candidates = raw.slice(0, 4);
  const best = candidates[0];
  const status =
    candidates[0].confidence - candidates[1].confidence < AMBIGUITY_EPSILON
      ? 'ambiguous'
      : 'confident';

  return { best, candidates, status };
}
