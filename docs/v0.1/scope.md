# v0.1 Scope and Stop Boundary

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

The accepted promotion object above, not the recording receipt, branch name,
HEAD, or SELF, is the architecture citation for this contract. This document is
planning only. It neither creates product directories nor authorizes product
work. A later exact-head G04 review would be required before the contract could
authorize exactly G05 through G10.

## v0.1 thesis

FleetSplice v0.1 is one owner-facing URL for a real coding session on a small,
non-fungible two-host Fleet: SKYFORGE-01 and ZenBookDuo (rendered as “ZenBook
Duo” in existing Goal text). The product must keep Fleet identity, durable
history, authorization, and uncertainty visible while the Host-authoritative
Edge retains local execution truth.

The future, deliberately small product shape is:

1. React, TypeScript, and Vite WebUI;
2. Node/TypeScript Hub;
3. one per-user Node/TypeScript Edge coordinator per enrolled Host;
4. shared typed Fleet contracts; and
5. a native Codex app-server driver behind the Edge.

The shape is declarative here. Its future directory mapping is
[repo-layout.md](repo-layout.md); no source tree exists as a consequence of
this document.

The normative semantics remain in the accepted baseline and ADRs, especially
the [topology and authority model](../architecture/baseline-0.1.md#normative-v0x-topology),
[pre-effect dispatch](../architecture/baseline-0.1.md#rollback-resistant-pre-effect-dispatch),
[safety control](../architecture/baseline-0.1.md#exact-target-safety-control),
and [scope gate](../architecture/baseline-0.1.md#authorization-gates-and-scope-boundaries).
This scope does not restate or weaken them.

## Required v0.1 loop and milestone allocation

The final v0.1 claim is deliberately later than the first vertical slice: one
browser can see both Hosts, select an already registered Workspace, create or
continue a LogicalSession, use real Codex, observe canonical output, resolve
allowed control actions, and recover without inventing a duplicate effect.

| Goal | In-scope outcome | Boundary that must remain explicit |
| --- | --- | --- |
| G05 / M0 | SKYFORGE-01-only Browser -> WebUI -> Hub -> FleetCommand -> Edge -> native Codex -> browser round trip, with the W1 Session Workspace and W5 Host/Workspace subset. | It is a real single-host walking skeleton, not two-host, remote-auth, full-history, or v0.1 acceptance. |
| G06 / M1 | Same WebUI sees and controls SKYFORGE-01 and ZenBookDuo through the same FleetCommand path and authenticated outbound HCP. | Offline or stale is not stopped; reconnect must preserve exact Host and Environment identity and cannot retarget an admitted command. |
| G07 / M2 | Exact approval, interrupt, lane controller/takeover, browser reconnect, and a minimal single-owner remote browser-auth/recovery policy selected through G04. | Takeover pauses automation but never implicitly interrupts; an approval payload cannot create privilege. |
| G08 / M3 | Durable LogicalSession, SessionLane, NativeSegment, Hub/Edge journals, blobs, history cursors, checkpoints, reconciliation, and explicit ambiguity. | Browser, Hub, Edge, or native disruption may not trigger a blind retry of a possibly side-effecting turn. |
| G09 / M4 | Explainable provider/Agent/Execution binding migration proposal, capability evidence, checkpoint, explicit confirmation, and new NativeSegment where selected. | A candidate that fails probes is UNQUALIFIED; the final visible no-target outcome is NO_QUALIFIED_TARGET. Neither outcome is transparent failover. |
| G10 | Harden the complete v0.1 two-host loop: recovery, storage, upgrade, security, long history, install/rollback evidence, and two-host dogfood. | Feature growth stops except for a v0.1 safety, data-loss, authority, or acceptance defect. |

The named interaction allocation follows the
[interaction model](../architecture/webui-model.md#7-v01-priority-and-vertical-slice-rule)
and [wireframe train order](../architecture/webui-wireframes.md#development-train-order-implied-by-the-wireframes).
W6 files/diff/Git/terminal is not smuggled into this scope; it is a later
workspace-richness surface.

## Contract boundaries

### Included only if the future G04 gate passes and the Owner resumes work

- closed typed FleetCommand and read-resource boundaries;
- HCP transport that carries Edge connection, snapshots, receipts, cursors, and
  reconciliation without defining Fleet domain semantics;
- Fleet-owned WebUI projections, not donor-library state as authority;
- native Codex app-server over Edge-owned stdio;
- fixed Host/Environment/Workspace and Driver/Provider binding evidence;
- explicit ambiguity, quarantined conflicting successors, and append-only
  resolution; and
- the exact quality and evidence plan in [quality-gates.md](quality-gates.md).

### Explicitly excluded from G04 and v0.1

- ACP second Agent and every G11 concern;
- admin and WSL runtime product capability, which is G12 work even though
  Architecture 0.1 keeps its safety semantics normative;
- W6 files/diff/Git/terminal workspace UX and G13;
- first-party remote TUI and G14;
- WebUI/TUI parity, self-hosting, and all G15/G16 work;
- Coordination Loop integration, scheduling, DAG/work-order policy, or general
  orchestration inside FleetSplice;
- transparent provider failover, universal model routing, enterprise tenancy or
  RBAC, Kubernetes/Raft/consensus, mobile-native or macOS production clients,
  a plugin marketplace, a public Driver SDK, and general Workspace
  synchronization; and
- hidden product work in a planning document: no package manifest, dependency,
  lockfile, source directory, workflow, service, credential, enrollment, or
  network mutation is part of this phase.

## Current stop

The present authorized endpoint is completed architecture/design preparation,
not development. G04 has deliberately unresolved Owner policy groups and lacks
a fresh exact-head independent review. Therefore:

~~~text
CURRENT_STOP=BEFORE_G05
NEXT_POSSIBLE_CONTRACT_GATE=OWNER_DECISIONS_PLUS_EXACT_HEAD_G04_REVIEW
G05_TO_G10_EXECUTION=NOT_AUTHORIZED
G11_TO_G16=OUTSIDE_G04_AND_STOP_BOUNDARY
~~~

Even a later G04 PASS does not begin G05 in this train without renewed
instruction to resume. The detailed pending decision ledger is in
[acceptance-contract.md](acceptance-contract.md#owner-decision-ledger).
