import { z } from 'zod';

import type { FretPosition } from './quiz';
import { sanitizeSpans, spanSchema } from './schema';
import type { Span } from './types';

// The activity wire format — types, validation, and the same forward-compatibility
// posture as the article and quiz schemas, for the same reason: content ships
// ahead of the app, and an old build must still open a chapter that gained an
// activity it has never heard of.
//
// An activity is a standalone screen inside a chapter — always optional, never
// graded, never counted toward progress. That is what makes the degraded forms
// below cheap: an activity this build can't run costs the learner nothing, so
// the parser can hand back a placeholder where the quiz parser would have had to
// worry about a denominator.
//
// The rules, mirroring quiz.ts:
//   · An unknown `activity.kind` — or a known kind whose payload doesn't
//     validate — becomes an `unknown` activity, which the screen renders as an
//     "update the app" placeholder. A note-play activity with no usable mode
//     lands here too: with neither difficulty runnable there is no activity
//     left to run, so degrading the whole thing is the honest answer.
//     Nothing about an unrecognised kind can throw, whatever the rest of its
//     payload holds or omits. This build knows only that it doesn't know what
//     an activity of that kind looks like, and guessing at required fields
//     would commit every kind we ever add to the shape of the two here.
//   · A malformed round inside a known kind becomes an `unknown` placeholder
//     round. It stays in the array so round numbering is stable across app
//     versions, and `runnableRounds` leaves it out. This covers both a round
//     shape we don't recognise and a recognised round we can't run — the
//     cross-field checks below, which are the ones that bite in practice.
//   · Rich text in a prompt follows the article rules (unknown marks and links
//     dropped) because it goes through the same sanitizer.
//   · Structural damage (bad meta, unsupported schemaVersion, no `activity` at
//     all, a round without a string id, or `rounds` not an array *on a kind
//     this build knows*) throws
//     ActivityParseError. A round we can't address is a round nothing can key a
//     placeholder or a progress entry on, so there is no partial form left. The
//     rounds check is scoped to known kinds on purpose: for note-play and rhythm
//     a missing round list is damage, but for a kind we've never heard of it is
//     just a shape we can't read, which is tier one's job and not an error.

/** The one version this build understands. Bumped only on breaking changes. */
export const ACTIVITY_SCHEMA_VERSION = 1;

export class ActivityParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ActivityParseError';
  }
}

export interface ActivityMeta {
  id: string;
  slug: string;
  title: string;
  summary?: string;
}

/** Inclusive fret range a board draws. 0 is the nut. */
export interface FretWindow {
  fretFrom: number;
  fretTo: number;
}

/**
 * 'easy' ghosts the targets onto the board with their labels; 'hard' leaves the
 * board blank and gives only the text prompt and a found-counter. The author
 * chooses which are offered because the two are different exercises — reading a
 * shape versus recalling one — not two settings of the same one.
 */
export type ActivityMode = 'easy' | 'hard';

// ─ note-play ─

export interface NotePlayRound {
  kind: 'targets';
  id: string;
  prompt: Span[];
  /** Positions to find. String 1 is the high e, counting toward the low E; fret 0 is open. */
  targets: FretPosition[];
  /** Targets must be played in the written order. Absent means any order. */
  ordered?: boolean;
  /** Narrows the document's board for this round alone. */
  board?: FretWindow;
}

// ─ rhythm ─

/** One cell of the grid: struck, silent, or struck harder. */
export type RhythmSlot = 'hit' | 'rest' | 'accent';

export interface RhythmRound {
  kind: 'pattern';
  id: string;
  prompt: Span[];
  bpm: number;
  beatsPerBar: number;
  /** Grid cells per beat: 1 = quarters, 4 = sixteenths. */
  subdivision: number;
  bars: number;
  /** The grid, read left to right. Always `beatsPerBar * subdivision * bars` long. */
  slots: RhythmSlot[];
  /** Bars of clicks before the pattern starts. The screen counts in one bar when absent. */
  countInBars?: number;
}

/**
 * A round this build can't run — newer content on an older client. Produced by
 * the parser, never authored. Kept in the list rather than spliced out so round
 * numbering still matches across app versions.
 */
export interface UnknownRound {
  kind: 'unknown';
  id: string;
}

