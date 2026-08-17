# Chapter 6 — Playing Modally

Chapter id `modes.ch6` · slug `playing-modally` · 6 articles, 2 activities, 1 checkpoint.
**The last chapter of the pathway.** Its closer closes the pathway, not just the chapter.

After this chapter the learner can hear a static vamp and name the mode it is asking for, and can
make a mode sound like itself rather than like its parent scale. It is the applied chapter: the vamp
rule made explicit, playing over each vamp through the CAGED windows, landing on the characteristic
note rather than merely including it, naming a mode by ear, writing a two-chord vamp of your own,
and the seven put back together on one neck.

Anchor root is **A** everywhere **except `modes-write-a-vamp`**, which is the one lesson in the
pathway that deliberately transposes, and says so in a clause. String numbering is **1 = high e,
6 = low E**. Positions are written `string·fret`.

---

## How to read this document

Two registers, and confusing them is the single most persistent failure in this pathway — five
transcribed directives in chapter 4's drafts, four more in chapter 5's, and chapter 5 had this same
warning at the top of its plan.

- **Plain text and bullet lists are instructions to the lesson agent.** They are written in the
  second person about *authoring*, and they are never reproduced in an article.
- **Anything inside a `> quote block` is suggested wording** — the only text on this page that may
  be echoed toward a reader, and even that is better rewritten than copied.

An article never explains its own authoring. No sentence in a finished article may name a component,
a prop, a colour convention, an evidence tier, a scope decision, another lesson's job, or this plan.
"Recomputed across all five windows", "call it the amber chip", "two, not one, so don't call either
the only one", "so the pattern isn't only a minor one" — all of those shipped into drafts, and all of
them are addressed to nobody a reader can see.

---

## Verified facts this chapter is built on

Everything below was **recomputed**, not remembered:

- `SCALE_TYPES` in `mobile/src/lib/scale-library/catalog.ts`, and a reimplementation of
  `spellScale`, `cagedFormWindows` and `cagedFillMarks` (`OPEN_PITCHES = [4,11,7,2,9,4]`, index 0 =
  high e, `FRET_COUNT = 15`, `MIN_SPAN = 3`, `CAGED_FORM_OFFSETS` as shipped). The 35-cell dot table
  reproduces the brief's exactly, which is the check that the reimplementation is right.
- `readProgression` from `mobile/src/lib/progressions`, run on every chord symbol this chapter
  writes.
- `estimateKey` from `mobile/src/lib/key-analysis`, run on every progression this chapter names —
  used as a check on the author's claims, **not** quoted at the learner (see the screens section).

**These are the numbers every lesson must use.**

### The seven on A

| Mode | Notes | Degrees | Home chord | Characteristic note | Card heading |
| ---- | ----- | ------- | ---------- | ------------------- | ------------ |
| Lydian | `A B C# D# E F# G#` | `1 2 3 #4 5 6 7` | `A` | `#4` (`D#`) — violet | `A Lydian` |
| Ionian | `A B C# D E F# G#` | `1 2 3 4 5 6 7` | `A` | none | **`A Major`** |
| Mixolydian | `A B C# D E F# G` | `1 2 3 4 5 6 b7` | `A` | `b7` (`G`) — amber | `A Mixolydian` |
| Dorian | `A B C D E F# G` | `1 2 b3 4 5 6 b7` | `Am` | `6` (`F#`) — amber | `A Dorian` |
| Aeolian | `A B C D E F G` | `1 2 b3 4 5 b6 b7` | `Am` | none | **`A Natural minor`** |
| Phrygian | `A Bb C D E F G` | `1 b2 b3 4 5 b6 b7` | `Am` | `b2` (`Bb`) — rose | `A Phrygian` |
| Locrian | `A Bb C D Eb F G` | `1 b2 b3 4 b5 b6 b7` | `Adim` | `b5` (`Eb`) — rose | `A Locrian` |

Never write "the Ionian card" or "the Aeolian card": `SCALE_TYPES[].name` is `Major` and
`Natural minor`. `modes-the-ladder` already carries the clause explaining that to the learner, so a
lesson here may just say "the card headed `A Major`".

### The vamps — the chapter's central table, recomputed

| Mode | Vamp | Numerals | Second chord | Its notes | Carries | Which of the seven contain that chord | Second chord's root, from home |
| ---- | ---- | -------- | ------------ | --------- | ------- | ------------------------------------- | ------------------------------ |
| Lydian | `A`–`B` | `I`–`II` | `B` | `B D# F#` | the `#4` | **Lydian only** | a whole tone up (2 semitones) |
| Ionian | — | — | — | — | it has no characteristic note to carry | — | — |
| Mixolydian | `A`–`G` | `I`–`bVII` | `G` | `G B D` | the `b7` | Mixolydian, Dorian, Aeolian | a whole tone down (10 up) |
| Dorian | `Am`–`D` | `i`–`IV` | `D` | `D F# A` | the `6` | Ionian, Mixolydian, Dorian | a perfect fourth up (5) |
| Aeolian | `Am`–`F` | `i`–`bVI` | `F` | `F A C` | the `b6` | Aeolian, Phrygian, Locrian | a minor sixth up (8) |
| Phrygian | `Am`–`Bb` | `i`–`bII` | `Bb` | `Bb D F` | the `b2` | Phrygian, Locrian | a semitone up (1) |
| Locrian | — | — | — | — | there is no first chord to stand on | — | — |

Read off it, all counted:

- **`A`–`B` is the only one of the five whose second chord pins the mode by itself.** `B` fits
  Lydian and none of the other six. **Scope that to the seven** — the catalogue holds 26 scales and
  chapter 4 shipped a draft error of exactly this shape ("just one other mode in the catalogue").
- Every other vamp needs **both** chords: the second chord narrows the field and the home chord's
  quality finishes the job. `G` fits three modes and the major home rules out the two minor ones;
  `D` fits three and the minor home rules out the two major ones; `Bb` fits two and Locrian's home
  chord is `Adim`, not `Am`.
- **`Am`–`F` is the one that fails.** `F` fits Aeolian, Phrygian **and** Locrian; `Am` rules out
  Locrian and nothing rules out Phrygian. `modes-one-minor-three-ways` already ships this.
- All five second chords are **major triads**. That is a fact about these five choices, not a rule —
  `Bm` (`B D F#`) is also inside A Dorian and also carries the `6`. If a lesson mentions it, scope it.
- Every symbol verified as parsing in `progression-player`: `A`, `Am`, `B`, `G`, `D`, `F`, `Bb`,
  `Adim`, `A7`, `Am7`, `Amaj7`, `A5`, `Em`, `C`, `Dm`.

### What the rule is, and its three boundaries

> The second chord of a modal vamp is the one that contains the characteristic note.

Three things it has to survive, and **all three are already shipped, so no lesson may contradict
them**:

1. **Ionian has no vamp.** No characteristic note means no note for a second chord to carry.
   `modes-one-home-three-ways` ships the empty row.
