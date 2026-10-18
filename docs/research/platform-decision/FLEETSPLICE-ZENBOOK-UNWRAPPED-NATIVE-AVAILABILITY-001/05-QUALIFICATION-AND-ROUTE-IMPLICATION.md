# R04 — Qualification and ambiguity classification

Continuation: `20261018-r01-continuation`, same Goal.

Status: **COMPLETE_CLASSIFICATION_ONLY; native continuity incomplete**.

NATIVE_RESULT: **AMBIGUOUS_STOP**

DISPOSITION: **STOP_FOR_OWNER_NATIVE_AVAILABILITY_REVIEW**

The Owner now reports the physical exact launch and open TUI with no prompt.
A measured Windows Terminal chain leads to TUI candidate PID 18004, created
20:28:47.239692 +08:00. The official daemon is reachable, with same-user socket
ACL and a separately matched official PID record. The earlier pre-launch
connection refusal is not the current endpoint status.

During inspection the daemon changed from 18768/0.162.1 to 33120/0.163.0.
The TUI candidate's PID/creation time remained unchanged. Process survival is
not thread continuity or visible interactive return.
The supplied “Shell PID” is a UUID; its origin and original-TUI binding remain
unconfirmed. No supported protocol proof binds the exact Native Thread/Writer
to the current server.

| Claim layer | Result |
| --- | --- |
| Exact physical launch; normal user; original TUI open | OWNER_REPORTED |
| Candidate PID/creation, executable, flags and same-user owner | MEASURED_LOCAL |
| Official reachability, same-user socket ACL, PID-record metadata | MEASURED_LOCAL; separate surfaces |
| Exact original-TUI binding, Native Thread, peer PID, Writer cooperation | UNKNOWN |
| Independent read, admitted effect, same-TUI interactive return | NOT_RUN / UNKNOWN |

AMBIGUOUS_STOP supersedes the launch-pending classification. It does not mean
embedded launch, no endpoint, Writer conflict, or native sharing PASS.
No competing Writer or native effect was attempted.

[PR #19's pinned report](https://github.com/JerrySkywalker/FleetSplice/blob/25f2bae8b39eb6222c7d2e0b8237227f53504acc/docs/research/platform-decision/FLEETSPLICE-PASEO-BUILD-OR-REUSE-DECISION-001/07-FINAL-DECISION-REPORT.md)
remains INSUFFICIENT_EVIDENCE. Its Paseo 0.11.2 separate stdio runtime and
complete-history residency findings are prior source review, not new measurements
of current Paseo. FS's supervised historical ZenBook proof cannot substitute
for ordinary-TUI qualification. No comparison, route or G08 admission follows.

**One next step:** Owner confirms the intended still-open original Console B,
the supplied UUID's origin, whether Codex was exited/reopened, and whether the
original UI remains interactive after the server change. Send no prompt or
relaunch. Then re-establish identity for the current incarnation with official
read-only surfaces before R03. Any effect needs new exact-thread authorization
after Writer qualification. Phone P0, multi-Host, Gate S and product work remain
outside this audit.
