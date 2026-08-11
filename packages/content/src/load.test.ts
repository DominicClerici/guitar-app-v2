import {
  contentHash,
  midiForTarget,
  parseActivityDocument,
  parseCurriculumPathway,
} from '@guitar/shared';
import type { CurriculumSection, NotePlayActivity, RenderActivity } from '@guitar/shared';
import { describe, expect, it } from 'vitest';

import {
  canonicalJson,
  collectCorpusIssues,
  loadContent,
  type ContentCorpus,
  type LoadedDocument,
} from './load';

// Two halves. The first runs the real corpus through the real loader — this is the test that makes
// `pnpm lint` a content gate, so broken content fails in CI rather than at publish time. The second
// feeds synthetic corpora to the cross-file checks, which is the only way to assert that a *bad*
// corpus is reported, and reported completely.

describe('the authored corpus', () => {
  it('loads, validates, and resolves every reference', async () => {
    const { documents, pathways } = await loadContent();

    expect(documents.filter((document) => document.kind === 'article')).toHaveLength(30);
    expect(documents.filter((document) => document.kind === 'quiz')).toHaveLength(7);
    expect(documents.filter((document) => document.kind === 'activity')).toHaveLength(6);
    expect(pathways.map((pathway) => pathway.slug)).toEqual(['caged-fretboard', 'fundamentals']);
  });

  it('versions every document and pathway with the hash of its canonical body', async () => {
    const { documents, pathways } = await loadContent();

    for (const entry of [...documents, ...pathways]) {
      expect(entry.version).toBe(await contentHash(canonicalJson(entry.body)));
      expect(entry.version).toMatch(/^[0-9a-f]{16}$/);
    }
  });

  it('is stable across loads — the property the device cache depends on', async () => {
    const first = await loadContent();
    const second = await loadContent();

    expect(second.documents.map((document) => [document.slug, document.version])).toEqual(
      first.documents.map((document) => [document.slug, document.version]),
    );
  });

  it('backs every activity section with an optional ref to an activity document', async () => {
    const { documents, pathways } = await loadContent();
    const sections = pathways.flatMap((pathway) =>
      pathway.pathway.chapters.flatMap((chapter) => chapter.sections),
    );
    const kinds = new Map(documents.map((document) => [document.slug, document.kind]));

    const activities = sections.filter(
      (section): section is CurriculumSection => section.kind === 'activity',
    );
    expect(activities.map((section) => section.ref)).toEqual([
      'caged-find-every-c',
      'caged-play-the-chord-tones',
      'caged-land-on-the-chord-tones',
      'caged-find-the-two-that-lean',
      'find-the-a-notes',
      'eighth-note-timing',
    ]);

    for (const section of activities) {
      expect(section).toMatchObject({ optional: true });
      expect(kinds.get(section.ref)).toBe('activity');
    }
  });

  it('ships no round this build cannot run', async () => {
    const { documents } = await loadContent();
    const activities = documents.filter((document) => document.kind === 'activity');

    expect(activities.map((document) => document.slug)).toEqual([
      'caged-find-every-c',
      'caged-find-the-two-that-lean',
      'caged-land-on-the-chord-tones',
      'caged-play-the-chord-tones',
      'eighth-note-timing',
      'find-the-a-notes',
    ]);

    for (const { slug, activity } of activities) {
      if (!activity || activity.kind === 'unknown') throw new Error(`${slug} did not parse`);

      const rounds: { kind: string }[] = activity.rounds;
      expect(rounds.filter((round) => round.kind === 'unknown')).toEqual([]);
    }
  });

  /**
   * The rule the note-play corpus is authored around, asserted rather than trusted: the detector
   * reports a pitch and never the string that produced it, so two targets sounding the same note
   * would leave a round that can never be completed.
   */
  it('never asks for the same pitch twice inside one note-play round', async () => {
    const { documents } = await loadContent();
    const found = documents.find((document) => document.slug === 'find-the-a-notes');
    const activity = found?.activity as NotePlayActivity | undefined;

    expect(activity?.kind).toBe('note-play');

    for (const round of activity?.rounds ?? []) {
      if (round.kind === 'unknown') continue;
      const pitches = round.targets.map(midiForTarget);
      expect(new Set(pitches).size).toBe(pitches.length);
    }
  });

  it('keeps every section id unique and namespaced by pathway and chapter', async () => {
    const { pathways } = await loadContent();
    const ids = pathways.flatMap((pathway) =>
      pathway.pathway.chapters.flatMap((chapter) => chapter.sections.map((section) => section.id)),
    );

    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id).toMatch(/^[a-z0-9-]+\.[a-z0-9-]+\.[a-z0-9-]+$/);
  });
});

