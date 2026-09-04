# FleetCommand to EdgeCommand and HCP

## Decision

**RECOMMENDATION — `READY_FOR_0_1`:** use three identities and never collapse them:

```text
FleetCommand
  external actor -> Hub typed semantic intent
        |
        v
ResolvedExecutionPlan
  immutable Hub resolution record
        |
        v
EdgeCommand
  Hub -> exact Edge/Environment effect request over HCP
```

`ResolvedExecutionPlan` is an internal artifact, not another northbound mutation API. `FleetCommand` does not expose native protocol calls or require the client to know current process identity. `EdgeCommand` never contains unresolved intent such as “continue whichever session is current.” Wave-01's exact host/environment/generation command envelope is therefore refined as `EdgeCommand`, not reused as the public `FleetCommand`.

## Authority split during translation

| Decision or fact | Hub responsibility | Edge responsibility |
| --- | --- | --- |
| LogicalSession and SessionLane | resolve Fleet identity and semantic target | never substitute another identity |
| writer control | validate actor/grant and expected writer epoch | enforce the authorization snapshot and local ceiling |
| current NativeSegment | select exact segment and binding generation | reconcile the named native/process identity |
| Host and Environment | select explicit enrolled binding | verify live generations and effective principal |
| Workspace/Worktree | select registered identity and preconditions | resolve canonical local path and reject escape/drift |
| driver | select qualified installation record | recheck artifact and compatibility generation |
| provider/model | select explicit qualified binding | resolve local credential/config reference and report effective binding |
| native call | select typed adapter operation | translate to exact Codex, ACP, or other driver method |
| effect truth | retain a time-qualified projection | journal and authoritatively observe local effect |

This preserves the Wave-01 rule: the Hub owns intent and logical state; the Environment-local Edge owns filesystem, process, credential, and native effect truth.

## ResolvedExecutionPlan

The Hub persists the plan before dispatch. Its minimum semantic content is:

```text
resolutionId + resolutionRevision
fleetCommandId + fleetCommandIntentDigest
resolvedAt
sourceProjectionRevision + observedAt + confidence
authorityGrantRef + evaluatedGrantRevision + evaluatedGrantDigest

logicalSessionId
laneId + expectedLaneMutationRevision + expectedWriterEpoch
nativeSegmentId + expectedSegmentGeneration

executionBinding:
  hostId + expectedHostGeneration
  environmentId + expectedEnvironmentGeneration
  workspaceId + expectedWorkspaceGeneration
  optional worktreeBindingId + expectedBindingGeneration
  nativeSessionId / managedProcessIdentity when continuing

driverBinding:
  driverId + driverBuildDigest
  driverInstallationId + expectedInstallationGeneration
  compatibilityRecordId + expectedCompatibilityRevision
  requiredCapabilitySetDigest

providerBinding:
  providerProfileId + expectedProviderBindingGeneration
  effective model/reasoning/config constraints
  CredentialRef identity only, never credential material

steps[]:
  stepKey + edgeCommandId
  target Edge
  typed Edge operation + canonical payload digest
  expected local generations
  dependency stepKeys
  required | optional
```

Every EdgeCommand carries `parentFleetCommandId`, `resolutionId`, `resolutionRevision`, and `stepKey`. A Fleet command ID cannot double as an Edge command ID because a typed command may have more than one explicit effect step.

## Automatic resolution

The Hub may resolve automatically only when it follows a unique binding already selected by user intent and policy. It does not perform opportunistic scheduling.

| Condition | Result |
| --- | --- |
| exact lane, one current segment, current generations, qualified driver/provider | resolve automatically |
| one writable lane and the command schema explicitly permits default-lane selection | resolve and record the deterministic rule |
| multiple lanes or current segments | `NEEDS_INPUT_NO_EFFECT` |
| exact active turn/command interrupt target but stale projection | dispatch to that target only; Edge reconciles and cannot retarget |
| create/continue against stale or `UNKNOWN` placement | wait for fresh evidence or return `NEEDS_INPUT_NO_EFFECT` |
| native segment proven gone and native continuity requested | `TARGET_LOST_NO_EFFECT` |
| reconstructed continuation explicitly names target and checkpoint | resolve after capability-gap admission |
| Host/Environment/Workspace generation changed | reject stale; do not refresh into the replacement identity |
| provider/model would change outside the command's explicit migration intent | require a new migration command |
| compatibility unknown, expired, or missing required capabilities | block the affected command family |
| external native writer detected | enter contested control; require reconciliation/takeover |

