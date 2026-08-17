# Chapter 1 — Where Minor Comes From

Chapter id `minor-caged.ch1` · slug `where-minor-comes-from` · 6 articles, 1 activity, 1 checkpoint.

After this chapter the learner can derive A natural minor from C major two different ways, knows
which of the two questions each derivation answers, can say why the same seven notes do not
automatically sound minor, and has seen the one window that is C major's G form and A minor's E form
at the same time.

This is the chapter that ties the pathway to `caged-fretboard`, and it is where the "there is no such
thing as minor CAGED" objection gets answered.

---

## Verified facts this chapter is built on

Every number below was **recomputed** from the app's own `cagedFormWindows` / `cagedMarks`
(`mobile/src/lib/guitar-positions/caged.ts`) and from `estimateKey`
(`mobile/src/lib/key-analysis/`), not remembered. **These are the numbers every lesson must use.**
String numbering is **1 = high e, 6 = low E** everywhere.

### The two scales

| Scale | Notes | Degrees |
| --- | --- | --- |
| C major | `C D E F G A B` | `1 2 3 4 5 6 7` |
| A natural minor | `A B C D E F G` | `1 2 b3 4 5 b6 b7` |
| A major | `A B C# D E F# G#` | `1 2 3 4 5 6 7` |

- **Relative**: C major read from its sixth degree *is* A natural minor. Identical seven pitches.
- **Parallel**: A major → A minor drops exactly three notes by a semitone — `C#→C`, `F#→F`,
  `G#→G`, which is `3→b3`, `6→b6`, `7→b7`.
- A is a **minor third (three semitones) below C**. Every major scale's relative minor sits three
  semitones below its root.

### The two tilings — the closer's whole content

```
C major:  C 0–4   A 2–6   G 4–8   E 7–11  D 9–13
A minor:  A 0–3   G 1–5   E 4–8   D 6–10  C 9–13
```

Both verified by running `cagedFormWindows`. Note content of the neck is **identical** — same seven
pitch classes — but the two sets of windows are different, because a window is a fret span
**anchored on its own root**, and A is three semitones below C.

**Every A-minor window sits exactly three frets lower than the C-major window of the same letter.**
Check it: C major's E form is `7–11`, A minor's is `4–8`. C major's G form is `4–8`, A minor's is
`1–5`. C major's D is `9–13`, A minor's is `6–10`. C major's C is `0–4`; A minor's C is the same
window three frets lower with twelve added back, `9–13`. C major's A form is `2–6`; A minor's A form
would be `-1–3` and is **clamped by the nut to `0–3`** — four frets wide, not five. **No lesson may
call A minor's A form a five-fret window.** (Chapter 1 does not need to draw it at all.)

**Exactly two spans coincide.** Verified by comparing all 25 pairs:

| Span | Is | And is |
| --- | --- | --- |
| frets `4–8` | C major's **G form** | A minor's **E form** |
| frets `9–13` | C major's **D form** | A minor's **C form** |

Both were checked dot for dot: at the `scale` layer each of those spans holds **17 dots at exactly
the same 17 positions**, labelled differently in the two readings. The `4–8` table, verified:

| Position | Note | In C major | In A minor |
| --- | --- | --- | --- |
| `6·5` | `A` | `6` | `1` |
| `6·7` | `B` | `7` | `2` |
| `6·8` | `C` | `1` | `b3` |
| `5·5` | `D` | `2` | `4` |
| `5·7` | `E` | `3` | `5` |
| `5·8` | `F` | `4` | `b6` |
| `4·5` | `G` | `5` | `b7` |
| `4·7` | `A` | `6` | `1` |
| `3·4` | `B` | `7` | `2` |
| `3·5` | `C` | `1` | `b3` |
| `3·7` | `D` | `2` | `4` |
| `2·5` | `E` | `3` | `5` |
| `2·6` | `F` | `4` | `b6` |
| `2·8` | `G` | `5` | `b7` |
| `1·5` | `A` | `6` | `1` |
| `1·7` | `B` | `7` | `2` |
| `1·8` | `C` | `1` | `b3` |

**Why exactly two, and not five.** Shift the whole C-major ladder down three frets and each form
lands on the span of whichever form sits three frets *above* it in C. Reading C major's window starts
— C `0`, A `2`, G `4`, E `7`, D `9`, then C again at `12` — the only gaps of three are `G→E` and
`D→C`. So exactly two forms find a partner, and the other three land in gaps of two where nothing
is. A lesson may state this reasoning or may simply state the two coincidences; it may **not** say
"A minor's boxes are C major's boxes".

### The fret-5 pentatonic reconciliation (closer, one paragraph, no more)

