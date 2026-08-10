import { useLocalSearchParams } from 'expo-router';

import { PathwayScreen } from '@/screens/PathwayScreen';

export default function Pathway() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  return <PathwayScreen slug={slug} />;
}
