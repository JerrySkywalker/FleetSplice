# Current FleetSplice development status

Architecture 0.1 is accepted. G06 predeploy local implementation and the
Pre-Gate-S S00-S11 train are complete locally. The controlling handoff is
`78c6d08bc1feead8496cea85a3ec52b3e2a0d4a1`; the older root/main checkout is not
the implementation baseline. The [S11 receipt](receipts/PGS-S11-installer-dogfood-closeout.md)
and its terminal tokens supersede earlier pre-S11 readiness wording. Historical
receipts remain unchanged, including S11's 274-pass/3-fail managed-pin debt.

The Owner's `FLEETSPLICE-ZENBOOK14-REQUALIFICATION-EXTERNAL-DAEMON-BLOCKER-CLOSEOUT-001`
bounded the review and closeout of the preserved local source/test/documentation
repairs, non-daemon gates, Gate S preparation and one PR on
`train/zenbook14-local-requalify-gate-s-prep-001`.
It did not authorize merge, production mutations, deployment or G07. Near-term
UI/UX remains frozen. The G05C freeze below is historical product provenance,
not the current implementation HEAD.

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
TENCENT_DEPLOYMENT_GATE=WAITING_SERVER_READY
TENCENT_TARGET=tencent-pek-01
TENCENT_DEPLOYED=false
REMOTE_TENCENT_WORK=false
G06_LIVE_ACCEPTANCE=false
V0_1_ALPHA_1_RELEASED=false
PRE_GATE_S_IMPLEMENTATION_COMPLETE=true
PRE_GATE_S_S11=COMPLETED_LOCALLY
GATE_S=OWNER_PRODUCTION_DEPLOYMENT_ADMISSION_REQUIRED
G07_STARTED=false
IMPLEMENTATION_AUTHORIZED=NONE
PRODUCT_IMPLEMENTATION_AUTHORIZED=NONE
NEXT_OWNER_DECISION=GATE_S_ADMISSION_INPUTS_AND_ACCEPTANCE_POLICY
ZENBOOK14_S10_STATUS=BLOCKED_EXTERNAL_CODEX_MANAGED_DAEMON_UNAVAILABLE
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
- [Gate S decision package](gate-s-admission-package.md): unresolved production
  inputs, generic OIDC versus passkey acceptance, and first live G06 Edge.
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

Earlier SKYFORGE S10 results remain historical evidence, not ZenBook14 results.
This local closeout is neither Tencent deployment nor live G06 acceptance. The
[Gate S package](gate-s-admission-package.md) leaves the first live Edge and
production OIDC acceptance for an explicit Owner decision.
