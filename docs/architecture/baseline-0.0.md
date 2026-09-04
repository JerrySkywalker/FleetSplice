# FleetSplice Architecture Baseline 0.0

## Status

- Baseline: `0.0`
- Phase: architecture research
- `ARCHITECTURE_0_1_READY=false`
- `IMPLEMENTATION_AUTHORIZED=false`

This document records the owner's current architecture hypotheses after the initial design discussion. It is intentionally not implementation authority. The research program is expected to challenge, refine, or reject parts of this baseline before 0.1.

## Product thesis

FleetSplice is an open-source control plane for coding-agent sessions across machines and inference environments.

The target problem is a heterogeneous personal or small-team development fleet: several real developer machines, different operating environments and privilege levels, repositories and worktrees that remain host-owned, multiple coding agents, and both cloud and local inference resources. A user should be able to reach one unified WebUI, see and control sessions across that fleet, and continue work when an agent or inference provider changes without pretending vendor-native sessions are identical.

## Working system shape

```text
Human / external orchestrator
            |
            v
     Unified WebUI / API
            |
            v
   Thin Central Control Plane
            |
     Host Control Protocol
      /        |        \
     v         v         v
 Edge       Edge       Edge
 Runtime    Runtime    Runtime
     |         |         |
 Workspace  Workspace  Workspace
     |         |         |
 Agent      Agent      Agent
 Driver     Driver     Driver
     |         |         |
 Native     Native     Native
 Session    Session    Session
      \        |        /
       \-- Inference --/
          cloud/local
```

The control plane owns global intent and logical coordination. Each host runtime owns actual local execution. Inference is a separate plane and may run on a different host from the agent process.

## Core hypotheses

1. FleetSplice is a fleet control plane, not a new coding agent, IDE, model gateway, or general cluster scheduler.
2. A `Host` contains explicit `Environment` objects such as Windows user, Windows admin, WSL, or later other execution boundaries.
3. `Workspace` and optionally `Worktree` precede agent-session placement; agents do not simply receive an arbitrary global cwd.
4. `LogicalSession` is the user-facing work history. `NativeSession` is a vendor/runtime-owned conversation or process identity. They are not the same object.
5. A logical session may contain multiple native segments after provider failure, agent migration, host migration, compaction, or deliberate handoff.
6. `AgentDriver` and `InferenceProvider` are separate abstractions. The execution host and inference host may differ.
7. The WebUI consumes FleetSplice-normalized events and capabilities; it does not speak Codex app-server, ACP, or a compatibility backend directly.
8. Official structured protocols are preferred over wrappers: standard protocol first, high-fidelity native API second, permissive compatibility backend third, structured headless CLI fourth, PTY/TUI wrapping last.
9. The central Hub must not become the process supervisor for remote agents. A Hub outage must not terminate already-running sessions.
10. Remote commands require explicit identity, generation, idempotency, and replay-safe semantics.
11. Coordination Loop remains an external orchestrator and can consume FleetSplice as an execution backend rather than becoming part of FleetSplice's core domain model.
12. Safe self-iteration means stable version N can help develop N+1 through normal repository/test/review gates; the trusted runtime is not rewritten in place by an agent.

## Deliberate non-goals for architecture 0.1

- automatic heterogeneous-host scheduling;
- Kubernetes/Nomad-class distributed consensus or HA control plane;
- a universal model gateway implementation;
- a new coding-agent protocol intended to replace ACP or vendor-native APIs;
- arbitrary hot-loading of untrusted runtime code into the trusted host core;
- multi-tenant enterprise control plane;
- commercial licensing or dual-license design;
- implementation before research acceptance.

## Architecture documents

- [`product-thesis.md`](product-thesis.md)
- [`constitution.md`](constitution.md)
- [`system-context.md`](system-context.md)
- [`domain-model.md`](domain-model.md)
- [`authority-model.md`](authority-model.md)
- [`session-model.md`](session-model.md)
- [`agent-and-provider-model.md`](agent-and-provider-model.md)
- [`host-runtime-model.md`](host-runtime-model.md)
- [`webui-model.md`](webui-model.md)
- [`history-and-handoff.md`](history-and-handoff.md)
- [`coordination-loop-integration.md`](coordination-loop-integration.md)
- [`self-iteration.md`](self-iteration.md)

## Research gate to 0.1

Architecture 0.1 may be proposed only after the research program has produced evidence-backed findings for host/runtime authority, control protocol semantics, agent integration, provider binding, WebUI reuse, long-session history, Coordination Loop integration, security boundaries, and permissive-code reuse. The owner must explicitly accept the resulting baseline and declare `ARCHITECTURE_0_1_READY=true` before product implementation begins.
