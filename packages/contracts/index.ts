import Ajv2020 from 'ajv/dist/2020.js';
import { Fault } from './json.ts';
export * from './json.ts';

export type Target = {
  authorityId: string; hubRuntimeId: string; edgeRuntimeId: string; connectionId: string;
  hubRecoveryGeneration: string; edgeRecoveryGeneration: string;
  hostId: string; hostGeneration: string; environmentId: string; environmentGeneration: string;
  workspaceId: string; workspaceGeneration: string; rootIdentity: string;
  agentBindingId: string; executionBindingId: string; providerBindingId: string;
};
export type Fence = { epoch: string; revision: string; controller: string | null };
export type NativeReasoningOption = { reasoningEffort: string; description: string };
export type NativeModelCapability = { id: string; displayName: string; isDefault: boolean; supportedReasoningEfforts: NativeReasoningOption[]; defaultReasoningEffort: string };
// This is a projection of a qualified app-server `model/list` response. It is
// never a FleetSplice-maintained model table.
export type NativeCapabilityCatalog = { models: NativeModelCapability[] };
export type NativeSessionConfiguration = { requestedModel: string; requestedReasoningEffort: string; effectiveModel: string; effectiveReasoningEffort: string };
export type Intent = {
  v: 1; actorId: string; clientInstanceId: string; grantId: string; grantRevision: string;
  target: Target; laneId: string | null; expected: Fence | null;
} & (
  { family: 'workspace.register'; body: { root: string } } |
  { family: 'logicalSession.create'; body: { title: string } } |
  { family: 'native.capabilities.read' | 'sessionLane.acquireControl' | 'sessionLane.releaseControl'; body: Record<string, never> } |
  { family: 'sessionLane.continue'; body: { model: string; reasoningEffort: string } } |
  { family: 'turn.submit'; body: { text: string } }
);
export type FleetCommand = { commandId: string; idempotencyKey: string; intentDigest: string; intent: Intent };
export type Decision = { decisionId: string; actorId: string; clientInstanceId: string; grantId: string; grantRevision: string; expiresAt: number; ceiling: 'windows-user.read-only' };
export type Plan = { v: 1; planId: string; commandId: string; intentDigest: string; target: Target; decision: Decision; sessionId: string | null; laneId: string | null; segmentId: string | null; before: Fence | null; after: Fence | null; steps: { edgeCommandId: string; operation: Intent['family']; dependsOn: string[] }[] };
export type EdgeCommand = { v: 1; edgeCommandId: string; stepDigest: string; planDigest: string; plan: Plan; command: FleetCommand };
export type Receipt = { edgeCommandId: string; status: 'SUCCEEDED' | 'REJECTED' | 'AMBIGUOUS_EFFECT' | 'DISPATCHED'; code: string; nativeThreadId: string | null; nativeTurnId: string | null; nativeRequestId: string | null; nativeProcessId: number | null; nativeInstanceId: string | null; nativeCapabilities: NativeCapabilityCatalog | null; nativeConfiguration: NativeSessionConfiguration | null };
export type NativeEvent = { laneId: string; edgeCommandId: string; kind: 'delta' | 'turnStarted' | 'turnCompleted' | 'blocked' | 'tool' | 'configurationInvalidated'; text: string; threadId: string | null; turnId: string | null; status: string };
export type Hcp = { v: 1; connectionId: string; target: Target } & (
  { kind: 'hello'; identity: { principal: string; sid: string; sessionId: number; elevated: false; root: string; rootIdentity: string }; recovered: boolean } |
  { kind: 'ready'; recoveryRequired: boolean } |
  { kind: 'command'; command: EdgeCommand } |
  { kind: 'receipt'; receipt: Receipt } |
  { kind: 'event'; event: NativeEvent } |
  { kind: 'closed'; reason: string }
);
export type Lane = { sessionId: string; laneId: string; segmentId: string; title: string; fence: Fence; state: string; nativeThreadId: string | null; nativeTurnId: string | null; requestedModel: string | null; requestedReasoningEffort: string | null; effectiveModel: string | null; effectiveReasoningEffort: string | null; activity: { text: string; status: string }[]; transcript: { role: 'user' | 'assistant' | 'system'; text: string }[] };
export type CommandRecord = { command: FleetCommand; plan: Plan; status: string; receipt: Receipt | null };
export type Snapshot = { status: string; target: Target; root: string; registered: boolean; capabilities: NativeCapabilityCatalog | null; lanes: Lane[]; commands: CommandRecord[]; cursor: string };

