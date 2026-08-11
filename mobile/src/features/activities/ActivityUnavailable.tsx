import { Text, View } from 'react-native';

/**
 * What an activity this build cannot run looks like.
 *
 * Deliberately the same two lines `ChapterCard` shows for a section of an unknown kind: the
 * learner meets one of these from the chapter list, and reading a different explanation on the
 * next screen would suggest the two are different problems. They are the same problem — content
 * shipped ahead of the app — and the answer to both is an update.
 *
 * It covers three cases the screen cannot tell apart and should not try to: an activity kind the
 * parser degraded to `unknown`, a kind the registry has no runner for, and a known kind with no
 * round this build can actually run.
 */
export function ActivityUnavailable() {
  return (
    <View className="flex-1 items-center justify-center px-[32px]">
      <Text className="text-center text-[17px] font-semibold tracking-[-0.3px] text-ink">
        Something new
      </Text>
      <Text className="mt-[8px] text-center font-mono text-[10px] uppercase tracking-[2px] text-ink-faint">
        Update the app to open this
      </Text>
    </View>
  );
}
