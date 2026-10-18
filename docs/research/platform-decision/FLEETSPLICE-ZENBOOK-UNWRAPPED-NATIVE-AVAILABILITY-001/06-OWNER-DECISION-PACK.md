# Owner decision pack — Exact native read verified

GOAL_ID: `FLEETSPLICE-ZENBOOK-UNWRAPPED-NATIVE-AVAILABILITY-001`

Continuation: `20261018-r02-thread-verification`, Asia/Shanghai.

DISPOSITION: **STOP_FOR_OWNER_NATIVE_AVAILABILITY_REVIEW**

NATIVE_RESULT: **READ_ONLY_PROOF_ONLY**

## Purpose, provenance and unchanged boundaries

Can an ordinary `codex --yolo` in the Owner's Windows Terminal be adopted later
by another client while preserving the original TUI, Native Thread and native
Writer? Replacing/resuming the TUI or launching a different native runtime is a
different workflow.

This remains the same Goal and [Draft PR #20](https://github.com/JerrySkywalker/FleetSplice/pull/20),
branch `docs/fs-zenbook-unwrapped-native-availability-20261015`, based on
`train/pre-gate-s-development-001@ee98a6282c7733ca1658547022ab55c3b61c0e1f`.
The freshly verified continuation starting head was
`9638ba3936e5e9740b10d44aea9811171c462f44`.
Exact final publication SHA is in the local receipt and PR history.
The same isolated worktree was reused; canonical main and historical dirty
worktree remain preserved. No new Goal, feature, large CI, merge or route is admitted.

The driver is Desktop Codex **local** on ZENBOOKS14, replacing planned Console A
only. Desktop processes/server/thread remain excluded as Console B.

## What is now proved

The Owner clarified that the earlier UUID is the **Native Thread ID**, not a
shell PID. The exact value stays private; public name **T18** has SHA-256
`243106043D8B029720F5E075B9AB7465C03EFE8E17073A98EE3A935038BA6D76`.

At 20:48:56 +08:00 a bounded independent observer connected to the verified
official same-user AF_UNIX endpoint. Windows' native peer-PID query returned
**33120**, matching the current official daemon PID record and OS creation time
**20:32:11.867961 +08:00**, version 0.163.0.

Official initialize response 2001, exact metadata response 2002 and loaded-list
response 2003 proved **that exact T18** is loaded and idle in daemon 33120, matches
the disposable workspace and is direct-input-eligible. No turns were included;
returned turn count was zero. No transcript, unrelated thread ID or private
native session-file path was retained.

TUI candidate **18004**, created **20:28:47.239692**, and daemon **33120** remained
alive with unchanged creation times after observer disconnect. The Owner then
confirmed the **original Console B remained interactive with the same Thread ID**.
Thread creation is **20:28:48**, within one second of the candidate startup.
This corroborates PID/thread association; the protocol does not directly return
TUI PID 18004. Stored metadata source=vscode and CLI version=0.162.1 are not
rewritten as codex-tui/current 0.163.0 binary identity.

The earlier daemon 18768/0.162.1 → 33120/0.163.0 change remains historical.
These are fresh current-incarnation reads, not carried-over proof.
Research issued no daemon lifecycle, install, config or auth mutation.

## Writer, transport and acceptance limits

The observer sent only initialize/initialized, metadata read and one bounded
loaded-list query. It created/resumed no thread, started no server, acquired no
native Writer and sent **zero effects**. Live status is loaded/idle and
canAcceptDirectInput=true. Version-matched source supports dispatch to the same
existing loaded runtime; it does not imply an observed OS lock-handle owner or a
successful control effect. No native lock or conflict was probed or bypassed.

Two transport attempts failed before initialize because of the helper's
returned-length assumption. Native WSAIoctl then returned success and correct PID
with bytesReturned=0. The successful third connection made the only thread read.
No effect was replayed. The graceful close attempt threw, so only the observer
was aborted/disposed. Precise close cause was not recorded; an incorrect timeout
label is corrected in a separate private receipt. This is not a clean close test.

| Phase | Actual status |
| --- | --- |
| R00 | COMPLETE; retained/revalidated version/runtime history |
| R01 | Owner target clarified, OS candidate continuity measured, UI return confirmed; direct PID/thread field absent |
| R02 | Endpoint/server/exact loaded thread verified for read; Writer effect untested |
| R03 | Independent read completed; effect NOT_RUN |
| R04 | READ_ONLY_PROOF_ONLY classification |
| R05 | Current reports/manifest/README, checks and same Draft PR; exact publication in local receipt |

Physical test=true, OWNER_REPORTED; model/native effects=0; phone test=false.
No SHARED_NATIVE_AVAILABLE, SAME_TUI_REMOTE_EFFECT or full remote P0 claim.

## One review decision: authorize one harmless effect or retain read-only proof

The only suggested next step is an **Owner decision**, not automatic dispatch:
whether to separately authorize one ACK-only turn on **T18**, through daemon
33120's existing loaded runtime. Proposed input:

> Reply exactly FS_NATIVE_20261018_ACK_01. Do not call tools, run commands, read or write files, change settings, or start additional turns.

Before any admitted dispatch, revalidate server/TUI incarnations, exact thread,
idle/direct-input state and existing-runtime route. Any changed identity,
Writer conflict or ambiguous authority means stop. Do not create/resume a thread
or change permission/settings to make it work. Submit at most once; no retry
after uncertain acceptance. Collect only the test receipt/turn ID/ACK and obtain
Owner confirmation in the same original TUI. A no-tools prompt is an instruction,
not evidence of tool-free execution; receipt/tool-event checks must verify it.

The Owner's Thread-ID clarification and UI-return confirmation authorize neither
this turn nor any other native effect. No such authorization has been received.
Declining retains READ_ONLY_PROOF_ONLY without implying native control failure.

## Consequence for the product route and custody

[PR #19's pinned decision](https://github.com/JerrySkywalker/FleetSplice/blob/25f2bae8b39eb6222c7d2e0b8237227f53504acc/docs/research/platform-decision/FLEETSPLICE-PASEO-BUILD-OR-REUSE-DECISION-001/08-OWNER-DECISION-PACK.md)
remains INSUFFICIENT_EVIDENCE. A same-host read does not choose FS or a Paseo
provider/core change, establish bounded complete history/G08, or qualify phone
and multi-Host behavior. No implementation or merge follows even from a later
local effect proof without Owner route review.

Private evidence/helper source is under this Goal's designated artifact root:
`evidence/20261018-r02-thread-verification/` and
`scratch/20261018-r02-thread-verification/`. The prior receipt/handoff were
archived there; root FINAL-RECEIPT.json and OWNER-HANDOFF.md track current
publication and the pending Owner decision.

[README](README.md) is the current entry.
[01](01-PREFLIGHT-AND-RUNTIME-IDENTITY.md) retains the checkpoints;
[02](02-UNWRAPPED-TUI-OBSERVATION.md) separates UI/OS/native identity;
[03](03-SHARED-ENDPOINT-AND-WRITER.md) qualifies endpoint/thread and Writer limits;
[04](04-SECOND-CLIENT-AND-RETURN-TO-TUI.md) records read/close/return evidence;
[05](05-QUALIFICATION-AND-ROUTE-IMPLICATION.md) gives the claim boundaries.
