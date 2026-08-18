import * as Haptics from 'expo-haptics';
import { useEffect } from 'react';
import { BackHandler, Text } from 'react-native';
import {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { AnimatedView } from '@/components/AnimatedView';
import { WindowOverlay } from '@/components/WindowOverlay';
import { ARRIVE, TRAVEL } from '@/lib/motion';

import { CurtainMark } from './CurtainMark';
import { HIDE_MS, HOLD_MS, momentText, PLAY_MS, timing } from './moment';
import { endCurtain, useCurtain, type Playing } from './store';

/** Down over a screen in use: out of the gate, so it is hiding things almost at once. */
const COVER = { easing: Easing.out(Easing.quad) };

/** And up again: a whole screen dissolving, so it goes on a curve that starts slowly. */
const HIDE = { duration: HIDE_MS, easing: Easing.inOut(Easing.quad) };

/**
 * Where the curtain plays. Mounted once, by the root layout.
 *
 * Above the navigator rather than inside it, because the screen it covers is not the screen it
 * uncovers. Coming in, it goes up over the last frame of onboarding — which by then is an empty
 * black screen, the answered step having already fallen away — the flow is unwound behind it, and
 * it fades off whatever the person was doing before they went to sign in. Going out, it comes down
 * over the account screen, the session is dropped behind it, and it lifts on a signed-out app.
 *
 * Nothing is pushed and nothing is presented either way, so there is no navigation for this to be
 * the animation of: it is an overlay, and what happens underneath happens where it cannot be seen.
 */
export function CurtainHost() {
  const playing = useCurtain();

  return (
    <WindowOverlay>
      {/* Keyed, so a second moment is played rather than joined halfway through. */}
      {playing ? <Curtain key={playing.id} playing={playing} /> : null}
    </WindowOverlay>
  );
}

function Curtain({ playing }: { playing: Playing }) {
  const { id, kind, onCovered } = playing;
  const plan = timing(kind);

  /** The backdrop. Already opaque where what is underneath is black anyway. */
  const cover = useSharedValue(plan.coverMs === 0 ? 1 : 0);
  /** What it says, which arrives the way every other thing in this app arrives. */
  const fade = useSharedValue(0);
  const lift = useSharedValue(-TRAVEL);

  /**
   * The screen is covered, so whatever asked for this can do the thing that would have flashed.
   *
   * A frame late where the cover was there from the start: the effect runs after the commit that
   * mounted this, and the frame after that is the first one actually on the glass. What happens
   * next is a route being popped, and popping it a frame early would show it going.
   */
  const coverMs = plan.coverMs;

  useEffect(() => {
    if (coverMs === 0) {
      const frame = requestAnimationFrame(() => onCovered?.());
      return () => cancelAnimationFrame(frame);
    }

    const covered = setTimeout(() => onCovered?.(), coverMs);
    return () => clearTimeout(covered);
  }, [coverMs, onCovered]);

  // An arrival is worth a confirmation; a departure is worth a knock. Neither is worth the same
  // one, and a success chime for signing out would be the phone being pleased about it.
  const leaving = plan.reverse;

  useEffect(() => {
    if (leaving) void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    else void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [leaving]);

  // Swallowed for the same reason the touches are: the screen under this one is either half
  // uncovered or about to stop being true. On Android it would otherwise pop whatever the curtain
  // is over, which is a screen the person has not seen yet.
  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => subscription.remove();
  }, []);

  const hideAt = plan.playAt + PLAY_MS + HOLD_MS;

  useEffect(() => {
    fade.value = withTiming(1, ARRIVE);
    lift.value = withTiming(0, ARRIVE);

    // One expression rather than two writes, since a second assignment would simply replace the
    // first: the cover comes down if it has to, waits out the mark and its beat, and lifts.
    const lifting = withDelay(hideAt - coverMs, withTiming(0, HIDE));
    cover.value = coverMs
      ? withSequence(withTiming(1, { duration: coverMs, ...COVER }), lifting)
      : lifting;

    const done = setTimeout(() => endCurtain(id), plan.totalMs);
    return () => clearTimeout(done);
  }, [cover, coverMs, fade, hideAt, id, lift, plan.totalMs]);

  const backdrop = useAnimatedStyle(() => ({ opacity: cover.value }));
  const saying = useAnimatedStyle(() => ({
    opacity: fade.value,
    transform: [{ translateY: lift.value }],
  }));

  return (
    // Takes every touch for as long as it is up, which is the point: this is a beat the app is
    // taking, and a tap landing on a screen that is half hidden would be a tap nobody aimed.
    <AnimatedView
      className="absolute inset-0 items-center justify-center bg-bg px-[32px]"
      accessibilityRole="alert"
      style={backdrop}
    >
      <AnimatedView className="items-center" style={saying}>
        <CurtainMark reverse={plan.reverse} delayMs={plan.playAt} />

        <Text className="mt-[26px] text-center text-[28px] leading-[34px] font-semibold tracking-[-0.7px] text-ink">
          {momentText(playing)}
        </Text>
      </AnimatedView>
    </AnimatedView>
  );
}
