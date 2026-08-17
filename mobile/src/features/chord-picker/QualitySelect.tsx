import { SymbolView } from 'expo-symbols';
import { Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { chordTypeById } from '@/lib/chord-library';
import { useToken } from '@/lib/tokens';

import type { ExtraGroup } from './QualityPicker';

/**
 * What a quality is called when it has to stand on its own, away from the family
 * heading that would otherwise be saying half of it. Every name in the catalogue
 * already carries its family — a Dominant Seventh, a Suspended Fourth — except
 * the triads, which are bare adjectives and need the noun back.
 */
export function qualityName(quality: string, extraGroup?: ExtraGroup): string {
  if (extraGroup && quality === extraGroup.id) return extraGroup.label;

  const type = chordTypeById(quality);
  if (!type) return '—';

  return type.family === 'triad' ? `${type.name} Triad` : type.name;
}

interface Props {
  quality: string;
  /** The non-family group the picker offers, where it has one. */
  extraGroup?: ExtraGroup;
  onPress: () => void;
}

/**
 * The chord quality as one line you tap to change. The catalogue is thirty
 * qualities in eight families and it used to sit open on the screen, taking the
 * room the notes and the neck now use; behind a select it costs one tap and
 * gives all of it back.
 */
export function QualitySelect({ quality, extraGroup, onPress }: Props) {
  const faint = useToken('--ink-faint', '#62666e');
  const label = qualityName(quality, extraGroup);

  return (
    <Button
      variant="quiet"
      size="md"
      align="start"
      square={false}
      className="w-full"
      accessibilityLabel={`Quality: ${label}. Opens the catalogue`}
      onPress={onPress}
    >
      <View className="flex-1 flex-row items-center justify-between">
        <Text className="text-[15px] font-semibold tracking-[-0.2px] text-ink">{label}</Text>
        <SymbolView name="chevron.up.chevron.down" size={12} weight="semibold" tintColor={faint} />
      </View>
    </Button>
  );
}
