# FleetSplice Research Program 0.1

## Goal

Stress-test Architecture Baseline 0.0 and produce enough current evidence to propose Architecture Baseline 0.1. This is an architecture-research program, not an implementation plan.

`ARCHITECTURE_0_1_READY=false` throughout this program unless the owner explicitly accepts a later architecture closeout.

## Research rules

- use current authoritative upstream docs/source/issues/releases where possible;
- distinguish source facts from interpretation;
- record version/date/license context for fast-moving projects;
- investigate failure modes and open issues, not only happy-path feature lists;
- prefer protocol and component boundaries over product marketing comparisons;
- do not copy donor source code during research;
- do not add implementation dependencies, product source trees, CI, services, or deployments;
- write findings under `docs/research/` and architecture consequences under `docs/architecture/` or later ADRs.

## Workstreams

### R1 — Competing architecture teardown

Deeply compare HAPI, Orca, T3 Code, OpenHands/Agent Server/Agent Canvas, Coder/Daytona where relevant, and other credible multi-environment agent-control systems. Map authority, processes, state, session ownership, reconnect, multi-host behavior, and known instability/failure modes.

### R2 — Agent protocol audit

Audit Codex app-server and ACP in depth: process/transport model, session lifecycle, approvals, files/terminal responsibilities, provider/model control, capabilities, reconnect behavior, versioning, and stability. Determine the first-party versus compatibility adapter strategy.

### R3 — Windows host/runtime model

Research Windows user/admin process ownership, persistent user-session processes, service/session isolation, PowerShell, WSL, filesystem identity, PTY/ConPTY, process-tree survival, and safe host-daemon options. Define explicit `Environment` semantics.

### R4 — Host Control Protocol and reconciliation

Design, but do not implement, command identity, generations, idempotency, desired/observed state, event cursors, local journal/spool, reconnect snapshots, stale-command rejection, cancellation, and Hub-outage behavior. Compare lessons from mature desired-state systems without importing their scale.

### R5 — Logical session and long history

Validate LogicalSession/NativeSession/NativeSegment semantics, normalized event schemas, durable history, checkpoints, hot/warm/cold context, structured/full-text/semantic retrieval, compaction interaction, and HandoffCapsule design.

### R6 — Inference/provider plane

Research Codex/OpenCode/other-agent provider binding, custom endpoints, local Ollama/vLLM-style inference, LiteLLM or similar gateways, execution-host versus inference-host separation, provider credential scope, health, and manual versus automated failover.

### R7 — WebUI reuse

Evaluate assistant-ui, OpenHands Agent Canvas, T3 Code, and other permissive components for conversation streaming, tools/approvals, terminal, files, diff, Git, session navigation, accessibility, and extension rendering. Determine what FleetSplice must own versus reuse.

### R8 — Extensibility and safe self-iteration

Study DeepSeek Harness/Cordis and other plugin architectures. Define the trusted kernel, process/module boundaries, driver extension model, runtime introspection, update/canary design, and what must never be hot-mutated by an agent.

### R9 — Coordination Loop integration

Audit current Coordination Loop/CLE/CLF contracts and determine the minimal FleetSplice execution-adapter interface, claim/lease authority mapping, receipts/events, cancellation, checkpoint references, and long-running unattended development model.

### R10 — Security and threat model

Define trust boundaries for browser, Hub, Edge Runtime, host environment, agent subprocess, inference provider, compatibility backend, and transport. Cover authentication, host enrollment, secrets, admin environments, untrusted agent output, UI extensions, replay, remote command authorization, and update supply chain.

### R11 — License/provenance and donor strategy

Re-verify current licenses for every candidate donor/backend. Build a permissive-code reuse matrix, MIT notice/provenance rules, compatibility-backend boundaries, and an explicit rule for AGPL systems such as HAPI. FleetSplice remains MIT unless the owner changes that decision.

### R12 — Architecture 0.1 and v0.1 acceptance design

Synthesize findings into proposed Architecture Baseline 0.1, ADR candidates, component/repository boundaries, first technology choices, and a deliberately small v0.1 end-to-end acceptance. No implementation DAG should be approved until the architecture closeout is accepted.

## Expected research outputs

At minimum:

- evidence-backed competitor/system teardown;
- protocol and adapter recommendation;
- host/authority/reconciliation model;
- logical-session/history/provider design;
- WebUI reuse decision;
- threat model;
- license/provenance matrix;
- Coordination Loop boundary;
- list of rejected alternatives and reasons;
- Architecture Baseline 0.1 proposal;
- explicit unresolved risks;
- `ARCHITECTURE_0_1_READY` recommendation, still requiring owner acceptance.
