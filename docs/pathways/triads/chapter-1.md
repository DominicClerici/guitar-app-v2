# Chapter 1 — What a Triad Is

- **Chapter id**: `triads.ch1`
- **Slug**: `what-a-triad-is`
- **6 article lessons + 1 optional activity + 1 checkpoint**
- **`publishedAt`**: `2026-08-14`

**Arc line.** After this chapter the learner knows a triad is a complete chord rather than a
fragment, can say which note is in the bass and why that doesn't rename the chord, can play C major
in all three inversions on strings 1-2-3, and has seen three of those grips inside an open chord
they already play.

---

## Verified reference (recomputed, not copied)

Every fret/note pair below was computed from open-string pitches (string 1 = E4/64 … string 6 =
E2/40) rather than recalled, and agrees with `mobile/src/lib/guitar-positions/triads.test.ts`.

**C major on strings 1-2-3** — the chapter's three grips.

| Inversion | Chart | Notes low→high | Degrees |
| --- | --- | --- | --- |
| root position | `x x x 5 5 3` | `3·5` C4, `2·5` E4, `1·3` G4 | `1 3 5` |
| first inversion | `x x x 9 8 8` | `3·9` E4, `2·8` G4, `1·8` C5 | `3 5 1` |
| second inversion | `x x x 0 1 0` | `3·0` G3, `2·1` C4, `1·0` E4 | `5 1 3` |
| second again, an octave up | `x x x 12 13 12` | `3·12` G4, `2·13` C5, `1·12` E5 | `5 1 3` |

`triadLadder` neck order on this set: **second 0–1, root 3–5, first 8–9, second 12–13.**

**Open chords.**

| Chord | Chart | Top three strings (3-2-1) | Notes | Verdict |
| --- | --- | --- | --- | --- |
| open C | `x 3 2 0 1 0` | `0 1 0` | G3 C4 E4 | C major, second inversion, set 1-2-3 |
| open C, strings 4-3-2 | — | `2 0 1` | E3 G3 C4 | C major, first inversion, set 2-3-4 |
| open C, strings 5-4-3 | — | `3 2 0` | C3 E3 G3 | C major, root position, set 3-4-5 |
| open A | `x 0 2 2 2 0` | `2 2 0` | A3 C#4 E4 | A major, root position, set 1-2-3 |
| open D | `x x 0 2 3 2` | `2 3 2` | A3 D4 F#4 | D major, second inversion, set 1-2-3 |
| open G | `3 2 0 0 0 3` | `0 0 3` | G3 B3 G4 | **not a triad** — doubled root, no fifth |

**E-shape barre C at fret 8** — `8 10 10 9 8 8` → C3, G3, C4, E4, G4, C5. Six voices, three names:
three `C`, two `G`, one `E`. Degrees low→high `1 5 1 3 5 1`.

**Register / mud** — `mobile/src/lib/guitar-voicings/VOICINGS.md` §"Mud". Two adjacent voices are
rejected when they sit too close together too low down; the threshold is set by the *lower* note:

| Lower note below | Minimum gap between the two |
| --- | --- |
| A2 | 4 semitones (a major third) |
| C3 | 3 semitones |
| A3 | 2 semitones |

The honest framing for chapter 1: the lower a voicing sits, the wider its gaps must be before it
stays legible. A close triad on strings 4-5-6 clears the bar but only just; the same three notes an
octave up on strings 1-2-3 have room to spare. Do **not** claim low close triads are "banned" —
they aren't; they are marginal.

**Other sets, for reference only** (chapter 2 teaches these; chapter 1 must not):
2-3-4 `x x 10 9 8 x` / `x x 2 0 1 x` / `x x 5 5 5 x`; 3-4-5 `x 3 2 0 x x` / `x 7 5 5 x x` /
`x 10 10 9 x x`; 4-5-6 `8 7 5 x x x` / `12 10 10 x x x` / `3 3 2 x x x`.

---

## What chapter 1 establishes and must not spend

**Establishes** (chapter 2 will use these without redefining): triad; root/third/fifth and the
degrees `1` `3` `5`; major as `4` then `3` semitones; the six-slot chart low E first; `string·fret`
shorthand; "grip"; close voicing; the four string sets named high-string-first; root position /
first inversion / second inversion; "in the bass"; slash notation `C/E`; doubling; register.

