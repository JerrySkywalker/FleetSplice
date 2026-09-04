# Multi-client and writer authority

## Decision

**RECOMMENDATION — `READY_FOR_0_1`:** a LogicalSession may have concurrent lanes, but each `SessionLane` has at most one northbound causal controller at a time and any number of authorized observers. Control is lane-scoped and monotonically epoch-fenced. It is neither a Coordination Loop lease nor a repository-wide lock.

## Invariants

1. A controller is the pair `(actorId, clientInstanceId)`, distinguishing one tab, phone session, CLI process, or automation installation from another even when the actor is the same.
2. `AuthorityGrant` answers what an actor may do; `LaneControl` answers which already-authorized client orders causal lane mutations now.
3. One regular client-authored native turn may be active per lane in v0.x.
4. Approval resolution and exact safety interrupt/cancel are separately authorized exceptions to controller ownership.
5. Takeover fences future work but never cancels, rolls back, or proves termination of admitted work.
6. Session lanes do not lock files. One independently write-capable active lane per exact WorktreeBinding is the safe v0.x default; independent work uses separate worktrees.
7. Native input without a causal EdgeCommand is external evidence, never retroactively an authorized FleetCommand.

## LaneControl

```text
laneId
controlEpoch                 monotonically increasing; never reused
laneMutationRevision         increases only on admitted causal mutations
state
holderActorId?
holderClientInstanceId?
holderKind?                  human | automation
acquiredAt?
reconnectUntil?
lastClientSeenAt?
automationGate               enabled | paused_by_human
edgeFenceState               not_required | pending | acknowledged
lastTransitionReason
```

Token deltas, presence, event ingestion, and ordinary projection refreshes do not change `laneMutationRevision`. That revision is a narrow compare-and-swap value, while event cursors and observation revisions remain separate.

## Control state machine

```text
UNCONTROLLED
  -- acquire/CAS --> CONTROLLED

CONTROLLED
  -- same client reconnects/renews --> CONTROLLED, same epoch
  -- connection lost --> RECONNECT_GRACE, same epoch
  -- release --> UNCONTROLLED, epoch++
  -- authorized takeover --> CONTROLLED(new holder), epoch++
  -- external native writer --> EXTERNAL_CONTROL_DETECTED, epoch++
  -- archive/suspend --> SUSPENDED, epoch++

RECONNECT_GRACE
  -- same client proves session before deadline --> CONTROLLED, same epoch
  -- grace ends --> ORPHANED, epoch++
  -- authorized takeover --> CONTROLLED(new holder), epoch++

ORPHANED
  -- explicit acquire after reconciliation --> CONTROLLED, epoch++

EXTERNAL_CONTROL_DETECTED
  -- adopt reviewed suffix --> UNCONTROLLED, epoch++
  -- fork from last trusted boundary --> child lane
  -- prove exclusive native reattachment --> UNCONTROLLED, epoch++
```

The reconnect grace is a short Hub client-presence policy, not a distributed lease: it owns no repository claim, scheduling authority, or native process truth. Disconnect never implies release or interruption. Active native work continues and the projection records lost controller presence.

## Optimistic admission and Edge fence

Every causal FleetCommand includes:

```text
laneId
expectedControlEpoch
expectedLaneMutationRevision
exact activeTurnId / approvalId / segmentId where applicable
```

The Hub transactionally validates and increments the mutation revision. Stale input returns `STALE_LANE_REVISION` or `CONTROL_EPOCH_MISMATCH` with no Edge effect.

Derived EdgeCommands also carry the control epoch. Edge journals the highest fenced epoch and rejects lower values. A takeover is only centrally complete after Hub persistence; it is safe for new local effects only after the target Edge acknowledges the new fence. If Edge is unreachable and old work may start or run, show `TAKEOVER_PENDING_RECONCILIATION` rather than claiming exclusive native control.

## Controller requirements by command

| Mutation | Controller required | Extra rule |
| --- | --- | --- |
| continue/fork lane, submit, steer, migrate | yes | exact epoch and mutation revision |
| acquire/release/takeover | specialized CAS | takeover grant action required |
| interrupt/cancel exact effect | no if separately authorized | exact identity/generation; no rollback claim |
| resolve approval | no if separately authorized | exact approval revision/action digest |
| Fleet-only checkpoint | policy may permit an observer | cannot start a native effect |
| read/query/subscribe | no | observation grant only |

## Client cases

