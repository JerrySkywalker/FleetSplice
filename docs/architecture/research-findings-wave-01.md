# Architecture consequences from research wave 01

## Status

- Research goal: `FLEETSPLICE-ARCH-RESEARCH-WAVE01`
- Evidence cut: 2026-09-04
- Baseline 0.0 remains unchanged.
- `ARCHITECTURE_0_1_READY=false`
- `IMPLEMENTATION_AUTHORIZED=false`

This document records consequences to consider when the owner later requests a Baseline 0.1 draft. It is not that baseline and does not authorize implementation.

## Findings that strengthen Baseline 0.0

These are architecture interpretations of the evidence, not direct upstream guarantees.

1. **INTERPRETATION — Host-owned execution is necessary.** HAPI, Orca, T3 and OpenHands all place a runtime near the workspace; their failures recur when remote projections or volatile maps are mistaken for local truth.
2. **INTERPRETATION — LogicalSession must remain distinct from native identity.** Product conversation rows, agent sessions, provider context and OS processes demonstrably diverge during restart, resume and migration.
3. **INTERPRETATION — Agent and inference provider are separate planes.** Codex/OpenCode provider configuration and Ollama/vLLM/gateway behavior show that process/tool authority and model serving can live on different Hosts.
4. **INTERPRETATION — Native structured drivers are preferable.** Codex app-server and negotiated ACP implementations can preserve structured lifecycle, tool and approval information that terminal wrapping loses; exact ACP capabilities remain version- and Agent-dependent.
5. **INTERPRETATION — A central Hub must not supervise remote processes directly.** Network loss cannot prove process death; Hub restart should not cascade agent shutdown.
6. **INTERPRETATION — Outbound Edge connectivity is an appropriate default.** It reduces inbound host exposure and supports roaming/NAT, provided durable state is independent of the connection.
7. **INTERPRETATION — No scheduler and no transparent failover are sound v0.x constraints.** Hosts and providers are non-fungible in credentials, workspaces, capabilities, privacy and state.
8. **INTERPRETATION — Coordination Loop should remain external.** CLH owns durable coordination contracts/state, CLE owns DAG/scheduling/policy decisions, and CLF owns worker/provider-session translation; Fleet owns local execution admission and observation.
9. **INTERPRETATION — Stable N may develop N+1 through ordinary execution.** The self-hosting goal is compatible with an immutable running trust kernel.
10. **INTERPRETATION — Permissive UI reuse is realistic.** assistant-ui and current OpenHands/T3 provide useful component or design surfaces without requiring HAPI source.

## Findings that weaken or correct Baseline 0.0

1. **INTERPRETATION — “Thin Hub” is underspecified.** The Hub must durably own logical history, search, policy, intent and projections; it is thin only with respect to remote process authority.
2. **INTERPRETATION — Environment is stronger than a child label.** It is an independently authorized principal/process/path/credential/lifecycle boundary with its own generation.
3. **INTERPRETATION — Worktree is not universally required.** Workspace binding is mandatory; Worktree binding is optional and explicit.
4. **INTERPRETATION — A flat list of NativeSegments is insufficient.** Forks, subagents and concurrent branches require causal SessionLanes. A segment is a binding epoch and may reuse a native thread ID.
5. **INTERPRETATION — Handoff Capsule cannot guarantee continuation.** It transfers only reviewable facts/artifacts and must name excluded opaque state.
6. **INTERPRETATION — ACP is not a universal first-choice interface.** It is appropriate for faithful ACP Agents; native Codex app-server retains higher fidelity, and ACP is not HCP.
7. **INTERPRETATION — One normalized schema is lossy.** Fleet needs common semantic events plus retained, redacted, versioned native detail.
8. **INTERPRETATION — `at-least-once + idempotency` is not universally effectively once.** External effects require stable identities and reconciliation; opaque effects remain ambiguous.
9. **INTERPRETATION — “SQLite-like” is a contract, not yet a technology decision.** Version, durability, corruption fixes, backup/checkpoint and migration policy matter.
10. **INTERPRETATION — Extensible perimeter needs process/trust constraints.** Identity, auth, journal, generations, secrets, durable integrity, process ownership and update verification cannot be hot-replaced.
11. **OPEN — T3/OpenHands compatibility is not established.** Both are plausible external islands, but RPC/API stability and identity/reconnect semantics need conformance evidence.
12. **INTERPRETATION — Self-iteration needs an external activation boundary.** N+1 cannot approve or activate itself; canary, migration and rollback evidence are mandatory.

