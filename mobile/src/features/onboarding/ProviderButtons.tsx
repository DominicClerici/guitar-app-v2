import { View } from 'react-native';

import { Button } from '@/components/Button';

import { GoogleMark } from './GoogleMark';

/**
 * The three ways in that are not a form: Google, Apple, email.
 *
 * None of them are wired yet — each takes its own handler so that connecting one later is a prop at
 * the call site rather than a change in here, and so the three can land one at a time.
 */
export function ProviderButtons({
  onGoogle,
  onApple,
  onEmail,
  className = '',
}: {
  onGoogle?: () => void;
  onApple?: () => void;
  onEmail?: () => void;
  className?: string;
}) {
  return (
    <View className={`flex-row justify-center gap-[12px] ${className}`}>
      <Button
        variant="secondary"
        size="lg"
        square
        radius={14}
        accessibilityLabel="Continue with Google"
        onPress={onGoogle ?? noop}
      >
        <GoogleMark size={18} />
      </Button>

      <Button
        variant="secondary"
        size="lg"
        square
        radius={14}
        icon="apple.logo"
        accessibilityLabel="Continue with Apple"
        onPress={onApple ?? noop}
      />

      <Button
        variant="secondary"
        size="lg"
        square
        radius={14}
        icon="envelope.fill"
        accessibilityLabel="Continue with email"
        onPress={onEmail ?? noop}
      />
    </View>
  );
}

const noop = () => {};
