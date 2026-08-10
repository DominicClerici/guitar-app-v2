# Chord Library

`src/lib/chord-library/` assembles chords: give it a root and a quality, get
back the spelled tones, their intervals, and the pitch classes. It's the
opposite direction from `chord-analysis`, which names a chord you already have.
Both share the spelling core in `@/lib/theory`, so a chord spells identically
wherever it appears.

Pure string/number math — no React, no native modules.

```ts
import { buildChord, CHORD_TYPES, ROOTS } from '@/lib/chord-library';
import type { Chord, ChordType, RootName } from '@/lib/chord-library';

const chord = buildChord('Gb', 'maj7');
chord.symbol; // "Gbmaj7"
chord.tones.map((t) => t.note); // ["Gb", "Bb", "Db", "F"]
chord.tones.map((t) => t.degree); // ["1", "3", "5", "maj7"]
```

## The catalogue

**17 roots × 30 types = 510 chords.**

Roots are explicit spellings, not pitch classes: `F#` and `Gb` are both in
`ROOTS` and produce different note names for the same sounds. The set is bounded
by the mixolydian spelling table — a root outside it has no spelling.

Types are grouped into families for browsing (`FAMILY_ORDER`, `FAMILY_LABELS`):

| Family     | Types                              |
| ---------- | ---------------------------------- |
| `power`    | 5                                  |
| `triad`    | maj, m, dim, aug                   |
| `sus`      | sus2, sus4, 7sus4                  |
| `added`    | add9, m(add9)                      |
| `sixth`    | 6, m6, 6/9                         |
| `seventh`  | 7, maj7, m7, m7(b5), dim7, m(maj7) |
| `extended` | 9, maj9, m9, 11, m11, 13, m13      |
| `altered`  | 7(b9), 7(#9), 7(b5), 7(#5)         |

## Formulas are degrees, never semitones

A chord type is a list of degree labels:

```ts
{ id: 'maj7', degrees: ['1', '3', '5', 'maj7'], ... }
```

Semitones are derived from the labels, never the reverse — the reverse is lossy.
`#9` and `m3` are both three semitones above the root but spell `D#` and `Eb`
over C; `b5` and `#11` are both six but spell `Gb` and `F#`. Only the label
knows which.

Two labels are easy to misread, and they follow the spelling engine's existing
vocabulary:

| Label  | Interval           | Over C |
| ------ | ------------------ | ------ |
| `7`    | minor seventh      | `Bb`   |
| `maj7` | major seventh      | `B`    |
| `dim7` | diminished seventh | `Bbb`  |
| `m3`   | minor third        | `Eb`   |

Using `b7` where you meant a dominant seventh would spell the chord a semitone
flat. The `Degree` union in `@/lib/theory` is the full list.

## Which tones can be dropped

Six strings can't always hold seven notes, so each type carries `dropOrder`: the
tones it can give up, in the order to give them up. The essential tones — the
ones that make the name true — are `degrees` minus `dropOrder`.

```ts
chordTypeById('maj9')!.dropOrder; // ['5']  — lose the fifth, keep 1/3/maj7/9
chordTypeById('dim7')!.dropOrder; // []     — a symmetrical stack has no spare
chordTypeById('min13')!.dropOrder; // ['5', '11', '9']
```

`essentialTones(chord, max)` applies it:

```ts
essentialTones(buildChord('C', 'min13'), 4).map((t) => t.note); // C Eb Bb A
```

This is theory, not layout: it's why a `Cmaj9` on guitar is normally played
without its fifth. A voicing generator decides where the notes go; this decides
which notes have to be there. That generator is `@/lib/guitar-voicings` — see
`VOICINGS.md`, which consumes `dropOrder` through `essentialTones` and owns
everything about hands and necks.

## Two chords that aren't naive stacks

- **`11`** is `1 5 7 9 11` — **no third**. A natural eleventh sits a semitone
  above the major third, and that clash is why the third is left out, which is
  also why an 11 chord is often written as a minor seventh over its own root
  (C11 ≈ Gm7/C).
- **`13`** is `1 3 5 7 9 13` — **no eleventh**, for the same clash.

`m11` and `m13` keep everything: a minor third and an eleventh are a whole tone
apart, so there is nothing to avoid. Each entry carries a `note` field
explaining itself where the formula isn't self-evident.

## Spelling

Tones come from `getNotesFromIntervals`, the same function the chord detector
uses. By default the spelling is **theoretically correct**, so `Cdim7` reads
`C Eb Gb Bbb` — a diminished seventh really is a double-flatted seventh, and
the degree labels stay coherent against the notes. Pass
`{ spelling: 'collapsed' }` to fold double accidentals to their common names
(`Bbb` → `A`), matching how the detector displays notes.

Where the honest spelling runs past a single accidental **and** the enharmonic
root does better, `chord.spellingHint` names the better one:

```ts
buildChord('D#', 'maj7').tones.map((t) => t.note); // D# F## A# C##
buildChord('D#', 'maj7').spellingHint; // "Ebmaj7"
```

70 of the 510 carry a hint. Ordinary flat-key chords don't: `Gb7` is one flat
heavier than `F#7` and is still a normal way to write it, so it gets none.
Neither does `Cdim7` — `C` has no enharmonic partner, and its `Bbb` is simply
correct.

## API

| Export                                                 | What it is                                                                              |
| ------------------------------------------------------ | --------------------------------------------------------------------------------------- |
| `buildChord(root, type, options?)`                     | The entry point. `type` is a `ChordType` or its id. Throws on an unknown id.            |
| `essentialTones(chord, max)`                           | The tones that survive when only `max` fit.                                             |
| `chordSymbolFor(root, type)`                           | Root + suffix, e.g. `"Gbmaj7"`.                                                         |
| `ROOTS` / `isRootName` / `enharmonicRoot`              | The 17 roots and their pairings.                                                        |
| `CHORD_TYPES` / `chordTypeById` / `chordTypesByFamily` | The catalogue.                                                                          |
| `FAMILY_ORDER` / `FAMILY_LABELS`                       | Browse-order and display names for families.                                            |
| `findChordTypes(query)`                                | Free-text search over name, symbol, id and aliases. Exact beats prefix beats substring. |
| `parseChordSymbol(input)`                              | `"Cmaj7"` → `{ root, type }`, or `null`. Case-sensitive on `M`/`m`.                     |
| `toChordTones(chord)`                                  | Adapts to the `ChordTones` grid so `IntervalLattice` can render it.                     |

## Verification

There is no test runner in this project. `scripts/verify-chord-library.ts`
checks every one of the 510 chords: that each spelled note is the pitch its
degree claims, that no two tones collide, that the essential/droppable split
matches `dropOrder`, that a collapsed spelling preserves pitch, and that every
printed symbol parses back to the chord it came from.

```
node --import ./scripts/ts-resolver.mjs scripts/verify-chord-library.ts
node --import ./scripts/ts-resolver.mjs scripts/verify-chord-library.ts --dump
```

`--dump` prints all 510 with their notes and hints, for checking spellings by
eye. Run it after touching the catalogue or anything in `@/lib/theory`.