Inside the `4–8` window the pentatonic layer holds **12 dots, on frets 5, 7 and 8 only** — verified.
That is exactly the shape a self-taught player calls "the A minor pentatonic at fret 5". It is
simultaneously C major pentatonic and A minor pentatonic (the same five pitch classes) and it is
simultaneously C major's G form and A minor's E form. **Name this once, in the closer, in one
paragraph. Do not teach the pentatonic** — that is chapter 3.

### The key detector, verified against the app's own engine

`estimateKey` was run on hand-built progressions. Both come back **`confident`**:

| Loop | Verdict | Runner-up |
| --- | --- | --- |
| `C` `F` `G` `C` | **C major** | F major, A minor |
| `Am` `F` `G` `Am` | **A minor** | C major |

Every chord in both loops is built from the same seven notes, and the two middle chords are
**identical**. Only the chord the loop starts and ends on differs. This is the hearing lesson's
demonstration and it is safe to promise, because the engine scores a first-chord tonic and a
last-chord tonic explicitly. `Am` `Dm` `Em` `Am` also returns A minor, confidently, if a lesson wants
a second loop — but the `C F G C` / `Am F G Am` pair is stronger because the middle is shared.

### The window-edge effect (background — chapter 2 owns it)

For A, the triad layer holds: A form 6 major dots / 7 minor; G form 7 / 8; E form 7 / 8; D form 7 / 7;
C form 8 / 7. The counts differ because a `3` on the window's bottom fret flattens *out* of the
picture and a `b3` above the top fret steps *in*. **Chapter 1 does not teach this and must not print
"the same picture with one dot moved".** It is listed here only so no lesson stumbles into it.

---

## What is guitar-specific about this chapter

Stated so no lesson drifts into generic keyboard theory:

- The relative relationship is the reason this pathway is cheap: the dots are already on the neck
  from `caged-fretboard`. Nothing new has to be memorised — the map gets re-labelled.
- The parallel relationship is the reason each *shape* will make sense: a minor form is its major
  form with the third lowered a fret, which is a physical move on a fretboard and no move at all on
  a keyboard.
- A window is a fret span anchored on its root, which is why the two tilings are three frets apart —
  a fact with no meaning anywhere but on a neck.
- The `4–8` coincidence is the single most useful thing a self-taught guitarist can be told about
  minor: two things they already half-know are the same dots.

---

## Scope guards

- **Do not teach any individual minor form's shape.** Chapter 2 owns all five, in strict C-A-G-E-D
  order, plus the window-stays-third-moves rule. Chapter 1 may say a window is anchored on its root;
  it may not draw or describe a minor grip.
- **Do not name which forms the learner already plays.** Chapter 2's opener owns that hand-off.
  Lesson 5 may tease it in one clause without naming a form or a fret.
- **No `caged-shape` block anywhere in chapter 1.** It draws one form, which is chapter 2's job. The
  chapter's only CAGED diagrams are `caged-ladder`.
- **No pentatonic teaching** (chapter 3), **no `b6` as "the darkest note"** (chapter 4), **no chords
  of the key, no Roman numerals, no raised seventh, no harmonic minor** (chapter 5).
- **"The three flattened notes" is a chapter 1 phrase about the scale.** It is true of the whole
  natural minor scale and false of the minor pentatonic, which has `b3` and `b7` and no `b6`.
  Lesson 2 must say *which* three degrees and say it about the scale, so chapter 3 is not trapped.
- **Never "Aeolian" in prose, never "mode", never "m3".** `scale-compare`'s own card prints
  "Aeolian" as the app's character line; lesson 1 defuses that in a footnote (see below) and no other
  lesson mentions it.
- **A major appears in lesson 2 only.** Everywhere else it is A minor with C major as its relative.
- **No `url` links anywhere in this chapter.**

## Superlatives this chapter is allowed

Recomputed here; nothing else may be claimed as an "only" or a "most".

- **Exactly two** of the five windows coincide between C major and A minor (all 25 pairs checked).
- The `4–8` window is the **lowest** of the two coincidences and the one that reconciles CAGED with
  "A minor pentatonic at fret 5".
- The third is **the one note** that decides major or minor. (True of the triad; say it about the
  third, not about "one note in the scale".)

---

## The lessons

Six articles, in order. Slugs and section ids are fixed here. Section ids are progress keys and are
never renamed.

Every article: `schemaVersion: 1`, `publishedAt: "2026-08-14"`, `tags: ["caged", "minor"]`,
`readingTimeMin` = ceil(words ÷ 200) with a floor of 2. `meta.slug` equals the filename stem. The
title is `meta.title` and **no article opens with a heading block**.

