# Chapter 3 — The Major Family

Chapter id `modes.ch3` · slug `the-major-family` · 7 articles, 1 activity, 1 checkpoint.

After this chapter the learner can hear the difference between Ionian, Lydian and Mixolydian, play
each over its vamp, and say which single note they are leaning on. It is the top row of chapter 2's
two-families table, one mode at a time.

**This chapter is about sound.** Five of its seven lessons are sound-and-why; two are neck lessons.
That ratio is binding — the brief says chapters 3 and 4 each spend more lessons on sound than on
shapes, and a chapter that drifts into diagrams has failed its brief. There are exactly six
`caged-shape` blocks in the whole chapter, all of them in the two neck lessons.

Anchor root is **A** everywhere. String numbering is **1 = high e, 6 = low E**. Positions are
written `string·fret`.

---

## Verified facts this chapter is built on

Everything below was **recomputed** — from `SCALE_TYPES` in
`mobile/src/lib/scale-library/catalog.ts`, and from a reimplementation of `cagedFormWindows` /
`cagedFillMarks` in `mobile/src/lib/guitar-positions/caged.ts` using `OPEN_PITCHES = [4,11,7,2,9,4]`,
`FRET_COUNT = 15`, `MIN_SPAN = 3`. **These are the numbers every lesson must use.**

### The three, on A

| Mode | Notes | Degrees | Parent major | Home chord | Characteristic note | Card heading |
| ---- | ----- | ------- | ------------ | ---------- | ------------------- | ------------ |
| Lydian | `A B C# D# E F# G#` | `1 2 3 #4 5 6 7` | E | `A` | `#4` (`D#`) — **violet** | `A Lydian` |
| Ionian | `A B C# D E F# G#` | `1 2 3 4 5 6 7` | A | `A` | none | **`A Major`** |
| Mixolydian | `A B C# D E F# G` | `1 2 3 4 5 6 b7` | D | `A` | `b7` (`G`) — **amber** | `A Mixolydian` |

Ionian carries `accent: null`. Its `scale-compare` card has **no tinted chip** and its `caged-shape`
window has **no outlined dot**. That is a fact about it — it is the reference — not a gap.

**Never write "the Ionian card".** `SCALE_TYPES[].name` for `major` is `Major`, so both
`scale-compare` and `caged-shape` head that card **`A Major`**. `modes-the-ladder` already carries
the clause explaining this to the learner, so a chapter-3 lesson may simply say "the card headed
`A Major`" without re-explaining. The other two are headed with their modal names.

### The avoid note — the arithmetic, recomputed against the `A` triad

`A` major is `A C# E`. Measured in semitones above each chord tone, across all seven notes of each
scale (a scale tone sitting **a half step above a chord tone** is the clash — that is the
definition):

| Mode | Scale tones a half step above a note of `A C# E` |
| ---- | ------------------------------------------------ |
| Lydian | **none** |
| Ionian | `4` (`D`), a half step above the `3` (`C#`) |
| Mixolydian | `4` (`D`), a half step above the `3` (`C#`) |

Worked out for Ionian, every note:

- `B` — a **whole** step above `A`. Fine.
- `C#` — a chord tone.
- `D` — **a half step above `C#`.** The avoid note.
- `E` — a chord tone.
- `F#` — a **whole** step above `E`. Fine.
- `G#` — a half step **below** `A`, which leans *up into* home rather than sitting on top of it.

And for Lydian's `D#`: a **whole** step above the `3` (`C#`), a **half step below** the `5` (`E`),
and a tritone above the root. Nothing in `A C# E` sits a half step below it, so it is not a half
step above any chord tone. **Lydian has no avoid note over a static `A`.**

Over `A7` (`A C# E G`) Mixolydian's `4` (`D`) is still a half step above the `3`, and nothing else
is a half step above a chord tone — recomputed. So **Mixolydian keeps Ionian's avoid note**, over
the triad and over the seventh chord alike. Say so; it is the honest half of the lesson.

**Superlative discipline — this one has already been checked and it is a trap.** Over its *own*
tonic triad, **Dorian also has no avoid note** (recomputed: `Am` is `A C E`; nothing in
`A B C D E F# G` sits a half step above `A`, `C` or `E`). So **"Lydian is the only mode with no
avoid note" is FALSE.** Scope every such claim to this chapter's three: *"the only one of the three
modes in this chapter"*, or *"the only one of the major family"*. Do not mention Dorian; chapter 4
owns the minor family.

### Half steps and the tritone — established in chapter 2, reference rather than re-derive

| Mode | Its two half steps | Tritone | On `A` |
| ---- | ------------------ | ------- | ------ |
| Lydian | `#4`→`5` · `7`→`1` | `1` and `#4` | `A` – `D#` |
| Ionian | `3`→`4` · `7`→`1` | `4` and `7` | `D` – `G#` |
| Mixolydian | `3`→`4` · `6`→`b7` | `3` and `b7` | `C#` – `G` |

Two things worth reading off this that chapter 2 did not say, and both are recomputed:

- **Both of Lydian's half steps point *up into* a chord tone** — `#4` into the `5`, `7` into the
  `1`. Ionian's `3`→`4` is the other way round: the tight spot sits on **top** of a chord tone. That
  is the same fact as the avoid note, told structurally.
- Mixolydian's tritone is the `C#` and the `G` of `A7` (`A C# E G`). `modes-the-tritone` already
  says this. Build on it; do not re-derive it.

**Do not repeat chapter 2's corrected superlatives.** Lydian is **not** the only mode whose tritone
touches the root — Locrian's does too. Ionian and Aeolian are the only two whose tritone misses the
tonic triad entirely. Both are already shipped correctly in `modes-the-tritone`.

### The vamps — recomputed against all seven modes on A

