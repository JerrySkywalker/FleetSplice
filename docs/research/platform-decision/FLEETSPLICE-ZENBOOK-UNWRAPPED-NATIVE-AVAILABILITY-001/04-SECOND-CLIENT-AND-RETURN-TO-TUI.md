# R03 — Independent read completed; no native effect

Continuation: `20261018-r02-thread-verification`.

Status: **READ_ONLY_COMPLETED; EFFECT_NOT_RUN**.

## Bounded observer receipt

After Owner confirmed T18's identity and same-user endpoint/process metadata was
revalidated, an in-process .NET observer connected over the official AF_UNIX
WebSocket transport. It spawned no native server or Writer.

At **20:48:56 +08:00** it verified peer PID 33120 and used these correlated IDs:

| Request | Response | Result |
| --- | ---: | --- |
| initialize | 2001 | Success |
| initialized notification | none | Sent after initialize |
| thread/read, exact T18, includeTurns=false | 2002 | Exact ID/workspace; live idle; zero returned turns |
| thread/loaded/list, limit 32, one page | 2003 | Exact T18 present; no further page |

No thread/start, resume, turn/start, subscription, approval, settings change or tool
action was sent. No unrelated thread IDs, previews or full frames were retained.
The source-checked methods observe existing state; control/effect was not tested.

## Transport and close limitations

The first two attempts stopped **before initialize**, due to the observer's
strict managed peer-PID length check. The third used native WSAIoctl directly:
success code 0 and correct output PID 33120; bytesReturned was observed as 0.
These were transport diagnostics, not replay of a native effect.
All attempt receipts and helper revisions remain private artifacts.

The graceful WebSocket close attempt threw; the helper then aborted/disposed
**only its own observer**. Its initial label said close timeout, but the generic
catch did not establish that cause. A separate correction receipt records the
accurate conclusion: unspecified close exception, observer disposed.
Do not call this a clean close-handshake PASS.

A later OS snapshot confirmed original candidate 18004 and daemon 33120 still
alive with unchanged creation times and daemon PID record. The Owner then checked
the **original Console B** and confirmed it remained interactive with **the same
Native Thread ID**. UI return is OWNER_REPORTED; OS continuity is MEASURED_LOCAL.

Authenticated native effects: **0**. No effect authorization has been received.
READ_ONLY_PROOF_ONLY is earned; SAME_TUI_REMOTE_EFFECT and full P0 are not.
