# Triads: The Three Notes Every Chord Is Made Of

The brief every chapter agent inherits. Read it end to end before planning your chapter, and read
`LEARNING_CREATION.md` before writing anything.

- **Pathway id / slug**: `path_triads` / `triads`
- **Difficulty**: `core`
- **Anchor key**: C major, everywhere, unless a lesson names a reason to leave it
- **Chapters**: 5, roughly 30 lessons

---

## Topic mastery

### The system, from first principles

A triad is three notes stacked in thirds: a **root**, a **third** above it, and a **fifth** above the
root. Two interval sizes decide everything, and there are only four combinations:

| Quality        | Root → third | Third → fifth | Degrees      | Over C     |
| -------------- | ------------ | ------------- | ------------ | ---------- |
| **major**      | 4 semitones  | 3             | `1 3 5`      | C E G      |
| **minor**      | 3            | 4             | `1 b3 5`     | C Eb G     |
| **diminished** | 3            | 3             | `1 b3 b5`    | C Eb Gb    |
| **augmented**  | 4            | 4             | `1 3 #5`     | C E G#     |

That is the whole quality system, and its consequence is the pathway's best news: the four qualities
are one or two frets from each other, never separate shapes to memorise.

**Inversion** is which of the three notes is lowest — nothing more. Rotate the bottom note up an
octave and you have the next one:

| Inversion  | Order   | Bass       | Over C        |
| ---------- | ------- | ---------- | ------------- |
| root       | `1 3 5` | the root   | C E G         |
| first      | `3 5 1` | the third  | E G C         |
| second     | `5 1 3` | the fifth  | G C E         |

On a keyboard that is a voicing choice. **On a guitar it is a place.** Each rotation lands the grip
somewhere else on the neck, so the three inversions tile a string set the way the five CAGED forms
tile the whole neck — and, like CAGED, the cycle starts over twelve frets up.

Close-voiced triads live on **four sets of three adjacent strings**: 1-2-3, 2-3-4, 3-4-5 and 4-5-6
(string 1 is the high e). Here is the entire grid this pathway teaches, for C major, written as
six-slot charts low E first:

| Set   | Root position   | First inversion  | Second inversion |
| ----- | --------------- | ---------------- | ---------------- |
| 1-2-3 | `x x x 5 5 3`   | `x x x 9 8 8`    | `x x x 0 1 0`    |
| 2-3-4 | `x x 10 9 8 x`  | `x x 2 0 1 x`    | `x x 5 5 5 x`    |
| 3-4-5 | `x 3 2 0 x x`   | `x 7 5 5 x x`    | `x 10 10 9 x x`  |
| 4-5-6 | `8 7 5 x x x`   | `12 10 10 x x x` | `3 3 2 x x x`    |

Every one of those twelve is pinned in `mobile/src/lib/guitar-positions/triads.test.ts`. **If a
lesson's chart disagrees with this table, the lesson is wrong** — check against the test, not against
memory.

### The three geometries, and why there are three rather than four

Standard tuning is all fourths **except** the G→B major third, and that single irregularity is what
makes this a guitar topic rather than a theory topic. Relative to the bass note, the shapes are:

| Set   | Root position | First inversion | Second inversion |
| ----- | ------------- | --------------- | ---------------- |
| 4-5-6 | `0 −1 −3`     | `0 −2 −2`       | `0 0 −1`         |
| 3-4-5 | `0 −1 −3`     | `0 −2 −2`       | `0 0 −1`         |
| 2-3-4 | `0 −1 −2`     | `0 −2 −1`       | `0 0 0`          |
| 1-2-3 | `0 0 −2`      | `0 −1 −1`       | `0 +1 0`         |

**Sets 3-4-5 and 4-5-6 are identical** — both are all fourths. Crossing the G→B break lifts every
note *above* it by one fret, so 2-3-4 (one string above the break) differs by one, and 1-2-3 (two
strings above it) by two. Twelve diagrams, three shapes, one cause.

### The gift at the nut

The open C chord is `x 3 2 0 1 0`. Read it three strings at a time:

- strings 5-4-3 → `3 2 0` — **root position** on set 3-4-5
- strings 4-3-2 → `2 0 1` — **first inversion** on set 2-3-4
- strings 3-2-1 → `0 1 0` — **second inversion** on set 1-2-3

