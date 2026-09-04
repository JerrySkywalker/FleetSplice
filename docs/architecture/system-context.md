# System Context

## Primary actors and systems

- **Human operator** — uses the unified WebUI/API for interactive work.
- **External Fleet client** — a CLI, script, automation process, or future
  third-party client using the ordinary FleetCommand and observation surfaces.
- **Central Control Plane** — owns global catalog, logical-session metadata, desired commands, normalized history, and public API/WebUI state.
- **Fleet AuthorityAnchor** — owns only the Fleet's canonical one-active
  append/CAS order and rollback witness; it owns no identity, policy, local
  truth, process, or effect decision.
- **Edge Runtime** — runs on each admitted host/environment boundary and owns real execution state.
- **Agent Driver** — adapts FleetSplice operations to Codex app-server, ACP, a permissive compatibility backend, or another structured interface.
- **Native Agent** — Codex, an ACP-speaking agent, OpenCode, or later another coding agent.
- **Inference Provider** — cloud API, local Ollama/vLLM-style endpoint, gateway, or another model-serving resource.
- **Transport** — carries control/events but is not the source of product semantics.

Coordination Loop/CLF is not an initial orchestrator or a FleetSplice
dependency. A future CLF adapter may act as one ordinary external Fleet client
with no privileged contract or mutation path. FleetSplice remains architecturally
complete and operable if that optional integration is never created.

## Working planes

### UX plane

Unified WebUI/API: fleet, workspaces, sessions, approvals, history, provider binding, and host state.

### Control plane

Global identities, desired operations, logical sessions, normalized durable events, and policy metadata.

### Authority-witness plane

Exactly one active Fleet-scoped `AuthorityAnchor` lineage is identified by
`fleetId`, `anchorId`, genesis/trust-root digests, and epoch. Scoped authenticated
writers submit immutable candidates by exact-predecessor CAS; Hub, Edge, and
effect-boundary participants independently verify the resulting lineage and pin
their highest checkpoint. The anchor orders and witnesses rollback only. It
cannot select policy, synthesize identity or local truth, grant an effect, or be
replaced by a Hub/Edge database, backup, restored snapshot, promoted clone,
standby, or consensus group.

### Execution plane

Host-local filesystem, Git/worktree, processes, native agent sessions, local command journal, and observed state.

### Inference plane

Provider profiles, model endpoints, local/cloud inference, and any later dedicated routing service. It is deliberately separate from agent lifecycle.

### Transport plane

Initial hypothesis: an outbound persistent channel from each Edge Runtime to the central control plane. Direct or relay data paths may be added later without changing domain semantics.

## Critical boundary

The browser should not directly become an ACP client or Codex app-server client.
The Edge Runtime is the local protocol client because filesystem, terminal,
permission mediation, process lifetime, credentials, and native session
ownership live near execution.

The Hub may hold only a mechanically scoped anchor-writer credential; it cannot
widen or rotate that scope. Agents, Drivers, native helpers, security/update
processes, renderers, candidates, and canaries cannot write the anchor or
self-authorize. Anchor ambiguity, outage, rollback, fork, or loss blocks new
authority, permit, barrier, and successor activation. Previously verified work
may only drain inside its fixed finite horizon, and reduction-only local safety
remains available. Planned rollover is owner-attended and one-way; unprovable
lineage requires a fresh incomparable Fleet/deployment/anchor namespace and
qualified predecessor termination/exclusive-control reconciliation rather than
transparent failover.

At an admin effect boundary, the normal-user Edge issue gate and elevated
companion consume gate enforce candidate-bound exact conflict chains: overlapping
slots are sequential with at most one unresolved, and concurrency needs proven
disjointness. Generic renewal requires unchanged preparation high-waters; only
admin `X_C`/`X_E` may accept a complete contiguous delta confined to their
precommitted predecessor namespace, never safety, stop, revocation, or unrelated
drift. On authenticated safety acknowledgement observation, participant-local
same-gate `STOP_PENDING` registration—not Hub or anchor acknowledgement—is the
non-barging fence. It rejects all not-yet-linearized conflicts, survives
crash/replay/expiry, and invalidates a prepared admin renewal.
