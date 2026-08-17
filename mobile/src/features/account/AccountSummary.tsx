import { Pressable, Text, View } from 'react-native';

import { AccountAvatar, type AvatarUser } from './AccountAvatar';

export type AccountSummaryUser = AvatarUser;

/**
 * Who is signed in, said in one line: face, name, address.
 *
 * Unenclosed on purpose — it sits at the top of Settings as the page's own heading rather than as
 * the first card in a list, so the settings that follow read as belonging to this account.
 *
 * The whole line is one target rather than three, since the face, the name and the address all open
 * the same thing and a name is too small a word to aim at on its own. Still presentational: it
 * neither reads the session nor knows what pressing it does.
 */
export function AccountSummary({
  user,
  onPress,
}: {
  user: AccountSummaryUser;
  /** Omit for a heading that is only a heading. */
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={onPress ? `${user.name || 'No name set'}, ${user.email}` : undefined}
      accessibilityHint={onPress ? 'Opens your profile' : undefined}
      className={`flex-row items-center gap-[14px] ${onPress ? 'active:opacity-60' : ''}`}
    >
      <AccountAvatar user={user} />

      <View className="flex-1">
        <Text numberOfLines={1} className="text-[17px] font-semibold tracking-[-0.3px] text-ink">
          {user.name || 'No name set'}
        </Text>
        <Text numberOfLines={1} className="mt-[2px] text-[13px] text-ink-muted">
          {user.email}
        </Text>
      </View>
    </Pressable>
  );
}
