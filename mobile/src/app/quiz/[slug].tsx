import { useLocalSearchParams } from 'expo-router';

import { QuizScreen } from '@/features/quiz';

/**
 * `/quiz/<slug>?section=<sectionId>&threshold=<pct>&chapter=<title>&enter=fade`.
 *
 * `section` is the id the result is recorded under, which the caller owns: for a chapter's
 * checkpoint it is `checkpointSectionId(chapter)`, not the quiz slug. `threshold` overrides the
 * document's own `passThresholdPct` — a checkpoint gates on the chapter's number. `chapter` and
 * `enter` are set only by the reader paging in from the article before it (see `ReaderHop`).
 */
export default function Quiz() {
  const { slug, section, threshold, chapter, enter } = useLocalSearchParams<{
    slug: string;
    section?: string;
    threshold?: string;
    chapter?: string;
    enter?: string;
  }>();

  const parsed = threshold === undefined ? Number.NaN : Number(threshold);

  return (
    <QuizScreen
      slug={slug}
      sectionId={section}
      thresholdPct={Number.isFinite(parsed) ? parsed : undefined}
      chapterTitle={chapter}
      paged={enter === 'fade'}
    />
  );
}
