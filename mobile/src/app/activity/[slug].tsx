import { useLocalSearchParams } from 'expo-router';

import { ActivityScreen } from '@/features/activities';

/**
 * `/activity/<slug>?section=<sectionId>&pathway=<pathwaySlug>`.
 *
 * `section` is the curriculum tree's id for this activity, not the document slug, and it is the
 * only thing a completion can be keyed on — without it the run happens and records nothing, which
 * is the right answer for an activity opened outside a pathway.
 *
 * `pathway` rides along for symmetry with the article route, which needs it to place a section in
 * its tree. This screen has no pathway chrome of its own — its header says "Activity" and nothing
 * else — so it is carried rather than read.
 */
export default function Activity() {
  const { slug, section } = useLocalSearchParams<{
    slug: string;
    section?: string;
    pathway?: string;
  }>();

  return <ActivityScreen slug={slug} sectionId={section} />;
}