## Proposed changes for a future Baseline 0.1

**RECOMMENDATION:** a future owner-authorized baseline draft should consider these changes:

1. Define the authority split in a table: Hub intent/history versus Edge filesystem/process/native truth.
2. Define `Environment` as an execution authority and initially name Windows user, Windows admin and WSL identities.
3. Add `SessionLane`; redefine NativeSegment as a stable binding/capability epoch on a lane.
4. Define native, reconstructed, related-only and unknown continuity labels.
5. Specify HCP semantic envelopes and failure outcomes before selecting a transport.
6. Narrow effectively-once claims to named/reconcilable effect classes and define `AMBIGUOUS_EFFECT`.
7. Specify an embedded transactional Edge journal contract with snapshot/event-cursor/watermark reconnect.
8. Select Edge-owned Codex app-server stdio as the preferred Codex boundary, with exact binary/schema probes.
9. Select ACP v1-style negotiated local stdio as the generic structured driver where required capabilities fit; keep v2/remote proposals gated.
10. Define normalized common events plus native payload references, causal IDs, confidence/staleness and blob manifests.
11. Add provider-profile metadata versus Environment-local CredentialRef authority and an explicit migration workflow.
12. Define Fleet-owned UI shell/projection ports and trusted capability-gated extension slots.
13. Define Windows v0.x topology as a per-user Edge plus separately enrolled admin and WSL companions; defer a service.
14. Define Coordination Loop/CLF integration as a versioned external adapter with separate work-claim and execution-generation identities.
15. Define the immutable Edge kernel and the stable-N → N+1 external review/canary/rollback boundary.

## Decisions still blocked

**OPEN:** the research does not decide:

- owner acceptance of the hypothesis grades and replacement language;
- exact CLE/CLF schemas and authoritative implementation behavior;
- T3/OpenHands compatibility API stability and conformance;
- real-platform Windows lifecycle, elevation, ConPTY, job and WSL results;
- driver crash/reconnect/idempotency traces, especially active Codex turns;
- implementation language, framework, transport, storage engine and packaging;
- exact UI donor files/packages and transitive provenance;
- enrollment/key storage and update signing technology;
- data retention/encryption, multi-user authorization and backup/restore policy;
- any implementation authorization.

## Candidate ADRs

**RECOMMENDATION:** these are candidate decision records for a later owner-authorized architecture closeout, not accepted decisions:

1. Hub/Edge authority and outage behavior.
2. Host and Environment identity/generation model.
3. Workspace binding and optional Worktree binding.
4. LogicalSession, SessionLane, NativeSegment and continuity taxonomy.
5. Host Control Protocol command/observation/reconnect semantics.
6. Edge journal durability and external-effect ambiguity model.
7. Native Codex app-server driver and compatibility policy.
8. ACP driver scope and version/capability policy.
9. Normalized/native event and blob/history model.
10. Provider profiles, credential authority and migration policy.
11. Windows user/admin/WSL Edge topology.
12. Unified UI reuse and trusted extension slots.
13. Coordination Loop/CLF adapter authority mapping.
14. Trusted kernel, extensions and update/self-iteration boundary.
15. Donor provenance and compatibility-process policy.

## Required owner review questions

**OPEN:** owner decisions are required on:

1. Is “process-thin, stateful Hub” the intended correction to thin control plane?
2. Is SessionLane acceptable as the missing concurrency/fork identity?
3. Should every effective model/provider change open a NativeSegment even when the native thread is retained?
4. Is explicit `AMBIGUOUS_EFFECT` acceptable instead of an overbroad effectively-once promise?
5. Is assistant-ui-first conversation reuse with selective OpenHands panels the preferred research direction?
6. Should T3/OpenHands compatibility remain unresolved pending later conformance work?
7. Is per-user Edge plus separate admin/WSL companions the accepted Windows research direction?
8. Does CLF retain migration/retry policy while Fleet performs and observes execution?
9. Is an out-of-process/static extension perimeter sufficiently extensible for 0.1?
10. Which blocked decisions, if any, must be resolved before a Baseline 0.1 drafting Goal?
