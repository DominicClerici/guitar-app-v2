# Chapter 5 — Playing with Triads

- **Chapter id**: `triads.ch5`
- **Slug**: `playing-with-triads`
- **6 article lessons + 2 optional activities + 1 checkpoint**
- **`publishedAt`**: `2026-08-14`

**Arc line.** After this chapter the learner can voice-lead a progression on one string set,
harmonise the major scale in triads, cross between sets mid-progression, hear whether a chord is
inverted, play triads over a bass, and comp a whole song with them.

**This chapter closes the pathway.** Its last lesson is the last thing the learner reads.

---

## Verified reference (recomputed from open-string pitches, not copied)

Everything below was computed from open-string MIDI (string 1 = E4/64, 2 = B3/59, 3 = G3/55,
4 = D3/50, 5 = A2/45, 6 = E2/40) with the same rule `mobile/src/lib/guitar-positions/triads.ts`
uses — bass tone on the set's lowest string, then each remaining tone at its first occurrence
strictly above the note before it, span ≤ 4 frets, neck of **15 frets** (`FRET_COUNT`). It agrees
with `triads.test.ts`. **A lesson whose chart disagrees with this table is wrong.**

### The seven triads of C major

| Degree | Numeral | Chord | Notes | Quality |
| --- | --- | --- | --- | --- |
| 1 | `I` | `C` | `C E G` | major |
| 2 | `ii` | `Dm` | `D F A` | minor |
| 3 | `iii` | `Em` | `E G B` | minor |
| 4 | `IV` | `F` | `F A C` | major |
| 5 | `V` | `G` | `G B D` | major |
| 6 | `vi` | `Am` | `A C E` | minor |
| 7 | `vii°` | `Bdim` | `B D F` | diminished |

Pattern, fixed for every major key: **major, minor, minor, major, major, minor, diminished.**
Checked in G major: `G Am Bm C D Em F#dim` — same pattern.

### The harmonised scale on strings 1-2-3, second inversion — the chapter's centrepiece

| Chord | Numeral | Chart | Notes low→high | Bass note |
| --- | --- | --- | --- | --- |
| `C` | `I` | `x x x 0 1 0` | G3 C4 E4 | `G` |
| `Dm` | `ii` | `x x x 2 3 1` | A3 D4 F4 | `A` |
| `Em` | `iii` | `x x x 4 5 3` | B3 E4 G4 | `B` |
| `F` | `IV` | `x x x 5 6 5` | C4 F4 A4 | `C` |
| `G` | `V` | `x x x 7 8 7` | D4 G4 B4 | `D` |
| `Am` | `vi` | `x x x 9 10 8` | E4 A4 C5 | `E` |
| `Bdim` | `vii°` | `x x x 10 12 10` | F4 B4 D5 | `F` |
| `C` | `I` | `x x x 12 13 12` | G4 C5 E5 | `G` |

Eight chords, frets **0 to 13**, one octave, starting and ending on the same inversion. The bass
voice walks the scale on string 3 — frets `0 2 4 5 7 9 10 12`, sounding `G A B C D E F G` — and it
is the **fifth** of each chord, because second inversion puts the fifth in the bass (chapter 4's
rule). Per-string movement, low string first (`3`, `2`, `1`):

| Change | String 3 | String 2 | String 1 |
| --- | --- | --- | --- |
| `C` → `Dm` | `+2` | `+2` | `+1` |
| `Dm` → `Em` | `+2` | `+2` | `+2` |
| `Em` → `F` | `+1` | `+1` | `+2` |
| `F` → `G` | `+2` | `+2` | `+2` |
| `G` → `Am` | `+2` | `+2` | `+1` |
| `Am` → `Bdim` | `+1` | `+2` | `+2` |
| `Bdim` → `C` | `+2` | `+1` | `+2` |

**Every voice moves up by one or two frets and never more.** Verified.

**Only the second inversion fits.** Recomputed for all three:

| Starting inversion | Where it runs | Verdict |
| --- | --- | --- |
| second | bass frets `0 2 4 5 7 9 10 12`, grips inside frets 0–13 | **fits** |
| root | `C` at 5, `Dm` 7, `Em` 9, `F` 10, `G` 12, `Am` 14, then `Bdim` needs fret **16** | off the neck |
| first | `C` at 9, `Dm` 10, `Em` 12, `F` 14, then `G` needs fret **16** | off the neck |

The reason second inversion starts at the nut: its bass is the fifth, the fifth of `C` is `G`, and
`G` is the open third string. State this as the honest observation the brief asks for — it is a
real fact about the instrument, not a defect.