| Mode | Vamp | Numerals | Second chord | Notes | Carries |
| ---- | ---- | -------- | ------------ | ----- | ------- |
| Lydian | `A` – `B` | `I` – `II` | `B` | `B D# F#` | the `#4` |
| Mixolydian | `A` – `G` | `I` – `bVII` | `G` | `G B D` | the `b7` |
| Ionian | — | — | — | — | it has no characteristic note to carry |

- **`B` major (`B D# F#`) fits inside Lydian and inside none of the other six** — checked against
  all seven modes on `A`. So `A`–`B` is unambiguous, and this is a superlative that *is* safe.
- **`A` and `B` share no notes at all** — `A C# E` against `B D# F#`. Two major triads a whole tone
  apart with nothing in common; nothing else in this pathway sounds like it.
- **`G` major (`G B D`) fits inside Mixolydian, Dorian and Aeolian** — so `A`–`G` rules out Ionian
  and Lydian (neither has a `G` natural), and the major home chord rules out the other two.
  **Do not write "`G` is unavailable in every other mode."** It is not.
- Ionian's row is a real fact, not a gap. **Do not state the general vamp rule** ("the second chord
  of a modal vamp is the one that contains the characteristic note") — chapter 6 owns it. Say what
  each of these two second chords carries, and stop.
- All symbols verified as parsing: `A`, `B`, `G`, `A7`, `Amaj7`. `Amaj7` is `A C# E G#`.

### The neck — every window and every dot recomputed

Windows for root `A`: **A 0–3 · G 1–5 · E 4–8 · D 6–10 · C 9–13.** The A form is clamped at the nut
(`from` clamps to 0), so it is **four frets wide** where the other four are five.

Dot counts at the scale layer, recomputed cell by cell — this reproduces the brief's table exactly:

| Form | Window | Lydian | Ionian (`A Major`) | Mixolydian |
| ---- | ------ | ------ | ------------------ | ---------- |
| C | 9–13 | 18 | **18** | **17** |
| A | 0–3 | **12** | **13** | **15** |
| G | 1–5 | **17** | **17** | 17 |
| E | 4–8 | **18** | **17** | 16 |
| D | 6–10 | 16 | 17 | 17 |

Bold cells are the ones this chapter draws or names. The exact positions of the moving degree, per
window — **use these and nothing else**:

| Form | Window | Ionian `4` (`D`) | Lydian `#4` (`D#`) | Ionian `7` (`G#`) | Mixolydian `b7` (`G`) |
| ---- | ------ | ---------------- | ------------------ | ----------------- | --------------------- |
| A | 0–3 | `2·3` `4·0` | `4·1` | `3·1` | `1·3` `3·0` `6·3` |
| G | 1–5 | `2·3` `5·5` | `2·4` `4·1` | `1·4` `3·1` `6·4` | `1·3` `4·5` `6·3` |
| E | 4–8 | `3·7` `5·5` | `2·4` `3·8` `5·6` | `1·4` `4·6` `6·4` | `2·8` `4·5` |
| D | 6–10 | `1·10` `3·7` `6·10` | `3·8` `5·6` | `2·9` `4·6` | `2·8` `5·10` |
| C | 9–13 | `1·10` `4·12` `6·10` | `1·11` `4·13` `6·11` | `2·9` `3·13` `5·11` | `3·12` `5·10` |

**The window-edge rule, stated correctly.** A window is a fixed span of frets anchored on the root
and it **does not move**. So:

- **Raising a degree moves its dot up one fret.** A dot on the window's **top** fret raises out of
  the picture; a dot one fret **below** the bottom raises into it.
- **Flattening a degree moves its dot down one fret.** A dot on the **bottom** fret drops out; a dot
  one fret **above** the top drops in.
- **"The same picture with one dot moved" is FALSE as a caption.** It is true of the note content,
  not of the diagram. `modes-no-new-shapes` already says this for Aeolian against Dorian; chapter 3
  must not undo it.

The four worked cases this chapter uses, each traced dot by dot:

**E form, 4–8 · `A Major` 17 → `A Lydian` 18.** `3·7` steps up to `3·8`, inside. `5·5` steps up to
`5·6`, inside. And a `#4` appears at `2·4` — its `4` was at `2·3`, one fret **below** the window, so
it steps in from underneath. **One dot gained, from the bottom edge.**

**G form, 1–5 · `A Major` 17 → `A Lydian` 17.** `2·3` steps up to `2·4`, inside. `5·5` would raise
to `5·6`, which is **off the top** — that copy drops out. And a `#4` appears at `4·1`, whose `4` was
at `4·0`, one fret below the window — it steps in from underneath. **Equal counts, different
picture** — structurally the same case `modes-no-new-shapes` met in the E form.

**C form, 9–13 · `A Major` 18 → `A Mixolydian` 17.** `3·13` steps down to `3·12`, inside. `5·11`
steps down to `5·10`, inside. And `2·9` would flatten to `2·8`, one fret **below** the window — it
drops out. Nothing steps in from above: there is no `G#` on any string at fret 14 (checked). **One
dot lost, off the bottom edge.**

**A form, 0–3 — the clamped window, and the chapter's neck payoff.** `A Lydian` **12**, `A Major`
**13**, `A Mixolydian` **15**.

- Lydian: `2·3` raises to `2·4`, **off the top**; `4·0` raises to `4·1`, inside. Nothing can step in
  from below, because there is no fret below the nut. **13 → 12.**
- Mixolydian: `3·1` flattens to `3·0`, inside. And two `b7`s step **in from above** — `1·3` (its `7`
  was at `1·4`) and `6·3` (its `7` was at `6·4`). Nothing drops off the bottom: no `G#` sits at fret
  0 on any string. **13 → 15.**
- The generalisation, and it is exact: **in a window clamped at the nut, raising a degree can only
  lose dots and flattening can only gain them**, because there is nothing below fret 0 for a dot to
  cross in from or out to. Verified straight down the row: Lydian 12, Ionian 13, Mixolydian 15,
  Dorian 16, Aeolian 17 — monotonic.
