# Chapter 4 — The Minor Family

Chapter id `modes.ch4` · slug `the-minor-family` · 7 articles, 1 activity, 1 checkpoint.

After this chapter the learner can hear the difference between Dorian, Aeolian and Phrygian, play
each over its vamp, and land on the `6` over a `i`–`IV` so it sounds Dorian and not Aeolian. It is
the bottom row of chapter 2's two-families table, one mode at a time.

**This chapter is the mirror of chapter 3, deliberately.** Same seven-lesson shape: reference-sound,
keystone-sound, raised-dial sound, raised-dial neck, lowered-dial sound, lowered-dial neck, closer.
Five sound lessons, two neck lessons, exactly six `caged-shape` blocks and all six inside the two
neck lessons. The symmetry between the families is itself a teaching point — a learner arriving here
should feel the shape repeat with the dials changed.

Anchor root is **A** everywhere. String numbering is **1 = high e, 6 = low E**. Positions are
written `string·fret`.

---

## Verified facts this chapter is built on

Everything below was **recomputed** — from `SCALE_TYPES` in
`mobile/src/lib/scale-library/catalog.ts`, and from a reimplementation of `cagedFormWindows` /
`cagedFillMarks` in `mobile/src/lib/guitar-positions/caged.ts` using `OPEN_PITCHES = [4,11,7,2,9,4]`
(index 0 = high e), `FRET_COUNT = 15`, `MIN_SPAN = 3`, `CAGED_FORM_OFFSETS` as shipped. **These are
the numbers every lesson must use.**

### The three, on A

| Mode | Notes | Degrees | Parent major | Home chord | Characteristic note | Card heading |
| ---- | ----- | ------- | ------------ | ---------- | ------------------- | ------------ |
| Dorian | `A B C D E F# G` | `1 2 b3 4 5 6 b7` | G | `Am` | `6` (`F#`) — **amber** | `A Dorian` |
| Aeolian | `A B C D E F G` | `1 2 b3 4 5 b6 b7` | C | `Am` | none | **`A Natural minor`** |
| Phrygian | `A Bb C D E F G` | `1 b2 b3 4 5 b6 b7` | F | `Am` | `b2` (`Bb`) — **rose** | `A Phrygian` |

Aeolian carries `accent: null`. Its `scale-compare` card has **no tinted chip** and its `caged-shape`
window has **no outlined dot**. That is a fact about it — it is the reference — not a gap.

**Never write "the Aeolian card".** `SCALE_TYPES[].name` for `minor` is `Natural minor`, so both
`scale-compare` and `caged-shape` head that card **`A Natural minor`**, with `"The plain minor scale
— Aeolian"` in the small line underneath. `modes-two-you-already-play` already carries the clause
explaining this to the learner, so a chapter-4 lesson may simply say "the card headed
`A Natural minor`" without re-explaining. The other two are headed with their modal names.

**Spell Phrygian's second degree `Bb`, never `A#`.** That is what `buildScale('A','phrygian')`
prints, and the chip beside the prose will say `Bb`.

### The avoid note — the arithmetic, recomputed against the `Am` triad

`Am` is `A C E`. A scale tone sitting **a half step above a chord tone** is the clash — that is
`modes-the-avoid-note`'s definition, already shipped, and this chapter references it rather than
redefining it.

| Mode | Scale tones a half step above a note of `A C E` |
| ---- | ---------------------------------------------- |
| Dorian | **none** |
| Aeolian | `b6` (`F`), a half step above the `5` (`E`) |
| Phrygian | `b2` (`Bb`) above the `1`, **and** `b6` (`F`) above the `5` — **two** |

Worked out for Aeolian, every note:

- `B` — a **whole** step above `A`. Fine.
- `C` — a chord tone.
- `D` — a **whole** step above `C`. Fine.
- `E` — a chord tone.
- `F` — **a half step above `E`.** The avoid note.
- `G` — a whole step below `A` and a half step below nothing in the chord. Fine.

And for Dorian's `F#`: a **whole** step above the `5` (`E`), a **whole** step below the `b7` (`G`).
Nothing in `A C E` sits a half step below it. **Dorian has no avoid note over a static `Am`.**

**The direction refinement, and it is this chapter's best conceptual beat.**
`minor-caged-the-last-two-notes` already found **two** notes of A natural minor sitting a semitone
from a chord tone — the `2` and the `b6` — and that is why the minor pentatonic left exactly those
two out. Only **one** of them is an avoid note, because direction matters: the `2` (`B`) is a half
step **below** the `b3` (`C`) and leans up into it; the `b6` (`F`) is a half step **above** the `5`
(`E`) and sits on top of it. Same distance, opposite behaviour — the identical shape
`modes-the-avoid-note` used for Ionian's `G#` leaning up into the root. Recomputed: `B` is pitch
class 11, `C` is 0; `F` is 5, `E` is 4.

**The resolution of chapter 3's scoped claim.** `modes-the-avoid-note` wrote "the only one of this
chapter's three modes" and scoped it on purpose, because **Dorian has none either**. Recomputed
across the six modes of the two families:

| | Lydian | Ionian | Mixolydian | Dorian | Aeolian | Phrygian |
| - | - | - | - | - | - | - |
| avoid notes over its own tonic triad | **0** | 1 (`4`) | 1 (`4`) | **0** | 1 (`b6`) | **2** (`b2`, `b6`) |

So **each family holds exactly one mode with no avoid note, and in both cases it is the mode with
the raised dial** — Lydian raises the `4`, Dorian raises the `6`. That symmetry is chapter 4's to
state and it is exact. **Scope it to these six.** Do not extend the table to Locrian, do not
generalise what an avoid note is beyond the definition already shipped, and do not explain why a
diminished tonic fails — chapter 5 owns all three.

**Phrygian has two, and that is a safe superlative among the six** (Lydian 0, Ionian 1, Mixolydian
1, Dorian 0, Aeolian 1, Phrygian 2). Keep the claim scoped to the six anyway; there is no reason for
this chapter to gesture at Locrian at all.

### Half steps and the tritone — established in chapter 2, reference rather than re-derive

| Mode | Its two half steps | Tritone | On `A` | Touches the tonic triad? |
| ---- | ------------------ | ------- | ------ | ------------------------ |
| Dorian | `2`→`b3` · `6`→`b7` | `b3` and `6` | `C` – `F#` | the `b3` |
| Aeolian | `2`→`b3` · `5`→`b6` | `2` and `b6` | `B` – `F` | **no** |
| Phrygian | `1`→`b2` · `5`→`b6` | `b2` and `5` | `Bb` – `E` | the `5` |

All recomputed. Three things worth reading off it, all already licensed by chapter 2:

- **A half step above the fifth belongs to Aeolian and Phrygian only.** Locrian has a `b6` but its
  fifth is a `b5`, so its gap there is a whole step. `modes-half-steps` already ships this
  correctly, including the sentence "Dorian's whole point is that it has no half step above the
  fifth at all". Reference it; do not re-derive the membership, and never write "the three modes
  with a `b6`".
- **A half step above the tonic belongs to Phrygian and Locrian only** — `modes-half-steps` again.
  It is the strongest single darkening move available in the set.
- **Ionian and Aeolian are the only two whose tritone misses the tonic triad entirely** —
  `modes-the-tritone` already says this and it is the structural reason Aeolian is the stable minor
  and the reference of this family. One sentence, linked, not re-derived.
- **None of these three has a leading tone.** Only Lydian and Ionian do; the other five have a `b7`.
  Chapter 2 counted it. One clause at most, and only where it earns its place.

### The vamps — recomputed against all seven modes on A