---

### 1. `minor-caged-the-same-seven-notes` — "The Same Seven Notes"

- **Section id**: `minor-caged.ch1.the-same-seven-notes` ·
  **Article id**: `art_minor-caged-the-same-seven-notes`
- **Length**: 550–700 words
- **Left by the previous lesson**: nothing. This is the first lesson of the pathway.
- **The one thing it teaches**: A natural minor is C major started from its sixth degree — the same
  seven notes, a different home — and that derivation answers the question *where are the notes*.
- **The misconception it corrects**: "a minor scale is a different set of notes from every major
  scale."

**Key points, in order**

1. Open on the fact, not on a preamble: the notes of A natural minor are `A B C D E F G`. There is
   not a sharp or a flat in it. It is the C major scale, started somewhere else.
2. Show it: write C major `C D E F G A B`, then count to the sixth note, `A`, and read from there,
   wrapping round. Same seven pitches, nothing added, nothing removed. This is called the
   **relative** relationship — A minor is C major's **relative minor**, C major is A minor's
   **relative major**.
3. The distance, stated as a rule the learner can reuse: a major scale's relative minor starts three
   semitones — a minor third — **below** its root. `C` down three semitones is `A`. It works for
   every key.
4. **The question this answers.** Relative is the answer to *where are the notes*. It tells you
   nothing about why one sounds different from the other; there is a second derivation for that, and
   the next lesson has it. Set that up explicitly, because the whole chapter runs on keeping the two
   apart.
5. **The prerequisite, one sentence**: if you have worked through
   [`caged-what-the-letter-means`](article link) you already have every note in this pathway on the
   neck — that pathway is strongly recommended before this one, because this one leans on it
   throughout. Do not summarise CAGED; just link it.
6. **Why this makes the pathway cheap**, in a short paragraph: the dots are already there. What
   changes is not the map but which dot the map is drawn around. Say plainly that nothing in this
   chapter asks the learner to learn a new note.
7. The two `live` blocks, adjacent — `scale-compare` `{ "root": "C", "scales": ["major"] }` then
   `scale-compare` `{ "root": "A", "scales": ["minor"] }`. Point out what to look at: the chips hold
   the same seven letters in both cards, rotated, and the small degree labels underneath are the
   thing that changed — `1 2 3 4 5 6 7` against `1 2 b3 4 5 b6 b7`. Play both.
8. Close pointing at the parallel derivation: the same-notes story cannot explain why the two sound
   different, because it is the same notes. The next lesson keeps the home and moves the notes
   instead.

**Blocks / components**

- `live` · `scale-compare` · `{ "root": "C", "scales": ["major"] }`
- `live` · `scale-compare` · `{ "root": "A", "scales": ["minor"] }`
- A `table` for the two scales side by side (note row and degree row), or a `list` — one, not both.
- One `callout` (`info`): relative answers *where are the notes*, and nothing else.
- One **footnote**, the chapter's only one: the card above calls this scale "Natural minor —
  Aeolian"; both names mean the same seven notes and this pathway says **natural minor**
  throughout. One sentence. Do not use the word "mode".
- Article link to `caged-what-the-letter-means`. Screen link to `/scale-visualizer` (Scale
  Visualizer) — set the root to `A` and the scale to natural minor and it is the same board as
  C major with a different note lit as home.

**Do not**: mention `b3`, `b6`, `b7` as a *change* (that is lesson 2 — you may print the degree row
of the minor scale, which is what the diagram prints); mention windows, forms or frets; mention A
major; mention chords.

---

### 2. `minor-caged-the-three-that-drop` — "The Three Notes That Drop"

- **Section id**: `minor-caged.ch1.the-three-that-drop` ·
  **Article id**: `art_minor-caged-the-three-that-drop`
- **Length**: 550–700 words
- **Left by lesson 1**: A minor and C major are the same seven notes; "relative" is the name; it
  answers *where are the notes*; a relative minor is three semitones below its major.
- **The one thing it teaches**: the other derivation — keep the root, lower the third, sixth and
  seventh by a semitone each — and that this is the one that answers *what changed about the sound*.
- **The misconception it corrects**: "relative and parallel are two words for the same thing", and
  its practical form, "A minor and C minor are both just C major moved."

**Key points, in order**

1. Open on the problem lesson 1 left: same notes cannot explain a difference in sound. So compare
   two scales that **do** differ, on the same root.
2. A major is `A B C# D E F# G#`. A minor is `A B C D E F G`. Same root, same first, second, fourth
   and fifth. Three notes drop by one semitone: `C#→C`, `F#→F`, `G#→G`.
