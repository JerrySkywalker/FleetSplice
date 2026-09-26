# Current FleetSplice development status

Architecture 0.1 is accepted. G06 predeploy local implementation and the
Pre-Gate-S S00-S11 train are complete locally. PR #11 was merged into
`train/pre-gate-s-development-001` at
`a659eec21e4828a55e9210b9a3b88c08ab507b9a`; PR #12 then merged the
Owner's Gate S decisions at `552843ed36f213b80228457cd6bd0a5bf34e1117`.
The previous controlling
handoff `78c6d08bc1feead8496cea85a3ec52b3e2a0d4a1` is historical ancestry,
not the latest merged baseline. The [S11 receipt](receipts/PGS-S11-installer-dogfood-closeout.md)
and its terminal tokens remain historical evidence, including S11's
274-pass/3-fail managed-pin debt. Near-term UI/UX remains frozen. The G05C
freeze below is historical product provenance, not the latest merged baseline.
`PR13_BASE_MERGE_HEAD` names the exact PR #12 merge into the train branch;
it does not claim to identify this document's PR candidate or its future merge.
Candidate and merge SHAs belong in PR and receipt history once established.

```text
ARCHITECTURE_0_1_READY=true
G05C_FINAL_PRODUCT_BASELINE_READY=true
G05C_FINAL_PRODUCT_IMPLEMENTATION_HEAD=017a89472436702a9f6228bf680a3674bb0a2d32
G05C_FINAL_PRODUCT_IMPLEMENTATION_TREE=521c0781debdbdac1b23886471b8f612f8c89701
PRIMARY_NATIVE_PATH=NATIVE_ADOPTED
NATIVE_ADOPTION_COMPATIBILITY=CAPABILITY_DRIVEN
VERSION_SHA_ROLE=EVIDENCE_AND_INCARCATION_METADATA
VERSION_SHA_NOT_PRODUCT_COMPATIBILITY_ALLOWLIST=true
NEAR_TERM_UI_UX_DEVELOPMENT=FROZEN
NEXT_DEVELOPMENT_CLASS=FUNCTIONAL_PRODUCT_WORK
G06_STARTED=true
G06_PHASE=PREDEPLOY_LOCAL_COMPLETE
G06_PREDEPLOY_READY=true
PR13_BASE_MERGE_HEAD=552843ed36f213b80228457cd6bd0a5bf34e1117
PR11_MERGED=true
PR12_MERGED=true
TENCENT_DEPLOYMENT_GATE=WAITING_SERVER_READY
TENCENT_TARGET=tencent-pek-01
TENCENT_DEPLOYED=false
REMOTE_TENCENT_WORK=false
G06_LIVE_ACCEPTANCE=false
V0_1_ALPHA_1_RELEASED=false
PRE_GATE_S_IMPLEMENTATION_COMPLETE=true
PRE_GATE_S_S11=COMPLETED_LOCALLY
GATE_S=OWNER_PRODUCTION_DEPLOYMENT_ADMISSION_REQUIRED
GATE_S_ADMITTED=false
G07_STARTED=false
IMPLEMENTATION_AUTHORIZED=NONE
PRODUCT_IMPLEMENTATION_AUTHORIZED=NONE
LOCAL_PRODUCT_IMPLEMENTATION_READY=true
PRE_GATE_S_LOCAL_HARDENING=PASS_WITH_DOCUMENTED_LOCAL_DEBT_PR_READY
GATE_S_READINESS_AUDIT=BLOCKED_INFRASTRUCTURE_NOT_READY
PRODUCTION_INFRASTRUCTURE_READY=false
NEXT_EXTERNAL_GATE=PRODUCTION_INFRASTRUCTURE_PREPARED_AND_OWNER_REAUTHORIZES_GATE_S
NEXT_LOCAL_WORK=INVESTIGATE_BROWSER_OBSERVATION_TEST_TIMING_UNDER_SIMULTANEOUS_LOCAL_PACKAGE_LOAD
ZENBOOK14_ROLE=PRIMARY_DEVELOPMENT
ZENBOOK14_S10_STATUS=BLOCKED_EXTERNAL_CODEX_MANAGED_DAEMON_UNAVAILABLE
FIRST_LIVE_G06_EDGE=SKYFORGE-01
SKYFORGE_FRESH_QUALIFICATION_REQUIRED=true
HUMAN_AUTH_CONTRACT=GENERIC_OIDC
PRODUCTION_IDP=OWNER_SELECTED_CANDIDATE_PENDING_CONFIGURATION:CASDOOR
```

