# Creating a Learning Pathway

How an agent turns a topic ("modal interchange", "barre chords", "the CAGED system") into a
published pathway: chapters of lessons, gated by checkpoint quizzes, with optional
microphone activities.

You are reading this because you were handed this document and a topic. Read it end to end
before doing anything — including asking clarifying questions.

## Contents

1. [How to use this document](#1-how-to-use-this-document)
2. [Phase 0 — Understand the topic](#2-phase-0--understand-the-topic)
3. [Phase 1 — Brainstorm and approve](#3-phase-1--brainstorm-and-approve)
4. [The shape of a pathway](#4-the-shape-of-a-pathway)
5. [Phase 2 — Chapter agents](#5-phase-2--chapter-agents)
6. [Phase 3 — Lesson agents](#6-phase-3--lesson-agents)
7. [Authoring reference](#7-authoring-reference)
8. [Validation and finishing](#8-validation-and-finishing)
9. [Keeping this document current](#9-keeping-this-document-current)

---

## 1. How to use this document

### The three roles

| Role              | Model    | How many                         | Owns                                                                       |
| ----------------- | -------- | -------------------------------- | -------------------------------------------------------------------------- |
| **Top-level**     | —        | you, the session                 | Topic mastery, the brief, the curriculum file, dispatching chapter agents   |
| **Chapter agent** | Opus 5   | one per chapter, **sequential**  | The chapter's lesson plan, its checkpoint quiz, its activities, its chapter |
| **Lesson agent**  | Sonnet 5 | ≤ 4 lessons each, parallel       | Article JSON for the lessons it was assigned. Nothing else.                 |

Work flows down and results flow up. A chapter agent never talks to another chapter agent; a
lesson agent never talks to another lesson agent. Everything shared between them is a file on
disk, because a prompt is lossy and a file can be re-read.

### What content actually is

A pathway holds no content of its own. It is a tree of **refs** — every section names the slug
of a document authored separately. Five directories, one flat namespace:

```
packages/content/content/
  curriculum/<pathway-slug>.json    the tree: chapters → sections → refs
  articles/<slug>.json              a lesson
  quizzes/<slug>.json               a checkpoint (or a standalone quiz)
  activities/<slug>.json            a microphone drill
```

`packages/content/src/load.ts` loads all of it, validates every document through the *same* Zod
parsers the device runs (`packages/shared/src/content/`), and then checks what no single-file
parser can see: that every ref resolves, that no section id is reused, that each checkpoint
points at a `kind: "checkpoint"` quiz. That loader is the gate — see §8.

### Read these before authoring

- `packages/shared/src/content/types.ts` — every type an article is made of. The source of truth.
- `packages/shared/src/content/quiz.ts` — question kinds and grading.
- `packages/shared/src/content/activity.ts` — activity kinds and the rules that degrade a round.
- `packages/shared/src/content/curriculum.ts` — the pathway tree.
- `mobile/docs/articles.md` — the rendering architecture and how a live component is built.

### The existing `fundamentals` pathway is not an example

It is a two-chapter test fixture built to exercise the schema, and it is being removed. Its JSON
is structurally valid and worth reading for *shape* — file layout, id conventions, how a `live`
block is embedded. Do not read it for pedagogy, prose quality, chapter arc, or lesson length. It
was never written to teach anyone anything.

---

## 2. Phase 0 — Understand the topic

**Nothing is planned, dispatched, or written until this gate passes.** A pathway written from a
half-understood topic reads like a summary of a summary, and no amount of downstream agent effort
repairs it.

Answer these for yourself, in writing, in your own reply:

1. **Can you teach it?** Explain the topic from first principles, without reaching for jargon as
   an explanation. If a sentence would only make sense to someone who already knows the answer,
   you don't understand it yet.
2. **What does the learner get wrong?** Name the specific misconception someone arrives with.
   Good lessons are built against a misconception, not around a definition.
3. **What is guitar-specific about it?** This is a guitar app. Generic keyboard theory that never
   touches a fretboard is the single most common failure mode. Where does the neck's layout
   change the story — shapes that move, the B-string irregularity, open strings, positions,
   what's physically comfortable to play?
4. **What can the learner *do* afterwards** that they couldn't before? Phrase it as an action
   ("hear whether a progression borrowed from the parallel minor"), not as knowledge ("understands
   modal interchange").
5. **Where are the edges?** What is adjacent, commonly confused with this topic, and deliberately
   out of scope?

**If any answer is thin, research until it isn't.** Use WebSearch and WebFetch. Read more than one
source; theory writing on the web is full of confident contradictions, especially about naming
(modes, chord symbols, scale spellings). Where sources genuinely disagree, that disagreement is
usually worth a callout in the content — but decide on one convention for the pathway and hold it.

Check what the app already knows, too. `mobile/src/lib/` holds worked-out theory the content can
lean on and link to: `scale-library`, `chord-library`, `chord-analysis`, `key-analysis`,
`guitar-voicings`, `guitar-positions`, `theory`. If the app can already *show* something
interactively, the lesson should send the learner there rather than describing it in prose.

---

## 3. Phase 1 — Brainstorm and approve

Talk to the user before planning. Ask questions one at a time (or in a small batch via
AskUserQuestion when they're genuinely independent). You are trying to settle:

- **Who is this for**, and what do they already know? A pathway that re-teaches the fretboard for
  learners who wanted modal interchange wastes a chapter.
- **The scope boundary.** What is deliberately left out, and is there a follow-up pathway later?
- **The chapter arc** — the 3–6 movements of the story, each with a one-line claim about what the
  learner walks away able to do.
- **Difficulty and length** — `intro`, `core`, or `advanced`.
- **What it leans on.** Which existing tool screens (§7.4) and live components (§7.3) does this
  topic want? If the honest answer is "a widget that doesn't exist", surface it **now**, while it
  is still cheap. See the escalation rule in §6.

Then write `docs/pathways/<slug>/pathway.md` — the brief every chapter agent will read:

```markdown
# <Pathway title>

## Topic mastery
<Your Phase 0 answers, condensed. This is what a chapter agent inherits instead of
re-researching from scratch — it must be substantive, not a topic sentence.>

## Audience and prerequisites
## Out of scope
## The arc
Chapter 1 — <title>: <what the learner can do after it>
...

## Conventions
<Naming, spelling, and terminology decisions this pathway holds to: sharps vs flats,
degree notation, whether "mode" means X here, string numbering (1 = high e).>

## Components and screens this pathway uses
## Open questions resolved with the user
```

**Present the brief and get explicit approval before dispatching anything.** Do not treat "sounds
good" on the arc as approval of the written brief — the brief is what the subagents actually read.

---

## 4. The shape of a pathway

### Hard constraints

| Rule                                                          | Enforced by             |
| ------------------------------------------------------------- | ----------------------- |
| 3–6 chapters                                                   | this document           |
| 4–8 lessons per chapter, where **a lesson is one article**     | this document           |
| Exactly one checkpoint quiz per chapter, at the end            | this document           |
| No mid-chapter quiz sections (the schema allows them; we don't)| this document           |
| 0–2 activities per chapter                                     | this document           |
| Every activity section sets `"optional": true`                 | `loadContent()`         |
| A checkpoint refs a quiz whose `meta.kind` is `"checkpoint"`   | `loadContent()`         |
| Every `ref` resolves to a document of the matching `kind`      | `loadContent()`         |
| Section ids unique across the **entire corpus**, forever       | `loadContent()`         |
| `meta.slug` equals the filename stem                           | `loadContent()`         |

Chapters gate: a chapter opens only when every chapter before it is complete, and completes when
every counted section is done *and* the checkpoint is passed. Activities are `optional` and
therefore never counted — that is what stops a learner without a working microphone from being
stuck. Inside an open chapter, sections can be done in any order; the sequence is a suggestion
(`mobile/src/lib/learning/progress.ts`).

### Naming and ids

Read off the existing corpus. Every id is wire-stable — a progress row is keyed on the section id,
so **renaming one silently discards a learner's progress**. Choose carefully once.

| Thing              | Pattern                                | Example                             |
| ------------------ | -------------------------------------- | ----------------------------------- |
| Pathway `id`       | `path_<slug>`                          | `path_fundamentals`                 |
| Pathway `slug`     | kebab-case, = filename stem            | `fundamentals`                      |
| Chapter `id`       | `<pathway-slug>.ch<N>`                 | `fundamentals.ch1`                  |
| Chapter `slug`     | kebab-case, unique in the pathway      | `notes-and-distances`               |
| Section `id`       | `<pathway-slug>.ch<N>.<name>`          | `fundamentals.ch1.fretboard`        |
| Article `id`       | `art_<slug>`                           | `art_major-vs-minor`                |
| Quiz `id`          | `quiz_<slug>`                          | `quiz_fundamentals-ch1-checkpoint`  |
| Activity `id`      | `act_<slug>`                           | `act_find-the-a-notes`              |
| Question `id`      | `q_<quiz-slug>.<name>`                 | `q_fundamentals-ch1-checkpoint.g-to-b` |
| Round `id`         | `r_<activity-slug>.<name>`             | `r_find-the-a-notes.octave-ladder`  |
| Checkpoint slug    | `<pathway-slug>-ch<N>-checkpoint`      | `fundamentals-ch2-checkpoint`       |

**Section ids are validated against `/^[a-z0-9-]+\.[a-z0-9-]+\.[a-z0-9-]+$/`** in
`packages/content/src/load.test.ts` — exactly three dot-separated lowercase-kebab segments. No
underscores, no capitals, no fourth segment.

Document slugs live in one flat namespace across every pathway that will ever ship. Prefix a slug
with the pathway when the bare name would be generic: `blues-turnarounds`, not `turnarounds`.

### Other fields

- `estimatedMin` on a section: honest minutes. An article is roughly its `readingTimeMin` plus a
  minute of poking at anything live. The pathway's `estimatedMin` is the sum of every section's,
  recomputed at the end.
- `readingTimeMin` on an article: ~200 words/minute, rounded up, floor of 2.
- `difficulty`: `intro` (assumes nothing but that the guitar is in tune), `core` (assumes the
  fretboard and basic chords), `advanced` (assumes theory fluency).
- `publishedAt`: today's ISO date.
- `passThresholdPct`: **70** unless there's a reason. It appears twice — on the quiz document's
  `meta` and on the chapter's `checkpoint` — and the chapter's is the one the gate reads. Keep
  them equal; a mismatch is not a validation error but it is a bug.

### Who writes which file

This is the rule that keeps parallel agents from colliding, and the ordering that keeps validation
green throughout:

1. **Top-level** writes `packages/content/content/curriculum/<slug>.json` with the pathway meta
   and `"chapters": []`.
2. **Lesson agents** create only `articles/<their-slug>.json`. One file each, never shared.
3. **Chapter agent** creates `quizzes/` and `activities/` files for its chapter, then **appends
   its chapter object** to the curriculum file.
4. Because the chapter is appended only *after* its documents exist, every ref resolves at every
   point, so `loadContent()` passes after each chapter rather than only at the end.

Nobody but the top-level agent and the current chapter agent touches the curriculum file, and only
ever one at a time.

---

## 5. Phase 2 — Chapter agents

Chapters are built **one at a time, in order**, by an Opus 5 subagent. Sequential because chapter
N's lessons must build on what chapter N−1 actually said, not on what it was planned to say.

Dispatch with the Agent tool: `model: "opus"`, `subagent_type: "general-purpose"`.

### The dispatch contract

A chapter agent starts with an empty context. Everything it needs is in the prompt or in a file it
is told to read. The prompt must contain:

1. **Read these files first**: `LEARNING_CREATION.md`, `docs/pathways/<slug>/pathway.md`, and the
   `chapter-N.md` of every **preceding** chapter.
2. **Which chapter it owns** — number, title, slug, id, and the arc line for it from the brief.
3. **The topic context for this chapter specifically.** Not a pointer to the brief — the actual
   substance: what this chapter teaches, the misconception it targets, the guitar-specific angle,
   the theory it must get right. Enough that a competent agent could write the chapter from the
   prompt alone.
4. **What came before and what comes after.** Exactly which terms and skills earlier chapters
   established (so it doesn't re-teach them) and what the next chapter will assume (so it doesn't
   leave a hole).
5. **Its research mandate**: where its own knowledge is thin, it must research before planning.
   Same Phase 0 bar, scoped to its chapter.
6. **The constraints**: 4–8 article lessons, one checkpoint, ≤ 2 activities, ids for its chapter,
   and the file-ownership rule from §4.
7. **Its report format** (below).

### What a chapter agent does

1. **Close its own gaps.** Research until it can answer the Phase 0 questions for its chapter.
2. **Write `docs/pathways/<slug>/chapter-N.md`** — the granular lesson plan. Per lesson: slug, id,
   title, the one thing it teaches, the misconception it corrects, key points in order, which
   live components and screen links it should use, roughly how long, and **what the previous
   lesson left it** so lessons chain instead of restating. Then a sketch of the checkpoint (which
   lessons each question draws on) and of any activity.
3. **Dispatch lesson agents** (§6) — Sonnet 5, ≤ 4 lessons each, in parallel when the lessons
   don't depend on each other's exact wording.
4. **Read the finished articles.** Every one, as written — not as planned.
5. **Write the checkpoint quiz** from what the articles actually say. This ordering is the whole
   reason the chapter agent writes the quiz: a question drawn from the plan can test something a
   lesson ended up phrasing differently, or not covering at all.
6. **Write the activities**, if any (§7.5).
7. **Append its chapter** to the curriculum file.
8. **Validate** (§8) and fix whatever it broke. Do not report success on red.
9. **Report** to the top level: lessons written (slug + one line each), the checkpoint's coverage,
   activities, every judgement call it made, anything it could not do, and any live component it
   wanted but did not have.

### Between chapters

The top-level agent posts a short summary of the finished chapter to the user and **continues to
the next chapter without waiting** — unless the user interjects, the chapter failed validation, or
the chapter agent surfaced something that changes the plan (a component request, a scope problem,
a topic error). Those three stop the line.

---

## 6. Phase 3 — Lesson agents

A Sonnet 5 subagent writing article JSON. One agent may own **at most 4 lessons**; run several in
parallel when their lessons are independent, sequentially when lesson B must quote lesson A.

Dispatch with the Agent tool: `model: "sonnet"`, `subagent_type: "general-purpose"`.

### The dispatch contract

1. **Read first**: `LEARNING_CREATION.md` §4 and §7, `docs/pathways/<slug>/pathway.md`,
   `docs/pathways/<slug>/chapter-N.md`, and `packages/shared/src/content/types.ts`.
2. **Its lessons** — for each: slug, id, title, and the plan entry verbatim.
3. **The substance.** The theory each lesson must convey, correctly, in enough detail that the
   agent is not inventing music theory under time pressure. If it must research, say so and say
   what to verify.
4. **Voice and conventions** from the brief.
5. **Neighbours** — what the lesson before and after cover, and the exact terms already defined,
   so it can reference rather than redefine.
6. **The exact file paths to write** and the reminder that it writes *nothing* else.
7. **How to check its work**: `pnpm --filter @guitar/content test`. Its articles must parse.

### A lesson agent must not

- write or edit any app code (`mobile/`, `packages/shared/`, `packages/api/`, `packages/db/`)
- create a new live component, or use one that isn't in §7.3
- touch the curriculum file, another agent's article, a quiz, or an activity
- change a schema, a parser, or `SCHEMA_VERSION`
- invent block types, marks, link kinds, or props

**The component escalation rule.** When a lesson wants an interactive widget that doesn't exist,
the lesson agent does not build it. It writes the lesson using what exists and reports the request:
what the widget would show, why prose can't do it, and which lesson wants it. The chapter agent
collects requests and passes them up. **New live components are built by the top-level session,
with the user, as app code** — component + Zod props schema + registry entry + an entry in §7.3
here + the checklist in `mobile/docs/articles.md`. Then affected lessons can be revised.

---

## 7. Authoring reference

Everything a content agent may use. If it isn't here, it doesn't exist.

### 7.1 Article blocks

A document is `{ schemaVersion: 1, meta, blocks, footnotes? }`. `blocks` is a **flat array** — no
nesting; lists and tables bottom out at spans. Types: `packages/shared/src/content/types.ts`.
Renderers: `mobile/src/features/articles/blocks/`.

| Block       | Shape                                        | Use it for                                                                                 |
| ----------- | -------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `paragraph` | `{ spans }`                                  | Prose. The workhorse.                                                                        |
| `heading`   | `{ level: 1\|2\|3, spans }`                  | 1 = section, 2 = subsection, 3 = small mono label. The **title is not a block** — it's `meta.title`. |
| `list`      | `{ ordered: bool, items: Span[][] }`         | Steps (ordered) or a set of parallel facts (unordered). Not a dumping ground for prose.      |
| `callout`   | `{ tone: info\|tip\|warning, spans }`        | One idea set apart. Renders a label: info→"Note", tip→"Tip", warning→"Careful".              |
| `quote`     | `{ spans, attribution? }`                    | A real quotation. Not a decorative restatement of the paragraph above.                       |
| `divider`   | `{}`                                         | A hard turn in the argument. Sparingly — headings usually do this better.                    |
| `table`     | `{ header?: Span[][], rows: Span[][][] }`    | Comparisons across a fixed set of columns (degrees, formulas, shapes). Columns size equally, so keep cells short. |
| `image`     | `{ url, aspectRatio, alt, caption? }`        | **Avoid.** There is no asset pipeline; `url` must be a remote URL that will still exist in a year. |
| `live`      | `{ component, props }`                       | An interactive widget — see §7.3.                                                            |

Every block already carries its own top margin. Don't try to add spacing with empty paragraphs.

### 7.2 Rich text: spans, marks, links

Wherever text appears it is a `Span[]` — a run of characters sharing formatting:

```json
[
  { "text": "The " },
  { "text": "b3", "marks": ["code"] },
  { "text": " changes the mood", "marks": ["bold", { "type": "color", "tone": "amber" }] },
  { "text": " everywhere", "link": { "kind": "screen", "href": "/scale-visualizer" } }
]
```

**Marks** (`mobile/src/features/articles/RichText.tsx`), combinable on one span:

| Mark                              | Renders as               | Use for                                                    |
| --------------------------------- | ------------------------ | ---------------------------------------------------------- |
| `bold`                            | semibold, brighter ink   | The one word in a sentence that carries it.                 |
| `italic`                          | italic                   | A term being named rather than used.                        |
| `code`                            | mono, raised background  | Note names, degrees, formulas: `b3`, `W–W–H`, `5.3-4.2`.   |
| `highlight`                       | accent wash              | Rare. A phrase the eye must land on first.                  |
| `{ "type": "color", "tone": T }`  | tinted text              | Tying prose to colour used by a live component.             |

`tone` ∈ `accent` | `amber` | `rose` | `violet`. **Named tones only — the wire format never carries
hex.** An unknown mark is silently dropped, so a typo costs the formatting without any error.

**Links** (`kind` + payload), handled in `ArticleRenderer.tsx`:

| Link                                | Goes to                                                          |
| ----------------------------------- | ---------------------------------------------------------------- |
| `{ "kind": "article", "slug": … }`  | Another article. The slug must exist in the corpus.               |
| `{ "kind": "screen", "href": … }`   | An app screen — §7.4.                                             |
| `{ "kind": "url", "url": … }`       | An in-app browser. Use for genuine outside references only.       |
| `{ "kind": "footnote", "id": … }`   | Scrolls to the footnote. `id` must match an entry in `footnotes`. |

### 7.3 Live components

A `live` block names a component from the registry
(`mobile/src/features/articles/registry.tsx`). `props` is validated by that component's own Zod
schema — unregistered name, or props it rejects, renders an "update the app" placeholder instead
of crashing. **Only what is listed here may be used.**

| Name            | Props                                                                 | What it does, and when to reach for it                                                                                                                                                                      | File                                              |
| --------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| `scale-compare` | `{ root: RootName, scales: string[] }` — 1–4 scale-library ids         | One card per scale on the same root: its tones as chips, plus a play button that runs the scale with the sounding chip lit. Tones the later scales have that the first (reference) scale lacks are tinted amber. Use it whenever two scales differ by a few notes and the point is *which* notes. | `mobile/src/features/articles/live/ScaleCompare.tsx` |
| `caged-shape`   | `{ root: RootName, form: "C"\|"A"\|"G"\|"E"\|"D", show?: "roots"\|"triad"\|"pentatonic"\|"scale", caption?: string }` — `show` defaults to `"triad"` | One CAGED form of one major chord, drawn as the five-fret window it occupies on the neck, every note of the chosen layer marked with its degree and the roots lit. **It draws everything in the window, not one playable grip** — at `show: "triad"` that is 7–8 dots where a hand holds 4–6, because which of them a hand can reach at once is `/chord-shapes`'s question. Say so in prose or the lesson contradicts its own diagram. A play button runs the window low to high. **The four `show` layers nest** — roots ⊂ triad ⊂ pentatonic ⊂ scale — so the same `root` + `form` at four different `show` values is the same window filling in, which is the way to teach a form across a pathway rather than as four unrelated diagrams. Reach for it any time a lesson is about *one* shape in *one* place. | `mobile/src/features/articles/live/CagedShape.tsx` |
| `caged-ladder`  | `{ root: RootName, highlight?: "C"\|"A"\|"G"\|"E"\|"D" }`             | All five forms of one major chord at once along the whole neck, drawn as labelled bands with every root marked. Neighbouring forms alternate between two lanes, so the overlap between them shows as two bands stacked over the same frets instead of a collision. Use it for the claim `caged-shape` cannot make alone — that the forms are consecutive windows tiling the neck, not five alternatives. `highlight` lights one band and quiets the rest, for "here is where the form you just learned sits". | `mobile/src/features/articles/live/CagedLadder.tsx` |

Valid `scales` ids come from `SCALE_TYPES` in `mobile/src/lib/scale-library/catalog.ts` —
`major`, `minor`, `dorian`, `phrygian`, `lydian`, `mixolydian`, `locrian`, `major-pentatonic`,
`minor-pentatonic`, `blues`, `harmonic-minor`, `melodic-minor`, `phrygian-dominant`,
`lydian-dominant`, `altered`, and more. Check the file; an id it doesn't know is filtered out
silently. `root` must be a name `mobile/src/lib/chord-library/roots.ts` can spell.

Style note: when a live component uses colour to make its point, tint the same terms in the
surrounding prose with the same tone. `major-vs-minor.json` does this with amber.

### 7.4 Screen links

`{ "kind": "screen", "href": "/…" }` pushes the route as written. Routes live in
`mobile/src/app/`.

| Href                | Screen                                                     |
| ------------------- | ---------------------------------------------------------- |
| `/metronome`        | Metronome. Accepts `?bpm=90`.                               |
| `/scale-visualizer` | A scale mapped across the whole neck, paged by position. Its CAGED boxes are labelled "E form", "C form" … and are offered for **every** scale, pentatonics included. |
| `/scale-explorer`   | What to play over a detected key.                           |
| `/chord-shapes`     | Voicing library for a chord.                                |
| `/chord-detector`   | Listens and names the chord being played.                   |
| `/key-detector`     | Listens to a progression and estimates the key.             |
| `/ear-trainer`      | Interval and degree ear training.                           |
| `/drone`            | A sustained root to play against.                           |
| `/intonation`       | Intonation measurement per string.                          |

Other screens take route params, but those are internal hand-offs between screens (encoded
voicings, pitch-class indices) — not something to author by hand. Link the bare screen unless the
param is documented above.

### 7.5 Quizzes

`{ schemaVersion: 1, meta, questions }`. Types and grading:
`packages/shared/src/content/quiz.ts`. Screens: `mobile/src/features/quiz/`.

`meta`: `{ id, slug, title, summary?, kind: "quiz" | "checkpoint", passThresholdPct }`. A chapter
checkpoint is `kind: "checkpoint"` — `loadContent()` rejects a chapter pointing its checkpoint at
a plain quiz.

Every question has `id`, `prompt: Span[]`, optional `setup: Block[]` (blocks shown above the
prompt — a table, a live component to poke at), and optional `explanation: Span[]` revealed after
answering. **Always write the explanation.** A wrong answer with no explanation teaches nothing.

| Kind           | Extra fields                          | Use it for                                                                                       |
| -------------- | ------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `choice`       | `options` (≥2), `answerId`            | The default. One right answer, distractors that each encode a *specific* misunderstanding.        |
| `multi-select` | `options` (≥2), `answerIds`           | "Which of these are true." **Graded all-or-nothing** — partial credit is zero, so keep it to 4–5 options with 2–3 correct. |
| `listen`       | `audio`, `options` (≥2), `answerId`   | Ear questions. `audio` is `{ kind: "notes", notes: ["A3","C4"], mode: "sequence" \| "chord", tempoMs? }` in scientific pitch notation. |
| `fretboard`    | `frets`, `answer: FretPosition[]`     | "Show me where." The learner taps positions on a board `frets` wide. String 1 is the high e; fret 0 is open. |

`answerId`/`answerIds` must match option ids, or the question is dropped from grading and
`loadContent()` fails the publish.

**Writing a checkpoint.** 5–8 questions is right for a chapter. Cover every lesson; weight toward
what the chapter claimed the learner would be able to *do*. Test understanding, not recall of a
sentence's phrasing. Distractors should be answers a learner who half-understood would actually
pick — never filler. At 70%, a learner may miss roughly two of seven, so no single question should
be a trick.

### 7.6 Activities

`{ schemaVersion: 1, meta, activity }`. Types: `packages/shared/src/content/activity.ts`.
Runners: `mobile/src/features/activities/`, registered in `.../activities/registry.tsx`.

An activity listens to the microphone while the learner plays. It is **always optional, never
graded, never counted** toward progress — so it is where a chapter can ask for something physical
without anyone getting stuck. A chapter may have 0–2. Its section **must** set `"optional": true`.

**`note-play`** — find and play notes on the neck.

```json
{
  "kind": "note-play",
  "modes": ["easy", "hard"],
  "board": { "fretFrom": 0, "fretTo": 12 },
  "rounds": [
    { "kind": "targets", "id": "r_<slug>.<name>", "prompt": [...],
      "targets": [{ "string": 5, "fret": 0 }], "ordered": false, "board": { … } }
  ]
}
```

- `modes`: `easy` ghosts the targets onto the board with labels; `hard` gives only the prompt and a
  found-counter. Offering both is normal; they are different exercises (reading vs recalling).
- String 1 is the high e, string 6 the low E. Fret 0 is open.
- `ordered: true` requires the written order. `board` narrows the neck, per document or per round.
- **No two targets in one round may sound the same pitch.** The detector hears pitches, not
  strings, so string 5 fret 0 and string 6 fret 5 are indistinguishable — a round asking for both
  can never be completed, and the loader rejects it.
- Every target must sit inside its board's fret range, and on a six-string neck.

**`rhythm`** — play a pattern in time; only *when* you pick is detected, not what.

```json
{
  "kind": "rhythm",
  "rounds": [
    { "kind": "pattern", "id": "r_<slug>.<name>", "prompt": [...],
      "bpm": 80, "beatsPerBar": 4, "subdivision": 2, "bars": 2,
      "slots": ["accent","hit","hit","hit","hit","hit","hit","hit", …],
      "countInBars": 1 }
  ]
}
```

- `subdivision`: 1 = quarters, 2 = eighths, 4 = sixteenths (max 4). `slots` reads left to right and
  **must be exactly `beatsPerBar × subdivision × bars` long** — the most common authoring error.
- `hit` = pick, `rest` = don't, `accent` = pick harder (use it on the downbeat so the grid is
  readable). At least one `hit` or `accent`, or the round is silent and unfinishable.
- `bpm` 20–300 (the metronome's own range), `beatsPerBar` 1–12, `bars` 1–16, `countInBars` 0–2.
- Tell the learner in the `prompt` to mute the strings — this drill hears attacks, not notes.

3–4 rounds is a good activity: start inside what the chapter taught, end just past it.

### 7.7 Writing style

- **The title is `meta.title`,** never a heading block. Don't open with a heading either — open
  with a paragraph that earns the reader's attention.
- **Lead with the thing itself.** No "In this lesson we will explore…". State the claim, then
  support it.
- **One idea per paragraph**, 2–4 sentences. This is read on a phone.
- **Second person, present tense, plain words.** Explain a term the first time it appears, then use
  it confidently.
- **Note names, degrees, and formulas take the `code` mark** — `b3`, `W–W–H–W–W–W–H`, `A3`.
- **Reach for a live component or a screen link over a description** whenever the app can show it.
- **Callouts are for one idea**, not a paragraph that wanted emphasis. `warning` is for a real
  trap, not for emphasis.
- **Close with somewhere to go** — the next lesson's question, a screen to poke at, an article to
  read. Look at how `major-vs-minor.json` ends.
- **Length**: most lessons are 400–800 words. Under 300 the lesson probably belongs inside its
  neighbour; over 1000 it is probably two lessons.
- **Footnotes** are for the "well, actually" that would derail the paragraph. Zero or one per
  article.

---

## 8. Validation and finishing

### The gate

```bash
pnpm --filter @guitar/content test     # loads and validates the REAL corpus
```

This runs every document through the same parsers the device runs, then the cross-file checks. It
reports **every** problem, not the first. Green here is the definition of done for content. Run it
after every chapter, not once at the end.

```bash
cd mobile && pnpm lint                 # only if app code changed (a new live component)
```

**Do not run `pnpm format` while other work is in flight.** It is `prettier --write .` over the
*entire repo* — app code included, not just the JSON you authored. Markdown is excluded
(`.prettierignore` ends with `*.md`), which is the only part of that worth relying on. A chapter
agent that runs it will reformat files other sessions are editing. Format your own files instead:

```bash
pnpm exec prettier --write packages/content/content/**/<your-slugs>.json
```

### Decoding a failure

| Message                                                     | What it means                                                                    |
| ----------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `meta.slug is "x" but the filename says "y"`                | Rename the file or the slug. They must match.                                     |
| `refs "x", which is not a document in the corpus`           | Typo in a ref, or the chapter was appended before its documents existed.          |
| `is kind "article" but "x" is a quiz`                       | The section's `kind` disagrees with the document it points at.                    |
| `must set "optional": true`                                 | An activity section without the flag. Always set it.                              |
| `checkpoint refs "x", whose meta.kind is "quiz"`            | The quiz document needs `"kind": "checkpoint"`.                                   |
| `duplicate section id`                                      | Section ids are progress keys and are never reused, across any pathway.           |
| `did not parse as a gradable question`                      | Unknown question kind, or an `answerId` matching no option.                       |
| `did not parse as a runnable round`                         | The message names the reason — duplicate pitch, slots/grid mismatch, bpm range.   |
| `X slots for a 4×2×2 grid, which needs exactly 16`          | Count your `slots`.                                                               |

**Corpus-pinned tests.** `packages/content/src/load.test.ts` asserts on the corpus *by name and by
count* — how many articles, quizzes and activities exist, which pathway slugs, and which activity
slugs, in order. Adding or removing content will fail those assertions, and updating them is part
of the job, not a signal that something is broken. Update the expected lists; never weaken the
assertion.

A chapter typically touches four of them: the three counts, and the two activity lists. Mind the
ordering — the activity **slug** list is alphabetical (the loader reads each directory sorted),
while the activity **ref** list follows pathway then section order, so the two are not the same
sequence. Pathway slugs are alphabetical too, which is why `caged-fretboard` precedes
`fundamentals`.

### Finishing

1. Recompute the pathway's `estimatedMin` as the sum of its sections'.
2. Re-read the pathway end to end as a learner would. Does chapter 3 assume anything chapter 2
   never said? Does any lesson repeat another?
3. Commit the content and the `docs/pathways/<slug>/` plans together.
4. **Ask the user before publishing.** `pnpm content:publish` writes to the live Neon database. It
   validates first and refuses to touch the database on any error, republishing unchanged rows is
   a no-op, and it never deletes — but it is still a deliberate, outward-facing act, and it is the
   user's call.
5. Report: chapters, lessons, checkpoints, activities, any component requests still outstanding,
   and anything you decided that the user might want to revisit.

---

## 9. Keeping this document current

When a session builds something a future pathway could use, **this document is where it gets
recorded** — a capability nobody can find is a capability that doesn't exist. `mobile/docs/articles.md`
keeps the engineering how-to (how to build and register a live component); the catalogue lives
here.

**A new live component** — add a row to §7.3 with: the registry name (kebab-case, wire-stable,
never renamed once content uses it), its props as a reader can type them, 1–2 sentences on what it
does *and when an author should reach for it*, and the component's file path so the next agent can
read the props schema itself.

**A new activity kind, question kind, or block type** — add it to §7.6, §7.5, or §7.1 in the same
shape: what it expresses, the rules that will bite an author, the file.

**A new tool screen** — add its href and one line to §7.4.

**A process change** — if a pathway build reveals that a rule here is wrong, say so in the final
report rather than quietly working around it. The next session inherits whatever this file says.
