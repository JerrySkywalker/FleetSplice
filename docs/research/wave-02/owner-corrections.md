# Owner corrections for research wave 02

## Status

- Recorded: 2026-09-04
- Authority: direct owner instruction for `FLEETSPLICE-ARCH-RESEARCH-WAVE02`
- Supersedes: Wave-01 language that treated Coordination Loop as a required FleetSplice consumer, orchestration contract, or architecture dependency
- `ARCHITECTURE_0_1_READY=false`
- `IMPLEMENTATION_AUTHORIZED=false`

## OWNER_DECISION_001 — Coordination Loop and FleetSplice are independent

This decision is authoritative for Wave 02 and for any later Baseline 0.1 proposal:

1. Coordination Loop is explicitly **single-machine first**.
2. Its current purpose is to coordinate long-running, multi-repository software development on one development machine: dependency ordering, per-repository writer discipline, parallel work where repositories or resources are independent, and execution through Codex, ACP, DSH, or other providers.
3. Coordination Loop is not currently a multi-host Fleet scheduler.
4. FleetSplice and Coordination Loop are independent products.
5. FleetSplice must not depend on Coordination Loop.
6. Coordination Loop must not be required for FleetSplice operation.
7. FleetSplice core must not contain Coordination Loop-specific Goals, DAGs, WorkOrders, Runs, CLH/CLE/CLF concepts, coordination leases, coordination receipts, coordination retry semantics, or coordination scheduling policy.
8. FleetSplice exposes one generic northbound mutation contract: `FleetCommand`.
9. FleetSplice WebUI, FleetSplice CLI, scripts and automation, future third-party orchestrators, and a possible future Coordination Loop adapter are all ordinary external FleetSplice clients.
10. FleetSplice v0.x requires no Coordination Loop integration.
11. If a Coordination Loop adapter is ever created, it remains outside FleetSplice core and translates its own concepts into ordinary `FleetCommand` requests.
12. FleetSplice architecture must be correct and complete if Coordination Loop never integrates with it.

## Architecture consequence

**RECOMMENDATION:** remove Coordination Loop from every required FleetSplice topology and semantic closure question. The generic boundary is:

```text
WebUI | CLI | scripts/automation | any future external client
                         |
                  typed FleetCommand
                         |
                         v
                       Hub
                         |
             resolved, exact EdgeCommand
                         |
                         v
                       Edge
```

Read models and event subscriptions are separate observation surfaces; they are not alternate mutation paths. The Hub accepts the same command families and applies the same authority, concurrency, fencing, idempotency, and receipt rules regardless of client type.

**INTERPRETATION:** references in Wave-01 evidence to CLH, CLE, CLF, orchestration claims, or coordination generations remain historical research context. They do not constrain FleetSplice's core domain. No adapter schema, lease mapping, or Coordination Loop acceptance decision is required before Architecture 0.1 can be drafted.

## Traceability

- The stable mutation contract is closed in [FleetCommand](fleet-command.md).
- Observation-only surfaces are closed in [command and observation model](command-observation-model.md).
- Fleet-native writer authority is closed in [multi-client authority](multi-client-authority.md).
- Fleet-native authorization is closed in [authority grants](authority-grants.md).
- Hub-to-Edge translation is closed in [FleetCommand to HCP](fleet-command-to-hcp.md).
- Historical architecture wording is retained but marked superseded in [Coordination Loop Integration Boundary](../../architecture/coordination-loop-integration.md).