Historical native-control closeout evidence remains at
`ba8c6fa84db528b9821be5aa672e8267ae744c70` (tree
`37cccb8d342d65433330e90f342be9662fa49d28`) and is preserved under the archive
namespace and immutable receipts. That closeout head is not the current
functional-development baseline.

Authoritative product pointers:

- [Owner Thesis](../product/owner-thesis.md)
- [Implementation roadmap](../v0.1/implementation-roadmap.md)
- [G05C closeout receipt](receipts/G05C-native-control-closeout.md)
- G06 remote Adoption seam: [ADR 0007](../adr/0007-remote-native-adoption-hcp.md)
- [Gate S decision package](gate-s-admission-package.md): Owner auth and Edge
  decisions recorded; production inputs remain unresolved.
- [First-live-G06 OIDC amendment](../architecture/amendments/gate-s-g06-human-oidc.md):
  the narrow normative replacement for historical passkey-specific wording.
- UI portability freeze artifacts:
  `V:\artifacts\FleetSplice\FLEETSPLICE-G05C-UI-PORTABILITY-FREEZE-FINAL-001`
- Final promotion hygiene artifacts:
  `V:\artifacts\FleetSplice\FLEETSPLICE-G05C-FINAL-PROMOTION-001`

Ordinary `codex --yolo` is the north-star local command. Origins are
`NATIVE_ADOPTED` and `FLEETSPLICE_MANAGED`. FleetSplice owns control authority;
native agents and existing tools own execution, terminal, editor, Git, worktrees
and the development environment.

The responsive Web/mobile surface is already implemented and accepted under the
UI-portability freeze. G06 reuses that surface through typed remote AdoptionPort
HCP; it must not re-implement mobile UI as a first invention.

Do not treat predeploy local work as Tencent access, DNS/TLS/auth mutation, or
main merge. Live remote acceptance remains blocked on server readiness.

## ZenBook14 development and qualification limit

The 2026-09-25 requalification found and locally repaired historical
machine-name admission assumptions and expired localhost TLS test material.
Historical managed qualification remains fail-closed and its unavailable
integration fixture is explicit test debt. The current supervisor requires
native adoption, not the historical managed pin.

ZenBook14 is ready for ordinary FleetSplice development. Authenticated ordinary
patched `codex --yolo` works, but the Codex managed daemon cannot detach on
this Windows host. Independent bootstrap attempts fail at the host Job Object
boundary; no daemon PID record or control socket exists. FleetSplice therefore
has no native managed daemon to discover, and local managed-daemon S10 cannot
currently be requalified. The distribution-specific candidate search remains
an unqualified portability question, not evidence of a FleetSplice product
regression on this host. Discovery and native identity/capability checks remain
fail-closed; fixture tests cannot substitute for real same-thread acceptance.

Earlier SKYFORGE S10 results remain historical evidence, not ZenBook14 or live
G06 acceptance. SKYFORGE-01 is the Owner-selected first live G06 Edge; it needs
fresh qualification of native runtime, principal, workspace, outbound path and
availability before enrollment or deployment. ZenBook14 remains the primary
development machine. The two machines must not share copied credentials or
authority state. This is one-Edge G06 planning, not G07 or two-host operation.

The Owner selected generic OIDC for first live G06 and Casdoor as the first
production IdP candidate, pending configuration and independent readiness
audit. No production IdP application or secret is created by this decision.
The Owner reported that the production-readiness audit is complete with disposition
`BLOCKED_INFRASTRUCTURE_NOT_READY`. This is an external infrastructure gate,
not a local product implementation blocker. Tencent remains undeployed, Gate S
unadmitted, and live G06 acceptance unrun. The active admission draft and
offline check are linked from the [Gate S package](gate-s-admission-package.md).

The local hardening train passed post-soak serial and default-concurrency
qualification (285 passed, 3 named skips, 0 failed in each). During overlapping
local package compilation and fixture soak, the legacy synthetic browser test
intermittently missed different five-second UI observation assertions. No
consistent product root cause was proven, so no speculative browser source or
timeout change was made. That mixed-load test timing remains a bounded local
investigation debt; it does not imply ZenBook14 S10, live G06, or Gate S
acceptance.