describe('canonicalJson', () => {
  it('ignores key order, because reformatting a file is not a new revision', () => {
    expect(canonicalJson({ b: 1, a: 2 })).toBe(canonicalJson({ a: 2, b: 1 }));
  });

  it('preserves array order, because block and question order is content', () => {
    expect(canonicalJson([1, 2])).not.toBe(canonicalJson([2, 1]));
  });

  it('sorts keys at every depth', () => {
    expect(canonicalJson({ z: { b: [{ d: 1, c: 2 }] } })).toBe('{"z":{"b":[{"c":2,"d":1}]}}');
  });

  it('round-trips through JSON.parse unchanged', () => {
    const value = { meta: { slug: 'x' }, blocks: [{ type: 'divider' }], n: null };
    expect(JSON.parse(canonicalJson(value))).toEqual(value);
  });
});

const document = (
  slug: string,
  kind: 'article' | 'quiz',
  quizKind?: 'quiz' | 'checkpoint',
): LoadedDocument => ({
  slug,
  kind,
  version: 'v',
  body: {},
  file: `content/${kind === 'article' ? 'articles' : 'quizzes'}/${slug}.json`,
  ...(quizKind && { quizKind }),
});

const activityBody = (activity: Record<string, unknown>, slug = 'an-activity') => ({
  schemaVersion: 1,
  meta: { id: `act_${slug}`, slug, title: 'A drill' },
  activity,
});

/** Built through the real parser, so the degraded forms the rules below react to are the real ones. */
const activityDocument = (body: ReturnType<typeof activityBody>): LoadedDocument => ({
  slug: body.meta.slug,
  kind: 'activity',
  version: 'v',
  body,
  file: `content/activities/${body.meta.slug}.json`,
  activity: parseActivityDocument(body).activity,
});

const targetsRound = (targets: unknown[], overrides: Record<string, unknown> = {}) => ({
  kind: 'targets',
  id: 'r1',
  prompt: [{ text: 'Find them.' }],
  targets,
  ...overrides,
});

const patternRound = (overrides: Record<string, unknown> = {}) => ({
  kind: 'pattern',
  id: 'r1',
  prompt: [{ text: 'Play it.' }],
  bpm: 80,
  beatsPerBar: 4,
  subdivision: 1,
  bars: 1,
  slots: ['accent', 'hit', 'hit', 'hit'],
  ...overrides,
});

function corpus(sections: unknown[], checkpoint?: unknown): ContentCorpus {
  const body = {
    id: 'path_test',
    slug: 'test',
    title: 'Test',
    summary: 'A pathway assembled for the checks below.',
    tags: [],
    difficulty: 'intro',
    estimatedMin: 10,
    chapters: [
      {
        id: 'test.ch1',
        slug: 'one',
        title: 'One',
        sections,
        ...(checkpoint ? { checkpoint } : {}),
      },
    ],
  };

  return {
    documents: [
      document('an-article', 'article'),
      document('a-quiz', 'quiz', 'quiz'),
      document('a-checkpoint', 'quiz', 'checkpoint'),
      activityDocument(activityBody({ kind: 'note-play', modes: ['easy'], rounds: [] })),
    ],
    pathways: [
      {
        slug: 'test',
        version: 'v',
        body,
        file: 'content/curriculum/test.json',
        pathway: parseCurriculumPathway(body),
      },
    ],
  };
}

const section = (overrides: Record<string, unknown>) => ({
  id: 'test.ch1.s1',
  slug: 'an-article',
  title: 'A section',
  kind: 'article',
  ref: 'an-article',
  ...overrides,
});