3. **In degrees**, which is the form that transposes: `3→b3`, `6→b6`, `7→b7`. This is the
   **parallel** relationship — A major and A minor are parallel keys, sharing a home rather than a
   note set.
4. **The question this answers.** Parallel is the answer to *what changed about the sound*. Put the
   two derivations in one small `table` — what is kept, what moves, what question it answers — and
   say the sentence the chapter exists for: **both are true, and they are answers to different
   questions.** Reaching for the wrong one is where learners get lost.
5. The `live` block: `scale-compare` `{ "root": "A", "scales": ["major", "minor"] }`. A major is the
   reference card, so the three notes minor has that major doesn't are tinted **amber**. Tint the
   words `C`, `F` and `G` amber in the prose so the two agree. Say what to do: play one, then the
   other, and the first thing that changes is the third note.
6. **The careful sentence**, and it matters for the rest of the pathway: *the natural minor scale*
   has three flattened degrees. That is a fact about the whole scale, not a definition of minor —
   later chapters work with a five-note version that keeps the `b3` and the `b7` and leaves the
   `b6` out entirely. Say this in one sentence and do not elaborate.
7. Practical note, one paragraph: the parallel comparison is the one to hold in your head when you
   want to *change* the sound of something you already play, because the root stays put. The
   relative comparison is the one to hold when you want to know where the notes are.
8. Close pointing at the next lesson: three notes dropped, but they do not carry equal weight — one
   of them is doing almost all of the work.

**Blocks / components**

- `live` · `scale-compare` · `{ "root": "A", "scales": ["major", "minor"] }`
- `table` — the two derivations: row per derivation, columns "keeps" / "moves" / "answers".
- One `callout` (`warning`): relative and parallel are not the same idea; naming which one you mean
  is most of the battle.
- Screen link to `/scale-visualizer` (Scale Visualizer).

**Do not**: introduce a third scale; mention the minor pentatonic by name; mention windows, forms,
frets or chords; call the `b6` dark (chapter 4 owns that); say "the three flattened notes" without
saying *of the scale*.

---

### 3. `minor-caged-the-flat-third` — "The Note That Makes It Minor"

- **Section id**: `minor-caged.ch1.the-flat-third` · **Article id**: `art_minor-caged-the-flat-third`
- **Length**: 500–650 words
- **Left by lesson 2**: `3→b3`, `6→b6`, `7→b7`; the word "parallel"; the two derivations and the
  question each answers; that the pathway will later use a version without the `b6`.
- **The one thing it teaches**: of the three notes that dropped, the **third** is the one that
  decides the quality — a chord and a scale are minor because of the `b3`. The `b6` and `b7` colour
  it.
- **The misconception it corrects**: "you need all three flattened notes before it counts as minor."

**Key points, in order**

1. Open on the asymmetry: three notes dropped, and they are not equal partners. Drop only the third
   and everything already sounds minor. Drop only the sixth and it does not.
2. **Why**, in terms the learner already has from `caged-fretboard`: a chord is a root, a third and
   a fifth. The root says which chord it is. The fifth is the same in both. So the third is the only
   note left that can carry the difference — `A C# E` against `A C E`. It is not a metaphor; it is
   an accounting.
3. State the minor triad as `1 b3 5` and give it a name the pathway will use constantly. Say that
   this is the layer chapter 2 puts into the five windows — a forward pointer, not a lesson.
4. **The `b6` and the `b7` are colour, not identity.** They are in the scale, they are not in the
   chord, and a piece that only ever touches `1 b3 5` is already minor. This is the precise version
   of the sentence lesson 2 flagged.
5. **What "major" and "minor" actually name**, said plainly and without overclaiming: two chords on
   the same root with the third three semitones up rather than four. The difference is a real
   acoustic one — a minor triad is slightly rougher and its root slightly less clearly defined than
   a major triad's. What it *means* is another matter: the usual "minor sounds sad" is largely
   something listeners learn from the music around them rather than something the notes contain, and
   this pathway is not going to hand it to you as a fact. **This paragraph is bounded — see the
   research note below and do not exceed it.**
6. Practical: [`/ear-trainer`](screen link) (Ear Trainer) will drill the interval itself, and
   [`/chord-detector`](screen link) (Chord Detector) will tell you whether what you played came out
   minor. One sentence each.
7. Close pointing at the hearing lesson: knowing which note makes a chord minor does not tell you why
   seven notes that never change can sound like two different keys.

**Research note, binding.** The `triads` pathway did a research pass and its findings govern here:
say the acoustic difference is real and established; **do not** say the sadness is. Do not write that
most people cannot hear major versus minor, that minor gets confused with diminished, or that a major
chord in a minor context is heard as minor — all three are contradicted by the evidence. Keep the
whole discussion to one paragraph plus at most one callout.