**Leaves alone**: the B-string explanation (chapter 2 owns it — chapter 1 may only *observe* that
the grips are not identical from set to set and say chapter 2 explains why); the shapes of sets
2-3-4, 3-4-5 and 4-5-6 taught systematically; minor, diminished, augmented beyond a single naming
sentence; voice leading.

---

## Lessons

### 1. `triad-three-notes` — "Three Notes Is the Whole Chord"

- **Section id**: `triads.ch1.three-notes` · **Article id**: `art_triad-three-notes` · ~4 min
- **The one thing**: a triad — root, third, fifth — is a complete chord, not a piece of one.
- **Misconception**: "a three-string chord is a fragment of the real chord." Backwards. The barre
  chord is the triad with notes doubled.
- **Key points, in order**:
  1. Open with the claim: three notes is a whole chord. A beginner's mental model of "chord" is a
     shape the fingers make; this lesson replaces it with a set of notes.
  2. Root, third, fifth. Over C that is `C` `E` `G`, degrees `1` `3` `5`.
  3. Quality comes from two stacked intervals, not from a shape: major is `4` semitones then `3`.
     One sentence naming minor / diminished / augmented as `3+4`, `3+3`, `4+4` and saying chapters
     3 and 4 take them. **Do not teach them.**
  4. `triad-shape` — C major, strings 1-2-3, root position. Three dots, `1 3 5`, three strings
     muted. Say in prose that the three dots *are* the chord.
  5. The barre worked example: `8 10 10 9 8 8` is C3 G3 C4 E4 G4 C5 — six voices, three names.
     Table it. The extra three are copies.
  6. Notation contract, established once for the pathway: six-slot chart low E first with `x`;
     `3·5` means string 5 on string 3 — spell it out ("string 3, fret 5") this once. String 1 is
     the high e.
  7. **Hard requirement**: one sentence naming the CAGED pathway as a *recommended, not required*
     prerequisite, linking `{"kind": "article", "slug": "caged-what-the-letter-means"}`.
- **Live**: `triad-shape` × 1 (`{root:"C", strings:"1-2-3", inversion:"root"}`).
- **Leaves the next lesson**: the learner has one grip and knows its degrees, and has been told
  nothing about which note sits lowest.

### 2. `triad-inversion` — "Which Note Is in the Bass"

- **Section id**: `triads.ch1.inversion` · **Article id**: `art_triad-inversion` · ~5 min
- **The one thing**: inversion is which of the three notes is lowest — nothing more — and it does
  not rename the chord.
- **Misconception**: **"the lowest note is the root."** This lesson exists to kill it.
- **Key points, in order**:
  1. Lead with the trap concretely: someone holding `x x 2 0 1 x` reads the bass `E` and calls it
     an E chord. It is E3 G3 C4 — `C` `E` `G`, a C major chord with `E` in the bass.
  2. A chord is named by its root wherever the root sits. The bass note is a fact about the
     voicing, not about the name.
  3. Rotate the bottom note up an octave to get the next inversion. Table: root position `1 3 5`
     (bass = root), first `3 5 1` (bass = third), second `5 1 3` (bass = fifth).
  4. Slash notation, named once: `C/E` reads "C major with E in the bass" and is what a chart the
     learner meets actually prints. `C/G` is the second inversion. Then use it sparingly.
  5. **The guitar-specific turn**: on a keyboard an inversion is a voicing choice. On a guitar it
     is a *place* — each rotation lands the grip somewhere else on the neck entirely.
  6. `/chord-detector` as the killer move: play `x x 2 0 1 x` and the app names it C, not E.
     Link text "Chord Detector".
- **Live**: `triad-shape` × 1 (`{root:"C", strings:"2-3-4", inversion:"first"}` → `x x 2 0 1 x`).
  This is the one diagram outside strings 1-2-3 in the chapter's first half; it is here because the
  misconception argument needs the exact grip on screen. Do not generalise the set.
- **Leaves the next lesson**: three inversions exist and land in three places — but nothing yet
  about *which three strings* a triad lives on.

### 3. `triad-the-four-string-sets` — "Four Sets of Three Strings"

- **Section id**: `triads.ch1.the-four-string-sets` · **Article id**:
  `art_triad-the-four-string-sets` · ~4 min
- **The one thing**: a close-voiced triad sits on three adjacent strings, and there are exactly
  four such sets — which one you pick is a decision about register.