- Also worth one clause: that window is only **four frets wide**, so its totals are lower than the
  others' for a reason that has nothing to do with the mode.

### The rock-frequency claim — two separate claims, and they must not be blended

The brief says chapter 3 is where this gets used. It gets used **once**, in
`modes-ionian-sound`, and here is exactly how.

- **The half this chapter states in the body**, tiered `[established]` but attributed correctly:
  **Ionian, Mixolydian, Dorian and Aeolian are the common modes in rock, and Phrygian turns up in
  metal.** This is the **settled view of the theory literature** — Everett (2004), Moore (2001);
  Phrygian in metal from Biamonte (2010) and Walser (1993) — reported as generally agreed by
  Temperley & Tan. **It is not a corpus finding and a lesson must not present it as one.** Write
  "the theory literature broadly agrees", not "a study found".
- **The separate, weaker quantitative half goes in a footnote, or nowhere.** Temperley & Tan derive
  a scale-degree distribution from de Clercq & Temperley's harmonic analyses and observe that the
  seven major-scale degrees occur more often than any others, which *suggests* Ionian predominates.
  That is an inference from a **degree** count, not a mode count. If the song count is quoted at
  all it is **200 songs, the `rock_corpus` dataset** — the figure Temperley & Tan themselves use.
  The *Popular Music* (2011) article analysed **100**. **Cite one or the other, never a blend.**
- **Do not write "the most-played mode in rock rhythm guitar after Ionian"** of Mixolydian, or any
  other ranking. Nothing above supports a ranking below the top.

### Evidence discipline, unchanged from chapter 2

- `[established]` may be stated plainly. `[contested]` must be hedged.
- **Every named mood is `[convention, no evidence]`** and must be framed as a **repertoire
  association**: "this is where you have heard it", never "this is what the interval does".
  `modes-what-brighter-means` already set this up and may be linked. The app's own `character`
  strings are the register to write in — Lydian's is *"Major with a ♯4 — weightless, floating"*,
  Mixolydian's is *"Major with a ♭7 — the dominant sound, blues and rock"*, and `A Major`'s is
  *"The reference the others are heard against"*. These are the default captions `caged-shape`
  prints under each card, so prose in that register agrees with the screen.
- Temperley & Tan's happiness proportions (Ionian `.83`, Mixolydian `.64`, Lydian `.58`) belong to
  `modes-what-brighter-means`. Chapter 3 may **reference** them once, in the avoid-note lesson,
  because the tension between "Lydian is the more consonant one over a static `A`" and "listeners
  rated Ionian happier" is that lesson's point. Link the article; do not re-run the study.

### Screens, and what they do

- `/drone` — the held `A`. The pathway's defining destination.
- `/scale-visualizer` — the neck destination. **There is no drone on this screen.** It plucks; it
  does not hold a root. A lesson that says "start the drone on the Scale Visualizer" is wrong.
- `/chord-shapes` — the vamp chords `B` and `G`, and `A`.
- **Link text is the screen's name, never its route.** "Scale Visualizer", not `/scale-visualizer`.

---

## The seven lessons

Every `scale-compare` in this chapter sets **`drone: true`** and is ordered **reference first**
(`["major", …]`), so amber lands on exactly the characteristic note.

**A note on colour, because two conventions meet here.** In prose, a characteristic note named as a
degree takes its catalogue hue — Lydian's `#4` **violet**, Mixolydian's `b7` **amber** — matching
`caged-shape`'s outline. But `scale-compare`'s diff tint is **always amber**, whatever the scale. So
when describing a chip that lights on a card, call it "the amber chip" and leave the note name in
plain `code`. Never write "the violet chip".

### 1 · `modes-ionian-sound` — "The Reference You Already Own"

Section id `modes.ch3.ionian-sound` · ~600 words · `tags: ["modes","theory","ear"]`.

**The one thing it teaches**: Ionian is the setting both dials sit at, it has no characteristic note
by construction, and that absence is what makes it the thing the other two are heard against.

**What came before**: chapter 2 closed by handing over the top row of the two-families table —
Lydian `#4 7`, Ionian `4 7`, Mixolydian `4 b7`, one home chord `A`, two dials.

Key points in order:

1. Open on the chapter, not on Ionian: three modes, one home chord, two dials — the `4` and the `7`.
   Two sentences, then get to the mode.
2. Ionian is the major scale, `A B C# D E F# G#`, `1 2 3 4 5 6 7`, home chord `A` (`A C# E`). Its
   parent major is itself — the one mode where the relative road goes nowhere. One clause.
3. **It has no characteristic note.** No tinted chip on its card, no outlined dot in its windows.
   That is by construction: a characteristic note is what separates a scale from its nearest plain
   relative, and Ionian *is* the plain relative. Chapter 1 established this; reference, don't
   redefine.