**Blocks / components**

- No `live` block is required. If one is used, `scale-compare`
  `{ "root": "A", "scales": ["major", "minor"] }` has already been spent in lesson 2 — do not repeat
  it. Prefer prose plus screen links here; this is the chapter's one short, argumentative lesson.
- One `callout` (`tip`): the third is the note to listen to, because it is the only one that changed
  inside the chord.
- Screen links to `/ear-trainer` and `/chord-detector`.

**Do not**: draw any shape; name a fret; teach an inversion; teach the diminished or augmented triad;
say "m3"; promise the learner a feeling.

---

### 4. `minor-caged-what-decides-home` — "Same Notes, Different Home"

- **Section id**: `minor-caged.ch1.what-decides-home` ·
  **Article id**: `art_minor-caged-what-decides-home`
- **Length**: 600–750 words
- **Left by lesson 3**: the `b3` carries the quality; `1 b3 5` is the minor triad; the `b6` and `b7`
  are colour; the acoustic difference is real and its meaning is learned.
- **The one thing it teaches**: a set of notes has no key. What makes seven notes sound like C major
  or like A minor is what the music leans on — the bass note, the chord underneath, and the note the
  phrase keeps returning to.
- **The misconception it corrects**: the one this chapter was built against — "A minor is just C
  major starting on A, so if I play C major shapes it will sound minor."

**Key points, in order**

1. Open on the misconception in the learner's own words, and grant the half of it that is true: yes,
   the notes are the same; no, that does not mean the sound is. Playing the C major scale from A
   does not make anything minor.
2. **What actually decides it.** The ear takes its home from emphasis, not from the note list: what
   the bass sits on, what the chords are built from, which note a phrase keeps landing on, and which
   note the music stops on. Give this as a short unordered `list` — four things — because it is the
   lesson's operative content.
3. **The demonstration, which is the centre of the lesson.** Two four-chord loops built from nothing
   but the seven shared notes:
   - `C` `F` `G` `C`
   - `Am` `F` `G` `Am`
   The two middle chords are **identical**. Only the chord the loop begins and ends on differs, and
   that is enough to move the key. Say that this was checked against
   [`/key-detector`](screen link) (Key Detector), which calls the first C major and the second A
   minor, both confidently — enter each loop and watch. Give the loops as a `table` or a `list`, not
   as a grip chart.
4. **The drone**, framed honestly as task design rather than as a proven ear exercise: hold an `A`
   with [`/drone`](screen link) (Drone), play only the seven notes, and the drone nails the root
   down so you cannot fool yourself by tracking the bass. Then hold a `C` and play the same seven
   notes. Nothing in your hand changes; everything in the sound does.
5. **The consequence for this pathway**, stated as the reason the next four chapters exist: if the
   home is A, the chord underneath has to be an A minor chord, and the notes you lean on have to be
   its notes. Shapes rooted on C will keep pulling the ear back to C. That is why re-labelling the
   C major map is not enough on its own.
6. One honest limit: a bare scale run or a two-chord loop can be genuinely ambiguous, and real music
   settles it with time, repetition and where the phrase stops. Do not oversell the effect.
7. Close pointing at the objection lesson: given all that, is there even such a thing as minor CAGED?
   A lot of good teachers say no.

**Research note, binding.** Same as lesson 3. What may be stated as established: that a perceived
key comes out of emphasis — duration, repetition, what the bass carries, what the phrase lands on —
rather than out of the raw note set. What may **not** be stated: that minor means sad, that a drone
measurably improves anyone's ear (the honest framing is task design — it nails the root so the task
cannot be solved by tracking the bass), or that most people cannot tell major from minor.

**Blocks / components**

- `list` — the four things that decide home.
- `table` or `list` — the two loops, side by side.
- One `callout` (`tip`): the two loops share their two middle chords; only the chord they start and
  end on changes.
- Screen links to `/key-detector` and `/drone`.
- **No `live` block.** Nothing in the registry can play a progression, and `scale-compare` would
  make the opposite point. (Reported upward as a component gap — see the chapter report.)

**Do not**: name a chord outside `C`, `F`, `G`, `Am` (and `Dm`/`Em` are **not** licensed — the chords
of the minor key are chapter 5); use Roman numerals; teach chord function or cadences; mention
windows or forms; give any grip chart.

---

### 5. `minor-caged-is-there-minor-caged` — "Is There Even Such a Thing?"

