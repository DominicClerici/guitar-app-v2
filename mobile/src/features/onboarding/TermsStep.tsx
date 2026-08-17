import { Text, View } from 'react-native';

import { PRIVACY_URL, TERMS_URL, openLegalDocument } from '@/lib/legal';

import { OptionCard } from './OptionCard';
import { StepError } from './StepError';
import { StepHeading } from './StepHeading';

/**
 * Step six: the one thing that has to be agreed to, and the one thing that does not.
 *
 * They are the same shape on purpose — two cards you turn on — because they are the same kind of
 * act, and a checkbox for one beside a switch for the other would imply a difference that is not
 * there. What separates them is the flow's button: it stays disabled until the terms card is on,
 * and it never looks at the other one.
 *
 * The email card is off when the screen opens and is never pre-ticked. An opt-in that arrives
 * already ticked is not an opt-in, and the description says what actually gets sent rather than
 * "updates and offers", which is the sentence nobody believes.
 */
export function TermsStep({
  agreed,
  onAgreed,
  emails,
  onEmails,
  error,
}: {
  agreed: boolean;
  onAgreed: (agreed: boolean) => void;
  emails: boolean;
  onEmails: (emails: boolean) => void;
  error: string | null;
}) {
  return (
    <View>
      <StepHeading title="One last thing">
        Then you’re in. This is the only screen with any paperwork on it.
      </StepHeading>

      <View className="mt-[24px] gap-[9px]">
        <OptionCard
          title="I agree to the terms"
          description="You accept the Terms of Service and the Privacy Policy."
          selected={agreed}
          mark="many"
          onPress={() => onAgreed(!agreed)}
          footer={
            <View className="mt-[9px] flex-row items-center gap-[14px]">
              <LegalLink label="Terms of Service" url={TERMS_URL} />
              <LegalLink label="Privacy Policy" url={PRIVACY_URL} />
            </View>
          }
        />

        <OptionCard
          title="Send me practice emails"
          description="An occasional nudge when you’ve been away, and a note when a new pathway lands. No more than a couple a month, and you can stop them any time."
          selected={emails}
          mark="many"
          onPress={() => onEmails(!emails)}
        />
      </View>

      <StepError message={error} />
    </View>
  );
}

/**
 * A link inside a card that is itself a button.
 *
 * Its own `Text` with a press handler rather than a nested `Pressable`: on the card's own press
 * area, a tap that lands here must open the document instead of toggling the card, and this is what
 * stops the press travelling on to it.
 */
function LegalLink({ label, url }: { label: string; url: string }) {
  return (
    <Text
      onPress={() => void openLegalDocument(url)}
      accessibilityRole="link"
      suppressHighlighting
      className="text-[12.5px] font-medium text-accent underline"
    >
      {label}
    </Text>
  );
}
