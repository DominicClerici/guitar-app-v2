/**
 * Where a piece of curriculum lives in the router.
 *
 * One module rather than a `router.push` at each call site, because two of these parameters are
 * easy to get subtly wrong and neither fails loudly:
 *
 *   · `section` is the *tree's* section id, never the document slug the screen happens to render,
 *     and for a checkpoint it is derived from the chapter (`checkpointSectionId`). Get it wrong and
 *     the progress written is real but no gate ever reads it.
 *   · `threshold` is the chapter's pass mark, not the quiz document's. `checkpointStatus` compares
 *     against the chapter's number, so a checkpoint graded on the document's would congratulate a
 *     learner on a chapter that stayed locked.
 */
import type { Href } from 'expo-router';

import type { CurriculumChapter, CurriculumSection } from '@/lib/content';

import { checkpointSectionId, type NextStep } from './progress';

export function pathwayHref(slug: string): Href {
  return { pathname: '/pathway/[slug]', params: { slug } };
}

/** An article or quiz opened as part of a pathway, carrying the context it reports back under. */
export function sectionHref(pathwaySlug: string, section: CurriculumSection): Href {
  return section.kind === 'quiz'
    ? { pathname: '/quiz/[slug]', params: { slug: section.ref, section: section.id } }
    : {
        pathname: '/article/[slug]',
        params: { slug: section.ref, section: section.id, pathway: pathwaySlug },
      };
}

export function checkpointHref(chapter: CurriculumChapter): Href | null {
  const checkpoint = chapter.checkpoint;
  if (!checkpoint) return null;

  return {
    pathname: '/quiz/[slug]',
    params: {
      slug: checkpoint.ref,
      // Keyed on the chapter, not on the quiz: one document reused as two chapters' checkpoints
      // would otherwise pass both at once.
      section: checkpointSectionId(chapter),
      threshold: checkpoint.passThresholdPct,
    },
  };
}

/** What a Continue control opens. */
export function nextStepHref(pathwaySlug: string, step: NextStep): Href {
  if (step.kind === 'section') return sectionHref(pathwaySlug, step.section);

  return {
    pathname: '/quiz/[slug]',
    params: {
      slug: step.checkpoint.ref,
      section: step.sectionId,
      threshold: step.checkpoint.passThresholdPct,
    },
  };
}
