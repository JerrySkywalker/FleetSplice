/** Presentation-only command lifecycle. Never claims Fleet receipt authority. */
export type PresentationCommandState =
  | 'LOCAL_PENDING'
  | 'NATIVE_ACCEPTED'
  | 'OBSERVED'
  | 'OUTCOME_UNKNOWN'
  | 'REJECTED'
  | 'AMBIGUOUS_EFFECT';

export type ProvisionalMessage = {
  commandId: string;
  family: 'native.submit' | 'native.steer';
  text: string;
  state: PresentationCommandState;
  createdAt: number;
};

export function createProvisional(commandId: string, family: 'native.submit' | 'native.steer', text: string, now = Date.now()): ProvisionalMessage {
  return { commandId, family, text, state: 'LOCAL_PENDING', createdAt: now };
}

export function advancePresentation(
  current: PresentationCommandState,
  receipt: { status: 'SUCCEEDED' | 'REJECTED' | 'AMBIGUOUS_EFFECT' } | null,
  observedInHistory: boolean,
): PresentationCommandState {
  if (receipt?.status === 'REJECTED') return 'REJECTED';
  if (receipt?.status === 'AMBIGUOUS_EFFECT') return 'AMBIGUOUS_EFFECT';
  if (receipt?.status === 'SUCCEEDED' && observedInHistory) return 'OBSERVED';
  if (receipt?.status === 'SUCCEEDED') return 'NATIVE_ACCEPTED';
  if (current === 'OUTCOME_UNKNOWN') return 'OUTCOME_UNKNOWN';
  return current;
}

export function markOutcomeUnknown(current: PresentationCommandState): PresentationCommandState {
  if (current === 'OBSERVED' || current === 'REJECTED') return current;
  return 'OUTCOME_UNKNOWN';
}

export function shouldClearComposer(state: PresentationCommandState): boolean {
  return state === 'NATIVE_ACCEPTED' || state === 'OBSERVED';
}

export function correlateProvisional(
  provisional: ProvisionalMessage | null,
  history: { role: string; text: string; source?: { kind?: string; clientInstanceId?: string } }[],
  clientInstanceId: string,
): boolean {
  if (!provisional) return false;
  return history.some(message => message.role === 'user' && message.text === provisional.text
    && message.source?.kind === 'FLEETSPLICE_WEB' && message.source.clientInstanceId === clientInstanceId);
}
