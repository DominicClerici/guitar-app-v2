# Chapter 3 — The Pentatonic in Each Form

Chapter id `caged-fretboard.ch3` · slug `the-pentatonic-in-each-form` · 6 articles, 1 activity,
1 checkpoint.

After this chapter the learner can play the C major pentatonic in any of the five windows **and
knows which of its notes are chord tones** — the difference between running a scale and playing over
a chord.

---

## Structure decision

Six lessons: an opener plus the five form lessons in strict C-A-G-E-D order. No separate closer.

Chapter 2 put its frame in the opener and its join-up in the D form lesson, and reported that the D
form's own character got squeezed. **This chapter distributes the chapter-level material instead of
piling the second half onto D:**

- The **opener** carries the frame — what the pentatonic adds, the twelve-dot discovery, the
  chord-tone spine, the diagram convention (which *changes* at this layer), and the
  `/scale-visualizer` Boxes-vs-CAGED trap.
- The **A form lesson** carries the fret-5 fact (all six strings pentatonic at one fret). It sits in
  the A form's own window, so it is not a foreign lump.
- The **G form lesson** carries the relative-minor point and the exact match with the box most
  guitarists already own. This is the chapter's biggest single idea and it belongs where the
  geometry actually lands, not in the opener.
- The **D form lesson** closes with two facts only — the overlaps, and the low-E ladder — and gets
  its own character first.

That leaves every form lesson with a verified, distinct property (below), which is the mitigation
for the brief's known risk that twenty form lessons read as one lesson repeated.

---

## Verified facts this chapter is built on

Computed from the app's own `cagedMarks` / `CAGED_FORM_OFFSETS`
(`mobile/src/lib/guitar-positions/caged.ts`) and standard-tuning MIDI, not from the web or from
memory. **These are the numbers every lesson must use.** String numbering is **1 = high e, 6 = low
E** everywhere. `1` = `C`, `2` = `D`, `3` = `E`, `5` = `G`, `6` = `A`.

### The correction to the chapter brief

The dispatch brief said "two of these five notes are the ones the chord is made of and three are
not." That is backwards. The pentatonic is `1 2 3 5 6`; the chord is `1 3 5`. **Three of the five
are chord tones and two are not.** Every lesson uses the correct version.

### The discovery: every window holds exactly twelve dots, two on every string

`caged-shape` at `show: "pentatonic"` marks every `1 2 3 5 6` inside the five-fret window. In all
five windows that comes to **exactly twelve marks — precisely two on each of the six strings.** No
exceptions, no lopsided string.

This is new at this layer and it is the chapter's structural spine. At `show: "triad"` the dots were
7 or 8 and scattered unevenly (chapter 2 built its fragment argument on exactly that unevenness).
At `show: "pentatonic"` the window becomes regular: two notes per string, one hand, no shift. That
is what a pentatonic "box" *is*, and the learner arrives at it without ever being handed a new
shape.

### Every window, dot by dot

Frets are written as *string·fret*. Each row is one string's two dots, low string to high.

**C form** — barre 0 (open), window `0–4`. Dots occupy frets **0–3**.

| String | Lower dot | Upper dot | Fret gap |
| --- | --- | --- | --- |
| 6 | `6·0` `3` (`E`) | `6·3` `5` (`G`) | 3 |
| 5 | `5·0` `6` (`A`) | `5·3` `1` (`C`) | 3 |
| 4 | `4·0` `2` (`D`) | `4·2` `3` (`E`) | 2 |
| 3 | `3·0` `5` (`G`) | `3·2` `6` (`A`) | 2 |
| 2 | `2·1` `1` (`C`) | `2·3` `2` (`D`) | 2 |
| 1 | `1·0` `3` (`E`) | `1·3` `5` (`G`) | 3 |

**A form** — barre 3, window `2–6`. Dots occupy frets **2, 3 and 5** — three frets only.

| String | Lower dot | Upper dot | Fret gap |
| --- | --- | --- | --- |
| 6 | `6·3` `5` | `6·5` `6` | 2 |
| 5 | `5·3` `1` | `5·5` `2` | 2 |
| 4 | `4·2` `3` | `4·5` `5` | 3 |
| 3 | `3·2` `6` | `3·5` `1` | 3 |
| 2 | `2·3` `2` | `2·5` `3` | 2 |
| 1 | `1·3` `5` | `1·5` `6` | 2 |

**G form** — barre 5, window `4–8`. Dots occupy frets **5, 7 and 8** — three frets only. Nothing at
fret 4 or 6.

| String | Lower dot | Upper dot | Fret gap |
| --- | --- | --- | --- |
| 6 | `6·5` `6` | `6·8` `1` | 3 |
| 5 | `5·5` `2` | `5·7` `3` | 2 |
| 4 | `4·5` `5` | `4·7` `6` | 2 |
| 3 | `3·5` `1` | `3·7` `2` | 2 |
| 2 | `2·5` `3` | `2·8` `5` | 3 |
| 1 | `1·5` `6` | `1·8` `1` | 3 |

**E form** — barre 8, window `7–11`. Dots occupy frets **7–10**. Nothing at fret 11.

| String | Lower dot | Upper dot | Fret gap |
| --- | --- | --- | --- |
| 6 | `6·8` `1` | `6·10` `2` | 2 |
| 5 | `5·7` `3` | `5·10` `5` | 3 |
| 4 | `4·7` `6` | `4·10` `1` | 3 |
| 3 | `3·7` `2` | `3·9` `3` | 2 |
| 2 | `2·8` `5` | `2·10` `6` | 2 |
| 1 | `1·8` `1` | `1·10` `2` | 2 |

**D form** — barre 10, window `9–13`. Dots occupy frets **9, 10, 12 and 13** — a five-fret spread,
the only window that does not fall under one hand.

