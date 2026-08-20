import { Text, View } from 'react-native';

import type { Paint } from '@/components/buttonFace';
import { Face } from '@/components/Face';

import { useGuitarStrings } from './useGuitarStrings';

export type PipState = 'idle' | 'done' | 'active';

interface Props {
  /** State per string, thickest first — the order `useGuitarStrings` returns. */
  states: PipState[];
  caption?: string;
}

const FACE: Record<PipState, { fill: Paint; stroke: Paint }> = {
  idle: { fill: '--surface', stroke: '--line-soft' },
  done: { fill: '--accent-wash', stroke: '--accent-line' },
  active: { fill: '--accent', stroke: '--accent' },
};

const TEXT: Record<PipState, string> = {
  idle: 'text-ink-faint',
  done: 'text-accent',
  active: 'text-on-accent',
};

/**
 * The six strings as a row of pips. It carries two different meanings across the
 * screen — which strings are tuned, and which have been measured — but the shape
 * stays put, so the run of the check reads as one continuous thing.
 */
export function StringRail({ states, caption }: Props) {
  const strings = useGuitarStrings();

  return (
    <View>
      <View className="flex-row gap-[7px]">
        {strings.map((string, i) => {
          const state = states[i] ?? 'idle';
          return (
            <View
              key={string.id}
              accessibilityLabel={`${string.label} string ${state}`}
              className="h-[34px] flex-1 items-center justify-center"
            >
              <Face {...FACE[state]} radius={9} />
              <Text className={`text-[13px] font-semibold tracking-[-0.2px] ${TEXT[state]}`}>
                {string.glyph}
              </Text>
            </View>
          );
        })}
      </View>
      {caption ? (
        <Text className="mt-[9px] font-mono text-[9.5px] uppercase tracking-[1.5px] text-ink-faint">
          {caption}
        </Text>
      ) : null}
    </View>
  );
}
