# Remote mobile control acceptance

This is the G06 product/dogfood contract for `v0.1-alpha.1`.
It consumes the [Tencent Hub design](tencent-mobile-deployment.md), one
[FleetCommand/HCP contract](acceptance-contract.md), and the existing
[Fleet interaction models](../architecture/webui-model.md).

## Real path

Use Xiaomi Fold on mobile data, or an ordinary real remote browser outside the
SKYFORGE local/loopback path until the phone arrives:

`browser -> HTTPS Tencent Beijing Hub + WebUI -> authenticated outbound WSS HCP -> SKYFORGE windows-user Edge -> native Codex app-server`.

Record device/browser, actual remote network class, HTTPS origin, exact
Hub/Edge/native build and identities, selected Workspace, Fleet command/step
IDs and native session/turn evidence, with secrets and sensitive addresses
redacted where necessary. A desktop responsive emulator, mock Agent, fixture,
LAN-only or loopback round trip is insufficient for this remote claim.
If the phone is unavailable, label PHONE_OWNER_DOGFOOD=PENDING_DEVICE and
record a concrete follow-up; this does not falsify the real remote-browser PASS.

## Required Owner operation

| Step | Observable acceptance |
| --- | --- |
| Authenticate | User-verifying passkey at exact origin; no transcript before auth; expired/revoked session and cross-origin requests rejected. Attend the selected backup/recovery rehearsal. |
| Select | See SKYFORGE-01, windows-user and registered Workspace with distinct durable IDs/generations, freshness and current Agent. Select explicitly. |
| Session | Create and open a LogicalSession; see selected Lane/NativeSegment and controller/viewer state. Session identity is Fleet-owned. |
| Prompt | Submit a real harmless prompt; see real native Codex streaming/tool/assistant output and running/terminal state. Correlate command/step/native IDs. |
| Approval | Exercise both Allow Once and Deny on harmless native approval requests. Show complete target, action, privilege/Environment, offered choices and revision. Each request resolves at most once; stale/changed requests reject. |
| Interrupt | Interrupt one harmless running turn; show request pending/acknowledged separately from actual native turn termination. Lost response never causes fallback emission. |
| Reconnect | Temporarily interrupt browser/network access and reconnect to the same Hub/Edge incarnation. Resume authorized projection/output from a known cursor or show an explicit gap/resync. Lookup in-flight commandId; never resend as a new turn. |
| Control | Same authenticated client may resume within grace. A fresh browser is a viewer until it acquires an unowned lane after Edge fence acknowledgement. Active-owner rich takeover is qualified in G07. |
| Identity | Tamper with selected target/generation, stale grant/epoch or old runtime evidence; observe no-effect rejection and honest UNKNOWN/STALE state on disconnect. |
| Away-from-computer use | Owner can complete the above without a SKYFORGE port, RDP session or person at its keyboard. Initial enrollment/bootstrap may be attended; routine remote use may not depend on it. |

Basic reconnect does not claim complete server/native restart history recovery;
that visible increment is G08. G06 server/Edge restart still must fail closed and
show recovery-required rather than auto-dispatch or pretend stopped.

## Responsive invariants

Folded, unfolded and narrow layouts are renderings of the same
FleetNavigationModel, SessionHeaderModel, SessionTimelineModel,
ControlContextModel and AttentionModel. Fold/unfold or orientation change must
not recreate clientInstanceId, change controller epoch, submit a prompt, resolve
an approval, or retarget a session. A browser reload/new tab uses the ordinary
client identity/reconnect rules, never a mobile exception.

Keep timeline/composer primary; navigation, Host/Environment/Workspace/Agent,
turn state and control/attention remain accessible through drawers/tabs.
Approval detail and Allow Once / Deny remain visible and usable with the soft
keyboard and narrow viewport. No color-only critical state, unsafe rich-output
execution, accidental double submission or mobile-specific mutation API.
Use synthetic narrow/fold/keyboard/accessibility checks in addition to the real
remote path, and actual Fold dogfood when available.

## Extension and release

G07 repeats the path on both SKYFORGE and ZenBook; switching selection cannot
retarget admitted commands, and takeover fences the previous controller.
G08 repeats disconnect/restart and honest history/ambiguity recovery.
G10 requires two-host/mobile Owner dogfood, longer sessions/history and release
security/storage/lifecycle acceptance. Record any unavailable device or required
Host as a blocker/follow-up at its actual milestone; do not mark an unrun path PASS.
