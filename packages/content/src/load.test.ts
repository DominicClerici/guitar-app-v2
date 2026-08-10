import { contentHash, parseCurriculumPathway } from '@guitar/shared';
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

    expect(documents.filter((document) => document.kind === 'article')).toHaveLength(4);
    expect(documents.filter((document) => document.kind === 'quiz')).toHaveLength(3);
    expect(pathways.map((pathway) => pathway.slug)).toEqual(['fundamentals']);
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

  it('carries exactly one optional activity section, which no document backs', async () => {
    const { documents, pathways } = await loadContent();
    const sections = pathways.flatMap((pathway) =>
      pathway.pathway.chapters.flatMap((chapter) => chapter.sections),
    );

    const activities = sections.filter((section) => section.kind === 'activity');
    expect(activities).toHaveLength(1);
    expect(activities[0]).toMatchObject({ optional: true });

    const slugs = new Set(documents.map((document) => document.slug));
    expect(slugs.has('chord-switch-drill')).toBe(false);
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

  it('exempts activity sections from ref resolution', () => {
    expect(
      collectCorpusIssues(corpus([section({ kind: 'activity', ref: 'not-a-document' })])),
    ).toEqual([]);
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
