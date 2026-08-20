import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { View } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useStill } from '@/lib/theme/frozen';
import { SettingsTab } from '@/screens/SettingsTab';

import { TabBar } from './TabBar';
import { TABS } from './tabs';

/**
 * The one tab a change of appearance can be started from, and so the only one this has to be able
 * to hold still. The appearance control is a row on the settings screen and nothing else in the app
 * calls `beginThemeSwitch` — if that ever stops being true, what is rendered below has to be chosen
 * from wherever the pager actually is rather than assumed here.
 */
const FROZEN = TABS.findIndex((tab) => tab.key === 'settings');

/** The bar is not pressable here; it is a picture of one. */
const noop = () => {};

/**
 * The settings screen as it is at this moment, rendered a second time and held still.
 *
 * A change of appearance lays this over the app, pinned to the palette being left, and opens the
 * new one up through it (`lib/theme/switch`). It is the app's own components rather than a
 * simplified stand-in, and that is the point: a copy built by hand would be a second description of
 * every row, drifting from the first the day either changed, and would still have to be right to
 * the pixel — because what it is laid over is the identical live screen, and anything the two
 * disagree about is a thing the user watches shift.
 *
 * Rendering it again costs a screen, which is what the photograph this replaced cost in encoding
 * alone. Everything React knows arrives for free: the account, the stored preferences, every
 * measured width. The two things it does not know are the two scroll offsets, which are native and
 * are put back from `lib/theme/frozen`.
 *
 * The shell around the page is written out rather than borrowed from `TopTabs`, because what
 * `TopTabs` holds is a pager with all six tabs in it — five of them things nobody is looking at.
 * What is left is a padded background and a tab bar, which is small enough to say twice.
 *
 * Its own `BottomSheetModalProvider` because the screen is full of sheets and every one of them
 * asks for that context on the way to rendering nothing. The switch is mounted above the app's
 * provider rather than inside it, so the copy brings one of its own: a provider with no presented
 * sheet is a context and a container, and none of the sheets under it will ever be asked to open.
 */
export function FrozenScreen() {
  const insets = useSafeAreaInsets();

  // Subscribed to rather than read once, because this copy can outlive the press that built it —
  // see `lib/theme/frozen`. Every press reads the two offsets again, and a copy already standing is
  // moved to them rather than rebuilt: the expensive half of it is right and stays right.
  const still = useStill();

  // The bar reads its position out of these, and at rest they say one thing: the tab we are on,
  // with no swipe and no tap under way. Fresh values rather than the live screen's, because what
  // they describe is a screen that has stopped.
  const scrollX = useSharedValue(FROZEN);
  const tapActive = useSharedValue(0);
  const tapFrom = useSharedValue(FROZEN);
  const tapTo = useSharedValue(FROZEN);
  const tapProgress = useSharedValue(0);

  return (
    <BottomSheetModalProvider>
      <View className="flex-1 bg-bg" style={{ paddingTop: insets.top }}>
        <TabBar
          scrollX={scrollX}
          onTabPress={noop}
          tapActive={tapActive}
          tapFrom={tapFrom}
          tapTo={tapTo}
          tapProgress={tapProgress}
          stillAt={still.tabBar}
        />

        <View className="flex-1 overflow-hidden">
          <SettingsTab stillAt={still.settings} />
        </View>
      </View>
    </BottomSheetModalProvider>
  );
}