One open chord every learner already plays contains three of the twelve grips, on three overlapping
sets, in all three inversions. Open A's top three strings (`2 2 0`) are an A major root position on
set 1-2-3, and open D's (`2 3 2`) are a D major second inversion on the same set. This is chapter
1's hook and it should be spent there, not saved.

### The misconceptions to build against

In order of how much damage they do. A lesson built against one of these is a good lesson.

1. **"The lowest note is the root."** Someone holding `x x 2 0 1 x` reads the bass E and calls it an
   E chord. It is C major with E in the bass — `C/E`. A chord is named by its root, wherever the root
   happens to sit. Chapter 1's second lesson exists to kill this.
2. **"Inversions are a piano thing."** Presented as classical voice-leading theory, they sound
   optional. On a guitar they are the practical answer to "how do I play C up *there* without
   barring anything", and they are how a rhythm part moves two frets instead of eight.
3. **"A three-string chord is a fragment of the real chord."** Backwards. The triad is the complete
   chord; the six-string barre chord is a triad with two of its notes doubled. Say this early and
   mean it — it changes how a learner hears their own playing.
4. **"The shape just moves across the strings."** The B string again. A learner who transfers a
   set 3-4-5 grip straight onto set 2-3-4 plays a wrong note every time, and will blame themselves
   rather than the tuning.
5. **"Major, minor, diminished and augmented are four different chords to learn."** They are one
   shape with one or two notes moved a fret. Chapter 4's closer is this claim made visible.

### What is guitar-specific

- **Inversions are locations.** The same three notes in a different rotation are somewhere else on
  the neck entirely — that is not true of any keyboard instrument.
- **The B string breaks the pattern**, and it is the single reason the grid has three geometries.
- **Some close voicings do not exist low down.** E-G-C on strings 6-5-4 needs the twelfth fret,
  because the G above an open low E is G2 — below the open A string. The component finds the
  playable one automatically; the lesson should say *why* it had to go up there.
- **Register decides the set.** Two voices too close together, too low down, turn to mud — not taste
  but a rule the app enforces, `MUD_RULES` in `mobile/src/lib/guitar-voicings/generate.ts`: below
  A2 nothing closer than 4 semitones, below C3 nothing closer than 3, below A3 nothing closer than
  2. **Be careful how you use this.** Chapter 2's agent checked it exhaustively and the brief's
  first draft was wrong: **not one of the twelve C major grips is muddy, and neither is any of the
  twelve C minor ones.** What is true is that the low grips run *close to* the limit — G major root
  position on strings 4-5-6 (`3 2 0 x x x`, G2 B2 D3) sits at exactly the threshold on both gaps,
  with zero margin. Across all twelve roots, exactly three close major triads violate the rule, and
  all three are the same shape: **D, D# and E first inversion on strings 4-5-6.** Claim thin
  margins, not violations.
- **`triad-shape` does not know about mud.** It draws the lowest voicing that fits a hand, so asking
  it for D major first inversion on strings 4-5-6 will cheerfully draw `2 0 0 x x x` — a voicing the
  app's own generator would reject. Chapters using roots other than C should check any 4-5-6 grip
  against the rule above before building a lesson on it.
- **Three fingers, no barre.** The physical argument for triads is real and should be made.

### Where the sources disagree

- **Naming inversions.** "First/second inversion" versus figured bass (`6`, `6/4`) versus slash
  chords (`C/E`, `C/G`). **This pathway says root position / first inversion / second inversion**,
  and names slash notation once, in chapter 1, because that is what a chart the learner meets will
  actually print. Figured bass is never mentioned.
- **Naming the sets.** Some teachers number them 1–4, some name them by strings, some say "the top
  three". **This pathway says "strings 1-2-3"**, matching the `strings` prop on both live
  components and the app's string numbering everywhere.
- **Whether the augmented triad has a root.** It is 4 + 4, perfectly symmetrical, so C+ , E+ and G#+
  are the same three pitches and the same shape four frets apart. The honest position, and chapter
  4's: the shape has no root of its own — context supplies one. **Do not extend this to the
  diminished triad**, which is 3 + 3 + 6 and is *not* symmetrical; only the diminished *seventh* is,
  and it is out of scope. This is the single easiest error to make in chapter 4.

### What the evidence actually supports about hearing this

A research pass done during chapter 3 turned up a lot of confident folklore. Tiered as
**[established]**, **[contested]**, **[convention, no evidence]** — a lesson may state the first
plainly, must hedge the second, and must not dress the third as a finding.

