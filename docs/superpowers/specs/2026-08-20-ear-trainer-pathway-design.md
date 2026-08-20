# Ear Trainer — a graded pathway over the degree circle

**Date:** 2026-08-20
**Status:** approved, ready for planning

## Problem

The Ear tab holds one mode. Free Play (`src/screens/EarTrainerScreen.tsx`) proves the concept —
a drone, a tone, and twelve degrees on a fifths circle — but it is a sandbox: the learner picks
their own degrees, nothing is graded, nothing is remembered, and there is no reason to come back
tomorrow rather than today.

What is missing is a *route through it*. A learner who does not already know functional ear
training has no way to know that two degrees is where you start, that the fifth comes before the
second, or that the minor scale is a separate journey rather than a footnote to the major one.

This spec defines that route: one ear pathway, three sub-pathways, seventeen graded sessions,
gated sequentially and tracked through the existing sync engine.

## Scope

**In:** the curriculum data, the gating rules, the graded session loop, the pathway overview
screen, the session screen with its summary, and the Ear tab's new front page.

**Out:** Free Play changes. It stays exactly as it is, listed below the pathway as the open-ended
sandbox, and its `useTrainer` hook is not touched.

**Out:** any change to the sync protocol, the database schema, `@guitar/shared`, the content
publish script, or the Worker. The design's central claim is that none of that is needed.

**Out:** the Learn tab. The ear pathway does not appear there, does not create a
`pathway_enrollments` row, and does not count against `MAX_ACTIVE_PATHWAYS`.

## The curriculum

Degrees are semitones above the tonic throughout, matching `DEGREE_LABELS` in
`src/lib/ear-training/degrees.ts` — `1`=0, `b2`=1, `2`=2, `b3`=3, `3`=4, `4`=5, `#4`=6, `5`=7,
`b6`=8, `6`=9, `b7`=10, `7`=11.

Each session carries two ids. `id` is route-safe and appears in the URL; `sectionId` is what the
synced row is keyed on. They are mechanically related but both are declared, so neither is derived
by string surgery at a call site.

```ts
interface EarSession {
  /** Route-safe, e.g. 'major-1'. What `/ear-session/[id]` carries. */
  id: string;
  /** What the synced row is keyed on, e.g. 'ear:major:1'. Permanent. */
  sectionId: string;
  title: string;
  /** Semitones above the tonic, sorted, always containing 0. */
  degrees: number[];
  /** Degrees added since the previous session in this track. Empty for a track's first. */
  introduces: number[];
}

interface EarTrack {
  id: string;
  title: string;
  blurb: string;
  sessions: EarSession[];
}
```

### Major — the major scale, one degree at a time

| # | id | sectionId | Title | Degrees | Adds |
|---|---|---|---|---|---|
| 1 | `major-1` | `ear:major:1` | The Third | 1, 3 | — |
| 2 | `major-2` | `ear:major:2` | The Fifth | 1, 3, 5 | 5 |
| 3 | `major-3` | `ear:major:3` | The Second | 1, 2, 3, 5 | 2 |
| 4 | `major-4` | `ear:major:4` | The Sixth | 1, 2, 3, 5, 6 | 6 |
| 5 | `major-5` | `ear:major:5` | The Seventh | 1, 2, 3, 5, 6, 7 | 7 |
| 6 | `major-6` | `ear:major:6` | The Fourth | 1, 2, 3, 4, 5, 6, 7 | 4 |

### Minor — the same walk, in the minor scale

| # | id | sectionId | Title | Degrees | Adds |
|---|---|---|---|---|---|
| 1 | `minor-1` | `ear:minor:1` | The Minor Third | 1, b3 | — |
| 2 | `minor-2` | `ear:minor:2` | The Fifth | 1, b3, 5 | 5 |
| 3 | `minor-3` | `ear:minor:3` | The Second | 1, 2, b3, 5 | 2 |
| 4 | `minor-4` | `ear:minor:4` | The Minor Sixth | 1, 2, b3, 5, b6 | b6 |
| 5 | `minor-5` | `ear:minor:5` | The Minor Seventh | 1, 2, b3, 5, b6, b7 | b7 |
| 6 | `minor-6` | `ear:minor:6` | The Fourth | 1, 2, b3, 4, 5, b6, b7 | 4 |

### Chromatic — both of everything, ending on the full wheel