- **Misconception**: "the set is just wherever your hand happens to be" / register is taste.
- **Key points, in order**:
  1. Close voicing: the three notes packed as close together as they go. On a guitar that means
     three adjacent strings, because a skipped string opens the voicing up (spread voicings are
     out of scope — do not name them here; chapter 5 does).
  2. The four sets, named high-string-first: **1-2-3, 2-3-4, 3-4-5, 4-5-6**. String 1 is the high
     e. Table them with a one-line character each — but keep it short, because chapter 2 teaches
     three of them.
  3. Register is not taste. Same chord, two octaves apart: C major root position on strings 1-2-3
     is C4 E4 G4; on strings 4-5-6 it is C3 E3 G3. Show the low one with `triad-shape` and say
     plainly that the lower a close voicing sits, the wider its gaps have to be to stay legible —
     the app's own voicing rules tighten below A3, again below C3, again below A2.
  4. The high sets are thin and clear, and they stay out of the bass player's and the singer's way.
     That is why so much rhythm playing lives on strings 1-2-3.
  5. **One sentence only**: the grips are not identical from set to set, and chapter 2 explains
     why. **Do not name the B string as the cause. Do not print the geometry table.**
- **Live**: `triad-shape` × 1 (`{root:"C", strings:"4-5-6", inversion:"root", caption:…}`) as the
  register contrast. Frame the caption as "the same chord an octave down", not as a shape to learn.
- **Leaves the next lesson**: the learner knows the set they are about to live on and why.

### 4. `triad-major-strings-1-2-3` — "C Major, Three Ways, on the Top Three Strings"

- **Section id**: `triads.ch1.major-strings-1-2-3` · **Article id**:
  `art_triad-major-strings-1-2-3` · ~6 min
- **The one thing**: the three grips, in neck order, as one cycle rather than three alternatives.
- **Misconception**: "these are three unrelated shapes to memorise."
- **Key points, in order**:
  1. Take the three inversions in **neck order**, lowest first — that is how the ladder draws them
     and how a hand meets them: second `x x x 0 1 0`, root `x x x 5 5 3`, first `x x x 9 8 8`.
  2. One `triad-shape` per grip, each with its notes and degrees named in prose beside it.
  3. Summary table: inversion, chart, notes low→high, degrees, bass note. Recompute every cell.
  4. `triad-ladder` on strings 1-2-3 — **the chapter's one use**. The claim it makes that a single
     diagram cannot: the three are one cycle of chord tones climbing the set, and at fret 12 the
     second inversion starts over. Note in prose that the ladder is silent (no play button) and
     that its bands include that octave repeat.
  5. Close on the octave: `x x x 12 13 12` is the open grip twelve frets up.
- **Live**: `triad-shape` × 3 (`1-2-3`, inversions `second`, `root`, `first`) + `triad-ladder` × 1
  (`{root:"C", strings:"1-2-3"}`).
- **Leaves the next lesson**: all three grips, named, in neck order.

### 5. `triad-open-chords-you-know` — "You Already Play These"

- **Section id**: `triads.ch1.open-chords-you-know` · **Article id**:
  `art_triad-open-chords-you-know` · ~5 min
- **The one thing**: the open C chord is three of these grips at once, on three overlapping sets,
  in all three inversions.
- **Misconception**: "triads are new material." They are a re-reading of chords already fluent.
- **Key points, in order**:
  1. Open C is `x 3 2 0 1 0`. Read it three strings at a time. Table:
     - strings 5-4-3 → `3 2 0` → C3 E3 G3 → **root position**, set 3-4-5
     - strings 4-3-2 → `2 0 1` → E3 G3 C4 → **first inversion**, set 2-3-4
     - strings 3-2-1 → `0 1 0` → G3 C4 E4 → **second inversion**, set 1-2-3
  2. Point out that the middle one is the `C/E` grip from the inversion lesson — the learner has
     been playing it since their first week.
  3. Open A: `x 0 2 2 2 0`, top three `2 2 0` → A3 C#4 E4 → **A major root position** on set 1-2-3.
     Same geometry as the C root-position grip, moved.
  4. Open D: `x x 0 2 3 2`, top three `2 3 2` → A3 D4 F#4 → **D major second inversion** on set
     1-2-3. The bass of that grip is `A`, and the chord is still D.
  5. **The honest counterexample, as a callout**: open G is `3 2 0 0 0 3`, top three `0 0 3` →
     G3 B3 G4 — root, third, root. A doubled root and no fifth. Not every open chord's top three
     strings make a triad; you have to check.
  6. `/chord-shapes` as the place to see these grips alongside every other voicing.
