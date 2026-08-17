# CAGED in a Minor Key

The brief every chapter agent inherits. Read it end to end before planning your chapter, and read
`LEARNING_CREATION.md` before writing anything.

- **Pathway id / slug**: `path_minor-caged` / `minor-caged`
- **Difficulty**: `core`
- **Anchor key**: A minor, everywhere. C major is its relative and is present constantly; A major
  appears only where a lesson is explicitly making the parallel comparison.
- **Chapters**: 5, roughly 33 lessons
- **Prerequisite**: the `caged-fretboard` pathway. Recommended, not required — see below.

---

## Topic mastery

### Two roads to minor, and they answer different questions

There are exactly two ways to reach a minor scale from a major one, and conflating them is the
single biggest source of confusion in this topic. Both are true; they are answers to different
questions.

**Relative** — keep the notes, move the home. Play C major starting from its sixth degree and you
have A natural minor: `A B C D E F G`, the same seven pitches as C major. Nothing is added or
removed. Every major scale has a relative minor a minor third below its root, and every minor scale
has a relative major a minor third above. *This answers "where are the notes".*

**Parallel** — keep the home, move the notes. A major is `A B C# D E F# G#`; A minor is
`A B C D E F G`. Three notes drop by a semitone: `3→b3`, `6→b6`, `7→b7`. *This answers "what
changed about the sound".*

The learner needs both and needs them named. On the neck, the relative relationship is what makes
this pathway cheap — the notes are already learned — and the parallel relationship is what makes
each individual shape make sense, because a minor CAGED form is its major form with the third
lowered a fret.

### What actually happens to a CAGED form

A CAGED window is a five-fret span **anchored on the root**, not on the quality. So:

> **A minor's five windows sit exactly where A major's do.** The window does not move. Only the
> notes marked inside it change.

That is `caged-shape`'s behaviour by construction (`quality` selects the degree set;
`cagedFormWindow` never sees it), and it is the pathway's central claim. For A, the five windows
are:

| Form | Frets | What it is, concretely, in A minor |
| ---- | ----- | ---------------------------------- |
| A    | 0–3   | **The open Am chord**, `x 0 2 2 1 0` |
| G    | 1–5   | The Gm shape. Roots on strings 6, 3 and 1 — the widest, played in pieces |
| E    | 4–8   | **The Am barre at fret 5**, `5 7 7 5 5 5`. The backbone |
| D    | 6–10  | The Dm shape at fret 7. Roots on 4 and 2. A fragment shape from the start |
| C    | 9–13  | The Cm shape. Roots on 5 and 2 (`2·10`, `5·12`); its `b3`s are `4·10` and `2·13` |

Two of those five are chords the learner already plays. **Say so in chapter 2's opener**, because
strict C-A-G-E-D order means the chapter starts on the C form, which is the worst of them.

Every number in that table came from running `cagedFormWindows(pc('A'))`, and the A-form row is
pinned in `mobile/src/lib/guitar-positions/caged.test.ts`. **Recompute, do not remember.**

### The relative windows are tiled three frets apart

This is the trap, and it is not obvious. C major's windows are `C 0–4`, `A 2–6`, `G 4–8`, `E 7–11`,
`D 9–13`. A minor's are `A 0–3`, `G 1–5`, `E 4–8`, `D 6–10`, `C 9–13`. The note content of the neck
is *identical* — but the boxes are anchored on different roots, so the tiling shifts by three frets
and only **two** of the five spans coincide:

- **frets 4–8** — C major's **G form** and A minor's **E form** are the same window.
- **frets 9–13** — C major's **D form** and A minor's **C form** are the same window.

