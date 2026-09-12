// Deliberately Codex-specific. Artifact metadata never selects compatibility.
export type AgentOrigin = 'NATIVE_ADOPTED' | 'FLEETSPLICE_MANAGED';
export type NativeArtifactIdentity = {
  executablePath: string | null; reportedVersion: string | null; sha256: string | null;
  processId: number; processCreationTime: string; endpoint: string;
  endpointIdentity: string; serverIncarnation: string | null;
};
export type Capability = { available: boolean; evidence: string };
export type MessageSource =
  | { kind: 'FLEETSPLICE_WEB'; clientInstanceId: string; clientDisplayLabel?: string; deviceLabel?: string }
  | { kind: 'NATIVE_EXTERNAL' };
export type NativeTurn = {
  id: string; state: 'RUNNING' | 'COMPLETED' | 'INTERRUPTED' | 'FAILED';
  /** Native Unix seconds; null means unavailable, never a local observation time. */
  startedAt: number | null; completedAt: number | null; durationMs: number | null;
};
export type CapabilityName = 'sharedDaemon' | 'threadList' | 'threadRead' | 'resume' |
  'events' | 'turnStart' | 'activeTurn' | 'interrupt' | 'steer' | 'approvalObserve' |
  'approvalResolve' | 'models' | 'effectiveState';
export type Compatibility = {
  profile: 'ADOPT_FULL' | 'ADOPT_RESUME' | 'MANAGED_ONLY' | 'UNSUPPORTED';
  observedAt: string; capabilities: Record<CapabilityName, Capability>;
};
export type NativeThread = {
  id: string; workspace: string; workspaceIdentity: string; origin: 'NATIVE_ADOPTED';
  status: string; activeTurnId: string | null; lastTurnStatus: string | null; model: string | null; permission: string | null;
  attached: boolean; stateToken: string; externalAdvance: boolean;
  history: { role: 'user' | 'assistant'; text: string; turnId: string; source?: MessageSource }[];
  turns: NativeTurn[];
  activity: { id: string; turnId: string; text: string; status: string }[];
  historyLimited: boolean; residualCommandState: 'NONE_OBSERVED' | 'MAY_STILL_BE_RUNNING' | 'OBSERVED_DRAINED';
};
export type AdoptionCommand = {
  commandId: string; runtimeId: string; clientInstanceId: string; expectedFence: number;
  incarnation: string; threadId: string; stateToken: string; activeTurnId: string | null;
  family: 'native.attach' | 'native.reviewState' | 'native.release' | 'native.submit' | 'native.steer' | 'native.interrupt';
  text: string;
  clientDisplayLabel?: string; deviceLabel?: string;
};
export type AdoptionReceipt = {
  commandId: string; family: AdoptionCommand['family']; status: 'SUCCEEDED' | 'REJECTED' | 'AMBIGUOUS_EFFECT';
  code: string; daemon: NativeArtifactIdentity; threadId: string; turnId: string | null;
  origin: 'NATIVE_ADOPTED'; createdNativeThread: false; processTerminationClaim: false;
};
export type AdoptionSnapshot = {
  runtimeId: string; state: string; incarnation: string; daemon: NativeArtifactIdentity;
  compatibility: Compatibility; workspace: string; controller: string | null; fence: number;
  threads: NativeThread[]; receipts: AdoptionReceipt[]; controlMode: 'COOPERATIVE';
  observationFailure: {
    observedAt: string; phase: string; code: string; errorClass: string;
    nativeCode: number | null; reason: string; errorFingerprint: string;
    incarnation: string; threadId: string | null;
  } | null;
};
export type AdoptionPort = {
  snapshot(): Promise<AdoptionSnapshot>;
  execute(command: unknown, clientInstanceId: string, expiresAt: number): Promise<AdoptionReceipt>;
  lookup(commandId: string): Promise<AdoptionReceipt | null>;
};