2. **Aeolian's vamp exists and cannot name its own mode.** `Am`–`F` satisfies the rule in form —
   the `F` does carry the `b6` — but the `b6` is the note *Dorian gives up*, not a note Aeolian is
   named for, and `F` sits inside Phrygian too. `modes-one-minor-three-ways` ships this as what
   having no characteristic note costs Aeolian.
3. **Locrian has no vamp at all**, because the first chord will not hold. `modes-locrian` and
   `modes-what-home-needs` ship this.

**The brief's claim that each second chord is "unavailable in the neighbouring mode" is only half
true.** Recomputed against the ladder's neighbours: `D` really is unavailable in Aeolian (which
needs an `F` where `D` needs an `F#`), and `B` is unavailable in Ionian. But `G` *is* available in
Dorian, `D` *is* available in Mixolydian, and `F` *is* available in Phrygian. State the rule with
its real edges; a rule with two honest exceptions teaches more than one that overreaches.

### The characteristic note in every window — recomputed, and where the overclaim is

Windows for root `A`: **A 0–3 · G 1–5 · E 4–8 · D 6–10 · C 9–13.** They run 0 to 13 without a gap.

Every position of every characteristic note, per window:

| Mode | A 0–3 | G 1–5 | E 4–8 | D 6–10 | C 9–13 |
| ---- | ----- | ----- | ----- | ------ | ------ |
| Lydian `#4` | `4·1` | `2·4` `4·1` | `2·4` `3·8` `5·6` | `3·8` `5·6` | `1·11` `4·13` `6·11` |
| Mixolydian `b7` | `1·3` `3·0` `6·3` | `1·3` `4·5` `6·3` | `2·8` `4·5` | `2·8` `5·10` | `3·12` `5·10` |
| Dorian `6` | `1·2` `6·2` | `1·2` `4·4` `6·2` | `2·7` `4·4` | `2·7` `5·9` | `3·11` `5·9` |
| Phrygian `b2` | `3·3` `5·1` | `3·3` `5·1` | `1·6` `4·8` `6·6` | `1·6` `4·8` `6·6` | `2·11` `5·13` |
| Locrian `b5` | `4·1` | `2·4` `4·1` | `2·4` `3·8` `5·6` | `3·8` `5·6` | `1·11` `4·13` `6·11` |

- **Safe, and counted across all 25 cells: every one of the five windows holds at least one copy of
  the characteristic note of every mode that has one.** The thinnest cell is one copy — Lydian and
  Locrian in the A form at the nut. Everything else is two or three.
- **Not safe, and this is the trap.** "There is a copy on the join between every pair of
  neighbouring windows" is true of **A Dorian and A Mixolydian only**. Checked pair by pair:
  Lydian and Locrian share nothing across the D/C join, and Phrygian shares nothing across G/E or
  D/C. **Scope the seam claim to Dorian**, which is the mode the neck lesson works in.
- A Dorian's chain, which is the neck lesson's spine: `1·2` and `6·2` are in both the A form and the
  G form; `4·4` is in both the G form and the E form; `2·7` is in both the E form and the D form;
  `5·9` is in both the D form and the C form. Five windows, four joins, a `6` on every one.
- Lydian's `#4` and Locrian's `b5` are the same pitch class, so their position tables are identical.
  Do not build a lesson on that; it will read as a mistake.

Roots per window, for the drills: A 0–3 `3·2` `5·0` · G 1–5 `1·5` `3·2` `6·5` · E 4–8 `1·5` `4·7`
`6·5` · D 6–10 `2·10` `4·7` · C 9–13 `2·10` `5·12`.

### Dot counts, all seven, all five windows — recomputed cell by cell

| Form | Window | Lydian | Ionian | Mixolydian | Dorian | Aeolian | Phrygian | Locrian |
| ---- | ------ | ------ | ------ | ---------- | ------ | ------- | -------- | ------- |
| C | 9–13 | 18 | 18 | 17 | 16 | 17 | 17 | 17 |
| A | 0–3 | 12 | 13 | 15 | 16 | 17 | 17 | 15 |
| G | 1–5 | 17 | 17 | 17 | 18 | 18 | 18 | 18 |
| E | 4–8 | 18 | 17 | 16 | 17 | 17 | 17 | 18 |
| D | 6–10 | 16 | 17 | 17 | 17 | 18 | 18 | 18 |

The only cell this chapter uses is the **E form**, where A Lydian and A Locrian both hold **18** —
the two ends of the ladder, the same eighteen-dot frame. **Do not turn that into another "never
count dots" paragraph**: `modes-mixolydian-neck`, `modes-phrygian-neck` and `modes-locrian` have all
made that point already, and a fourth is repetition. The closer's use of it is that the *frame* has
not moved in six chapters.

### Avoid notes, and the one collision — recomputed, all seven

Over each mode's own tonic triad (definition already shipped in `modes-the-avoid-note`):

| Lydian | Ionian | Mixolydian | Dorian | Aeolian | Phrygian | Locrian |
| ------ | ------ | ---------- | ------ | ------- | -------- | ------- |
| none | `4` | `4` | none | `b6` | `b2`, `b6` | `b2` |

Set that against the characteristic-note column and one collision falls out:

- **Phrygian is the only one of the seven whose characteristic note is also an avoid note over its
  own tonic triad.** Its `b2` is both. Lydian's `#4`, Mixolydian's `b7`, Dorian's `6` and Locrian's
  `b5` are none of them avoid notes. Counted against the table above; safe at the scope of the
  seven.
- **The resolution is already shipped.** `modes-avoid-notes-everywhere` established that an avoid
  note belongs to the pairing of scale and chord, not to the scale. Recomputed over each vamp's
  **second** chord: Lydian over `B` has one (`5`), Dorian over `D` has one (`b7`), and **Mixolydian
  over `G`, Aeolian over `F` and Phrygian over `Bb` have none at all.** So the place to land on the
  `b2` is while the `Bb` chord is sounding, where it is the chord's own root.
- **Do not re-open chord-scale theory.** `modes-a-different-question` named it once and explained
  why it is a different topic. Observing which note clashes with which chord is not naming a mode
  per chord.

### Transposing — the four worked vamps, every one verified

`modes-write-a-vamp` is the one lesson allowed off `A`. Each row checked three ways: the home chord
is inside the mode, the second chord is inside the mode, and the characteristic note is inside the
second chord.

| Mode | Notes | Home | Characteristic note | Second chord | Vamp | Numerals |
| ---- | ----- | ---- | ------------------- | ------------ | ---- | -------- |
| D Dorian | `D E F G A B C` | `Dm` | `6` = `B` | `G` (`G B D`) | `Dm`–`G` | `i`–`IV` |
| E Phrygian | `E F G A B C D` | `Em` | `b2` = `F` | `F` (`F A C`) | `Em`–`F` | `i`–`bII` |
| G Mixolydian | `G A B C D E F` | `G` | `b7` = `F` | `F` (`F A C`) | `G`–`F` | `I`–`bVII` |
| C Lydian | `C D E F# G A B` | `C` | `#4` = `F#` | `D` (`D F# A`) | `C`–`D` | `I`–`II` |