export type RenderNotePlayRound = NotePlayRound | UnknownRound;
export type RenderRhythmRound = RhythmRound | UnknownRound;

export interface NotePlayActivity {
  kind: 'note-play';
  /** The difficulties the author allows. Non-empty, deduped, order-insensitive. */
  modes: ActivityMode[];
  /** The window every round is drawn and checked against unless it declares its own. */
  board?: FretWindow;
  rounds: RenderNotePlayRound[];
}

export interface RhythmActivity {
  kind: 'rhythm';
  rounds: RenderRhythmRound[];
}

/** Every activity kind this build can run. */
export type ActivityBody = NotePlayActivity | RhythmActivity;

/** An activity this build can't run at all — the screen offers an update instead. */
export interface UnknownActivity {
  kind: 'unknown';
  /** The activity's declared kind, for logging and curiosity. */
  originalKind: string;
}

/** What an activity screen consumes: a runnable activity or a placeholder. */
export type RenderActivity = ActivityBody | UnknownActivity;

export interface ActivityDocument {
  schemaVersion: number;
  meta: ActivityMeta;
  activity: RenderActivity;
}

// ─ pitch ─

/** Open-string pitches in standard tuning, indexed by wire string number − 1. */
const OPEN_STRING_MIDI = [64, 59, 55, 50, 45, 40];

/**
 * MIDI pitch sounding at a target in standard tuning — string 1 (high e) open is
 * 64, string 6 (low E) open is 40.
 *
 * Activities are checked by ear: the detector reports a pitch, never the string
 * that produced it, so a target is only ever matched by the note it sounds. Off
 * a six-string neck there is no such note, which is why this throws rather than
 * inventing one — inside the parser that throw is what degrades the round.
 */
export function midiForTarget(target: FretPosition): number {
  const open = OPEN_STRING_MIDI[target.string - 1];
  if (open === undefined) {
    throw new ActivityParseError(`String ${target.string} is not on a six-string neck.`);
  }
  return open + target.fret;
}

// ─ rounds ─

const fretWindowSchema = z
  .object({ fretFrom: z.number().int().min(0), fretTo: z.number().int().min(0) })
  // An inverted window admits no fret at all. Rejecting it here means a round
  // declaring one degrades on its own, and a document declaring one takes the
  // whole activity down — in both cases before the learner is handed a board
  // that can never be satisfied.
  .refine((window) => window.fretTo >= window.fretFrom, 'fretTo must not be below fretFrom');

// The six-string bound is left to midiForTarget rather than stated twice: a
// string this neck doesn't have is a round we can't check by ear, which is the
// same verdict for the same reason as a repeated pitch.
const fretPositionSchema = z.object({
  string: z.number().int().positive(),
  fret: z.number().int().min(0),
});

// Single-arm unions today, so a future round kind is an added arm rather than a
// schema break — an old build normalizes the unrecognised arm away into an
// unknown round and the rest of the activity still runs.
const notePlayRoundSchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('targets'),
    id: z.string().min(1),
    prompt: z.array(spanSchema),
    targets: z.array(fretPositionSchema).min(1),
    ordered: z.boolean().optional(),
    board: fretWindowSchema.optional(),
  }),
]);

const rhythmRoundSchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('pattern'),
    id: z.string().min(1),
    prompt: z.array(spanSchema),
    // The metronome's own range and meter limits (see the mobile metronome's
    // patterns module): a tempo it cannot be set to is a pattern nobody can play
    // along with.
    bpm: z.number().int().min(20).max(300),
    beatsPerBar: z.number().int().min(1).max(12),
    subdivision: z.number().int().min(1).max(4),
    bars: z.number().int().min(1).max(16),
    slots: z.array(z.union([z.literal('hit'), z.literal('rest'), z.literal('accent')])).min(1),
    countInBars: z.number().int().min(0).max(2).optional(),
  }),
]);

/**
 * Cross-field checks live here rather than in zod for the reason `requireAnswerable`
 * does in quiz.ts: a "known kind, unusable payload" should cost one round, and
 * normalizeNotePlayRound already turns a throw into a placeholder.
 *
 * Two targets sounding the same pitch is the important one. Rounds exist because
 * the microphone hears a note and not the string it came from, so a round asking
 * for the same pitch twice can never be resolved — shipping it as a real round
 * would leave the learner tapping at a board that refuses to complete.
 */
