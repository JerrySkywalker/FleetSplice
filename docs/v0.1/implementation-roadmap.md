# v0.1 Implementation Roadmap

This is the prospective sequence under the
[G04A amendment](../architecture/amendments/g04a-visible-mvp-simplification.md)
and [current status](../train/G04A-status.md), not permission to begin G05.
The accepted G03 object and additive G04A citation are defined in the
[contract](acceptance-contract.md).

`VISIBLE_INCREMENT_RULE=true`.

```text
G03 -> G04 -> G04A (formal G04 + pre-development audit)
               -> Station A ready -> STOP / OWNER REVIEW
               -> explicit Owner resume and Station A admission
G05 local real Codex
 -> G06 Tencent Hub / remote mobile alpha.1
 -> G07 two-host mobile control
 -> G08 durable session / honest recovery
 -> G09 explicit migration or NO_QUALIFIED_TARGET
 -> G10 hardened two-host/mobile release -> Station B
```

## First-use dependency map

| Goal | Prior dependencies | First-use work and visible gate | Passing token |
| --- | --- | --- | --- |
| G05 | G04 formal + G04A PASS, accepted citations, Station A requirements, Owner resume and L1 | Minimal W1/W5 local SKYFORGE real Codex, closed contracts, Hub/Edge journals, exact identities/fences and loopback HCP. | PASS_M0_WALKING_SKELETON |
| G06 | G05; O2a/O3/O4a and Tencent deployment admission | Secure remote phone/browser session, prompt/stream, harmless approval/interrupt, basic reconnect/state. | PASS_M1_REMOTE_MOBILE_MVP; v0.1-alpha.1 |
| G07 | G06; ZenBook and O2b/O4b | Real turns on both selected Hosts, exact identity on reconnect, viewer/controller/takeover. | PASS_M2_MULTI_HOST |
| G08 | G07; D1a when recovery/backup first used | Complete durable session/history, journals/cursors/checkpoints and restart/loss reconciliation. | PASS_M3_DURABLE_SESSION |
| G09 | G08; qualified candidate evidence and explicit target confirmation if activating | Actual migration or visibly honest NO_QUALIFIED_TARGET. | PASS_M4_PROVIDER_MIGRATION |
| G10 | G09; D1b and all remaining release gates | Hardened two-host/mobile Owner dogfood, storage/security/backup/update/long history. | PASS_V0_1_RELEASE_ACCEPTED |

## Sequencing constraints

G05 already includes minimum safety durability, dedupe, native identity and
ambiguity. G08 expands usable durable recovery; it does not first introduce
the protection against duplicate native effects. Closed producers and contracts
settle before consumers, within one visible Goal rather than several
infrastructure-only Goals.

HCP is the same semantic protocol in G05 loopback and G06 authenticated remote
WSS. G06 uses Tencent Hub + WebUI; no separate Relay service/protocol and no
remote phone-to-Edge listening port. The local-to-cloud Hub transition uses the
explicit quiesce/new-incarnation procedure in the deployment design.

Remote enrollment/auth, ZenBook, full history, ACP, Admin/WSL, TUI, provider
migration, generic helper breadth, AuthorityAnchor or G10 policy cannot block
G05. A real unavailable phone permits the documented remote-browser substitute
at G06, followed by phone dogfood; unavailable ZenBook blocks G07 only.

G05-G10 are serial. After G10/Station B, the later
[full train](../roadmap/full-development-train.md) remains separately gated.
Every major later implementation Goal inherits the visible-increment rule.
No later train work executes under this G04A instruction.