- `Em`–`F` and `G`–`F` share a second chord and are different modes — the home chord is doing the
  other half of the work, which is the point lesson 1 made on `A`.
- `Dm`–`G` is **exactly the two chords `modes-when-a-progression-functions` used**, where they are
  the loop that names no key until a `C` arrives. Link that article and let the callback do the
  work; do not re-report its detector readings.

### The trap when writing one — recomputed, and it is structural

**A major `I`–`IV` is not a vamp.** A major triad is the dominant of the triad a perfect fourth
above it, so `A`–`D`, `C`–`F`, `G`–`C` and `D`–`G` all lean into their second chord and arrive
there instead of circling. That is why **neither major-family vamp uses the fourth**: `A`–`B` goes a
whole tone up and `A`–`G` a whole tone down, and `A` is the dominant of neither.

A minor `i`–`IV` has no such problem — `Am` is not the dominant of `D`, and `Am`–`D` is Dorian's own
vamp. (Checked on `estimateKey` as a sanity test, not for quoting: every vamp in the tables above
comes back *ambiguous*, and `A`–`D`, `C`–`F`, `G`–`C` and `D`–`G` all come back *confident*, with
the fourth as the key.)

The second check is duller and still worth a sentence: the second chord has to be **inside the
mode**. A chord carrying a note the mode does not have has changed the note set, not the colour.

### A Dorian's diatonic triads — recomputed, for lesson 5's "it is a choice" beat

`Am Bm C D Em F#dim G`. Three of them hold the `F#`: **`Bm`, `D` and `F#dim`.** `D` is the one this
pathway uses because it is the plainest chord you can stand a whole bar on, not because it is the
only one. `modes-dorian-sound` already ships the `Dm` → `D` derivation; reference it.

### Screens — what this chapter may use, and what it may not

| Href | Name on screen | Used for |
| ---- | -------------- | -------- |
| `/drone` | **Drone** | The held `A`. Still the pathway's defining tool. |
| `/scale-visualizer` | **Scale Visualizer** | Paging a mode's windows. **There is no drone on this screen.** It plucks; it does not hold a root. |
| `/chord-shapes` | **Chord Shapes** | The vamp chords, on `A` and off it. |
| `/metronome` | **Metronome** | The playing lessons. Accepts `?bpm=90`; link the bare screen. |
| `/ear-trainer` | **Free Play** | This chapter only. See below. |

**`/key-detector` and `/chord-detector` are not this chapter's screens.** Chapters 1 and 5 own the
Key Detector and chapter 5 owns the Chord Detector, and the top level scoped chapter 6 to the five
above. **No lesson here links either, and no lesson here predicts anything either one prints.**

**What `/ear-trainer` actually is, because `LEARNING_CREATION.md` §7.4 undersells it and a lesson
that guesses will be contradicted by the device.** Read from
`mobile/src/screens/EarTrainerScreen.tsx`, `mobile/src/screens/EarTab.tsx` and
`mobile/src/lib/ear-training/degrees.ts`:

- **The screen is called Free Play.** That is the title on its own back link and on the card that
  opens it. Its own one-line description is "A drone, a tone, and your ear. Explore the twelve
  degrees over a held tonic, then switch on questions and name what you hear." **Link text is the
  screen's name, so write Free Play** — not "Ear Trainer" and never the route.
- **It holds a drone.** There is a drone button at the bottom, and training cannot start until the
  drone is running. It is the second screen in the app that holds a root; `/scale-visualizer` is
  still not one.
- **It is a ring of twelve chromatic degrees**, labelled exactly the way this pathway labels them:
  `1 b2 2 b3 3 4 #4 5 b6 6 b7 7`. Tap one and it sounds against the drone. Switch training on and it
  plays one and asks you to name it.
- **You choose which degrees are in play.** The default is the tonic triad — `1`, `3`, `5`.
- **Semitone 6 is labelled `#4` there, not `b5`.** So Lydian's `#4` and Locrian's `b5` are the same
  button on that circle. Worth one clause; do not build a paragraph on it.

### Components — the rules that bite here

- **`progression-player`** at `bpm` 60–75, matching every vamp in chapters 1–5 (which all used 66).
  Two chords is legal; the block plays the written list twice through, one chord per beat. Writing
  a two-chord loop out as four chords (`["Am","D","Am","D"]`) is a legitimate way to give a learner
  a longer stretch to phrase over, and this chapter uses it deliberately.
- **`scale-compare`** with `drone: true` on every block, because every one here sits under prose
  making a claim about sound. Pair neighbours **reference first** when comparing two.
  **The diff tint is always amber**, whatever the catalogue hue — so Phrygian's `b2` is rose in
  prose and rose outlined on the neck, and amber as a chip on a scale card. Write the observation, not
  the rule; chapter 4's drafts pasted the rule itself into an article.
- **`caged-shape`**: `caption` replaces only the small line **under** the heading. The heading is
  always `<form> form · <root> <scale name>` and is **not** overridable, so a caption that restates
  the form, root or scale name duplicates what is already on the card. `caged-shape` draws
  everything in the window, not a grip a hand would hold — say so once in the lesson that uses it.
- **`caged-ladder`** is **not used in this chapter.** Chapter 3's closer drew it at
  `quality: "major"` and chapter 4's at `quality: "minor"`, and chapter 4's closer already said the
  bands sit on identical frets. A third pass would be the duplicated-paragraph failure chapter 4
  caught in its own draft.
- `triad-shape` / `triad-ladder` belong to the `triads` pathway and are not used here.

---

## The six lessons

Five sound-and-playing lessons and one neck lesson. **Exactly two `caged-shape` blocks in the whole
chapter, both in the closer.**

### 1 · `modes-the-vamp-rule` — "What the Second Chord Is For"

Section id `modes.ch6.the-vamp-rule` · ~700 words · `estimatedMin` 6 ·
`tags: ["modes","theory","ear"]`.

**The one thing it teaches**: the second chord of a modal vamp is the one that contains the
characteristic note — and the home chord underneath does the other half of the work.

**What came before**: `modes-a-different-question` closed chapter 5 by saying what is left is
playing — taking each vamp already known, finding the characteristic note inside a window already
owned, and leaning on it. It also left the three-line test: is something holding one home still, is
that home a chord you can stand on, which single note are you leaning on.

Key points in order:

1. Chapter 5 settled what the **first** chord of a vamp has to be — a chord with a perfect fifth,
   something you can stand on. Every vamp in this pathway opens on one. This lesson is about the
   second chord, and there has been one rule behind all of them the whole time.
2. **State the rule.** The second chord is the one that contains the characteristic note. It is the
   only place in a two-chord loop where the harmony itself asserts that note, rather than leaving it
   to whatever the player happens to reach for.
