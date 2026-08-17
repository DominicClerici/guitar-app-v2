import { Image } from 'expo-image';
import { Text, View } from 'react-native';

import { initials } from './initials';

export interface AccountSummaryUser {
  name: string;
  email: string;
  /** A provider's picture, when there is one; everyone else gets their initials. */
  image?: string | null;
}

/**
 * Who is signed in, said in one line: face, name, address.
 *
 * Unenclosed on purpose — it sits at the top of Settings as the page's own heading rather than as
 * the first card in a list, so the settings that follow read as belonging to this account.
 *
 * Presentational: it neither reads the session nor offers any control over it.
 */
export function AccountSummary({ user }: { user: AccountSummaryUser }) {
  return (
    <View className="flex-row items-center gap-[14px]">
      {user.image ? (
        <Image
          source={{ uri: user.image }}
          contentFit="cover"
          className="h-[44px] w-[44px] rounded-full border border-line-soft"
        />
      ) : (
        <View className="h-[44px] w-[44px] items-center justify-center rounded-full border border-accent-line bg-accent-wash">
          <Text className="text-[16px] font-semibold tracking-[-0.2px] text-accent">
            {initials(user)}
          </Text>
        </View>
      )}

      <View className="flex-1">
        <Text numberOfLines={1} className="text-[17px] font-semibold tracking-[-0.3px] text-ink">
          {user.name || 'No name set'}
        </Text>
        <Text numberOfLines={1} className="mt-[2px] text-[13px] text-ink-muted">
          {user.email}
        </Text>
      </View>
    </View>
  );
}
