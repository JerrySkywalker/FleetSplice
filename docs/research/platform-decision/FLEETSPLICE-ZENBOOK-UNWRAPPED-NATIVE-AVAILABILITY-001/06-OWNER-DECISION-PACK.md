# Owner decision pack — Local shared-native prerequisite proved

GOAL_ID: `FLEETSPLICE-ZENBOOK-UNWRAPPED-NATIVE-AVAILABILITY-001`

Final continuation: `20261019-owner-native-return`, Asia/Shanghai.

DISPOSITION: **STOP_FOR_OWNER_NATIVE_AVAILABILITY_REVIEW**

NATIVE_RESULT: **SHARED_NATIVE_AVAILABLE** — bounded local qualification only.

## Question, placement and authority

This Goal asks whether ordinary unwrapped `codex --yolo`, physically launched
by the Owner in a separate normal-user Windows Terminal, exposes an official
shared endpoint that permits another client to affect the same native thread
while preserving the original interactive TUI process and native Writer.
The answer for this measured ZenBook run is **yes**, with the evidence limits below.
A new/resumed TUI or another independent native runtime was not used.

The research driver is ChatGPT desktop Codex **local** on ZENBOOKS14. It replaces
planned Console A CLI only; Desktop's PID/server/thread never counts as Console B.
All original PID/creation-time, endpoint, Writer and same-thread return gates stay.

