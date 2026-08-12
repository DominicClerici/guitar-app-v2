/**
 * Where a section sits in the pathway that sent the reader to it.
 *
 * A section id is all an article screen is handed, and "Section 2 of 5" needs the rest. Counted
 * against `countedSections` for the same reason every other denominator is: the optional microphone
 * activity between two articles is not a step the reader is expected to take, and numbering over it
 * would make a chapter look longer than it can ever be.
 */
import { countedSections } from '@/lib/content';
import type { CurriculumChapter, CurriculumPathway, CurriculumSection } from '@/lib/content';

export interface SectionPlacement {
  chapter: CurriculumChapter;
  chapterIndex: number;
  /** 1-based position among the chapter's counted sections; 0 for a section that is not counted. */
  position: number;
  total: number;
}

export function locateSection(
  pathway: CurriculumPathway,
  sectionId: string,
): SectionPlacement | null {
  for (const [chapterIndex, chapter] of pathway.chapters.entries()) {
    const counted = countedSections(chapter);
    const index = counted.findIndex((section) => section.id === sectionId);

    if (index !== -1) {
      return { chapter, chapterIndex, position: index + 1, total: counted.length };
    }

    // An optional section still belongs to a chapter and is worth naming; it just has no number.
    if (chapter.sections.some((section) => section.id === sectionId)) {
      return { chapter, chapterIndex, position: 0, total: counted.length };
    }
  }

  return null;
}

/** What comes after a section: the next one along, or the chapter's checkpoint once they run out. */
export type NextInChapter =
  | { kind: 'section'; section: CurriculumSection }
  | { kind: 'checkpoint'; chapter: CurriculumChapter };

export interface SectionNeighbours {
  previous: CurriculumSection | null;
  next: NextInChapter | null;
}

/**
 * The section either side of this one, for the Previous/Next pair under an article.
 *
 * The walk stays inside the chapter and ends on its checkpoint, because the chapter is the unit
 * that gates: stepping past the checkpoint into the next chapter would route a learner into
 * content the pathway screen is still showing as locked. Running out at either end simply means
 * no button — `null` is a hidden control, not a disabled one.
 *
 * Optional sections are walked even though they are not numbered, and unknown ones are not: the
 * order is the author's, minus what this build cannot open. Numbering still comes from
 * `countedSections`, so `2/5` and the step Next takes are answering different questions on purpose.
 */
export function sectionNeighbours(
  chapter: CurriculumChapter,
  sectionId: string,
): SectionNeighbours {
  const openable = chapter.sections.filter(
    (section): section is CurriculumSection => section.kind !== 'unknown',
  );
  const index = openable.findIndex((section) => section.id === sectionId);
  if (index === -1) return { previous: null, next: null };

  const following = openable[index + 1];

  return {
    previous: openable[index - 1] ?? null,
    next: following
      ? { kind: 'section', section: following }
      : chapter.checkpoint
        ? { kind: 'checkpoint', chapter }
        : null,
  };
}
