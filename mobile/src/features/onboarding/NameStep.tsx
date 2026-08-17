import { View } from 'react-native';

import { AuthTextField } from '@/components/AuthTextField';

import { StepHeading } from './StepHeading';

/**
 * Step three: what to call them.
 *
 * The one question in the flow that has to be answered — everything after it can be skipped, and
 * `user.name` is what `nextStep` reads to know the account is past this point at all. So the flow's
 * button stays disabled until there is something in the field, and there is no way past it.
 *
 * Apple and Google supply a name, and the server keeps it in `oauthProfile` rather than in
 * `user.name` on purpose. It arrives here as the field's value: a suggestion sitting in an editable
 * box, which someone can accept by pressing Continue or type over.
 *
 * The value is the flow's rather than this step's, because the button that submits it now lives
 * outside the step — anchored to the bottom of the screen, where it does not move when the question
 * changes. What is typed here therefore also survives stepping back to it.
 */
export function NameStep({
  value,
  onChange,
  error,
  onSubmit,
}: {
  value: string;
  onChange: (name: string) => void;
  error: string | null;
  /** The keyboard's return key, where there is enough to submit. */
  onSubmit?: () => void;
}) {
  return (
    <View>
      <StepHeading title="What should we call you?">
        This is the name we’ll greet you with. You can change it later.
      </StepHeading>

      <View className="mt-[26px]">
        <AuthTextField
          label="Name"
          value={value}
          onChangeText={onChange}
          error={error ?? undefined}
          placeholder="Your name"
          autoCapitalize="words"
          autoComplete="name"
          textContentType="name"
          returnKeyType="next"
          // Nothing is fetched while this is open and the field is the only thing on the step, so
          // it takes focus on arrival rather than asking for a tap first.
          autoFocus
          onSubmitEditing={onSubmit}
        />
      </View>
    </View>
  );
}
