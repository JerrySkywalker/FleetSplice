# ADR-0003: Agent Driver, compatibility, and provider binding

- Status: Accepted
- Baseline: [Architecture Baseline 0.1](../architecture/baseline-0.1.md)
- `IMPLEMENTATION_AUTHORIZED=false`

## Context

Agent lifecycle/tool authority and inference service placement are different.
Codex exposes a high-fidelity native service API; ACP provides a negotiated
generic local Agent protocol. Both evolve quickly, and a version string or an
OpenAI-shaped endpoint does not establish behavioral compatibility.

## Accepted decision

1. Keep `AgentBinding`, `ExecutionBinding`, and `ProviderBinding` as distinct
   identities and capability records.
2. Use an Edge-owned Codex native driver over explicit
   `app-server --stdio`. Do not use experimental app-server WebSocket/daemon as
   HCP and do not force Codex through a third-party ACP adapter.
3. Use a capability-negotiated ACP driver for Agents that faithfully implement
   the required stable capabilities, with the Edge as ACP Client. Filesystem,
   terminal, permissions, cwd, credentials, cancellation, and recovery stay
   host-near.
4. Admit behavior against an exact semantic fingerprint: Fleet Driver build,
   installed Agent/runtime artifact, generated schema, protocol, required
   capability set, Environment/profile, and disposable conformance evidence.
   Compatibility is capability-scoped, not one global pass bit.
5. Use explicit dispositions: `QUALIFIED`, `QUALIFIED_WITH_LIMITS`,
   `UNKNOWN_UNQUALIFIED`, `UNSUPPORTED`, `QUARANTINED`, and `MISSING`.
   Active segments stay pinned to their exact record across upgrades.
6. Fleet owns provider-profile metadata and redacted CredentialRefs; the target
   Environment owns credentials and applies agent-native provider configuration.
   Fleet does not implement a universal model gateway.
7. v0.x migration is suggested only after binding, authority, network, privacy,
   tool, context, and compatibility probes, then explicitly user-confirmed.
   Source execution is quiesced/fenced or explicitly forked; pending source
   commands/approvals do not migrate. Plan and Edge steps bind the exact
   qualification revision, capability digest, and expiry and recheck them
   immediately before dispatch. Activation creates a new NativeSegment and
   normally a new native session with reconstructed continuity. Transparent
   failover is prohibited. A fork, new segment, Agent/Execution/Provider or
   installation binding, or user confirmation is not effect disjointness:
   before target effect, its permit binds acknowledged source-fence and
   final-boundary reconciliation evidence, the transitive
   `PredecessorNoOverlapBarrier`, or exact resource/effect-disjointness proof.

## Consequences

- Unknown approval, terminal, ambiguity, or capability behavior fails only the
  affected command family closed.
- New bytes/schema create a new installation generation and targeted
  requalification; they do not silently replace an active segment.
- Rollback selects a retained qualified artifact for future work but cannot
  undo native turns, tools, provider requests, or data migrations.
- OpenCode 1.18.16 isolated ACP results and local Ollama metadata are
  architecture evidence only. Real provider/auth, active-loss, terminal/fs,
  concurrent-client, and cross-host provider tests remain open.
- G09 passes exactly one of two visible outcomes: a real qualified migration
  after owner confirmation (`MIGRATION_EXECUTED`), or verified fail-closed
  `NO_QUALIFIED_TARGET`. Only the first claims an activated migration.

## Evidence

- [Codex app-server audit](../research/wave-01/codex-app-server.md)
- [ACP audit](../research/wave-01/acp.md)
- [Upgrade compatibility](../research/wave-02/upgrade-compatibility.md)
- [ACP conformance](../research/wave-02/acp-conformance.md)
- [Provider migration](../research/wave-02/provider-migration.md)

## Acceptance gate

This ADR is Accepted with Architecture Baseline 0.1. It does not authorize
implementation; each runtime capability still requires its named conformance
gate after G04.
