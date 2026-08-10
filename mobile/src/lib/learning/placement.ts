/**
 * Where a section sits in the pathway that sent the reader to it.
 *
 * A section id is all an article screen is handed, and "Section 2 of 5" needs the rest. Counted
 * against `countedSections` for the same reason every other denominator is: the optional microphone
 * activity between two articles is not a step the reader is expected to take, and numbering over it
 * would make a chapter look longer than it can ever be.
 */
import { countedSections } from '@/lib/content';
import type { CurriculumChapter, CurriculumPathway } from '@/lib/content';

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