- **Live**: `triad-shape` × 2 — `{root:"A", strings:"1-2-3", inversion:"root"}` (`2 2 0`) and
  `{root:"D", strings:"1-2-3", inversion:"second"}` (`2 3 2`). Do **not** re-draw the C grips; the
  previous lesson owns those.
- **Leaves the next lesson**: proof the system is already under the learner's fingers.

### 6. `triad-why-the-top-set` — "Why Rhythm Playing Lives Up Here"

- **Section id**: `triads.ch1.why-the-top-set` · **Article id**: `art_triad-why-the-top-set` ·
  ~5 min
- **The one thing**: why strings 1-2-3 earn their place, and how to practise moving between the
  three inversions.
- **Misconception**: "the top three strings are what's left when you can't play the whole chord."
- **Key points, in order**:
  1. Three arguments, all concrete: **register** (clear of the bass and the vocal, so nothing
     fights); **hands** (three fingers, no barre, no thumb over); **movement** (a rhythm part
     changes chord by moving two frets rather than jumping eight).
  2. The practice: climb the set — `x x x 0 1 0` → `x x x 5 5 3` → `x x x 9 8 8` →
     `x x x 12 13 12` — and come back down. Say the bass note out loud each time: G, C, E, G. Use
     `/metronome`, one chord per bar, slow.
  3. Second exercise: pick a grip, name which note is in the bass before you play it, then check
     with `/chord-detector`.
  4. `triad-shape` with `minFret: 5` for `x x x 12 13 12` — the same three fingers, twelve frets
     up, so the cycle visibly closes.
  5. Close by setting up chapter 2: the other three sets, and the reason their grips are not
     identical. Name chapter 2 by number (the app prints "Chapter 2"), not by lesson.
- **Live**: `triad-shape` × 1 (`{root:"C", strings:"1-2-3", inversion:"second", minFret:5}`).

---

## Activity — `triad-play-the-inversions`

- **Section id**: `triads.ch1.play-the-inversions` · `"optional": true` · ~7 min
- **Kind**: `note-play`, modes `easy` and `hard`, document board frets 0–13.
- **Rounds** (no two targets in a round share a pitch — checked):
  1. `r_triad-play-the-inversions.second` — the open grip: `3·0` G3, `2·1` C4, `1·0` E4.
  2. `r_triad-play-the-inversions.root` — `3·5` C4, `2·5` E4, `1·3` G4.
  3. `r_triad-play-the-inversions.first` — `3·9` E4, `2·8` G4, `1·8` C5.
  4. `r_triad-play-the-inversions.bass-line` — `ordered: true`, the three bass notes climbing the
     G string: `3·0` G3, `3·5` C4, `3·9` E4. Drills the chapter's core claim.
- **What it drills**: locating all three inversions on strings 1-2-3 by ear, and hearing the bass
  note move.

## Checkpoint — `triads-ch1-checkpoint`

`kind: "checkpoint"`, `passThresholdPct: 70`, title "Checkpoint: What a Triad Is".
**Written after the finished articles are read, from what they actually say.** Planned coverage,
one question per lesson plus two on the chapter's headline claims:

1. Naming a chord from `x x 2 0 1 x` — the bass-is-not-the-root misconception (L2).
2. What the barre chord adds over the triad — doubling, not new notes (L1).
3. Which inversion a given chart is, read off the degrees (L4).
4. The open-C dissection: which inversion strings 3-2-1 give (L5).
5. The open-G counterexample: why `0 0 3` is not a triad (L5).
6. Why the top set for rhythm playing — register and movement (L3, L6).
7. A `listen` or `fretboard` question placing the three grips (L4).

## Dispatch

- **Agent A** — lessons 1, 2, 3. Establishes the notation contract and all terminology.
- **Agent B** — lessons 4, 5, 6. Given the exact terms Agent A establishes so it references rather
  than redefines.

Both are told: the content gate will be red mid-chapter (the corpus counts in
`packages/content/src/load.test.ts` are pinned), that is expected, and they must not touch it.