| Mode | Vamp | Numerals | Second chord | Notes | Carries | Which modes on `A` contain that chord |
| ---- | ---- | -------- | ------------ | ----- | ------- | ------------------------------------- |
| Dorian | `Am` – `D` | `i` – `IV` | `D` | `D F# A` | the `6` | Ionian, Mixolydian, **Dorian** |
| Aeolian | `Am` – `F` | `i` – `bVI` | `F` | `F A C` | the `b6` | **Aeolian**, **Phrygian**, Locrian |
| Phrygian | `Am` – `Bb` | `i` – `bII` | `Bb` | `Bb D F` | the `b2` | **Phrygian**, Locrian |

Read the right-hand column before writing any uniqueness claim. Recomputed pitch class by pitch
class:

- **`D` major fits Ionian, Mixolydian and Dorian.** So `Am`–`D` rules out Aeolian and Phrygian (both
  need an `F` where `D` needs an `F#`), and what rules out Ionian and Mixolydian is the **minor home
  chord**. Do **not** write "`D` fits only Dorian."
- **`F` major fits Aeolian, Phrygian and Locrian.** So `Am`–`F` rules out Dorian and nothing else in
  this family — **it does not distinguish Aeolian from Phrygian.** That is honest, interesting, and
  it is the closer's best point: Aeolian is the only one of the three whose vamp cannot pin its own
  mode down, which is exactly what having no characteristic note costs it.
- **`Bb` major fits Phrygian and Locrian only**, and Locrian's home chord is `Adim`, not `Am`
  (`modes-two-families` shipped that fact). So `Am`–`Bb` does pin Phrygian. **State it as a fact
  about these chords; do not state the general vamp rule** — chapter 6 owns "the second chord of a
  modal vamp is the one that contains the characteristic note".
- **`Am` (`A C E`) and `Bb` (`Bb D F`) share no notes at all**, and their roots are a **semitone**
  apart — the only vamp in the pathway whose two chords sit a semitone apart (checked against
  `A`–`B`, `A`–`G`, `Am`–`D`, `Am`–`F`). Note that `A`–`B` also shares no notes, so **"the only vamp
  whose chords share nothing" is FALSE** — chapter 3 already used that claim for Lydian.
- All symbols verified as parsing in `progression-player`: `Am`, `Am7`, `D`, `Dm`, `F`, `Bb`, `G`.

**The chords of the key, and what one dial does to them.** Recomputed by harmonising each scale in
thirds. `minor-caged-the-chords-of-the-key` already gave the learner A natural minor's seven:
`Am Bdim C Dm Em F G`.

- Raising the `b6` to a `6` changes the **three chords that contained the `F`**: `Dm` → `D`,
  `Bdim` → `Bm`, `F` → `F#dim`. The `i`–`IV` is the plain one to show — a chord this learner already
  plays as `Dm` in the key of A minor becomes a **major** `D`, and one note moved.
- Lowering the `2` to a `b2` changes the **three chords that contained the `B`**: `Bdim` → `Bb`,
  `Em` → `Edim`, `G` → `Gm`. The `bII` is the one to show — a **major** triad where the key's least
  useful chord, the diminished `ii°`, used to sit.

Keep each of these to one short beat. This chapter is about sound; the harmonisation is a link, not
a lesson.

### The neck — every window and every dot recomputed

Windows for root `A`: **A 0–3 · G 1–5 · E 4–8 · D 6–10 · C 9–13.** The A form is clamped at the nut
(`from` clamps to 0), so it is **four frets wide** where the other four are five.

Dot counts at the scale layer, recomputed cell by cell — this reproduces the brief's table exactly:

| Form | Window | Dorian | Aeolian (`A Natural minor`) | Phrygian |
| ---- | ------ | ------ | --------------------------- | -------- |
| C | 9–13 | 16 | 17 | 17 |
| A | 0–3 | **16** | **17** | **17** |
| G | 1–5 | **18** | **18** | **18** |
| E | 4–8 | 17 | 17 | 17 |
| D | 6–10 | 17 | 18 | 18 |

Bold cells are the ones this chapter draws or names.

**Two of the five windows hold the same number of dots for all three modes of this family** — the
G form at 18, 18, 18 and the E form at 17, 17, 17. Counted against every row above; the other three
windows do not. That is the neck payoff of both chapters and the exact vindication of
`modes-mixolydian-neck`'s "never count dots to tell two scales apart".

The exact positions of the moving degrees, per window — **use these and nothing else**:

| Form | Window | Aeolian `b6` (`F`) | Dorian `6` (`F#`) | Aeolian `2` (`B`) | Phrygian `b2` (`Bb`) |
| ---- | ------ | ------------------ | ----------------- | ----------------- | -------------------- |
| A | 0–3 | `1·1` `4·3` `6·1` | `1·2` `6·2` | `2·0` `5·2` | `3·3` `5·1` |
| G | 1–5 | `1·1` `4·3` `6·1` | `1·2` `4·4` `6·2` | `3·4` `5·2` | `3·3` `5·1` |
| E | 4–8 | `2·6` `5·8` | `2·7` `4·4` | `1·7` `3·4` `6·7` | `1·6` `4·8` `6·6` |
| D | 6–10 | `2·6` `3·10` `5·8` | `2·7` `5·9` | `1·7` `4·9` `6·7` | `1·6` `4·8` `6·6` |
| C | 9–13 | `1·13` `3·10` `6·13` | `3·11` `5·9` | `2·12` `4·9` | `2·11` `5·13` |

**The window-edge rule, already taught, and this chapter must not re-teach it.** A window is a fixed
span of frets anchored on the root and it **does not move**. Raising a degree moves its dot **up**
one fret; a dot on the **top** fret raises out of the picture and a dot one fret **below** the bottom
raises into it. Flattening moves its dot **down**; a dot on the **bottom** fret drops out and a dot
one fret **above** the top drops in. `modes-lydian-neck` and `modes-mixolydian-neck` shipped both
halves. Chapter 4 states the rule in **one sentence with a link** and spends its space on the four
worked cases below.

**"The same picture with one dot moved" is FALSE as a caption**, and `modes-no-new-shapes` already
said so for exactly the Aeolian/Dorian pair. Do not undo it. **Also do not write "one finger, one
fret" as though a single dot moved** — three positions change in the G form and three change in the
A form.

The four worked cases this chapter uses, each traced dot by dot:

**G form, 1–5 · `A Natural minor` 18 → `A Dorian` 18 — the clean case, and the chapter's physical
moment.** `6·1` steps up to `6·2`. `4·3` steps up to `4·4`. `1·1` steps up to `1·2`. **All three stay
inside the frame, nothing crosses an edge, and the count is unchanged at eighteen.** Recomputed
against all five windows: **the G form is the only one of the five where every `b6` raises to a `6`
without leaving the picture** (the C form loses two off the top, the A form and the E form lose one
each, the D form loses one). That is why the physical move belongs here — the learner's attention
goes entirely to the sound, because nothing about the diagram is doing anything clever.

`minor-caged-scale-g-form` calls this window "The Darkest Window" and its own headline is that it
holds three `b6`s — more of chapter 1's flattened degrees than any other window. **Dorian removes
exactly the note that made it dark.** Link it; the sentence writes itself and it is true.

**A form, 0–3 · `A Natural minor` 17 → `A Dorian` 16 — the nut, from the other end.** `6·1` steps up
to `6·2`, inside. `1·1` steps up to `1·2`, inside. And `4·3` would raise to `4·4`, which is **off the
top** — that copy drops out, and nothing can step in from below because there is no fret −1.
**Seventeen becomes sixteen.** `modes-mixolydian-neck` showed this window losing a dot to a *raise*
in the major family; this is the same mechanism one family down, and one sentence linking it is
enough.