function sanitizeNotePlayRound(
  wire: z.infer<typeof notePlayRoundSchema>,
  documentBoard: FretWindow | undefined,
): NotePlayRound {
  const board = wire.board ?? documentBoard;
  const heard = new Set<number>();

  for (const target of wire.targets) {
    const midi = midiForTarget(target);
    if (heard.has(midi)) {
      throw new ActivityParseError(`Round ${wire.id} asks for MIDI ${midi} twice.`);
    }
    heard.add(midi);

    if (board && (target.fret < board.fretFrom || target.fret > board.fretTo)) {
      throw new ActivityParseError(
        `Round ${wire.id} targets fret ${target.fret}, outside frets ${board.fretFrom}–${board.fretTo}.`,
      );
    }
  }

  return {
    kind: 'targets',
    id: wire.id,
    prompt: sanitizeSpans(wire.prompt),
    targets: wire.targets,
    ...(wire.ordered !== undefined && { ordered: wire.ordered }),
    ...(wire.board && { board: wire.board }),
  };
}

function sanitizeRhythmRound(wire: z.infer<typeof rhythmRoundSchema>): RhythmRound {
  const expected = wire.beatsPerBar * wire.subdivision * wire.bars;
  if (wire.slots.length !== expected) {
    throw new ActivityParseError(
      `Round ${wire.id} has ${wire.slots.length} slots for a ${expected}-slot grid.`,
    );
  }

  // A pattern of pure rests has nothing to detect, so it can never be finished.
  if (!wire.slots.some((slot) => slot === 'hit' || slot === 'accent')) {
    throw new ActivityParseError(`Round ${wire.id} is silent — no hit to play.`);
  }

  return {
    kind: 'pattern',
    id: wire.id,
    prompt: sanitizeSpans(wire.prompt),
    bpm: wire.bpm,
    beatsPerBar: wire.beatsPerBar,
    subdivision: wire.subdivision,
    bars: wire.bars,
    slots: wire.slots,
    ...(wire.countInBars !== undefined && { countInBars: wire.countInBars }),
  };
}

/**
 * Shared by both round kinds because the rule belongs to the format rather than
 * to any one activity: an id makes an unrecognised round addressable — future
 * content. Without one there is nothing to hang a placeholder or a progress
 * entry on, so the document is corrupt.
 */
function unknownRound(raw: unknown, index: number): UnknownRound {
  const id = typeof raw === 'object' && raw !== null ? (raw as { id?: unknown }).id : undefined;
  if (typeof id === 'string' && id.length > 0) return { kind: 'unknown', id };

  throw new ActivityParseError(`Round ${index} is not an object with a string "id".`);
}

function normalizeNotePlayRound(
  raw: unknown,
  index: number,
  documentBoard: FretWindow | undefined,
): RenderNotePlayRound {
  const known = notePlayRoundSchema.safeParse(raw);
  if (known.success) {
    try {
      return sanitizeNotePlayRound(known.data, documentBoard);
    } catch {
      // Shape we recognise but can't run. Same outcome as an unknown kind: it
      // holds its place in the list and stays out of runnableRounds.
      return { kind: 'unknown', id: known.data.id };
    }
  }

  return unknownRound(raw, index);
}

function normalizeRhythmRound(raw: unknown, index: number): RenderRhythmRound {
  const known = rhythmRoundSchema.safeParse(raw);
  if (known.success) {
    try {
      return sanitizeRhythmRound(known.data);
    } catch {
      return { kind: 'unknown', id: known.data.id };
    }
  }

  return unknownRound(raw, index);
}

// ─ activity ─

/** Canonical order, so two documents listing the same modes parse identically. */
const ACTIVITY_MODES: readonly ActivityMode[] = ['easy', 'hard'];

const activitySchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('note-play'),
    modes: z.array(z.union([z.literal('easy'), z.literal('hard')])).min(1),
    board: fretWindowSchema.optional(),
    rounds: z.array(z.unknown()),
  }),
  z.object({
    kind: z.literal('rhythm'),
    rounds: z.array(z.unknown()),
  }),
]);

