import { useLocalSearchParams } from 'expo-router';

import { ArticleScreen } from '@/screens/ArticleScreen';

export default function Article() {
  // `section` and `pathway` are present only when the article was opened from a pathway; without
  // them this is a standalone read from the library and nothing is recorded.
  const { slug, section, pathway } = useLocalSearchParams<{
    slug: string;
    section?: string;
    pathway?: string;
  }>();

  return <ArticleScreen slug={slug} sectionId={section} pathwaySlug={pathway} />;
}
