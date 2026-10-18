# Owner decision pack — Authorized native ACK, UI confirmation pending

GOAL_ID: `FLEETSPLICE-ZENBOOK-UNWRAPPED-NATIVE-AVAILABILITY-001`

Continuation: `20261018-r03-authorized-ack`, Asia/Shanghai.

DISPOSITION: **STOP_FOR_OWNER_NATIVE_AVAILABILITY_REVIEW**

NATIVE_RESULT: **READ_ONLY_PROOF_ONLY**

## Decision context and authority

This same Goal asks whether ordinary `codex --yolo`, physically launched in the
Owner's Windows Terminal, can be controlled through an official shared endpoint
while preserving the original TUI process, Native Thread and native Writer.
A new/resumed TUI or another native runtime is not equivalent.

[Draft PR #20](https://github.com/JerrySkywalker/FleetSplice/pull/20) uses
`docs/fs-zenbook-unwrapped-native-availability-20261015` against
`train/pre-gate-s-development-001@ee98a6282c7733ca1658547022ab55c3b61c0e1f`.
This continuation freshly checked starting head
`d6e0633ca1c58cf2f15eaf4d7bfcc682f36332fd`. The same isolated worktree was
reused. Final publication SHA belongs in the private receipt and PR history.
No new Goal, feature, main change, large CI, route selection or merge is admitted.

The research driver remains ChatGPT desktop Codex **local** on ZENBOOKS14,
replacing planned Console A only. Desktop PID/server/thread remain excluded.

## Evidence established before the effect

The Owner clarified the disposable Native Thread ID. Public alias **T18** has
SHA-256 `243106043D8B029720F5E075B9AB7465C03EFE8E17073A98EE3A935038BA6D76`;
the exact UUID remains private. Official read/list and Windows kernel peer-PID
query bound T18 to the exact test workspace and daemon **33120**, created
**20:32:11.867961 +08:00**, version 0.163.0.

The measured Windows Terminal parent chain leads to TUI candidate **18004**,
created **20:28:47.239692**. Thread creation is **20:28:48**, matching workspace
and startup time. The Owner confirmed the original TUI remained interactive
with the same Thread ID after the earlier read-only observer disconnected.
PID/thread association is corroborated by these sources, not a native PID field.
Stored source=vscode / CLI 0.162.1 is preserved separately from the current
0.163.0 executable. The earlier daemon replacement is historical, not reused proof.

## One explicit authorization and one completed native effect

The Owner separately selected authorization for the exact-thread ACK proposal.
Fresh OS/ACL/peer-PID and native loaded/idle/direct-input gates passed.
The previous turn was completed; the new accepted Turn ID differed from it.
The supported route submits to the existing loaded handle; no new runtime,
thread start/resume, second Writer, lock operation or settings override occurred.

A create-new, write-through one-effect ledger was flushed before submission.
Exactly one turn/start was sent, response ID **3100**.
At **21:53:02–21:53:08 +08:00**, the exact native turn completed. A completion
read (**3204**) and exact-turn full items page (**3300**) proved:

- the approved input appears exactly once;
- output is exactly `FS_NATIVE_20261018_ACK_01`, once;
- items are one userMessage and one agentMessage, with zero tool/unknown items;
- no further item page exists; the reported native duration is 5,633 ms.

Native Turn-ID digest:
`BB94D3E1610E78EE8CD6ED267CC685A003BC20E0F06A1EADBD0AF9DE6062BE72`.
Exact IDs, authorization and receipts remain private. The caller message ID is
not claimed as an idempotency key or as an echoed native item ID.

The observer closed its output and disposed its own connection without error;
a full peer close handshake was not tested. OS snapshots after disconnect
retained both original recorded process creation times. No private transcript,
credential, installation, daemon lifecycle or production operation was used.

## Why no final local sharing PASS yet

The Owner has not yet confirmed this **new native ACK is visible in the same
original Console B**, with unchanged Native Thread and continued interactivity.
The earlier read-only UI confirmation cannot stand in for post-effect return.
Thus READ_ONLY_PROOF_ONLY is retained under the contract's missing-same-TUI-control
case, **despite one executed native effect**. It is not a claim that only reads
were performed.

Direct OS lock-handle ownership and a native PID-to-thread field remain
unobserved. Existing-runtime cooperation now has measured turn evidence; no
competing Writer was created or bypassed. The visible-return gate is the
remaining acceptance question.

| Phase | Actual status |
| --- | --- |
| R00 | COMPLETE; runtime history retained and fresh identities revalidated |
| R01 | Thread Owner-confirmed, candidate OS continuity measured; binding corroborated |
| R02 | Official exact endpoint/thread verified; cooperative existing-runtime turn verified |
| R03 | One admitted native effect completed; post-effect visible ACK pending |
| R04 | Classification pending final visible-return proof; no sharing PASS |
| R05 | Reports/checks/receipts and same Draft PR; publication SHA/outcome in local receipt |

Physical test=true; authenticated native effects=**1**; submission attempts=**1**;
remaining authorized effects=**0**; phone test=false. Never rerun the effect helper.

## One next step and product-route limit

**Owner only views the existing original Console B and confirms the ACK, same
Thread ID and interactivity.** No prompt, exit, restart or resume is needed.
No second effect is authorized. If the ACK is absent or identity/interactivity
differs, retain an honest restricted/ambiguous result and do not replay.

[PR #19's pinned decision](https://github.com/JerrySkywalker/FleetSplice/blob/25f2bae8b39eb6222c7d2e0b8237227f53504acc/docs/research/platform-decision/FLEETSPLICE-PASEO-BUILD-OR-REUSE-DECISION-001/08-OWNER-DECISION-PACK.md)
remains INSUFFICIENT_EVIDENCE for the FS/Paseo product route. Even a later
SHARED_NATIVE_AVAILABLE result is a local prerequisite, not phone P0, multi-Host,
G08 complete bounded history, performance or maintenance-cost qualification.
Any route comparison or implementation requires separate Owner review/admission.
No automatic continuation of FS or modification of Paseo follows.

## Custody for independent continuation

All raw evidence and helper/source stay in this Goal's designated artifact root,
under `evidence/20261018-r03-authorized-ack/` and
`scratch/20261018-r03-authorized-ack/`.
Root ONE-NATIVE-EFFECT-ATTEMPT.json is the durable no-replay barrier;
ONE-NATIVE-EFFECT-RESULT.json and FINAL-RECEIPT.json record the completed effect;
OWNER-HANDOFF.md records current publication and visible-return status.
The prior receipt/handoff were archived first. Canonical main and the older dirty
research worktree remain preserved.

[README](README.md) is the current entry.
[01](01-PREFLIGHT-AND-RUNTIME-IDENTITY.md) retains preflight history;
[02](02-UNWRAPPED-TUI-OBSERVATION.md) separates native/OS/Owner identity;
[03](03-SHARED-ENDPOINT-AND-WRITER.md) records endpoint and Writer evidence;
[04](04-SECOND-CLIENT-AND-RETURN-TO-TUI.md) records admission/effect/return;
[05](05-QUALIFICATION-AND-ROUTE-IMPLICATION.md) gives acceptance limits.
