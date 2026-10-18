# R02 — Exact endpoint and live thread; separate Writer limits

Continuation: `20261018-r02-thread-verification`.

Status: **ENDPOINT/THREAD_VERIFIED; one separately authorized cooperative turn VERIFIED**.

## Current incarnation and endpoint identity

The current daemon is **PID 33120**, created
**2026-10-18 20:32:11.867961 +08:00**, version 0.163.0; its official PID-record
creation FILETIME matches OS metadata. Before and after this observer, that
incarnation and TUI candidate 18004 retained their creation times.
Both executable hashes are
`2692C8C7BB2CF8B0AEFE638741FC90236F4B824C59578CE84994F9DE58200993`.

Socket owner/ACL was revalidated as the same user. The observer used only the
official canonical AF_UNIX socket, not a new listener, proxy or server.
The [Microsoft SDK peer-PID query](https://github.com/microsoft/win32metadata/blob/main/generation/WinSDK/RecompiledIdlHeaders/shared/afunix.h)
returned **success (0), peer PID 33120**. The caller-supplied expected PID was
compared with the kernel-written output before any JSON-RPC request.
The endpoint is thus bound to the independently measured daemon incarnation.

Official `initialize` returned the server identity; exact
`thread/read(includeTurns=false)` returned Owner-confirmed **T18**, and a bounded
`thread/loaded/list` page contained the same UUID, with no further page.
Only target metadata/counts were retained; unrelated IDs, previews, paths to
native session files, and transcript content were not retained.

| Target metadata | Observed value |
| --- | --- |
| ID/session ID | Exact Owner-confirmed T18 |
| Workspace | Exact disposable test directory |
| Created | 20:28:48 +08:00, one second after TUI candidate creation |
| Live status | idle |
| Loaded membership | Exact ID present in daemon 33120 |
| Direct-input capability | canAcceptDirectInput=true |
| Stored source / CLI version | vscode / 0.162.1; not substituted for current binary identity |
| Included turns | false; returned turns count 0 |

T18's exact ID is local-only; [02](02-UNWRAPPED-TUI-OBSERVATION.md) publishes its
digest. The earlier 18768/0.162.1 → 33120/0.163.0 daemon change remains historical;
**no proof is carried across that boundary**. These are fresh current-incarnation
native responses. Research performed no lifecycle/config/install change.

## Writer evidence, without promotion

The observer sent no create/resume/turn or lock operation, so it acquired no
native thread Writer. The
[read/list handlers](https://github.com/openai/codex/blob/83086188ae0614bd882818ff1aa23f3194962012/codex-rs/app-server/src/request_processors/thread_processor.rs#L858)
read existing state. The
[thread manager](https://github.com/openai/codex/blob/83086188ae0614bd882818ff1aa23f3194962012/codex-rs/core/src/thread_manager.rs#L1740)
returns an existing loaded Arc. The
[supported turn path](https://github.com/openai/codex/blob/83086188ae0614bd882818ff1aa23f3194962012/codex-rs/app-server/src/request_processors/turn_processor.rs#L377)
uses that loaded handle, checks direct-input eligibility, and submits input on
the same runtime. This is **source support for cooperative use of the existing
runtime**, not a new independent Writer launch.

At the read-only checkpoint, status was loaded/idle/direct-input-eligible. Direct OS lock-handle custody,
a successful remote turn and its original-TUI acknowledgement were then **unobserved**.
The exclusive Writer implementation is a source contract, not an independently
measured lock holder. No conflict was tested or bypassed.
Any contemplated effect must recheck current identity/status and obtain new
exact-thread Owner authorization first; refusal or ambiguity means stop.

## Authorized control on the same current incarnation — 21:53 +08:00

The Owner subsequently authorized one exact-thread ACK-only turn. New gates
verified daemon peer PID 33120, original process creation times, exact T18/workspace,
loaded membership and idle/direct-input state. The latest preexisting turn was
completed, and the newly accepted turn had a different native Turn ID.

Exactly one turn/start on the existing loaded handle completed. Native receipts
and an exact-turn complete items page contain the approved user input and exact
ACK, with zero tool/unknown items. No create/resume, competing server/Writer,
permission/config override, lock manipulation or lifecycle operation was sent.
This is **measured cooperative use of the existing native runtime**, separate
from the unobserved direct OS lock-handle holder. See [04](04-SECOND-CLIENT-AND-RETURN-TO-TUI.md)
for admission, response IDs, one-shot ledger and visible-return status.
The allowance is consumed; do not infer authority for another turn.