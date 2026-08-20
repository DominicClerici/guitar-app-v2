// The ear pathway, as data: three tracks of graded sessions over the same
// twelve-degree circle Free Play uses, each session adding to the one before it.
//
// A track is a tonality, not a difficulty tier. The minor track starts again at
// two degrees and the chromatic one at four, deliberately — a new tonality is a
// new ear rather than a harder version of the last one.
//
// Degrees are semitones above the tonic throughout, matching `DEGREE_LABELS`.

export interface EarSession {
  /** Route-safe, e.g. 'major-1'. What `/ear-session/[id]` carries. */
  id: string;
  /**
   * What the synced row is keyed on, e.g. 'ear:major:1'. Permanent: changing a
   * session's degrees in a later release means minting a new id, never editing
   * this one, because a learner's stored result describes the session they sat.
   */
  sectionId: string;
  title: string;
  /** Semitones above the tonic, sorted, always containing 0. */
  degrees: number[];
  /**
   * Degrees added since the previous session *in this track*. A set rather than
   * a single degree because three chromatic sessions add a pair, and naming one
   * of them would hide the other. Empty for a track's first session, which has
   * no predecessor to differ from.
   */
  introduces: number[];
}

export interface EarTrack {
  id: string;
  title: string;
  blurb: string;
  sessions: EarSession[];
}

/** Questions in one graded session. */
export const EAR_SESSION_QUESTIONS = 10;

/** What a session has to score to pass, in whole percent. */
export const EAR_PASS_PCT = 70;

export const EAR_TRACKS: readonly EarTrack[] = [
  {
    id: 'major',
    title: 'Major',
    blurb:
      'The major scale, one degree at a time. Start with the third against the tonic and add a degree each session until all seven are in play.',
    sessions: [
      {
        id: 'major-1',
        sectionId: 'ear:major:1',
        title: 'The Third',
        degrees: [0, 4],
        introduces: [],
      },
      {
        id: 'major-2',
        sectionId: 'ear:major:2',
        title: 'The Fifth',
        degrees: [0, 4, 7],
        introduces: [7],
      },
      {
        id: 'major-3',
        sectionId: 'ear:major:3',
        title: 'The Second',
        degrees: [0, 2, 4, 7],
        introduces: [2],
      },
      {
        id: 'major-4',
        sectionId: 'ear:major:4',
        title: 'The Sixth',
        degrees: [0, 2, 4, 7, 9],
        introduces: [9],
      },
      {
        id: 'major-5',
        sectionId: 'ear:major:5',
        title: 'The Seventh',
        degrees: [0, 2, 4, 7, 9, 11],
        introduces: [11],
      },
      {
        id: 'major-6',
        sectionId: 'ear:major:6',
        title: 'The Fourth',
        degrees: [0, 2, 4, 5, 7, 9, 11],
        introduces: [5],
      },
    ],
  },
  {
    id: 'minor',
    title: 'Minor',
    blurb:
      'The same walk, in the minor scale. The third moves down a semitone and everything you know about the major scale has to be heard again.',
    sessions: [
      {
        id: 'minor-1',
        sectionId: 'ear:minor:1',
        title: 'The Minor Third',
        degrees: [0, 3],
        introduces: [],
      },
      {
        id: 'minor-2',
        sectionId: 'ear:minor:2',
        title: 'The Fifth',
        degrees: [0, 3, 7],
        introduces: [7],
      },
      {
        id: 'minor-3',
        sectionId: 'ear:minor:3',
        title: 'The Second',
        degrees: [0, 2, 3, 7],
        introduces: [2],
      },
      {
        id: 'minor-4',
        sectionId: 'ear:minor:4',
        title: 'The Minor Sixth',
        degrees: [0, 2, 3, 7, 8],
        introduces: [8],
      },
      {
        id: 'minor-5',
        sectionId: 'ear:minor:5',
        title: 'The Minor Seventh',
        degrees: [0, 2, 3, 7, 8, 10],
        introduces: [10],
      },
      {
        id: 'minor-6',
        sectionId: 'ear:minor:6',
        title: 'The Fourth',
        degrees: [0, 2, 3, 5, 7, 8, 10],
        introduces: [5],
      },
    ],
  },
  {
    id: 'chromatic',
    title: 'Chromatic',
    blurb:
      'Both of everything. Each session puts a major degree next to its minor neighbour, and the last one opens the full wheel.',
    sessions: [
      {
        id: 'chromatic-1',
        sectionId: 'ear:chromatic:1',
        title: 'Both Thirds',
        degrees: [0, 3, 4, 7],
        introduces: [],
      },
      {
        id: 'chromatic-2',
        sectionId: 'ear:chromatic:2',
        title: 'Both Seconds',
        degrees: [0, 1, 2, 3, 4, 7],
        introduces: [1, 2],
      },
      {
        id: 'chromatic-3',
        sectionId: 'ear:chromatic:3',
        title: 'Both Sixths',
        degrees: [0, 1, 2, 3, 4, 7, 8, 9],
        introduces: [8, 9],
      },
      {
        id: 'chromatic-4',
        sectionId: 'ear:chromatic:4',
        title: 'Both Sevenths',
        degrees: [0, 1, 2, 3, 4, 7, 8, 9, 10, 11],
        introduces: [10, 11],
      },
      {
        id: 'chromatic-5',
        sectionId: 'ear:chromatic:5',
        title: 'All Twelve',
        degrees: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
        introduces: [5, 6],
      },
    ],
  },
];

/** Every session in pathway order — the sequence the gating rules run over. */
export const EAR_SESSIONS: readonly EarSession[] = EAR_TRACKS.flatMap((track) => track.sessions);

/** A session with everything a screen needs to place it: where it sits, and in what. */
export interface EarSessionAt {
  /** Index into `EAR_SESSIONS`. */
  index: number;
  session: EarSession;
  track: EarTrack;
  trackIndex: number;
  /** Index within the track, which is what a row's ordinal shows. */
  indexInTrack: number;
}

const BY_ID: ReadonlyMap<string, EarSessionAt> = new Map(
  EAR_TRACKS.flatMap((track, trackIndex) =>
    track.sessions.map((session, indexInTrack) => [
      session.id,
      {
        index: EAR_SESSIONS.indexOf(session),
        session,
        track,
        trackIndex,
        indexInTrack,
      } satisfies EarSessionAt,
    ]),
  ),
);

/** The session a route names, or null for an id no release ever minted. */
export function earSessionById(id: string | undefined): EarSessionAt | null {
  return (id === undefined ? undefined : BY_ID.get(id)) ?? null;
}

/** The session at a flattened index, for walking the pathway forwards. */
export function earSessionAt(index: number): EarSessionAt | null {
  const session = EAR_SESSIONS[index];

  return session ? earSessionById(session.id) : null;
}
