import { useLocalSearchParams } from 'expo-router';

import { ActivityScreen } from '@/features/activities';

/**
 * `/activity/<slug>?section=<sectionId>&pathway=<pathwaySlug>&chapter=<title>&enter=fade`.
 *
 * `section` is the curriculum tree's id for this activity, not the document slug, and it is the
 * only thing a completion can be keyed on — without it the run happens and records nothing, which
 * is the right answer for an activity opened outside a pathway.
 *
 * `pathway` rides along for symmetry with the article route, which needs it to place a section in
 * its tree; this screen carries it rather than reading it. `chapter` and `enter` are set only by
 * the reader paging in from the article before it, and are what let its header stay put
 * (see `ReaderHop`).
 */
export default function Activity() {
  const { slug, section, chapter, enter } = useLocalSearchParams<{
    slug: string;
    section?: string;
    pathway?: string;
    chapter?: string;
    enter?: string;
  }>();

  return (
    <ActivityScreen
      slug={slug}
      sectionId={section}
      chapterTitle={chapter}
      paged={enter === 'fade'}
    />
  );
}
