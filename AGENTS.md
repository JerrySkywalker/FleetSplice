# FleetSplice repository rules

FleetSplice Architecture 0.1 is accepted. `ARCHITECTURE_0_1_READY=true`.
The canonical local G05C product implementation baseline is
`017a89472436702a9f6228bf680a3674bb0a2d32`, tree
`521c0781debdbdac1b23886471b8f612f8c89701`. Near-term UI/UX development is
frozen. `docs/train/current-status.md` binds current readiness.

Read these current pointers before changing the repository:

- Product boundary: `docs/product/owner-thesis.md`.
- Current train status: `docs/train/current-status.md`.
- Current implementation roadmap: `docs/v0.1/implementation-roadmap.md`.
- Accepted architecture baseline: `docs/architecture/baseline-0.1.md`.
- Normative G04A amendment: `docs/architecture/amendments/g04a-visible-mvp-simplification.md`.
- G05B-R1 correction receipt: `docs/train/receipts/G05B-R1-persistent-proxy.md`.

Current authorization state:

```text
ARCHITECTURE_0_1_READY=true
G05C_FINAL_PRODUCT_BASELINE_READY=true
PRIMARY_NATIVE_PATH=NATIVE_ADOPTED
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
```

This train authorizes only the bounded PERF/G06-predeploy night Goals.
Do not begin product G07, contact Tencent, or merge main without a later explicit
Owner instruction and a bounded Goal.

1. FleetSplice is a **control plane for coding agents in existing development
   environments**, not an AI IDE/ADE. Do not expand a Goal into an editor,
   terminal product, Git GUI, browser, worktree manager or generic workstation
   merely because those features could be useful later.
2. Do not implement product code merely because a design appears obvious.
   Research, planning and architecture documents may be created or revised
   within the current authorization.
3. `VISIBLE_INCREMENT_RULE=true`: every major implementation Goal ends with an
   Owner-operable, observable capability; infrastructure-only exceptions must
   cite a concrete unavoidable dependency.
4. Native agents own their native file, shell, test and tool semantics.
   FleetSplice should project and control upstream capabilities instead of
   reimplementing a competing tool runtime.
5. Capability discovery must be preferred over static guesses for changing
   native facts such as model IDs and supported reasoning levels whenever the
   upstream protocol provides a live source of truth.
6. Windows Terminal remains the preferred local human terminal for the Owner.
   An embedded or remote terminal is not a prerequisite for the first phone
   control loop. Any future xterm-based terminal must satisfy a separately
   accepted Windows-Terminal-compatible interaction contract rather than expose
   a raw xterm keymap.
7. The first remote topology remains Owner-controlled Hub/WebUI plus
   authenticated **outbound** Edge connectivity. Do not introduce a required
   third-party relay or a phone-to-development-host inbound port without an
   explicit architecture decision.
8. Provider credentials and native execution state remain local by default.
9. Honest uncertainty is mandatory: do not silently retry or replay an
   ambiguous native effect and do not report completion without evidence.
10. Do not copy AGPL code, especially HAPI implementation code, into this MIT
    codebase. MIT or other permissively licensed donor code may be introduced
    only with explicit provenance and preserved license notices.
11. Record architecture decisions in `docs/architecture` and `docs/adr`; record
    research evidence in `docs/research`. Prefer simple, inspectable repository
    state over heavyweight governance.
12. G03 Git objects, historical research, fixtures and accepted receipts are
    immutable evidence. Normative or status corrections are additive; do not
    rewrite historical receipts to make them look current.
13. G05C Native Agent Control Parity is complete at the final product baseline
    above. Historical closeout evidence at `ba8c6fa84db528b9821be5aa672e8267ae744c70`
    remains immutable. G05C does not include Tencent deployment, embedded
    terminal, editor, Git IDE, browser or worktree manager.
14. G06, when separately authorized after accepted local G05C dogfood and Tencent
    server readiness, reuses the already-proven responsive Web/mobile surface and
    validates it through Tencent Hub + WebUI and authenticated outbound WSS. G06
    should not invent native-agent control semantics or re-implement the mobile
    Web surface for the first time.
15. Post-G06 feature breadth is dogfood-driven. A capability does not become a
    prerequisite merely because it appears useful in another ADE or remote CLI
    project.
