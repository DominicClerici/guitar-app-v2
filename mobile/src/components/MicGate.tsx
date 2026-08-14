import type { ReactNode } from 'react';
import { useSyncExternalStore } from 'react';
import { ActivityIndicator, Linking, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { getStatus, subscribeStatus, type MicStatus } from '@/lib/mic';
import { useToken } from '@/lib/tokens';

// Everything between "the mic is meant to be on" and "the mic is on", so no runner has to draw a
// permission dialog of its own.
//
// It reads the session's status but never takes a lease. The lease belongs to whoever knows when
// a run starts and ends — the runner — and a gate that acquired on mount would hold the mic open
// across the intro card and the summary, which on iOS means the recording indicator stays lit
// while nothing is listening.

/** The one microphone session's current state, as a hook. */
export function useMicStatus(): MicStatus {
  return useSyncExternalStore(subscribeStatus, getStatus, getStatus);
}

export function MicGate({
  children,
  reason = 'This activity listens to your guitar, so it needs the microphone.',
}: {
  children: ReactNode;
  /** Why this particular activity needs the mic, in the learner's terms. */
  reason?: string;
}) {
  const status = useMicStatus();
  const muted = useToken('--ink-muted', '#9aa0aa');

  if (status === 'listening') return <>{children}</>;

  if (status === 'unavailable') {
    return (
      <Notice
        title="Unavailable on this platform"
        body="The pitch detector is not available in this build."
      />
    );
  }

  if (status === 'denied') {
    return (
      <Notice title="Microphone access needed" body={reason}>
        <Button
          variant="secondary"
          size="md"
          text="mono"
          radius={10}
          className="mt-[18px]"
          onPress={() => void Linking.openSettings()}
        >
          Open settings
        </Button>
      </Notice>
    );
  }

  // `idle` as well as `starting`: the gate is mounted by a runner that has just asked for a lease,
  // so idle is the fraction of a second before the request lands, and it looks like warming up.
  return (
    <View className="flex-1 items-center justify-center gap-[14px]">
      <ActivityIndicator color={muted} />
      <Text className="font-mono text-[10px] uppercase tracking-[2px] text-ink-faint">
        Warming up
      </Text>
    </View>
  );
}

function Notice({ title, body, children }: { title: string; body: string; children?: ReactNode }) {
  return (
    <View className="flex-1 items-center justify-center px-[32px]">
      <Text className="text-center text-[17px] font-semibold tracking-[-0.3px] text-ink">
        {title}
      </Text>
      <Text className="mt-[8px] text-center text-[13.5px] leading-[19px] text-ink-muted">
        {body}
      </Text>
      {children}
    </View>
  );
}