/**
 * The kinds this build can run, as a record so that adding an arm to
 * `ActivityBody` without listing it here fails to typecheck. It decides which
 * activities the `rounds` requirement below applies to, and getting that set
 * wrong silently would turn a real document into a placeholder.
 */
const KNOWN_ACTIVITY_KINDS: Record<ActivityBody['kind'], true> = {
  'note-play': true,
  rhythm: true,
};

/**
 * What an activity with no readable `kind` is named in its placeholder.
 * `originalKind` exists to be logged, and an empty string there would read as an
 * activity whose kind is literally "". Parenthesised so it can never collide
 * with a kind a future document actually declares.
 */
const UNSPECIFIED_KIND = '(unspecified)';

function normalizeActivity(raw: unknown): RenderActivity {
  const fields = typeof raw === 'object' && raw !== null ? (raw as Record<string, unknown>) : {};
  const declaredKind = fields.kind;
  const originalKind =
    typeof declaredKind === 'string' && declaredKind.length > 0 ? declaredKind : UNSPECIFIED_KIND;

  // Only for a kind we understand: we know note-play and rhythm are lists of
  // rounds, so a document declaring one without a round list is damage rather
  // than novelty, and silently showing an empty activity would hide it. An
  // unrecognised kind gets no such demand — it may not be round-based at all.
  if (Object.hasOwn(KNOWN_ACTIVITY_KINDS, originalKind) && !Array.isArray(fields.rounds)) {
    throw new ActivityParseError(`Activity "${originalKind}" has no "rounds" array.`);
  }

  const known = activitySchema.safeParse(raw);
  if (!known.success) return { kind: 'unknown', originalKind };

  const activity = known.data;
  switch (activity.kind) {
    case 'note-play': {
      const declared = new Set<ActivityMode>(activity.modes);
      const board = activity.board;
      return {
        kind: 'note-play',
        modes: ACTIVITY_MODES.filter((mode) => declared.has(mode)),
        ...(board && { board }),
        rounds: activity.rounds.map((round, index) => normalizeNotePlayRound(round, index, board)),
      };
    }
    case 'rhythm':
      return { kind: 'rhythm', rounds: activity.rounds.map(normalizeRhythmRound) };
  }
}

// ─ meta & document ─

const activityMetaSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  title: z.string().min(1),
  summary: z.string().optional(),
});

const activityDocumentSchema = z.object({
  schemaVersion: z.number(),
  meta: activityMetaSchema,
  // Opaque, down to whether it is an object at all: what an activity has to
  // look like is a question only normalizeActivity can ask, and only of the
  // kinds it knows. Present, though — a document carrying no activity is not
  // something a newer build would have written.
  activity: z.unknown(),
});

function describe(error: z.ZodError): string {
  return error.issues
    .map((issue) => `${issue.path.join('.') || '(root)'}: ${issue.message}`)
    .join('; ');
}

export function parseActivityMeta(data: unknown): ActivityMeta {
  const result = activityMetaSchema.safeParse(data);
  if (!result.success) {
    throw new ActivityParseError(`Invalid activity meta — ${describe(result.error)}`);
  }
  return result.data;
}

export function parseActivityDocument(data: unknown): ActivityDocument {
  const result = activityDocumentSchema.safeParse(data);
  if (!result.success) {
    throw new ActivityParseError(`Invalid activity document — ${describe(result.error)}`);
  }

  const { schemaVersion, meta, activity } = result.data;
  if (schemaVersion !== ACTIVITY_SCHEMA_VERSION) {
    throw new ActivityParseError(
      `Unsupported schemaVersion ${schemaVersion} (this build reads ${ACTIVITY_SCHEMA_VERSION}).`,
    );
  }

  return { schemaVersion, meta, activity: normalizeActivity(activity) };
}

/**
 * The rounds this build can actually run — the parallel of `gradableQuestions`,
 * and the only list a screen should count or step through. It takes the rounds
 * rather than the document because the round type follows the activity kind, and
 * a caller has already narrowed to one by the time it has rounds to run.
 */
export function runnableRounds<T extends { kind: 'targets' | 'pattern' }>(
  rounds: readonly (T | UnknownRound)[],
): T[] {
  return rounds.filter((round): round is T => round.kind !== 'unknown');
}