| String | Lower dot | Upper dot | Fret gap |
| --- | --- | --- | --- |
| 6 | `6·10` `2` | `6·12` `3` | 2 |
| 5 | `5·10` `5` | `5·12` `6` | 2 |
| 4 | `4·10` `1` | `4·12` `2` | 2 |
| 3 | `3·9` `3` | `3·12` `5` | 3 |
| 2 | `2·10` `6` | `2·13` `1` | 3 |
| 1 | `1·10` `2` | `1·12` `3` | 2 |

### The two wide steps — why some strings are a three-fret reach

A fret gap on one string is exactly the semitone distance between the two notes. The pentatonic's
five steps are:

| Step | Semitones | Fret gap |
| --- | --- | --- |
| `1` → `2` | 2 | 2 |
| `2` → `3` | 2 | 2 |
| `3` → `5` | 3 | **3** |
| `5` → `6` | 2 | 2 |
| `6` → `1` | 3 | **3** |

So a string is a three-fret reach exactly when its pair is `3–5` or `6–1`. **Which strings those
land on is different in every form, and that is the concrete thing that makes each window feel
different under the hand:**

| Form | Three-fret strings |
| --- | --- |
| C | 6, 5, 1 |
| A | 4, 3 |
| G | 6, 2, 1 |
| E | 5, 4 |
| D | 3, 2 |

### Which degree each window doubles — the per-form character generator

Twelve dots over five degrees means two degrees appear three times and three appear twice. **The
tripled pair rotates one step along the scale as you climb the neck**, which is the same rotation
the windows themselves are.

| Form | Tripled | Chord tones (of 12) | Non-chord tones |
| --- | --- | --- | --- |
| C | `3` and `5` | **8** | 4 |
| A | `5` and `6` | 7 | 5 |
| G | `1` and `6` | 7 | 5 |
| E | `1` and `2` | 7 | 5 |
| D | `2` and `3` | 7 | 5 |

This is not trivia. It is *why* each window has a different musical flavour: the C form is the most
chord-toned of the five (eight of its twelve dots are `C`, `E` or `G`), the G form triples the `1`
and the `6` — root and relative-minor root, which is exactly why it reads as the minor box everyone
already owns — and the E form triples the `1`, which is why it is the best window for landing home.

### What each window adds to chapter 2's triad

Every dot that was not already a `1`, `3` or `5`:

| Form | Added dots |
| --- | --- |
| C | `5·0` `6`, `4·0` `2`, `3·2` `6`, `2·3` `2` — **four**, and two of them are open strings |
| A | `6·5` `6`, `5·5` `2`, `3·2` `6`, `2·3` `2`, `1·5` `6` |
| G | `6·5` `6`, `5·5` `2`, `4·7` `6`, `3·7` `2`, `1·5` `6` |
| E | `6·10` `2`, `4·7` `6`, `3·7` `2`, `2·10` `6`, `1·10` `2` |
| D | `6·10` `2`, `5·12` `6`, `4·12` `2`, `2·10` `6`, `1·10` `2` |

### Fret 5 — the whole pentatonic under one finger

**Fret 5 is the only fret in the first twelve where all six strings sound a note of the C major
pentatonic**: `A D G C E A` = `6 2 5 1 3 6`. Verified by exhaustive check over frets 0–12; there is
no fret at which all six strings are triad tones at all. Fret 5 sits in the **A form's** window
(2–6) and in the **G form's** (4–8), and it is the A ∩ G overlap.

### The overlaps — the closer's first fact

Chapter 2's version was "every overlap holds a complete `1 3 5`". The pentatonic version is
stronger: **every overlap between neighbouring windows holds all five notes, one on every string —
six dots covering `1 2 3 5 6` complete.**

| Overlap | Frets | Dots inside |
| --- | --- | --- |
| C ∩ A | 2–4 | `6·3` `5`, `5·3` `1`, `4·2` `3`, `3·2` `6`, `2·3` `2`, `1·3` `5` |
| A ∩ G | 4–6 | all six strings at **fret 5**: `6` `2` `5` `1` `3` `6` |
| G ∩ E | 7–8 | `6·8` `1`, `5·7` `3`, `4·7` `6`, `3·7` `2`, `2·8` `5`, `1·8` `1` |
| E ∩ D | 9–11 | `6·10` `2`, `5·10` `5`, `4·10` `1`, `3·9` `3`, `2·10` `6`, `1·10` `2` |

### The low-E ladder — the closer's second fact

Play the C major pentatonic up the low E string and you land on frets **0, 3, 5, 8, 10** (`E G A C
D`), then fret 12 where it repeats. **Those are exactly the five forms' barre frets, in CAGED
order** — C at 0, A at 3, G at 5, E at 8, D at 10. Verified against chapter 1's own table.

Equivalently: each window's *lower* dot on string 6 is the *upper* dot of the window below it. The
interlock, walking up one string.

| Form | String-6 dots |
| --- | --- |
| C | `6·0` `3` → `6·3` `5` |
| A | `6·3` `5` → `6·5` `6` |
| G | `6·5` `6` → `6·8` `1` |
| E | `6·8` `1` → `6·10` `2` |
| D | `6·10` `2` → `6·12` `3` |

### The relative minor, and the box everyone already owns

C major pentatonic is `C D E G A`. A minor pentatonic is `A C D E G`. **The same five pitch
classes** — not similar, identical. What differs is which one you treat as home and resolve to.

The famous "box 1" of A minor pentatonic is, string 6 to string 1: frets 5 and 8, 5 and 7, 5 and 7,
5 and 7, 5 and 8, 5 and 8. **That is the G form window's twelve dots, exactly** — every dot, no
extras, no omissions. Verified above. The box most guitarists already own *is* one of the five forms
this chapter teaches, relabelled.

The reason it reads as A minor rather than C major is visible in the same table: the G form triples
the `6` (`A`) and its lowest note on string 6 is `6·5`, an `A`. Everyone who learned that box learned
to start and end on the low root of the box, which is the `A`.

