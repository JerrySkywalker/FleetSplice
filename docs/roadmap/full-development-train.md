# FleetSplice Full Development Train Roadmap

Current bounded execution is the Owner-approved
[portable-host runtime train](../../goals/FLEETSPLICE-PORTABLE-HOST-RUNTIME-TRAIN-001.md);
[current status](../train/current-status.md) governs its authorization.
G06 predeploy local work is complete; live G06 remains unaccepted. The historical
[root train](../../goals/FLEETSPLICE-FULL-DEVELOPMENT-TRAIN-001.md)
and [manifest](../../goals/train-manifest.v1.json) retain the pre-insertion
sequence; the active Owner-approved insertion is G05 -> G05A -> G06 below.

`VISIBLE_INCREMENT_RULE=true`. Every major implementation Goal ends in
Owner-operable, observable behavior. Infrastructure-only chains require a
concrete unavoidable dependency and shortest visible delivery path.

| Phase | Goal | Owner-visible capability |
| --- | --- | --- |
| Pre-development | G01-G04 + G04A | Accepted architecture plus amended implementation contract; independent audit; stop before product. |
| Local walking skeleton | G05 | SKYFORGE local browser real Codex create/continue/prompt/stream, minimal W1/W5. |
| Owner UX foundation | G05A | zh-CN/en-US, system/light/dark/OLED appearance and compact preferences on the same real local Codex path. |
| Remote mobile MVP | G06 | Phone/real remote browser -> Tencent Hub + WebUI -> outbound WSS ZenBook14 Edge -> real Codex, approval/interrupt/reconnect; v0.1-alpha.1. |
| Multi-host | G07 | Select/operate ZenBook14 and a separately qualified second Host, exact generations and explicit controller takeover. |
| Durable recovery | G08 | Return after close/restart/disconnect to the same honest session/history/ambiguity. |
| Provider migration | G09 | Qualified explicit migration or visible NO_QUALIFIED_TARGET. |
| v0.1 release | G10 | Hardened two-host/mobile Owner dogfood, storage/security/backup/update/long history. |
| Second Agent | G11 | Real ACP Agent through existing UI. |
| Environment/UX/TUI | G12-G14 | Explicit Admin/WSL control, Workspace panels and remote TUI. |
| v0.2 parity | G15 | Actual WebUI/TUI parity dogfood. |
| Self-hosting | G16 | Observe stable N develop/canary N+1 with external activation and rollback. |

## Critical path and deployment

G05 -> G05A -> G06-G10 are serial visible slices. One HCP semantic protocol uses same-host
loopback in G05 and authenticated Edge-initiated WSS from G06.
Tencent hosts Hub + WebUI and durable Hub state. Provider credentials, Codex and
Workspace truth stays at ZenBook14 for first live G06. No separate Relay or public Edge port.

G05 does not depend on mobile/remote policy, second Host, ACP, Admin/WSL, TUI,
migration, full history, external AuthorityAnchor, renewable permits or G10
lifecycle decisions. The [first-use ledger](../v0.1/acceptance-contract.md#owner-decision-ledger)
and [milestone gates](../v0.1/implementation-roadmap.md) define real dependencies.
[Mobile acceptance](../v0.1/remote-mobile-acceptance.md) requires an actual remote
path at G06 and Owner phone dogfood when available.

## Stations and stop

Station A readiness follows formal G04 + G04A exact-head PASS; it is not a main
merge or G05 execution. G04A stops for Owner review/resume. Station B follows
G10's two-host/mobile release acceptance; Station C follows G16.

G01-G11 stay sequential. Any later parallel G12-G14 phases need disjoint writer
ownership and separate admission. No architecture research Wave 03, product
scaffolding, dependencies, CI or deployment occurs during G04A.

Stop for failed identity/lineage admission, unexpected mutation, uncontained
effect ambiguity, authority/security defects or an unavailable required live
gate. Report unrun evidence honestly. Architecture counterexamples require
OWNER_ARCHITECTURE_DECISION_REQUIRED; three unsuccessful G04A correction/review
cycles require BLOCKED_G04A_OWNER_REVIEW.
