import { View } from 'react-native';

import { Button } from '@/components/Button';

import { GoogleMark } from './GoogleMark';

/**
 * The three ways in that are not a form: Google, Apple, email.
 *
 * Each takes its own handler, and a handler is also how a caller says whether the way exists at
 * all: no handler, no button. Google is only in a build that was given its client ids and Apple's
 * sheet is iOS only, so which of the three are on offer is not a fact this row can know — and
 * showing one that cannot work is worse than showing two.
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
      {onGoogle ? (
        <Button
          variant="secondary"
          size="lg"
          square
          radius={14}
          accessibilityLabel="Continue with Google"
          onPress={onGoogle}
        >
          <GoogleMark size={18} />
        </Button>
      ) : null}

      {onApple ? (
        <Button
          variant="secondary"
          size="lg"
          square
          radius={14}
          icon="apple.logo"
          accessibilityLabel="Continue with Apple"
          onPress={onApple}
        />
      ) : null}

      {onEmail ? (
        <Button
          variant="secondary"
          size="lg"
          square
          radius={14}
          icon="envelope.fill"
          accessibilityLabel="Continue with email"
          onPress={onEmail}
        />
      ) : null}
    </View>
  );
}