- **Section id**: `minor-caged.ch1.is-there-minor-caged` ·
  **Article id**: `art_minor-caged-is-there-minor-caged`
- **Length**: 550–700 words
- **Left by lesson 4**: a note set has no key; emphasis decides home; a minor home needs a minor
  chord under it; re-labelling the major map is not enough on its own.
- **The one thing it teaches**: the common objection — "there is no such thing as minor CAGED, learn
  the major forms and re-root them" — is right about the **notes** and wrong about the **chords**.
- **The misconception it corrects**: both sides of it. "Minor is a whole separate system I have to
  learn from scratch", and "minor is nothing, just play the major shapes."

**Key points, in order**

1. State the objection in its strongest form, in the first two sentences, without softening it. Many
   good teachers say there is no minor CAGED: learn the five major forms, and if you want A minor,
   play the C major forms and think of A as home. Say that they have a real point.
2. **Where they are right.** The notes on the neck genuinely are the same notes. Every dot of A
   natural minor is a dot the learner already has from C major. If all you want is *which notes are
   available*, re-rooting really is enough, and the previous lessons proved it.
3. **Where they are wrong, and this is the lesson's claim.** CAGED is a **chord** system first — the
   five letters are five open chord shapes. A form is a place a chord's root, third and fifth sit
   across the strings. And there is no A minor chord anywhere in a C major form, because a C-major
   form contains `C E G` around a C root. To play `Am` you need a shape whose root is A **and** which
   contains a `b3` — a `C` sitting a minor third above that root, not a major third above a C root.
4. Make it concrete without teaching a shape: the note `C` is in both. What differs is what it is
   *doing* — in a C chord it is the root; in an `Am` chord it is the `b3`. Same fret, different job.
   That is why the two need different shapes even though they share every note.
5. **So there are five.** Five shapes rooted on A, each containing a `b3`, one per window. That is
   what chapter 2 is: not a new map, a second set of chord shapes on the map the learner already has.
   Tease in one clause that one of the five is a chord they have played since their first week, and
   **do not say which** — chapter 2's opener hands that over.
6. The `live` block: `caged-ladder` `{ "root": "A", "quality": "minor" }` as the destination. Say
   what it is — five labelled bands, every `A` on the neck lit — and say the learner is not expected
   to read it yet. Note that the bands are exactly where A **major**'s would be, because a window is
   a fret span anchored on its root and the root did not move. That anchoring fact is the one thing
   this lesson must leave for the closer and for chapter 2.
7. Name the naming convention, once, since the diagram prints it: this pathway keeps the form letter
   bare and puts the quality on the chord — "the E form of A minor", never "the Em form".
8. Close pointing at the closer: the notes are shared and the chords are not, which raises an obvious
   question about the windows themselves. Do they line up?

**Blocks / components**

- `live` · `caged-ladder` · `{ "root": "A", "quality": "minor" }`
- One `callout` (`info`): right about the notes, wrong about the chords.
- Article link back to `caged-what-the-letter-means` or `caged-root-ladder` where it earns its place
  — at most one.
- Screen link to `/chord-shapes` (Chord Shapes) — every voicing of `Am`, for anyone who wants to look
  ahead. One sentence.

