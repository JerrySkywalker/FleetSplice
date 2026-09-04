# Coordination Loop integration

## Evidence available

No separate current Coordination Loop Engine (CLE) or Coordination Loop Fabric (CLF) checkout was found within the inspected local roots (`V:\src` and `C:\Dev`). No separate public CLE/CLF repository was discoverable in the owner's public repository listing or targeted public searches at the evidence cut.

**FACT:** the owner's public `coordination-loop-harness` (CLH) `main` was `95521b2d3b7dbf35610382b87f7e1d6c28872df7` on 2026-09-04. Its current product direction defines:

- CLH: durable coordination contracts and validation;
- CLE: authoritative DAG, scheduling, and policy control plane;
- CLF: execution, worker, provider, and session plane;
- CLT: bootstrap/distribution.

**FACT:** CLH owns Requests, Goals, Decisions, Runs, exact repository/head/worktree verification, resource leases, authority and budget envelopes, status/outcome/audit objects, sealed bundles, and handoff/admission tooling. It explicitly does not start or manage provider sessions.

**FACT:** CLH commands use optimistic status generations and lease generations, explicit decision authorization, exact-head/fail-closed admission, bundle sealing, and blocker evidence. Its security model explicitly does not claim distributed consensus or protection from malicious writers.

**OPEN:** exact current CLE/CLF runtime behavior, wire contracts, retry ownership, and provider/session implementation could not be verified. This gap blocks a final adapter schema, not the broader architecture wave.

## Domain separation

**RECOMMENDATION:** preserve this division:

```text
Coordination Loop / CLE
  WHY: goal, policy, authority
  WHAT: work order, acceptance, dependencies
  WHEN: scheduling, budgets, retries at orchestration level
             |
             v
CLF FleetSplice execution adapter
  translates admitted work to versioned execution requests
             |
             v
FleetSplice Hub
  WHERE: selected Host / Environment / Workspace
  HOW: driver, native process and provider binding
  OBSERVE: command receipts, segment/events/checkpoints
             |
             v
Edge Runtime -> Agent
```

FleetSplice does not import Goal/DAG/WorkOrder lifecycle into its core. It carries opaque external correlation references and exposes execution capabilities and receipts.

## Avoiding duplicate authority

| Concern | Durable authority | FleetSplice responsibility |
| --- | --- | --- |
| work claim / repository lease | CLH durable contract/store, mutated under CLE/owner authority | verify referenced grant during admission; do not recreate it |
| host/environment selection policy | CLE policy; CLF translates the selected execution request | validate target exists, generation is current, and local policy admits it |
| local process ownership | Fleet Edge | launch identity, supervision, cancellation, reconciliation |
| command delivery retry | CLF adapter may redeliver one Fleet command ID; Fleet HCP owns its host delivery | deduplicate by command/idempotency/generation; return receipt/ambiguity |
| new run/attempt retry | CLE decides policy; CLH records durable Run/Decision state; CLF starts the chosen attempt | never infer a new run from a duplicate Fleet command |
| cancellation policy | CLE/owner decides; CLF translates | best-effort target-specific cancellation and observed outcome |
| provider eligibility | CLE policy may constrain candidates; CLF translates the binding request | Edge proves active binding, credential availability, and capability |
| session identity | CLH Run remains external; CLF owns worker/provider-session lifecycle; Fleet owns LogicalSession/segment | store cross-references; do not collapse identities |
| checkpoint/handoff | CLH owns durable sealed-bundle contracts; CLF maps execution references | exchange immutable Fleet checkpoint/artifact references and digests |
| acceptance | CLE/owner decision recorded through CLH contracts | report evidence only; never self-declare orchestration acceptance |

**INTERPRETATION:** a CLH lease generation and a Fleet Environment/resource generation solve different races. The former governs authorized work ownership; the latter fences stale execution targets. Keeping both is not duplicate locking if neither is treated as the other.

## Candidate adapter contract

This is a research shape, not an implementation schema.

### CLF to FleetSplice

- external request/run/work/claim IDs and versioned authority reference;
- actor and bounded authority/budget reference;
- desired LogicalSession operation (`create`, `continue`, `fork`, `cancel`, `observe`);
- workspace/repository/worktree binding and exact preconditions;
- host/Environment constraints or explicit target;
- acceptable driver/provider capability constraints;
- deadline, orchestration attempt ID, Fleet idempotency key;
- checkpoint/Handoff Capsule references and retention/redaction policy.

### FleetSplice to CLF

- admission or blocker receipt bound to exact request digest and generations;
- LogicalSession/lane/segment/native identities as separate fields;
- selected execution and provider bindings with capability snapshot;
- command/turn lifecycle and ambiguity state;
- normalized event cursor and durable checkpoint/artifact references;
- local cancellation observation;
- completion evidence, never the final policy acceptance unless delegated explicitly.

**RECOMMENDATION:** version and serialize this boundary. Do not share source-level domain objects or a mutable database. At-least-once adapter delivery uses both the external attempt identity and Fleet command identity; neither layer invents a replacement ID on an ambiguous retry.

## Retries and cancellation

An orchestration retry can mean “retry this work under policy,” while an HCP retry means “redeliver the same admitted command.” They must have distinct identifiers. CLF decides whether a failed/ambiguous run merits a new attempt; Fleet returns its last observed state and refuses a conflicting reuse of the old idempotency key.

Cancellation flows downward as intent and observations flow upward. A run whose cancellation was decided by CLE/owner and recorded through CLH can still have completed external effects. CLF translates the request. Fleet reports `cancel requested`, native response, process observation, and ambiguous tool effects; CLE/owner decides the work outcome.

## Could FleetSplice simplify CLF?

**INTERPRETATION:** FleetSplice can replace CLF's direct host/runtime integrations with one execution adapter: host discovery, workspace admission, driver/provider capability discovery, native session control, and normalized receipts. This can make CLF thinner.

**RECOMMENDATION:** it must not absorb CLF's cross-provider worker policy, run attempts, orchestration budgets, or scheduling. The seam should allow CLF to select FleetSplice as one execution fabric alongside future fabrics.

## Open decisions

- authoritative CLE/CLF schemas and code are unavailable;
- ownership of cross-provider migration policy needs an explicit family decision; current recommendation is CLF chooses policy, Fleet reports/executes capabilities;
- lease expiry and local long-running work behavior need one documented handoff;
- receipt and bundle retention/redaction contracts need alignment;
- Fleet LogicalSession reuse across two CLF attempts needs explicit policy;
- CLH's cooperative filesystem leases must not be assumed to solve remote Edge races.

## Primary evidence

- [Coordination Loop Harness](https://github.com/JerrySkywalker/coordination-loop-harness)
- [Owner public repository listing](https://github.com/JerrySkywalker?tab=repositories)
- [CLH V5 product direction at the researched commit](https://github.com/JerrySkywalker/coordination-loop-harness/blob/95521b2d3b7dbf35610382b87f7e1d6c28872df7/docs/V5_PRODUCT_DIRECTION.md)
- [CLH command reference at the researched commit](https://github.com/JerrySkywalker/coordination-loop-harness/blob/95521b2d3b7dbf35610382b87f7e1d6c28872df7/docs/command-reference.md)
- [CLH security model at the researched commit](https://github.com/JerrySkywalker/coordination-loop-harness/blob/95521b2d3b7dbf35610382b87f7e1d6c28872df7/docs/security-model.md)
- [CLH design rationale at the researched commit](https://github.com/JerrySkywalker/coordination-loop-harness/blob/95521b2d3b7dbf35610382b87f7e1d6c28872df7/docs/design-rationale.md)