const messages = (found: ContentCorpus) =>
  collectCorpusIssues(found).map((issue) => `${issue.file}: ${issue.message}`);

/** One extra activity document in an otherwise clean corpus, so its own issues are the whole list. */
const withActivity = (activity: Record<string, unknown>) => {
  const found = corpus([section({})]);
  found.documents.push(activityDocument(activityBody(activity, 'drill')));

  return messages(found);
};

/**
 * The same, but with the parsed body supplied directly rather than parsed out of the authored JSON.
 * The rules restated from the parser's own bounds are unreachable through a real document — that is
 * what "restated" means — so this is the only way to exercise them.
 */
const withParsedActivity = (activity: RenderActivity) => {
  const found = corpus([section({})]);
  found.documents.push({
    slug: 'drill',
    kind: 'activity',
    version: 'v',
    body: {},
    file: 'content/activities/drill.json',
    activity,
  });

  return messages(found);
};

describe('cross-file integrity', () => {
  it('accepts a corpus whose refs all resolve', () => {
    expect(collectCorpusIssues(corpus([section({})]))).toEqual([]);
  });

  it('rejects a ref that names no document', () => {
    expect(messages(corpus([section({ ref: 'nope' })]))).toEqual([
      expect.stringContaining('refs "nope", which is not a document in the corpus'),
    ]);
  });

  it('rejects a section whose kind disagrees with the document it points at', () => {
    expect(messages(corpus([section({ kind: 'quiz', ref: 'an-article' })]))).toEqual([
      expect.stringContaining('is kind "quiz" but "an-article" is an article'),
    ]);
  });

  it('resolves an activity section like any other ref', () => {
    const activitySection = { kind: 'activity', slug: 'an-activity', optional: true };

    expect(messages(corpus([section({ ...activitySection, ref: 'not-a-document' })]))).toEqual([
      expect.stringContaining('refs "not-a-document", which is not a document in the corpus'),
    ]);

    expect(messages(corpus([section({ ...activitySection, ref: 'an-article' })]))).toEqual([
      expect.stringContaining('is kind "activity" but "an-article" is an article'),
    ]);

    expect(messages(corpus([section({ ref: 'an-activity' })]))).toEqual([
      expect.stringContaining('is kind "article" but "an-activity" is an activity'),
    ]);

    expect(
      collectCorpusIssues(corpus([section({ ...activitySection, ref: 'an-activity' })])),
    ).toEqual([]);
  });

  it('requires every activity section to be optional', () => {
    expect(
      messages(corpus([section({ kind: 'activity', slug: 'an-activity', ref: 'an-activity' })])),
    ).toEqual([
      expect.stringContaining(
        'is an activity and must set "optional": true — activities are never graded',
      ),
    ]);
  });

  it('requires a checkpoint to point at a quiz whose meta.kind is checkpoint', () => {
    expect(messages(corpus([section({})], { ref: 'a-quiz', passThresholdPct: 70 }))).toEqual([
      expect.stringContaining('whose meta.kind is "quiz" and must be "checkpoint"'),
    ]);

    expect(messages(corpus([section({})], { ref: 'an-article', passThresholdPct: 70 }))).toEqual([
      expect.stringContaining('which is an article, not a quiz'),
    ]);

    expect(
      collectCorpusIssues(corpus([section({})], { ref: 'a-checkpoint', passThresholdPct: 70 })),
    ).toEqual([]);
  });

  it('rejects a reused section id', () => {
    const found = messages(
      corpus([section({}), section({ slug: 'a-quiz', kind: 'quiz', ref: 'a-quiz' })]),
    );

    expect(found).toEqual([expect.stringContaining('duplicate section id "test.ch1.s1"')]);
  });

  it('rejects a duplicate document slug', () => {
    const duplicated = corpus([section({})]);
    duplicated.documents.push(document('an-article', 'article'));

    expect(messages(duplicated)).toEqual([
      expect.stringContaining('duplicate document slug — also in content/articles/an-article.json'),
    ]);
  });

  it('rejects a section the tolerant parser degraded to a placeholder', () => {
    // `kind: "podcast"` is exactly what an old app should skip and a publisher should refuse: the
    // parser keeps it as an `unknown` placeholder rather than throwing.
    expect(messages(corpus([{ id: 'test.ch1.s1', kind: 'podcast' }]))).toEqual([
      expect.stringContaining('did not parse as a known section (declared kind "podcast")'),
    ]);
  });

  it('rejects an activity whose whole body degraded to a placeholder', () => {
    expect(withActivity({ kind: 'ear-training', rounds: [] })).toEqual([
      expect.stringContaining(
        'did not parse as a runnable activity (declared kind "ear-training")',
      ),
    ]);
  });

  /**
   * An empty `modes` list takes the whole note-play activity down rather than one round, so the
   * message for a degraded body has to name it — otherwise an author reads "unknown kind" about a
   * kind that is perfectly well known.
   */
  it('names an empty modes list among the reasons a body degrades', () => {
    expect(withActivity({ kind: 'note-play', modes: [], rounds: [] })).toEqual([
      expect.stringContaining('a note-play activity whose "modes" list is empty'),
    ]);
  });

  it('states the mode rule as a content rule, where the parser cannot reach', () => {
    // Hand-built rather than parsed: the parser degrades a modeless activity to a placeholder, so
    // an authored document can never reach the restated rule — which is exactly why it is restated.
    expect(withParsedActivity({ kind: 'note-play', modes: [], rounds: [] })).toEqual([
      expect.stringContaining('activity.modes is empty'),
    ]);
  });

  it('states the metronome range as a content rule, where the parser cannot reach', () => {
    expect(
      withParsedActivity({
        kind: 'rhythm',
        rounds: [
          {
            kind: 'pattern',
            id: 'r1',
            prompt: [],
            bpm: 400,
            beatsPerBar: 4,
            subdivision: 1,
            bars: 1,
            slots: ['hit', 'hit', 'hit', 'hit'],
          },
        ],
      }),
    ).toEqual([
      expect.stringContaining('round "r1" asks for 400 bpm, outside the metronome\'s 20–300'),
    ]);
  });

  it('rejects a round the parser degraded, and says which problem it is', () => {
    const cases: [Record<string, unknown>, string][] = [
      [
        {
          kind: 'note-play',
          modes: ['easy'],
          rounds: [
            targetsRound([
              { string: 5, fret: 0 },
              { string: 6, fret: 5 },
            ]),
          ],
        },
        'string 5 fret 0 and string 6 fret 5 both sound MIDI 45, and the detector hears pitches, not strings',
      ],
      [
        {
          kind: 'note-play',
          modes: ['easy'],
          board: { fretFrom: 0, fretTo: 5 },
          rounds: [targetsRound([{ string: 1, fret: 9 }])],
        },
        "string 1 fret 9 is outside the board's frets 0–5",
      ],
      [
        { kind: 'note-play', modes: ['easy'], rounds: [targetsRound([{ string: 7, fret: 0 }])] },
        'string 7 is not on a six-string neck',
      ],
      [
        { kind: 'rhythm', rounds: [patternRound({ bars: 2 })] },
        '4 slots for a 4×1×2 grid, which needs exactly 8',
      ],
      [
        { kind: 'rhythm', rounds: [patternRound({ slots: ['rest', 'rest', 'rest', 'rest'] })] },
        'every slot is a rest, so there is nothing to detect',
      ],
      [
        { kind: 'rhythm', rounds: [patternRound({ bpm: 400 })] },
        "400 bpm is outside the metronome's 20–300",
      ],
      [
        { kind: 'rhythm', rounds: [{ kind: 'swing', id: 'r1' }] },
        'an unrecognised round kind, or a field missing or out of range',
      ],
    ];

    for (const [activity, reason] of cases) {
      expect(withActivity(activity)).toEqual([
        `content/activities/drill.json: round "r1" did not parse as a runnable round (${reason}).`,
      ]);
    }
  });

  it('reports every failure, not just the first', () => {
    const found = messages(
      corpus([section({ ref: 'nope' }), section({ id: 'test.ch1.s2', ref: 'also-nope' })], {
        ref: 'a-quiz',
        passThresholdPct: 70,
      }),
    );

    expect(found).toHaveLength(3);
  });
});
