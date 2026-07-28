# Chord Analysis

`src/lib/chord-analysis/` turns a set of notes placed on a fretboard into a
ranked list of chord names, an interval breakdown, and warnings about unusual
voicings. It's a self-contained, dependency-free TypeScript module (pure
string/number math — no React, no native modules, safe to call from anywhere
including a worklet or a plain function).

Import everything from the folder index:

```ts
import { analyzeChord, noteToSemitone, OPEN_PITCHES } from '@/lib/chord-analysis'
import type { ChordAnalysis, ChordTones } from '@/lib/chord-analysis'
```

## What it does (and doesn't)

- **Chord identification** — given the notes of one voicing, name the chord(s),
  show the intervals, and flag anything unusual. This is what `analyzeChord`
  does and it's ready to use.
- **Key / progression analysis** — _not implemented here yet._ This module
  identifies a single chord; it has no key-detection algorithm. When we build
  the progression → key feature it will reuse the primitives below
  (`noteToSemitone`, `OPEN_PITCHES`, the chromatic tables) plus new code.

## Public API

| Export | What it is |
|--------|------------|
| `analyzeChord(notes: FretboardNote[]): ChordAnalysis \| null` | The entry point. Returns `null` for fewer than 3 notes. |
| `noteToSemitone(note: string): number` | Spelled note (`"C"`, `"F#"`, `"Bb"`, `"B##"`…) → pitch class `0–11`. Use it to turn a spelled root back into a pitch class. |
| `OPEN_PITCHES` | Open-string pitch class per string index. `[4, 11, 7, 2, 9, 4]` = high‑e, B, G, D, A, low‑E. |
| `OPEN_PITCHES_MIDI` | Same ordering as MIDI pitches at fret 0. `[64, 59, 55, 50, 45, 40]`. |
| `notesFlat` / `notesSharp` | Chromatic name tables indexed by pitch class (C = 0), flat- and sharp-side. |
| types | `ChordAnalysis`, `ChordResult`, `ChordTones`, `IntervalSlot`, `FretboardNote`, `Warning`. |

### Input — `FretboardNote`

```ts
interface FretboardNote {
  string: number   // 0 = high e, 5 = low E
  fret: number     // 0 = open
}
```

The visual fretboard produces one `FretboardNote` per placed dot. String index
runs **0 = high e … 5 = low E**. A given pitch class is `(OPEN_PITCHES[string] +
fret) % 12`.

### Output — `ChordAnalysis`

```ts
interface ChordAnalysis {
  chordNames: ChordResult[]   // up to 5, primary first
  chordTones: ChordTones      // interval grid for the primary reading
}

interface ChordResult {
  name: string                // e.g. "Cm7", "C/G", "Cmaj9"
  primary: boolean            // true for chordNames[0]
  warnings: string[]          // short English tags, e.g. "Likely an inversion"
}
```

`chordNames[0]` is the most likely chord — use `.name` as the headline label.
The rest are alternate readings (often slash chords or re-rootings).

### Interval display — `ChordTones`

`chordTones` is a fixed-shape grid built for a stable UI layout: three rows
(triad / seventh / extensions), each a list of slots in a fixed order. A slot
has a spelled note when that interval is present, or `null` when it isn't.

```ts
interface ChordTones {
  root: string
  bass: string | null          // null when the bass note is the root
  triad:      IntervalSlot[]   // sus2, m3, 3, sus4, b5, 5, #5
  seventh:    IntervalSlot[]   // b6, dim7, 6, 7, maj7
  extensions: IntervalSlot[]   // b9, #9, 9, #11, 11, b13, 13
}

interface IntervalSlot {
  interval: string             // the slot's label, e.g. "3", "b5"
  note: string | null          // spelled note name, or null if not in the chord
  altered: boolean             // true for b5/#5/b9/#9/#11/b13 (e.g. highlight color)
}
```

Render every slot in order; show the note where `note !== null`, dim or hide the
rest. `altered` is a hint for emphasis (the "spicy" tones).

## Example

```ts
// Open C major voiced with G in the bass: low‑E f3, A f3, D f2, G open, B f1, e open.
const notes: FretboardNote[] = [
  { string: 5, fret: 3 }, // G  (bass)
  { string: 4, fret: 3 }, // C
  { string: 3, fret: 2 }, // E
  { string: 2, fret: 0 }, // G
  { string: 1, fret: 1 }, // C
  { string: 0, fret: 0 }, // E
]

const analysis = analyzeChord(notes)
analysis?.chordNames[0].name          // "C/G"
analysis?.chordNames.map(c => c.name) // ["C/G", "Emb6/G", "G6sus"]
analysis?.chordTones.root             // "C"
analysis?.chordTones.bass             // "G"
```

## How a name is chosen (ranking)

Each unique pitch class in the voicing is read as a candidate root, producing
one interpretation each. They're then scored for plausibility and the cleanest
one becomes primary:

- Readings flagged as a **likely inversion / fragment** are heavily penalized
  (the warning rules literally mean "this wants a different root").
- Simpler names beat complex ones (sus, omitted tones, stacked tensions add
  cost).
- Ties prefer the reading rooted on the actual **bass** note, so a clean
  root-position chord stays primary and renders without a slash.

A reading whose root isn't the bass renders as a **slash chord** (`C/G`); a
root-position reading renders plain (`C`). This is why an open C major over a G
bass surfaces as `C/G` rather than the literal bass-rooted `G6sus`.

## Warnings

`ChordResult.warnings` is a list of short English tags describing why a voicing
is unusual or ambiguous — e.g. *"Likely an inversion"*, *"Has both 5 and b5"*,
*"No third"*, cluster/dissonance flags. Surface them next to the chord name (the
primary chord is usually warning-free; alternates carry most of them).

## Formatting conventions (fixed)

The engine has no user-facing settings. Names are always rendered:

- with letter qualities — `m` / `dim` / `aug` (never `−` / `°` / `+`)
- with tensions in parentheses — `Cm7(b5,11)`
- abbreviated where unambiguous — `C9` not `C7add9`, `sus` not `sus4`
- `6/9`, `b6/9` with a slash
- as plain strings (no markup)
- extreme enharmonics collapsed — `B##` → `C#`, `Cbb` → `Bb`

## Internals (for maintainers)

`analyzeChord` is the only thing the UI calls; the pipeline lives in small
modules:

| File | Job |
|------|-----|
| `half-steps.ts` | Note name ↔ pitch class; build the half-step array relative to a root. |
| `chord-info.ts` | The core: half-steps → triad quality, extension, sus, tensions, per-semitone interval labels, and a slash-chord reading. |
| `notes-from-intervals.ts` | Spell interval labels into note names from the mixolydian skeleton; decides `F#` vs `Gb`. |
| `chord-symbol.ts` | Format the printed chord symbol. |
| `variations.ts` | For each input pitch class, run identification + spelling and pick flat/sharp side. |
| `ranking.ts` | Score variations and pick the primary (see above). |
| `warnings.ts` | 25 rules flagging unusual voicings. |
| `adapter.ts` | Map the primary reading into the `ChordTones` grid. |
| `constants.ts` | Chromatic tables, mixolydian skeleton, open-string pitch classes. |
| `index.ts` | `analyzeChord` + the public surface. |

## Tests

`__tests__/` runs under the app's Jest setup:

```
pnpm jest src/lib/chord-analysis
```

`golden-vectors` and `adapter` cover identification/spelling/formatting;
`ranking` covers primary selection and slash rendering; `power-chord` covers the
two-pitch-class case.