Missing input cannot be inserted into an accepted command because it changes the intent digest. Return a no-effect outcome and accept a new command containing the user's choice.

## Fences at both authorities

Hub admission validates Fleet-owned preconditions:

- LogicalSession and lane identity/revision;
- writer epoch and expected active turn;
- current NativeSegment/binding generation;
- authority-grant revision, scope, expiry, and revocation state.

Edge admission validates local preconditions immediately before journaling admission:

- Host enrollment and Environment generation;
- Workspace/Worktree binding and canonical path;
- managed process/native resource identity;
- driver installation and compatibility-record generation;
- locally controlled provider binding and effective profile.

A changed driver digest or provider binding fences queued work just as Host reenrollment does. Hub validation is necessary but never substitutes for Edge revalidation.

## Retry and re-resolution

| Situation | Rule |
| --- | --- |
| transport redelivery | same EdgeCommand ID, digest, plan revision, and generations; Edge journal returns the existing result |
| observation refresh before any step is admitted | refresh timestamps/evidence only when every identity and generation is unchanged |
| changed identity, generation, placement, continuity mode, or semantic payload | require a new FleetCommand |
| any possibly started effect | freeze the plan and reconcile; never place the same command elsewhere |

A retry must not transform “continue lane X on Host A” into “create a replacement on Host B.” `dispatchAttempt` may increase for telemetry, but the semantic EdgeCommand identity does not.

## Disappearance and ambiguity

| Last established boundary | Required outcome |
| --- | --- |
| target absence proven before Edge admission | `STALE_TARGET_NO_EFFECT` |
| Edge rejects a generation before admission | immutable rejection with current sanitized generation evidence |
| Edge admitted but no effect-start record exists | reconcile journal and named native/process identities |
| native request might have crossed an unidentifiable boundary | `AMBIGUOUS_EFFECT` |
| started process/native session is proven lost | `LOST`; never silently recreate |
| Edge is unreachable | projection `STALE` or `UNKNOWN`; never duplicate placement |

Generation fences prevent new stale effects; they do not undo an effect already issued.

## Multiple EdgeCommands

One FleetCommand may produce a finite, schema-declared step graph only when that graph is part of the typed family semantics. Valid v0.x candidates are:

- confirmed migration: reconcile/checkpoint source, prepare exact target, then create or resume target;
- cancellation of an explicitly captured set of child lanes;
- creation whose schema explicitly includes deterministic named preparation.

Ordinary `continue`, `turn.submit`, `turn.steer`, and `turn.interrupt` do not fan out. Composite rules are:

1. freeze the complete target/step identities before the first dispatch;
2. give each step its own idempotency row and receipt;
3. claim no cross-Edge transaction or atomic rollback;
4. require every required step for aggregate success;
5. report mixed results as `PARTIAL_EFFECT` or `AMBIGUOUS_EFFECT`;
6. prohibit wildcard expansion after dispatch.

## Follow-up and compensation

Deterministic follow-up steps may be declared in a command family. A semantically new compensation is a new FleetCommand with new authority evaluation, deadline, digest, and ID, linked by `causationId` and `compensatesCommandId`. Cancellation is not compensation, and neither is rollback. Never automatically compensate an ambiguous native turn or tool effect.

The terminal Fleet receipt contains an ordered immutable manifest of Edge receipt digests, native effect identities, ambiguity flags, and required/optional step outcomes. Current resource state is a projection and cannot rewrite that receipt.

## Mapping lifecycle

```text
ACCEPTED
  -> RESOLUTION_PENDING
     -> NEEDS_INPUT_NO_EFFECT (terminal)
     -> RESOLVED
        -> EDGE_DISPATCHED
           -> EDGE_ADMITTED
              -> EDGE_EFFECT_STARTED
                 -> NATIVE_OPERATION_STARTED
                    -> EFFECT_TERMINAL
                    -> AMBIGUOUS_EFFECT
              -> EDGE_REJECTED_NO_EFFECT
        -> STALE_RESOLUTION_NO_EFFECT
```

Hub acceptance is not Edge admission. Edge admission is not effect start. Effect start is not native-operation start. None alone implies command, turn, lane, or session terminality.

## Evidence and remaining implementation work

The semantics follow [Wave-01 HCP effect classes](../wave-01/host-control-protocol.md), [the authority split](../wave-01/requirements-first-principles.md), and [NativeSegment binding epochs](../wave-01/logical-session-history.md). Exact HCP transport/framing and the minimal list of composite families remain implementation design; they do not block an Architecture 0.1 draft.
