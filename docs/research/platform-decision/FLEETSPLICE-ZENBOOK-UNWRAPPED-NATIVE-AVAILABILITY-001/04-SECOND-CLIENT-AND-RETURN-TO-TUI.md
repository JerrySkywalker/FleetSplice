# R03 — Independent observer and return remain gated

Continuation: `20261018-r01-continuation`.

Status: **NOT_RUN — unconfirmed target and incomplete R02**.

Only official daemon status probes were made. Their internal initialize/close is
not an independent exact-thread read, subscription, Writer-cooperation result or
same-TUI return test.

The 0.163.0 source exposes
[loaded-thread listing and metadata-only read](https://github.com/openai/codex/blob/83086188ae0614bd882818ff1aa23f3194962012/codex-rs/app-server/src/request_processors/thread_processor.rs#L858)
with [typed request/response definitions](https://github.com/openai/codex/blob/83086188ae0614bd882818ff1aa23f3194962012/codex-rs/app-server-protocol/src/protocol/v2/thread.rs#L1659).
These were inspected as possible read-only surfaces; **neither was issued**.
The supplied UUID is not yet a confirmed disposable Native Thread ID.

| Acceptance item | Result |
| --- | --- |
| Exact endpoint/server/thread/Writer chain qualified | UNKNOWN |
| Independent non-owning exact-thread observation | NOT_RUN |
| Matched read events/turn receipts | NOT_RUN |
| Observer disconnect and visible original-TUI return | NOT_RUN |
| Separate exact-thread effect authorization | NOT_REQUESTED |
| Authenticated native effect | NOT_RUN; count 0 |

No second server or Writer, native thread, resume, prompt, approval or tool action
was initiated by research. The Owner reports no model prompt in Console B.
No effect exists to retry. Successful status or matching binary hashes do not
earn READ_ONLY_PROOF_ONLY or SHARED_NATIVE_AVAILABLE.
Preserve the original TUI; do not relaunch it to repair the evidence gap.
