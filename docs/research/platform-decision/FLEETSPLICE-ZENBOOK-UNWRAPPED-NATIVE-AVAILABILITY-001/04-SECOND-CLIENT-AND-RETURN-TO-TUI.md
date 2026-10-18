# R03 — One authorized native ACK; visible return pending

Continuation: `20261018-r03-authorized-ack`, same Goal.

Status: **ONE_EFFECT_NATIVE_VERIFIED; OWNER_VISIBLE_ACK_PENDING**.

## Exact admission and fresh gates

The Owner explicitly authorized the previously proposed one ACK-only turn for
the exact disposable thread T18, through existing daemon 33120. This is separate
from the earlier ID clarification and read-only UI-return confirmation.
Authorization is recorded privately in OWNER-AUTHORIZATION.json.

Before dispatch, fresh OS and protocol checks confirmed TUI 18004 and daemon
33120 with unchanged creation times, same-user ownership/hash, kernel socket
peer PID 33120, exact T18/workspace, loaded membership and idle/direct-input
eligibility. The latest prior turn was completed; no active turn was steered.
The native turn path resolves the same existing loaded handle, with no new
server/Writer or thread create/resume.

A **create-new, write-through ledger** was flushed before send. Its existence
blocks replay across later continuations. Remaining authorized effects: **0**.
Only this approved prompt was submitted:

> Reply exactly FS_NATIVE_20261018_ACK_01. Do not call tools, run commands, read or write files, change settings, or start additional turns.

No permission, sandbox, directory, environment, model or other settings override
was sent. No OS approval, install or daemon lifecycle operation was invoked.

## Native effect receipt — 21:53:02–21:53:08 +08:00

| Proof | Observation |
| --- | --- |
| Mutating submission | Exactly one turn/start, request/response ID 3100 |
| Accepted native Turn ID | Different from prior completed turn; exact value private |
| Turn-ID SHA-256 | `BB94D3E1610E78EE8CD6ED267CC685A003BC20E0F06A1EADBD0AF9DE6062BE72` |
| Completion | Exact native turn: inProgress → completed; completion read response 3204 |
| Reported native duration | 5,633 ms |
| Exact-turn items | Response 3300; full page, no further cursor |
| Item counts | userMessage=1, agentMessage=1; zero tool/unknown items |
| Input/output | Approved prompt exactly once; exact `FS_NATIVE_20261018_ACK_01` once |
| Correlated notifications | Two thread/status/changed notifications for T18 |
| Post-effect OS identity | TUI 18004 and daemon 33120 retain original creation times |

The native receipt, current turn identity, exact-turn complete items page and
prompt/ACK equality establish the single admitted effect. A caller message ID
was recorded in the local ledger; it is not claimed as idempotency protection or
as an echoed native item ID. No effect was retried.

The observer sent a close output and disposed only its own connection without
error. A full peer close handshake was not tested. The older read-only helper's
close limitation remains historical; neither operation shut down the daemon/TUI.

## Remaining visible-return gate

The Owner previously confirmed same-ID interactive return **after the read-only
observer**. A new post-effect request asks the Owner to view the ACK in the
**same original Console B**, confirm unchanged Native Thread and interactivity,
without any new prompt, exit, restart or resume. That confirmation is pending
at this cut; the earlier confirmation cannot substitute for it.

Native effects executed: **1**. Submission attempts: **1**. Remaining: **0**.
Until post-effect visible acknowledgement is confirmed, no
SAME_TUI_REMOTE_EFFECT / SHARED_NATIVE_AVAILABLE claim is made.
