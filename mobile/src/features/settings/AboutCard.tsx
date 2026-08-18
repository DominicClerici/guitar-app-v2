import { SymbolView } from 'expo-symbols';
import { useRef } from 'react';
import { Pressable, Text } from 'react-native';

import { Face } from '@/components/Face';
import { useTokens } from '@/lib/tokens';

import { AboutSheet, type AboutSheetRef } from './AboutSheet';

const TOKENS = ['--accent', '--ink-faint'] as const;

/** Fallbacks mirror `global.css`, for the moment before uniwind has resolved. */
const FALLBACKS = ['#5ec8c2', '#62666e'];

/**
 * The last thing on the settings screen, and the only row on it wearing a face.
 *
 * Everything above is a setting — a thing to change — and reads as a bare line in a list of them.
 * This one goes somewhere instead, so it is lifted out of that list onto a card of its own rather
 * than left as a fourth account row that happens not to be about the account.
 */
export function AboutCard() {
  const about = useRef<AboutSheetRef>(null);
  const [accent, faint] = useTokens(TOKENS).map((token, index) => token ?? FALLBACKS[index]);

  return (
    <>
      <Pressable
        onPress={() => about.current?.present()}
        accessibilityRole="button"
        accessibilityLabel="About"
        className="h-[56px] flex-row items-center gap-[12px] px-[16px] active:opacity-60"
      >
        <Face name="card" radius={15} />

        <SymbolView name="info.circle" size={17} weight="medium" tintColor={accent} />

        <Text className="flex-1 text-[14.5px] font-medium tracking-[-0.2px] text-ink">About</Text>

        <SymbolView name="chevron.right" size={11} weight="semibold" tintColor={faint} />
      </Pressable>

      <AboutSheet ref={about} />
    </>
  );
}
