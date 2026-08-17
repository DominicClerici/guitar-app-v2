import { SymbolView, type SFSymbol } from 'expo-symbols';
import { Text, View } from 'react-native';

import { Button } from '@/components/Button';
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
}: {
  onCreateAccount: () => void;
  onLogIn: () => void;
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

      {/* All three open the flow rather than starting a provider from here. The buttons that do
          the actual signing in are its first step, which is also where a provider's failure has
          somewhere to be shown.

          Email is the one that opens on the log-in framing. The other two are a tap away from
          being signed in either way, so the wording behind them is never read; email lands on the
          same typed field the Create account button does, and duplicating that here would make two
          controls that do exactly one thing between them. */}
      <ProviderButtons
        className="mt-[12px]"
        onGoogle={onCreateAccount}
        onApple={onCreateAccount}
        onEmail={onLogIn}
      />
    </View>
  );
}
