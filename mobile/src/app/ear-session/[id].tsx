import { useLocalSearchParams } from 'expo-router';

import { EarSessionScreen } from '@/screens/EarSessionScreen';

export default function EarSession() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <EarSessionScreen id={id} />;
}
