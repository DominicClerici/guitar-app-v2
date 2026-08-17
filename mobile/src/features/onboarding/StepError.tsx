import { Text } from 'react-native';

/**
 * A failure that belongs to the step rather than to any one control on it.
 *
 * The steps that collect an answer by tapping cards have nowhere else to put one: a save that did
 * not reach the server is not a comment on the card that was chosen, so it sits under the button
 * that tried, centred on it. Steps built around a single field say it under the field instead —
 * `AuthTextField` carries its own.
 */
export function StepError({ message }: { message: string | null }) {
  if (!message) return null;

  return <Text className="mt-[10px] text-center text-[12.5px] text-rose">{message}</Text>;
}
