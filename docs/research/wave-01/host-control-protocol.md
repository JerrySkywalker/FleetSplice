# Host Control Protocol

## Scope

The Host Control Protocol (HCP) is the fleet-to-host control and observation contract. It is deliberately independent of Codex app-server, ACP, SSH, terminal streams, and inference APIs. Those terminate behind the Edge Runtime.

**FACT:** controller systems such as Kubernetes distinguish desired state from observed state and attach versions to resources and watches. Nomad's disconnected-client semantics explicitly model an unknown period and the split-brain risk of replacing work whose former instance may still run. These are useful failure lessons, not a reason to import either product's scope.

**INTERPRETATION:** FleetSplice needs reconciliation vocabulary but not quorum, leader election, a general scheduler, or a cluster object model.

## Authority invariant

**RECOMMENDATION:** the Hub may command an admitted intent; only the Edge may assert the local effect it observed. The Hub's last event is a projection with age and confidence, not process truth. The Edge cannot grant itself new user authority merely because it can perform an OS action.

## Candidate command envelope

```text
protocolVersion
commandId                  globally unique receipt identity
correlationId / causationId
actor + authorizationGrantRef
hostId + expectedHostGeneration
environmentId + expectedEnvironmentGeneration
targetKind + targetId + expectedTargetGeneration
operation + canonicalPayload + payloadDigest
idempotencyScope + idempotencyKey
issuedAt + deadline
cancellationTarget         when operation is cancel
```

**RECOMMENDATION:** an Edge admits a command only after authenticating the Hub connection, verifying the actor grant and local Environment policy, checking deadline and every expected generation, resolving the target, and consulting its journal. An unknown field or unsupported operation fails closed under a negotiated schema version.

### Idempotency record

An idempotency record must bind scope, key, canonical operation, payload digest, target generation, admission result, effect identity where one exists, terminal result, and retained receipt. Reuse of the same key with a different digest is a conflict, never a new command.

On duplicate delivery:

- a rejected command returns the same rejection class;
- an admitted in-progress command returns its current receipt and effect identity;
- a completed command returns the stored terminal receipt;
- a journal record without a reconcilable effect becomes `AMBIGUOUS`, not silently retried.

## Effect classes and the “effectively once” hypothesis

**FACT:** a local transaction cannot generally atomically commit both a database journal row and an arbitrary external OS or agent effect. A crash may occur before the effect, after the effect but before the receipt, or during an effect that has no queryable identity.

**INTERPRETATION:** the formula

```text
at-least-once transport + idempotent/generation-bound commands
    = effectively-once effects
```

is too broad.

**RECOMMENDATION:** classify operations:

| Effect class | Example | Retry semantics |
| --- | --- | --- |
| journal-only | record desired session label | transactionally once |
| named and discoverable | launch with Fleet nonce; create worktree with reserved identity | reconcile, then effectively once within the identity scope |
| native idempotent | protocol method documents an idempotency token | rely only after versioned conformance evidence |
| queryable but non-idempotent | native turn with a stable returned ID | ambiguous until query/reconciliation establishes outcome |
| opaque/non-transactional | arbitrary shell/tool/filesystem side effect | at least once or unknown; no effectively-once promise |

Commands that cross an opaque boundary must surface `AMBIGUOUS_EFFECT` and require an operation-specific reconciler or a human decision. Generation checks fence stale targets; they do not make an already-issued external effect reversible.

## Observed-state envelope

```text
sourceHostId
hostGeneration
edgeBootId
environmentId + environmentGeneration
resourceKind + resourceId + resourceGeneration
eventStreamId + sequence
observedAt + hubReceivedAt
state
confidence            witnessed | reconciled | inferred | unknown
evidenceType
staleAfter
causationId / commandId
payload or blob reference
```

**RECOMMENDATION:** use monotonic sequence only within a declared stream identity; wall-clock timestamps provide age and audit context, not total ordering. A new Edge boot or journal epoch creates an explicit stream boundary. Event consumers deduplicate by `(streamId, sequence)` and retain causal identifiers.

`RUNNING` means the Edge recently witnessed a matching process/native identity. `STALE` means the observation aged past its contract. `UNKNOWN` means the Edge or Hub cannot establish state. Neither means stopped.