**A form, 0–3 · `A Natural minor` 17 → `A Phrygian` 17 — both halves of the edge rule in one
window.** `5·2` steps down to `5·1`, inside. `2·0` — the **open `B` string** — would flatten to fret
−1 and is **lost off the bottom**. And a `b2` appears at `3·3`, because its `2` sat at `3·4`, one
fret **above** the window's top edge, and flattening brought it in. **Seventeen and seventeen: a dot
gained from above and a dot lost off the bottom, netting equal.** This is the window that proves
**"flattening always adds dots" is false**, and it is worth saying that plainly.

**G form, 1–5 · `A Natural minor` 18 → `A Phrygian` 18 — the other clean case.** `3·4` steps down to
`3·3`, inside. `5·2` steps down to `5·1`, inside. Both stay in the frame; eighteen either way.
Recomputed across all five windows: **the G form and the D form are the two where every `2` flattens
to a `b2` without leaving the picture.** Two, not one — do not write "the only window".

So the G form holds **eighteen dots for all three modes of this family**, and it is the one window
where both of this chapter's dials turn without a single dot crossing an edge. That is the
chapter's neck closing line.

### Evidence discipline, unchanged from chapters 2 and 3

- `[established]` may be stated plainly. `[contested]` must be hedged. **Every named mood is
  `[convention, no evidence]`** and must be framed as a **repertoire association**: "this is where
  you have heard it", never "this is what the interval does". `modes-what-brighter-means` already
  set this up and may be linked. The app's own `character` strings are the register to write in —
  Dorian's is *"Minor with a bright 6th — hopeful rather than sad"*, Phrygian's is *"Minor with a ♭2
  leaning on the root — Spanish, dark"*, and `A Natural minor`'s is *"The plain minor scale —
  Aeolian"*. These are the default captions `caged-shape` prints under each card, so prose in that
  register agrees with the screen.
- **Phrygian's associations, attributed correctly.** Phrygian sounds Spanish because **flamenco is
  built on it**, not because a `b2` is Spanish. Phrygian in heavy metal is **Biamonte (2010) and
  Walser (1993)**, reported as the settled reading of the theory literature by Temperley & Tan — a
  claim about **repertoire**, not psychoacoustics, and **not** a corpus finding. Write "the theory
  literature broadly agrees", never "a study found". `modes-ionian-sound` already shipped the
  four-common-modes claim with this attribution; Dorian and Aeolian are two of those four and a
  lesson may say so in a clause, without re-running the citation.
- **The Dorian/Aeolian result, and how to write it.** Temperley & Tan found significant differences
  for 12 of 15 pairs; the three that did not reach significance were Lydian/Mixolydian,
  Lydian/Dorian and **Dorian/Aeolian** — so the single non-significant *adjacent* pair is the pair
  this chapter is built on. Judged-happier proportions: Dorian `.40`, Aeolian `.34`, Phrygian `.21`.
  **Do not call it "the hardest comparison"** — `modes-what-brighter-means` shipped "read it as
  data, not difficulty" and `modes-hold-the-drone` already told the learner this pair was the
  non-significant one. Reference it once, in the Dorian sound lesson, and add the one honest
  observation the chapter is entitled to: those listeners heard **unaccompanied single-line
  melodies**, with nothing holding home underneath them — which is the one thing a mode needs in
  order to exist at all. That is a structural observation about what the study asked, not a
  criticism of it and **not** a claim that a drone trains anyone's ear. The drone's justification in
  this pathway has never been empirical: a mode does not exist without a tonal centre.

### Components — the rules that bite here

- **`scale-compare`**: `drone: true` on **every** block in this chapter, because every one sits under
  prose making a claim about sound. Pair neighbours **reference first** — `["minor","dorian"]` and
  `["minor","phrygian"]`, never reversed. Verified: with `minor` first, the Dorian card lights
  exactly one amber chip, `F#`, and the Phrygian card exactly one, `Bb`. Every chip is tappable and
  sounds its tone alone against the held root.
- **`scale-compare`'s diff tint is always amber**, whatever the catalogue hue. So a lesson tints
  Dorian's `6` **amber** and Phrygian's `b2` **rose** in prose — matching `caged-shape`'s outline —
  and still calls the chip on the card **amber**. **Never write "the rose chip".**
- **`scale-compare`'s run ends on the octave root**, so the run is `1 2 b3 4 5 6/b6 b7 1` — the
  **sixth** note is where Aeolian and Dorian part, and the **second** note is where Aeolian and
  Phrygian part.
- **`caged-shape`'s `caption` replaces only the small line *under* the heading.** The heading is
  always `<form> form · <root> <scale name>` — `G form · A Natural minor`, `G form · A Dorian`,
  `A form · A Phrygian` — and is **not overridable**. Six captions in chapter 3 duplicated it. Write
  a caption that adds something, or omit the prop.
- **`caged-shape` draws everything in the window, not a grip a hand would hold.** Say so once per
  neck lesson or the prose contradicts the diagram.
- **`caged-ladder`** takes `quality`, not `scale`. It cannot draw a mode's notes. Closer only, and
  the closer must say explicitly what it draws.
- **`progression-player`** at `bpm: 66`, matching every vamp in chapters 1–3.

### Screens

- `/drone` — the held `A`, and **the destination of this chapter's physical moment**. The pathway's
  defining tool.
- `/scale-visualizer` — the neck destination. **There is no drone on this screen.** It plucks; it
  does not hold a root.
- `/chord-shapes` — the chords `Am`, `D`, `F` and `Bb`.
- **Link text is the screen's name, never its route.** "Drone", not `/drone`.

---

## The seven lessons

Five sound, two neck. Six `caged-shape` blocks in total, all of them in lessons 4 and 6.

### 1 · `modes-aeolian-sound` — "The Minor You Already Own"

Section id `modes.ch4.aeolian-sound` · ~650 words · `tags: ["modes","theory","ear"]`.

**The one thing it teaches**: Aeolian is the setting both of this chapter's dials sit at, it has no
characteristic note by construction, and its job in this chapter is to be the thing the other two
are heard against.

**What came before**: chapter 3 closed by handing over the bottom row of chapter 2's two-families
table — `Am` for a home chord, and the `6` and the `2` for dials, one raised and one lowered.

Key points in order:

1. Open on the chapter, not on Aeolian: three modes, one home chord `Am`, two dials — the `6` and
   the `2`. Two sentences, then get to the mode. Say in a clause that this is the same shape chapter
   3 had with different dials; the symmetry is the point.
2. Aeolian is the natural minor scale, `A B C D E F G`, `1 2 b3 4 5 b6 b7`, home chord `Am`
   (`A C E`). Its parent major is `C`, named once and put down. The rename was already handled by
   `modes-two-you-already-play`; **one clause referencing it, not a re-explanation.**
3. **It has no characteristic note.** No chip lights amber on the card headed `A Natural minor`, no
   dot gets outlined in its windows. That is by construction — a characteristic note is what
   separates a scale from its nearest plain relative, and Aeolian *is* the plain relative. Exactly
   the same fact `modes-ionian-sound` stated one family up.
4. **You already own it, completely.** All five CAGED windows, filled in, from `minor-caged` — link
   `minor-caged-nothing-left-to-add`. There is nothing to learn here; the whole of this chapter's
   work is in what the two dials do to it.
5. **Its tritone, `2` and `b6` (`B`–`F`), misses the tonic triad entirely** — one of only two of the
   seven of which that is true, and the structural reason it is the stable minor. Link
   `modes-the-tritone`; one sentence, do not re-derive.
6. **The ache.** Aeolian's `b6` sits a **half step above** the `5`. Only it and Phrygian have that,
   and `modes-half-steps` counted it. One sentence, and hand it straight to the next lesson — the
   avoid-note arithmetic belongs there.
