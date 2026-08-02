import { useLocalSearchParams } from 'expo-router';

import { ArticleScreen } from '@/screens/ArticleScreen';

export default function Article() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  return <ArticleScreen slug={slug} />;
}
