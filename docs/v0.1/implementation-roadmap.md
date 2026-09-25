# v0.1 Implementation Roadmap

This is the current visible-increment planning view under the accepted
[G04A amendment](../architecture/amendments/g04a-visible-mvp-simplification.md)
and [Owner Thesis](../product/owner-thesis.md). Historical receipts remain
immutable evidence.

G05C's canonical local product baseline is
`017a89472436702a9f6228bf680a3674bb0a2d32`. See [current status](../train/current-status.md)
and the [closeout receipt](../train/receipts/G05C-native-control-closeout.md).
`G05C_FINAL_PRODUCT_BASELINE_READY=true`, `NEAR_TERM_UI_UX_DEVELOPMENT=FROZEN`,
`NEXT_DEVELOPMENT_CLASS=FUNCTIONAL_PRODUCT_WORK`, `G06_STARTED=true`,
`G06_PHASE=PREDEPLOY_LOCAL_COMPLETE`, `G06_PREDEPLOY_READY=true`,
`TENCENT_DEPLOYMENT_GATE=WAITING_SERVER_READY`,
`G06_LIVE_ACCEPTANCE=false`. Current bounded implementation authorization and
the later Pre-Gate-S S11 closeout are maintained only in [current status](../train/current-status.md).
Older intermediate execution states are retained in the linked history and
confer no current authority.

`PRIMARY_NATIVE_PATH=NATIVE_ADOPTED`: ordinary `codex --yolo`, no wrapper,
same native TUI thread, cooperative Web control and return to the original TUI.
Both `NATIVE_ADOPTED` and `FLEETSPLICE_MANAGED` origins remain. Native adoption
is capability-driven; Codex semantic version and executable SHA are evidence /
incarnation metadata, not a compatibility allowlist. Historical managed-launch
artifact qualification remains scoped to the managed path.

`VISIBLE_INCREMENT_RULE=true`.

```text
G03 -> G04 -> G04A (formal G04 + pre-development audit)
               -> Station A ready -> Owner resume
G05 local real Codex
 -> G05A Owner UX foundation
 -> G05B safe local operation
 -> G05B-R1 persistent-proxy correction
 -> G05C Native Agent Control Parity
 -> G05C final product baseline / UI portability freeze
 -> functional product work (near-term UI/UX frozen)
 -> G06 Tencent Hub / remote phone alpha.1 (reuse proven Web/mobile surface)
 -> G07 two-host mobile control
 -> G08 durable session / honest recovery
 -> G09 explicit migration or NO_QUALIFIED_TARGET
 -> G10 hardened two-host/mobile release -> Station B
```

## First-use dependency map

| Goal | Prior dependencies | First-use work and visible gate | Passing token |
| --- | --- | --- | --- |
| G05 | G04 formal + G04A PASS, accepted citations, Station A requirements, Owner resume and L1 | Minimal local SKYFORGE real Codex, closed contracts, Hub/Edge journals, exact identities/fences and loopback HCP. | `PASS_M0_WALKING_SKELETON` |
| G05A | Accepted G05 and explicit G05A-only authorization | Localized/themed real local Codex browser, compact preferences; same commands and native continuity. | `PASS_M0_1_OWNER_UX_FOUNDATION` |
| G05B | Accepted G05A and explicit G05B-only authorization | Safe ordinary-user start/stop/status/doctor, predecessor classification, detached supervisor, clean native closure. | `PASS_M0_2_SAFE_LOCAL_OPERATION` |
| G05B-R1 | Accepted G05B and bounded correction authorization | Persistent per-user proxy configuration; fresh-shell operation without `syncproxy`; real detached-lifecycle dogfood. | `PASS_G05B_R1_PERSISTENT_PROXY` |
| G05C | Accepted local native-control train; bounded documentation closeout; UI portability freeze | Workspace and live capability / session permission controls; native TUI adoption, same-thread continuation, source/timing/activity, exact-turn Steer/Interrupt, renewal, inspectable command approvals, viewer isolation, TUI/Web race safety and return to TUI; accepted responsive Web/mobile surface and frozen near-term UI/UX. | `PASS_G05C_FINAL_PROMOTION_READY_FOR_INDEPENDENT_REVIEW` with matching independent acceptance |
| G06 | Accepted and personally dogfooded G05C plus separate Owner authorization and Tencent deployment admission | Project the already-proven control surface and already-accepted responsive Web/mobile UI to a secure real phone/browser session through Tencent Hub + WebUI and authenticated outbound Edge WSS; validate reconnect, Owner auth and needs-attention behavior on the real remote topology. Do not re-implement mobile UI as a first invention. | `PASS_M1_REMOTE_MOBILE_MVP`; `v0.1-alpha.1` |
| G07 | G06; ZenBook and O2b/O4b | Real turns on both selected Hosts, exact identity on reconnect, viewer/controller/takeover. | `PASS_M2_MULTI_HOST` |
| G08 | G07; D1a when recovery/backup first used | Complete durable session/history, journals/cursors/checkpoints and restart/loss reconciliation. | `PASS_M3_DURABLE_SESSION` |
| G09 | G08; qualified candidate evidence and explicit target confirmation if activating | Actual migration or visibly honest `NO_QUALIFIED_TARGET`. | `PASS_M4_PROVIDER_MIGRATION` |
| G10 | G09; D1b and all remaining release gates | Hardened two-host/mobile Owner dogfood, storage/security/backup/update/long history. | `PASS_V0_1_RELEASE_ACCEPTED` |