7. **The honest paragraph, and it is this lesson's reason to exist**: Aeolian is a hinge rather than
   a destination. It sits between Dorian and Phrygian on the ladder, both of its dials are at the
   reference setting, and its whole function in this chapter is to be the thing the other two are
   measured against. Say that as a fact about it, not an apology for it.
8. **The vamp: `Am`–`F`, a `i`–`bVI`.** `F` is `F A C`, and the `F` in it is the `b6` — the note
   Dorian gives up. Then the honest half: `F` major also sits inside Phrygian, so **this loop rules
   out Dorian and does not on its own separate Aeolian from Phrygian.** Say exactly that and stop —
   do not state a general rule about vamps.
9. `Am7` is `A C E G` — the seventh chord Aeolian gives you. Naming it is allowed; seventh-chord
   theory, shapes and voicings are not. One sentence at most.
10. Close into the next lesson: there is one note in this scale that fights the chord underneath, the
    learner has already been told to place it and move rather than sit on it, and it now has a name.

Live:

- `scale-compare` `{ root: "A", scales: ["minor"], drone: true }` — one card, and **no amber chip
  anywhere**, which is the point. Say that out loud.
- `progression-player` `{ chords: ["Am", "F"], bpm: 66, caption: "…" }`

Leaves the next lesson: the one note in natural minor that grates over an `Am`.

### 2 · `modes-the-ache` — "The Ache Above the Fifth"

Section id `modes.ch4.the-ache` · ~750 words · `tags: ["modes","theory","ear"]` ·
**the chapter's keystone, and the exact mirror of `modes-the-avoid-note`.**

**The one thing it teaches**: Aeolian's avoid note is the `b6` sitting a half step above the `5`;
Dorian raises it a whole tone and has none; and each of the two families holds exactly one mode with
no avoid note — in both cases the one with the raised dial.

**What the previous lesson left it**: Aeolian, both dials at the reference setting, and the
observation that its `b6` sits a half step over the `5`.

Key points in order:

1. Open with the experience, not the definition — and open with something the learner has **already
   done**. `minor-caged-the-last-two-notes` told them to hold the `Am` barre at fret 5, add `5·8`
   (string 5, fret 8 — the `b6`) over the top, hear it grate, and let it fall to `5·7`, the `5`.
   **Link it.** That is an avoid note, met a whole pathway before it had a name.
2. The definition already exists. **Link `modes-the-avoid-note` and restate it in one line only**: a
   scale tone a half step above a note of the chord underneath — a note to move through, not to land
   on. Do not redefine it, do not repeat its warning callout.
3. The arithmetic, on `Am` (`A C E`), every note, so the learner sees it is the **only** one: `B` a
   whole step above `A`; `C` a chord tone; `D` a whole step above `C`; `E` a chord tone; **`F` a half
   step above `E` — the avoid note**; `G` a whole step below home and a half step above nothing in
   the chord. **Exactly one avoid note in Aeolian, over `Am`.**
4. **The direction refinement — this lesson's best paragraph.**
   `minor-caged-the-last-two-notes` found **two** notes of the scale a semitone from a chord tone,
   the `2` and the `b6`, and that is why the minor pentatonic left both out. Only one of them is an
   avoid note. The `2` (`B`) sits a half step **below** the `b3` (`C`) and leans **up into** it; the
   `b6` (`F`) sits a half step **above** the `5` (`E`) and sits **on top of** it. Same distance,
   opposite behaviour — and it is the identical shape `modes-the-avoid-note` used for Ionian's `G#`
   leaning up into the root. Link both articles.
5. **Dorian removes it, and that is the turn.** Raise the `b6` to a `6` and it sits a **whole** tone
   above the `5`. Nothing in `A B C D E F# G` sits a half step above `A`, `C` or `E`. **Dorian has
   no avoid note over a static `Am`.**
6. **The symmetry, stated once and scoped to the six.** `modes-the-avoid-note` said Lydian was the
   only one of *its* three, deliberately. Here is why: **each family holds exactly one mode with no
   avoid note over its own tonic triad, and in both cases it is the mode with the raised dial** —
   Lydian raises the `4`, Dorian raises the `6`. Link `modes-the-avoid-note`. **Scope it to the six
   modes of the two families. Do not extend the count to Locrian and do not generalise the idea** —
   a later chapter takes that up once more than one has been met.
7. **Phrygian has two**, one over the root and one over the fifth — the only one of the six. One
   clause, flagged forward; the Phrygian lesson does the work.
8. **The tip that makes it findable**: `minor-caged` already gave the rule — a `b6` sits one fret
   above every `5` on the same string. So every avoid note in this scale is already located, on
   every string, in every window. Link `minor-caged-nothing-left-to-add`.

Live:

- `scale-compare` `{ root: "A", scales: ["minor", "dorian"], drone: true }` — one amber chip, `F#`,
  on the Dorian card. Instruction: start the drone; on the card headed `A Natural minor` tap `E`,
  then tap `F` — a fret apart; then on the Dorian card tap `E`, then the amber chip `F#` — two frets
  apart.

**Be honest about what the app can and cannot do here**, exactly as `modes-the-avoid-note` was: the
drone holds the **root**, not the chord, so tapping two chips in succession is not the clash itself.
Send the learner to hold a real `Am` — [Chord Shapes](/chord-shapes) has it — and let an `F` ring
over it. Keep this to two sentences and link `modes-the-avoid-note` rather than restating its
argument.

Callout (`tip`, one idea): every `b6` sits one fret above a `5` on the same string, so you already
know where every one of them is.

Leaves the next lesson: so what is Dorian actually *like*, once the ache is gone?

### 3 · `modes-dorian-sound` — "Dorian: Minor Without the Ache"

Section id `modes.ch4.dorian-sound` · ~700 words · `tags: ["modes","ear","theory"]`.

**The one thing it teaches**: Dorian is A natural minor with one degree raised, its characteristic
note is the `6`, and its vamp puts a **major** `IV` over a minor tonic.

**What the previous lesson left it**: raising the `b6` to a `6` removes natural minor's one avoid
note.

Key points in order:

1. The parallel road first, as the pathway always does: **A Dorian is A natural minor with the `b6`
   raised to a natural `6`** — `F` becomes `F#`. `A B C D E F# G`, degrees `1 2 b3 4 5 6 b7`. One
   degree, and everything else holds still.
2. The relative road, named once and put down: its parent major is `G`. One clause. Link
   `modes-two-roads`; do not re-teach it.
3. **The characteristic note is the `6` (`F#`)**, tinted **amber** in prose, outlined amber on the
   neck.
4. **The gap is the whole sound.** In natural minor the step above the `5` is a semitone; in Dorian
   it is a whole tone. That one gap is what "minor without the ache" means, and it is why Dorian has
   nothing that fights an `Am`. Link `modes-half-steps` for the membership count and
   `modes-the-ache` for the avoid-note half. Do not re-derive either.
5. **The tritone falls between the `b3` and the `6` — `C` and `F#`** — the two notes that define it
   against major and against natural minor respectively, and it touches the `b3`. Chapter 2 gave the
   address; reference `modes-the-tritone`, one sentence.
6. **The vamp: `Am`–`D`, a `i`–`IV`.** `D` is `D F# A`, and the `F#` in it is the `6`. The thing to
   say, and it is the mode's signature: **a major `IV` over a minor tonic**. Harmonise A natural
   minor and the chord on the `4` is `Dm` (`D F A`) — link
   `minor-caged-the-chords-of-the-key`. Raise the `b6` and it becomes `D`. One note, and a chord
   changes quality. **The honest half**: `D` major also fits inside Ionian and Mixolydian, and what
   rules those out is the minor home chord, not this one chord's notes. `modes-when-the-harmony-moves`
   already said "the `D` chord is where the `F#` lives" — build on it, do not restate it. **Do not
   state a general rule about vamps.**