3. **The table.** Mode, vamp, numerals, the second chord's notes, what it carries. Use the four rows
   that actually satisfy the rule — Lydian, Mixolydian, Dorian, Phrygian — and put Aeolian in with
   them, because point 5 needs it there. Five columns at most; a table sizes its columns equally and
   this is read on a phone.
4. **Ionian.** No characteristic note, so no second chord that could carry one, so no vamp. Not a
   defect — `modes-one-home-three-ways` already left that row empty and said why. One short
   paragraph, referencing rather than re-deriving.
5. **Aeolian, and it is the more interesting edge.** `Am`–`F` obeys the rule in form: the `F` does
   carry the `b6`. But the `b6` is the note Dorian gives up, not a note Aeolian is named for — and
   `F` (`F A C`) sits inside Phrygian as well, so the loop says "not Dorian" and stops.
   `modes-one-minor-three-ways` shipped exactly this; link it. The honest statement of the rule is
   that it tells you how to build a vamp that asserts a characteristic note, and a mode with no
   characteristic note gets a vamp that cannot name it.
6. **Locrian**, in one sentence: no vamp at all, because there is no first chord to stand on. Link
   `modes-locrian` or `modes-what-home-needs`. Do not re-argue it.
7. **The half the rule does not do.** Only `A`–`B` is settled by its second chord alone — `B` fits
   Lydian and none of the other six. Everywhere else the home chord finishes the job: `G` fits three
   modes and the major home rules out the two minor ones; `D` fits three and the minor home rules
   out the two major ones; `Bb` fits two and the other one's home chord is `Adim`. **Scope every
   count to the seven modes on `A`.**
8. Close forward: the rule tells you which chord to reach for. It does not yet make the mode
   audible — you still have to be somewhere on the neck, and you still have to actually lean on the
   note the chord just handed you.

Live — **one block**:

