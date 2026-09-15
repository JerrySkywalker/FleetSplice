# FleetSplice

FleetSplice is an open-source, self-hosted control plane for agentic execution
across heterogeneous machines, execution environments, and inference resources.

It starts with real coding-agent sessions, but its long-term design is broader:
make existing, stateful, non-interchangeable environments safely operable by AI
agents without pretending that every machine, runtime, model endpoint, or tool is
portable, disposable, or safely retryable.

## Product principles

### Capability @ Environment

A capability is meaningful together with the environment that actually owns it.
An agent, model, workspace, privileged context, or specialized tool is not treated
as a free-floating label that can be silently moved elsewhere.

Examples of the intended notation are:

```text
agent @ workstation-a/windows-user
model @ gpu-node-b
tool @ specialized-host-c
```

### Brownfield-first

FleetSplice is designed for real environments that already exist and may carry
important local state: installed software, credentials, drivers, devices, data,
interactive sessions, workspaces, or hardware capabilities.

The architecture does not assume those environments can always be recreated from
a template, containerized, migrated, or replaced by an anonymous worker.

### Split authority, thin Edge

FleetSplice deliberately separates logical control from execution truth.

- The **Hub** owns Fleet identity, admission, policy, logical history, plans, and
  immutable receipts.
- A small per-user **Edge** owns local execution evidence, workspace/process
  identity, command journals, credentials boundaries, and reconciliation near the
  real environment.
- The **native runtime or tool** remains the authority for its own native session
  and actual external effect.

The Hub is not allowed to turn a remote projection into process truth, and an Edge
is not intended to become a complete product server that duplicates global UI,
project, provider, and history state for every environment.

### Edge-local truth

Filesystem state, process lifetime, native-session identity, local credentials,
and external effects are observed and reconciled at the Edge closest to execution.
A lost connection, a new runtime generation, or a stale central projection does
not prove that previous work stopped.

### Four independent placements

Long-term placement is intentionally separable:

1. **Orchestration placement** — who decides what, why, and when;
2. **Execution placement** — where the agent/runtime/workspace executes;
3. **Inference placement** — where model inference is served;
4. **Tool placement** — where a specialized tool or external capability runs.

A single logical work item may use different environments for all four.

### Inference fabric

Inference is a Fleet resource, not necessarily a property of the machine running
the agent. FleetSplice is intended to make local or remote inference capacity
discoverable, admissible, bindable, and auditable without becoming a universal
model-protocol translation gateway.

### Tool placement

Specialized tools can have their own locality, privilege, licensing, interactive,
device, or data constraints. They should be represented as typed capabilities
owned by concrete environments rather than hidden behind an assumption that every
tool runs inside the agent process.

### Failure-honest receipts

Distributed execution can lose responses after an external effect has started.
FleetSplice must not manufacture exactly-once semantics by blind retry.

When the system cannot prove whether an effect occurred, that uncertainty remains
explicit (for example, `AMBIGUOUS_EFFECT`) until evidence-backed reconciliation
resolves it.

## Current v0.1 scope

The current implementation path remains intentionally narrower than the long-term
vision above.

The first local slice is a real Codex session on one enrolled workstation. The
first remote slice adds a phone/browser, a self-hosted Hub + WebUI, and a per-user
Edge. A second heterogeneous host joins later in v0.1, followed by recovery,
qualified migration, and hardening.

Remote prompt/stream, approval, interrupt, reconnect, and basic session control are
required product fundamentals even though they are not the long-term source of
differentiation.

The broader execution/inference/tool fabric is **post-v0.1** work and is tracked in
[#2](../../issues/2) through [#8](../../issues/8). Those future issues do not change
or block the accepted G05-G10 visible implementation roadmap.

## Architecture status

Architecture 0.1 is accepted: `ARCHITECTURE_0_1_READY=true`.

Read the [current architecture and G04A amendment](docs/architecture/README.md),
[visible implementation roadmap](docs/v0.1/implementation-roadmap.md), and
[current pre-development status](docs/train/G04A-status.md).

Product development remains unstarted: `G05_STARTED=false`,
`IMPLEMENTATION_AUTHORIZED=false`, `PRODUCT_IMPLEMENTATION_AUTHORIZED=false`.
G04A ends with Owner review; `OWNER_RESUME_REQUIRED_FOR_G05=true`.