**Do not**: draw a `caged-shape`; name any of the five minor forms; give a fret number for a form;
give a grip chart; name which forms the learner already plays; teach the window-stays-third-moves
rule (chapter 2's opener owns it — you may say a window is anchored on its root, and stop).

---

### 6. `minor-caged-one-window-two-names` — "One Window, Two Names"

- **Section id**: `minor-caged.ch1.one-window-two-names` ·
  **Article id**: `art_minor-caged-one-window-two-names`
- **Length**: 700–850 words. The longest of the six; it carries the chapter.
- **Left by lesson 5**: the objection and its answer; CAGED is a chord system first; there are five
  A-minor shapes; a window is a fret span anchored on its root.
- **The one thing it teaches**: the same notes get carved into a **differently placed** set of five
  windows, three frets apart, and **exactly two** of the ten spans coincide — frets `4–8` and frets
  `9–13`.
- **The misconception it corrects**: "same notes, so same boxes."

**Key points, in order**

1. Open on the obvious guess and kill it: if the notes are identical, surely the boxes are identical.
   They are not. Three of the five sit somewhere else entirely.
2. **Restate the anchoring fact as the reason**, in one sentence: a window is a five-fret span
   positioned by the chord's **root**, and `A` is three semitones below `C`. So every A-minor window
   sits three frets lower on the neck than the C-major window with the same letter.
3. **The two ladders**, as a `table` — one row per form letter, a column for C major's span and a
   column for A minor's. Use the verified numbers unchanged. Define the position shorthand here in
   one clause: `5·3` means string 5, fret 3, string 1 being the high `e`.
4. **The two `live` blocks, adjacent**: `caged-ladder` `{ "root": "C" }` then `caged-ladder`
   `{ "root": "A", "quality": "minor" }`. Same neck, same dots underneath, two different sets of
   bands. Say exactly what to compare: the band edges, not the roots.
5. **The two coincidences**, which is the lesson's payload:
   - frets **`4–8`** are C major's **G form** and A minor's **E form**.
   - frets **`9–13`** are C major's **D form** and A minor's **C form**.
   Nothing else lines up. Say it was checked, all twenty-five pairs, exactly two.
6. **Why only two.** Shifting the ladder down three frets only finds a partner where two of C major's
   windows already sit three frets apart — and reading the starts `0, 2, 4, 7, 9` and then `12`, the
   only gaps of three are `G→E` and `D→C`. One short paragraph. It is optional depth; the two facts
   above are the load-bearing part.
7. **The `4–8` window read twice**, as a `table` — the seventeen positions with a note column, a
   "in C major" degree column and an "in A minor" degree column. Use the verified table above,
   unchanged, in reading order. Then the sentence that earns it: **the dots do not move; the labels
   do.** The `C` that was the `1` of C major is the `b3` of A minor. The `A` that was the `6` is the
   `1`.
8. **The reconciliation**, one paragraph and no more. Inside that same `4–8` window, the five-note
   version everybody already plays sits on frets 5, 7 and 8 — twelve dots — and that is exactly what
   a self-taught player calls "the A minor pentatonic at fret 5". It is the same dots as CAGED's G
   form of C major. Two things the learner may have known separately for years are one thing. Do not
   teach the pentatonic; chapter 3 does.
9. Send them to [`/scale-visualizer`](screen link) (Scale Visualizer): set the root to `A` and the
   scale to natural minor, leave the position system on CAGED, and page through — the pager says
   "E form" over frets `4–8`. Then switch the root to `C` and major and page again; the same span is
   labelled "G form". The app agrees with the lesson by construction.
10. Close on the chapter, and on chapter 2 by name: five windows, five A-minor chord shapes, and the
    only thing that has to move to get them is the third.

**Blocks / components**

- `table` — the two ladders, form by form.
- `live` · `caged-ladder` · `{ "root": "C" }`
- `live` · `caged-ladder` · `{ "root": "A", "quality": "minor" }`
- `table` — the seventeen positions of frets `4–8`, both readings.
- One `callout` (`tip`): the dots do not move; the labels do.
- Screen link to `/scale-visualizer`.
- Article link to `caged-root-ladder` where it earns its place, at most once.

**Do not**: say "A minor's boxes are C major's boxes"; call A minor's A form five frets wide (it is
clamped to `0–3`); use `caged-shape`; teach the pentatonic beyond the single paragraph at point 8;
teach any minor grip; transpose out of A minor / C major.

---

## The activity

### `minor-caged-play-both-roads` — "Drill: Play Both Roads"

- **Section id**: `minor-caged.ch1.play-both-roads` ·
  **Activity id**: `act_minor-caged-play-both-roads`
- `kind: "note-play"`, `modes: ["easy", "hard"]`, document `board: { fretFrom: 0, fretTo: 12 }`.
- Section **must** set `"optional": true`. `estimatedMin: 8`.

Every round is `ordered: true` — each one is a journey, not a set. Everything stays on strings 5 and
4 so the two scale runs are visibly the same dots.

**Pitch check, worked.** String 5 open is MIDI 45, string 4 open is 50. Every round below is
pitch-distinct:

| Round id suffix | Prompt gist | Targets (string·fret) | MIDI |
| --- | --- | --- | --- |
| `a-minor` | A natural minor, one octave, strings 5 then 4 | 5·0, 5·2, 5·3, 5·5, 5·7, 5·8, 4·5, 4·7 | 45 47 48 50 52 53 55 57 |
| `c-major` | C major on the same two strings — six of the eight dots are the ones you just played | 5·3, 5·5, 5·7, 5·8, 4·5, 4·7, 4·9, 4·10 | 48 50 52 53 55 57 59 60 |
| `the-three-that-drop` | A major's `3`, `6` and `7`, each followed by A minor's | 5·4, 5·3, 5·9, 5·8, 5·11, 5·10 | 49 48 54 53 56 55 |
| `the-minor-triad` | `1`, `b3`, `5` — the three notes of an `Am` chord | 5·0, 5·3, 4·2 | 45 48 52 |

