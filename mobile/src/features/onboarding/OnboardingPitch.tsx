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
 * The signed-out account view, and the only one: the Account tab and the home-screen sheet render
 * this same component, so the case for an account is made in one voice wherever it is met.
 *
 * Presentational by design — it owns no navigation and no sheet. Both callers pass what
 * "Create account" should do, which is what lets the sheet close itself before the flow opens.
 */
export function OnboardingPitch({
  variant = 'screen',
  onCreateAccount,
}: {
  /** A sheet has the grabber above it and less room, so it opens quieter. */
  variant?: 'screen' | 'sheet';
  onCreateAccount: () => void;
}) {
  const sheet = variant === 'sheet';

  return (
    <View className="px-[18px]">
      <Text
        className={
          sheet
            ? 'text-[24px] leading-[28px] font-semibold tracking-[-0.6px] text-ink'
            : 'text-[28px] leading-[32px] font-semibold tracking-[-0.7px] text-ink'
        }
      >
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

      <Text className="mt-[20px] text-center font-mono text-[9.5px] uppercase tracking-[2px] text-ink-faint">
        Or continue with
      </Text>

      <ProviderButtons className="mt-[12px]" />
    </View>
  );
}
