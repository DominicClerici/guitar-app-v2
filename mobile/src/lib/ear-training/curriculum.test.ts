import { describe, expect, it } from 'vitest';

import {
  EAR_SESSIONS,
  EAR_TRACKS,
  earSessionAt,
  earSessionById,
  type EarSession,
} from './curriculum';

const trackIds = EAR_TRACKS.map((track) => track.id);

describe('ear curriculum', () => {
  it('is three tracks of 6, 6 and 5 sessions', () => {
    expect(trackIds).toEqual(['major', 'minor', 'chromatic']);
    expect(EAR_TRACKS.map((track) => track.sessions.length)).toEqual([6, 6, 5]);
    expect(EAR_SESSIONS).toHaveLength(17);
  });

  it('gives every session a unique route id and a unique synced id', () => {
    const ids = EAR_SESSIONS.map((session) => session.id);
    const sectionIds = EAR_SESSIONS.map((session) => session.sectionId);

    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(sectionIds).size).toBe(sectionIds.length);
  });

  it('shapes both ids from the track and the position, and keeps them in step', () => {
    for (const track of EAR_TRACKS) {
      track.sessions.forEach((session, index) => {
        expect(session.id).toBe(`${track.id}-${index + 1}`);
        expect(session.sectionId).toBe(`ear:${track.id}:${index + 1}`);
        // The synced id is the route id with the prefix and the separator swapped;
        // neither is derived from the other at a call site, so this is where they meet.
        expect(session.sectionId).toBe(`ear:${session.id.replace('-', ':')}`);
      });
    }
  });

  it('keeps every degree set sorted, deduplicated, tonic-first and inside an octave', () => {
    for (const session of EAR_SESSIONS) {
      const { degrees } = session;

      expect(degrees).toContain(0);
      expect(degrees).toEqual([...new Set(degrees)].sort((a, b) => a - b));
      expect(degrees.every((degree) => degree >= 0 && degree <= 11)).toBe(true);
      expect(degrees.length).toBeGreaterThanOrEqual(2);
    }
  });

  it('adds to the previous session within a track and never takes away', () => {
    for (const track of EAR_TRACKS) {
      track.sessions.forEach((session, index) => {
        if (index === 0) return;

        const before = track.sessions[index - 1].degrees;
        expect(session.degrees).toEqual(expect.arrayContaining(before));
        expect(session.degrees.length).toBeGreaterThan(before.length);
      });
    }
  });

  it('states exactly the degrees a session introduces', () => {
    const added = (session: EarSession, before: EarSession | undefined) =>
      before === undefined
        ? []
        : session.degrees.filter((degree) => !before.degrees.includes(degree));

    for (const track of EAR_TRACKS) {
      track.sessions.forEach((session, index) => {
        expect(session.introduces).toEqual(added(session, track.sessions[index - 1]));
      });

      expect(track.sessions[0].introduces).toEqual([]);
    }
  });

  it('starts each track over rather than carrying the last one forward', () => {
    // A new tonality is a new ear: minor begins at two degrees and chromatic at four,
    // both narrower than the major track's finish.
    expect(EAR_TRACKS[0].sessions.at(-1)?.degrees).toHaveLength(7);
    expect(EAR_TRACKS[1].sessions[0].degrees).toHaveLength(2);
    expect(EAR_TRACKS[2].sessions[0].degrees).toHaveLength(4);
  });

  it('ends on the full wheel', () => {
    expect(EAR_SESSIONS.at(-1)?.degrees).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
  });
});

describe('earSessionById', () => {
  it('places a session in its track and in the flattened order', () => {
    const at = earSessionById('minor-3');

    expect(at?.session.sectionId).toBe('ear:minor:3');
    expect(at?.track.id).toBe('minor');
    expect(at?.trackIndex).toBe(1);
    expect(at?.indexInTrack).toBe(2);
    expect(at?.index).toBe(8);
  });

  it('is null for an id no release ever minted', () => {
    expect(earSessionById('major-9')).toBeNull();
    expect(earSessionById(undefined)).toBeNull();
  });
});

describe('earSessionAt', () => {
  it('walks the whole pathway in order', () => {
    EAR_SESSIONS.forEach((session, index) => {
      expect(earSessionAt(index)?.session).toBe(session);
    });
  });

  it('is null past the end', () => {
    expect(earSessionAt(EAR_SESSIONS.length)).toBeNull();
  });
});
