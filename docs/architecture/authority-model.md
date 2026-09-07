# Authority Model

Current normative authority is the
[G04A amendment](amendments/g04a-visible-mvp-simplification.md), layered on the
literal accepted G03 baseline. [Current status](../train/G04A-status.md)
governs formal acceptance; product work remains unstarted.

## Sole authorities

| Fact | Owner |
| --- | --- |
| Fleet/actor/Host enrollment/Environment catalog, grant and controller policy | Single active Hub. |
| Accepted FleetCommand, immutable ResolvedExecutionPlan, logical history and receipts | Hub durable admission/history journal. |
| Workspace resolved-root generation/containment, current process/native truth, exact EdgeCommand/effect journal | Target per-user Edge. |
| Native session/context and actual effect result | Native Agent, observed and reconciled by its Edge. |
| Provider credential resolution | Exact target Environment; no credential copying. |
| Rendering and cache | Browser has no durable Fleet authority. |
| Release/upgrade activation | Owner or separately accepted external authority; candidate never self-activates. |

## First effect

One typed FleetCommand becomes one distinct immutable plan and exact
EdgeCommand steps. Hub journals before dispatch; Edge flushes a durable attempt
before native write/spawn. IDs/digests, idempotency aliases, conflict tombstones,
native identity, exact targets, authority incarnation/generations and runtime/
controller fences are mandatory from G05. No raw-native or observation mutation.

At most one controller per SessionLane. Hub serializes epoch/mutation CAS;
Edge journals new fences before a new controller can effect. Takeover stays
pending while Edge is unavailable and never implicitly interrupts. Running or
ambiguous old work blocks conflicts even after a control generation changes.

The Edge rechecks local principal, non-elevated windows-user token/session,
Workspace containment, grant ceiling, exact native target and current Hub
connection. A local native writer outside Fleet makes the lane contested.
No new native dispatch occurs while disconnected; already-started work may
continue under its original policy. A remote revocation is not effective at
an unseen Edge merely because the Hub recorded it.

## Recovery and exact control

Every server/runtime start is closed to new effects. Uncertain or restored
authority gets a fresh incomparable incarnation, rejects old decisions and
reconciles Hub/Edge/native evidence. Neither a new counter/ID nor timeout proves
predecessor termination. Missing effect evidence stays AMBIGUOUS_EFFECT with
conflicting scope blocked until explicit evidence-backed recovery.

Allow Once / Deny and exact turn interrupt arrive G06 through the same journaled
path. One dispatch owner and immutable attempt marker prevent re-emission.
Unknown delivery and target turn terminality are separate facts; approval never
creates privilege or retargets. Old SafetyControl/D/O/R protocols are superseded.

## Deferred machinery

External AuthorityAnchor ordering, participant pins, renewable DispatchPermit,
transitive external barriers, trusted-time predecessor drain and seamless
rollback authority are not v0.1 requirements. Their historical specification
is preserved in G03. No current reference to it creates an online prerequisite.
The amendment's fail-closed safety properties are mandatory and independently
reviewed; no compromised-admin/kernel or invisible whole-memory restoration
detection is claimed.

Provider migration remains explicit and qualified; a new segment or Owner
confirmation cannot substitute for source quiescence and reconciliation.
Desired and observed state stay separate: STALE/UNKNOWN never means stopped.