- `progression-player` `{ chords: ["Am", "F", "Am", "Bb"], bpm: 66, caption: "…" }` — the vamp that
  cannot name its mode, then the one that can, over the same home chord. This exact chord list is
  new to the pathway (chapter 4's closer used `Am D Am Bb`).

Leaves the next lesson: two chords, and nowhere yet to play them from.

### 2 · `modes-through-the-windows` — "Playing It Through the Windows"

Section id `modes.ch6.through-the-windows` · ~650 words · `estimatedMin` 6 ·
`tags: ["modes","fretboard","ear"]`.

**The one thing it teaches**: a vamp goes round and round, so the playing goes across the neck
rather than staying in one box — and the note you are aiming at is inside every one of the five
windows.

**What the previous lesson left it**: which two chords, and what the second one is carrying.

Key points in order:

1. Open on the problem, not the frame: a vamp repeats, so you are going to be playing over it for
   longer than one box's worth of ideas. The five windows were the answer to that question before
   this pathway started.
2. One sentence on the frame, with a link: same five windows, anchored on the root, unchanged by
   which mode fills them. `modes-no-new-shapes` and `minor-caged-the-window-stays-put` both cover it.
   **Do not re-teach the window-edge rule; the three neck lessons before this own it.**
3. **The fact that makes moving cheap, and it is exact**: every one of the five windows holds the
   characteristic note — at least once, and mostly two or three times. Wherever your hand is, the
   note the vamp is asking for is already inside the box. State it for the mode that has a
   characteristic note, and say plainly that Ionian and Aeolian give you nothing to aim at, which is
   what having no characteristic note means in practice.
4. **The worked mode is A Dorian**, over `Am`–`D`. Print the five-row table of where the `6` (`F#`)
   sits, from the verified table above and nothing else:

   | Form | Frets | The `6` sits at |
   | ---- | ----- | --------------- |
   | A | 0–3 | `1·2` `6·2` |
   | G | 1–5 | `1·2` `4·4` `6·2` |
   | E | 4–8 | `2·7` `4·4` |
   | D | 6–10 | `2·7` `5·9` |
   | C | 9–13 | `3·11` `5·9` |

5. **The seam, and it is this lesson's best fact — scoped to A Dorian.** Neighbouring windows
   overlap, and in A Dorian a copy of the `6` sits inside both windows at every join: `1·2` and
   `6·2` belong to the A form and the G form; `4·4` to the G form and the E form; `2·7` to the E
   form and the D form; `5·9` to the D form and the C form. Four joins, a `6` on every one — so the
   note you are aiming at is also the note you cross on. **Say it about A Dorian. It is not true of
   every mode**, and a lesson that generalises it will be wrong for Lydian, Phrygian and Locrian.
6. **The practical routine**, as an ordered list, and it must be doable with what exists:
   - Get the loop going. Nothing in the app loops a vamp for you, so either play the two chords
     yourself, or hold the root on Drone and hear the second chord in your head. A slow click from
     the Metronome keeps the crossing honest.
   - Start in whichever window your hand is already in and play until you have run out of ideas
     rather than out of frets.
   - Cross to the next window on the note you are aiming at, not on the root.
   - Come back down the same way.
7. Send them to the **Scale Visualizer** to page any mode's windows — root `A`, scale Dorian. **No
   drone on that screen**; the held root is **Drone**.
8. Close forward into the leaning lesson: you can now be anywhere on the neck with the right note
   under your finger, and that on its own still will not sound like Dorian.

Live — **one block**:

- `progression-player` `{ chords: ["Am", "D", "Am", "D"], bpm: 66, caption: "…" }` — the two chords
  written twice so the loop runs long enough to play across. New to the pathway.

**No `caged-shape` in this lesson.** The chapter's two are in the closer, and the three neck lessons
in chapters 3 and 4 already drew these windows.

Leaves the next lesson: the note is under your finger. What you do with it is the rest of the
chapter.

### 3 · `modes-lean-on-it` — "Landing On It, Not Just Including It"

Section id `modes.ch6.lean-on-it` · ~750 words · `estimatedMin` 6 ·
`tags: ["modes","ear","theory"]` · **the chapter's keystone and the most important lesson in it.**

**The one thing it teaches**: including the characteristic note is not the same as leaning on it —
where a phrase stops is what makes a mode sound like itself rather than like the scale it is nearest.

**What the previous lesson left it**: the note is in every window and you can reach it from anywhere.

Key points in order:

1. **Open on the failure, because the learner will have already had it.** Play every note of A
   Dorian over `Am`–`D`, up and down, and end every phrase on `A` or `C`, and it sounds like A minor
   with a passing `F#`. The `F#` was there the whole time. It was never absent; it was never
   arrived at.
2. **The argument is one the pathway has already made twice, one level up.**
   `modes-what-a-mode-is` said a note set has no home until something outside it decides;
   `minor-caged-what-decides-home` said the same for major against minor. Emphasis decides the
   tonic. Emphasis also decides the colour. Link both, and do not restate their arguments —
   name the connection and move on.
3. **Four ways to lean, as a list.** Each is one line, and each is something a hand does:
   - **Stop there.** End a phrase on it and let it ring. The strongest of the four by a distance.
   - **Stay there.** Hold it while the second chord is under it, rather than passing through.
   - **Start there.** Begin a phrase on it instead of on the root.
   - **Circle it.** Approach from a step above and a step below and land on it, so the ear is told
     twice that this is the target.
   Keep this to a list plus a sentence. **Do not teach technique** — no bends, no vibrato, no
   picking-hand advice.
4. **Time it with the harmony, and this is the practical half.** In every one of these vamps the
   characteristic note is a note of the second chord, which means the easiest moment to land on it
   is while that chord is sounding: the `F#` over the `D`, the `D#` over the `B`, the `G` over the
   `G`, the `Bb` over the `Bb`. Landing there is both the mode's colour and the chord's own note at
   once.
5. **The one place this collides with an avoid note, and it is exactly one.** Phrygian's `b2` is its
   characteristic note **and** an avoid note over `Am` — a half step above the root, which is what
   makes it the note the mode is named for and what makes it grind. Of the seven, Phrygian is the
   only one where those two are the same note. **Scope it to the seven.** The resolution is already
   shipped: `modes-avoid-notes-everywhere` established that an avoid note belongs to the chord under
   your hand rather than to the scale, and over the `Bb` chord the `b2` is the chord's own root and
   nothing in A Phrygian clashes with it at all. So land on the `Bb` while the `Bb` is sounding; over
   the `Am`, pass through it.
6. **The two that have nothing to lean on.** Ionian and Aeolian give you no target, and that is not
   a shortfall — it is what being the reference means. What they ask of you instead is the other
   half of the same skill: the `4` in one and the `b6` in the other are notes to move through rather
   than land on. `modes-the-avoid-note` and `modes-the-ache` both said so.
7. **The counter-check, and end on it.** Play the same seven notes over the same vamp and never stop
   on the characteristic note. It comes out sounding like the plain scale it is nearest. That is the
   test, it takes thirty seconds, and it is the difference the whole chapter is about.

Live — **two blocks**:

- `progression-player` `{ chords: ["Am", "D", "Am", "D"], bpm: 60, caption: "…" }` — slower than the
  previous lesson's, so there is room to hold a note. Give it a different instruction: land on the
  `F#` every time the `D` comes round, and on nothing else.
- `scale-compare` `{ root: "A", scales: ["phrygian"], drone: true }` — a single reference card, so
  **no amber chips anywhere**. Instruction: start the drone and tap `Bb` against the held `A`. That
  grind is the mode's own name and the reason it needs the `Bb` chord under it. Then the honesty
  caveat both keystone lessons before this made, in two sentences: the drone holds the root and not
  the chord, so hold a real `Bb` from Chord Shapes and let the note ring over that instead.

Leaves the next lesson: you can make one sound like itself. Now the other direction — someone else's
loop, and no label on it.

### 4 · `modes-name-it-by-ear` — "Hearing a Mode Cold"

Section id `modes.ch6.name-it-by-ear` · ~700 words · `estimatedMin` 6 ·
`tags: ["modes","ear","theory"]`.

**The one thing it teaches**: a two-step test that names any of the six playable modes from a static
vamp — is home major or minor, then which single note fits.

**What the previous lesson left it**: how to make a mode sound like itself when you already know
which one you meant.

Key points in order:

1. Open on the situation: a loop is going, nobody has told you what it is, and you have everything
   you need to work it out.
2. **Step one — is home major or minor?** The chord that keeps coming back is the one to listen to,
   and the `3` is what decides. Major puts you in Lydian, Ionian or Mixolydian; minor in Dorian,
   Aeolian or Phrygian. `modes-two-families` did this; reference it in a sentence.
3. **Step two — try the candidate note.** This is the guitar-specific half and it is why the test is
   practical rather than theoretical: you do not have to identify the note, you only have to find
   out whether it fits.
   - Over a major home on `A`: play `D#`. If it fits, Lydian. Play `G`. If it fits, Mixolydian. If
     neither fits, Ionian.
   - Over a minor home on `A`: play `F#`. If it fits, Dorian. Play `Bb`. If it fits, Phrygian. If
     neither fits, Aeolian.
   All four are verified: A Ionian has neither `D#` nor `G`, A Lydian has `D#` and no `G`,
   A Mixolydian has `G` and no `D#`, A Dorian has `F#` and no `Bb`, A Phrygian has `Bb` and no
   `F#`, A Aeolian has neither. **Four notes settle all six.**
4. **Or read it off the second chord**, which is the vamp rule run backwards. A short table, verified
   above: major home plus a major chord a whole tone up → Lydian; major home plus a major chord a
   whole tone down → Mixolydian; minor home plus a major chord a perfect fourth up → Dorian; minor
   home plus a major chord a semitone up → Phrygian; minor home plus a major chord a minor sixth up
   → Aeolian, and that last one still cannot separate Aeolian from Phrygian on its own, so reach for
   the `Bb` and find out.
5. **Free Play is the screen for the ear half.** Describe what it actually is: a drone on a tonic and
   a ring of the twelve degrees, labelled `1 b2 2 b3 3 4 #4 5 b6 6 b7 7`. Tap one and it sounds
   against the held root; switch training on and it plays one and asks you to name it. The default
   is the tonic triad, so the useful move here is to switch on just the four degrees this pathway
   has been naming — `b2`, `#4`, `6` and `b7`. One clause, no more: `#4` and `b5` are the same
   distance off the root, so Lydian's note and Locrian's are the same button there.
   **Link text is Free Play.**
6. **The honest limits**, one short paragraph:
   - Two of the seven are reached by elimination rather than recognition. Ionian and Aeolian are
     what is left when neither candidate note fits, and that is a real answer.
   - The Key Detector is not the tool for this and never was — it ranks major and minor keys and has
     no name for a mode. `modes-when-the-harmony-moves` said so. **One clause, no link, no
     prediction of what it prints.**
   - If the loop is not static, none of this applies: a progression that arrives names a key, and
     the mode names hovering over each chord are labels. Link `modes-a-different-question`.
7. Close forward: you can name someone else's. Writing one of your own is the same table read from
   the other end.

Live — **one block**:

- `progression-player` `{ chords: ["A", "G", "A", "G"], bpm: 66, caption: "…" }` — a major home and
  a major chord a whole tone below it. Walk the two-step test over it in prose after the block, and
  say plainly that on screen the chord names are printed, so this is the test done by reading;
  the cold version is when someone plays it at you, which is what Free Play is for.

Leaves the next lesson: the same table, read backwards, on any root you like.

### 5 · `modes-write-a-vamp` — "Write Your Own Two-Chord Vamp"

Section id `modes.ch6.write-a-vamp` · ~700 words · `estimatedMin` 6 ·
`tags: ["modes","theory","ear"]` · **the one lesson in the pathway that leaves the root `A`.**

**The one thing it teaches**: three steps and one check produce a modal vamp on any root — and the
check is that the loop must not arrive anywhere.

**What the previous lesson left it**: the vamp rule read forwards and backwards, on `A`.

Key points in order:

1. **The three steps**, as an ordered list:
   - **Pick home.** A chord you can stand on: a perfect fifth over its root, major or minor. That
     choice alone puts you in one of the two families.
   - **Pick the note.** Which single tone do you want to be leaning on. That is the mode.
   - **Find the chord of the mode that contains it**, and make it the second chord.
2. **Flag the transposition in a clause** — this pathway has stayed on `A` the whole way through so
   seven modes could be compared note against note, and the recipe is worth taking off it once,
   because a recipe you can only run on one root is not a recipe.
3. **The worked table**, four rows, every cell verified: D Dorian `Dm`–`G`, E Phrygian `Em`–`F`,
   G Mixolydian `G`–`F`, C Lydian `C`–`D`. Include the mode's notes and which note the second chord
   is carrying. Point out that `Em`–`F` and `G`–`F` have the **same second chord** and are different
   modes — the home chord is doing the other half, exactly as it did on `A`.
4. **`Dm`–`G` is a callback worth making.** Those are the two chords `modes-when-a-progression-functions`
   used, where they named no key at all until a `C` arrived. Link it. **Do not re-report its
   detector readings** — say that a `C` on the end turns it into something else and let the link
   carry the rest.
5. **The check, and it is the lesson's real content.** A vamp has to refuse to go anywhere, so the
   second chord must not be somewhere home wants to resolve to. The specific trap: **a major `I`–`IV`
   is not a vamp.** A major triad is the dominant of the triad a perfect fourth above it, so `A`–`D`,
   `C`–`F` and `D`–`G` all lean into the second chord and settle there — you have written a cadence
   with the chords in the wrong order, not a loop. That is exactly why the major family's two vamps
   go a whole tone up and a whole tone down instead. A minor `i`–`IV` has no such problem, which is
   why `Am`–`D` works. Reference `modes-when-a-progression-functions` for the arrival idea, one link.
6. **The second, duller check**: the second chord has to be inside the mode. A chord carrying a note
   the mode does not have has changed the note set rather than coloured it. One or two sentences.
7. **It is a choice, not a formula.** In A Dorian three of the seven chords hold the `F#` — `Bm`, `D`
   and `F#dim` — and `D` is the one everyone reaches for because it is the plainest chord to hold a
   whole bar. `modes-dorian-sound` already showed `Dm` turning into `D`; reference it.
8. **The ceiling, and the one sentence about what comes next.** A two-chord loop is as far as this
   goes. **Exactly one sentence** naming modal interchange — borrowing a chord from a parallel mode
   into a key that is still functioning — as the next thing and a separate topic. No example, no
   second sentence. It may go here or in the closer, **but not both**; put it here, and the closer
   will not repeat it.
9. Close by sending them to play one: Chord Shapes for whichever two chords they picked, and the
   Metronome to keep the loop even.

Live — **two blocks**:

- `progression-player` `{ chords: ["Em", "F"], bpm: 66, caption: "…" }` — E Phrygian.
- `progression-player` `{ chords: ["C", "D"], bpm: 66, caption: "…" }` — C Lydian.

Both symbol sets verified as parsing. Do not add a third; the table carries the other two rows.

Leaves the closer: seven modes, one root, and a neck that never changed.

### 6 · `modes-seven-homes-one-neck` — "Seven Homes, One Neck"

Section id `modes.ch6.seven-homes-one-neck` · ~700 words · `estimatedMin` 6 ·
`tags: ["modes","fretboard","ear","theory"]` · **chapter closer and pathway closer.**

**The one thing it teaches**: all seven live in the same five windows on the same root, and what
separates them is which note you lean on against a home that holds.

**What came before**: everything.

Key points in order:

1. Open on the neck rather than on a summary. Every one of the seven modes in this pathway happened
   inside the same five windows, on the same root, with the same hand positions the two CAGED
   pathways left behind. Link `caged-the-whole-neck` and `minor-caged-what-the-third-was-worth`,
   which are where those two pathways ended.
2. **Two `caged-shape` blocks**, the E form at frets 4 to 8, `A Lydian` and then `A Locrian` — the
   brightest and the darkest, in the same five frets. Say once that the window draws everything
   inside it rather than a grip. **The point is the frame, not the dot count**: three lessons have
   already made the never-count-dots point and a fourth would be repetition. Captions must add
   something and must not restate `E form · A Lydian` or `E form · A Locrian`.
3. **The master table**, and it is the artefact of the whole pathway. **Five columns**, seven rows:
   mode, characteristic note, home chord, vamp, what to lean on. Ionian's and Aeolian's "lean on"
   cells say there is nothing to lean on and name the note to move through instead; Locrian's row
   says the home will not hold.
4. **The neck claim, once, in a sentence with a link to `modes-through-the-windows`**: every one of
   the five windows already holds the note each mode is named for. Do not reprint the position table.
5. **What is actually different between them**, stated plainly at the end of six chapters: not the
   shapes, not the positions, not the number of notes. One decision about which chord home is, and
   one note leaned on against it.
6. **Do not write "one dot moved."** It is false of Locrian, which needs two changed degrees from
   the natural minor the learner owns, and `modes-no-new-shapes` corrected it in chapter 1. The
   closer is the most tempting place in the pathway to reintroduce it. The true version is that
   there is no new shape anywhere in the pathway.
7. **What the learner can do now**, as a short list and phrased as actions rather than knowledge:
   hear a static vamp and name the mode it is asking for; play any of the six over its own vamp,
   across the neck rather than in one box; make a mode sound like itself rather than like the scale
   it is nearest; write a two-chord vamp on any root.
8. **Close the pathway.** The drone, the vamp, the one note. Send them somewhere real — Drone with a
   held `A`, Scale Visualizer for whichever mode they want to live in for a week, Free Play for the
   ear. **Do not name modal interchange here**; `modes-write-a-vamp` has the one sentence.
9. Chapters may be named by number; **lessons may not**. Do not count lessons or chapters in prose —
   chapter 5 shipped a draft that said "five chapters" and "six chapters" two paragraphs apart.

Live — **two blocks, both `caged-shape`, and nothing else**:

- `caged-shape` `{ root: "A", form: "E", scale: "lydian", caption: "…" }`
- `caged-shape` `{ root: "A", form: "E", scale: "locrian", caption: "…" }`

---

## The activities

Two, both `"optional": true`, both after every article section in the chapter.

### `modes-land-on-the-note` — `note-play`

Section id `modes.ch6.land-on-the-note` · `note-play`, modes `easy` and `hard`, document board
frets 0–10.

The chapter's keystone made physical: the note you lean on and the home you lean it against, in one
window, alternating rather than grouped. It stays clear of the five existing `modes` activities by
mode and by window — `modes-find-the-dial` works Lydian's **G** form and Mixolydian's **C** form,
`modes-raise-the-sixth` works the `b6`→`6` move in the **G**, **E** and **D** forms,
`modes-the-fifth-that-left` works the `5`→`b5` move in the **A** and **G** forms,
`modes-walk-the-ladder` takes bare notes on strings 5 and 4, and `modes-same-notes-new-home` keeps
one note set below fret 5. **No mode-and-window pairing below is used by any of them, and Phrygian
is untouched by all five.**

Open-string MIDI: string 1 = 64, 2 = 59, 3 = 55, 4 = 50, 5 = 45, 6 = 40.

| Round | Board | Prompt content | Targets (`string·fret`), ordered | MIDI |
| ----- | ----- | -------------- | -------------------------------- | ---- |
| `r_modes-land-on-the-note.phrygian-at-the-nut` | 0–3 | The A form of A Phrygian at the nut: a root, then the `b2` one fret above it, twice over. That single fret is the whole mode. | `5·0 5·1 3·2 3·3` | 45 46 57 58 |
| `r_modes-land-on-the-note.mixolydian-e-form` | 4–8 | The E form of A Mixolydian, frets 4 to 8: root, `b7`, root, `b7`, root — climbing, alternating home and the note you lean on. | `6·5 4·5 4·7 2·8 1·5` | 45 55 57 67 69 |
| `r_modes-land-on-the-note.lydian-d-form` | 6–10 | The D form of A Lydian, frets 6 to 10 — a window this chapter never draws: the two `#4`s and the two roots, alternating low to high. | `5·6 4·7 3·8 2·10` | 51 57 63 69 |

All three rounds `"ordered": true`. Every target verified inside its round's board, on a six-string
neck, against the recomputed window tables above, and **every MIDI value distinct within its round**.

Collisions found and designed around: in the E form of A Lydian the `#4`s at `2·4` and `3·8` both
sound MIDI 63, and A Dorian's `6`s at `4·4` and `5·9` both sound MIDI 54 while `1·2`, `2·7` and
`3·11` all sound 66 — which is why the Dorian window table in lesson 2 is not turned into a round
here.

### `modes-hold-the-vamp` — `rhythm`

Section id `modes.ch6.hold-the-vamp` · `rhythm`, three rounds. **The pathway's first rhythm
activity.**

The chapter needs a loop that keeps going, and nothing in the app provides one — so the learner has
to be able to hold two chords steady themselves while listening to what one note does over them.
That is what this drill builds. Every prompt must tell the learner to mute the strings: the drill
hears attacks, not notes.

`slots` must be exactly `beatsPerBar × subdivision × bars` long. All three checked below.

| Round | bpm | Grid | slots | Content |
| ----- | --- | ---- | ----- | ------- |
| `r_modes-hold-the-vamp.one-bar-each` | 66 | 4 × 1 × 2 = **8** | `accent hit hit hit accent hit hit hit` | Two bars, one chord each, four strums to the bar. The accent is where the chord changes. Change the shape under the mute anyway. |
| `r_modes-hold-the-vamp.the-groove` | 72 | 4 × 2 × 2 = **16** | `accent hit hit rest hit hit hit rest` ×2 | Six strikes a bar and nothing on the last eighth — a vamp that stays put rather than pushing into the change. |
| `r_modes-hold-the-vamp.let-it-ring` | 60 | 4 × 2 × 2 = **16** | `accent rest rest rest rest hit rest rest` ×2 | Two strikes a bar, on one and the and of three. Slow and sparse, so there is room to hear a single note over the top. |

`countInBars` 1 on the first two, 2 on the third. Every `bpm` inside the metronome's 20–300.

**Do not describe the third round as "the one a real vamp uses"** or make any claim about what
records do. It is a sparse pattern that leaves room; that is all it is.

---

## The checkpoint — `modes-ch6-checkpoint`

`kind: "checkpoint"` · `passThresholdPct` 70 · **8 questions**, written **after** the six articles
were read, from what they actually say. Referenced only from the chapter's `checkpoint` field, not
as a section — matching chapters 1–5 and every sibling pathway.

| # | id suffix | Draws on | Tests |
| - | --------- | -------- | ----- |
| 1 | `the-rule` | `modes-the-vamp-rule` | What the second chord of a modal vamp is chosen for |
| 2 | `both-chords` | `modes-the-vamp-rule` | That the home chord does the other half — `D` fits three modes, not one |
| 3 | `aeolian-edge` | `modes-the-vamp-rule` | Why `Am`–`F` cannot name its own mode |
| 4 | `across-the-neck` | `modes-through-the-windows` | That every window already holds the characteristic note, and what that is for |
| 5 | `lean` | `modes-lean-on-it` | Including versus landing — the chapter's central claim |
| 6 | `phrygian-collision` | `modes-lean-on-it` | Phrygian's `b2` is both its characteristic note and an avoid note over `Am`, and where to put it |
| 7 | `name-it` | `modes-name-it-by-ear` | The two-step test run on a loop |
| 8 | `write-one` | `modes-write-a-vamp` | Building a vamp on a new root, and why a major `I`–`IV` is not one |

Every lesson is covered except the closer, which summarises rather than adding; questions 1–3 and 8
between them carry what it restates. Distractors encode this chapter's real misunderstandings —
"the second chord names the mode on its own", "playing the note is enough", "any two chords are a
vamp", "a mode has its own shapes", "the ear trainer will name the mode for you" — never filler.
**No question refers to an option by letter or position.** Every question carries an `explanation`.
**No `listen` question**: a `listen` question plays bare notes with no drone and no accompaniment,
so it cannot test a modal claim.

---

## Errata found while reviewing the drafts

**Twenty corrections** were made to drafts that both lesson agents had reported clean, after reading
every article line by line and recomputing everything numeric. Recorded because most of them will
recur in whatever gets built next.

### False or self-contradicting claims

1. **A false count, in the chapter's opening sentence.** `modes-the-vamp-rule`: *"Every vamp in this
   pathway opens on a chord you can stand on … Lydian stands on `A`, Dorian on `Am`, and so on down
   all seven."* Locrian's home chord has no perfect fifth, which is the whole of chapter 5. The
   sentence's own premise excludes the seventh. Rewritten as "through every mode with a home that
   holds".
2. **An interval written upside down** — *"a chord you can stand on, one with a perfect fifth
   underneath it"*. A fifth is above the root. **This is the identical error chapter 5 caught and
   corrected in `modes-what-home-needs`**, reproduced by a different agent in a different chapter,
   which suggests it is a phrasing the model reaches for rather than a one-off.
3. **A claim contradicted three paragraphs earlier in the same article.**
   `modes-through-the-windows` said Ionian and Aeolian give you nothing to aim at, and then closed
   with *"Run the same routine on any of the other four vamps and nothing about it changes."*
   Aeolian's vamp is one of those four and has no note to aim at. Narrowed to the Lydian, Mixolydian
   and Phrygian loops.
4. **A quantifier that swallows the exception.** `modes-lean-on-it`: *"In every vamp in this pathway,
   the characteristic note is a note of the second chord."* `Am`–`F` has no characteristic note to be
   a note of. Rewritten as "Every vamp with a note to lean on puts that note inside its second
   chord."
5. **A sibling article contradicted.** `modes-write-a-vamp` opened *"Every vamp in this pathway has
   followed the same recipe, it just never got written down as one"* — it was written down, in this
   chapter, by `modes-the-vamp-rule`. Rewritten to credit and link it.
6. **A degree attributed to the wrong axis.** `modes-seven-homes-one-neck`: *"What changed window to
   window was degrees."* Degrees change from mode to mode; what changes window to window is which
   frets the box covers.

### Numbers

7. **A live block's own output miscounted.** `modes-through-the-windows` captioned
   `["Am","D","Am","D"]` as *"Sixteen beats"*. `progression-player` plays the written list twice at
   one chord per beat, so four written chords is **eight** beats. Corrected. **Worth adding to
   §7.3's row**: the block's length is `chords.length × 2` beats, not `× 4`.
8. **A window width generalised.** *"any single five-fret window"* — the A form is clamped at the nut
   and is four frets wide. Chapter 3 shipped that fact correctly. Reduced to "any single window".

### Banned constructions

9. **A positional reference to another lesson**, which the brief's conventions table bans for the
   same reason it bans "the last lesson". `modes-name-it-by-ear`: *"it's the same rule this chapter
   opened with, run backwards."* Replaced with a link by slug. Note the new variant — the ban is
   usually broken with "the last lesson", and this one used a chapter-relative position instead.

### Meta-instruction and authoring register

10. **`X owns Y` leaking into prose.** `modes-seven-homes-one-neck`: *"Playing It Through the Windows
    owns the position tables that prove it."* "Owns" is this plan's vocabulary for which lesson is
    responsible for what; a reader has no idea what it means for an article to own a table. **Only
    one leak in six drafts, against five in chapter 4 and four in chapter 5** — the dispatch briefs
    for this chapter quoted the actual sentences that leaked in earlier chapters rather than
    describing the failure, and one agent reported catching and fixing a further instance itself.
11. **A second leak, of the plan's unit of measure.** `modes-write-a-vamp`: *"There's a second,
    plainer check **worth a sentence**: …"* — this plan says "one or two sentences" and "worth a
    sentence" all the way through, and the phrase came out the other end attached to a check the
    reader is being asked to run. Cut.

### A term the pathway never defined

12. **"Dominant", used functionally, with no definition anywhere in six chapters.**
    `modes-write-a-vamp`'s central check reads *"A major triad is the dominant of the triad a perfect
    fourth above it."* Searched across the whole corpus: the word appears in `modes-the-tritone`
    ("the two notes of a dominant seventh chord"), in `modes-mixolydian-sound` (quoting the app's
    "the dominant sound"), and in `minor-caged-what-the-third-was-worth` ("no dominant sevenths") —
    every one of them as part of a **chord name**, never as the function. A learner who has met
    "dominant seventh" as a label has no way to read "the dominant of" as a relationship. Glossed
    inline in seven words rather than expanded into a lesson: "— a `V` looking for its `I` —".
    **Worth carrying forward**: this pathway's audience is assumed to be fluent in altered degrees
    and CAGED, not in functional-harmony vocabulary, and the brief's prerequisite list does not
    mention it.

### Broken or dangling sentences

13. **A dangling back-reference across two live blocks.** `modes-write-a-vamp` said *"Those two
    chords in the first row"* in a paragraph that sits after two `progression-player` blocks drawing
    the second and fourth rows. Replaced with the chords by name.
14. **A garbled closing clause.** `modes-seven-homes-one-neck`: *"…and this is where theirs and this
    one meet."*
15. **An unreadable repetition.** `modes-lean-on-it`: *"the `G` is inside the `G`"* — the degree and
    the chord share a letter. Rewritten as "the `b7` that is the `G` chord's own root".
16. **A circular instruction for an ear test.** `modes-name-it-by-ear`: *"play `D#`. If it sits
    inside the scale, you're in Lydian."* You are trying to find out what the scale is.

### Presentation and cross-linking

17. **A caption that described nothing the block does.** `modes-the-vamp-rule`'s
    `progression-player` was captioned *"Listen for where the first two chords already sound complete
    on their own"* — the block's point is that `Am`–`F` cannot name its mode and `Am`–`Bb` can.
18. **A degree outside a `code` mark**, in a table header (`The 6 sits at`) and inside a compound
    (`F#-holding chords`).
19. **The closer's own table depended on a lesson it never linked.** Its final column is
    `modes-lean-on-it`'s whole claim. Link added.
20. **Two of the six lessons made no link to any sibling in their own chapter**, so the chapter read
    as six essays rather than a chain. Links added in `modes-name-it-by-ear` and
    `modes-write-a-vamp`, both to `modes-the-vamp-rule`.

### What went right, which is worth recording too

- **Every number was correct in every draft.** All fret positions, every chord's membership in every
  mode, the four transposed vamps, all seven rows of the closer's table, the Free Play description,
  and all six `readingTimeMin` values. Nothing numeric had to be corrected.
- **No superlative was false.** Both agents kept the scoping they were given ("the only one of the
  seven", "true of this particular vamp") and neither widened one.
- **No `caged-shape` caption restated a heading**, no chip was called a non-amber colour, no screen
  was linked by route, no `listen` question was written, `/key-detector` and `/chord-detector` were
  never linked, and "one dot moved" appears nowhere.

---

## Notes for the top level

- **The pathway's `estimatedMin` is still 270 and the section total is now 259** (39 + 40 + 47 + 46 +
  35 + 52). §8 says recompute it at the end; no chapter agent has touched it and this one has not
  either.
- **The pathway's `summary` in `curriculum/modes.json` is still wrong**, and chapter 5 flagged it
  already: it ends "…how every mode is a window you already know with a **single dot moved**", which
  `modes-no-new-shapes` corrected in chapter 1 and `modes-locrian` contradicts directly. The field
  belongs to the top level and was not edited here.
- **`LEARNING_CREATION.md` §7.4 understates `/ear-trainer` badly, and §7.3 is missing a fact about
  `progression-player`.** Both cost this chapter a draft error or nearly did:
  - `/ear-trainer` is **called Free Play** on screen, it **holds a drone**, and it is a ring of the
    twelve chromatic degrees labelled `1 b2 2 b3 3 4 #4 5 b6 6 b7 7` with a configurable active set
    (default `1 3 5`). §7.4 calls it "Interval and degree ear training" and names it "Ear Trainer",
    which is neither its name nor a description a lesson could write from. It is also **the second
    screen in the app that holds a root** — the §7.4 note that `/drone` is the only one is now the
    thing to correct, not just `/scale-visualizer`.
  - `progression-player` plays the written list **twice**, one chord per beat, so a block's length is
    `chords.length × 2` beats. A draft captioned a four-chord block as sixteen beats.
- **No live component was wanted and unavailable.** The one thing this chapter would genuinely have
  used is a looping vamp — `progression-player` stops after two passes, so every playing lesson has
  to tell the learner to play the loop themselves. That is honest content rather than a gap, and it
  is what the `rhythm` activity is for, but a `loop: true` prop would make chapters 3, 4 and 6 all
  better and is worth considering before the next sound-led pathway.
