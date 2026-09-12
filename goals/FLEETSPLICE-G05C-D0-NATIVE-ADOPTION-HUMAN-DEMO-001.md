# G05C D0: human native adoption demo

Owner authorization: LOCAL_NATIVE_ADOPTION_DEMO_ONLY. P1/P2A/P2B accepted.
Start: branch `feat/g05c-native-adoption-demo`, HEAD
`e0a6d8f516216510639a6912635aeb1ced772ac8`, tree
`9aa6fd8da47146e47f41521797da26cdbe5302a7`; clean admission verified.

Use the official pre-running shared daemon. The Owner runs literal
`codex --yolo` in Windows Terminal in
`V:\artifacts\FleetSplice\demo-native-adoption\workspace`, completes a turn,
then discovers and attaches to that existing thread in the local WebUI.
Show existing history, continue, steer and interrupt exact active turns, then
return to the same working local TUI/thread. Human behavior is the primary gate.

The adoption adapter uses observed capabilities, never a semantic-version or
compiled hash allowlist. Record executable/version/hash, PID/creation time,
endpoint and available server incarnation evidence. Replaced identity, stale
native state or invalid Fleet controller fences fail closed without replay.
Native and managed origins remain explicit. Native control is cooperative:
at most one Fleet Web controller; the native TUI remains an external writer.
Turn interruption does not claim command/process termination.

Bounded exception to older managed-only architecture: this Goal admits the
official shared native server qualified by LA-NATIVE-DAEMON-LIVE-QUALIFICATION-003.
FleetSplice owns neither its process lifecycle nor the adopted thread creation.
No shim, TUI wrapper, Codex patch, alternate native protocol, full approval UI,
P3, G06, phone UI, Tencent or remote-network change. Managed artifact pins are
explicit follow-up debt, outside this change.

Run `npm run check`, `npm run build`, `npm test`, including focused identity,
capability downgrade, origin, controller and external-advancement regressions.
Only after human PASS: commit and push the candidate, release the coordinator
writer lease and run a fresh separate strongest available read-only review of
the exact candidate and primary evidence. Correct valid findings and repeat
checks/review. Never merge. External evidence retains acceptance and review.

Status: the visible Windows Terminal and headed browser sequence passed on
2026-09-12, using actual UI input automation. Owner personal dogfood is not
claimed. All ten steps retained the existing daemon/thread, including a normal
local TUI response after browser interrupt. The source fingerprint remained
unchanged throughout the corrected demonstration; 112 tests passed.

A later observation poll failed closed as `NATIVE_OPERATION_UNPROVABLE` after
the successful local return. The original daemon/TUI remained healthy. This
read failure is retained alongside the visible sequence result.

The first independent review of `de5306d8e72ffd2d406831cd21651fdd7d158bc5`
required correction of that observation failure and a state-acknowledgement
race. Instrumented reproduction identified native RPC -32600 with the exact
error fingerprint for `ephemeral threads do not support thread/turns/list`.
Native background candidates appeared briefly in the same Workspace. The
current discovery path excludes non-attachable native metadata before history
hydration; an already attached thread still fails closed if its contract changes.
Acknowledgement now commits only after its final read matches the displayed
token and native event generation. Fresh verification and independent review
results are retained externally; this document does not assert acceptance on
behalf of the read-only reviewer or the Owner.

Primary evidence is under
`V:\artifacts\FleetSplice\FLEETSPLICE-G05C-D0-NATIVE-ADOPTION-HUMAN-DEMO-001`:
`HUMAN-VISIBLE-DEMO-RECEIPT.json`, `corrected-live` screenshots, sanitized native
console reads, exact-thread browser receipts and sealed Edge SQLite evidence.
