# Coordination Loop Integration Boundary

## Principle

FleetSplice and Coordination Loop should remain separate systems with a narrow execution integration.

The [P0 public contract](p0-interface-contract.md) and [shared acceptance design](p0-shared-acceptance.md) propose an FS-owned execution path that runs without CL/CLE/CLF. A future CL adapter belongs on the consumer side and translates into these neutral operations; it is optional, not part of FS bootstrap, authentication, resource discovery, or execution supervision. These are design requirements, not evidence of an implemented integration.

Working division:

- **Coordination Loop:** why/what/when — program state, DAG, Goal/WorkOrder intent, dependency and acceptance logic.
- **FleetSplice:** where/how/with which execution resources — host/environment/workspace placement, agent runtime, native session, provider binding, and execution observation.

## Intended topology

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

## Boundary rule

FleetSplice core should not understand Coordination Loop DAGs, Goals, WorkOrders, or governance terminology. CLF or another adapter translates orchestration intent into FleetSplice operations and translates FleetSplice results/events into execution receipts or equivalent external records.

## Research questions

- what minimum FleetSplice API allows CLF to request an execution and bind it to a workspace/environment capability set;
- whether CLF selects explicit placement or FleetSplice later offers policy-based placement;
- how execution claims/leases map to FleetSplice command generations without duplicating authority;
- how cancellation, timeout, completion, and degraded host/provider states map to CLF receipts;
- whether logical-session/checkpoint artifacts should be referenced by orchestration receipts;
- how future self-hosted FleetSplice development can be driven through Coordination Loop without circular unsafe update authority.

No implementation dependency on Coordination Loop is authorized in architecture 0.0.
