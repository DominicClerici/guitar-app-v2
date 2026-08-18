import { SymbolView } from 'expo-symbols';
import { Pressable, Text, View } from 'react-native';

import { Face } from '@/components/Face';
import { useToken } from '@/lib/tokens';

import { AccountAvatar, type AvatarUser } from './AccountAvatar';

export type AccountSummaryUser = AvatarUser;

/**
 * Who is signed in, said in one line: face, name, address.
 *
 * On a card, and the only thing on the screen that is. Everything under it is a setting, drawn as a
 * bare row in a list of them — so enclosing this is what keeps the account from reading as the
 * first of those settings, and marks it as the one thing here that is a subject rather than a
 * switch.
 *
 * The whole card is one target rather than three, since the face, the name and the address all open
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
  const faint = useToken('--ink-faint', '#62666e');

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={onPress ? `${user.name || 'No name set'}, ${user.email}` : undefined}
      accessibilityHint={onPress ? 'Opens your profile' : undefined}
      className={`flex-row items-center gap-[14px] p-[16px] ${onPress ? 'active:opacity-60' : ''}`}
    >
      <Face name="card" radius={18} />

      <AccountAvatar user={user} />

      <View className="flex-1">
        <Text numberOfLines={1} className="text-[17px] font-semibold tracking-[-0.3px] text-ink">
          {user.name || 'No name set'}
        </Text>
        <Text numberOfLines={1} className="mt-[2px] text-[13px] text-ink-muted">
          {user.email}
        </Text>
      </View>

      {/* The card is the only way into the profile, so it has to say it leads somewhere the same
          way every other row that does says it. */}
      {onPress ? (
        <SymbolView name="chevron.right" size={11} weight="semibold" tintColor={faint} />
      ) : null}
    </Pressable>
  );
}
