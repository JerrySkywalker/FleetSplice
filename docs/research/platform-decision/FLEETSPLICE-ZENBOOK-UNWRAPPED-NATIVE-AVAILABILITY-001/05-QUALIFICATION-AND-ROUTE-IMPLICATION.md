# R04 — Read-only qualification and remaining effect gate

Continuation: `20261018-r02-thread-verification`, same Goal.

NATIVE_RESULT: **READ_ONLY_PROOF_ONLY**

DISPOSITION: **STOP_FOR_OWNER_NATIVE_AVAILABILITY_REVIEW**

The Owner clarified the Native Thread ID, and fresh official responses bind that
exact thread to the disposable workspace and daemon 33120's loaded state.
Windows' supported socket peer query bound the observer endpoint to that daemon.
The Owner confirmed original-TUI interactivity and unchanged Thread ID after
disconnect; OS snapshots show candidate TUI 18004/daemon 33120 creation times
unchanged. This supersedes the preceding identity-ambiguity checkpoint.

| Required layer | Evidence and practical limit |
| --- | --- |
| Ordinary physical launch / non-elevated Console B | OWNER_REPORTED; candidate flags/owner corroborate |
| TUI candidate PID + creation continuity | MEASURED_LOCAL; no native response directly maps PID 18004 to Thread |
| Endpoint → server PID/incarnation | MEASURED_LOCAL peer PID + official PID record + OS time/hash/owner |
| Exact Native Thread/workspace/current loaded membership | MEASURED_LOCAL official metadata/list; Owner-confirmed target |
| Writer/control | Loaded, idle, direct-input eligible; existing-runtime route SOURCE_SUPPORTED; lock holder/control effect untested |
| Second-client read | MEASURED_LOCAL, correlated request IDs; no new Writer |
| Original TUI return | OWNER_REPORTED same-ID interactive return; candidate OS identity unchanged |
| Remote native effect and same-TUI acknowledgement | NOT_RUN; no authorization, count 0 |

The PID-to-thread relation uses Owner UI plus workspace/startup correlation,
not a fabricated native PID field. Stored source=vscode and cliVersion=0.162.1
are preserved, separate from the live 0.163.0 runtime. The observer close used
abort/dispose after an unspecified close exception; it is not a clean handshake
result. These limits prevent promotion to SHARED_NATIVE_AVAILABLE.

[PR #19's pinned decision](https://github.com/JerrySkywalker/FleetSplice/blob/25f2bae8b39eb6222c7d2e0b8237227f53504acc/docs/research/platform-decision/FLEETSPLICE-PASEO-BUILD-OR-REUSE-DECISION-001/08-OWNER-DECISION-PACK.md)
remains INSUFFICIENT_EVIDENCE for product choice. The local read removes one
availability uncertainty but does not demonstrate cooperative effects, phone P0,
G08 complete bounded history, multi-Host operation or comparative maintenance
cost. No automatic FS/Paseo choice, product code, G08, Gate S or merge follows.

**One next step:** Owner reviews whether to separately authorize one harmless
exact-thread ACK turn through the same existing server/runtime. The proposed
action and guards are in [06](06-OWNER-DECISION-PACK.md). No turn is authorized by
a successful read or by the Owner's UI-return confirmation.
