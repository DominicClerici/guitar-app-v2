import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
  type BottomSheetBackdropProps,
  type BottomSheetBackgroundProps,
} from '@gorhom/bottom-sheet';
import { useCallback, useImperativeHandle, useRef, type ReactNode, type Ref } from 'react';
import { StyleSheet, View } from 'react-native';
import { ReduceMotion } from 'react-native-reanimated';

import { SquircleShape } from '@modules/expo-squircle-view';

import { useReduceMotion } from '@/lib/preferences';
import { APPLE_SMOOTHING } from '@/lib/squircle';
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
  radius = SHEET_RADIUS,
  onVisibleChange,
  onDismiss,
  children,
}: {
  ref?: Ref<SheetRef>;
  snapPoints?: (string | number)[];
  /** The top corners, for the rare sheet that wants a softer or squarer edge. */
  radius?: number;
  onVisibleChange?: (visible: boolean) => void;
  onDismiss?: () => void;
  children: ReactNode;
}) {
  const modal = useRef<BottomSheetModal>(null);
  const bg = useToken('--bg', '#0c0d10');
  const grabber = useToken('--ink-faint', '#62666e');
  const fixed = snapPoints !== undefined;

  // The one piece of motion in the app that has to be told separately. The sheet library reads
  // Reanimated's `useReducedMotion`, which reports the *device* setting as it was at launch and
  // ignores the global config the root sets — so without this a sheet would keep springing open
  // for someone who turned motion off in this app, and would refuse to for someone who turned it
  // on in iOS and off here.
  const reduceMotion = useReduceMotion();

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

  // The sheet's own surface, so its top corners are the Apple curve every other
  // face in the app wears rather than the library's quarter circle. The shape is
  // native and stretches to the container, so it is right on the first frame and
  // through a drag — the container moves under a fixed height rather than growing.
  const background = useCallback(
    ({ style }: BottomSheetBackgroundProps) => (
      <View
        pointerEvents="none"
        accessible
        accessibilityRole="adjustable"
        accessibilityLabel="Bottom Sheet"
        style={style}
      >
        <SquircleShape
          radii={{ topLeft: radius, topRight: radius, bottomRight: 0, bottomLeft: 0 }}
          smoothing={APPLE_SMOOTHING}
          fill={bg}
        />
      </View>
    ),
    [bg, radius],
  );

  return (
    <BottomSheetModal
      ref={modal}
      snapPoints={snapPoints}
      // Snap points and dynamic sizing are mutually exclusive: a fixed detent
      // wins where one is given, otherwise the body measures itself.
      enableDynamicSizing={!fixed}
      enablePanDownToClose
      overrideReduceMotion={reduceMotion ? ReduceMotion.Always : ReduceMotion.Never}
      backdropComponent={backdrop}
      backgroundComponent={background}
      // This reaches a view the library owns, so there is no className equivalent.
      handleIndicatorStyle={{ backgroundColor: grabber }}
      onChange={(index) => onVisibleChange?.(index >= 0)}
      onDismiss={onDismiss}
    >
      <BottomSheetView style={fixed ? styles.fill : undefined}>{children}</BottomSheetView>
    </BottomSheetModal>
  );
}

/** Wide enough for the corner to read as a curve at sheet scale. */
const SHEET_RADIUS = 34;

const styles = StyleSheet.create({
  // `BottomSheetView` positions itself absolutely with only top/left/right, so `flex: 1`
  // never applies and the body ends up content-sized — collapsing any `flex-1` child to
  // zero height. Pinning `bottom` stretches it to the detent instead.
  fill: { bottom: 0, flex: 1 },
});
