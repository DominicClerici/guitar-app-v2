import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import { useCallback, useImperativeHandle, useRef, type ReactNode, type Ref } from 'react';
import { StyleSheet } from 'react-native';

import { useToken } from '@/lib/tokens';

export type SheetRef = {
  present: () => void;
  dismiss: () => void;
};

/**
 * The app's bottom sheet. Wraps `BottomSheetModal` so every sheet gets the same
 * dimmed backdrop over the content behind it, the same Aurora surface and
 * grabber, and the same present/dismiss handle.
 *
 * Pass `snapPoints` for a sheet that should claim a fixed share of the screen —
 * its body then owns the full height and should lay itself out with `flex-1`.
 * Leave it off and the content's own height decides.
 */
export function Sheet({
  ref,
  snapPoints,
  onVisibleChange,
  onDismiss,
  children,
}: {
  ref?: Ref<SheetRef>;
  snapPoints?: (string | number)[];
  onVisibleChange?: (visible: boolean) => void;
  onDismiss?: () => void;
  children: ReactNode;
}) {
  const modal = useRef<BottomSheetModal>(null);
  const bg = useToken('--bg', '#0c0d10');
  const grabber = useToken('--ink-faint', '#62666e');
  const fixed = snapPoints !== undefined;

  useImperativeHandle(
    ref,
    () => ({
      present: () => modal.current?.present(),
      dismiss: () => modal.current?.dismiss(),
    }),
    [],
  );

  // The stock backdrop only fades in from index 1, so a single-detent sheet would
  // open over nothing. Both ends are pinned to this sheet's own range instead.
  const backdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} opacity={0.6} />
    ),
    [],
  );

  return (
    <BottomSheetModal
      ref={modal}
      snapPoints={snapPoints}
      // Snap points and dynamic sizing are mutually exclusive: a fixed detent
      // wins where one is given, otherwise the body measures itself.
      enableDynamicSizing={!fixed}
      enablePanDownToClose
      backdropComponent={backdrop}
      // These reach views the library owns, so there is no className equivalent.
      backgroundStyle={{ backgroundColor: bg }}
      handleIndicatorStyle={{ backgroundColor: grabber }}
      onChange={(index) => onVisibleChange?.(index >= 0)}
      onDismiss={onDismiss}
    >
      <BottomSheetView style={fixed ? styles.fill : undefined}>{children}</BottomSheetView>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  // `BottomSheetView` positions itself absolutely with only top/left/right, so `flex: 1`
  // never applies and the body ends up content-sized — collapsing any `flex-1` child to
  // zero height. Pinning `bottom` stretches it to the detent instead.
  fill: { bottom: 0, flex: 1 },
});
