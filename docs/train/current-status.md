# Current FleetSplice development status

The Owner accepts the final local G05C product baseline. Canonical product
implementation is the UI-portability freeze head below. Near-term UI/UX
engineering remains frozen. Performance Gate P for this train has frozen
measured P1 optimizations. G06 predeploy local implementation is started;
Tencent deployment remains deferred until the server is ready.

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
G06_PHASE=PREDEPLOY_LOCAL
TENCENT_DEPLOYMENT_GATE=WAITING_SERVER_READY
TENCENT_TARGET=tencent-pek-01
TENCENT_DEPLOYED=false
REMOTE_TENCENT_WORK=false
G06_LIVE_ACCEPTANCE=false
IMPLEMENTATION_AUTHORIZED=PERF_G06_PREDEPLOY_NIGHT_TRAIN_ONLY
PRODUCT_IMPLEMENTATION_AUTHORIZED=PERF_G06_PREDEPLOY_NIGHT_TRAIN_ONLY
NEXT_OWNER_DECISION=COMPLETE_PREDEPLOY_THEN_WAIT_TENCENT_SERVER_READY
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
