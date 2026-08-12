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

/**
 * A step taken from inside the reader rather than from the pathway screen.
 *
 * The reader animates its own content away and then navigates with the stack animation off, so the
 * destination has to arrive already wearing the header that was on screen a frame earlier and fade
 * its body in itself. Both of those are this: the title it must show, and the flag that says the
 * screen is being paged into rather than opened.
 *
 * The title travels as a parameter rather than being looked up again on arrival because a lookup
 * costs a render — the pathway tree resolves in an effect, so the header would come up empty and
 * then fill, which is the one thing the whole transition exists to avoid.
 */
export interface ReaderHop {
  chapterTitle: string;
}

function hopParams(hop: ReaderHop | undefined): { enter: string; chapter: string } | undefined {
  return hop && { enter: 'fade', chapter: hop.chapterTitle };
}

/** A section opened as part of a pathway, carrying the context it reports back under. */
export function sectionHref(
  pathwaySlug: string,
  section: CurriculumSection,
  hop?: ReaderHop,
): Href {
  switch (section.kind) {
    case 'quiz':
      return {
        pathname: '/quiz/[slug]',
        params: { slug: section.ref, section: section.id, ...hopParams(hop) },
      };
    case 'activity':
      // `section` matters as much here as anywhere else even though an activity can never move a
      // tally: it is what the tick on the row is keyed on, so an activity opened without it runs
      // perfectly and then looks untouched next time the chapter is opened.
      return {
        pathname: '/activity/[slug]',
        params: { slug: section.ref, section: section.id, pathway: pathwaySlug, ...hopParams(hop) },
      };
    case 'article':
      return {
        pathname: '/article/[slug]',
        params: { slug: section.ref, section: section.id, pathway: pathwaySlug },
      };
  }
}

export function checkpointHref(chapter: CurriculumChapter, hop?: ReaderHop): Href | null {
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
      ...hopParams(hop),
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