**Scope guard**: name this, use it, and stop. No minor CAGED, no minor forms, no `b3`/`b7`.

### The two notes still missing

The major scale has seven notes; this chapter's layer has five. Chapter 4 adds the other two.
**No lesson names them or their degrees.** One `info` callout in the D form lesson may say that the
two three-fret steps are where they will land — geometry only, no degree numbers, no note names.

### The app trap

`/scale-visualizer` offers a position-system toggle. For a five-note scale
(`systemsFor`, `mobile/src/lib/guitar-positions/index.ts`) the two options are labelled **CAGED**
and **Boxes**. The scale id in the library is `major-pentatonic`.

- **CAGED** gives exactly this chapter's windows: C 0–4, A 2–6, G 4–8, E 7–11, D 9–13 (plus the C
  form again at 12–15).
- **Boxes** is `PENTATONIC_WINDOWS` — a genuinely different five-window tiling with its own
  numbering. For C major pentatonic it pages as Box 3 (0–3), Box 4 (3–6), Box 5 (6–8), Box 1 (8–11),
  Box 2 (11–13). Different spans, different names, and the numbering does not start at the nut.

Named **once**, in a `warning` callout in the opener, with the instruction to use the CAGED toggle.
No other lesson mentions Boxes.

### The diagram convention — and how it changes here

Chapter 2's opener stated it: `caged-shape` draws **everything in the window, not one playable
grip**. That is still true and the opener must restate it, because a learner may arrive after a gap.

But at this layer the consequence flips, and the flip is worth saying out loud. At `show: "triad"`
the diagram held more notes than a hand could hold, which is why fragments existed. At
`show: "pentatonic"` the twelve dots are **two per string across a four-fret span, so for four of the
five windows the diagram is exactly what your hand plays.** The D form is the single exception: its
dots spread over frets 9–13, five frets, so it needs a small shift. That is the honest statement and
it is also the D form's own character at this layer.

The windows are drawn five frets wide but the dots never fill all five — the A and G windows use
only three distinct frets each.

---

## The lessons

Six articles, in order. Slugs are fixed by the brief. Section ids are progress keys: never renamed.

Every article: `schemaVersion: 1`, `publishedAt: "2026-08-11"`, `tags: ["caged", "fretboard"]`,
`readingTimeMin` = ceil(words ÷ 200), floor 2. `meta.slug` equals the filename stem. The title is
`meta.title` and the article does **not** open with a heading.

Every form lesson uses `live` · `caged-shape` ·
`{ "root": "C", "form": "<letter>", "show": "pentatonic", "caption": "…" }` — the same `root` +
`form` chapters 1 and 2 drew at `show: "roots"` and `show: "triad"`. **Each form lesson must point at
that continuity explicitly**: same window, same roots, the triad still in it, five more dots. That
continuity is the pathway's spine.

---

### 1. `caged-seconds-and-sixths` — "Twelve Dots, Two on Every String"

- **Section id**: `caged-fretboard.ch3.seconds-and-sixths` ·
  **Article id**: `art_caged-seconds-and-sixths`
- **Length**: 700–850 words. The longest of the six; it carries the frame.
- **Left by chapter 2**: `1 3 5` in every window; the `3` decides major or minor; only the A and E
  forms bar whole; the degree layouts; every overlap holds a complete triad; and the promise —
  renewed in the D form lesson's closing callout — that chapter 3 lights two more notes in the same
  five windows.
- **The one thing it teaches**: the pentatonic is the triad plus two more notes per octave, and the
  moment you add them each window becomes a regular twelve-dot box — two notes on every string.
- **The misconception it corrects**: "the pentatonic is the major scale with two notes taken out"
  (unavailable to this learner and not how this pathway builds), and "learning a scale means
  learning new shapes."

**Key points, in order**

1. Cash chapter 2's promise again, in the first paragraph. Same five windows. Two more notes each.
   **Define the pentatonic by what it adds, never by what it omits** — the triad `1 3 5` plus a `2`
   and a `6`, five notes to the octave: `1 2 3 5 6`. In C that is `C D E G A`.
2. Say plainly that the major scale has seven and this has five, and that chapter 4 adds the
   remaining two. **Do not say which two.** One sentence, then move on.
3. **The discovery.** Add those two notes to any of the five windows and the count comes out the
   same every time: twelve dots, exactly two on every string. Say it as a fact the learner can
   check, and say what it buys — two notes per string is one hand, no shift, which is what makes a
   pentatonic box runnable in a way a triad window never was.
4. **The diagram convention, restated for a learner arriving cold, then flipped.** `caged-shape`
   draws everything in the window rather than one grip; at the triad layer that meant more dots than
   a hand could hold; here it means the opposite — four of the five windows are exactly a hand's
   worth. The D form is the one that spreads too far, and the lesson for it says so.
5. **The spine, stated once and hard.** Three of the five are the notes the chord is built from —
   `1`, `3`, `5`, the `C`, `E` and `G` chapter 2 spent a whole chapter on. Two of them, the `2` and
   the `6`, are not in the chord at all. A learner who can see which dots are which can land on a
   chord tone and sound like they meant it; a learner who only knows the box runs up and down it.
   That distinction is the point of this chapter and it should be stated in those terms.