## Reconnect protocol

After transport establishment:

1. both sides negotiate HCP version, required features, limits, and compression;
2. Edge presents enrolled host identity, host generation, Edge boot/instance identity, last Hub-acknowledged event cursor, and command journal watermark;
3. Edge sends an authoritative snapshot or a digest plus deltas when both sides prove a common checkpoint;
4. Hub acknowledges a durable event watermark and reports its last command receipt watermark;
5. any event gap triggers snapshot reconciliation rather than guessed replay;
6. Hub redelivers only non-expired commands whose target generations still match;
7. Edge returns stored receipts, reconciles named effects, or reports ambiguity before new conflicting work is admitted.

**RECOMMENDATION:** the Edge owns a bounded durable outbound spool. Backpressure must preserve lifecycle, approval, command, and terminal events before high-volume token/terminal deltas. Token deltas can be coalesced; canonical completed content cannot.

## Required failure outcomes

| Case | Required outcome |
| --- | --- |
| request delivered, result lost | duplicate returns stored/reconciled receipt, or explicit ambiguity |
| retry | same key/digest/generation; no blind new operation |
| Hub restart | Edge continues admitted local policy; reconnects with journal/snapshot |
| Edge restart | audit journal against OS/native identities before replay |
| host reboot | new boot identity; surviving durable native state may resume, processes presumed absent only after local observation |
| network partition | Hub marks projection stale/unknown; no automatic duplicate placement |
| duplicate delivery | journal lookup and payload-digest comparison |
| stale command | reject with current generations and no effect |
| native process survives | reattach only when process start identity, Fleet nonce, and native protocol permit it |
| native process disappears | terminal `LOST` with last evidence; logical history remains |
| host reenrollment | increment/fence host generation and revoke former connection identity |

## Cancellation

**FACT:** cancellation can race completion, can fail to reach a process, and cannot reverse completed tool effects.

**RECOMMENDATION:** cancellation is a separately identified command targeting an admitted command, turn, or managed process generation. Outcomes include `CANCEL_ACCEPTED`, `ALREADY_TERMINAL`, `TARGET_UNKNOWN`, `CANCEL_UNSUPPORTED`, and `CANCEL_OUTCOME_AMBIGUOUS`. The UI must never render “rolled back” unless a distinct compensating operation proves it.

## Local journal

**FACT:** SQLite WAL is a same-host coordination mechanism, normally has one writer, and has checkpoint/durability tradeoffs. The official WAL documentation was updated in 2026 to describe a rare WAL-reset corruption fix available in SQLite 3.51.3 and backports.

**INTERPRETATION:** “SQLite-like journal” is a sound shape, but naming SQLite without pinning a corrected release, durability mode, backup/checkpoint policy, and corruption recovery would be false specificity.

**RECOMMENDATION:** Architecture 0.1 should specify an embedded transactional-store contract: single Edge writer, crash-safe command/idempotency rows, append-oriented event spool, integrity checks, explicit schema migrations, bounded retention, backup/restore, and a patched supported engine. Engine choice remains open.

## Deliberate exclusions

HCP is not:

- an agent protocol or prompt schema;
- a model-provider API;
- a distributed lock service;
- a work-governance claim/lease authority;
- a general remote shell;
- a guarantee of exactly-once arbitrary effects;
- a replacement for native session reconciliation.

## Open conformance work

- define which v0.x operations have stable effect identities;
- test journal/effect crash points for every driver;
- bound offline execution and spool storage by policy;
- specify clock-skew treatment for deadlines;
- specify enrollment key rotation without accepting two host generations;
- test reconnect against duplicate, reordered, truncated, and corrupted frames;
- decide transport framing only after the semantic contract is accepted.

## Primary evidence

- [Kubernetes controllers](https://kubernetes.io/docs/concepts/architecture/controller/)
- [Kubernetes API versions and watches](https://kubernetes.io/docs/reference/using-api/api-concepts/)
- [Nomad architecture](https://developer.hashicorp.com/nomad/docs/architecture)
- [Nomad disconnected clients](https://developer.hashicorp.com/nomad/docs/job-specification/disconnect)
- [SQLite write-ahead logging](https://sqlite.org/wal.html)
