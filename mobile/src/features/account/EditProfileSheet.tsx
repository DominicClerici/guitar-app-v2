import { displayName } from '@guitar/shared';
import { useImperativeHandle, useRef, useState, type Ref } from 'react';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AuthTextField } from '@/components/AuthTextField';
import { Button } from '@/components/Button';
import { Sheet, type SheetRef } from '@/components/Sheet';
import { authClient, describeAuthError } from '@/lib/auth';

import { AccountAvatar, type AvatarUser } from './AccountAvatar';
import { FormError } from './AuthShell';
import { SheetHeading } from './SheetHeading';

export type EditProfileSheetRef = SheetRef;

interface Props {
  ref?: Ref<EditProfileSheetRef>;
  user: AvatarUser;
}

/**
 * The profile, edited: the picture and the name, which is everything about an account that is the
 * account's own rather than its credentials. The address is not here — changing it is a different
 * act with a confirmation attached, and it has a sheet of its own.
 *
 * The name is written with `updateUser`, which refreshes the session store itself, so the heading
 * behind the sheet is already correct by the time the sheet is gone. The picture is not written by
 * anything yet: there is nowhere to upload one to, and a picker opening onto a destination that
 * does not exist would be worse than a button that waits.
 *
 * It closes itself once the write lands, which is why it keeps its own handle on the sheet and
 * forwards a copy out rather than taking the caller's — a `dismiss` the caller would have to pass
 * back in as a second prop is the same handle twice.
 */
export function EditProfileSheet({ ref, user }: Props) {
  const insets = useSafeAreaInsets();
  const sheet = useRef<SheetRef>(null);

  const [name, setName] = useState(user.name);
  const [error, setError] = useState<string | null>(null);
  const [failure, setFailure] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useImperativeHandle(
    ref,
    () => ({
      present: () => sheet.current?.present(),
      dismiss: () => sheet.current?.dismiss(),
    }),
    [],
  );

  // Dismissing is how an edit is abandoned, so the field goes back to what is on record rather than
  // holding half a name typed on the way out and offering it again next time.
  const reset = () => {
    setName(user.name);
    setError(null);
    setFailure(null);
  };

  const save = async () => {
    const parsed = displayName.safeParse(name);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Enter your name');
      return;
    }

    setError(null);
    setFailure(null);

    // Nothing to write, so nothing to wait for — the sheet just goes.
    if (parsed.data === user.name) {
      sheet.current?.dismiss();
      return;
    }

    setPending(true);
    const { error: failed } = await authClient.updateUser({ name: parsed.data });
    setPending(false);

    if (failed) {
      setFailure(describeAuthError(failed));
      return;
    }

    sheet.current?.dismiss();
  };

  return (
    <Sheet ref={sheet} onDismiss={reset}>
      <View className="gap-[18px] px-[18px] pt-[6px]" style={{ paddingBottom: insets.bottom + 18 }}>
        <SheetHeading title="Your profile" blurb="How you show up in the app." />

        <FormError message={failure} />

        <View className="flex-row items-center gap-[16px]">
          <AccountAvatar user={user} size="lg" />

          <View className="flex-1 items-start gap-[7px]">
            {/* Inert by request — there is nowhere to upload a picture to yet. */}
            <Button variant="quiet" size="sm" radius={10} icon="photo" onPress={() => {}}>
              Change photo
            </Button>
            <Text className="text-[11.5px] leading-[16px] text-ink-faint">
              Coming soon — your initials stand in until then.
            </Text>
          </View>
        </View>

        <AuthTextField
          sheet
          label="Name"
          value={name}
          onChangeText={setName}
          error={error ?? undefined}
          placeholder="Your name"
          autoCapitalize="words"
          autoComplete="name"
          textContentType="name"
          returnKeyType="done"
          onSubmitEditing={save}
        />

        <Button
          variant="soft"
          size="md"
          radius={11}
          className="w-full"
          pending={pending}
          onPress={save}
        >
          Save
        </Button>
      </View>
    </Sheet>
  );
}