7. **The Temperley & Tan note, handled exactly as specified in the verified facts.** Dorian and
   Aeolian are the one adjacent pair those listeners did not reliably separate — `modes-hold-the-drone`
   already told the learner that, so **reference it, do not re-report it**. Add the one observation
   this chapter is entitled to: the melodies in that study were **unaccompanied**, with nothing
   holding home underneath them, and a mode does not exist without a tonal centre. Not a criticism
   of the study, not a claim that a drone trains anyone's ear — a statement about what those
   listeners were asked to do versus what this chapter asks. Link `modes-what-brighter-means` for
   "read it as data, not difficulty".
8. **The mood, framed as a repertoire association and nothing else.** The app's own line is "Minor
   with a bright 6th — hopeful rather than sad", and it is the caption `caged-shape` prints. Dorian
   is one of the four modes the theory literature broadly agrees are common in rock —
   `modes-ionian-sound` already carries that claim with its attribution, so link it rather than
   re-citing.

Live:

- `scale-compare` `{ root: "A", scales: ["minor", "dorian"], drone: true }` — one amber chip, `F#`.
  **Instruction different from the previous lesson's**: start the drone and play **both runs end to
  end**, counting to six on the way up. The sixth note is the only place the two runs disagree, and
  the step you just took from `E` was a half step on one card and a whole step on the other.
- `progression-player` `{ chords: ["Dm", "D"], bpm: 66, caption: "…" }` — the `iv` of A natural
  minor, then the `IV` of A Dorian. One note, `F` to `F#`.
- `progression-player` `{ chords: ["Am", "D"], bpm: 66, caption: "…" }` — the vamp itself.

Leaves the next lesson: one raised degree, and here is what it does in a window you have known since
`minor-caged`.

### 4 · `modes-dorian-neck` — "Raise the Sixth With the Drone Still Going"

Section id `modes.ch4.dorian-neck` · ~650 words · `tags: ["modes","fretboard","ear"]` ·
**the chapter's physical moment, and the brief calls it the pathway's best.**

**The one thing it teaches**: raising the `b6` to a `6` is one fret under your own fingers, in a
window you already own, and in the G form all three of them move without a single dot leaving the
frame.

**What the previous lesson left it**: `F` becomes `F#`, and nothing else moves.

Key points in order:

1. **Open on the move, not on the frame.** On a keyboard "raise the sixth" is an instruction about
   note names. Here it is one fret, made with a root still sounding underneath, and the sound
   changes under your hand. That is what this lesson is for.
2. One sentence to establish the frame — same five windows, same places, anchored on the root, no
   Dorian shape to learn. Link `minor-caged-the-window-stays-put`. Do not re-teach it; chapter 3's
   two neck lessons already did.
3. **The G form, frets 1 to 5.** Draw `A Natural minor` then `A Dorian`. Eighteen dots both times.
   `minor-caged-scale-g-form` calls this window "The Darkest Window" and its headline is that it
   holds **three** `b6`s — link it, and say the obvious true thing: Dorian removes exactly the note
   that made it dark.
4. **What changed, exactly** — use the verified positions and nothing else. `A Natural minor`'s `b6`
   (`F`) sits at `6·1`, `4·3` and `1·1`. `A Dorian`'s `6` (`F#`) sits at `6·2`, `4·4` and `1·2`.
   Every one steps up **one fret and stays inside the window**. Eighteen dots, eighteen dots, and
   this time the picture really is the same picture with the sixths moved — **three of them, not
   one.** **Do not write "one finger, one fret" as though a single dot moved.**
5. **Why this window and not another.** Recomputed across all five: the G form is the **only** one
   where every `b6` raises to a `6` without leaving the picture. In the other four at least one
   sixth crosses an edge. So this is the window to make the move in — nothing about the diagram is
   doing anything clever, and your attention can go to the sound. **One sentence on the rule with a
   link to `modes-lydian-neck`; do not re-teach the edge rule.**
6. **The exercise, and it is the lesson.** Written as an ordered list, and it must be doable:
   - Press the drone bar above the scale cards, or open [Drone](/drone) and set it to `A`. Leave it
     running — it keeps sounding while you play.
   - Fret `4·3`, the `b6`, and let it ring against the held `A`. That is the ache.
   - Move that finger one fret up, to `4·4`. Same finger, same string. Listen to what happened
     underneath it.
   - Do the same with `6·1` to `6·2`, and `1·1` to `1·2`. Three places, one move.
   - Then play the whole window down and back with the drone still going, taking the raised sixth
     every time.
7. **The A form, frets 0 to 3 — where one of the three has nowhere to go.** `6·1` and `1·1` step up
   inside as before, but `4·3` sits on the window's top fret and raises straight out of the picture,
   and nothing can replace it from below because there is no fret −1. **Seventeen becomes sixteen.**
   `modes-mixolydian-neck` watched the same thing happen to a raise in the major family; link it in
   a clause. The practical note: on this window the `6` you reach for on the D string is at fret 4,
   just outside the box — the note is there, the frame simply stops short of it.
8. Close on the **Scale Visualizer** for the other three windows — root `A`, scale Dorian.
   **There is no drone on that screen**; if the learner wants the root held while both hands are
   busy, that is [Drone](/drone).

Live — **exactly three `caged-shape` blocks, no more**:

- `caged-shape` `{ root: "A", form: "G", scale: "minor", caption: "…" }`
- `caged-shape` `{ root: "A", form: "G", scale: "dorian", caption: "…" }`
- `caged-shape` `{ root: "A", form: "A", scale: "dorian", caption: "…" }`

Use `scale: "minor"` for the reference card, not `quality`/`show` — it heads the card
**`G form · A Natural minor`**, matching the `scale-compare` cards, and it goes through the same
code path as the Dorian card so the degree labels line up. **No caption may restate the heading.**

Leaves the next lesson: one dial turned upward. Now the other one, downward, and it lands a half
step from home.

### 5 · `modes-phrygian-sound` — "Phrygian: The Note Above Home"

Section id `modes.ch4.phrygian-sound` · ~700 words · `tags: ["modes","ear","theory"]`.

**The one thing it teaches**: Phrygian is A natural minor with the `2` lowered, which puts a note a
half step above home — the strongest single darkening move in the set — and its vamp is two chords a
semitone apart.

**What came before**: the Dorian pair. This lesson turns the other dial, and the other way.

Key points in order:

1. Parallel road first: **A Phrygian is A natural minor with the `2` lowered to a `b2`** — `B`
   becomes `Bb`. `A Bb C D E F G`, degrees `1 b2 b3 4 5 b6 b7`. **Spell it `Bb`, never `A#`** — that
   is what the chip beside the prose says. Parent major `F`, named once and put down.
2. **The characteristic note is the `b2` (`Bb`)**, tinted **rose** in prose and outlined rose on the
   neck. **The chip on the scale card is amber** like every other diff chip — say "the amber chip",
   never "the rose chip".
3. **A half step above home.** Only Phrygian and Locrian have one, and `modes-half-steps` counted it
   and called it the strongest single darkening move available. Reference it, one sentence. Then the
   thing that is this chapter's to say: **of the five modes that have a characteristic note, the
   `b2` is the only one that sits a half step from home** — Lydian's `#4` is six semitones off,
   Mixolydian's `b7` two, Dorian's `6` three, Locrian's `b5` six. Recomputed; it is safe.
