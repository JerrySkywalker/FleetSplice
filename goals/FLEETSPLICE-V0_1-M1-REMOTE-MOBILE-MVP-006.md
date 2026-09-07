# FLEETSPLICE-V0_1-M1-REMOTE-MOBILE-MVP-006

## Objective

G06 — REMOTE MOBILE MVP, first product/dogfood milestone, v0.1-alpha.1.
G06_TARGET=PHONE_TENCENT_HUB_SKYFORGE_REAL_CODEX.
VISIBLE_INCREMENT_RULE=true.

```text
Xiaomi Fold / ordinary real remote browser
 -> HTTPS -> Tencent Cloud Beijing Hub + WebUI + durable Hub state
 <- authenticated outbound WSS HCP <- SKYFORGE-01 windows-user Edge
 -> native Codex app-server (behind Edge)
```

## Admission and scope

Require G05 PASS, both accepted architecture citations and O2a/O3/O4a first-use
decisions from the [contract](../docs/v0.1/acceptance-contract.md).
Admit the exact Tencent instance/origin/OS principal/data path, deployment
changes and Owner-attended enrollment/browser recovery before live work.
[Deployment design](../docs/v0.1/tencent-mobile-deployment.md) is normative.

Use cloud Hub + WebUI, one semantic HCP, no separate FleetSplice Relay.
Explicitly quiesce and retire the local Hub's active authority before cloud
enrollment; no dual Hub or automatic reuse of old grants/queued effects.
No phone-to-SKYFORGE listening port; provider credentials remain local.

Minimum product: secure browser login, SKYFORGE/Workspace visibility,
LogicalSession create/open, real prompt/stream, Allow Once and Deny on harmless
approvals, exact-turn interrupt, basic authenticated reconnect/resume and
visible Host/Environment/Agent/turn/controller state. Keep the G05 kernel.
A fresh client is viewer until acquiring an unowned lane with Edge fencing;
richer active-controller takeover follows in G07.

## Acceptance

Execute every row of the
[remote mobile acceptance contract](../docs/v0.1/remote-mobile-acceptance.md).
A real phone/mobile-network path or equivalent actual remote browser is required
until Xiaomi Fold arrives. A mock, loopback, LAN-only or responsive emulator
cannot prove this milestone. Follow with Owner phone dogfood when available;
record pending device honestly. Routine use must work away from the computer.

Qualify authentication/recovery, strict TLS/identity, stale-generation rejection,
harmless approval/interrupt response-loss behavior, bounded output replay and
cold-start admission. Full durable server/native recovery is G08; G06 still
fails closed on restart and never resurrects authority.

ZenBook, ACP, Admin/WSL, TUI, migration, full history and G10 retention/update
policy do not block G06. Unavailable required Tencent/remote path returns a
specific blocker rather than PASS.

Return DISPOSITION=PASS_M1_REMOTE_MOBILE_MVP and RELEASE=v0.1-alpha.1 only with
real remote evidence. No v0.1 hardened-release claim is made here.
