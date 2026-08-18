import { useImperativeHandle, useRef, type Ref } from 'react';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Sheet, type SheetRef } from '@/components/Sheet';

export type AboutSheetRef = SheetRef;

/**
 * What the app is, and who made it.
 *
 * Empty for now beyond its own heading — the row that opens it is real, and this is where its
 * contents will go.
 */
export function AboutSheet({ ref }: { ref?: Ref<AboutSheetRef> }) {
  const insets = useSafeAreaInsets();
  const sheet = useRef<SheetRef>(null);

  useImperativeHandle(
    ref,
    () => ({
      present: () => sheet.current?.present(),
      dismiss: () => sheet.current?.dismiss(),
    }),
    [],
  );

  return (
    <Sheet ref={sheet}>
      {/* A minimum height while there is nothing in it: a sheet the height of one line reads as a
          sheet that failed to load rather than one still being written. */}
      <View
        className="min-h-[180px] px-[18px] pt-[6px]"
        style={{ paddingBottom: insets.bottom + 18 }}
      >
        <Text className="text-[18px] font-semibold tracking-[-0.4px] text-ink">About</Text>
      </View>
    </Sheet>
  );
}
