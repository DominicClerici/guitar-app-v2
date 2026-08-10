import { describe, expect, it } from 'vitest';

import {
  countedSections,
  CurriculumParseError,
  parseCurriculumIndex,
  parseCurriculumPathway,
} from './curriculum';

const section = (id: string, extra: Record<string, unknown> = {}) => ({
  id,
  slug: `section-${id}`,
  title: `Section ${id}`,
  kind: 'article',
  ref: `article-${id}`,
  ...extra,
});

const pathway = (sections: unknown[]) => ({
  id: 'path_test',
  slug: 'test-pathway',
  title: 'Test Pathway',
  summary: 'A fixture.',
  tags: ['theory'],
  difficulty: 'intro',
  estimatedMin: 40,
  chapters: [
    {
      id: 'ch1',
      slug: 'chapter-one',
      title: 'Chapter One',
      sections,
      checkpoint: { ref: 'checkpoint-one', passThresholdPct: 80 },
    },
  ],
});

describe('parseCurriculumPathway', () => {
  it('parses a pathway with every section kind', () => {
    const parsed = parseCurriculumPathway(
      pathway([
        section('a'),
        section('b', { kind: 'quiz', estimatedMin: 5 }),
        section('c', { kind: 'activity', optional: true }),
      ]),
    );

    expect(parsed.chapters[0]?.sections.map((entry) => entry.kind)).toEqual([
      'article',
      'quiz',
      'activity',
    ]);
    expect(parsed.chapters[0]?.checkpoint).toEqual({ ref: 'checkpoint-one', passThresholdPct: 80 });
  });

  it('turns an unknown section kind into a placeholder instead of failing', () => {
    const parsed = parseCurriculumPathway(
      pathway([section('a'), section('b', { kind: 'jam-along' }), section('c')]),
    );

    expect(parsed.chapters[0]?.sections).toHaveLength(3);
    expect(parsed.chapters[0]?.sections[1]).toEqual({
      kind: 'unknown',
      id: 'b',
      originalKind: 'jam-along',
    });
  });

  it('turns a known kind with an invalid payload into a placeholder', () => {
    const parsed = parseCurriculumPathway(pathway([section('a', { ref: '' })]));
    expect(parsed.chapters[0]?.sections[0]).toEqual({
      kind: 'unknown',
      id: 'a',
      originalKind: 'article',
    });
  });

  it('excludes unknown and optional sections from the progress denominator', () => {
    const parsed = parseCurriculumPathway(
      pathway([
        section('a'),
        section('b', { kind: 'jam-along' }),
        section('c', { kind: 'activity', optional: true }),
        section('d'),
      ]),
    );

    const chapter = parsed.chapters[0];
    if (!chapter) throw new Error('expected a chapter');
    expect(countedSections(chapter).map((entry) => entry.id)).toEqual(['a', 'd']);
  });

  it('rejects a section without both a string id and kind', () => {
    expect(() => parseCurriculumPathway(pathway([{ kind: 'jam-along' }]))).toThrow(
      CurriculumParseError,
    );
    expect(() => parseCurriculumPathway(pathway([42]))).toThrow(CurriculumParseError);
  });

  it('rejects a pathway with structural damage', () => {
    const { chapters: _chapters, ...noChapters } = pathway([]);
    expect(() => parseCurriculumPathway(noChapters)).toThrow(CurriculumParseError);
    expect(() => parseCurriculumPathway({ ...pathway([]), difficulty: 'expert' })).toThrow(
      CurriculumParseError,
    );
    expect(() => parseCurriculumPathway({ ...pathway([]), chapters: [{ id: 'ch1' }] })).toThrow(
      CurriculumParseError,
    );
  });
});

describe('parseCurriculumIndex', () => {
  it('parses an index of pathway metas', () => {
    const { chapters: _chapters, ...meta } = pathway([]);
    const parsed = parseCurriculumIndex({ version: '2026-08-10', pathways: [meta] });

    expect(parsed.pathways).toHaveLength(1);
    expect(parsed.pathways[0]).not.toHaveProperty('chapters');
  });

  it('rejects an index with a malformed pathway', () => {
    expect(() => parseCurriculumIndex({ version: '1', pathways: [{ id: 'path_test' }] })).toThrow(
      CurriculumParseError,
    );
    expect(() => parseCurriculumIndex({ pathways: [] })).toThrow(CurriculumParseError);
  });
});
