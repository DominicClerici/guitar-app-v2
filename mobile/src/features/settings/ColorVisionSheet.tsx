import { colorVision, type ColorVision } from '@guitar/shared';
import { useImperativeHandle, useRef, useState, type Ref } from 'react';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SelectableChips } from '@/components/SelectableChip';
import { Sheet, type SheetRef } from '@/components/Sheet';
import { usePreferenceWriter } from '@/lib/preferences';
import { toast } from '@/lib/toast';

import { isSettled, shownChoice, type Pending } from './choice';
import { COLOR_VISION_OPTIONS } from './colorVision';
import { ColorVisionPreview } from './ColorVisionPreview';

const MODE_CHIPS = COLOR_VISION_OPTIONS.map((option) => ({ id: option.id, label: option.name }));

export type ColorVisionSheetRef = SheetRef;

interface Props {
  ref?: Ref<ColorVisionSheetRef>;
  /** What the database holds for the colour vision mode right now. */
  stored: ColorVision;
}

/**
 * Which palette the app codes with, chosen by looking at it.
 *
 * There is no save and no preview toggle: pressing a chip is the setting, and the board above it
 * redraws in what was just chosen (BACKEND_PLAN.md §6). That is the only honest way to offer this
 * — nobody can tell from the word "tritanopia" whether that palette works for them, and a mode
 * applied only after a confirmation would have to be described in words in the meantime.
 *
 * The stored value is what the board draws, through the same pending choice `PreferenceRow` uses,
 * so the board answers the press rather than the live query a beat later.
 */
export function ColorVisionSheet({ ref, stored }: Props) {
  const insets = useSafeAreaInsets();
  const sheet = useRef<SheetRef>(null);
  const { set } = usePreferenceWriter();
  const [pending, setPending] = useState<Pending<ColorVision> | null>(null);

  useImperativeHandle(
    ref,
    () => ({
      present: () => sheet.current?.present(),
      dismiss: () => sheet.current?.dismiss(),
    }),
    [],
  );

  // Adjusted during render for the reason `PreferenceRow` gives: an effect would show the answer a
  // frame after the store already had it.
  if (isSettled(stored, pending)) setPending(null);

  const shown = shownChoice(stored, pending);

  // The chip ids are the stored values, and they are checked against the shared schema on the way
  // back in anyway — a chip is a string by the time it reaches here, and this is where it stops
  // being one.
  const choose = (id: string) => {
    // Pressing the lit chip is not an undo — it is already this palette, so there is nothing to
    // write and nothing to say.
    if (id === shown) return;

    const mode = colorVision.safeParse(id);

    if (mode.success && set({ key: 'colorVision', value: mode.data })) {
      setPending({ value: mode.data, from: stored });
      return;
    }

    setPending(null);
    toast.error('Something went wrong');
  };

  return (
    <Sheet ref={sheet}>
      <View className="px-[18px] pt-[6px]" style={{ paddingBottom: insets.bottom + 18 }}>
        <Text className="text-[18px] font-semibold tracking-[-0.4px] text-ink">Colour vision</Text>
        <Text className="mt-[6px] text-[13px] leading-[19px] text-ink-muted">
          The app codes notes, keys and scales by colour. Pick the palette that stays clearest to
          you — the neck below is drawn in whichever is chosen, and the choice is kept as you make
          it.
        </Text>

        <View className="mt-[18px]">
          <ColorVisionPreview mode={shown} />
        </View>

        <SelectableChips items={MODE_CHIPS} value={shown} onChange={choose} className="mt-[18px]" />

        {/* Colour is never the only thing carrying a meaning in this app, and someone weighing up
            four palettes deserves to know that before they go looking for the perfect one. */}
        <Text className="mt-[14px] text-[12px] leading-[17px] text-ink-faint">
          Every note still shows its name, and every chip its label. The palette only makes them
          quicker to tell apart.
        </Text>
      </View>
    </Sheet>
  );
}
