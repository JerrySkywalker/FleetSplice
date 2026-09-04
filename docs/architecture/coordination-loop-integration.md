# Coordination Loop Integration Boundary

> **SUPERSEDED FOR CORE-ARCHITECTURE PURPOSES (2026-09-04).** The owner has
> decided that Coordination Loop is single-machine-first, is an independent
> product, is not a multi-host Fleet scheduler, and is neither a dependency nor
> a required consumer of FleetSplice. The historical Wave-01 hypothesis below
> is retained for traceability only. Current architecture uses the generic
> external-client / [`FleetCommand`](../research/wave-02/fleet-command.md)
> boundary described in
> [`OWNER_DECISION_001`](../research/wave-02/owner-corrections.md) and
> [Wave-02 architecture findings](research-findings-wave-02.md).

## Current boundary

FleetSplice is architecturally complete if Coordination Loop never integrates.
For mutations, WebUI, CLI, scripts, automation, third-party orchestrators, and
any possible future Coordination Loop adapter are ordinary clients of the same
versioned, strongly typed `FleetCommand` contract. Queries, projections,
history, receipt retrieval, and event subscriptions are separate observation
surfaces with no alternate mutation authority. FleetSplice core contains no
Coordination Loop-specific Goals, DAGs, WorkOrders, Runs, CLH/CLE/CLF concepts,
coordination leases or receipts, retry semantics, or scheduling policy.

A future adapter, if separately desired, translates its concepts into
FleetCommands and consumes ordinary read/event surfaces outside FleetSplice
core. No such integration is required for FleetSplice v0.x or for an
Architecture 0.1 draft. See the current
[`FleetCommand`](../research/wave-02/fleet-command.md),
[observation](../research/wave-02/command-observation-model.md), and
[Edge mapping](../research/wave-02/fleet-command-to-hcp.md) findings.

## Historical Wave-01 hypothesis — superseded

### Principle

FleetSplice and Coordination Loop should remain separate systems with a narrow execution integration.

Working division:

- **Coordination Loop:** why/what/when — program state, DAG, Goal/WorkOrder intent, dependency and acceptance logic.
- **FleetSplice:** where/how/with which execution resources — host/environment/workspace placement, agent runtime, native session, provider binding, and execution observation.

### Intended topology

```text
Coordination Loop
      |
     CLF
      |
FleetSplice execution adapter
      |
FleetSplice Control Plane
      |
 Edge Runtime(s)
      |
 Agent Driver(s)
```

### Boundary rule

FleetSplice core should not understand Coordination Loop DAGs, Goals, WorkOrders, or governance terminology. CLF or another adapter translates orchestration intent into FleetSplice operations and translates FleetSplice results/events into execution receipts or equivalent external records.

### Research questions

- what minimum FleetSplice API allows CLF to request an execution and bind it to a workspace/environment capability set;
- whether CLF selects explicit placement or FleetSplice later offers policy-based placement;
- how execution claims/leases map to FleetSplice command generations without duplicating authority;
- how cancellation, timeout, completion, and degraded host/provider states map to CLF receipts;
- whether logical-session/checkpoint artifacts should be referenced by orchestration receipts;
- how future self-hosted FleetSplice development can be driven through Coordination Loop without circular unsafe update authority.

No implementation dependency on Coordination Loop is authorized in architecture 0.0.
