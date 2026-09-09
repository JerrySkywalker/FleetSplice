# v0.1 Implementation Roadmap

This is the prospective visible-increment sequence under the accepted
[G04A amendment](../architecture/amendments/g04a-visible-mvp-simplification.md),
updated after accepted G05/G05A/G05B/G05B-R1 work and the Owner-approved
[product boundary](../product/owner-thesis.md). Historical receipts remain
immutable evidence; this roadmap is the current planning view.

See [current train status](../train/current-status.md). No further product
implementation is authorized by this documentation update. `G05C_STARTED=false`
and `G06_STARTED=false`.

`VISIBLE_INCREMENT_RULE=true`.

```text
G03 -> G04 -> G04A (formal G04 + pre-development audit)
               -> Station A ready -> Owner resume
G05 local real Codex
 -> G05A Owner UX foundation
 -> G05B safe local operation
 -> G05B-R1 persistent-proxy correction
 -> G05C Native Agent Control Parity
 -> G06 Tencent Hub / remote phone alpha.1
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
| G05C | Accepted G05B-R1 plus a future explicit G05C authorization | **Native Agent Control Parity only:** Workspace targeting, dynamic model/reasoning discovery, permission presets including YOLO, effective permission, native Codex tool activity, approval, interrupt, steer, basic activity projection, and simple side-panel collapse. No Tencent/mobile/embedded-terminal/IDE scope. | Defined by the future authorized G05C Goal |
| G06 | Accepted and personally dogfooded G05C plus separate Owner authorization and Tencent deployment admission | Project the already-proven control surface to a secure real phone/browser session through Tencent Hub + WebUI and authenticated outbound Edge WSS; add mobile UI, Owner auth, reconnect and needs-attention behavior. | `PASS_M1_REMOTE_MOBILE_MVP`; `v0.1-alpha.1` |
| G07 | G06; ZenBook and O2b/O4b | Real turns on both selected Hosts, exact identity on reconnect, viewer/controller/takeover. | `PASS_M2_MULTI_HOST` |
| G08 | G07; D1a when recovery/backup first used | Complete durable session/history, journals/cursors/checkpoints and restart/loss reconciliation. | `PASS_M3_DURABLE_SESSION` |
| G09 | G08; qualified candidate evidence and explicit target confirmation if activating | Actual migration or visibly honest `NO_QUALIFIED_TARGET`. | `PASS_M4_PROVIDER_MIGRATION` |
| G10 | G09; D1b and all remaining release gates | Hardened two-host/mobile Owner dogfood, storage/security/backup/update/long history. | `PASS_V0_1_RELEASE_ACCEPTED` |

## Product-boundary constraints

FleetSplice is a control plane for agents in an existing development
environment, not a replacement ADE. The following rules constrain sequencing:

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
- Mobile UI is first implemented and validated in G06 against the real remote
  topology, not prebuilt as a miniature desktop ADE during G05C.
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
default.

Remote enrollment/auth, ZenBook, full history, ACP, Admin/WSL, TUI, provider
migration, generic helper breadth, AuthorityAnchor or G10 policy cannot become
new G05C prerequisites unless a concrete native-control requirement proves it
unavoidable.

G05C and G06 remain serial visible increments. After G10/Station B, the later
[full train](../roadmap/full-development-train.md) remains separately gated.
