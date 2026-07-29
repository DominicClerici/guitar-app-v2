import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import type { Warning } from '@/lib/chord-analysis';
import { useToken } from '@/lib/tokens';

// What kind of oddity a rule reports decides its colour: amber where the engine
// suspects you are looking at the chord from the wrong note, rose where tones
// genuinely collide, muted for everything merely worth knowing.
const REROOT = new Set(['inversion', 'fragment', 'enharmonic']);
const COLLISION = new Set(['cluster', 'dissonance', 'double']);

function toneFor(cat: Warning['cat']): { dot: string; text: string } {
  if (cat && REROOT.has(cat)) return { dot: 'bg-amber', text: 'text-amber' };
  if (cat && COLLISION.has(cat)) return { dot: 'bg-rose', text: 'text-rose' };
  return { dot: 'bg-ink-faint', text: 'text-ink-muted' };
}

/**
 * What the engine noticed about this reading. Each line is a tag you can open for
 * the reasoning behind it. A clean voicing still occupies the space rather than
 * collapsing it, so the page under the panel holds still as chords change.
 */
export function WarningNotes({ warnings }: { warnings: Warning[] }) {
  if (warnings.length === 0) {
    return (
      <Text className="text-[12.5px] leading-[18px] text-ink-muted">
        Nothing unusual here — this voicing reads as a standard chord.
      </Text>
    );
  }

  return (
    <View>
      {warnings.map((warning, i) => (
        <Note key={`${warning.id}-${i}`} warning={warning} first={i === 0} />
      ))}
    </View>
  );
}

function Note({ warning, first }: { warning: Warning; first: boolean }) {
  const [open, setOpen] = useState(false);
  const faint = useToken('--ink-faint', '#62666e');
  const tone = toneFor(warning.cat);

  return (
    <Pressable
      onPress={() => setOpen(!open)}
      accessibilityRole="button"
      accessibilityState={{ expanded: open }}
      accessibilityLabel={warning.short}
      className={`py-[12px] active:opacity-60 ${first ? '' : 'border-t border-t-line-soft'}`}
    >
      <View className="flex-row items-center gap-[10px]">
        <View className={`h-[7px] w-[7px] rounded-full ${tone.dot}`} />
        <Text className={`flex-1 text-[13px] font-medium tracking-[-0.1px] ${tone.text}`}>
          {warning.short}
        </Text>
        <SymbolView
          name={open ? 'chevron.down' : 'chevron.right'}
          size={11}
          weight="semibold"
          tintColor={faint}
        />
      </View>

      {open ? (
        <Text className="mt-[8px] pl-[17px] text-[12.5px] leading-[18px] text-ink-muted">
          {warning.long}
        </Text>
      ) : null}
    </Pressable>
  );
}
