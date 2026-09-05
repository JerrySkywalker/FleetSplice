# v0.1 Implementation Roadmap

## Status and authoritative inputs

| Field | Value |
| --- | --- |
| Planning Goal | FLEETSPLICE-V0_1-IMPLEMENTATION-CONTRACT-004 (G04) |
| Accepted promotion head | 96cb7a4965a651b8582a3ee35049d52204c3fc73 |
| Accepted promotion tree | b554b8568b633397681307d73c7d7fec105963bd |
| Accepted baseline | docs/architecture/baseline-0.1.md |
| Recording receipt path | docs/train/receipts/G03.md |
| Recording receipt commit | ca671e66cf1980a88f0c197016f2d2556390b7be |

~~~text
ARCHITECTURE_0_1_READY=true
IMPLEMENTATION_AUTHORIZED=false
PRODUCT_IMPLEMENTATION_AUTHORIZED=false
G04_CONTRACT_STATUS=DRAFT_PENDING_OWNER_DECISIONS_AND_EXACT_HEAD_REVIEW
G04_PASS=false
~~~

This is the future sequence, not permission to begin it. Its dependencies
follow the root train Goal and [full train roadmap](../roadmap/full-development-train.md).

## Current route and stop

~~~text
G03 accepted promotion
  -> G04 six planning documents
  -> Owner decisions + exact-head independent G04 review
  -> Station A eligibility
  -> STOP_BY_OWNER_NOW

Only after renewed instruction:
  G05 -> G06 -> G07 -> G08 -> G09 -> G10 -> Station B
~~~

G04’s prospective product authority is exactly G05 through G10 and is
conditional on the Owner choices, exact-head review, Station A, and renewed
instruction. G11 through G16 are neither an output nor a dependency of G04.

## Sequencing rules

1. Define closed contracts and their producers before consumers. The Hub,
   WebUI, Edge, and driver may share types only through the future contracts
   package; a transport must not become a hidden domain model.
2. The first applicable G05 effect already needs anchor, journal, identity,
   permit, fencing, idempotency, and ambiguity invariants. G08 expands durable
   history/recovery; it does not defer all safety-critical durability.
3. G05 is a single-host WebUI loop with W1 and W5 only. G06 adds the
   Edge-initiated HCP and second Host identity path. Browser remote exposure
   remains loopback-restricted until G07 has qualified the selected browser
   authentication/recovery policy.
4. A later slice may add a user-facing capability only after its required
   semantics, producer evidence, failure cases, and visible receipt/projection
   are present. No milestone erases an unresolved ambiguity or retargets an
   admitted effect.
5. G05 through G10 remain serial. Read-only research/review may overlap a
   writer, but implementation and integration do not.

## Future milestone plan

| Goal | Owned future domain | Inputs that must already be settled | Required future work and gate | Passing token |
| --- | --- | --- | --- | --- |
| G05 | Walking-skeleton contracts, minimal Hub/Edge/WebUI/Codex path, W1/W5. | Exact G04 PASS, approved source/toolchain admission, schema and owner choices needed for the single-host safe path. | Implement one real SKYFORGE-01 browser-to-Codex path with inspectable command/receipt identity; prove no native-any. | PASS_M0_WALKING_SKELETON |
| G06 | Enrolled two-host identity and authenticated outbound HCP. | G05’s same semantics and exact source of Host/Environment generations. | Add ZenBookDuo without a second mutation model; prove reconnect preserves exact identity and one browser controls the selected Host. | PASS_M1_TWO_HOST_LOOP or BLOCKED_REQUIRED_HOST_UNAVAILABLE |
| G07 | Daily control, approval, interrupt, controller/reconnect, remote-browser policy. | G06 two-host transport plus selected O3/O4 policy. | Implement exact-revision approval and target-bound interrupt; viewer/takeover fencing; browser close/reopen projection without duplicate effect. | PASS_M2_DAILY_CONTROL |
| G08 | Durable Fleet history, recovery, blobs, checkpoints, and ambiguity. | G07 command/control semantics and the selected data proposal as far as its behavior requires. | Make Hub/Edge/native disruption reconcile or expose AMBIGUOUS_EFFECT; add history cursors, continuity, and W7. | PASS_M3_DURABLE_SESSION |
| G09 | Capability-qualified provider migration. | G08 checkpoint/recovery, exact binding history, and real target probes. | Present W3 proposal, capability and continuity losses, then either owner-confirm exact activation or prove visible fail-closed no target. | PASS_M4_PROVIDER_MIGRATION |
| G10 | Hardening and release acceptance. | All prior milestone receipts and final O1/O2/O3/O4/D1 dispositions where their gates apply. | Freeze scope; execute storage, recovery, upgrade, security, long-history, install/rollback, and two-host dogfood evidence. | PASS_V0_1_RELEASE_ACCEPTED |

Each token is a future exact-head disposition, never a test-name substitute.
The associated proof classes are defined in [quality-gates.md](quality-gates.md).

## Architecture-sensitive milestones

The following work must be present from the first applicable product effect and
cannot be postponed as “G08 durability”:

- FleetCommand, ResolvedExecutionPlan, and EdgeCommand remain different
  identities with frozen plan, exact target generations, and idempotency;
- Hub and Edge journals record admission and effect-boundary evidence before
  claiming outcome;
- anchor lineage, permit activation, finite horizon, participant intersection,
  predecessor barrier, and quarantine remain fail-closed;
- stream loss, process absence, and reconnect never stand in for termination;
  and
- SafetyControl stays reduction-only and preserves the full accepted D/O/R
  specification and non-barging behavior.

The exact material remains normative in
[ADR-0001](../adr/0001-hub-edge-command-and-failure-boundary.md),
[ADR-0002](../adr/0002-session-identity-control-and-authority.md), and
[ADR-0004](../adr/0004-windows-runtime-storage-and-native-helper.md).

## Milestone evidence handoff

Each future Goal produces a bounded receipt containing its literal reviewed
SHA/tree, changed paths, applicable evidence-class results, Host/Environment
identities where live, excluded scope, and remaining Owner-attended conditions.
It must never cite a moving branch as acceptance evidence.

A correction creates a new commit and restarts the affected exact-head review.
After a receipt-only follow-up, an independent check verifies that the cited
accepted object was not replaced by the receipt. The mechanics are in
[development-test-merge-policy.md](development-test-merge-policy.md).

## Post-v0.1 boundary

After G10, Station B—not G04—would control later work. ACP second Agent,
admin/WSL product capability, workspace-richness W6, remote TUI, parity, and
self-hosting retain their G11-G16 ordering and must not be pulled forward to
make the v0.1 loop look more complete.