const uuid = { type: 'string', pattern: '^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' };
const rev = { type: 'string', pattern: '^(0|[1-9][0-9]{0,19})$' };
const hash = { type: 'string', pattern: '^[0-9a-f]{64}$' };
const str = (maxLength = 1024) => ({ type: 'string', maxLength });
const nullable = (schema: object) => ({ anyOf: [schema, { type: 'null' }] });
const arr = (items: object, maxItems = 64) => ({ type: 'array', items, maxItems });
const obj = (properties: Record<string, object>) => ({ type: 'object', properties, required: Object.keys(properties), additionalProperties: false });
const literal = (value: string | number | boolean) => ({ const: value });
const target = obj({ authorityId: uuid, hubRuntimeId: uuid, edgeRuntimeId: uuid, connectionId: uuid, hubRecoveryGeneration: rev, edgeRecoveryGeneration: rev, hostId: uuid, hostGeneration: rev, environmentId: uuid, environmentGeneration: rev, workspaceId: uuid, workspaceGeneration: rev, rootIdentity: hash, agentBindingId: uuid, executionBindingId: uuid, providerBindingId: uuid });
const fence = obj({ epoch: rev, revision: rev, controller: nullable(uuid) });
const reasoningOption = obj({ reasoningEffort: { type: 'string', minLength: 1, maxLength: 64 }, description: str(500) });
const modelCapability = obj({ id: { type: 'string', minLength: 1, maxLength: 200 }, displayName: { type: 'string', minLength: 1, maxLength: 300 }, isDefault: { type: 'boolean' }, supportedReasoningEfforts: arr(reasoningOption, 32), defaultReasoningEffort: { type: 'string', minLength: 1, maxLength: 64 } });
const capabilityCatalog = obj({ models: arr(modelCapability, 128) });
const nativeConfiguration = obj({ requestedModel: { type: 'string', minLength: 1, maxLength: 200 }, requestedReasoningEffort: { type: 'string', minLength: 1, maxLength: 64 }, effectiveModel: { type: 'string', minLength: 1, maxLength: 200 }, effectiveReasoningEffort: { type: 'string', minLength: 1, maxLength: 64 } });
const families = ['workspace.register', 'logicalSession.create', 'native.capabilities.read', 'sessionLane.acquireControl', 'sessionLane.releaseControl', 'sessionLane.continue', 'turn.submit'] as const;
const intentBase = { v: literal(1), actorId: uuid, clientInstanceId: uuid, grantId: uuid, grantRevision: rev, target, laneId: nullable(uuid), expected: nullable(fence) };
const intent = { oneOf: families.map(family => obj({ ...intentBase, family: literal(family), body: family === 'workspace.register' ? obj({ root: str() }) : family === 'logicalSession.create' ? obj({ title: { type: 'string', minLength: 1, maxLength: 80 } }) : family === 'sessionLane.continue' ? obj({ model: { type: 'string', minLength: 1, maxLength: 200 }, reasoningEffort: { type: 'string', minLength: 1, maxLength: 64 } }) : family === 'turn.submit' ? obj({ text: { type: 'string', minLength: 1, maxLength: 16000 } }) : obj({}) })) };
const command = obj({ commandId: uuid, idempotencyKey: uuid, intentDigest: hash, intent });
const decision = obj({ decisionId: uuid, actorId: uuid, clientInstanceId: uuid, grantId: uuid, grantRevision: rev, expiresAt: { type: 'integer', minimum: 1, maximum: Number.MAX_SAFE_INTEGER }, ceiling: literal('windows-user.read-only') });
const plan = obj({ v: literal(1), planId: uuid, commandId: uuid, intentDigest: hash, target, decision, sessionId: nullable(uuid), laneId: nullable(uuid), segmentId: nullable(uuid), before: nullable(fence), after: nullable(fence), steps: arr(obj({ edgeCommandId: uuid, operation: { enum: families }, dependsOn: arr(uuid, 0) }), 1) });
const edgeCommand = obj({ v: literal(1), edgeCommandId: uuid, stepDigest: hash, planDigest: hash, plan, command });
const receipt = obj({ edgeCommandId: uuid, status: { enum: ['SUCCEEDED', 'REJECTED', 'AMBIGUOUS_EFFECT', 'DISPATCHED'] }, code: str(120), nativeThreadId: nullable(str(200)), nativeTurnId: nullable(str(200)), nativeRequestId: nullable(uuid), nativeProcessId: nullable({ type: 'integer', minimum: 1 }), nativeInstanceId: nullable(uuid), nativeCapabilities: nullable(capabilityCatalog), nativeConfiguration: nullable(nativeConfiguration) });
const event = obj({ laneId: uuid, edgeCommandId: uuid, kind: { enum: ['delta', 'turnStarted', 'turnCompleted', 'blocked', 'tool', 'configurationInvalidated'] }, text: str(24000), threadId: nullable(str(200)), turnId: nullable(str(200)), status: str(120) });
const hcpBase = { v: literal(1), connectionId: uuid, target };
const hcp = { oneOf: [
  obj({ ...hcpBase, kind: literal('hello'), identity: obj({ principal: str(), sid: str(), sessionId: { type: 'integer', minimum: 1 }, elevated: literal(false), root: str(), rootIdentity: hash }), recovered: { type: 'boolean' } }),
  obj({ ...hcpBase, kind: literal('ready'), recoveryRequired: { type: 'boolean' } }),
  obj({ ...hcpBase, kind: literal('command'), command: edgeCommand }),
  obj({ ...hcpBase, kind: literal('receipt'), receipt }),
  obj({ ...hcpBase, kind: literal('event'), event }),
  obj({ ...hcpBase, kind: literal('closed'), reason: str(120) })
] };
export const schemas = { command, plan, edgeCommand, hcp };
const ajv = new Ajv2020.default({ strict: true, allErrors: false });
const validators = Object.fromEntries(Object.entries(schemas).map(([key, value]) => [key, ajv.compile({ $schema: 'https://json-schema.org/draft/2020-12/schema', ...value })]));
export function validate<T>(kind: keyof typeof schemas, value: unknown): T {
  if (!validators[kind]!(value)) throw new Fault('SCHEMA_INVALID');
  return value as T;
}
