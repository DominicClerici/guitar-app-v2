/**
 * Everything the Learn tab reads, assembled once.
 *
 * The three sources have to be joined somewhere: enrollments name pathways by id, the catalogue
 * knows their titles and slugs, and only the full tree can answer "how far along" or "what next".
 * Joining them here rather than in the screen keeps the answer to those questions identical to the
 * one the pathway screen gets, and gives the cache reconciler its target for free.
 */
import type { CachedChapter } from '@/lib/content-cache';
import type { CurriculumIndex, CurriculumPathway, PathwayMeta } from '@/lib/content';
import type { LocalEnrollmentRow } from '@/lib/sync/tables';

import { currentChapter, type ProgressBySection } from './progress';
import { useCurriculumIndex, usePathwayTrees } from './useCurriculum';
import { useActiveEnrollments, useLearnerId, useProgress } from './useLearningRows';

export interface ActivePathway {
  enrollment: LocalEnrollmentRow;
  meta: PathwayMeta;
  /** Null while the tree is still being read — the card renders from `meta` until it lands. */
  pathway: CurriculumPathway | null;
}

export interface LearningState {
  userId: string;
  progress: ProgressBySection;
  index: CurriculumIndex | null;
  indexError: string | null;
  /** At most `MAX_ACTIVE_PATHWAYS`, most recently active first. */
  active: ActivePathway[];
  /** What the content cache should be holding, or null while that is not yet knowable. */
  cacheTarget: CachedChapter[] | null;
}

export function useLearning(): LearningState {
  const userId = useLearnerId();
  const progress = useProgress(userId);
  const enrollments = useActiveEnrollments(userId);
  const index = useCurriculumIndex();

  // An enrollment naming a pathway the catalogue no longer lists is dropped from the view rather
  // than rendered as a blank card: there is no title to show and nowhere for a tap to go.
  const enrolled = enrollments.flatMap((enrollment) => {
    const meta = index.value?.pathways.find((pathway) => pathway.id === enrollment.pathwayId);

    return meta ? [{ enrollment, meta }] : [];
  });

  const trees = usePathwayTrees(enrolled.map((entry) => entry.meta.slug));

  const active: ActivePathway[] = enrolled.map((entry) => ({
    ...entry,
    pathway: trees.trees.get(entry.meta.slug) ?? null,
  }));

  const known = index.value !== null && trees.complete;

  return {
    userId,
    progress,
    index: index.value,
    indexError: index.error,
    active,
    cacheTarget: known
      ? active.flatMap((entry) => {
          const current = entry.pathway ? currentChapter(entry.pathway, progress) : null;

          // A finished pathway has no current chapter and so nothing worth holding offline.
          return current ? [{ pathwaySlug: entry.meta.slug, chapterId: current.chapter.id }] : [];
        })
      : null,
  };
}
