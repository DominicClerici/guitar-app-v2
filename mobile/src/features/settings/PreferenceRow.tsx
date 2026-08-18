import { preferenceEntry, type PreferenceKey } from '@guitar/shared';
import { useState } from 'react';
import { Text, View } from 'react-native';

import { PillSelector, type PillOption } from '@/components/PillSelector';
import { usePreferenceWriter } from '@/lib/preferences';
import { toast } from '@/lib/toast';

import { isSettled, shownChoice, type Pending } from './choice';

interface Props {
  label: string;
  /** The preference this row sets; each option's id is one of its values. */
  name: PreferenceKey;
  /** What the database holds for `name` right now. */
  stored: string;
  options: PillOption[];
}

/**
 * One preference, as a label and a row of choices.
 *
 * The choice is applied by writing it to the device, which is the only step that can fail. There is
 * no request to wait on and no spinner: sync carries the row to the server afterwards on its own
 * schedule, and whether it has got there yet is not something this row reports (BACKEND_PLAN.md §6).
 * So the only failure worth showing is a value that never landed anywhere — and then the pill goes
 * back to what is still stored rather than sitting on a setting the app does not actually have.
 *
 * The option ids are checked against the shared schema before the write, which is what makes the
 * row's `name` and its `options` safe to state separately at the call site: a pairing that does not
 * exist is refused here rather than stored as a value nothing can read back.
 */
export function PreferenceRow({ label, name, stored, options }: Props) {
  const { set } = usePreferenceWriter();
  const [pending, setPending] = useState<Pending<string> | null>(null);

  // Adjusted during render rather than in an effect: an effect would let the pill draw one frame on
  // the choice after the store already agrees with it, and a value arriving from another device
  // would spend that frame showing what this device picked instead.
  if (isSettled(stored, pending)) setPending(null);

  const choose = (id: string) => {
    const entry = preferenceEntry.safeParse({ key: name, value: id });

    if (entry.success && set(entry.data)) {
      setPending({ value: id, from: stored });
      return;
    }

    setPending(null);
    toast.error('Something went wrong');
  };

  return (
    <View className="h-[54px] flex-row items-center gap-[12px]">
      <Text
        numberOfLines={1}
        className="flex-1 text-[14.5px] font-medium tracking-[-0.2px] text-ink"
      >
        {label}
      </Text>

      {/* Fixed, and the same on every row: the tray has to be given its width, and giving each one
          the width its own words need would leave the pills stepping in and out down the column. */}
      <PillSelector
        options={options}
        value={shownChoice(stored, pending)}
        onChange={choose}
        commit="release"
        label={label}
        className="w-[188px]"
      />
    </View>
  );
}
