import { useImperativeHandle, useRef, type Ref } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Sheet, type SheetRef } from '@/components/Sheet';

import { OnboardingPitch } from './OnboardingPitch';

export type AccountSheetRef = SheetRef;

/**
 * The signed-out account view as a bottom sheet, presented from the home-screen avatar.
 *
 * `onCreateAccount` fires *after* the sheet has finished closing rather than on the press. A
 * modal route pushed over a sheet still mid-dismiss animates over a moving backdrop, and closing
 * first is also what leaves the home screen behind rather than a sheet to return to.
 */
export function AccountSheet({
  ref,
  onCreateAccount,
}: {
  ref?: Ref<AccountSheetRef>;
  onCreateAccount: () => void;
}) {
  const sheetRef = useRef<SheetRef>(null);
  const handingOff = useRef(false);
  const insets = useSafeAreaInsets();

  useImperativeHandle(
    ref,
    () => ({
      present: () => sheetRef.current?.present(),
      dismiss: () => sheetRef.current?.dismiss(),
    }),
    [],
  );

  return (
    <Sheet
      ref={sheetRef}
      onDismiss={() => {
        // A pan-down close lands here too, with nothing pending — which is the point of the flag.
        if (!handingOff.current) return;
        handingOff.current = false;
        onCreateAccount();
      }}
    >
      <View className="pt-[8px]" style={{ paddingBottom: insets.bottom + 24 }}>
        <OnboardingPitch
          variant="sheet"
          onCreateAccount={() => {
            handingOff.current = true;
            sheetRef.current?.dismiss();
          }}
        />
      </View>
    </Sheet>
  );
}