[Draft PR #20](https://github.com/JerrySkywalker/FleetSplice/pull/20), branch
`docs/fs-zenbook-unwrapped-native-availability-20261015`, targets
`train/pre-gate-s-development-001@ee98a6282c7733ca1658547022ab55c3b61c0e1f`.
Final closeout freshly checked starting head
`2f1341bcd7889845fe25b4f49f5bf55522e2792c`, OPEN Draft/unmerged. The isolated
study worktree is reused; publication SHA/outcome is in FINAL-RECEIPT.json and
the PR history. Only this study's Markdown/JSON changes are admitted.

## Why this resolves one comparison gap

[PR #19's pinned decision pack](https://github.com/JerrySkywalker/FleetSplice/blob/25f2bae8b39eb6222c7d2e0b8237227f53504acc/docs/research/platform-decision/FLEETSPLICE-PASEO-BUILD-OR-REUSE-DECISION-001/08-OWNER-DECISION-PACK.md)
ended INSUFFICIENT_EVIDENCE. That study found vanilla Paseo 0.11.2's separate
stdio Codex lifecycle and unbounded in-memory long-history store insufficient
for the target; a provider plugin cannot supply a missing upstream Writer endpoint
or replace core history storage by itself. Existing FS ZenBook evidence used
supervised startup, which did not establish ordinary unwrapped CLI adoption.
Those are pinned prior findings, not new tests of current Paseo or FS here.

This Goal closes the **local upstream/native availability** gap only. It neither
selects FS nor establishes that Paseo B2 is implemented or meets all requirements.

## Independent evidence chain

The Owner launched exactly `codex --yolo` in the disposable directory, without
elevation, and later clarified the supplied UUID was the Native Thread ID rather
than shell PID. Measured Terminal → PowerShell → Node ancestry leads to original
TUI **18004**, created **2026-10-18 20:28:47.239692 +08:00**. The executable is
0.163.0, SHA-256
`2692C8C7BB2CF8B0AEFE638741FC90236F4B824C59578CE84994F9DE58200993`.

Current daemon **33120**, created **2026-10-18 20:32:11.867961 +08:00**, is 0.163.0.
Its official PID record matches OS creation time. Canonical AF_UNIX socket
ownership/ACL matches the ordinary user; supported Windows kernel peer-PID
query returned 33120 before protocol requests. Official initialize and exact
thread read/loaded-list prove current-incarnation membership and test workspace.

Public thread alias **T18** has SHA-256
`243106043D8B029720F5E075B9AB7465C03EFE8E17073A98EE3A935038BA6D76`.
Exact UUIDs, endpoint paths and native receipts stay private. Native thread
creation is 20:28:48, within one second of TUI startup. Stored source=vscode /
CLI 0.162.1 is preserved separately from current binary identity, not rewritten
as codex-tui. The earlier daemon replacement and historical R02 are not reused
as current membership/control proof.

## One explicit authorization, one native turn, visible return

After read-only verification and its own Owner same-thread return confirmation,
the Owner separately authorized exactly one ACK-only turn for T18. Fresh
OS/ACL/peer-PID, loaded/idle/direct-input and prior-completed-turn gates passed.
The supported path uses the existing loaded handle; it does not start/resume
a thread, launch a competing Writer/server, or change permissions/settings.

A create-new write-through ledger was flushed before the sole turn/start.
Response **3100** accepted a new native Turn ID. At **2026-10-18 21:53:02–21:53:08
+08:00**, completion read **3204** and complete exact-turn items page **3300** proved:

- approved prompt exactly once and exact `FS_NATIVE_20261018_ACK_01` once;
- one userMessage and one agentMessage, zero tool/unknown items, no further page;
- the accepted native Turn ID completed; reported duration 5,633 ms.

Native Turn-ID SHA-256:
`BB94D3E1610E78EE8CD6ED267CC685A003BC20E0F06A1EADBD0AF9DE6062BE72`.
The caller message ID is not native idempotency or an echoed native item ID.
Correlation uses the native accepted/completed Turn ID and exact-turn receipt,
not marker equality alone. No uncertain effect was retried.

The observer closed output and disposed its own connection without error;
a full peer close handshake was not tested. OS snapshots retained both process
incarnations. In the final chat reply, recorded **October 19**, the Owner confirmed
the **original TUI displays the ACK, same Thread ID, still interactive**. This is
post-effect evidence, distinct from the earlier read-only report. Original reply
time is not exposed; the date is the evidence-recording date.

At **2026-10-19 00:24:30 +08:00**, a final OS-only recheck retained exact process
creation times, same-user owners and executable hashes. The sealed native receipt
hash and single-attempt ledger were checked unchanged. No native request or effect
was sent in this final closeout. The combined native/OS/Owner evidence meets
the local SAME_TUI_REMOTE_EFFECT contract.

## Acceptance status and limits

| Phase | Actual final status |
| --- | --- |
| R00 | COMPLETE; read-only runtime/principal/command preflight and identity revalidation |
| R01 | COMPLETE; Owner physical launch and original-TUI binding by combined evidence |
| R02 | COMPLETE; current endpoint/thread and cooperative existing-runtime Writer verified |
| R03 | COMPLETE; one authorized native ACK plus post-effect original-TUI visible return |
| R04 | COMPLETE; SHARED_NATIVE_AVAILABLE, local scope only |
| R05 | COMPLETE; six reports, private receipts/handoff, checks and same Draft PR publication recorded locally |

Physical test=true; native effects=**1**; submission attempts=**1**; remaining
authorized effects=**0**; replay=false; phone test=false. Do not rerun the effect
helper. No product code, large CI, G08, Gate S, new Goal, merge or route admission.

Evidence confidence is MEASURED_LOCAL for OS/native receipts, OWNER_REPORTED for
physical launch/non-elevation and visible return. The PID/thread link is
corroborated by ancestry, exact workspace/time, Owner identity and visible ACK;
the protocol supplies no direct TUI PID field. Direct OS lock-handle custody
is UNOBSERVED; actual cooperation on the loaded runtime is measured. No Writer
conflict stress test or full peer close handshake was performed. These are
explicit limits of the proof, not missing requirements silently marked measured.

There is no remaining blocker to the bounded local prerequisite. Real phone
authentication/transport, multi-Host behavior, G08 bounded complete history,
performance and comparative maintenance cost remain unqualified. A local PASS
does not establish full remote phone P0 or a product route.

## One decision requested from the Owner

Review this pack and decide whether to separately admit **one small comparison
of Paseo B2 external-native provider vs existing FS Native Adoption on this
qualified endpoint**, as required by the receipt contract. Its narrow question
would be which integration can consume the official endpoint while preserving
identity/Writer/return semantics, and what independent history/phone gaps remain.
This recommendation grants no implementation, daemon mutation, extra effect or
G08 authority. Do not automatically continue FS or modify Paseo.

## Evidence custody and navigation

All raw evidence stays under the Goal's designated artifact root. The sealed
native receipt/authorization are in `evidence/20261018-r03-authorized-ack/`;
the final Owner reply, OS snapshot and proof check are in
`evidence/20261019-owner-native-return/`. Helpers/source are under `scratch/`.
ONE-NATIVE-EFFECT-ATTEMPT.json remains the immutable no-replay barrier;
ONE-NATIVE-EFFECT-RESULT.json records effect and final Owner visibility.
FINAL-RECEIPT.json and OWNER-HANDOFF.md identify exact final PR head and custody.
Prior receipts/handoffs are archived. Canonical main and the older dirty research
worktree remain preserved. No sensitive raw evidence is committed to public Git.

[README](README.md) is the entry; [01](01-PREFLIGHT-AND-RUNTIME-IDENTITY.md) preserves
preflight history; [02](02-UNWRAPPED-TUI-OBSERVATION.md) separates identity sources;
[03](03-SHARED-ENDPOINT-AND-WRITER.md) covers endpoint/Writer;
[04](04-SECOND-CLIENT-AND-RETURN-TO-TUI.md) covers effect/return;
[05](05-QUALIFICATION-AND-ROUTE-IMPLICATION.md) states classification and route limits.
