import { Text, View } from 'react-native';

import { toAccidentalGlyphs } from '@/lib/accidentals';
import type { JewelHue } from '@/lib/scale-library';

import { HUE_BORDER, HUE_TEXT } from './hues';
import type { Cell } from './useScaleVisualizer';

// The chord detector lights at most six dots, so it can afford accent aqua on all
// of them. A scale map lights forty at once, and the same treatment would be a
// wall of colour — so the weighting re-grades here: the root stays lit, the tone
// that gives the scale its character is tinted, and everything else goes quiet.

interface Props {
  cell: Cell;
  /** The scale's jewel hue, for its character tone. */
  hue: JewelHue | null;
  /** False when a box is showing and this note falls outside it. */
  inPosition: boolean;
  sounding: boolean;
  pressed: boolean;
}

export function ScaleDot({ cell, hue, inPosition, sounding, pressed }: Props) {
  // Outside the box the note is still there, just no longer part of the shape —
  // scaffolding you can see past rather than read.
  if (!inPosition) {
    return <View className="h-[9px] w-[9px] rounded-full border border-line" />;
  }

  const tinted = cell.tone === 'accent' && hue !== null;

  const face = sounding
    ? 'bg-accent-bright'
    : cell.tone === 'root'
      ? 'bg-accent'
      : tinted
        ? `border ${HUE_BORDER[hue]} bg-surface-raised`
        : 'border border-line bg-surface-raised';

  const ink = sounding
    ? 'text-on-accent'
    : cell.tone === 'root'
      ? 'text-on-accent'
      : tinted
        ? HUE_TEXT[hue]
        : 'text-ink-muted';

  return (
    <View className={`items-center justify-center ${pressed || sounding ? 'scale-110' : ''}`}>
      {/* The root reads as lit: a filled disc sitting in its own aura. */}
      {cell.tone === 'root' ? (
        <View className="absolute h-[30px] w-[30px] rounded-full bg-accent-wash" />
      ) : null}

      <View className={`h-[24px] w-[24px] items-center justify-center rounded-full ${face}`}>
        <Text className={`text-[10px] font-bold ${ink}`}>{toAccidentalGlyphs(cell.label)}</Text>
      </View>
    </View>
  );
}
