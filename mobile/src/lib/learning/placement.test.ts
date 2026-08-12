import { describe, expect, it } from 'vitest';

import type { CurriculumChapter, CurriculumSection, RenderSection } from '@/lib/content';

import { sectionNeighbours } from './placement';

// Fixtures follow progress.test.ts: trees built by hand so a case reads as the shape it is about.

function section(id: string, extra: Partial<CurriculumSection> = {}): CurriculumSection {
  return { id, slug: id, title: id, kind: 'article', ref: `ref-${id}`, ...extra };
}

function chapter(sections: RenderSection[], checkpoint = false): CurriculumChapter {
  return {
    id: 'c1',
    slug: 'c1',
    title: 'Chapter One',
    sections,
    ...(checkpoint && { checkpoint: { ref: 'quiz-c1', passThresholdPct: 70 } }),
  };
}

describe('sectionNeighbours', () => {
  it('walks the chapter in author order', () => {
    const tree = chapter([section('a'), section('b'), section('c')]);

    expect(sectionNeighbours(tree, 'b')).toEqual({
      previous: section('a'),
      next: { kind: 'section', section: section('c') },
    });
  });

  it('has no previous at the start of the chapter', () => {
    const tree = chapter([section('a'), section('b')]);

    expect(sectionNeighbours(tree, 'a').previous).toBeNull();
  });

  it('ends on the chapter checkpoint', () => {
    const tree = chapter([section('a'), section('b')], true);

    expect(sectionNeighbours(tree, 'b').next).toEqual({ kind: 'checkpoint', chapter: tree });
  });

  it('ends nowhere when the chapter has no checkpoint', () => {
    const tree = chapter([section('a'), section('b')]);

    expect(sectionNeighbours(tree, 'b').next).toBeNull();
  });

  it('walks optional sections, which are read but not counted', () => {
    const optional = section('b', { optional: true });
    const tree = chapter([section('a'), optional, section('c')]);

    expect(sectionNeighbours(tree, 'a').next).toEqual({ kind: 'section', section: optional });
    expect(sectionNeighbours(tree, optional.id).next).toEqual({
      kind: 'section',
      section: section('c'),
    });
  });

  it('steps over a section this build cannot open', () => {
    const tree = chapter([
      section('a'),
      { kind: 'unknown', id: 'b', originalKind: 'hologram' },
      section('c'),
    ]);

    expect(sectionNeighbours(tree, 'a').next).toEqual({ kind: 'section', section: section('c') });
    expect(sectionNeighbours(tree, 'c').previous).toEqual(section('a'));
  });

  it('has no neighbours for a section outside the chapter', () => {
    const tree = chapter([section('a'), section('b')]);

    expect(sectionNeighbours(tree, 'elsewhere')).toEqual({ previous: null, next: null });
  });
});