So a lesson may not say "A minor's boxes are C major's boxes". It must say: the same notes, carved
into a differently placed set of five windows, because a window is anchored to the chord you are
playing. The two coincidences are the bridge between the two pathways and are worth a lesson of
their own (chapter 1's closer, revisited in chapter 5).

The 4–8 coincidence is also the reconciliation for the most common self-taught muddle on the
instrument: a player who knows "A minor pentatonic at fret 5" and separately knows "CAGED" and has
never been told they describe the same dots.

### The window-edge effect, which will bite a careless lesson

Flattening the third moves a note down one fret. The window does not move with it. Therefore:

- a `3` sitting on the window's **bottom** fret flattens to a `b3` that falls *outside* the picture;
- a `b3` one fret above the window's **top** fret steps *into* the picture.

This happens at an edge in **all 85** root-and-form combinations, so the major and minor diagrams of
the same window usually hold a different number of dots — 7 against 8 is typical. **"The same
picture with one dot moved" is false**, and a lesson that prints it will be contradicted by the
diagram directly beneath it. The true sentence is: *every `3` steps down to a `b3`; roots and fifths
never move; and because the window's edges are fixed frets, a third on an edge steps out of the
frame.* Both halves are pinned in `caged.test.ts`.

Worked example, recomputed, for the triad layer in A — the counts chapter 2 teaches from. Note the
A form goes **up** and the D form does not move at all, so "minor always has one fewer" and "the
counts are never equal" are both false:

| Form | C | A | G | E | D |
| ---- | - | - | - | - | - |
| A major, dots | 8 | 6 | 7 | 7 | 7 |
| A minor, dots | 7 | 7 | 8 | 8 | 7 |

Every chapter recomputed its own layer rather than scaling this one, and the pattern changed shape
each time — which is why scaling is banned. All three layers, verified:

| Form (A) | Window | Triad maj/min | Pentatonic maj/min | Scale maj/min |
| -------- | ------ | ------------- | ------------------ | ------------- |
| C | 9–13 | 8 / 7 | 12 / 12 | 18 / 17 |
| A | 0–3  | 6 / 7 | 10 / 12 | 13 / 17 |
| G | 1–5  | 7 / 8 | 12 / **13** | 17 / **18** |
| E | 4–8  | 7 / 8 | 12 / 12 | 17 / 17 |
| D | 6–10 | 7 / 7 | 12 / 12 | 17 / **18** |

Read across: the effect is loud at the triad layer (four of five differ), **quiet at the pentatonic
layer** (only two differ), and loud again at the scale layer, where the A form's gap reaches four
dots. Two windows hold eighteen at the scale layer, so "the only window with eighteen" is false —
as is "twelve dots, two per string" at the pentatonic layer, which the G form's thirteen breaks.

The related caveat inherited from the major pathway still applies and is worse here: `caged-shape`
draws **everything in the window, not one playable grip**. At `show: "triad"` an A-minor window
carries 7–8 dots where a hand holds 4–6. State the convention once per chapter that uses it.

### The layers, which are the spine of chapters 2–4

Same structure as the major pathway, same five windows, filling in:

| Chapter | Layer            | Degrees              | Adds          |
| ------- | ---------------- | -------------------- | ------------- |
| 2       | Minor triad      | `1 b3 5`             | —             |
| 3       | Minor pentatonic | `1 b3 4 5 b7`        | `4`, `b7`     |
| 4       | Natural minor    | `1 2 b3 4 5 b6 b7`   | `2`, `b6`     |

They nest exactly — `roots ⊂ triad ⊂ pentatonic ⊂ scale` — and the test suite proves it for every
root and form. The learner is never asked to learn a new shape after chapter 2. Say that out loud.

**Note what the pentatonic does and does not contain.** It has `b3` and `b7` but **not** `b6`. So
"the three flattened notes" is a chapter 1 phrase and must not be reused in chapter 3, where only
two of them are present. Chapter 3's opener therefore names the `2` and the `b6` as *absent*, in one
clause, teaching neither — a deliberate departure from "leave chapter 4's notes alone", because
`scale-compare` puts both chips on screen with their degree labels and a lesson that displays a note
it refuses to name is worse. **Chapter 4 still introduces both properly**; treat them as unspent. The `b6` arrives in chapter 4 and is the darkest note in the scale — it is
the semitone above the fifth, and it is what separates natural minor from Dorian (a word this
pathway does not use).

There is no roots chapter. Roots have no quality, and the `caged-fretboard` pathway spent seven
lessons on them. Chapter 2's opener reminds the learner they already own that and links back.

### The chords a minor key gives you

In A minor, harmonised in triads from the natural minor scale:

| Degree | `i` | `ii°` | `III` | `iv` | `v` | `VI` | `VII` |
| ------ | --- | ----- | ----- | ---- | --- | ---- | ----- |
| Chord  | Am  | Bdim  | C     | Dm   | Em  | F    | G     |

Lowercase numeral for minor, uppercase for major, `°` for diminished. These are the same seven
triads as C major's — `C Dm Em F G Am Bdim` — starting from the sixth. That is the relative
relationship again, now at chord level, and it is the cleanest possible demonstration of it.

**The raised seventh.** Natural minor's `v` is minor (Em), and a minor v resolves weakly to i
because it has no leading tone — `G` is a whole step below `A`, not a semitone. Raising the seventh
to `G#` turns Em into **E major**, and `G#→A` is a semitone that pulls hard. That raised seventh is
what makes the scale *harmonic minor*, and it is why a huge amount of minor-key music has a major V
chord in a scale that does not contain one.

This is in scope for **exactly one lesson** in chapter 5. It is a door onto modes, melodic minor and
the augmented second, and none of those is in scope. Name harmonic minor, show the `G#`, show E
major resolving to Am, stop. `scale-compare` with `root: "A"`, `scales: ["minor", "harmonic-minor"]`
does the work in one block.

### What is guitar-specific

- **The window stays; the third moves.** That is a fretboard fact — on a keyboard "A major becomes A
  minor" has no location at all.
- **The third is somewhere different in every form**, and in the C and D forms it sits across the
  G→B break, where the learner's "the shape just slides" intuition breaks.
- **The E and A forms are chords the learner already owns.** The open Am and the fret-5 barre are
  two of the five, for free.
- **The minor pentatonic finally fits.** In the major pathway chapter 3 had to explain why the
  pentatonic the learner already knew (minor) was not the one being taught. Here it is the one being
  taught, and the `b3`/`b7` sit naturally inside the window.
- **Everything repeats at fret 12**, so the ladder wraps exactly as it did in major.

### Where the sources disagree

- **Whether "minor CAGED" is a separate system.** Many teachers say there is no such thing — learn
  the major forms and re-root them. **This pathway's position, stated plainly in chapter 1:** they
  are right about the *notes* and wrong about the *chords*. If you want to play an A minor chord you
  need a shape rooted on A with a `b3` in it, and there are five of them. Do not pretend the
  objection does not exist; answer it.
- **Teaching order.** Same debate as the major pathway. **Hold strict C-A-G-E-D order** in chapters
  2–4, matching `caged-fretboard` exactly, so the two pathways read as a pair.
- **"Aeolian" vs "natural minor".** Both name the same seven notes. **This pathway says natural
  minor** throughout, and never uses the word "mode". The app's scale catalogue calls it "Natural
  minor" too (`id: 'minor'`).
- **Naming the minor forms.** "Em shape", "the minor E form", "E form minor" are all current.
  **This pathway keeps the form letter bare and puts the quality on the chord**: "the E form of A
  minor", "the E form", `Am`. Name "Em shape" once, in chapter 2, as the synonym found elsewhere.
  This matches `caged-shape`'s own heading, which prints `E form · A minor`.

---

## Audience and prerequisites

Someone who has done the `caged-fretboard` pathway, or who knows the five major forms from
elsewhere. Assume:

- The five CAGED forms, in order, as windows that tile the neck.
- That the letter names the form, not the chord.
- Where the roots of a chord are, in every form.
- Barre chords work physically; open chords are fluent.
- Root, third, fifth, and what "major scale" means.

**Chapter 1's first lesson must name the prerequisite** — one sentence, linking
`{"kind": "article", "slug": "caged-what-the-letter-means"}`, framed as strongly recommended. Unlike
the triads pathway, this one genuinely leans on CAGED throughout and cannot be taken cold.

Do **not** assume: any prior notion of relative or parallel minor, any pentatonic box numbering, any
theory beyond triads, or that the learner can name a note above fret 5 quickly.

The `triads` pathway is **not** a prerequisite. Chapter 5's `ii°` may link its diminished lesson
rather than re-teaching it.

## Out of scope

Named here so no chapter quietly annexes them:

- **Modes and modal harmony.** The words "Aeolian", "Dorian" and "mode" do not appear.
- **Melodic minor**, and the ascending/descending story. Not even as a footnote.
- **Harmonic minor beyond the raised seventh in one chapter 5 lesson.** No augmented second, no
  Phrygian dominant, no harmonic-minor shapes across the five forms.
- **Seventh chords and extensions.** Triads only. `v7`, `im7`, none of it.
- **The blues as a genre**, box-by-box minor pentatonic soloing vocabulary, bends, or phrasing. The
  `b5` blue note is named once, in chapter 3's closer, as a passing note and nothing more.
- **Three-notes-per-string** shapes. Chapter 4 may mention the visualizer offers them; it may not
  teach them.
- **Alternate tunings.** Standard tuning only.
- **Re-teaching the major forms.** Link `caged-fretboard`; do not restate it.

---

## The arc

Chapters 2–4 run **strict C-A-G-E-D order**: an opener, five form lessons, and a closer that joins
that layer's five forms into one picture. This mirrors `caged-fretboard` deliberately.

**Chapter 1 — Where minor comes from** (6 lessons, slug `where-minor-comes-from`)
After it, the learner can derive A natural minor from C major two different ways, knows which of the
two questions each derivation answers, can say why the same seven notes do not automatically sound
minor, and has seen the one window that is C major's G form and A minor's E form at the same time.
This is the chapter that ties the pathway to its predecessor, and it is where the "there is no such
thing as minor CAGED" objection gets answered.

**Chapter 2 — The five minor forms** (7 lessons, slug `the-five-minor-forms`)
Opener on the window-stays-third-moves rule, then the minor triad in the C, A, G, E and D forms, then
the minor ladder as one picture. After it, the learner can play an A minor chord in five places
across the neck and can say which finger is on the `b3` in each. Two of the five they already play,
and the opener should hand them that immediately.

**Chapter 3 — The minor pentatonic in each form** (7 lessons, slug `the-minor-pentatonic`)
Opener on the `4` and the `b7`, five form lessons, then a closer reconciling the CAGED forms with the
"Boxes" numbering `/scale-visualizer` also offers for the same five notes, and naming the `b5` blue
note once. After it, the learner can play A minor pentatonic anywhere on the neck and knows which of
its five notes are chord tones — the difference between running a scale and playing over a chord.

**Chapter 4 — The whole natural minor scale** (7 lessons, slug `the-natural-minor-scale`)
Opener on the `2` and the `b6`, five form lessons, a separate closer. After it, the learner can play
A natural minor anywhere on the neck and knows the role of every note in the window, including why
the `b6` is the darkest note in it.

**Chapter 5 — Playing in a minor key** (6 lessons, slug `playing-in-a-minor-key`)
The applied chapter. The seven chords a minor key gives you and where they sit in the forms; the
raised seventh and the major V; switching between C major and A minor without moving your hand; a
i–VI–III–VII up the neck through the forms; transposing the whole ladder to any minor key; and a
closer that puts the neck back together. After it, the learner can comp a minor progression anywhere
on the neck and move between a key and its relative at will.

### Keeping the form lessons from being one lesson repeated

Fifteen of these lessons are "[layer] in the [letter] form". Written lazily that is one lesson with
five diagrams, printed three times — the failure mode both previous pathways had to fight. **Each
form has its own character in minor, and it is not the same character it had in major**:

- **C form** — roots on 5 and 2. This is where the "the shape just slides" intuition dies, but
  **not for the reason an earlier draft of this brief gave**: chapter 2 recomputed it and the C
  form's `b3`s are `4·10` and `2·13`, so the B-string break is not what bites here. What bites is
  that flattening the third *inverts the fingering* across the middle of the grip, and one third
  leaves the window entirely. The full barre is impractical; a fragment shape. In A minor it lives
  high, at frets 9–13.
- **A form** — roots on 5 and 3. **The open Am chord** when the root is A, and the cleanest barre of
  the five otherwise. The friendliest, and the one to build confidence on. It is also the only form
  whose minor window holds **more** dots than its major one (7 against 6).
- **G form** — roots on 6, 3 and 1. The widest and the hardest to hold whole; in practice always in
  pieces, and its `b3` lands *below* the barre, which is why it cannot be barred at all. **Do not
  claim its three roots are unique** — an earlier draft of this brief implied so and chapter 2
  disproved it: the E form also carries three, and all five windows put a dot on every string.
- **E form** — roots on 6, 4 and 1. **The fret-5 Am barre** — the most-played minor shape on the
  instrument and the one every other form is located from. Also the window that coincides with C
  major's G form, which chapter 1 has already shown them.
- **D form** — roots on 4 and 2. The smallest, essentially never played whole, a fragment from the
  start. The B-string shift bites again.

---

## Conventions

Hold all of these. A chapter that breaks one costs the pathway its consistency.

| Thing | Convention |
| ----- | ---------- |
| String numbering | **1 = high e, 6 = low E.** Matches the app everywhere, and the quiz `fretboard` and activity `note-play` schemas. |
| The five shapes | Called **forms**, letter bare and capital: "the E form". The quality lives on the chord, not the letter — "the E form of A minor", never "the Em form". Name "Em shape" once, in chapter 2, as the synonym found elsewhere. |
| Degrees | `1 2 b3 4 5 b6 b7`, always with the `code` mark. **These are exactly what `caged-shape` prints on its dots** — prose and diagram must not disagree. Never `m3`. |
| Chord names | `Am` for A minor, `C` for C major, `Bdim` for the diminished. Never "Amin" or "A-". |
| Roman numerals | Lowercase for minor (`i`, `iv`, `v`), uppercase for major (`III`, `VI`, `VII`), `ii°` for diminished. `code` mark. |
| Accidentals | A minor is all naturals, which is why it is the anchor. **Sharps by default** where one is needed (`G#`, `C#`). Flats only when spelling a genuinely flat key, which is chapter 5 territory. |
| Grips | A **six-slot chart, low E first**, `x` for a string not played: `x 0 2 2 1 0`. Always six slots, always `code` mark. |
| Single positions | `5·3` — string, then fret, `code` mark. Spell it out ("string 5, fret 3") the first time a chapter leans on it; a learner may arrive at any chapter after a gap. |
| Frets | "fret 3"; the nut is "fret 0" or "open". The fret a barre sits at is the **barre fret**. |
| Key | **A minor** throughout, with C major as its relative. A major appears only in chapter 1's parallel lesson and chapter 5's transposing lesson. Do not quietly demonstrate in E minor. |
| The scale | **"natural minor"**. Never "mode". "Aeolian" appears **exactly once in the whole pathway**, in chapter 1's first lesson, because `scale-compare` prints "Natural minor — Aeolian" on its own card and leaving visible on-screen text unexplained is worse than defusing it; it is handled in one clause plus a footnote. Do not reintroduce the word anywhere else, and do not treat that exception as licence for "mode". |
| Note names | `code` mark, scientific pitch (`A3`) only inside a `listen` question's audio spec, never in prose. |
| Chapters | Safe to name by number in prose — the app prints "Chapter 2" on the card. **Lessons are not numbered on screen**; name the topic or link the article by slug, never "the last lesson". |
| Cross-pathway links | Link `caged-fretboard` articles by slug freely; that is the point. Do not restate their content. |

---

## Components and screens this pathway uses

`caged-shape` and `caged-ladder` were **extended with a `quality` prop before authoring began**, so
both draw minor. Their catalogue rows in `LEARNING_CREATION.md` §7.3 are the authority on their
props — read that table, not this section, when writing a `live` block, and read the note beneath it
about the window edge.

- **`caged-shape`** with `quality: "minor"` — the workhorse of chapters 2–4. Every form lesson should
  use it. The four `show` layers nest in minor exactly as in major, so the same `root` + `form` at
  four `show` values across three chapters is one window filling in.
- **`caged-ladder`** with `quality: "minor"` — chapter closers and chapter 5. Note that the bands are
  **identical** to the major ladder of the same root; `quality` only changes the caption. When a
  lesson draws both, that identity is the claim, not a bug.
- **`scale-compare`** — a much better fit here than in the major pathway, and the right tool three
  times: `root: "A", scales: ["major", "minor"]` for the parallel derivation (chapter 1),
  `["minor", "minor-pentatonic"]` for what the pentatonic leaves out (chapter 3), and
  `["minor", "harmonic-minor"]` for the raised seventh (chapter 5). It cannot show the relative
  relationship — it takes one root — so do not reach for it there.
- **`progression-player`** — built during chapter 1 at that chapter agent's request, because prose
  cannot make a progression audible. Give it chord symbols and it strums them, one per beat, with
  each chord's curated grip printed on its chip. **Chapter 5 is its main customer** — the chords of
  the key, the raised seventh resolving, the `i–VI–III–VII`, and the relative switch are all claims
  about how a sequence *sounds*. Chapter 1 uses it for the two loops that share seven notes. It is
  not a metronome or a backing track; link `/metronome` for practice tempo.
- **`triad-shape` / `triad-ladder`** exist and belong to the `triads` pathway. A lesson that wants
  one has drifted out of scope; chapter 5 may *link* a triads article instead.

Screens:

| Href | Used for |
| ---- | -------- |
| `/scale-visualizer` | **The primary destination.** Set to A natural minor its default system is `caged` and its pager says "E form", the same names this pathway uses. Chapter 3's closer needs its "Boxes" toggle specifically. |
| `/chord-shapes` | Every voicing of `Am` — "and here is the fragment version". Chapter 2 constantly. |
| `/drone` | A sustained A to hear the same notes as minor rather than as C major. Chapter 1's hearing lesson, then chapters 3–4. |
| `/chord-detector` | "Play it and check you got a minor chord." Chapter 2. |
| `/key-detector` | Chapter 1: play a C-major progression and an A-minor one from the same notes and watch it call them different keys. |
| `/ear-trainer` | Chapter 1's hearing lesson only. |
| `/metronome` | Chapter 5's comping lessons. |

Anything not in `LEARNING_CREATION.md` §7.3 / §7.4 does not exist. If a lesson wants a widget that is
not there, **do not build it** — write the lesson with what exists and report the request upward,
per §6.

---

## Naming and ids

Fixed here so parallel agents cannot collide. Section ids are progress keys and are **never** renamed
once published.

| Thing | Pattern | Example |
| ----- | ------- | ------- |
| Chapter id | `minor-caged.ch<N>` | `minor-caged.ch2` |
| Section id | `minor-caged.ch<N>.<name>` | `minor-caged.ch2.triad-g-form` |
| Ch2 article slug | `minor-caged-triad-<letter>-form` | `minor-caged-triad-g-form` |
| Ch3 article slug | `minor-caged-pentatonic-<letter>-form` | `minor-caged-pentatonic-g-form` |
| Ch4 article slug | `minor-caged-scale-<letter>-form` | `minor-caged-scale-g-form` |
| Other article slug | `minor-caged-<name>` | `minor-caged-the-sixth-degree` |
| Checkpoint slug | `minor-caged-ch<N>-checkpoint` | `minor-caged-ch3-checkpoint` |
| Activity slug | `minor-caged-<name>` | `minor-caged-find-the-flat-thirds` |

Article ids are `art_<slug>`, quiz ids `quiz_<slug>`, activity ids `act_<slug>`, question ids
`q_<quiz-slug>.<name>`, round ids `r_<activity-slug>.<name>`. `publishedAt` is the date the chapter
is written. `passThresholdPct` is 70 everywhere, on both the quiz `meta` and the chapter
`checkpoint`.

Every document slug lives in one flat namespace across every pathway that will ever ship — hence the
`minor-caged-` prefix on everything, without exception. It does not collide with `caged-fretboard`'s
`caged-` prefix or the `triads` pathway's `triad-` prefix, but check the corpus before settling a
slug.

Section ids are validated against `/^[a-z0-9-]+\.[a-z0-9-]+\.[a-z0-9-]+$/` — exactly three
dot-separated lowercase-kebab segments, which `minor-caged.ch2.triad-g-form` satisfies.

---

## Open questions resolved with the user

- **Anchor key** — A minor, the relative minor of the CAGED pathway's C major, so every note is
  already familiar and the tie between the two pathways is literal. C minor was considered and
  rejected: it has no open shapes and it demotes the relative relationship to a footnote.
- **Components** — `caged-shape` and `caged-ladder` were extended with `quality?: "major" | "minor"`
  rather than duplicated into minor-only components. The default is `"major"`, so every existing
  CAGED article is untouched, and one component teaching both pathways is itself the better story.
- **Scope** — the minor key's chord family, relative/parallel switching, harmonic minor's raised
  seventh, and the pentatonic-versus-Boxes reconciliation are all in. The first two are chapter 5;
  the raised seventh is one chapter 5 lesson and no more; the Boxes reconciliation closes chapter 3.
- **Length** — 5 chapters, roughly 33 lessons, matching `caged-fretboard` and `triads` so the three
  read as a series.
- **No roots chapter** — roots have no quality and the major pathway already spent seven lessons on
  them. Chapter 2 opens straight into the triad and links back.
- **Strict C-A-G-E-D order** in chapters 2–4, even though A minor's neck order is A-G-E-D-C and even
  though two of the five are chords the learner already plays. Consistency with the sibling pathway
  wins; the opener compensates by naming the two familiar forms up front.
