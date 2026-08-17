import { OTP_LENGTH } from '@guitar/shared';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';

import { Button } from '@/components/Button';

import { OtpField } from './OtpField';

/**
 * Step two: the code, for whichever of the two it was sent to.
 *
 * There is no submit button. Six digits is the whole form, and the moment the sixth lands there is
 * nothing left to decide — so it verifies itself, and the buttons here are the two ways out: send
 * another one, or go back and fix the address.
 */

/** Long enough that a slow SMS is not raced by a second one, short enough not to feel stuck. */
const RESEND_COOLDOWN_SECONDS = 30;

interface Props {
  /** The address or number as typed, shown back so a wrong one is obvious before the wait. */
  destination: string;
  code: string;
  onChangeCode: (code: string) => void;
  onSubmit: (code: string) => void;
  onResend: () => void;
  onBack: () => void;
  error: string | null;
  pending: boolean;
  /** Bumped by the flow each time a code goes out, which is what restarts the countdown. */
  sentAt: number;
}

export function CodeStep({
  destination,
  code,
  onChangeCode,
  onSubmit,
  onResend,
  onBack,
  error,
  pending,
  sentAt,
}: Props) {
  return (
    <View>
      <Text className="text-[28px] leading-[32px] font-semibold tracking-[-0.7px] text-ink">
        Enter your code
      </Text>
      <Text className="mt-[8px] text-[14px] leading-[20px] text-ink-muted">
        We sent {OTP_LENGTH} digits to{' '}
        <Text className="font-medium text-ink">{destination}</Text>.
      </Text>

      <View className="mt-[26px]">
        <OtpField
          value={code}
          onChange={onChangeCode}
          onComplete={onSubmit}
          error={Boolean(error)}
          editable={!pending}
        />

        {error ? <Text className="mt-[12px] text-[12.5px] text-rose">{error}</Text> : null}
      </View>

      <View className="mt-[24px] flex-row items-center justify-between">
        <Button variant="link" size="inline" onPress={onBack} disabled={pending}>
          Change
        </Button>

        {/* Keyed by the send it belongs to, so a new code starts a new countdown by mounting a
            new one. Resetting the old one in an effect instead would be a setState during an
            effect body, which cascades a render — and the compiler's lint rejects it. */}
        <Resend key={sentAt} onResend={onResend} disabled={pending} />
      </View>
    </View>
  );
}

/** The wait, then the way to ask again. */
function Resend({ onResend, disabled }: { onResend: () => void; disabled: boolean }) {
  const [remaining, setRemaining] = useState(RESEND_COOLDOWN_SECONDS);

  useEffect(() => {
    // A plain counter rather than a clock read: nothing here has to survive the screen going away,
    // and a wall-clock deadline would need reconciling every time the app came back anyway.
    const tick = setInterval(() => {
      setRemaining((left) => {
        if (left <= 1) {
          clearInterval(tick);
          return 0;
        }
        return left - 1;
      });
    }, 1000);

    return () => clearInterval(tick);
  }, []);

  // Text rather than a disabled button: a countdown is information, and a button that cannot be
  // pressed for half a minute invites pressing it anyway.
  if (remaining > 0) {
    return <Text className="text-[13px] text-ink-faint">Resend in {remaining}s</Text>;
  }

  return (
    <Button variant="link" size="inline" onPress={onResend} disabled={disabled}>
      Resend code
    </Button>
  );
}