| # | id | sectionId | Title | Degrees | Adds |
|---|---|---|---|---|---|
| 1 | `chromatic-1` | `ear:chromatic:1` | Both Thirds | 1, b3, 3, 5 | — |
| 2 | `chromatic-2` | `ear:chromatic:2` | Both Seconds | 1, b2, 2, b3, 3, 5 | b2, 2 |
| 3 | `chromatic-3` | `ear:chromatic:3` | Both Sixths | 1, b2, 2, b3, 3, 5, b6, 6 | b6, 6 |
| 4 | `chromatic-4` | `ear:chromatic:4` | Both Sevenths | 1, b2, 2, b3, 3, 5, b6, 6, b7, 7 | b7, 7 |
| 5 | `chromatic-5` | `ear:chromatic:5` | All Twelve | all twelve | 4, #4 |

`introduces` is the **set** of degrees a session adds to its predecessor *within its own track* —
`number[]`, not a single degree, because three of the chromatic sessions add a pair and naming one
of them would hide the other. It is empty for the first session of each track, which has no
predecessor to differ from; those rows read the track's blurb instead. The row always renders the
full degree set as chips regardless, so nothing depends on this field being interesting.

Note that the tracks are **not** cumulative across their boundary: the minor track starts again at
two degrees, and the chromatic track starts at four. That is deliberate — a new tonality is a new
ear, not a harder version of the last one.

## Progress and gating — no schema change

### Where a result is stored

A session records against `section_progress` and `quiz_attempts` under its `sectionId` from the
tables above — never its route `id`. Both tables key on a free-form `(user_id, section_id)` text pair
(`packages/db/src/schema.sqlite.ts`), so an `ear:`-prefixed id is a legal row today. The prefix is
what guarantees no collision with a content-authored curriculum section id, which always comes
from published JSON.

**These ids are permanent.** Changing a session's degree set in a later release means minting a new
id, never editing an existing one — a learner's stored result describes the session they actually
sat.

The write is the existing `recordAttempt(userId, sectionId, score)` from
`src/features/quiz/record.ts`, called with a `QuizScore` built from the session tally:

```ts
{ correct, total: 10, scorePct: Math.round((correct / 10) * 100), passed: scorePct >= 70 }
```

`Math.round` matters for the same reason it does in `scoreQuiz`: the gate re-derives from the
*stored* number, so rounding in one place and comparing in another would let a session pass on the
summary screen and stay locked on the pathway screen.

### Why replay is safe for free

`section_progress` is the one monotonic table (`src/lib/sync/tables/progress.ts`). Its merge folds
`completedAt` to the earliest and `bestScorePct` to the greatest, in all three directions — a
server pull, a guest-account carry-over, and the app's own `writeLocalRow`. So:

- Re-running a passed session and scoring worse leaves the row at the better score. It cannot
  un-pass.
- Two devices offline on the same session converge without either trusting a clock.
- Nothing in the ear feature needs to read-then-write, or compute a high-water mark of its own.

A failed attempt still writes `completedAt` — the learner did sit the session — but the gate reads
`bestScorePct` only, so a completed-but-failed session correctly stays unpassed.

### The rules

Pure functions in `src/lib/ear-training/earProgress.ts`, over the flattened seventeen-session list
and a `ProgressBySection` map:

- `sessionPassed(session, progress)` — `bestScorePct >= 70`. Same shape as `checkpointPassed` in
  `src/lib/learning/progress.ts`.
- `sessionStatus(index, progress) → 'locked' | 'open' | 'passed'` — **transitively** locked: a
  session opens only once *every* session before it in the flattened order has passed, not merely
  its immediate predecessor. This mirrors `chapterStatus` and exists for the same reason: two
  devices working offline can produce progress with a hole in it, and the predecessor-only rule
  would quietly unlock past the hole.
- `trackStatus(trackIndex, progress)`, `trackProgress(track, progress)` → `{ passed, total }`,
  `pathwayProgress(progress)` → `{ passed, total, pct }`.
- `nextSession(progress)` — the first session that is not passed, or `null` when all seventeen are.

Reads go through `useLearnerId` and `useProgress` from `src/lib/learning`. `useProgress` already
selects every `section_progress` row for the account, so the ear rows arrive in the same map as
the article ones with no second query and no new hook.

Guest accounts have a real `user_id` (`src/lib/auth/guest.ts`), so progress works before anyone
signs in and follows them into a claimed account.