4. **Two avoid notes, and it is the only one of the six with two.** The `b2` (`Bb`) is a half step
   above the root itself, and the `b6` (`F`) is still a half step above the `5` — Phrygian keeps
   Aeolian's ache and adds one over home. Link `modes-the-ache`. **Do not generalise the idea and do
   not extend the count past the six modes of the two families.**
5. **The tritone falls between the `b2` and the `5` — `Bb` and `E`** — and it touches the `5`.
   Chapter 2 gave the address; reference `modes-the-tritone`, one sentence.
6. **The vamp: `Am`–`Bb`, a `i`–`bII`.** `Bb` is `Bb D F`, and the `Bb` in it is the `b2`. Three
   facts worth stating, all recomputed:
   - The two chords' roots are a **semitone** apart — the only vamp in this pathway where that is
     true. `Am` is `A C E`, `Bb` is `Bb D F`: they share no notes at all. (Chapter 3's `A`–`B`
     shares none either, so **do not claim that as the unique thing** — the semitone is.)
   - Harmonise A natural minor and the chord on the `2` is `Bdim`, the key's least useful chord —
     link `minor-caged-the-chords-of-the-key`. Lower the `2` and a **major** triad stands there
     instead.
   - `Bb` major fits inside Phrygian and, of the seven, only one other — whose home chord is not
     `Am`. So this vamp does pin the mode down. **Say what this vamp carries; do not state a general
     rule about vamps.**
7. **The associations, framed as associations and attributed.** Phrygian sounds Spanish because
   **flamenco is built on it**, not because a `b2` is Spanish — `modes-what-brighter-means` already
   used exactly this example, so link it rather than re-arguing it. Its place in heavy metal is the
   settled reading of the theory literature (Biamonte, Walser), reported as such by Temperley & Tan;
   **write "the theory literature broadly agrees", never "a study found"**, and do not present it as
   a corpus finding. The app's own line is "Minor with a ♭2 leaning on the root — Spanish, dark".
   One reference at most to `modes-what-brighter-means`'s numbers — Phrygian was judged happiest of
   its pair in `.21` of trials, the lowest of the six — and no more than a sentence of it.
8. Close by sending them to play it: hold the `A` on [Drone](/drone) and reach for the `Bb` against
   it, or grab a `Bb` from [Chord Shapes](/chord-shapes) and rock between the two chords.

Live:

- `scale-compare` `{ root: "A", scales: ["minor", "phrygian"], drone: true }` — one amber chip,
  `Bb`. **Give it a new instruction**, because `modes-half-steps` and `modes-one-note-apart` both
  used this exact block: start the drone and play **both runs from the bottom**. The **second** note
  is where they part — a whole step from home on one card, one fret from home on the other. The
  first step you take away from home is the whole mode.
- `progression-player` `{ chords: ["Am", "Bb"], bpm: 66, caption: "…" }`

Leaves the next lesson: the flattened `2` on the neck, and the window where a dot arrives from above
while another falls off the bottom.

### 6 · `modes-phrygian-neck` — "Phrygian, and the Dot That Falls Off the Nut"

Section id `modes.ch4.phrygian-neck` · ~600 words · `tags: ["modes","fretboard"]` ·
**chapter's second and last neck lesson.**

**The one thing it teaches**: flattening the `2` in the window clamped at the nut both gains a dot
from above and loses one off the bottom — so "flattening always adds dots" is false — and the G form
holds eighteen dots for all three modes of this family.

**What the previous lesson left it**: `B` becomes `Bb`, and nothing else moves.

Key points in order:

1. One sentence to establish the frame, then straight to the change. Do not re-teach the window-edge
   rule; `modes-mixolydian-neck` owns flattening and a link is enough.
2. **The A form, frets 0 to 3** — the window clamped at the nut. Draw `A Natural minor` then
   `A Phrygian`. **Seventeen dots both times.**
3. **What changed, exactly.** `A Natural minor`'s `2` (`B`) sits at `2·0` and `5·2`. `A Phrygian`'s
   `b2` (`Bb`) sits at `3·3` and `5·1`. So `5·2` steps down to `5·1`, inside. `2·0` — the **open `B`
   string** — would flatten to a fret below the nut and is simply **lost**. And a `b2` appears at
   `3·3`, because its `2` sat at `3·4`, one fret **above** the window's top edge, and flattening
   brought it in. **A dot gained from above, a dot lost off the bottom, seventeen either way.**
4. **The moral, and it is worth stating flatly**: "flattening always adds dots" is false. It adds
   from above and it subtracts at the nut, and which of those you get depends entirely on where the
   window's edges fall. `modes-mixolydian-neck` made the same point in the opposite direction; link
   it, do not restate its argument.
5. **The G form, frets 1 to 5 — the clean one.** `A Natural minor`'s `2` sits at `3·4` and `5·2`;
   `A Phrygian`'s `b2` at `3·3` and `5·1`. Both step down one fret and stay inside. **Eighteen and
   eighteen.** Recomputed across all five windows: the G form and the **D form** are the two where
   every `2` flattens without leaving the picture. **Two, not one — do not write "the only window".**
6. **The chapter's neck payoff, and it is exact.** In the G form all three modes of this family hold
   **eighteen** dots; in the E form all three hold **seventeen**. Two of the five windows cannot tell
   Dorian, Aeolian and Phrygian apart by count at all — and the G form is the one window where both
   of this chapter's dials turn without a single dot crossing an edge. `modes-mixolydian-neck` said
   never to count dots to tell two scales apart; this is what that looks like from the inside.
7. **What it costs to play: one fret, the other direction.** Wherever your hand was reaching for a
   `B`, it reaches one fret lower for a `Bb`. In the G form that is `5·2` to `5·1` and `3·4` to
   `3·3`. On the open `B` string at the nut there is nowhere lower to go, which is exactly why that
   dot leaves the picture.
8. Close on the **Scale Visualizer** for the other three windows — root `A`, scale Phrygian.
   **No drone on that screen.**

Live — **exactly three `caged-shape` blocks, no more**:

- `caged-shape` `{ root: "A", form: "A", scale: "minor", caption: "…" }`
- `caged-shape` `{ root: "A", form: "A", scale: "phrygian", caption: "…" }`
- `caged-shape` `{ root: "A", form: "G", scale: "phrygian", caption: "…" }`

**No caption may restate the heading** (`A form · A Natural minor`, `A form · A Phrygian`,
`G form · A Phrygian`).

Leaves the closer: three settings of two dials, and the question of which note you are leaning on.

### 7 · `modes-one-minor-three-ways` — "One Minor Home, Three Ways"

Section id `modes.ch4.one-minor-three-ways` · ~650 words · `tags: ["modes","ear","theory"]` ·
**chapter closer, and the deliberate twin of `modes-one-home-three-ways`.**

**The one thing it teaches**: the three are one home chord at three settings of two dials, what tells
them apart in playing is which single note you lean on — and the one with nothing to lean on is the
one whose vamp cannot name it.

**What came before**: all six lessons.

Key points in order:

1. Put the three side by side and say the reframe: one home chord `Am`, two dials, three settings.
   Dorian raises the first, Phrygian lowers the second, Aeolian is what both look like left alone.
2. The table — mode, degrees, characteristic note, the vamp, what the second chord carries:

   | Mode | Degrees | Characteristic note | Vamp | The second chord carries |
   | ---- | ------- | ------------------- | ---- | ------------------------ |
   | Dorian | `1 2 b3 4 5 6 b7` | `6` (`F#`), amber | `Am`–`D` | `D` = `D F# A` — the `6` |
   | Aeolian | `1 2 b3 4 5 b6 b7` | none | `Am`–`F` | `F` = `F A C` — the `b6` |
   | Phrygian | `1 b2 b3 4 5 b6 b7` | `b2` (`Bb`), rose | `Am`–`Bb` | `Bb` = `Bb D F` — the `b2` |