(The same run also fits on strings 4-5-6, frets 2 to 15, `3 3 2` up to `15 15 14`. None of those
grips is muddy. Not used in the chapter; recorded so nobody claims it doesn't exist.)

### The closing progression — `C` `G` `Am` `F`, i.e. `I` `V` `vi` `IV`

On strings 1-2-3, nearest inversion each time, entirely inside frets 3–6:

| Chord | Numeral | Inversion | Chart | Notes low→high |
| --- | --- | --- | --- | --- |
| `C` | `I` | root | `x x x 5 5 3` | C4 E4 G4 |
| `G` | `V` | first | `x x x 4 3 3` | B3 D4 G4 |
| `Am` | `vi` | first | `x x x 5 5 5` | C4 E4 A4 |
| `F` | `IV` | second | `x x x 5 6 5` | C4 F4 A4 |

| Change | String 3 | String 2 | String 1 | Shared notes | What happens |
| --- | --- | --- | --- | --- | --- |
| `C` → `G` | `−1` | `−2` | `0` | `G` | `G4` stays on string 1 |
| `G` → `Am` | `+1` | `+2` | `+2` | none | nothing shared; all three move |
| `Am` → `F` | `0` | `+1` | `0` | `A`, `C` | one voice moves, one fret |
| `F` → `C` (loop) | `0` | `−1` | `−2` | `C` | `C4` stays on string 3 |

`x x x 5 5 5` is `Am` **first inversion** — the flush shape chapter 3 named in
`triad-where-the-third-hides`. `x x x 5 6 5` is the `F/C` grip chapter 4 drew in
`triad-the-sharp-fifth`.

### The same progression on all four sets — the crossing lesson's payoff

| Set | `C` | `G` | `Am` | `F` | Frets |
| --- | --- | --- | --- | --- | --- |
| 1-2-3 | `x x x 5 5 3` | `x x x 4 3 3` | `x x x 5 5 5` | `x x x 5 6 5` | 3–6 |
| 2-3-4 | `x x 10 9 8 x` | `x x 9 7 8 x` | `x x 10 9 10 x` | `x x 10 10 10 x` | 7–10 |
| 3-4-5 | `x 3 2 0 x x` | `x 2 0 0 x x` | `x 3 2 2 x x` | `x 3 3 2 x x` | 0–3 |
| 4-5-6 | `8 7 5 x x x` | `7 5 5 x x x` | `8 7 7 x x x` | `8 8 7 x x x` | 5–8 |

**Verified: the per-string movement is identical on all four sets** — `−1 −2 0`, then `+1 +2 +2`,
then `0 +1 0`, then `0 −1 −2`. The reason is exact: the `G`→`B` lift is a property of the *set* and
applies to both chords equally, so it cancels in the subtraction. **The grips change from set to
set; the moves do not.** Also checked on chapter 2's `C F G C`: identical vector on all four sets.
**The caveat that must be written**: this holds only while the run stays in one octave copy — a grip
forced up an octave to stay on the neck breaks it.

Mud check on every grip in that table: **none is muddy.** Tightest margins are `G` first inversion
on 3-4-5 (`x 2 0 0 x x`, B2 D3 G3) and on 4-5-6 (`7 5 5 x x x`, same notes an octave placement
apart), both with **zero margin on the bottom gap** — legal, but do not describe them as roomy.

### One hand position, four registers (the crossing lesson's opening)

C major, all four sets, everything inside frets 0–3:

| Set | Inversion | Chart | Notes | Frets |
| --- | --- | --- | --- | --- |
| 1-2-3 | second | `x x x 0 1 0` | G3 C4 E4 | 0–1 |
| 2-3-4 | first | `x x 2 0 1 x` | E3 G3 C4 | 0–2 |
| 3-4-5 | root | `x 3 2 0 x x` | C3 E3 G3 | 0–3 |
| 4-5-6 | second | `3 3 2 x x x` | G2 C3 E3 | 2–3 |

`G2` to `E4` — nearly two octaves of the same chord without the hand leaving the first three frets.
Chapter 1 found the middle three of these inside the open C chord (`triad-open-chords-you-know`);
the 4-5-6 one is not in the open C chord and chapter 2 drew it.

### The crossing worked example

`C  F | G  C |` — first half low on strings 3-4-5, second half high on strings 1-2-3:

| Chord | Set | Chart | Notes |
| --- | --- | --- | --- |
| `C` | 3-4-5 | `x 3 2 0 x x` | C3 E3 G3 |
| `F` | 3-4-5 | `x 3 3 2 x x` | C3 F3 A3 |
| `G` | 1-2-3 | `x x x 4 3 3` | B3 D4 G4 |
| `C` | 1-2-3 | `x x x 5 5 3` | C4 E4 G4 |

The hand moves about two frets; the register jumps. Verified: the top note of the `F` is `A3` and
the bottom note of the `G` is `B3`, so **the whole second half sits above the whole first half**.

### The slash-chord worked example — `G` `D/F#` `Em`

The chart's bass walks down by step, `G` `F#` `E`. On strings 1-2-3 the guitarist plays whichever
copy of each chord is nearest and never touches the `F#` in the bass at all:

| Chart says | You play | Chart | Notes | Movement |
| --- | --- | --- | --- | --- |
| `G` | `G` first inversion | `x x x 4 3 3` | B3 D4 G4 | — |
| `D/F#` | `D` second inversion | `x x x 2 3 2` | A3 D4 F#4 | `−2 0 −1`, `D4` held |
| `Em` | `Em` first inversion | `x x x 0 0 0` | G3 B3 E4 | `−2 −3 −2`, nothing shared |

`x x x 2 3 2` is open D's top three strings (chapter 1). `x x x 0 0 0` is the top three **open**
strings and is `Em` (chapter 3, `triad-where-the-third-hides`). Both verified.

### Triads over a bass — the verified bits

- `x x x 0 1 0` is G3 C4 E4. With `C` underneath the sounding chord is C major, **root position**;
  with `E`, `C/E`; with `G`, `C/G`. The grip never changes. Verified by definition — inversion is
  which chord tone is the lowest *sounding* note.
- `x x x 1 1 0` is `G#`3 C4 E4 — chapter 4's one-grip-three-names. Bass `C` → `Caug`; bass `E` →
  `Eaug`; bass `G#` → `G#aug`. The bass note *is* the context chapter 4 said supplies the root.
- `B D F` with a `G` underneath is `G B D F` = `G7`. One sentence only; seventh chords stay out of
  scope and chapter 4 already named `G7` as a chord the learner plays.
- Register: a bass guitar reaches well below the guitar's lowest note (`E2`), and strings 1-2-3
  hold C major from `G3` to `C5` (chapter 2's table). The standard rhythm-section norm is that the
  compact triad sits on top and leaves the low register alone.

### `triad-ladder` bands used in this chapter

| Root / quality / set | Bands, lowest first |
| --- | --- |
| `F` major, 1-2-3 | first `1–2`, second `5–6`, root `8–10`, first again `13–14` |

Recomputed on a 15-fret neck. Four bands, so the octave repeat is visible.

---

## Research findings this chapter is bound by

A dedicated research pass ran before planning. Tiered the way the brief tiers things. **A lesson
may state the first tier plainly, must hedge the second, and must not dress the third as a finding.**

### Comping — what is actually attributable

- **[well documented, first-person]** Nile Rodgers has said his teacher **Ted Dunbar** — Wes
  Montgomery's old roommate — taught him to play chords in **sets of three strings**, and that the
  muted, percussive attack ("chucking") came from Chic's bassist **Bernard Edwards**. Consistent
  across Premier Guitar's "The Emperor of Chuck" and Ultimate Guitar's account. It is Rodgers'
  own account rather than an independent transcription, so **write it as what he says he was
  taught**, not as an established fact about the records.
- **[do not write]** That Steve Cropper, the Motown Funk Brothers, Jimmy Nolen or reggae skank
  players are *documented* as playing close-voiced three-string triads. All four are plausible
  from transcription and universally repeated by guitar teachers, and **none is supported by a
  primary source**. The research pass looked. Chapter 4 already shipped one song-example correction;
  do not create another.
- **[established]** The technique advice, which converges from many independent sources: muting is
  bidirectional (fretting hand releases the instant after the strike; picking hand controls which
  strings ring), and the picking hand tends to work **one fixed string set** for a passage rather
  than roving — which is the practical mechanism that makes three-string triads a right-hand habit
  as much as a fretting choice.
- **[established]** The register division. A bass guitar reaches far below the guitar's lowest
  note, and the accepted rhythm-section practice is that compact high triads leave the low and
  low-mid register to the bass. Standard arranging norm, safe to state.
- **[overstated — do NOT write]** "A triad up high plus a bass note is **most** of what rhythm
  guitar is." No source asserts it, and barre chords, power chords, open-position strumming and
  extended jazz voicings are all large, documented parts of rhythm guitar. **Write instead**: it is
  one of the most widely used textures in rhythm guitar, and the default wherever a guitarist
  shares a rhythm section with a bass player.

### Slash notation

- **[established]** The slash specifies the single lowest note, and its addressee is whoever is
  playing it — normally the bassist. **A guitarist comping on the top three strings, with a bass
  player present, does not have to honour the slash.** Playing alone, it is yours.
- **[established]** A slash chord is **not always an inversion**. When the bass note is a chord
  tone (`C/E`, `C/G`) it is an inversion; when it isn't (`C/D`, `F/G`) it is simply a bass note the
  arranger wants. Phrase it for a learner as: everything left of the slash is the chord, everything
  right of it is the single lowest note — sometimes that note is already in the chord and sometimes
  it isn't.
- **[established, but unranked]** Three standard reasons a chart prints one: a bass line that moves
  by step, a pedal point, or shorthand so a rhythm section reads a triad it already knows. **No
  source offers frequency statistics — do not invent a ranking.**

### Roman numerals and the harmonised scale

- **[established]** Case tracks **quality**, not importance or function: uppercase = major,
  lowercase = minor, lowercase plus `°` = diminished. **`V` is uppercase because the chord built on
  `G` is major**, not because it is the dominant. This is a common student misreading and the
  lesson should correct it directly.
- **[established as professional practice]** The Nashville Number System — session musicians
  numbering chords by scale degree so a band can transpose on the fly — is real evidence that
  numeral thinking is how working players communicate. It is **not** evidence that teaching numerals
  first helps a beginner; no controlled study of that exists. Do not claim one.
- **[contested, and out of scope]** There is a live theoretical argument (Gjerdingen and the
  partimento tradition against Roman-numeral pedagogy) about whether vertical chord-labelling or
  horizontal bass-line thinking builds fluency. Interesting, and **too far out of scope for this
  chapter** — do not raise it. Recorded here so a later session knows it was considered.

### Voice leading

- **[established]** Definition: voice leading is choosing how each note of a chord moves to the
  next chord so the individual lines move as little as possible.
- **[established, with a correction]** The two rules the brief names are really **one principle in a
  hierarchy**: the smallest possible move is no move at all, so a note both chords share is held,
  and everything else takes the shortest distance available. Teaching them as two co-equal rules is
  a small distortion; **phrase it as the hierarchy** — look first for a shared note and keep it
  under the same finger, then move everything else the shortest way.
- **[established]** "Voice leading" is the right term for a guitarist taking the nearest inversion.
  Guitar sources use exactly that word. "Chord-tone economy" is **not** real jargon — do not invent it.
- **[established]** Excluding parallel fifths and octaves is defensible. The prohibition is a
  common-practice-era part-writing convention from a different repertoire, and the power chord is
  its textbook counter-example. **Do not mention it at all.**

### Hearing an inversion — the brief's evidence section is binding

- **[established]** Inversion is audible to trained and untrained listeners alike; energy and
  tension rise and consonance falls monotonically root → first → second.
- **[established]** Training transfers better when the response is **identification** than paired
  A/B comparison, when examples are **interleaved** rather than blocked, and when feedback is
  minimal correct/incorrect. There is **no evidence** that isolated-chord drilling transfers to
  hearing chords in progressions, so **train in the target context** rather than treating
  progressions as an advanced level.
- **[convention, no evidence]** That a drone sharpens the ear. **The honest framing, which chapter 3
  uses and this chapter must match, is task design**: a drone nails the root so the learner cannot
  solve the task by tracking the bass.
- **[convention]** The practical heuristic taught everywhere — listen for the outer voices, the
  bass and the top note. Fine to offer as practice advice, not as a finding.

**Four things not to write** (from the brief, restated because two of this chapter's lessons land
in this territory): that first-inversion triads are harder to identify than root position (the only
ranking says the reverse); that minor gets confused with diminished; that a major chord in a minor
context is heard as minor; and any version of "most people cannot hear this".

---

## What chapters 1–4 established — reference, never re-teach

Triad = root + third + fifth and a **complete chord**; the barre chord is a triad with notes
doubled. Degrees `1` `3` `5` `b3` `b5` `#5`. Major `4+3`, minor `3+4`, diminished `3+3`, augmented
`4+4`. **Inversion** = which note is lowest, and it does not rename the chord; slash notation `C/E`,
`Cm/Eb`, `Bdim/D`, `F/C`. The four string sets named high-string-first, string 1 = high `e`. The
**six-slot chart low E first** with `x`. The `3·5` **string·fret** shorthand. "Grip", "close
voicing", "in the bass", "doubling", "register". **All forty-eight grips** — twelve major, twelve
minor, twelve diminished, twelve augmented. The `G`→`B` break and three geometries rather than four.
The mud thresholds. Choosing a set by register and by what else is sounding. **The third's
position** — middle in root position, bass in first, top in second — and lowering it a fret is the
whole of minor. **The fifth's position** — top in root position, middle in first, bass in second —
and lowering it gives diminished, raising it augmented. The augmented triad is symmetrical (one
grip, three names, repeating every four frets); **the diminished triad is not**. Ladders are silent.

**The `3·5` shorthand is restated once, in lesson 1.** Nothing else above is redefined anywhere in
this chapter.

## Two conventions this chapter deliberately breaks

- **"Voice leading" is introduced here.** Chapters 2 and 3 taught it by feel and were forbidden the
  words. Lesson 1 names it, and names it as something the learner has been doing since chapter 2's
  `C`→`F`→`G`→`C` (`triad-moving-the-least`) and chapter 3's `Am`→`F`→`C`→`G`
  (`triad-hearing-major-and-minor`). Point at those two precisely; do not invent a third example.
- **Roman numerals are introduced here.** Chapters 2–4 banned them; chapter 4 deliberately wrote
  "the chord built on `B`" rather than `vii°`. Lesson 2 defines them once, explicitly, including why
  the case differs — and then the chapter uses them. Do not assume them anywhere before lesson 2.

## What this chapter must leave alone

- **Spread / open-voiced triads.** Named in **one sentence** in the closer as what comes next.
  Nothing more, nowhere else.
- **Seventh chords, sixths, sus chords, four-note anything.** `G7` may be named once, in lesson 5,
  as a chord the learner already plays — exactly as chapter 4 did.
- **Modes, triad pairs, superimposition, CAGED, alternate tunings, arpeggio technique.**
- **Parallel fifths and octaves.** Deliberately excluded; see the research section.

---

## Lessons

### 1. `triad-voice-leading` — "The Name for What You've Been Doing"

- **Section id**: `triads.ch5.voice-leading` · **Article id**: `art_triad-voice-leading` · ~5 min
- **The one thing**: voice leading is choosing how each note moves to the next chord so the
  individual lines move as little as possible — and the learner has been doing it since chapter 2.
- **Misconception**: "voice leading is classical part-writing theory, and an advanced topic." On a
  guitar it is not an aesthetic preference — it is the reason you take the nearest inversion instead
  of jumping to the nearest barre chord.
- **Key points, in order**:
  1. Open by naming it, with the definition in one sentence. Then say immediately that the learner
     has already done it twice, in chapters 2 and 3, without the word.
  2. **Restate the notation once**, one sentence: `3·5` means string 3, fret 5; charts are six slots
     low E first with `x`; string 1 is the high `e`.
  3. **The principle, as a hierarchy and not as two rules.** The smallest possible move is no move
     at all — so look first for a note both chords share and keep it under the same finger; then
     move everything else the shortest distance available. Say plainly that this is one idea, not
     two. A shared note between two chords is a **common tone**; name the term once and use it.
  4. **Worked example one** — chapter 2's `C` `F` `G` `C` on strings 1-2-3. Link
     `triad-moving-the-least`. **Do not re-table the whole progression**; name what was happening.
     `C` and `F` share a `C`, and the finger on `2·1` never moved. `F` and `G` share **nothing**, so
     all three voices slid two frets together. `G` and `C` share a `G`, and the finger on `1·3`
     never moved. Small table: change, shared notes, what stayed put.
  5. **Worked example two** — chapter 3's `Am` `F` `C` `G`. Link `triad-hearing-major-and-minor`.
     `Am` (`A C E`) and `F` (`F A C`) share **two** notes, so exactly one voice moves and it moves
     one fret — the extreme case of the rule. `F` → `C` shares `C`.
  6. **The honest limit, and it is this lesson's best paragraph.** `C` → `G` in that loop moves
     `+4 +2 +3` — the two chords *do* share a `G`, but in the `C` grip it is `G3` on string 3 and in
     the `G` grip it is `G4` on string 1. A common tone can only be held if it is the same pitch on
     the same string. When it isn't, you slide, and that is not a failure of the rule. Verified.
  7. **Why it matters on a guitar.** Less distance is less chance of being late, and a held finger
     is an anchor the rest of the hand settles around. This is the mechanical argument, and it is
     the one chapters 2 and 3 made by feel.
  8. **How to use it as a procedure**: name the next chord, look at all three of its copies on the
     set you are on, take the one nearest your hand. `triad-ladder` is the picture of "all three
     copies" — use `F` on strings 1-2-3, which the pathway has never drawn: first `1–2`, second
     `5–6`, root `8–10`, and first again at `13–14`. Say once that it is silent.
  9. Close by pointing at where the chords in a progression come from in the first place.
- **Live**: `triad-ladder` × 1 — `{root:"F", strings:"1-2-3", caption:…}`. No `triad-shape`: every
  grip this lesson mentions was drawn in chapter 2 or 3, and redrawing them would make the lesson
  read as a repeat.
- **Screens**: none required.
- **Leaves the next lesson**: a name, a procedure, and no account of which chords a key gives you.

### 2. `triad-harmonising-the-major-scale` — "Seven Chords the Key Gives You"

- **Section id**: `triads.ch5.harmonising-the-major-scale` · **Article id**:
  `art_triad-harmonising-the-major-scale` · ~7 min
- **The one thing**: build a triad on each note of the major scale using only that scale's notes and
  the qualities come out in a fixed pattern — and on strings 1-2-3 in second inversion the whole
  scale walks up the set, one or two frets at a time, from the nut to fret 13.
- **Misconception**: "the chords that belong to a key are something you memorise, key by key." The
  pattern is identical in every major key; only the letters change.
- **Key points, in order**:
  1. The construction, concretely. Take each note of C major as a root and stack the next two scale
     notes a third above it. Seven triads, and their qualities are decided entirely by which notes
     the scale happens to contain. Table: degree, chord, notes, quality.
  2. **Roman numerals, introduced properly — this is the lesson's obligation.** One short, explicit
     definition: a Roman numeral names a chord by the scale degree it is built on, so the same
     numeral means the same chord-in-the-key whatever the key is. Then the case rule, stated as a
     rule about **quality**: uppercase is major, lowercase is minor, lowercase with a small circle
     is diminished — `I ii iii IV V vi vii°`. **Then the correction**: `V` is uppercase because the
     chord built on `G` is major, not because it is the most important chord. A learner will assume
     otherwise. After this paragraph the chapter uses numerals freely.
  3. **The pattern is the point.** Major, minor, minor, major, major, minor, diminished — the same
     in every major key. Worked check in G major: `G Am Bm C D Em F#dim`. One line, verified.
  4. **The chapter-4 callback.** `B diminished` is the one diminished triad whose notes are all in C
     major, and no augmented triad fits at all — chapter 4 said both. Now the learner can see why:
     `Bdim` is simply the triad built on the seventh degree. Link `triad-the-flat-fifth`.
  5. **The exercise, and give it room — it is the best thing in the chapter.** Harmonise the whole
     scale on strings 1-2-3 in **second inversion throughout**. Eight grips, frets 0 to 13, starting
     and ending on the same inversion, and the starting grip is `x x x 0 1 0` — the very first shape
     chapter 1 taught. Full table (chord, numeral, chart, notes, bass note).
  6. **What the exercise shows**, as two beats:
     - The bass voice walks the scale: `G A B C D E F G` on string 3 at frets `0 2 4 5 7 9 10 12`.
       It is the **fifth** of each chord, because second inversion puts the fifth in the bass —
       chapter 4's rule, doing work.
     - Every voice moves up by one or two frets and never more. Give the movement table.
  7. **The honest observation.** Only the second inversion fits on this neck. Root position would
     start at fret 5 and need `Bdim` at fret **16**; first inversion runs off too. The neck is 15
     frets. And the reason second inversion starts at the nut is worth saying: its bass is the
     fifth, the fifth of `C` is `G`, and `G` is the open third string. **This is a real observation
     about the instrument, not a defect to hide.**
  8. **How to practise it.** `/metronome` (link text "Metronome"), one chord per bar, slow, up and
     back down; say the numeral out loud rather than the letter. Then `/scale-visualizer` (link text
     "Scale Visualizer") to see the scale these chords are built from — **this is the one lesson in
     the pathway allowed to use that screen**, and it must be framed as showing the scale, not the
     grips.
  9. Close: seven chords with numbers on them is what makes a progression something you can carry to
     another key — and what makes the next question ("which register?") a separate decision.
- **Live**: `triad-shape` × 3 — `{root:"D", quality:"minor", strings:"1-2-3", inversion:"second"}`
  (`x x x 2 3 1`), `{root:"E", quality:"minor", strings:"1-2-3", inversion:"second"}`
  (`x x x 4 5 3`), `{root:"B", quality:"diminished", strings:"1-2-3", inversion:"second"}`
  (`x x x 10 12 10`). All three are grips the pathway has never drawn; the component finds each on
  its own, so **do not pass `minFret`**. Always pass an explicit `caption`.
- **Screens**: `/metronome`, `/scale-visualizer`.
- **Leaves the next lesson**: seven chords, numbered, on one set — and no way yet of changing where
  they sit.

### 3. `triad-crossing-the-sets` — "Changing Register Without Moving Your Hand"

- **Section id**: `triads.ch5.crossing-the-sets` · **Article id**: `art_triad-crossing-the-sets` ·
  ~5 min
- **The one thing**: adjacent sets overlap, so one hand position holds the same chord in four
  registers — and a progression can cross between sets mid-phrase to change register without
  changing a single note of the harmony.
- **Misconception**: "you pick a set at the start and stay on it." The set is a per-phrase decision,
  not a per-song one.
- **Key points, in order**:
  1. Open on the overlap. Any two neighbouring sets share **two** of their three strings, which is
     why a chord is never more than a set away. Chapter 1 already proved it: the open C chord holds
     three grips at once, on three overlapping sets — link `triad-open-chords-you-know`.
  2. **One hand position, four registers.** The table from the verified reference: C major on all
     four sets, everything inside frets 0–3, spanning `G2` to `E4`. Do **not** redraw these four
     grips; chapters 1 and 2 own all of them and the table is clearer than four diagrams.
  3. **Chapter 2 chose the set for the sound; the new half is choosing again mid-song.** Link
     `triad-choosing-a-set` for the register argument and do not re-argue it. What is new: a verse
     down on strings 3-4-5 and a chorus up on strings 1-2-3 is the same chords, the same fingering
     logic, and more energy — and it costs nothing but a set.
  4. **The fact that makes crossing cheap, and it is new.** Take a progression with the same
     inversions on any set and **each string moves by exactly the same number of frets**. Give the
     four-set table for `C` `G` `Am` `F` and the single shared movement row. The reason, stated
     precisely: the `G`→`B` lift belongs to the *set* and applies to both chords equally, so it
     cancels when you subtract one grip from the next. **The grips change; the moves don't.**
     **The caveat must be written**: this holds while the run stays in one octave copy — a grip
     forced up an octave to stay on the neck breaks it.
  5. **The worked crossing.** Two bars, `C  F | G  C |`: `C` and `F` low on strings 3-4-5
     (`x 3 2 0 x x`, `x 3 3 2 x x`), then `G` and `C` up on strings 1-2-3 (`x x x 4 3 3`,
     `x x x 5 5 3`). The hand moves about two frets and the register jumps — the top note of the `F`
     is `A3`, the bottom note of the `G` is `B3`, so the whole answering half sits above the whole
     first half. Verified; table it.
  6. **How to find the crossing point, practically.** Two lines: decide which note you want lowest,
     then take the set that puts it there; or, on the neck, notice that the two sets share two
     strings, so a grip and its neighbour occupy overlapping ground.
  7. Close by pointing at the ear: if the set decides the register and the inversion decides the
     hand, what does a listener actually hear?
- **Live**: `triad-shape` × 2 — `{root:"F", strings:"3-4-5", inversion:"second"}` (`x 3 3 2 x x`)
  and `{root:"A", quality:"minor", strings:"3-4-5", inversion:"first"}` (`x 3 2 2 x x`). Both are
  grips the pathway has never drawn and both are needed by the tables. Neither is muddy — checked.
  **Do not draw `G` first inversion on strings 3-4-5 or 4-5-6 and call it roomy**; both sit with
  zero margin on the bottom gap.
- **Leaves the next lesson**: the register decision made, and nothing yet about what a listener can
  actually pick out.

### 4. `triad-hearing-the-inversion` — "Which Note Is on the Bottom"

- **Section id**: `triads.ch5.hearing-the-inversion` · **Article id**:
  `art_triad-hearing-the-inversion` · ~6 min
- **The one thing**: inversion is audible to anyone, the three inversions rank in a fixed order, and
  a chart's slash is the written form of the same fact.
- **Misconception**: "hearing inversions is an advanced skill you get to after mastering quality,
  and you drill isolated chords until you're ready for real music." Two things wrong with that, and
  the lesson corrects both.
- **Key points, in order** — **the brief's evidence section is binding on this lesson**:
  1. Open on the established finding, stated plainly: inversion is audible to trained and untrained
     listeners alike, and the ranking goes one way — root, then first, then second, with energy and
     tension rising and consonance falling. **Do not write that first inversion is harder to
     identify than root position.** Do not write any version of "most people can't hear this".
  2. What to listen for, labelled as practical advice rather than a finding: the outer voices are
     the ones attention grabs, so the handles are the bass note and the top note. Chapter 3 already
     established that inner voices are the hardest — link `triad-hearing-major-and-minor` and do not
     re-argue it.
  3. **How to train it, from what actually transfers.** Four short items, stated as what the
     evidence on ear training points to rather than as laws:
     - **Name it, don't compare it.** Identifying the chord you just heard transfers better than
       "same or different?" pairs.
     - **Shuffle.** Interleave the three inversions rather than doing ten of one and then ten of the
       next.
     - **Keep feedback minimal.** Right or wrong, and move on.
     - **Train it in context from the start.** There is no evidence that drilling isolated chords
       carries over to hearing chords inside a progression — so put them in a progression now rather
       than treating that as a later level.
  4. **The drill.** The three C major grips on strings 1-2-3 — `x x x 0 1 0`, `x x x 5 5 3`,
     `x x x 9 8 8`. Shuffle them, play one, name the inversion before checking. Then add `/drone`
     on `C` (link text "Drone"). **Frame the drone as task design, exactly as chapter 3 does**: it
     nails the root so you cannot solve the task by tracking the bass, and you have to hear the
     chord's own arrangement instead. **Do not claim a drone sharpens the ear.**
  5. **Then in context**, which is the point of item 3: play the `C` `G` `Am` `F` loop from
     `triad-crossing-the-sets` twice — once voice-led at frets 3–6 and once taking a different copy
     of each chord — and hear that the harmony is identical while the register and the tension are
     not. Then `/ear-trainer` (link text "Ear Trainer") for randomised practice.
  6. **Slash chords in a real chart** — the written version of the same thing. Chapter 1 named the
     notation (link `triad-inversion`); what is new here is what it is instructing.
     - Everything left of the slash is the chord; everything right of it is the single lowest note.
     - When that note is one of the chord's own notes it **is** an inversion — `C/E` first, `C/G`
       second. **When it isn't — `C/D`, `F/G` — it is not an inversion at all**, just a bass note
       the arranger wants. This correction matters; a learner will otherwise read every slash as an
       inversion.
     - Why a chart prints one: to spell a bass line that moves by step, to hold one note under
       changing chords, or as shorthand so a rhythm section reads a triad it already knows. Three
       standard reasons — **do not rank them; nobody has counted.**
  7. **The worked chart.** `G` `D/F#` `Em`: the bass walks `G` `F#` `E` down by step. On strings
     1-2-3 you play `x x x 4 3 3`, then `x x x 2 3 2`, then `x x x 0 0 0` — and never touch an `F#`
     in the bass, because on the top three strings that note isn't yours to play. `x x x 2 3 2` is
     open D's top three strings; `x x x 0 0 0` is the top three **open** strings and is `Em`
     (chapter 3). Table it with the movement.
  8. Close on the obvious question that raises: if the bass note isn't yours, who decides which
     inversion the room hears?
- **Live**: `triad-shape` × 1 — `{root:"E", quality:"minor", strings:"1-2-3", inversion:"first"}`
  (`x x x 0 0 0`), which chapter 3 named in prose and never drew.
- **Screens**: `/drone`, `/ear-trainer`.
- **Leaves the next lesson**: a question it cannot answer on its own.

### 5. `triad-over-a-bass` — "Someone Else Owns the Bass Note"

- **Section id**: `triads.ch5.over-a-bass` · **Article id**: `art_triad-over-a-bass` · ~5 min
- **The one thing**: when you hold a triad on the top three strings and something else is playing
  lower, **you are not choosing the inversion — the bass is**. Your grip becomes a decision about
  register and about how little you move.
- **Misconception**: "the lowest note of my grip is the chord's bass note." Only if nothing lower is
  sounding.
- **Key points, in order**:
  1. Open with the claim, concretely. `x x x 0 1 0` is `G3 C4 E4` — a second inversion on its own.
     Put a `C` underneath and the chord the room hears is C major in **root position**; put an `E`
     underneath and it is `C/E`; a `G`, and it is `C/G`. The grip never changed. Inversion is about
     the lowest **sounding** note, and on a top-set triad that note is somebody else's.
  2. **So that is who the slash is addressed to.** With a bass player in the room, a guitarist
     comping up here does not have to honour the slash at all — the chord above it is the job.
     Playing alone, the slash is yours. Link `triad-hearing-the-inversion`.
  3. **What is left for you to decide**, and it is the payoff of the whole chapter: register (which
     set) and motion (which copy). Link `triad-choosing-a-set` and `triad-voice-leading` and keep
     this to a short paragraph.
  4. **The register argument pays off.** A bass guitar reaches well below the guitar's lowest note,
     and strings 1-2-3 hold C major from `G3` to `C5`. A compact triad up there leaves the whole low
     register to the bass and sits at or above the top of most sung melodies. State it as the
     standard rhythm-section norm it is. **Write that this is one of the most widely used textures
     in rhythm guitar and the default wherever a guitarist shares a rhythm section with a bass
     player. Do NOT write that it is "most of what rhythm guitar is".**
  5. **The chapter-4 callback, made concrete.** `x x x 1 1 0` is `G#3 C4 E4`, and chapter 4 showed
     it is three chords at once with context supplying the root — link `triad-augmented-has-no-root`.
     Here is the context: put a `C` under it and it is `Caug`; an `E`, `Eaug`; a `G#`, `G#aug`. The
     bass note **is** the context. `triad-shape` here, with a caption that makes that point rather
     than repeating chapter 4's.
  6. **One sentence, no more**: chapter 4 showed `B D F` is `G7` with the root taken away — put the
     `G` back underneath and you have `G7` again. Seventh chords stay out of scope; `G7` is named as
     a chord the learner already plays.
  7. **Three ways to get a bass under it.** A bass player; `/drone` (link text "Drone"); or your own
     thumb on string 6 or 5 with the strings in between muted. Keep the thumb to two sentences, and
     say clearly that this is a triad **plus** a bass note — the three notes on top are unchanged.
     Do not let it read as a wider voicing.
  8. **The practice.** `/drone` on `C`, then hold `x x x 0 1 0`, `x x x 5 5 3` and `x x x 9 8 8` in
     turn: three grips, one bass, and the chord is root-position C every time — what changes is
     register and which note is on top. Then move the drone to `E` and to `G` and hear the same
     three grips become `C/E` and `C/G`.
  9. Close by pointing at the closer: everything is in place except time.
- **Live**: `triad-shape` × 1 — `{root:"C", quality:"augmented", strings:"1-2-3",
  inversion:"second", caption:…}` (`x x x 1 1 0`). This grip was drawn in chapter 4; it is redrawn
  here **only** because it is the exact object of this lesson's argument, and the caption must make
  the new point (the bass note names it) rather than repeating chapter 4's.
- **Screens**: `/drone`.
- **Leaves the next lesson**: everything but a rhythm.

### 6. `triad-comping-a-song` — ★ "Comping a Whole Song"

- **Section id**: `triads.ch5.comping-a-song` · **Article id**: `art_triad-comping-a-song` · ~6 min
- **This is the last lesson of the pathway. Its final paragraph is the last thing the learner reads.**
- **The one thing**: a four-chord loop, voice-led, on one set, played with a rhythm, at tempo — the
  whole pathway doing a job.
- **Misconception**: "I know the shapes, so I can play the part." Shapes are not a part. The part is
  the shapes plus muting plus where the strikes land.
- **Key points, in order**:
  1. Open with the progression, named by numeral because lesson 2 earned it: `I` `V` `vi` `IV` — in
     C, `C` `G` `Am` `F`. Say what it is: the four-chord loop more songs use than any other, and now
     it is four grips inside four frets. Take the nearest inversion each time and it lives between
     fret 3 and fret 6. Full table (chord, numeral, inversion, chart, notes).
  2. **The voice leading, spelled out change by change** and checked against the verified table:
     `C` → `G` holds `G4` on string 1; `G` → `Am` shares nothing, so all three move; `Am` → `F`
     holds two notes and moves one voice one fret; `F` → `C` holds `C4` on string 3. Link
     `triad-voice-leading`. Note that `x x x 5 5 5` is `Am`'s first inversion — chapter 3's flush
     shape, link `triad-where-the-third-hides` — and that `x x x 5 6 5` is the `F/C` grip chapter 4
     drew.
  3. **The rhythm, which is the genuinely new half of this lesson.** Three concrete things:
     - **Mute.** The fretting hand relaxes the instant after the strike; the click that leaves is
       part of the part, not a mistake.
     - **Keep the picking hand on one set** for the whole part. That is what makes the muting
       reliable, and it is the practical reason three-string triads became a rhythm-guitar habit.
     - **Put the chords where the rhythm wants them**, not on every beat.
  4. **One attributable sentence, carefully hedged.** Nile Rodgers has said he was taught to play
     chords in sets of three strings — by Ted Dunbar, Wes Montgomery's old roommate — and that the
     muted, percussive attack came from Chic's bassist Bernard Edwards. **Attribute it to Rodgers'
     own account.** Do **not** add Cropper, Motown, reggae or James Brown; the research pass could
     not verify any of them as documented three-string-triad players.
  5. **Build it in passes**, as an ordered list. `/metronome` (link text "Metronome") throughout:
     - one chord per bar, four bars, quarter-note downstrokes, slow;
     - strikes on beats 2 and 4 only, everything else muted;
     - eighth notes with the chord landing on the offbeats;
     - the same four bars an octave down on strings 3-4-5, then back up — link
       `triad-crossing-the-sets`;
     - with a bass underneath: `/drone` (link text "Drone"), or a bass player. Link
       `triad-over-a-bass`.
  6. **What the learner can do now.** Short, phrased as actions, no more than five, and honest:
     put any of the four qualities anywhere on the neck in any inversion; read a chart's slash and
     know what it asks and who it asks; voice-lead a progression so no hand jumps; harmonise a major
     scale and name its chords by number in any key; hear whether a chord is inverted. **Not a
     listicle of "next steps", and no overselling.**
  7. **What comes next — one sentence and no more.** Spread (open-voiced) triads: the same three
     notes with one lifted an octave, so the grip skips a string. Out of scope here. **One sentence.
     Do not describe them, do not name a shape, do not promise a pathway.**
  8. **Close on the instrument, not on the pathway.** The twelve grips were never the point; the
     point is that a chord is three notes and you can now put them anywhere. Do not write a summary
     of the five chapters and do not congratulate the reader.
- **Live**: `triad-shape` × 1 — `{root:"A", quality:"minor", strings:"1-2-3", inversion:"first"}`
  (`x x x 5 5 5`), which the pathway has named in prose but never drawn. Every other grip in this
  lesson is already drawn elsewhere and the tables carry them.
- **Screens**: `/metronome`, `/drone`.

---

## Activities

### A. `triad-harmonise-the-scale`

- **Section id**: `triads.ch5.harmonise-the-scale` · `"optional": true` · ~7 min
- Placed after lesson 2, whose run it drills.
- **Kind**: `note-play`, modes `easy` and `hard`, document board frets **0–13**.
- **What it drills**: three of the harmonised scale's grips, including the two that are new, and
  then the bass voice walking the whole scale up string 3.
- **Rounds** (pitches distinct within each round — checked; every fret inside 0–13):
  1. `r_triad-harmonise-the-scale.two` — `Dm`, `x x x 2 3 1`: `3·2` A3 (57), `2·3` D4 (62), `1·1`
     F4 (65).
  2. `r_triad-harmonise-the-scale.five` — `G`, `x x x 7 8 7`: `3·7` D4 (62), `2·8` G4 (67), `1·7`
     B4 (71).
  3. `r_triad-harmonise-the-scale.seven` — `Bdim`, `x x x 10 12 10`: `3·10` F4 (65), `2·12` B4 (71),
     `1·10` D5 (74).
  4. `r_triad-harmonise-the-scale.the-walking-bass` — `ordered: true`, all on string 3: frets
     `0 2 4 5 7 9 10 12` — G3 (55), A3 (57), B3 (59), C4 (60), D4 (62), E4 (64), F4 (65), G4 (67).
     The scale itself, played by the note that carries it.

### B. `triad-comp-the-changes`

- **Section id**: `triads.ch5.comp-the-changes` · `"optional": true` · ~7 min
- Placed last, after lesson 6.
- **Kind**: `rhythm`. **No chapter has used one yet, so get the arithmetic right**: `slots` must be
  exactly `beatsPerBar × subdivision × bars` long, and **every prompt must tell the learner to mute
  the strings**, because the drill hears attacks and not notes.
- **What it drills**: the four rhythms lesson 6's passes build, on the `C` `G` `Am` `F` loop.
- **Rounds** (slot counts checked):
  1. `r_triad-comp-the-changes.on-the-beat` — `bpm: 80`, `beatsPerBar: 4`, `subdivision: 1`,
     `bars: 4` → **16 slots**: `accent hit hit hit` × 4. One chord per bar, quarter notes.
  2. `r_triad-comp-the-changes.two-and-four` — `bpm: 90`, `beatsPerBar: 4`, `subdivision: 2`,
     `bars: 2` → **16 slots**: `rest rest accent rest rest rest accent rest` × 2. The backbeat, with
     everything else muted.
  3. `r_triad-comp-the-changes.the-offbeat` — `bpm: 90`, `beatsPerBar: 4`, `subdivision: 2`,
     `bars: 2` → **16 slots**: `rest accent rest hit rest hit rest hit` × 2. Chords on the "and".
  4. `r_triad-comp-the-changes.sixteenths` — `bpm: 84`, `beatsPerBar: 4`, `subdivision: 4`,
     `bars: 1` → **16 slots**: `accent rest hit hit  rest hit rest hit  rest rest hit hit  rest hit
     hit rest`. One bar of a sixteenth-note figure — the round that lands just past the chapter.
- `countInBars: 1` on every round.

---

## Checkpoint — `triads-ch5-checkpoint`

`kind: "checkpoint"`, `passThresholdPct: 70`, title "Checkpoint: Playing with Triads".
**Written after the finished articles are read, from what they actually say.** All four earlier
checkpoints were read first; none of the planned questions duplicates one. Planned coverage:

1. Voice leading — what you look for first, and why (L1). The distractor that matters: "move the
   whole shape the same distance every time".
2. The honest limit — why the shared `G` between `C` and `G` cannot be held on strings 1-2-3 (L1).
3. Roman numerals — why `V` is uppercase (L2). The headline distractor is "because it is the most
   important chord in the key".
4. The harmonised run — which inversion fits the whole scale on strings 1-2-3, and why (L2).
5. Crossing the sets — the grips change but the moves don't, and why (L3).
6. Slash notation — `C/D` is **not** an inversion (L4).
7. Who decides the inversion when a bass player is present (L5).
8. A `listen` question: `G3 C4 E4`, `mode: "chord"` — which inversion. Chapter 3's listen question
   played `C4 Eb4 G4` and chapter 4's `C4 E4 G#4`, so this is distinct. One distractor must be
   "inversion isn't audible", because the evidence explicitly contradicts it.

Trim to seven if any two collapse into one.

## Dispatch

- **Agent A** — lessons 1, 2, 3. Establishes voice leading and the Roman-numeral convention, and
  restates the `3·5` shorthand. Owns the harmonised-scale run and the movement-invariance claim.
- **Agent B** — lessons 4, 5, 6. Given Agent A's exact claims and the numeral convention verbatim,
  so it uses them rather than redefining them.

Both are told: the content gate is red mid-chapter because the corpus counts in
`packages/content/src/load.test.ts` are pinned; that is expected, and they must not touch it.

---

## Errors found reading the finished articles

Both lesson agents reported their drafts clean. Eleven real problems were found on the chapter
agent's own recompute pass and fixed. Recorded here because the pattern has now repeated in all
five chapters.

**Factual — would have shipped wrong:**

1. `triad-harmonising-the-major-scale`: the `Bdim` diagram's caption read "still the same shape one
   fret at a time." It is not the same shape. Relative to the bass, the major second inversions in
   the run are `0 +1 0`, the minor ones `0 +1 −1`, and `Bdim` is `0 +2 0` — the only grip in the
   run whose middle note pokes up two frets. Rewritten to say that instead.
2. `triad-comping-a-song`: the closing sentence of the whole pathway read "The twelve grips were
   never the point." The pathway teaches **forty-eight** — twelve per quality. Fixed twice, because
   the lesson agent restored it during a later revision.
3. `triad-comping-a-song`: the `Am` diagram's caption claimed it is "the only grip in the loop that
   doesn't need a shape at all", which is not a statement about anything. Replaced with the checked
   fact: it is the only grip in this loop with all three notes at the same fret (`C` spans two
   frets, `G` two, `F` two, `Am` one).
4. `triad-comping-a-song`: `readingTimeMin` was 5 on a 742-word article. Recomputed to 4.

**Unverified superlative:**

5. `triad-comping-a-song`: "the four-chord loop more songs use than any other." Nobody has counted
   that, and the research pass found no source that does. Softened to "one of the most-played
   four-chord loops in popular music."

**Author instructions leaked into published prose** — the failure mode chapter 4 also hit:

6. `triad-crossing-the-sets`: "One caveat has to be written: this holds only while…"
7. `triad-over-a-bass`: "One more, one sentence: `B D F` is `G7` with the root taken away…"

**Convention breaks — prose set in mono, or a mono span swallowing prose:**

8. `triad-voice-leading`: the movement table's cells were code-marked whole, so "held on" rendered
   in mono alongside `2·1` and `1·3`.
9. `triad-hearing-the-inversion`: `−2 0 −1, D4 held on string 2` and `−2 −3 −2, nothing shared`
   were single code spans.
10. `triad-over-a-bass`: `C/E — first inversion` and `C/G — second inversion` likewise; and
    `triad-comping-a-song` had three more of the same (`G4 held on string 1`, `C4 held on string 3`,
    `A and C both held; one voice, one fret`).

**Structural / metadata:**

11. `triad-comping-a-song` drew the `Am` diagram several blocks *after* the paragraph naming
    `x x x 5 5 5`, with the whole rhythm section in between. Moved next to the paragraph that names
    it. Also: `triad-harmonising-the-major-scale` ran three `triad-shape` blocks back to back
    straight off a table with no prose introducing them (one line added); `triad-voice-leading` said
    "before the diagrams start" when the article has exactly one diagram; the `Dm` caption's "one
    step up from the nut" read as one *fret* up and was tightened to "second step of the run";
    `triad-crossing-the-sets` named `I V vi IV` without linking the lesson that defines the
    numerals; and `triad-hearing-the-inversion` carried a tag (`ear`) no other article in the
    pathway uses.

One non-error edit: `triad-harmonising-the-major-scale` said "Case carries quality, not letter",
which does not parse. Changed to "Case carries quality, and nothing else."

## Note for the top-level agent

The pathway's `estimatedMin` is still the placeholder **200**. The true sum of every section across
all five chapters is **197** — ch1 31, ch2 43, ch3 42, ch4 35, ch5 46. It was deliberately not
changed here; §8 step 1 owns it.
