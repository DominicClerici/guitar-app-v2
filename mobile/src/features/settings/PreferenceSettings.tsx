import { useRef } from 'react';
import { View } from 'react-native';

import type { PillOption } from '@/components/PillSelector';
import { usePreferences } from '@/lib/preferences';
import { beginThemeSwitch, prepareThemeSwitch } from '@/lib/theme';

import { ActionRow } from './ActionRow';
import { ColorVisionSheet, type ColorVisionSheetRef } from './ColorVisionSheet';
import { describeColorVision } from './colorVision';
import { PreferenceRow } from './PreferenceRow';
import { SettingsSection } from './SettingsSection';
import { TuningSheet, type TuningSheetRef } from './TuningSheet';
import { describeTuning, tuningFrom } from './tuning';

/** Ids are the stored values — see `preferenceSchemas` in `@guitar/shared`. */
const THEME_OPTIONS: PillOption[] = [
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark' },
  { id: 'system', label: 'System', name: 'System, following the device' },
];

const ACCIDENTAL_OPTIONS: PillOption[] = [
  { id: 'sharp', label: 'Sharps' },
  { id: 'flat', label: 'Flats' },
  { id: 'auto', label: 'Auto', name: 'Auto, however the key is spelled' },
];

/**
 * Both toggles are stated as the thing itself rather than as its absence — "Haptics: Off" rather
 * than "Disable haptics: On", which is a row you have to read twice to find out what it is doing.
 * Reduce motion keeps its own name because that is what the system setting it follows is called,
 * and matching it is how someone recognises the setting they already have.
 */
const TOGGLE_OPTIONS: PillOption[] = [
  { id: 'on', label: 'On' },
  { id: 'off', label: 'Off' },
];

/**
 * The settings that follow the account rather than the device, grouped by what they change.
 *
 * All of them are read from the local database and written to it, so they are already correct on a
 * device that has never been online and they arrive on a second one when sync next runs. No row
 * knows that — reading is a live query and writing returns immediately (BACKEND_PLAN.md §6).
 *
 * The three groups are subjects, not a filing system: what the guitar sounds and spells like, what
 * the app looks like, and what it does to reach you. A setting is found by knowing which of those
 * you are thinking about, which is a shorter search than reading one list of eight.
 */
export function PreferenceSettings() {
  const preferences = usePreferences();
  const tuning = useRef<TuningSheetRef>(null);
  const colorVision = useRef<ColorVisionSheetRef>(null);

  return (
    <View>
      <SettingsSection label="Music">
        {/* Six strings will not fit on a settings line, so this one says what it is set to and
            opens the control that sets it. */}
        <ActionRow
          label="Tuning"
          value={describeTuning(tuningFrom(preferences.tuning), preferences.accidentalPreference)}
          onPress={() => tuning.current?.present()}
        />

        <PreferenceRow
          label="Accidentals"
          name="accidentalPreference"
          stored={preferences.accidentalPreference}
          options={ACCIDENTAL_OPTIONS}
        />
      </SettingsSection>

      <SettingsSection label="Visual">
        {/* The only row that is told where it was pressed: changing the appearance is drawn as the
            new screen opening out of the pill that asked for it, and the pill is the only thing
            that knows where that is (see `lib/theme`). */}
        <PreferenceRow
          label="Appearance"
          name="theme"
          stored={preferences.theme}
          options={THEME_OPTIONS}
          onChoose={beginThemeSwitch}
          onTouch={prepareThemeSwitch}
        />
      </SettingsSection>

      <SettingsSection label="Accessibility">
        <PreferenceRow
          label="Haptics"
          name="haptics"
          stored={preferences.haptics}
          options={TOGGLE_OPTIONS}
        />

        {/* Off until the device says otherwise: a phone already set to reduce motion arrives here
            reading On, without anything having been written for the user. See `usePreferences`. */}
        <PreferenceRow
          label="Reduce motion"
          name="reduceMotion"
          stored={preferences.reduceMotion}
          options={TOGGLE_OPTIONS}
        />

        {/* A palette cannot be picked from a pill tray for the same reason a tuning cannot: the
            names mean nothing until you have seen what they do. */}
        <ActionRow
          label="Colorblind mode"
          value={describeColorVision(preferences.colorVision)}
          onPress={() => colorVision.current?.present()}
        />
      </SettingsSection>

      <TuningSheet
        ref={tuning}
        stored={preferences.tuning}
        accidentals={preferences.accidentalPreference}
      />

      <ColorVisionSheet ref={colorVision} stored={preferences.colorVision} />
    </View>
  );
}