3. **The asymmetry with chapter 3, and it is the closer's best paragraph.** `modes-one-home-three-ways`
   left Ionian's vamp row empty. Aeolian's is not empty — but it is the only one of the three that
   **cannot pin its own mode down**: `D` major is unavailable in Aeolian and Phrygian, and `Bb` major
   is unavailable in Dorian and Aeolian, but **`F` major sits inside Phrygian too**, so `Am`–`F`
   says "not Dorian" and stops there. That is exactly what having no characteristic note costs it.
   All three recomputed. **Do not state the general vamp rule** — chapter 6 owns it.
4. What separates the three in the hand: one note each. Dorian, land on the `6`. Phrygian, land on
   the `b2`. Aeolian gives you nothing to lean on, which is the point of it — and the one note to
   move through rather than land on is the `b6`.
5. One honest sentence: **including** the characteristic note is not the same as **leaning** on it,
   and making the difference audible is a later chapter's work. One clause; do not annex it.
   `modes-one-home-three-ways` used the same clause — vary the wording.
6. **Both chapters, closed.** Two home chords, two dials each, six modes — the table chapter 2 laid
   out is now filled in. Then hand to chapter 5: there is a seventh, its home chord is neither of
   these two, and the question it raises is what a home actually needs in order to hold.
   **Name Locrian at most once, as the thing chapter 5 takes up. Do not analyse it.** Chapters may be
   named by number; **lessons may not**.

Live:

- `scale-compare` `{ root: "A", scales: ["minor", "dorian", "phrygian"], drone: true }` —
  **verified**: with `minor` first, the Dorian card gets exactly one amber chip, `F#`, and the
  Phrygian card exactly one, `Bb`. Each card's single amber chip is precisely its characteristic
  note. Say so; it is the whole chapter in one block.
- `progression-player` `{ chords: ["Am", "D", "Am", "Bb"], bpm: 66, caption: "…" }` — the two dial
  vamps back to back, `IV` then `bII` over the same home chord.
- `caged-ladder` `{ root: "A", quality: "minor" }` — the five windows all three modes live in.
  **Say explicitly what it draws: the windows and the roots, not the mode's notes.** `caged-ladder`
  takes `quality`, not `scale`, so it cannot show a mode. And the bands sit on exactly the frets
  chapter 3's major ladder did, because a window is anchored on the root — which is why neither
  chapter asked the learner to move their hand anywhere new.

---

## The activity — `modes-raise-the-sixth`

Section id `modes.ch4.raise-the-sixth` · `"optional": true` · `note-play`, modes `easy` and `hard`,
document board frets 0–12.

The chapter's physical moment made a drill: the `b6`→`6` move, in three windows, one of which the
chapter never draws. It stays out of the way of the three existing `modes` activities by design —
`modes-same-notes-new-home` deliberately keeps one note set throughout and never touches this move;
`modes-walk-the-ladder` asks for the four dial settings as **bare notes on strings 5 and 4**
(`4·4 4·3 5·2 5·1`) rather than inside a window; `modes-find-the-dial` works the **major** family's
G and C forms. No round here repeats any of them.

**Every target checked for pitch collisions within its round.** Open-string MIDI: string 1 = 64,
2 = 59, 3 = 55, 4 = 50, 5 = 45, 6 = 40.

| Round | Board | Prompt | Targets (`string·fret`), ordered | MIDI |
| ----- | ----- | ------ | -------------------------------- | ---- |
| `r_modes-raise-the-sixth.g-form` | 1–5 | The G form, frets 1 to 5: A natural minor's three `b6`s low to high, then the three `6`s Dorian puts one fret above each of them | `6·1 4·3 1·1 6·2 4·4 1·2` | 41 53 65 42 54 66 |
| `r_modes-raise-the-sixth.e-form` | 4–8 | The E form, frets 4 to 8: the two `b6`s, then the two `6`s — and the second pair is not the first pair moved | `2·6 5·8 2·7 4·4` | 65 53 66 54 |
| `r_modes-raise-the-sixth.d-form` | 6–10 | The D form of A Dorian, frets 6 to 10 — a window this chapter never draws: its two roots, then its two `6`s | `4·7 2·10 5·9 2·7` | 57 69 54 66 |

All three rounds `"ordered": true`. Every target verified inside its round's board, on a six-string
neck, and every MIDI value distinct within its round. Every position verified against the recomputed
window table above.

Round 2's prompt is the one that carries content past the drill: `2·6` steps up to `2·7` inside the
window, `5·8` raises off the top and leaves, and `4·4` is a `6` whose `b6` sat at `4·3`, below the
frame. Round 3 is the one round past what the chapter drew.

**A collision that was designed around**: in the D form, A natural minor's `b6`s at `2·6` and `3·10`
both sound MIDI 65, so no round may ask for both. That is why round 3 uses A Dorian's `6`s
(`2·7` = 66 and `5·9` = 54) rather than the Aeolian `b6`s in that window.

---

## The checkpoint — `modes-ch4-checkpoint`

`kind: "checkpoint"` · `passThresholdPct` 70 · **8 questions**, written **after** the seven articles
were read, from what they actually say. Referenced only from the chapter's `checkpoint` field, not
as a section — matching chapters 1–3 and every sibling pathway.

| # | id suffix | Draws on | Tests |
| - | --------- | -------- | ----- |
| 1 | `the-family` | `modes-aeolian-sound` | One home chord `Am`, two dials, three settings — and which degrees the dials are |
| 2 | `no-accent` | `modes-aeolian-sound` | Why Aeolian has no characteristic note, and that this is by construction |
| 3 | `the-avoid-note` | `modes-the-ache` | Which note is Aeolian's avoid note, and why the `2` is not one despite being a semitone from a chord tone |
| 4 | `no-avoid-note` | `modes-the-ache` | That Dorian has none, and the one-per-family symmetry with Lydian |
| 5 | `dorian-vamp` | `modes-dorian-sound` | The `Am`–`D` vamp, the major `IV`, and what does and does not rule out the neighbours |
| 6 | `phrygian` | `modes-phrygian-sound` | The `b2` a half step above home, and Phrygian's two avoid notes |
| 7 | `window-edges` | both neck lessons | `multi-select` — what a raise and a flatten do at a window's edges, and that dot counts do not identify a scale |
| 8 | `lean-on-one-note` | `modes-one-minor-three-ways` | Given a vamp or a note, name the mode — and why `Am`–`F` is the one that does not pin its own |

Every lesson is covered. Distractors encode this chapter's real misunderstandings — "Dorian is just
minor", "an avoid note is any note outside the chord", "flattening always adds dots", "count the
dots", "`D` major means Dorian and nothing else" — never filler. **No question refers to an option by
letter or position.** Every question carries an `explanation`. **No `listen` question**: a `listen`
question plays bare notes with no drone and no accompaniment, so it cannot test a modal claim.

---

## Errata found while reviewing the drafts — chapters 5–6 inherit these

Twelve corrections were made to lesson drafts that all three lesson agents had reported clean.
Recorded here because most of them will recur.

1. **A false uniqueness claim about the G form.** A draft of `modes-dorian-neck` wrote that
   `minor-caged-scale-g-form` "called this window the one holding three `b6`s". **Four of the five
   windows hold three `b6`s** — C, A, G and D; only the E form holds two. What that article actually
   claims is that the G form is the only one holding three `b3`s, three `b6`s **and** three `b7`s at
   once. Corrected to the claim the source article makes. The agent had read the source and still
   compressed it into a superlative that is false — this is the failure mode, exactly.
