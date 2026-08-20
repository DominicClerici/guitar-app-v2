import { SquircleShape, type SquircleCorners } from '@modules/expo-squircle-view';

import { APPLE_SMOOTHING } from '@/lib/squircle';

import { useFacePaint, type Paint } from './buttonFace';
import { corners } from './Squircle';

/** The 1px hairline every Aurora face wears. */
const HAIRLINE = 1;

/** The runs a `dashed` hairline is drawn in — a placeholder's border, and nothing else. */
const DASH = [4, 4];

interface FaceSpec {
  fill: Paint;
  /**
   * Every face declares one, `transparent` where it should not show, so the
   * shape is drawn from the same props whatever it is wearing.
   */
  stroke: Paint;
}

/**
 * Every rounded face the app wears, as the colours it is made of. Keeping them
 * in one table is what stops a card on one screen drifting from a card on
 * another — a surface names the face it wants rather than restating it.
 */
const FACES = {
  /** A lifted card or chip, the most common surface in the app. */
  card: {
    fill: '--surface',
    stroke: '--line-soft',
  },
  /** The same a step brighter — a key that sits on a tray rather than in it. */
  key: {
    fill: '--surface-raised',
    stroke: '--line-soft',
  },
  /** The lit half of a toggle: raised out of its housing, with no hairline of its own. */
  slab: {
    fill: '--surface-raised',
    stroke: 'transparent',
  },
  /** A recessed tray that other things sit in. */
  tray: {
    fill: '--tray',
    stroke: '--line-soft',
  },
  /** Chosen. */
  accent: {
    fill: '--accent-wash',
    stroke: '--accent-line',
  },
  /** Something went wrong. Nothing in Aurora is a filled red. */
  alert: {
    fill: '--rose-wash',
    stroke: '--rose',
  },
  /** Nothing at all, for the unselected half of a toggle. */
  bare: {
    fill: 'transparent',
    stroke: 'transparent',
  },
} satisfies Record<string, FaceSpec>;

export type FaceName = keyof typeof FACES;

/**
 * A named face, or the colours themselves for the surfaces the table has no
 * name for — a chip lit solid accent, a hairline in the full-strength colour
 * rather than the washed one. Reach for a name wherever there is one: that is
 * what keeps a card on one screen the same card on another.
 */
type Props = {
  radius: number | Partial<SquircleCorners>;
  /** A broken hairline, for a surface standing in for content that is not there. */
  dashed?: boolean;
} & ({ name: FaceName } | Partial<FaceSpec>);

/**
 * The background and hairline of one surface, drawn as Apple's continuous
 * corner rather than a `border-radius` quarter circle. Render it as the first
 * child of the box it is the face of, and leave the box itself unpainted — no
 * `bg-*`, and no `border`, since the hairline is the shape's own stroke and
 * takes no room in the layout:
 *
 * ```tsx
 * <View className="px-[16px]">
 *   <Face name="card" radius={13} />
 *   …
 * </View>
 * ```
 *
 * A surface whose colours are not in the table names them instead:
 *
 * ```tsx
 * <Face fill="--accent" radius={8} />
 * ```
 *
 * The shape is painted by a native layer stretched over the box, so it is right
 * on the first frame and stays right through a resize. Reach for `SquircleView`
 * where the corner has to clip what is inside it, and for `SquirclePressable` —
 * or `Button`, which is built on it — where it is a control rather than a
 * surface.
 */
export function Face({ radius, dashed = false, ...props }: Props) {
  const paint = useFacePaint();

  const spec: FaceSpec =
    'name' in props
      ? FACES[props.name]
      : { fill: props.fill ?? 'transparent', stroke: props.stroke ?? 'transparent' };

  return (
    <SquircleShape
      radii={corners(radius)}
      smoothing={APPLE_SMOOTHING}
      fill={paint(spec.fill)}
      stroke={paint(spec.stroke)}
      strokeWidth={spec.stroke === 'transparent' ? 0 : HAIRLINE}
      strokeDash={dashed ? DASH : undefined}
    />
  );
}