The third round is the parallel derivation as a physical move: `C#` then `C`, `F#` then `F`, `G#`
then `G`, all on the A string, each pair one fret apart. The fourth is the chapter's one look
forward.

---

## The checkpoint

`minor-caged-ch1-checkpoint` · section id `minor-caged.ch1.checkpoint` ·
`meta.kind: "checkpoint"` · `passThresholdPct: 70` on both the quiz meta and the chapter checkpoint.

Written **after** the articles are read, from what they actually say. Sketch — 8 questions:

| # | Question id suffix | Kind | Draws on | Tests |
| - | ------------------ | ---- | -------- | ----- |
| 1 | `same-seven-notes` | `choice` | Lesson 1 | What is different between C major and A natural minor if the notes are identical |
| 2 | `which-question` | `choice` | Lessons 1 + 2 | Which derivation answers "what changed about the sound" |
| 3 | `three-that-drop` | `multi-select` | Lesson 2 | Which degrees drop a semitone from A major to A minor (`3`, `6`, `7`) |
| 4 | `what-makes-it-minor` | `choice` | Lesson 3 | The `b3` carries the quality; you do not need all three |
| 5 | `what-decides-home` | `choice` | Lesson 4 | Why the same seven notes can sound like two keys |
| 6 | `the-objection` | `choice` | Lesson 5 | Right about the notes, wrong about the chords |
| 7 | `two-windows` | `choice` | Lesson 6 | Frets `4–8` are C major's G form and A minor's E form |
| 8 | `why-only-two` | `choice` | Lesson 6 | Why only two of five coincide — the window is anchored on the root |

Every question gets an `explanation`. `multi-select` is graded all-or-nothing, which is why question
3 asks only for something the chapter states completely and in one place. **No option may be referred
to by letter or position** — options are shuffled on every attempt and render with no labels.

**As built — 8 questions, exactly the sketch above.** Question 5 carries a `setup` table holding the
two loops and the Key Detector's verdicts, so the learner reads the evidence before the question.

---

## As built — final word counts

| Lesson | Words | `readingTimeMin` | `estimatedMin` in the curriculum |
| --- | --- | --- | --- |
| `minor-caged-the-same-seven-notes` | 564 | 3 | 4 |
| `minor-caged-the-three-that-drop` | 550 | 3 | 4 |
| `minor-caged-the-flat-third` | 522 | 3 | 4 |
| `minor-caged-what-decides-home` | 632 | 4 | 5 |
| `minor-caged-is-there-minor-caged` | 546 | 3 | 4 |
| `minor-caged-one-window-two-names` | 743 | 4 | 5 |
| `minor-caged-play-both-roads` (activity) | — | — | 8 (optional) |

Chapter total, counted sections only: **26 minutes** of articles plus **5** for the checkpoint =
**31**; 39 including the optional drill. The pathway's `estimatedMin` was left at its placeholder of
200 — the top-level agent recomputes it once every chapter exists.

## Judgement calls recorded here

- **Six lessons, cut as two derivations → the note that carries them → the ear → the objection → the
  windows.** The alternative was a separate "which question does each answer" lesson; it would have
  been restatement, so that job is carried by lesson 1's close, lesson 2's two-row table and
  checkpoint question 2 instead.
- **No `caged-shape` anywhere in the chapter.** Chapter 1 never draws a single form, which keeps the
  whole of chapter 2 intact. The only fretboard diagrams are three `caged-ladder` blocks.
- **`scale-compare` used with a single scale, twice, in lesson 1.** Two cards adjacent is the only
  way in the current registry to show the relative relationship: the same seven letters rotated, with
  a different row of degree labels underneath. The component takes one root, so it cannot do it in a
  single block.
- **"Aeolian" appears once, in lesson 1, quoting the app's own card.** The pathway's convention is
  natural minor throughout, and `scale-compare` prints "The plain minor scale — Aeolian" as the
  scale's character line. Leaving that unexplained on the page was worse than defusing it in one
  clause plus the chapter's only footnote. The word "mode" appears nowhere.
- **Lesson 6 says "a fret span", not "a five-fret span"**, and then names the one exception
  explicitly: nine of the ten windows in its table are five frets wide; A minor's A form runs `0–3`
  because the nut cuts it short. Recomputed and verified.
- **The Key Detector demonstration was run against `estimateKey` before it was promised.** Both loops
  come back `confident`. The prose describes the engine as weighting the chords and their position in
  the loop — the `bassPc` field exists in the model but `estimate.ts` does not score it, so no lesson
  claims the detector listens to the bass.
- **The activity stays on strings 5 and 4** so the A-minor and C-major runs visibly share six of
  their eight dots. All four rounds verified pitch-distinct.
