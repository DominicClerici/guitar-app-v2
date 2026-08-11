import { SymbolView } from 'expo-symbols';
import { Text, View } from 'react-native';

import { Button } from '@/components/Button';
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

/**
 * The two roundings the docked row wears, as numbers the native squircle is drawn from. Half the
 * 50px height is as far as a corner can go, which is how one asks to be a semicircle.
 */
const DOCKED_TRAILING = { topLeft: 10, bottomLeft: 10, topRight: 25, bottomRight: 25 };
const DOCKED_LEADING = { topLeft: 25, bottomLeft: 25, topRight: 10, bottomRight: 10 };

export function PathwayActions({ action, onMenu, docked = false }: Props) {
  const trailing = docked ? 'rounded-l-[10px] rounded-r-full' : 'rounded-[10px]';

  // `box-none` so the gap between the two buttons is not a lid over the page: docked, everything
  // but the buttons themselves has to fall through to the scroll view behind.
  return (
    <View pointerEvents="box-none" className="flex-row items-center gap-[10px]">
      <MenuTrigger onPress={onMenu} docked={docked} />

      {action.kind === 'continue' ? (
        <Button
          variant="primary"
          size="lg"
          icon="play.fill"
          radius={docked ? DOCKED_TRAILING : undefined}
          className="flex-1"
          accessibilityLabel="Continue this pathway"
          onPress={action.onPress}
        >
          {action.label}
        </Button>
      ) : action.kind === 'start' ? (
        <Button
          variant="primary"
          size="lg"
          radius={docked ? DOCKED_TRAILING : undefined}
          className="flex-1"
          accessibilityLabel={`Start ${action.title}`}
          onPress={action.onPress}
        >
          Start pathway
        </Button>
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
 * one — `ellipsis.vertical` exists only in the bubble variants. The rotation needs a box of its
 * own, so the glyph comes in as a child and the button is told to stay square.
 */
function MenuTrigger({ onPress, docked }: { onPress: () => void; docked: boolean }) {
  const ink = useToken('--ink', '#eef0f4');

  return (
    <Button
      variant="secondary"
      size="lg"
      square
      radius={docked ? DOCKED_LEADING : 10}
      accessibilityLabel="More pathway options"
      onPress={onPress}
    >
      <View className="rotate-90">
        <SymbolView name="ellipsis" size={17} weight="semibold" tintColor={ink} />
      </View>
    </Button>
  );
}