2. **A factual claim contradicted by the very next lesson.** A draft of `modes-dorian-sound` closed
   with "the ache is gone. It lives in the exact same window every `b6` in this scale already does."
   **False in two of the five windows** — in the A form the `6` that replaces `4·3` lands at `4·4`,
   outside the frame, and in the E form the `6` replacing `5·8` lands outside too. Rewritten to "one
   fret from every `b6` your hand already knows", which is true and does not pre-empt the neck lesson.
3. **Meta-instruction leaking into learner-facing prose — five separate instances**, all copied
   verbatim from the dispatch brief or the plan. `modes-phrygian-sound`: *"Call it the amber chip;
   it's never the rose chip"* and *"the theory literature broadly agrees, never 'a study found.'"*
   `modes-phrygian-neck`: *"two, not one, so don't call either the only one"* and *"is false, stated
   flatly"*. `modes-aeolian-sound`: *"say that out loud, because it's half the lesson"*. All rewritten
   as prose addressed to a learner. **This is new and it is worth briefing against explicitly:** a
   plan that says "do not write X" or "call it Y" will be transcribed into the article if the
   instruction is phrased in the second person.
4. **"Recomputed across all five windows" as an opening clause**, twice — authorial process language
   in a learner-facing sentence. Reduced to "Across all five windows".
5. **A scope claim written in author's vocabulary.** `modes-the-ache` had *"That symmetry is exact,
   and it's scoped to these six — it says nothing about the seventh mode"* and *"Its own lesson does
   the work; here it's a flag, not an argument."* Learners do not think in scope and lessons.
   Rewritten.
6. **A grammatical collapse in the chapter's keystone sentence.** *"Across the six modes of the two
   families, each one holds exactly one mode with no avoid note"* — "each one" means each family but
   reads as each mode. Corrected to "each family holds".
7. **"One other mode in the catalogue."** `modes-one-minor-three-ways` said `Bb` major "sits inside
   Phrygian, and just one other mode in the catalogue". The catalogue is `SCALE_TYPES` — twenty-six
   scales, several of which contain `Bb D F` on an `A` root (Phrygian dominant, for one). The claim
   is only true **of the seven**. Corrected.
8. **A lesson-count reference.** The closer opened with "the two dials this chapter has spent six
   lessons turning". Counting lessons is the same hazard as naming them by position — sections are
   not numbered on screen and the count breaks on reorder. Cut to "has been turning".
9. **A near-verbatim paragraph reused from chapter 3's closer.** The `caged-ladder` paragraph in
   `modes-one-minor-three-ways` matched `modes-one-home-three-ways`'s almost sentence for sentence.
   The twin structure is intended; a duplicated paragraph is not. Rewritten.
10. **An ambiguous non-naming of Locrian.** `modes-phrygian-sound` enumerated the characteristic
    notes' distance from home and ended "and the fifth mode's is six again" — which reads as "the
    fifth mode of the ladder" (Aeolian, which has no characteristic note). Rewritten as "the one
    mode this pathway hasn't reached yet".
11. **A drone instruction pointing at a component the lesson doesn't contain.** `modes-dorian-neck`
    said "Press the drone bar above a scale card if you've got one open" — that lesson has no
    `scale-compare` block by design. Rewritten to point at the chapter's earlier cards or at Drone.
12. **Degrees without the `code` mark**, introduced by correction 1 and fixed in the same pass.

### The one error found in *shipped* chapter-3 content, and it is corrected

**`modes-mixolydian-neck` shipped a false generalisation about the nut-clamped window**, in both its
`summary` and its body: *"in the window clamped at the nut it can only ever add dots"* and *"raising
a degree here can only ever lose dots, and flattening one can only ever gain them."*

The flattening half is **false**, and chapter 4 draws the counter-example. Recomputed, the A-form row
(frets 0–3, root `A`) runs **Lydian 12, Ionian 13, Mixolydian 15, Dorian 16, Aeolian 17, Phrygian 17,
Locrian 15** — Aeolian→Phrygian flattens the `2` and holds at 17, and Phrygian→Locrian flattens the
`5` and drops from 17 to **15**. The mechanism chapter 3 missed is that a dot sitting **on fret 0**
flattens to a fret that does not exist and is lost: the open `B` at `2·0` in the Aeolian→Phrygian
case, and the open `E`s at `1·0` and `6·0` in the Phrygian→Locrian case. Chapter 3's own plan and the
pathway brief both state the mechanism correctly; only the shipped article overgeneralised, because
the one case it examined (Ionian→Mixolydian) happens to have no dot on fret 0.

**Both sentences have been rewritten in `modes-mixolydian-neck.json`** — the minimal correction, and
it was made because chapter 4's own A-form diagram directly contradicts them. The corrected wording:
nothing can cross **into** a nut-clamped window from underneath, so raising can lose dots and never
gain one, while flattening pulls dots in from above but drops any dot already sitting on fret 0
clean out of the picture. **Chapter 5 draws this window too and must use the corrected rule.**

### Corrections and additions that chapters 5–6 should carry

- **The full avoid-note set over each mode's own tonic triad, recomputed**: Lydian none, Ionian `4`,
  Mixolydian `4`, Dorian none, Aeolian `b6`, Phrygian `b2` **and** `b6`, Locrian `b2`. Chapter 5
  generalises the idea and inherits all seven. Chapters 3 and 4 between them have stated the six;
  **Locrian's `b2` is unstated and is chapter 5's**.
- **"Each family holds exactly one mode with no avoid note, and it is the mode with the raised
  dial"** — Lydian and Dorian — is now shipped in `modes-the-ache`, scoped explicitly to the six.
  Chapter 5 may extend it; nothing before chapter 5 may.
- **`Am`–`F` does not distinguish Aeolian from Phrygian**, because `F` major sits inside Aeolian,
  Phrygian **and** Locrian. `modes-one-minor-three-ways` ships this as the reason a mode with no
  characteristic note has no vamp that can name it. **Chapter 6, which owns the vamp rule, should
  build on that rather than contradict it** — the rule is about characteristic notes, and Aeolian
  and Ionian are exactly the two modes it does not reach.
- **Which modes contain each vamp's second chord, recomputed against all seven on `A`**: `B` → Lydian
  only. `G` → Mixolydian, Dorian, Aeolian. `D` → Ionian, Mixolydian, Dorian. `F` → Aeolian, Phrygian,
  Locrian. `Bb` → Phrygian, Locrian. `Am` itself → Dorian, Aeolian, Phrygian. Chapter 6 will want all
  six rows; none of them is a one-mode row except Lydian's.
- **Two of the five windows cannot distinguish this family by dot count at all** — the G form holds
  18 for Dorian, Aeolian and Phrygian alike, and the E form holds 17 for all three. Shipped in
  `modes-phrygian-neck`.
- **The G form (frets 1–5, root `A`) is the only window where both of this chapter's dials turn
  without a dot crossing an edge**, and the only one where every `b6` raises inside the frame. For
  the `2`→`b2` flatten it is joined by the D form — **two windows, not one**.
- **`scale-compare`'s diff tint is always amber**, so Phrygian's `b2` is **rose** in prose and on the
  neck and **amber** as a chip. Chapter 5 needs the identical split for Locrian's rose `b5`. Never
  write "the rose chip".
- **`caged-shape`'s `caption` replaces only the line under the heading**, which is always
  `<form> form · <root> <scale name>` and is not overridable. Zero captions in chapter 4 duplicated
  it; chapter 3's six were the warning that made that possible.
- **The pathway's `estimatedMin` is still the top-level's original guess of 270.** Chapters 1–4 now
  total **172** section-minutes (39 + 40 + 47 + 46). §8 says recompute it at the end; no chapter
  agent has touched it, and the top level should.