4. Both dials at their reference setting. The `4` natural, the `7` natural.
5. **The `7` is a leading tone** — a half step below home, pulling up into it — and chapter 2
   counted the membership: only Lydian and Ionian have one; the other five have a `b7` a whole step
   below. Link `modes-half-steps`. The learner already knows this note physically from
   `caged-fourths-and-sevenths` ("every `1` has a `7` one fret below it, on the same string, inside
   the window"). Link it.
6. Its tritone, `4` and `7` (`D`–`G#`), misses the tonic triad entirely — one of only two of the
   seven of which that is true. Link `modes-the-tritone`; one sentence, do not re-derive.
7. **The rock claim, exactly as specified in the verified facts above.** Body gets the literature
   consensus, correctly attributed. The quantitative inference goes in a footnote if used at all.
   This kills misconception 4 properly, where chapter 1 only gestured at it.
8. `Amaj7` is `A C# E G#` — the seventh chord Ionian gives you, and the `G#` inside it is precisely
   the note the next mode down the ladder gives up. Naming it is allowed; seventh-chord theory,
   shapes and voicings are not.
9. Close into the next lesson: for a scale everyone calls the safe one, there is exactly one note in
   it that fights the chord underneath — and it has a name.

Live:

- `scale-compare` `{ root: "A", scales: ["major"], drone: true }` — one card, and **no amber chip
  anywhere**, which is the point. Say that out loud.
- `progression-player` `{ chords: ["A", "Amaj7"], bpm: 66, caption: "…" }`

**Do not** state the general vamp rule, and do not manufacture an Ionian vamp. Ionian has no
characteristic note, so it has no second chord that carries one — say that plainly when the closer
gets to it, not here.

Leaves the next lesson: the one note in the major scale that grates.

### 2 · `modes-the-avoid-note` — "The Note That Fights the Chord"

Section id `modes.ch3.the-avoid-note` · ~750 words · `tags: ["modes","theory","ear"]` ·
**the chapter's keystone, and where "avoid note" is defined for the whole pathway.**

**The one thing it teaches**: an **avoid note** is a scale tone sitting a half step above a note of
the chord underneath — Ionian has exactly one, the `4` over the `3`; Lydian has none.

**What the previous lesson left it**: Ionian, both dials at the reference setting, and the
observation that one of its notes fights.

Key points in order:

1. Open with the experience, not the definition: over a `A` chord that will not move, hold a `D` and
   it grinds. You have been playing over this for years. `caged-fourths-and-sevenths` already told
   you the `4` "grates" and is a note to move through rather than rest on — **link it** — and this
   lesson gives that observation a name and a reason.
2. **Define it.** An **avoid note** is a scale tone that sits a **half step above a note of the
   chord underneath**. Not a note you may never play — a note that fights the chord if you land on
   it and hold it. Passing through is fine; that is the whole difference.
3. The arithmetic, on `A` (`A C# E`). `D` is one fret above `C#`, and `C#` is the third of the
   chord. Then check the rest of the scale so the learner sees it is the *only* one: `B` is a whole
   step above `A`, `F#` a whole step above `E`, and `G#` is a half step **below** `A`, which leans
   up into home instead of sitting on top of it. **Exactly one avoid note in Ionian over `A`.**
4. **Lydian's `#4` has no such problem, and this is the lesson's turn.** `D#` is a **whole** step
   above the `3` and a **half step below** the `5` — a half step below a chord tone leans up into
   it. Nothing in `A C# E` sits a half step under `D#`. So Lydian, over a static `A`, has **nothing
   that fights**. **Scope the claim: "the only one of this chapter's three".** Do not say "the only
   mode" — see the superlative note in the verified facts.
5. **Where Lydian's tension went instead.** It did not vanish. The `#4` is a **tritone off the
   root** — chapter 2 gave the address. It does not grind against a chord tone; it sits a tritone
   above home. Different tension, differently placed. Reference `modes-the-tritone`.
6. Structurally, the same fact twice: Ionian's half steps are `3`→`4` and `7`→`1`; Lydian's are
   `#4`→`5` and `7`→`1`. **Both of Lydian's point up into a chord tone.** Ionian's `3`→`4` is the
   one that points the other way. Link `modes-half-steps`.
7. **The tension worth sitting with, and it is the real reason Lydian is worth knowing.** Lydian is
   the *more* consonant of the two over a static `A` chord — and listeners still judged Ionian
   happier by a wide margin, Lydian third of six. Link `modes-what-brighter-means`; one sentence of
   the numbers at most. Consonance over a chord and judged happiness are not the same measurement,
   and the ladder was never a measurement of either.
8. **The honest half**: Mixolydian keeps the natural `4`, so it keeps this same avoid note — over
   `A` and over `A7` alike. One or two sentences; the Mixolydian lesson picks it up.
9. One clause forward: avoid notes turn out to be a general idea, and a later chapter takes that
   up once more than one has been met. **Do not generalise it here** — chapter 5 owns that.

Live:

- `scale-compare` `{ root: "A", scales: ["major", "lydian"], drone: true }` — one amber chip, `D#`,
  on the Lydian card. Instruction: start the drone; on the card headed `A Major` tap `C#`, then tap
  `D` — a fret apart; then on the Lydian card tap `C#`, then the amber chip `D#` — two frets apart.

**Be honest about what the app can and cannot do here.** The drone holds the **root**, not the
chord, so tapping two chips in succession is not the clash itself. Say so, and send the learner to
hold a real `A` chord — [Chord Shapes](/chord-shapes) has it — and let a `D` ring over it. That is
the actual test, and it takes ten seconds.

Callout (`warning`, one idea): "avoid note" is a bad name for a real thing. Nothing is forbidden;
it is a note to move through, not to land on.

Leaves the next lesson: so what is Lydian actually *like*, once its one liability is gone?

### 3 · `modes-lydian-sound` — "Lydian: Major With the Fourth Raised"

Section id `modes.ch3.lydian-sound` · ~700 words · `tags: ["modes","ear","theory"]`.

**The one thing it teaches**: Lydian is A major with one degree raised, its characteristic note is
the `#4`, and its vamp is two major triads a whole tone apart that share no notes at all.

**What the previous lesson left it**: Lydian's `#4` is the note that removes Ionian's one clash.

Key points in order:

1. The parallel road first, as the pathway always does: **A Lydian is A major with the `4` raised to
   a `#4`** — `D` becomes `D#`. `A B C# D# E F# G#`, degrees `1 2 3 #4 5 6 7`. One degree, and
   everything else holds still.
2. The relative road, named once and put down: its parent major is `E`. One clause. Link
   `modes-two-roads` if it helps; do not re-teach it.
3. **The characteristic note is the `#4` (`D#`)**, tinted **violet** in prose, outlined violet on
   the neck.
4. **Lydian keeps the leading tone.** It and Ionian are the only two of the seven with a `7` a half
   step below home (chapter 2, `modes-half-steps`). So Lydian is not "major loosened" — it is major
   with the pull home intact and the one grating note removed.
5. **The tritone is measured off the root itself**, `1` and `#4` — `A` against `D#`. Chapter 2 gave
   this address; reference it. **Say "the only one of this chapter's three whose tritone touches the
   tonic at all"** — which is exactly how `modes-the-tritone` already phrases it. **Locrian's
   touches the root too**, so do not write "the only mode".
6. **The vamp: `A`–`B`, a `I`–`II`.** `B` is `B D# F#`, and the `D#` in it is the `#4`. Two facts
   worth stating, both recomputed:
   - `A` (`A C# E`) and `B` (`B D# F#`) **share no notes at all** — two major triads a whole tone
     apart with nothing in common.
   - **`B` major fits inside Lydian and inside none of the other six modes on `A`** — Ionian needs a
     `D` where `B` needs a `D#`. So the second chord asserts the `#4` and rules out the neighbour in
     one gesture. **Say what this vamp carries; do not state a general rule about vamps.**
7. **The mood, framed as a repertoire association and nothing else.** The app's own line is
   "Major with a ♯4 — weightless, floating", and it is the caption `caged-shape` prints. Film
   scoring and a strand of rock are where a listener has met it. Link `modes-what-brighter-means`
   for the discipline: true as "this is where you have heard it", false as "this is what the
   interval does".
8. Close by sending them to play it: hold the `A` on [Drone](/drone), or grab `B` from
   [Chord Shapes](/chord-shapes) and rock between the two.

Live:

- `scale-compare` `{ root: "A", scales: ["major", "lydian"], drone: true }` — one amber chip, `D#`.
  Instruction different from lesson 2's: play **both runs** against the drone and listen to what the
  fourth note does on the way past.
- `progression-player` `{ chords: ["A", "B"], bpm: 66, caption: "…" }` — slow, so it is heard as
  harmony.

Leaves the next lesson: one raised degree, and here is what it looks like in a window you already
own.

### 4 · `modes-lydian-neck` — "Lydian in a Window You Already Own"

Section id `modes.ch3.lydian-neck` · ~600 words · `tags: ["modes","fretboard"]`.

**The one thing it teaches**: A Lydian's CAGED windows are A major's CAGED windows with the `4`
raised a fret — and because a window's edges are fixed frets, that raise pushes dots across the
frame in a direction you can predict.

**What the previous lesson left it**: `D` becomes `D#`, and nothing else moves.

Key points in order:

1. State it flatly: the windows are the same five, in the same places, because a window is anchored
   on the **root**, not the scale. Link `minor-caged-the-window-stays-put`. There is no Lydian
   shape to learn.
2. **The E form, frets 4 to 8.** Draw `A Major` then `A Lydian`. The second card heads itself
   `E form · A Lydian` and outlines the `#4` in violet.
3. **What changed, exactly** — use the verified positions and nothing else. `A Major`'s `4` (`D`)
   sits at `3·7` and `5·5`. `A Lydian`'s `#4` (`D#`) sits at `2·4`, `3·8` and `5·6`. So `3·7` steps
   up to `3·8` and `5·5` steps up to `5·6`, both inside the window — and a third `#4` appears at
   `2·4`, because its `4` was at `2·3`, one fret **below** the window's bottom edge, and raising it
   brought it in. **Seventeen dots become eighteen.**
4. **The rule, stated once and correctly.** The window does not move. Raising a degree moves its dot
   **up** one fret, so a dot on the top fret raises out of the picture and a dot just under the
   bottom fret raises into it. **"The same picture with one dot moved" is false as a caption** —
   true of the notes, not of the diagram. `modes-no-new-shapes` already said this for a different
   pair; link it.
5. **The G form, frets 1 to 5 — the case where the counts come out equal.** `A Major`'s `4` sits at
   `2·3` and `5·5`; `A Lydian`'s `#4` at `2·4` and `4·1`. `2·3` steps up inside the window. `5·5`
   would raise to `5·6`, **off the top**, and drops out. And `4·1` steps in from below, its `4`
   having sat at `4·0`. **Seventeen and seventeen — equal counts, different picture.** This is
   structurally the same case `modes-no-new-shapes` met in the E form, and saying so is worth a
   sentence.
6. **What it costs to play: one fret, same finger.** Wherever your hand was reaching for a `D`, it
   reaches one fret higher for a `D#`. On the E form that is `3·7` to `3·8`.
7. Close on the **Scale Visualizer** — set the root to `A` and the scale to Lydian and page through
   the forms. **Do not attribute a drone to that screen**; if the learner wants the root held, it is
   [Drone](/drone), and both hands are free.

Live — **exactly three `caged-shape` blocks, no more**:

- `caged-shape` `{ root: "A", form: "E", scale: "major", caption: "…" }`
- `caged-shape` `{ root: "A", form: "E", scale: "lydian", caption: "…" }`
- `caged-shape` `{ root: "A", form: "G", scale: "lydian", caption: "…" }`

Use `scale: "major"` for the reference card, not `quality`/`show` — it heads the card **`A Major`**,
matching the `scale-compare` cards, and it goes through the same code path as the Lydian card so the
degree labels line up.

Leaves the next lesson: one dial turned. Now the other one, in the other direction.

### 5 · `modes-mixolydian-sound` — "Mixolydian: Where the Leading Tone Goes"

Section id `modes.ch3.mixolydian-sound` · ~700 words · `tags: ["modes","ear","theory"]`.

**The one thing it teaches**: Mixolydian is A major with the `7` flattened, which costs it the pull
home — and its tritone is the two notes of `A7`, which is why the mode and the chord are one idea.

**What came before**: the Lydian pair. This lesson turns the other dial, and the other way.

Key points in order:

1. Parallel road first: **A Mixolydian is A major with the `7` lowered to a `b7`** — `G#` becomes
   `G`. `A B C# D E F# G`, degrees `1 2 3 4 5 6 b7`. Parent major `D`, named once and put down.
2. **The characteristic note is the `b7` (`G`)**, tinted **amber** in prose and outlined amber on
   the neck.
3. **What is actually lost: the leading tone.** Ionian's `G#` sits a half step under home and pulls
   up into it; Mixolydian's `G` sits a whole step under and does not. Chapter 2 counted this —
   Lydian and Ionian are the only two with a `7`; the other five have a `b7`. **Mixolydian is where
   it goes, and on the ladder it never comes back.** Link `modes-half-steps`. This is the single
   biggest thing that happens to the sound and it deserves the most space.
4. **The tritone is `3` and `b7` — `C#` and `G` — which are the two notes of `A7` (`A C# E G`).**
   `modes-the-tritone` already showed this; the new sentence here is that the chord and the mode are
   the same idea rather than two things that go together. `A7` is **the seventh chord this mode
   gives you**. Naming it is allowed and it is the most useful single fact in the pathway.
   **Seventh-chord theory, shapes, voicings and inversions are out of scope** — do not drift.
5. **The vamp: `A`–`G`, a `I`–`bVII`.** `G` is `G B D`, and the `G` in it is the `b7`. Neither
   Ionian nor Lydian has a `G` natural, so this second chord rules both of them out. **Do not claim
   it rules out every other mode** — `G` major also fits inside Dorian and Aeolian; what rules those
   out is the major home chord. Say what the chord carries and stop.
6. **The honest half, carried over from the avoid-note lesson.** Mixolydian still has the natural
   `4`, so `D` over the `A` chord still fights, over `A7` as well. Mixolydian is not the safe mode;
   it is the mode with the other dial turned. Link `modes-the-avoid-note`.
7. **Physical**: the `b7` is one fret below the `7` your hand has reached for automatically since
   `caged-fourths-and-sevenths` taught you that every `1` has a `7` one fret below it on the same
   string. Now go one fret further. Link it.
8. **The mood, as a repertoire association.** The app's own line is "Major with a ♭7 — the dominant
   sound, blues and rock", and the `I`–`bVII` move is a rock and folk commonplace. Framed as where
   you have heard it, not as what a `b7` does to a nervous system.

Live:

- `scale-compare` `{ root: "A", scales: ["major", "mixolydian"], drone: true }` — one amber chip,
  `G`. **Give it a new instruction**, because `modes-half-steps` already used this exact block:
  start the drone and play **both runs to the end**. Each run finishes on the octave `A`, so the
  second-to-last note is the `7` on one card and the `b7` on the other. Listen to what the last step
  does — one leans in, one steps up from further away.
- `progression-player` `{ chords: ["A", "G"], bpm: 66, caption: "…" }`

Leaves the next lesson: the flattened `7` on the neck, and the one window where the arithmetic goes
the other way.

### 6 · `modes-mixolydian-neck` — "Mixolydian, and What the Window's Edges Do"

Section id `modes.ch3.mixolydian-neck` · ~650 words · `tags: ["modes","fretboard"]` ·
**chapter's second and last neck lesson.**

**The one thing it teaches**: flattening a degree moves its dot **down** a fret, which crosses a
window's edges in the opposite direction to raising one — and in the window clamped at the nut it
can only ever add dots.

**What the previous lesson left it**: `G#` becomes `G`, and nothing else moves.

Key points in order:

1. One sentence to establish the frame — same five windows, same places, anchored on the root — then
   straight to the change. Do not re-teach what the Lydian neck lesson just said.
2. **The C form, frets 9 to 13.** Draw `A Major` then `A Mixolydian`. Eighteen dots become
   seventeen.
3. **What changed, exactly.** `A Major`'s `7` (`G#`) sits at `2·9`, `3·13` and `5·11`. `A
   Mixolydian`'s `b7` (`G`) sits at `3·12` and `5·10`. So `3·13` steps down to `3·12` and `5·11`
   steps down to `5·10`, both inside — and `2·9` would drop to `2·8`, one fret **below** the
   window's bottom edge, so that copy falls out of the picture. Nothing steps in from above.
   **Eighteen becomes seventeen.**
4. **The direction reversal, which is the point.** Raising a degree pushes dots toward the top edge;
   flattening one pushes them toward the bottom. Same window, opposite traffic. Link
   `modes-lydian-neck`.
5. **The A form at the nut, frets 0 to 3 — the extreme case.** Recomputed dot counts: `A Lydian`
   **12**, `A Major` **13**, `A Mixolydian` **15**.
   - Two things make it different, and both are worth a clause. It is the one window **clamped at
     the nut**, so it is **four frets wide** where the others are five — some of the difference is
     just that. And there is **nothing below fret 0**, so **raising a degree can only lose dots and
     flattening can only gain them**.
   - Traced: raising the `4` sends `2·3` up to `2·4`, **off the top**, while `4·0` goes to `4·1`
     inside — 13 becomes 12. Flattening the `7` sends `3·1` down to `3·0` inside, and pulls **two**
     `b7`s in from above, at `1·3` and `6·3` — 13 becomes 15.
6. **The moral, and it is the chapter's neck payoff:** the same single-degree change costs a dot in
   one window and gains two in another, purely because of where that window's edges fall. So the
   dot count is a fact about the frame, not about the mode. **Never count dots to tell two scales
   apart.**
7. Close on the **Scale Visualizer** for the other three windows. **No drone on that screen.**

Live — **exactly three `caged-shape` blocks, no more**:

- `caged-shape` `{ root: "A", form: "C", scale: "major", caption: "…" }`
- `caged-shape` `{ root: "A", form: "C", scale: "mixolydian", caption: "…" }`
- `caged-shape` `{ root: "A", form: "A", scale: "mixolydian", caption: "…" }`

Leaves the closer: three settings of two dials, and the question of which note you are leaning on.

### 7 · `modes-one-home-three-ways` — "One Home Chord, Three Ways"

Section id `modes.ch3.one-home-three-ways` · ~650 words · `tags: ["modes","ear","theory"]` ·
**chapter closer.**

**The one thing it teaches**: the three are one home chord at three settings of two dials, and what
tells them apart in playing is which single note you lean on.

**What came before**: all six lessons.

Key points in order:

1. Put the three side by side and say the reframe: one home chord, two dials, three settings.
2. The table — mode, degrees, characteristic note, the second chord, what it carries:

   | Mode | Degrees | Characteristic note | Vamp | The second chord carries |
   | ---- | ------- | ------------------- | ---- | ------------------------ |
   | Lydian | `1 2 3 #4 5 6 7` | `#4` (`D#`), violet | `A`–`B` | `B` = `B D# F#` — the `#4` |
   | Ionian | `1 2 3 4 5 6 7` | none | — | it has none to carry |
   | Mixolydian | `1 2 3 4 5 6 b7` | `b7` (`G`), amber | `A`–`G` | `G` = `G B D` — the `b7` |

   **Ionian's empty row is content.** It has no characteristic note, so there is no second chord
   that could assert one; what makes it Ionian is that neither dial has been turned. **Do not state
   the general vamp rule** — chapter 6 owns it.
3. What separates the three in the hand: one note each. Lydian, land on the `#4`. Mixolydian, land
   on the `b7`. Ionian, land wherever you like except the `4`, and now you know why.
4. One honest sentence: **including** the characteristic note is not the same as **leaning** on it,
   and making the difference audible is a later chapter's work. One clause; do not annex it.
5. Hand to chapter 4: the same shape one row down — `Am` for a home chord, and the `6` and the `2`
   for dials. Chapters may be named by number; **lessons may not**.

Live:

- `scale-compare` `{ root: "A", scales: ["major", "lydian", "mixolydian"], drone: true }` —
  **verified**: with `major` first, the Lydian card gets exactly one amber chip, `D#`, and the
  Mixolydian card exactly one, `G`. Each card's single amber chip is precisely its characteristic
  note. Say so; it is the whole chapter in one block.
- `progression-player` `{ chords: ["A", "B", "A", "G"], bpm: 66, caption: "…" }` — the two vamps
  back to back, `II` then `bVII` over the same home chord.
- `caged-ladder` `{ root: "A", quality: "major" }` — the five windows all three modes live in.
  **Say explicitly what it draws: the windows and the roots, not the mode's notes.** `caged-ladder`
  takes `quality`, not `scale`, so it cannot show a mode. It is here to make the point that the
  bands and the roots are identical for all three, because a window is anchored on the root.

---

## The activity — `modes-find-the-dial`

Section id `modes.ch3.find-the-dial` · `"optional": true` · `note-play`, modes `easy` and `hard`,
document board frets 0–13.

The chapter's neck material made physical: find the dial inside a window you already own. It stays
out of `modes-walk-the-ladder`'s way — that activity walks the chain of fifths and the four dial
settings on strings 5 and 4 as bare notes; this one works inside two named CAGED windows and asks
for roots as well, so no round repeats it.

**Every target checked for pitch collisions within its round.** Open-string MIDI: string 1 = 64,
2 = 59, 3 = 55, 4 = 50, 5 = 45, 6 = 40.

| Round | Board | Prompt | Targets (`string·fret`), ordered | MIDI |
| ----- | ----- | ------ | -------------------------------- | ---- |
| `r_modes-find-the-dial.lydian-g-form` | 1–5 | The G form of A Lydian, frets 1 to 5: its three roots, then the two `D#`s — the `#4` the window is named for | `6·5 3·2 1·5 4·1 2·4` | 45 57 69 51 63 |
| `r_modes-find-the-dial.mixolydian-c-form` | 9–13 | The C form of A Mixolydian, frets 9 to 13: its two roots, then the two `G`s — the `b7` | `5·12 2·10 5·10 3·12` | 57 69 55 67 |
| `r_modes-find-the-dial.one-fret` | 9–13 | One fret, one dial: each `G#` is A major's `7`; drop it a fret and you have Mixolydian's `b7` | `5·11 5·10 3·13 3·12` | 56 55 68 67 |

All three rounds `"ordered": true`. Every target verified inside its round's board, and every MIDI
value distinct within its round.

Two collisions were found and designed around, and they are why the E form is not used here:
in the E form of A Lydian the `#4`s at `2·4` and `3·8` both sound MIDI 63, and in the C form of
`A Major` the `7`s at `2·9` and `3·13` both sound MIDI 68. Either pair in one round would be
unplayable by ear.

---

## The checkpoint — `modes-ch3-checkpoint`

`kind: "checkpoint"` · `passThresholdPct` 70 · **8 questions**, written **after** the seven articles
were read, from what they actually say. Referenced only from the chapter's `checkpoint` field, not
as a section — matching chapters 1 and 2 and every sibling pathway.

| # | id suffix | Draws on | Tests |
| - | --------- | -------- | ----- |
| 1 | `the-family` | `modes-ionian-sound` | One home chord, two dials, three settings — and which degrees the dials are |
| 2 | `no-accent` | `modes-ionian-sound` | Why Ionian has no characteristic note, and that this is by construction |
| 3 | `avoid-note` | `modes-the-avoid-note` | The definition, and which note it is over `A` |
| 4 | `lydian-consonance` | `modes-the-avoid-note` | Why Lydian's `#4` does not clash where the `4` does — and the happiness tension |
| 5 | `lydian-vamp` | `modes-lydian-sound` | The `A`–`B` vamp and what the `B` chord carries |
| 6 | `mixolydian-seventh` | `modes-mixolydian-sound` | The `3`/`b7` tritone, `A7`, and the lost leading tone |
| 7 | `window-edges` | both neck lessons | `multi-select` — what the window's edges do, and that dot counts do not identify a scale |
| 8 | `lean-on-one-note` | `modes-one-home-three-ways` | Given a vamp or a note, name the mode |

Every lesson is covered. Distractors encode this chapter's real misunderstandings — "Lydian is
brightest so it must be happiest", "an avoid note is forbidden", "a mode has its own shapes", "count
the dots" — never filler. **No question refers to an option by letter or position.** Every question
carries an `explanation`. **No `listen` question**: a `listen` question plays bare notes with no
drone and no accompaniment, so it cannot test a modal claim.

---

## Errata found while reviewing the drafts — chapters 4–6 inherit these

Eleven corrections were made to lesson drafts that both lesson agents had reported clean. Recorded
here because most of them will recur.

1. **A false claim about the rock literature's scope.** A draft of `modes-ionian-sound` wrote "most
   of what's on your own playlist is built from exactly the three modes this chapter covers, plus
   the two chapter 4 covers next." Both halves are wrong: **Lydian is not on the common-modes list**
   (which is Ionian, Mixolydian, Dorian, Aeolian), and chapter 4 covers **three** modes, not two.
   Rewritten to say two of the four are in this chapter and Lydian is not on the list at all — which
   is a better sentence anyway, because it is why Lydian needs a lesson.
2. **An invented attribution.** The same paragraph glossed the literature consensus as "a settled
   reading of the repertoire built on close listening across recordings and decades." Nothing
   supports that description of the method. Replaced with the actual attribution — Everett and
   Moore, named — and the flat statement that it is a reading of the music rather than a
   measurement.
3. **A minor-family leak.** A draft of `modes-the-avoid-note` narrowed its superlative correctly and
   then added "a minor-family mode shares the same clean bill of health over its own tonic." True
   (it is Dorian) but it is chapter 4's to say, and it turns a scoped claim into a riddle. Cut; the
   scoping stands on its own.
4. **"The same seven notes as Lydian and Ionian."** A draft of `modes-mixolydian-sound` closed with
   this. Mixolydian shares neither note set — it is one degree from Ionian and two from Lydian.
   Rewritten as "the same home chord."
5. **A dot misattributed.** A draft of `modes-mixolydian-neck` said `3·0` was "one of those two new
   dots" in the A form, one sentence after correctly naming the two new dots as `1·3` and `6·3`.
   `3·0` is the dot that *moved* (from `3·1`), not one that arrived. Corrected.
6. **A miscount of the chapter's own diagrams.** The same lesson said "the two windows this chapter
   doesn't draw" and then named three (G, D, E). Across the chapter, only the D form is undrawn;
   from that lesson's own vantage, three are. Rescoped to "this lesson".
7. **"Three chords, two turns each."** The closer's hand-off to chapter 4 said this. Chapter 2's
   table has **two** home chords with two dials each, plus `Adim` which has none. Corrected to "two
   home chords, two dials each".
8. **Six `caged-shape` captions duplicated the card's own heading** — `caption: "C form · A Major"`
   under a heading that already reads `C form · A Major`. **`caged-shape`'s `caption` replaces the
   line *under* the heading, not the heading**, and its default is the scale's `character` string.
   Chapters 4 and 5 will hit this: write a caption that adds something, or omit it.
9. **An asserted perceptual strength.** A draft of `modes-lydian-sound` said Lydian's "pull toward
   home is exactly as strong as Ionian's". The structural fact (same `7`, same place) is licensed;
   the strength comparison is not. Reworded.
10. **A mood asserted immediately after disclaiming moods.** The same lesson followed its
    repertoire-association paragraph with "Lydian isn't trying to resolve into that reference, it's
    hovering above it." Cut.
11. **"The previous lesson left it here"** opened `modes-lydian-neck`, and "by the end of the next
    lesson" closed `modes-ionian-sound`. Both are positional references to lessons, which the
    brief's conventions table bans for the same reason it bans "the last lesson" — sections are not
    numbered on screen and the reference breaks on reorder. Both replaced: one with the content
    itself, one with a link by slug.

### Corrections and additions that chapters 4–6 should carry

- **"Lydian is the only mode with no avoid note" is FALSE.** Over its own tonic triad `Am`
  (`A C E`), **Dorian has none either** — recomputed across all seven. The safe scoping is "the
  only one of the major family". **Chapter 4 owns Dorian's version of this** and should say it
  there; chapter 5, which generalises avoid notes, needs the full set: over each mode's own tonic
  triad, Lydian none, Ionian `4`, Mixolydian `4`, Dorian none, Aeolian `b6`, Phrygian `b2` and
  `b6`, Locrian `b2`. All recomputed.
- **`caged-shape`'s `caption` replaces the line under the heading.** The heading is always
  `<form> form · <root> <scale name>` and is not overridable. See erratum 8.
- **`scale-compare`'s diff tint is always amber, whatever the scale's own accent hue is.** So a
  Lydian lesson tints `#4` violet in prose (matching `caged-shape`) and still calls the chip on the
  card amber. Chapters 4 and 5 need the same split for Phrygian's rose `b2` and Locrian's rose
  `b5`. Never write "the violet chip" or "the rose chip".
- **`scale-compare`'s run ends on the octave root** (`midisFor` appends `base + 12`), so the
  second-to-last note of every run is the `7`/`b7`. `modes-mixolydian-sound` uses this to make the
  leading tone audible, and it is reusable.
- **A window clamped at the nut behaves differently from every other window.** For root `A` only
  the A form is clamped (0–3, four frets wide rather than five). Because nothing exists below fret
  0, **raising a degree there can only lose dots and flattening one can only gain them** — verified
  monotonically across the row: Lydian 12, Ionian 13, Mixolydian 15, Dorian 16, Aeolian 17.
  Chapter 4 draws the same window from the other end.
