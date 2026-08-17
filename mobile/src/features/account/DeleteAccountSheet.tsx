import { useImperativeHandle, useRef, type Ref } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ArmedButton, type ArmedButtonRef } from '@/components/ArmedButton';
import { Button } from '@/components/Button';
import { Sheet, type SheetRef } from '@/components/Sheet';

import { SheetHeading } from './SheetHeading';

export type DeleteAccountSheetRef = SheetRef;

/**
 * Deleting the account: the one thing in Settings that cannot be taken back.
 *
 * So it is asked twice over — once by opening this sheet at all, and once more by the armed button,
 * which changes colour and wording under the finger rather than trusting that the first tap was
 * read. The sheet holds the button's handle for the same reason the pathway menu does: closing the
 * question has to take the arming back with it, or it would be waiting the next time it opened.
 *
 * Inert by request — there is no delete on the server yet.
 */
export function DeleteAccountSheet({ ref }: { ref?: Ref<DeleteAccountSheetRef> }) {
  const insets = useSafeAreaInsets();
  const sheet = useRef<SheetRef>(null);
  const armed = useRef<ArmedButtonRef>(null);

  useImperativeHandle(
    ref,
    () => ({
      present: () => sheet.current?.present(),
      dismiss: () => sheet.current?.dismiss(),
    }),
    [],
  );

  return (
    <Sheet ref={sheet} onDismiss={() => armed.current?.disarm()}>
      <View className="gap-[18px] px-[18px] pt-[6px]" style={{ paddingBottom: insets.bottom + 18 }}>
        <SheetHeading
          title="Delete account"
          blurb="Your pathways, progress and saved work go with it, on every device. This cannot be undone, and signing up again starts from nothing."
        />

        <View className="gap-[9px]">
          <ArmedButton
            ref={armed}
            size="lg"
            icon="trash"
            armedIcon="exclamationmark.triangle.fill"
            label="Delete account"
            armedLabel="Tap again to delete"
            radius={12}
            className="w-full"
            // Inert by request — nothing on the server can carry this out yet.
            onConfirm={() => {}}
          />
          <Button
            variant="quiet"
            size="lg"
            radius={12}
            className="w-full"
            onPress={() => sheet.current?.dismiss()}
          >
            Cancel
          </Button>
        </View>
      </View>
    </Sheet>
  );
}
