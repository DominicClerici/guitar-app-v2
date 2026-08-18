import { SymbolView, type SFSymbol } from 'expo-symbols';
import { Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { canUseApple, canUseGoogle } from '@/lib/auth';
import { useToken } from '@/lib/tokens';

import { ProviderButtons } from './ProviderButtons';

/**
 * What an account is for, said once.
 *
 * A guest account is real and its progress is really saved — what it lacks is any way back in. So
 * the pitch is not "nothing is saved" but "this phone is the only thing that can reach it".
 */
const BENEFITS: { icon: SFSymbol; title: string }[] = [
  { icon: 'arrow.triangle.2.circlepath', title: 'Sync across devices' },
  { icon: 'flame.fill', title: 'Never lose your streak' },
  { icon: 'arrow.triangle.branch', title: 'Pathways that adapt to you' },
];

function BenefitRow({ icon, title, divided }: { icon: SFSymbol; title: string; divided: boolean }) {
  const accent = useToken('--accent', '#5ec8c2');

  return (
    <View
      className={`flex-row items-center gap-[14px] py-[13px] ${
        divided ? 'border-b border-b-line-soft' : ''
      }`}
    >
      <View className="w-[22px] items-center">
        <SymbolView name={icon} size={16} tintColor={accent} />
      </View>
      <Text className="flex-1 text-[15px] font-medium tracking-[-0.2px] text-ink">{title}</Text>
    </View>
  );
}

/**
 * The signed-out account view: the case for an account, made in one voice wherever it is met.
 *
 * Presentational by design — it owns no navigation. The caller passes what each of the two ways in
 * should do, which is what keeps the ways into the flow at the call site.
 *
 * Two, because this screen argues for an account and someone who already has one is not being
 * argued with. They need the pitch to get out of the way, so the way past it is its own control
 * rather than something to be found inside the flow the pitch opens.
 */
export function OnboardingPitch({
  onCreateAccount,
  onLogIn,
  onGoogle,
  onApple,
}: {
  onCreateAccount: () => void;
  onLogIn: () => void;
  /** Signing in from here rather than opening the flow to do it. See `handoff.ts`. */
  onGoogle: () => void;
  onApple: () => void;
}) {
  return (
    <View className="px-[18px]">
      <Text className="text-[28px] leading-[32px] font-semibold tracking-[-0.7px] text-ink">
        Keep your progress
      </Text>
      <Text className="mt-[8px] text-[14px] leading-[20px] text-ink-muted">
        Everything you’ve done so far is tied to this phone. An account carries it with you.
      </Text>

      <View className="mt-[18px]">
        {BENEFITS.map((benefit, index) => (
          <BenefitRow
            key={benefit.title}
            icon={benefit.icon}
            title={benefit.title}
            divided={index < BENEFITS.length - 1}
          />
        ))}
      </View>

      <Button
        variant="primary"
        size="lg"
        radius={13}
        className="mt-[22px] w-full"
        onPress={onCreateAccount}
      >
        Create account
      </Button>

      <Button
        variant="secondary"
        size="lg"
        radius={13}
        className="mt-[10px] w-full"
        onPress={onLogIn}
      >
        Log in
      </Button>

      <Text className="mt-[20px] text-center font-mono text-[9.5px] uppercase tracking-[2px] text-ink-faint">
        Or continue with
      </Text>

      {/* The two providers sign in from here — pressing one and then having to press it again on
          the next screen was the same button asked twice, and the second asking is the one that
          made it look like a way *into* a flow rather than a way past it.

          Email cannot do that, since a code is a round trip through another app, so it stays a way
          in and opens on the log-in framing. That is also why it is not duplicated as a fourth
          control up top: it lands on the same typed field the Create account button does.

          A provider with nothing behind it is not offered at all, the way the flow's own step does
          it — the ids and the platform decide, and a button that cannot work is worse than one
          less choice. */}
      <ProviderButtons
        className="mt-[12px]"
        onGoogle={canUseGoogle ? onGoogle : undefined}
        onApple={canUseApple ? onApple : undefined}
        onEmail={onLogIn}
      />
    </View>
  );
}