## The session loop

### Shape

```
mount → drone on at a random tonic                                (~600ms settle)
      → orientation: 1, 3, 5 across three octaves ascending       (~2.0s)
      → question 1 of 10
          · a tap on a live seat IS the answer; dead seats are locked
          · the circle's centre holds Replay
      → reveal, right or wrong
          · the asked degree lit accent; a wrong pick lit rose
          · on a miss, the picked degree sounds in the question's own octave
          · taps now audition, in that same octave
          · the circle's centre holds Continue
      → repeat to ten → summary
```

### Decisions this encodes

**Orientation is always 1, 3, 5**, in all three octaves, whichever session is running — nine
strikes at roughly 220ms, a little under two seconds. It is a fixed landmark rather than a preview
of the session's own set, which means a minor session still hears a major third on the way in. That
is accepted: the point of the sequence is to plant the tonic, and a constant shape does that more
reliably than one that changes under the learner every session.

**One random tonic per session**, held across all ten questions — drawn uniformly from all twelve
pitch classes, with no memory of the previous session's key. Random so a degree is never learned as
an absolute pitch; held so a key change never muddies a graded run. (Uniform rather than
"anything but last time", because a session is a fresh start and there is nothing for a repeat to
spoil — unlike `pickTonic` in `session.ts`, where a roaming key change must be *audible* and so
excludes the key already sounding.)

**Both verdicts hold for Continue.** Correct answers do not auto-advance, unlike Free Play. The
session is self-paced, and the same gesture ends every question.

**A tap during an open question is an answer, never an audition.** Free listening while a question
is open would make 70% meaningless. Replay stays available during the question — it re-sounds the
same tone and reveals nothing new — and full auditioning opens the moment the answer is in.

**All twelve seats stay on the circle**, with out-of-play degrees dimmed and untappable. The ring's
geometry never moves, so the map learned in session one is the map used in session seventeen.

**Leaving mid-session records nothing.** There is no partial credit and no resume.

### Engine change

`playTone` in `src/features/ear-trainer/trainerEngine.ts` gains an options argument:

```ts
playTone(midi: number, opts?: { delay?: number; decay?: number }): void
```

`delay` schedules against the audio clock rather than a `setTimeout` chain, so the nine
orientation strikes land evenly regardless of what the JS thread is doing. `decay` lets those
strikes run short (~0.35s) instead of the question tone's 1.6s, which is what keeps the sequence
reading as nine notes rather than one chord. Both default to today's behaviour, so Free Play is
unaffected.

This is the only edit to the engine. The drone, the reverb, the audio session, and the tone voice
are all reused as they are — a question tone and an audition tone must be the same voice, or
comparing two degrees compares two instruments.

### `useEarSession`

A new hook beside `useTrainer`, not an extension of it. Both sit on the same `trainerEngine` (one
audio graph, one drone, one clock) and the same pure state machine in
`src/lib/ear-training/session.ts` — `createSession`, `nextQuestion`, `grade`, `summary` are used
unchanged, with a `TrainerConfig` of the session's degrees and a `fixed` key policy.

The hooks are kept apart because they differ in exactly the places that matter: the drone is
user-toggled in one and auto-started in the other; questions are unbounded in one and capped at
ten in the other; a correct answer advances itself in one and holds in the other. Folding those
into a `mode` flag would put the graded path at risk of every sandbox change, and factoring out a
shared core would leave a core that is mostly flags. The duplicated timer plumbing is around forty
lines and is the cheap half.

Phases: `'orientation' | 'question' | 'reveal' | 'summary'`.

## Screens

### Ear tab — `src/screens/EarTab.tsx`

Rewritten as two cards. The pathway hero comes first: current track, current session title, a
`ProgressTrack` across the seventeen, and one action, in three states:

- nothing passed → *Begin*, opening `major-1`
- partway → *Continue*, opening `nextSession(progress)`
- all seventeen passed → the hero reads as complete and the action becomes *Practise again*,
  opening `chromatic-5`, the full wheel

Free Play keeps its existing card below it, unchanged.

### `/ear-pathway` → `EarPathwayScreen`

Three track cards as an accordion, the current one expanded, closely following `PathwayScreen`:
folded cards for what is behind, the open one showing its sessions as rows, locked ones showing
what stands in the way. A `BottomDock` carries the Continue action once the in-page copy scrolls
off, same as the pathway screen does.