- **[established]** A minor triad is slightly rougher and less harmonically fused than a major triad
  on the same root, and its root is perceptually *more ambiguous* — in the minor triad the third
  competes with the root for salience. But **the difference between two voicings of the same quality
  is larger than the difference between the qualities**, which for a guitar pathway is the operative
  fact: how you voice it matters more than whether it is major or minor.
- **[contested, lean against]** "Minor sounds sad" as a human universal. It holds for listeners
  raised on Western music, is acquired by children only around 6–8 (well *after* tempo), and largely
  vanishes in listeners without that exposure once tempo, register and articulation are held
  constant. Say the sound has an acoustic basis; do not say the sadness does.
- **[established]** In a close root-position triad the third is the **inner** voice, and inner voices
  are the worst-encoded — outer voices dominate attention. This is the real reason learners fall back
  on mood: the note doing the work is the one the ear least wants to isolate. It also means the third
  is *most* audible in second inversion, where it is on top.
- **[established]** Inversion is audible to everyone, trained or not: energy and tension rise and
  consonance falls monotonically root → first → second. Useful for chapter 5's hearing lesson.
- **[established]** Triad quality gets hard to recognise below roughly 120 Hz, and the low-register
  effect on consonance is far stronger than the high-register one. Corroborates chapters 2–4's
  register argument from a second direction. (One small study — a landmark, not a threshold.)