## Product-boundary constraints

FleetSplice is a control plane for agents in an existing development
environment, not a replacement ADE. The following rules constrain sequencing:

- FleetSplice owns control authority, not the development environment. It is not
  an IDE/ADE, terminal replacement, embedded editor, Git GUI, worktree manager or
  ChatGPT Mobile clone. No transparent PATH shim as primary architecture.
- Native Codex remains responsible for file, shell, test and tool execution.
  G05C should expose and control those upstream capabilities rather than build a
  parallel tool system.
- Model IDs and reasoning choices must be capability-driven when the native
  agent protocol exposes a live catalog; a static FleetSplice model list is not
  an acceptable long-term source of truth.
- Windows Terminal remains the preferred local human terminal for the Owner.
  An embedded or remote terminal is not a prerequisite for G06.
- Full editor, Git GUI/diff IDE, worktree manager, embedded browser and generic
  multi-agent dashboard do not block the first phone-control loop.
- The responsive/mobile Web surface is already implemented and accepted in the
  G05C final product baseline. G06 reuses that surface and validates it against
  the real remote topology; it does not first invent mobile UI.
- A feature that may be useful later does not become a prerequisite merely by
  appearing on a future-product checklist. Post-G06 breadth is selected from
  real Owner dogfood pain.

## Safety and topology constraints

G05/G05B already include minimum safety durability, dedupe, native identity,
ambiguous-effect handling and fail-closed local recovery. G08 expands usable
durable history/recovery; it does not first introduce protection against
blindly duplicated native effects.

HCP remains the same semantic protocol from local loopback to authenticated
remote WSS. G06 uses Tencent Hub + WebUI; there is no separate FleetSplice Relay
service/protocol and no phone-to-development-host inbound listening port. The
Edge initiates the remote connection and provider credentials remain local by
default. Target host identity remains `tencent-pek-01` when deployment is later
authorized. Current gate:
see [current status](../train/current-status.md) and the Gate S decision package.

Remote enrollment/auth, ZenBook, full history, ACP, Admin/WSL, TUI, provider
migration, generic helper breadth, AuthorityAnchor or G10 policy cannot become
new G05C prerequisites unless a concrete native-control requirement proves it
unavoidable.

G05C and G06 remain serial visible increments. After G10/Station B, the later
[full train](../roadmap/full-development-train.md) remains separately gated.

## Deferred debts and release gate

The [closeout debt register](../train/receipts/G05C-native-control-closeout.md#product-boundary-and-remaining-debts)
retains native Windows command popup / upstream draft, historical managed
artifact qualification, unavailable dedicated file-change approval, unmapped
turn/session grants, and unattended soak. None alone reopens G05C. A real 2–4h+
unattended soak is required before final G06/v0.1 release acceptance; accelerated
renewal proves renewal behavior only. Further work requires separate Owner scope.