6. The `live` block: `caged-shape` `{ "root": "C", "form": "C", "show": "pentatonic" }`, tied back
   explicitly to the C form's triad diagram in
   [`caged-triad-c-form`](article link) — the same window, the same eight chord tones, four new dots
   around them. (The C form is used here rather than the A form so the opener does not repeat
   chapter 2's opener choice, and because the C form is the next lesson.)
7. **The app trap**, as a `warning` callout: `/scale-visualizer` on a pentatonic offers a **CAGED**
   toggle and a **Boxes** toggle. CAGED is this chapter's five windows with these names. Boxes is a
   different five-window tiling with its own numbering that will not line up. Use CAGED.
8. Close on the C form, the one that sits open under the nut.

**Blocks / components**

- `live` · `caged-shape` · `{ "root": "C", "form": "C", "show": "pentatonic", "caption": "…" }`.
- One small `table`: the five degrees `1 2 3 5 6`, their notes in C, and "in the chord?" — three
  yes, two no. Keep cells to a word or two.
- One `callout` (`warning`) for the CAGED-vs-Boxes toggle.
- Article link to `caged-triad-c-form`; screen link to `/scale-visualizer`; article link to
  `caged-pentatonic-c-form` at the close.

**Do not**: name the two notes the pentatonic lacks, or their degrees, or say "minus the fourth and
seventh" in any wording; teach any form's dot positions (each form lesson owns its own); mention
minor pentatonic beyond, at most, one forward-pointing clause that the G form lesson explains why
these shapes look familiar; transpose out of C.

---

### 2. `caged-pentatonic-c-form` — "The C Form: Five Strings Ring Open"

> **Title corrected during review.** The planned title was "Six Open Strings and a Box", which is
> wrong: only **five** of the six open strings are in this window. String 2 open is not in the C
> major pentatonic at all, and naming it would stray into chapter 4's territory.

- **Section id**: `caged-fretboard.ch3.pentatonic-c-form` ·
  **Article id**: `art_caged-pentatonic-c-form`
- **Length**: 500–650 words
- **Left by the opener**: `1 2 3 5 6`; twelve dots, two per string; three of the five are chord
  tones; the diagram is now roughly what the hand plays; use the CAGED toggle.
- **The one thing it teaches**: the C form's window is the open-position pentatonic — its lower dot
  on every string except string 2 is an **open string** — and it is the most chord-toned of the five
  windows, eight of twelve.
- **The misconception it corrects**: "a scale shape is something you move up the neck; the open
  position is a special case."

**Key points, in order**

1. Restate the shorthand once, since this is the chapter's first heavy use: `5·3` means string 5,
   fret 3. Then the window: barre 0, frets `0–4`, dots living in frets `0–3`.
2. **The open strings.** Five of the six strings have their lower dot at fret 0 — `6·0` `3`,
   `5·0` `6`, `4·0` `2`, `3·0` `5`, `1·0` `3`. Only string 2 breaks it, at `2·1` `1`, and the reason
   is the B string, which chapter 1 named. Nowhere else on the neck does a whole pentatonic window
   sit half on open strings.
3. Give all twelve dots as a `table`, string by string, with both dots and both degrees. Use the
   verified table above unchanged.
4. **What is new since chapter 2.** Only four dots: `5·0` `6`, `4·0` `2`, `3·2` `6`, `2·3` `2`. Two
   of them are open strings. Tie it to the triad diagram: eight chord tones were already there, and
   **this is the most chord-toned window of the five** — two thirds of its dots are notes of the
   chord. Name the consequence: it is the hardest window to sound wrong in, and the easiest one in
   which to forget that `5·0` and `4·0` are not chord tones.
5. **Character, in the reach.** Its three-fret strings are 6, 5 and 1 — the two outside strings and
   the A string. The middle of the shape is compact and the edges stretch. Contrast in one clause
   with the A form, where the reach is in the middle instead.
6. The `live` block, tied to the same window at `show: "roots"` and `show: "triad"` — chapter 1 lit
   two dots here, chapter 2 lit eight, this lights twelve. Same window every time.
7. Close on the A form, where the whole thing lines up under one finger.

**Blocks / components**

- `live` · `caged-shape` · `{ "root": "C", "form": "C", "show": "pentatonic", "caption": "…" }`.
- `table` — the twelve dots, string by string.
- One `callout` (`tip`): strum the open strings, and note that two of the six ringing notes are not
  in the chord.
- Article links to `caged-roots-c-form` and/or `caged-triad-c-form`; screen link to
  `/scale-visualizer`; article link to `caged-pentatonic-a-form` at the close.

---

### 3. `caged-pentatonic-a-form` — "The A Form: The Whole Scale at One Fret"

- **Section id**: `caged-fretboard.ch3.pentatonic-a-form` ·
  **Article id**: `art_caged-pentatonic-a-form`
- **Length**: 550–700 words
- **Left by the C form**: twelve dots as a table; open-position shape; the most chord-toned window;
  three-fret strings live on the edges there.
- **The one thing it teaches**: fret 5 is the only fret on the neck where all six strings sound a
  note of this scale, and it sits at the top edge of the A form's window.
- **The misconception it corrects**: "a scale shape is a diagonal you have to trace" — this one is
  mostly a straight line.

**Key points, in order**

1. The A form of `C`: barre 3, window frets `2–6`, and the twelve dots occupy only **three frets** —
   2, 3 and 5. Nothing at fret 4 or fret 6 at all. This is the most regular of the five windows and
   the easiest to see.
2. Four of the six strings carry the identical pair, frets 3 and 5. Only strings 4 and 3 differ,
   sitting at 2 and 5 — and those two are exactly the three-fret reaches. Give the full twelve-dot
   `table`.
3. **Fret 5, the lesson's centre.** Lay one finger across fret 5 and every string under it is a note
   of the C major pentatonic: `A D G C E A`, degrees `6 2 5 1 3 6`. **There is no other fret in the
   first twelve where that is true** — and there is no fret at all where all six are chord tones.
   State that it was verified, not assumed. Give it a paragraph of its own.
4. Follow it immediately with the chapter's point rather than leaving it as a curiosity: of those
   six notes, `3·5` is the root, `2·5` the third and `4·5` the fifth — three chord tones sitting
   next to each other on strings 4, 3 and 2. Chapter 2 already named that trio (`5 1 3`, the middle
   of the A-form barre and the middle of the G-form barre). It is the same three notes, now with the
   scale around them. **One finger at fret 5 gives you the whole scale; three strings of it give you
   the whole chord.**
5. **What is new since chapter 2**: `6·5` `6`, `5·5` `2`, `3·2` `6`, `2·3` `2`, `1·5` `6`. The A
   form triples the `6` — three `A`s in one window, more than any degree except the `5`. Say what
   that means in play: this window leans toward the `6`, which is the note that will matter in the
   G form lesson.
6. Character summary in one line: the friendliest barre from chapter 2 is also the tidiest scale
   window — three frets, four identical strings, one fret that holds everything.
7. Close on the G form, and flag it as the one the learner may already own.

**Blocks / components**

- `live` · `caged-shape` · `{ "root": "C", "form": "A", "show": "pentatonic", "caption": "…" }`.
- `table` — the twelve dots, string by string.
- One `callout` (`tip`): one finger at fret 5, all six strings, whole scale.
- Screen link to `/scale-visualizer`; article link to `caged-pentatonic-g-form` at the close.

---

### 4. `caged-pentatonic-g-form` — "The G Form: The Box You Already Own"

- **Section id**: `caged-fretboard.ch3.pentatonic-g-form` ·
  **Article id**: `art_caged-pentatonic-g-form`
- **Length**: 700–850 words. **The chapter's biggest single idea lives here**, so it is allowed to
  be the longest of the form lessons.
- **Left by the A form**: fret 5 holds the whole scale; the A form leans on the `6`.
- **The one thing it teaches**: the G form's twelve dots are, position for position, the shape most
  guitarists already know as the first box of the minor pentatonic — because C major pentatonic and
  A minor pentatonic are the same five notes, and only the note you resolve to decides which one you
  are playing.
- **The misconception it corrects**: "the pentatonic I know is the minor one, so this is a different
  scale" — and its sharper cousin, "these five notes are minor."

**Key points, in order**

1. The G form of `C`: barre 5, window frets `4–8`, dots at frets **5, 7 and 8** only. Give the
   twelve-dot `table` first, before the reveal, so the learner meets the shape as itself.
2. **The reveal.** If that shape looks familiar, it should. String 6 to string 1: 5 and 8, 5 and 7,
   5 and 7, 5 and 7, 5 and 8, 5 and 8. That is the shape sold everywhere as the first box of the A
   minor pentatonic — not similar to it, the same twelve positions.
3. **Why**, in plain terms and without drifting into minor theory. C major pentatonic is
   `C D E G A`. A minor pentatonic is `A C D E G`. Same five notes, written starting from a
   different one. There is only one set of pitches here; there are two ways to hear it.
4. **What decides which you are hearing**: the note you keep coming back to. Land on `C` and the
   five notes sound major; land on `A` and they sound minor. Nothing about the shape changes —
   nothing about the fingering, nothing about the frets. Only where you stop.
5. **The geometric evidence**, which is this lesson's own contribution: the G form triples the `1`
   and the `6` — three `C`s (`6·8`, `3·5`, `1·8`, the three roots chapter 1 gave this form) and
   three `A`s (`6·5`, `4·7`, `1·5`). Root and relative-minor root, three each, and **the lowest note
   in the whole window is `6·5` — an `A`, not the root.** Anyone who learned this box learned to
   start on its lowest note, which is why it has sounded minor to them ever since.
6. **The practical instruction**, and the payoff of the whole chapter, stated here most concretely:
   in this window the roots are `6·8`, `3·5` and `1·8`. Play the box against a sustained `C` and end
   phrases on one of those three, and the same shape that has always sounded like a blues lick
   sounds like it belongs over the chord. Send them to `/drone` for the sustained `C`.
7. **What is new since chapter 2**: `6·5` `6`, `5·5` `2`, `4·7` `6`, `3·7` `2`, `1·5` `6`. Note in a
   clause that fret 5 across all six strings — the A form's fact — is the bottom edge of this
   window too, which is what "the windows overlap" looks like at this layer.
8. Character in one line, tying back to chapter 2: the widest form, the one never held whole as a
   chord, is the most comfortable of the five as a scale — because two notes per string does not
   care how far apart the chord tones were.
9. Close on the E form.

**Blocks / components**

- `live` · `caged-shape` · `{ "root": "C", "form": "G", "show": "pentatonic", "caption": "…" }`.
- `table` — the twelve dots, string by string.
- One `callout` (`info`) for the relative-minor identity: same five notes, different home note.
- Screen link to `/drone`; screen link to `/scale-visualizer`; article link to
  `caged-pentatonic-e-form` at the close.

**Do not**: teach minor pentatonic as a subject; give minor degrees (`b3`, `b7`); teach the other
four minor boxes; discuss blues or the blue note; suggest the learner practise in A minor.

---

### 5. `caged-pentatonic-e-form` — "The E Form: Three Places to Land"

- **Section id**: `caged-fretboard.ch3.pentatonic-e-form` ·
  **Article id**: `art_caged-pentatonic-e-form`
- **Length**: 600–750 words
- **Left by the G form**: the same five notes can sound major or minor; what decides it is where you
  stop; the roots are the places to stop.
- **The one thing it teaches**: the E form window holds three roots on the `6 → 4 → 1` map, spread
  low, middle and high — so it is the window in which you can always resolve without moving your
  hand, which is what turns a scale into playing over a chord.
- **The misconception it corrects**: "landing on the root is a beginner's crutch" / "any note in the
  scale is as good as any other."

**Key points, in order**

1. The E form of `C`: barre 8, window frets `7–11`, dots occupying frets **7–10**. Twelve-dot
   `table`.
2. **Three roots**: `6·8`, `4·10`, `1·8` — chapter 1's `6 → 4 → 1` map, unchanged three chapters
   later. One low, one in the middle, one on top. Say explicitly that this is the same map, not a
   new one.
3. **Why that matters now.** The G form lesson said the note you resolve to decides what the five
   notes sound like. This window gives you three of them without a shift — low string, middle
   string, top string — so whichever register a phrase ends in, home is within reach. That is the
   most practical thing this chapter has to offer, and it is why the E form stays the window players
   navigate from.
4. **Read the window as chord tones and colour**: seven chord tones and five that are not. Name the
   five that are not — `6·10` `2`, `4·7` `6`, `3·7` `2`, `2·10` `6`, `1·10` `2` — and say what they
   are for: they are the notes that make a line move, and the chord tones are the notes that make it
   arrive. A phrase that only uses the first group never settles; a phrase that only uses the second
   is an arpeggio.
5. **The E form triples the `2`** — `6·10`, `3·7`, `1·10` — more than any other window. Combined
   with three roots, that gives it the most `1`s and the most `2`s of the five, and the `1`–`2` pair
   sits on adjacent frets on strings 6 and 1 (`8` then `10`, a whole step). One clause, no more.
6. **Character in the reach**: its three-fret strings are 5 and 4, right in the middle of the hand,
   which is why this window feels compact even though it spans four frets.
7. Practical close before the hand-off: play the window against a sustained `C` from `/drone` and
   end every phrase on `6·8`, `4·10` or `1·8`. Same twelve notes as anyone else is playing; the
   difference is entirely in where you stop.
8. Close on the D form.

**Blocks / components**

- `live` · `caged-shape` · `{ "root": "C", "form": "E", "show": "pentatonic", "caption": "…" }`.
- `table` — the twelve dots, string by string.
- One `callout` (`tip`): the three roots, and the instruction to end phrases on one of them.
- Screen link to `/drone`; article link to `caged-pentatonic-d-form` at the close.

---

### 6. `caged-pentatonic-d-form` — "The D Form, and the Ladder Up the Low E"

- **Section id**: `caged-fretboard.ch3.pentatonic-d-form` ·
  **Article id**: `art_caged-pentatonic-d-form`
- **Length**: 700–850 words. **A form lesson and the chapter's closer**, but the closer carries only
  two facts, so the D form gets real space of its own first.
- **Left by the E form**: three roots to land on; chord tones arrive, the other two move.
- **The one thing it teaches**: the D form is the one window whose twelve dots do not fall under one
  hand — five frets, not four, because the B string pushes its top note out to fret 13 — and then,
  as the closer, that the five windows are the pentatonic itself, walked up the low E string.
- **The misconception it corrects**: "every box is one hand position" and, for the closer, "the five
  forms are five shapes I have to remember separately."

**Key points, in order**

*The form (roughly the first half):*

1. The D form of `C`: barre 10, window frets `9–13`, dots at frets **9, 10, 12 and 13**. Twelve-dot
   `table`.
2. **The five-fret spread.** Four of the five windows put their twelve dots inside four frets. This
   one spreads across five, from `3·9` at the bottom to `2·13` at the top, so it is the one window
   that asks for a small shift or a pinky stretch rather than a settled hand. Say it plainly — a
   learner who cannot reach it in one position should know that is the shape and not their hand.
3. **The cause is the B string, for the third chapter running.** Strings 4 and 1 have their upper
   dot at fret 12; string 2 has its upper dot at fret 13, one fret higher, and that single fret is
   what turns a four-fret window into a five-fret one. Chapter 1 gave the reason (`G → B` is the one
   major third in standard tuning); chapter 2 saw it in the grip; here it is the thing that decides
   whether the window is one hand or not.
4. **What is new since chapter 2**: `6·10` `2`, `5·12` `6`, `4·12` `2`, `2·10` `6`, `1·10` `2`. The
   D form triples the `2` and the `3`, so it has the fewest roots-plus-fifths of any window and the
   most movement in it. Its only two roots are `4·10` and `2·13`, both awkward — worth naming,
   because this is the window where "land on a chord tone" takes the most planning.
5. Character line: the smallest chord shape of the five is not the smallest scale window — it is the
   widest. Chapter 2's smallest form has the biggest reach here.

*The join-up (the rest):*

6. **Fact one — the overlaps.** Give the four-row `table` above. Every overlap between neighbouring
   windows holds all five notes, one on every string. State the consequence in the chapter's own
   terms: wherever you stop, the notes under your hand belong to two windows at once, and both a
   whole scale and a whole chord are already there. Chapter 2 proved this in chord tones; this is
   the same claim with the scale in it.
7. **Fact two — the ladder up the low E, which is the chapter's best single sentence.** Play the C
   major pentatonic on the low E string alone: frets `0`, `3`, `5`, `8`, `10`, then `12` where it
   starts again. **Those are the five forms' barre frets, in CAGED order.** The scale you just
   learned in five windows *is* the list of places those windows start. Give the string-6 `table`
   and point out that each window's lower dot on string 6 is the window below it's upper dot — the
   interlock, walked up one string.
8. A short `table` of all five forms as a summary artefact: *Form* / *Window* / *Frets the dots use*
   / *Which degree it triples* / *Three-fret strings*. This is the chapter's one-page picture.
9. **The renewed promise**, as an `info` callout: the same five windows carry every layer. Chapter 4
   puts the last two notes into each one and the shape count still does not change. One clause may
   note that the two three-fret steps are where they will land. **Name neither note nor degree.**
10. Close by sending them to `/scale-visualizer` on `C` with the scale set to major pentatonic and
    the position toggle on **CAGED**, to page the same five windows the diagrams drew, and to
    `/drone` to play any of them against a sustained `C`.

**Blocks / components**

- `live` · `caged-shape` · `{ "root": "C", "form": "D", "show": "pentatonic", "caption": "…" }`.
- `table` — the D form's twelve dots.
- `table` — the four overlaps.
- `table` — the string-6 ladder (form · its two string-6 dots).
- `table` — all five forms summarised.
- One `callout` (`info`) for the renewed promise.
- Screen links to `/scale-visualizer` and `/drone`.

**Do not**: use `caged-ladder` — it marks roots only, which would undercut a closer whose argument
is about non-chord tones; teach how to move between forms or run a progression (chapter 5);
transpose out of C; name the two missing notes.

---

## The activity

### `caged-land-on-the-chord-tones` — "Drill: Land on the Chord Tones"

- **Section id**: `caged-fretboard.ch3.land-on-the-chord-tones` ·
  **Activity id**: `act_caged-land-on-the-chord-tones`
- `kind: "note-play"`, `modes: ["easy", "hard"]`, document `board: { fretFrom: 0, fretTo: 13 }`.
- Section **must** set `"optional": true`.

**The duplicate-pitch constraint, worked out.** Every window's twelve dots turn out to be **twelve
distinct pitches** — a scale window ascends across the strings, so nothing repeats. Verified:

| Window | The twelve MIDI pitches |
| --- | --- |
| C form | 40 43 45 48 50 52 55 57 60 62 64 67 |
| A form | 43 45 48 50 52 55 57 60 62 64 67 69 |
| G form | 45 48 50 52 55 57 60 62 64 67 69 72 |
| E form | 48 50 52 55 57 60 62 64 67 69 72 74 |
| D form | 50 52 55 57 60 62 64 67 69 72 74 76 |

So a whole window can be one round, which chapter 1 could not do at all and chapter 2 could only do
for a grip. The chord-tone subsets are distinct for the same reason.

| Round id | Prompt gist | Targets (string · fret) | Board |
| --- | --- | --- | --- |
| `r_caged-land-on-the-chord-tones.c-form-box` | The whole window in open position — twelve notes, two per string | 6·0, 6·3, 5·0, 5·3, 4·0, 4·2, 3·0, 3·2, 2·1, 2·3, 1·0, 1·3 | 0–4 |
| `r_caged-land-on-the-chord-tones.g-form-box` | The G form's twelve — the box you already own | 6·5, 6·8, 5·5, 5·7, 4·5, 4·7, 3·5, 3·7, 2·5, 2·8, 1·5, 1·8 | 4–8 |
| `r_caged-land-on-the-chord-tones.g-form-chord-tones` | Of those twelve, only the ones the chord is made of | 6·8, 5·7, 4·5, 3·5, 2·5, 2·8, 1·8 | 4–8 |
| `r_caged-land-on-the-chord-tones.e-form-chord-tones` | Same job, E form window | 6·8, 5·7, 5·10, 4·10, 3·9, 2·8, 1·8 | 7–11 |
| `r_caged-land-on-the-chord-tones.fret-five` | One finger, six strings, the whole scale | 6·5, 5·5, 4·5, 3·5, 2·5, 1·5 | 4–6 |
| `r_caged-land-on-the-chord-tones.every-six` | Every `6` in the first twelve frets, low to high — `ordered: true` | 6·5, 4·7, 2·10 | 0–12 |

MIDI check on the smaller rounds: G chord tones `48 52 55 60 64 67 72`; E chord tones
`48 52 55 60 64 67 72`; fret five `45 50 55 60 64 69`; every `6` `45 57 69`. All distinct within
their round. The last round is the "just past it" one — there are seven `A`s on the neck in frets
0–13 but only three distinct pitches, so it asks for one per octave, in order, off any board.

---

## The checkpoint

`caged-fretboard-ch3-checkpoint` · section id `caged-fretboard.ch3.checkpoint` ·
`meta.kind: "checkpoint"` · `passThresholdPct: 70` on both the quiz meta and the chapter checkpoint.

To be written **after** the articles are read, from what they actually say. Sketch — 8 questions,
one per lesson plus three chapter-level:

| # | Question id suffix | Kind | Draws on | Tests |
| - | ------------------ | ---- | -------- | ----- |
| 1 | `what-it-adds` | `choice` | Opener | The pentatonic is the triad plus two more per octave — five notes, `1 2 3 5 6` |
| 2 | `which-are-chord-tones` | `choice` | Opener + every form lesson | **Three** of the five are the chord; the `2` and the `6` are not |
| 3 | `caged-not-boxes` | `choice` | Opener | Why the visualizer's Boxes toggle shows different shapes |
| 4 | `c-form-open-strings` | `choice` | C form | Which two open strings carry the C form's added notes (5 and 4 — `A` and `D`) |
| 5 | `fret-five` | `fretboard` | A form | Mark all six pentatonic notes at fret 5, `frets: 5` |
| 6 | `relative-minor` | `choice` | G form | Same five notes as A minor pentatonic; the note you resolve to decides which |
| 7 | `e-form-landing` | `choice` | E form | Which position in the E form window ends a phrase on the root |
| 8 | `low-e-ladder` | `choice` | D form (closer) | Frets 0, 3, 5, 8, 10 on the low E are the five forms' barre frets |

Every question gets an `explanation`. `fretboard` is graded all-or-nothing, so Q5 asks only for a
fact the chapter states explicitly and completely. No `multi-select` is planned; if one is added it
must meet the same bar.

---

## As built — final word counts

| Lesson | Words | `readingTimeMin` | `estimatedMin` in the curriculum |
| ------ | ----- | ---------------- | -------------------------------- |
| `caged-seconds-and-sixths` | 839 | 5 | 6 |
| `caged-pentatonic-c-form` | 561 | 3 | 4 |
| `caged-pentatonic-a-form` | 620 | 4 | 5 |
| `caged-pentatonic-g-form` | 827 | 5 | 6 |
| `caged-pentatonic-e-form` | 666 | 4 | 5 |
| `caged-pentatonic-d-form` | 818 | 5 | 6 |
| `caged-land-on-the-chord-tones` (activity) | — | — | 9 (optional) |

Chapter total, counted sections only: **32 minutes**; 41 including the optional drill. The pathway's
`estimatedMin` was left at its placeholder, as chapters 1 and 2 did — the top-level agent recomputes
it at the end.

## The checkpoint as built — 8 questions

Written after all six articles were read, from what they actually say. The sketch survived intact.

| # | Question id suffix | Kind | Draws on | Tests |
| - | ------------------ | ---- | -------- | ----- |
| 1 | `what-it-adds` | `choice` | Opener | The pentatonic is the triad plus two more per octave — `1 2 3 5 6`, no new shapes |
| 2 | `which-are-chord-tones` | `choice` | Opener + every form lesson | **Three** of the five are the chord; the `2` and the `6` are not |
| 3 | `caged-not-boxes` | `choice` | Opener | The visualizer's Boxes toggle is a different tiling, not the same windows relabelled |
| 4 | `c-form-open-strings` | `choice` | C form | String 2 breaks the open-string pattern; its open note is not in this scale |
| 5 | `fret-five` | `fretboard` | A form | Mark all six pentatonic notes at fret 5, `frets: 5` |
| 6 | `relative-minor` | `choice` | G form | Same five notes as A minor pentatonic; the note you resolve to decides which |
| 7 | `e-form-landing` | `choice` | E form | Which position in the E form window ends a phrase on the root (`4·10`) |
| 8 | `low-e-ladder` | `choice` | D form (closer) | Frets 0, 3, 5, 8, 10 on the low E are the five forms' barre frets |

Every question has an `explanation`. `fretboard` is graded all-or-nothing, so Q5 asks only for a
fact the chapter states explicitly and completely. No `multi-select` was used: the facts that would
have suited one (which degrees a window triples) are the kind a learner reads off a table rather
than understands, and all-or-nothing grading makes that an unfair question.

Question 4's option D ("all six open strings are notes of this scale") and question 8's option B
("every `C` on the low E string") are the two distractors that encode a specific wrong belief a
learner would actually hold. Question 3's option B — "same shapes, different labels" — is the exact
misconception the app trap creates.

## Errors found and fixed during review

Every article was read as written. Six real problems were found and corrected by hand; the two
lesson agents both reported finding nothing wrong with the plan, which is why this pass matters.

1. **C form — a factual error that breached the chapter's hardest scope rule.** A `tip` told the
   learner to "strum all six open strings" and said two of the six ringing notes were not chord
   tones. But the open string 2 is not in the C major pentatonic **at all** — and it is one of the
   two notes chapter 4 is supposed to introduce. As written the lesson quietly handed the learner a
   note this chapter is under instruction not to teach. Rewritten to name the five open strings the
   window actually uses and to say explicitly to leave string 2 out.
2. **C form — the planned title was wrong** ("Six Open Strings"), for the same reason. Changed to
   "Five Strings Ring Open".
3. **A form — "the first window in this chapter you can play without shifting"**. False: the C form
   window (frets 0–3) also sits under one hand. Claim removed.
4. **A form — "triples the `6` … more than any degree except the `5`"**, and "leans on the `6`
   harder than any other form in the chapter". Both wrong: the A form triples the `5` **and** the
   `6`, three each, and the G form also carries three `6`s. Rewritten to state the tripled-pair rule
   properly and to hand the `6` lean forward to the G form rather than claiming exclusivity.
5. **E form — "more `1`s … than any other window"**. False: the G form also has three. Rewritten to
   claim only what is true — that no other window triples both the `1` and the `2`.
6. **D form — "Strings 4 and 1 both have their upper dot at fret 12"**. True but weak: five of the
   six strings do, and only string 2 sits at 13, which is what actually makes the point. Also a
   grammar fix ("the window below it's upper dot").

Smaller corrections: the opener contradicted itself on window width ("four frets at most", then
correctly noting the D form spreads wider); the opener attributed chapter 2's fragment argument to
uneven dot scatter, when chapter 2's actual reason was barre reach; the G form used "blues run",
which the scope guard rules out; the A form's `readingTimeMin` was 3 for a 620-word article.
Four articles had no article back-link to their own form's earlier layers, which is the pathway's
spine — one was added to each.

**Verification method.** After editing, all six articles were machine-checked against the computed
tables: every `string·fret` token in the prose (151 of them) was confirmed to be a pentatonic note,
and every "`string·fret` — degree, note" table cell (60 of them) was confirmed to carry the right
degree and the right note name. Every `code`-marked span was scanned for a forbidden degree or note
name. All clean.

## Judgement calls recorded here

- **The brief's chord-tone count was wrong and was corrected.** It said two of the five notes are
  chord tones and three are not. It is the other way round: `1 3 5` is three, `2 6` is two. Every
  lesson and the checkpoint use the correct version.
- **The chapter-level load was distributed rather than piled on the D form.** Chapter 2 reported
  that its D form lesson's own character got squeezed by carrying the whole join-up. Here the opener
  takes the frame and the app trap, the A form takes the fret-5 fact, the G form takes the
  relative-minor argument, and the D form closes with only two facts. The D form lesson still runs
  818 words and spends its first half on the D form itself.
- **The relative minor got a substantial section, not a footnote.** The brief suggested a footnote.
  Once the G form window turned out to be the famous box *exactly* — twelve positions, no extras,
  no omissions — a footnote would have wasted the strongest hook in the chapter. It is bounded by an
  explicit scope guard and no lesson mentions minor anywhere else.
- **No footnotes were used anywhere in the chapter.** The one candidate became the G form section.
- **`caged-ladder` is used nowhere**, as in chapter 2, and for a sharper reason here: it marks roots
  only, and this chapter's closer argues about the notes that are *not* roots. Four tables carry it.
- **The "two notes still missing" hint is geometric only.** The D form's closing callout says the
  two three-fret steps are where chapter 4's notes will land. No degree number, no note name. This
  was a deliberate risk: it makes the nesting visible, and a determined learner could work the notes
  out, but nothing in the chapter teaches or names them.
- **Every window's twelve dots are pitch-distinct**, which let the activity ask for a whole window
  in one round — something chapter 1 could not do at all and chapter 2 could only do for a grip.
- **The `2` and `6` are never called "passing notes" or "colour tones" as jargon.** The lessons say
  what they do — they keep a line moving, where chord tones make it arrive — rather than naming a
  category the pathway would then have to maintain.