- **[established]** Training transfers better when the response is **identification** ("name this
  chord") than paired A/B comparison, when examples are **interleaved** rather than blocked, and when
  feedback is minimal correct/incorrect rather than elaborated. And there is no evidence that
  isolated-chord drilling transfers to hearing chords in progressions — so **train in the target
  context** rather than treating progressions as an advanced level after isolated mastery.
- **[convention, no evidence]** That a drone sharpens the ear. The two controlled studies found no
  measurable benefit (for intonation, not quality). The honest framing, which chapter 3 uses, is
  task design: a drone nails the root so the learner cannot solve the task by tracking the bass.
- **[convention, no evidence]** That singing or humming improves chord-quality discrimination.
  Untested; and singing *during* a memory-loaded transcription task measurably interferes. Offer it
  as a practical suggestion, never as a claim.

**Four things not to write**, each contradicted or unsupported by the only evidence that exists:
first-inversion triads are harder to identify than root position (the one ranking says the reverse);
minor gets confused with diminished (diminished confuses with augmented); a major chord in a minor
context is heard as minor (the one experiment found the opposite); and any version of "most people
cannot hear major versus minor" (that result is about rapid tone-scrambles, not triads).

---

## Audience and prerequisites

A player who can hold chords and is starting to want control over *where* on the neck a chord
sounds. Assume:

- Open chords are fluent; barre chords work, at least on the E and A shapes.
- They can find notes on the low E and A strings by counting.
- They know what a root, a third and a fifth are, and what "major scale" means.

**The CAGED pathway is a recommended prerequisite and chapter 1's first lesson must say so** — one
sentence, linking the CAGED opener (`{"kind": "article", "slug": "caged-what-the-letter-means"}`),
framed as recommended and not required. A learner who has done it arrives knowing the neck is a map;
this pathway hands them a smaller, more portable one. Do not otherwise assume CAGED knowledge, and
do not re-teach it: this pathway never needs the five forms, and a lesson leaning on them has taken
a wrong turn.

Do **not** assume: any prior notion of inversion, any ability to name a note above fret 5 quickly, or
any theory beyond triads.

## Out of scope

Named here so no chapter quietly annexes them:

- **Seventh chords, sixths, sus chords, and anything with four notes.** Triads only.
- **Spread / open-voiced triads** — the ones that skip a string. A real and useful topic, and a
  follow-up pathway. A chapter 5 lesson may name them in one sentence as what comes next; nothing
  more.
- **Triad pairs, superimposition, and "playing a D triad over a C bass" as a modal device.**
- **The CAGED system.** Prerequisite, not content.
- **Arpeggio technique** — sweeping, economy picking, any right-hand mechanics.
- **Modes and modal harmony.** The word "mode" should not appear.
- **Alternate tunings.** Standard tuning only; the B-string argument depends on it.

---

## The arc

**Chapter 1 — What a triad is** (6 lessons, slug `what-a-triad-is`)
After it, the learner knows a triad is a complete chord rather than a fragment, can say which note is
in the bass and why that doesn't rename the chord, can play C major in all three inversions on
strings 1-2-3, and has seen three of those grips inside an open chord they already play.

**Chapter 2 — Major triads everywhere** (7 lessons, slug `major-everywhere`)
The remaining three sets, then the B-string rule stated properly once the learner has met it twice,
then the whole twelve-grip map, then which set to choose and why. **Closes with the pathway's first
applied lesson**: comping a I–IV–V in C on one string set by taking the nearest inversion each time.
After it, the learner can put a major triad anywhere on the neck and has played music with it.

**Chapter 3 — Minor triads** (6 lessons, slug `minor-triads`)
One note, one fret. All four sets, then the lesson that only shows up in first inversion — the third
is the bass there, so lowering it moves the bottom of the shape and the grip appears to relocate.
Closes on hearing the difference in a progression.

**Chapter 4 — Diminished and augmented** (5 lessons, slug `diminished-and-augmented`)
The other two fifths. The diminished triad and where it actually appears; the augmented triad and
why it has no root of its own; and a closer putting all four qualities in one place, one or two
fingers apart.

**Chapter 5 — Playing with triads** (6 lessons, slug `playing-with-triads`)
The applied chapter. Voice leading named and used, the major scale harmonised in triads along one
set, crossing between sets mid-progression, hearing an inversion, playing triads against a bass, and
a closing lesson that comps a whole progression.

### Keeping the shape lessons from being one lesson repeated

Twelve of these lessons are "[quality] on strings [set]". Written lazily that is one lesson with
three diagrams, printed four times — the failure mode the CAGED pathway had to fight. **Each set has
its own character, and a lesson that does not carry its set's character is padding**:

- **1-2-3** — the highest and thinnest. Where rhythm parts live, because it stays clear of the bass
  and the vocal. Its second inversion is inside the open C chord. The most-used set on the pathway.
- **2-3-4** — the one where the B string bites for the first time, and home of the friendliest shape
  on the instrument: the second inversion is `5 5 5`, three fingers in a row at one fret.
- **3-4-5** — the middle of the guitar, the set a chord sounds *full* on. Its root position is the
  bottom of the open C chord.
- **4-5-6** — the lowest, where register stops being free: the margins against the mud thresholds
  above get thin, and the first inversion cannot even be held below fret 10. The honest lesson is
  partly about when *not* to use it.

Chapter 4's diminished and augmented lessons cover the sets together rather than one per set — there
is not four lessons of material there, and pretending otherwise would be the same padding by another
route.

---

## Conventions

Hold all of these. A chapter that breaks one costs the pathway its consistency.

| Thing | Convention |
| ----- | ---------- |
| String numbering | **1 = high e, 6 = low E.** Matches the app, the `strings` prop, and the quiz/activity wire formats. |
| String sets | Written **high string first**: "strings 1-2-3", "strings 4-5-6". Never "the GBE set", never "set 1". This is the exact value the `strings` prop takes. |
| Grips | Written as a **six-slot chart, low E first**, with `x` for a string not played: `x 3 2 0 x x`. Always six slots, always `code` mark. This is the one notation in the pathway that cannot be misread, which is why it is the only one used for a whole shape. |
| Single positions | `5·3` — string, then fret, `code` mark. Spell it out ("string 5, fret 3") the first time a chapter uses it. |
| Degrees | `1`, `3`, `b3`, `5`, `b5`, `#5`, always with the `code` mark. **These are exactly the labels the live components print on their dots** — prose and diagram must not disagree. Never `m3`. |
| Inversions | "root position", "first inversion", "second inversion". Slash notation (`C/E`) is named once in chapter 1 and used sparingly after. Figured bass never. |
| Qualities | "major", "minor", "diminished", "augmented". Chord symbols `C`, `Cm`, `Cdim`, `Caug` — matching what `triad-shape` prints in its heading. |
| Accidentals | Spell by the chord: C minor is C–`Eb`–G, F# major is F#–`A#`–C#. Default to sharps for a root that needs an accidental. |
| Note names | `code` mark. Scientific pitch (`C4`) only inside a `listen` question's audio spec, never in prose. |
| Key | **C major**, and its own minor and diatonic chords, unless a lesson names a reason to leave it. Chapter 3 uses C minor deliberately, against C major. |
| Frets | "fret 3"; the nut is "fret 0" or "open". |
| Chapters | Safe to name by number in prose — the app prints "Chapter 2" on the card. **Lessons are not numbered on screen**; name the topic or link the article by slug, never "the last lesson". |

---

## Components and screens this pathway uses

Two live components were built for this pathway before authoring began. **Their catalogue rows in
`LEARNING_CREATION.md` §7.3 are the authority on their props** — read that table, not this section,
when writing a `live` block.

- **`triad-shape`** — one triad, one set, one inversion, drawn where it sits. The workhorse: every
  shape lesson should use it, usually three times. Unlike `caged-shape` it draws **the grip and
  nothing else**, so there is no "the diagram holds more notes than your hand does" caveat to write
  — three dots are the chord. Unused strings are drawn muted.
- **`triad-ladder`** — every inversion along one set, on that set's three strings, across the whole
  neck, including the octave repeat. Use it for the claim a single diagram cannot make: the three
  inversions are one cycle, not three alternatives. Chapter closers and chapter 5.

`caged-shape`, `caged-ladder` and `scale-compare` also exist and are **wrong for this pathway**. Do
not reach for them; a lesson that wants a CAGED window has drifted out of scope.

Screens:

| Href | Used for |
| ---- | -------- |
| `/chord-shapes` | **The primary destination.** Its inversions pass is exactly this material — "here is that grip alongside every other way to play the chord". |
| `/chord-detector` | "Play it and check the app names it the chord you think it is" — devastating against misconception 1. **Be precise about what it returns**: the detector renders a slash whenever the root is not the sounding bass, so `x x 2 0 1 x` comes back as `C/E` — not `E`, and not a bare `C`. `mobile/src/lib/chord-analysis/chord-analysis.test.ts` pins `nameOf(['E','G','C']) === 'C/E'`. That is the better lesson anyway, since it is the notation the learner was just taught. |
| `/drone` | A sustained root to play a set against. Chapters 3–5. |
| `/metronome` | The comping and rhythm lessons. |
| `/ear-trainer` | Chapter 5's hearing lesson. |
| `/scale-visualizer` | Chapter 5's harmonised-scale lesson only. Do not send the learner here for shapes; it draws scales, not grips. |

Anything not in `LEARNING_CREATION.md` §7.3 / §7.4 does not exist. If a lesson wants a widget that is
not there, **do not build it** — write the lesson with what exists and report the request upward,
per §6.

---

## Naming and ids

Fixed here so parallel agents cannot collide. Section ids are progress keys and are **never** renamed
once published.

| Thing | Pattern | Example |
| ----- | ------- | ------- |
| Chapter id | `triads.ch<N>` | `triads.ch2` |
| Section id | `triads.ch<N>.<name>` | `triads.ch2.major-strings-2-3-4` |
| Article slug | `triad-<name>` | `triad-inversion` |
| Shape-lesson slug | `triad-<quality>-strings-<set>` | `triad-minor-strings-3-4-5` |
| Checkpoint slug | `triads-ch<N>-checkpoint` | `triads-ch3-checkpoint` |
| Activity slug | `triad-<name>` | `triad-find-the-inversions` |

Article ids are `art_<slug>`, quiz ids `quiz_<slug>`, activity ids `act_<slug>`, question ids
`q_<quiz-slug>.<name>`, round ids `r_<activity-slug>.<name>`. `publishedAt` is the date the chapter
is written. `passThresholdPct` is 70 everywhere, on both the quiz `meta` and the chapter
`checkpoint`.

Every document slug lives in one flat namespace across every pathway that will ever ship — hence the
`triad-` prefix on everything, without exception. Note that the CAGED pathway already owns
`caged-triad-c-form` and its four siblings; `triad-` never collides with `caged-triad-`, but do check
the corpus before settling a slug.

---

## Open questions resolved with the user

- **Scope order** — all major triads across all sets first, then minor against them, then diminished
  and augmented. Not set-by-set with all qualities at once.
- **Applied material** — one applied lesson closing chapter 2, the last of the major-triad chapters,
  so the payoff arrives before the minor material rather than after four chapters of diagrams; then
  a full applied chapter at the end.
- **Spread voicings** — out of scope, named once in chapter 5 as the follow-up.
- **Length** — 5 chapters, roughly 30 lessons, matching the CAGED pathway's weight so the two read
  as a series.
- **CAGED** — a recommended prerequisite, named in chapter 1's first lesson and nowhere else.
- **Live components** — `triad-shape` and `triad-ladder` were built as app code before authoring,
  rather than authoring around the gap. `caged-shape` cannot draw a triad on a string set.
- **Anchor key** — C major, matching the CAGED pathway, and the open C chord pays for itself
  immediately.