A session row carries: the step marker (done / here / to do), the title, the degree set as chips,
and the best score where one exists.

Unlike a curriculum chapter, **sessions inside a track are ordered and gated** — there is no
"every section is open in any order" rule here, because each session is defined by adding to the
last.

### `/ear-session/[id]` → `EarSessionScreen`

The loop above, then the summary in place rather than on a fourth route: score, the verdict against
70%, per-degree accuracy bars from the `SessionSummary.perDegree` tally, and the next action — *Next session*
on a pass, *Try again* on a miss, with the other always reachable.

## Files

**New**

| Path | What |
|---|---|
| `src/lib/ear-training/curriculum.ts` | the three tracks, as data |
| `src/lib/ear-training/curriculum.test.ts` | shape invariants |
| `src/lib/ear-training/earProgress.ts` | status, gating, next-session |
| `src/lib/ear-training/earProgress.test.ts` | gating rules |
| `src/lib/ear-training/orientation.ts` | the nine-tone sequence for a tonic |
| `src/lib/ear-training/orientation.test.ts` | pitches and timing |
| `src/features/ear-trainer/useEarSession.ts` | the graded loop |
|  `src/features/ear-trainer/SessionResult.tsx` | score and per-degree breakdown |
| `src/features/ear-trainer/TrackCard.tsx` | one sub-pathway in the accordion |
| `src/features/ear-trainer/SessionRow.tsx` | one session row |
| `src/features/ear-trainer/PathwayHero.tsx` | the Ear tab's front card |
| `src/screens/EarPathwayScreen.tsx` | overview |
| `src/screens/EarSessionScreen.tsx` | the session |
| `src/app/ear-pathway.tsx` | route |
| `src/app/ear-session/[id].tsx` | route |
| `src/components/StepMarker.tsx` | the shared done/here/todo dot |

**Modified**

| Path | Change |
|---|---|
| `src/features/ear-trainer/trainerEngine.ts` | `playTone` options |
| `src/features/ear-trainer/index.ts` | exports |
| `src/lib/ear-training/index.ts` | exports |
| `src/screens/EarTab.tsx` | pathway hero above Free Play |
| `src/features/learning/ChapterCard.tsx` | use `StepMarker` |

Extracting `Marker` out of `ChapterCard` is a targeted improvement rather than drive-by
refactoring: without it the ear rows grow a second implementation of the same three-state dot, and
the two drift the first time either is touched.

## Testing

Vitest already covers `src/lib/**`, `src/features/**` and `src/components/**` for pure modules.

**Curriculum** — `id` and `sectionId` both unique across all seventeen and matching their
respective `<track>-<n>` / `ear:<track>:<n>` shapes, and agreeing with each other; every degree set
sorted, deduplicated, containing the tonic, and within 0–11; each session's set a strict superset
of its predecessor *within its own track*; `introduces` equal to the set difference from that
predecessor and empty for each track's first session; the counts 6/6/5.

**Gating** — a locked session stays locked when a later one somehow has a passing row (the
transitive rule); exactly 7 of 10 passes and 6 of 10 does not; a failing retake after a pass leaves
the status passed; `nextSession` on an empty map is the first session and on a full map is `null`;
track and pathway tallies.

**Orientation** — nine MIDI values for a given tonic, strictly ascending, matching
`toneMidiFor(tonic, degree, octave)` for degrees 1/3/5 across octaves −1/0/+1; the ninth strike's
delay under 1.8s, and that delay plus the short decay under 2.2s, so the whole sequence stays
inside the ~2s budget.

The loop hook, the engine, and the screens are not unit-tested — they are React and audio, which
the repo's test boundary deliberately excludes.

Verification is `pnpm lint` in `mobile/` (typecheck, eslint, vitest). The API integration suite is
**not** needed: nothing here touches `packages/db`, `packages/api`, `packages/shared`, or a
migration.

## What this deliberately does not do

- **No new synced table.** The one design question worth re-opening later is whether per-question
  history (which degree, which octave, right or wrong) is worth its own table for a future "your
  weakest degrees" view. It is not needed for anything in this spec, and `quiz_attempts` already
  gives per-attempt history.
- **No unlocking of Free Play's degree picker.** The sandbox stays fully open; coupling it to
  pathway progress would make the sandbox less useful to the people most able to use it.
- **No review sessions.** Each track ends on its own full set, which is already a review of
  everything before it in that track.
