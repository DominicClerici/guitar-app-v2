import { SymbolView } from 'expo-symbols';
import { Pressable, Text, View } from 'react-native';

import { useFace } from '@/components/CornerFace';
import { SquirclePressable } from '@/components/Squircle';
import { MAX_ACTIVE_PATHWAYS } from '@/lib/learning';
import { useToken } from '@/lib/tokens';

// The pathway's controls: whatever the one thing to do here is, and everything else behind an
// ellipsis. Rendered twice on the screen — once in the body, once docked at the bottom of the
// screen after the body's copy has scrolled away — so the two cannot drift apart.

/** What the wide half of the row offers, which is a matter of where the learner stands. */
export type PathwayAction =
  | { kind: 'continue'; label: string; onPress: () => void }
  | { kind: 'start'; title: string; onPress: () => void }
  | { kind: 'complete' }
  | { kind: 'capped' };

interface Props {
  action: PathwayAction;
  onMenu: () => void;
  /**
   * Docked at the bottom of the screen rather than sitting in the page. The outer corner of each
   * button rounds off to follow the curve of the screen it is tucked into; the corners facing each
   * other keep the radius the rest of the app uses.
   */
  docked?: boolean;
}

const PRIMARY =
  'h-[50px] flex-1 flex-row items-center justify-center gap-[9px] border border-x-transparent border-t-[rgba(255,255,255,0.4)] border-b-[rgba(0,0,0,0.28)] bg-accent active:opacity-80';

/**
 * The same two roundings the `trailing` classes describe, as numbers the native
 * squircle can be drawn from. `rounded-full` on a 50px row is a semicircle, so
 * the outer corner is half the height.
 */
const CONTINUE_RADIUS = { topLeft: 10, bottomLeft: 10, topRight: 25, bottomRight: 25 };

export function PathwayActions({ action, onMenu, docked = false }: Props) {
  const onAccent = useToken('--on-accent', '#04211f');
  const accent = useToken('--accent', '#5ec8c2');

  const trailing = docked ? 'rounded-l-[10px] rounded-r-full' : 'rounded-[10px]';

  // `box-none` so the gap between the two buttons is not a lid over the page: docked, everything
  // but the buttons themselves has to fall through to the scroll view behind.
  return (
    <View pointerEvents="box-none" className="flex-row items-center gap-[10px]">
      <MenuTrigger onPress={onMenu} docked={docked} />

      {action.kind === 'continue' ? (
        // The one control on the screen wearing Apple's corner rather than a
        // quarter circle. Its fill and rounding come off the utilities and onto
        // props, because the shape is painted by a native layer; the bevel does
        // not survive the move, since that layer strokes one colour and the
        // bevel is a different one top and bottom.
        <SquirclePressable
          onPress={action.onPress}
          accessibilityRole="button"
          accessibilityLabel="Continue this pathway"
          fill={accent}
          radius={docked ? CONTINUE_RADIUS : 10}
          className="h-[50px] flex-1 flex-row items-center justify-center gap-[9px] active:opacity-80"
        >
          <SymbolView name="play.fill" size={13} tintColor={onAccent} />
          <Text className="text-[15px] font-bold tracking-[0.3px] text-on-accent">
            {action.label}
          </Text>
        </SquirclePressable>
      ) : action.kind === 'start' ? (
        <Pressable
          onPress={action.onPress}
          accessibilityRole="button"
          accessibilityLabel={`Start ${action.title}`}
          className={`${PRIMARY} ${trailing}`}
        >
          <Text className="text-[15px] font-bold tracking-[0.3px] text-on-accent">
            Start pathway
          </Text>
        </Pressable>
      ) : action.kind === 'complete' ? (
        <View
          className={`h-[50px] flex-1 flex-row items-center justify-center border border-accent-line bg-accent-wash ${trailing}`}
        >
          <Text className="font-mono text-[10px] font-semibold uppercase tracking-[2px] text-accent">
            Pathway complete
          </Text>
        </View>
      ) : (
        <View className="flex-1 rounded-[10px] border border-line-soft bg-surface-raised px-[14px] py-[13px]">
          <Text className="text-[12.5px] leading-[18px] text-ink-muted">
            You already have {MAX_ACTIVE_PATHWAYS} pathways on the go. Drop one to start this —
            nothing you have finished is lost either way.
          </Text>
        </View>
      )}
    </View>
  );
}

/**
 * The square sibling of Continue: everything else this pathway can do, one tap away.
 *
 * `ellipsis` rotated rather than a vertical symbol of its own, because SF Symbols does not ship
 * one — `ellipsis.vertical` exists only in the bubble variants.
 */
function MenuTrigger({ onPress, docked }: { onPress: () => void; docked: boolean }) {
  const ink = useToken('--ink', '#eef0f4');
  const face = useFace('key', 10);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="More pathway options"
      className={`h-[50px] w-[50px] items-center justify-center active:opacity-70 ${
        docked ? 'rounded-l-full rounded-r-[10px]' : 'rounded-[10px]'
      } ${face.className}`}
    >
      {face.paint}
      <View className="rotate-90">
        <SymbolView name="ellipsis" size={17} weight="semibold" tintColor={ink} />
      </View>
    </Pressable>
  );
}
