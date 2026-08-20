// Where a learner stands in the ear pathway, derived from nothing but the
// curriculum above and the `section_progress` rows the device already holds.
//
// The rows are the same rows the Learn tab reads — an ear session records under
// its `sectionId` (`ear:major:1`), which `section_progress` accepts today
// because it keys on a free-form text pair. The prefix is what guarantees no
// collision with a content-authored section id, which always comes from
// published JSON.
//
// Pure, for the same reason `lib/learning/progress.ts` is: the tab hero, the
// pathway screen and the session screen all ask whether a session is passed,
// and two answers to that would be two answers to whether the learner may go on.

import type { ProgressBySection } from '@/lib/learning/progress';

import {
  EAR_PASS_PCT,
  EAR_SESSIONS,
  EAR_TRACKS,
  earSessionAt,
  type EarSession,
  type EarSessionAt,
  type EarTrack,
} from './curriculum';

/** The best a session has ever been scored, or null if it has never been sat. */
export function sessionBestPct(session: EarSession, progress: ProgressBySection): number | null {
  return progress.get(session.sectionId)?.bestScorePct ?? null;
}

/**
 * Whether a session has been cleared.
 *
 * `bestScorePct` only, never `completedAt`: a failed attempt still writes a
 * completion — the learner did sit the session — and reading that would unlock
 * the next one on the strength of a miss. The score is a high-water mark that
 * the sync table folds upwards on every merge (sync/tables/progress.ts), so a
 * pass cannot decay and nothing here needs to read-then-write.
 */
export function sessionPassed(session: EarSession, progress: ProgressBySection): boolean {
  const best = sessionBestPct(session, progress);

  return best !== null && best >= EAR_PASS_PCT;
}

/** `locked` — something earlier is unpassed. `open` — sittable. `passed` — cleared. */
export type EarSessionStatus = 'locked' | 'open' | 'passed';

/**
 * Locking is transitive: a session opens only once *every* session before it in
 * the flattened order has passed, not merely its immediate predecessor. Two
 * devices working offline can produce progress with a hole in it — session 5
 * passed while session 2 is not — and the predecessor-only rule would quietly
 * unlock past the hole. The first session has no predecessors and is never locked.
 */
export function sessionStatus(index: number, progress: ProgressBySection): EarSessionStatus {
  const session = EAR_SESSIONS[index];
  if (!session) throw new RangeError(`Ear session ${index} is outside the pathway.`);

  for (let before = 0; before < index; before += 1) {
    if (!sessionPassed(EAR_SESSIONS[before], progress)) return 'locked';
  }

  return sessionPassed(session, progress) ? 'passed' : 'open';
}

export interface EarTally {
  passed: number;
  total: number;
}

export function trackProgress(track: EarTrack, progress: ProgressBySection): EarTally {
  return {
    passed: track.sessions.filter((session) => sessionPassed(session, progress)).length,
    total: track.sessions.length,
  };
}

/** `locked` — an earlier track is unfinished. `open` — workable. `complete` — every session passed. */
export type EarTrackStatus = 'locked' | 'open' | 'complete';

export function trackStatus(trackIndex: number, progress: ProgressBySection): EarTrackStatus {
  const track = EAR_TRACKS[trackIndex];
  if (!track) throw new RangeError(`Ear track ${trackIndex} is outside the pathway.`);

  for (let before = 0; before < trackIndex; before += 1) {
    const tally = trackProgress(EAR_TRACKS[before], progress);
    if (tally.passed < tally.total) return 'locked';
  }

  const tally = trackProgress(track, progress);

  return tally.passed === tally.total ? 'complete' : 'open';
}

export interface EarPathwayProgress extends EarTally {
  /** Whole percent, 0–100. */
  pct: number;
}

export function pathwayProgress(progress: ProgressBySection): EarPathwayProgress {
  const passed = EAR_SESSIONS.filter((session) => sessionPassed(session, progress)).length;
  const total = EAR_SESSIONS.length;

  return { passed, total, pct: total === 0 ? 0 : Math.round((passed / total) * 100) };
}

/**
 * The session a Continue control opens: the first one not yet passed, which is
 * always the first open one — every session before it has passed, and that is
 * exactly the unlock condition. `null` means the whole pathway is cleared.
 */
export function nextSession(progress: ProgressBySection): EarSessionAt | null {
  const index = EAR_SESSIONS.findIndex((session) => !sessionPassed(session, progress));

  return index === -1 ? null : earSessionAt(index);
}

/** The one after this, in pathway order and across a track boundary. `null` at the end. */
export function sessionAfter(index: number): EarSessionAt | null {
  return earSessionAt(index + 1);
}