| Case | v0.x behavior |
| --- | --- |
| two browser tabs | first controlling tab remains controller; second is observer until explicit takeover |
| desktop and phone | separate instances of one actor; phone may resolve approvals with its grant without controlling prompts |
| CLI and WebUI | equal ordinary clients; no interface gets hidden priority |
| human and automation | authorized human takeover raises epoch and pauses automation; active native work continues until separately interrupted |
| two automation clients | first compare-and-swap wins; other receives conflict and cannot steal by default |
| controller disconnects | active work continues; same client may reclaim during grace, otherwise reconciliation plus acquire/takeover |
| controller vanishes during approval | approval remains pending; any separately authorized approver may resolve it |

The holder identity and takeover consequence must be visible before a client sends a control-changing command.

## Human override and automation pause

Human takeover performs one typed transition:

1. increment control epoch;
2. bind the human client instance;
3. set `automationGate=paused_by_human`;
4. invalidate older controller capabilities;
5. expose in-flight effects and unresolved approvals;
6. await the Edge fence before admitting a conflicting effect;
7. do not implicitly interrupt.

Automation resumes only through `sessionLane.setAutomation/v1` or an owner-selected bounded policy. It cannot reacquire immediately after a human override. “Human” is an actor/grant property, not inferred from the WebUI transport.

## Race rules

### Submit versus submit

First Hub CAS admission increments `laneMutationRevision`; the second receives `STALE_LANE_REVISION`. It is not silently queued.

### Submit versus steer

`turn.submit` requires no active regular turn. `turn.steer` requires the exact active turn ID. A native implementation that treats start-on-active as steer is never exposed as Fleet semantics. If state cannot be reconciled around a response loss, the command becomes ambiguous rather than retried under the other operation.

### Steer versus interrupt

Hub serializes admissions for the lane. If steer admits first it may reach native execution before interrupt. If interrupt admits first the lane enters `INTERRUPT_REQUESTED` and new steering rejects pending observation. Neither receipt claims to undo the other.

### Conflicting approval decisions

First valid approval compare-and-swap wins. Exact duplicate returns its receipt. A different later decision returns `APPROVAL_ALREADY_RESOLVED` with safe winning-decision metadata.

## External native writer detection

When Edge sees a native turn/item/session mutation without a matching admitted EdgeCommand it:

- emits `EXTERNAL_NATIVE_CONTROL_DETECTED` with exact native evidence;
- marks the lane `CONTROL_CONTESTED`/degraded;
- rejects new causal Fleet mutations except observation, exact safety interruption, and reconciliation;
- offers reviewed adoption of the external suffix, a fork from the last trusted boundary, or proof of exclusive reattachment.

Unexpected workspace/Git changes are instead `WORKSPACE_DRIFT_DETECTED` and require workspace readmission. Fleet cannot guarantee detection of arbitrary editor/filesystem writers, and neither condition authorizes automatic process termination.

## Subagents and parallel work

- A durable, independently addressable native child becomes a child SessionLane with its own control epoch.
- A provider-owned child that rejects direct mutation remains a child span/event under its parent.
- Opaque activity is never promoted to a fictitious Fleet identity.
- Native-managed subagent concurrency inside one parent turn remains under that turn's authority.
- Independently writable child lanes use separate WorktreeBindings by default.

## Policy defaults still for owner review

The state model is closed. A later baseline or product settings design should select:

- bootstrap/recovery authentication for local owner versus remote phone access;
- whether phone clients see native sensitive approval detail or a normalized/redacted class;
- reconnect grace duration (recommended: short and configurable; no automation auto-reclaim after human override);
- whether persistent native approval options appear in v0.x (recommended: deny/allow-once only until exact-driver conformance).

These are policy defaults, not architecture-invalidating gaps. Hub CAS, Edge epoch ordering, external-writer detection, ACP shared-session behavior, revocation delivery, and admin-companion fencing remain targeted implementation/conformance tests.

## Evidence

Wave 01 defines lanes as causal/sequential authority units while explicitly saying the graph is not a worktree lock in [logical session and history](../wave-01/logical-session-history.md). It records Codex start/steer races in [Codex app-server](../wave-01/codex-app-server.md). Conditional lost-update prevention in [RFC 9110](https://www.rfc-editor.org/rfc/rfc9110.html) and resource-version conflict/reconnect patterns in [Kubernetes API concepts](https://kubernetes.io/docs/reference/using-api/api-concepts/) support the narrow compare-and-swap pattern without importing their wider machinery.
