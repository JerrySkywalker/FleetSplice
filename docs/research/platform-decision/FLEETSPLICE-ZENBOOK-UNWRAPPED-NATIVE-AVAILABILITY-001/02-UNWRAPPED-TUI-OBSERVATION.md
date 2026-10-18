# R01 — Owner launch report and candidate identity

Continuation: `20261018-r01-continuation`, same Goal, 2026-10-18 (+08:00).

Status: **PARTIAL — original-TUI binding and Native Thread UNKNOWN**.

The Owner reports independent Windows Terminal launch using exactly
`codex --yolo`, non-administrator operation, the original TUI still open, and
**no model prompt**. This supersedes the earlier launch-pending checkpoint.
Physical test executed is now true, with **OWNER_REPORTED** provenance.

The supplied “Shell PID” is a UUID, not an integer Windows PID. It has not been
reinterpreted as a Native Thread ID. Its source, the intended candidate and whether
Codex was exited/reopened remain pending clarification. The raw identifier is
retained only in the private Owner-report artifact.

## Measured candidate

The 20:29 inventory found this chain, separate from Desktop processes.
Creation times are 2026-10-18 with +08:00 offset.

| Process | PID | Parent | Creation time |
| --- | ---: | ---: | --- |
| Windows Terminal | 34928 | 16520 | 20:26:23.824921 |
| PowerShell | 3944 | 34928 | 20:26:24.286346 |
| Node launcher | 34404 | 3944 | 20:28:47.187212 |
| Native TUI candidate | 18004 | 34404 | 20:28:47.239692 |

Windows' read-only process-owner queries returned the research user's SID for
these processes. Full arguments were not printed or retained. Flag-only
inspection found `--yolo` in Node/TUI and no `--no-daemon`, `--remote`,
profile or resume argument. The TUI's npm-package executable reports 0.163.0;
SHA-256: `2692C8C7BB2CF8B0AEFE638741FC90236F4B824C59578CE84994F9DE58200993`.

The candidate PID, creation time and Node parent remained unchanged in later
snapshots, including after the daemon changed. This is OS candidate continuity,
not Owner binding or visible interactive return. Console B non-elevation is
Owner-reported; same-user ownership alone does not establish token elevation.

| Required claim | Current result |
| --- | --- |
| Exact ordinary launch | OWNER_REPORTED; candidate flags support it |
| Original TUI PID + creation time bound to that launch | Candidate measured; binding UNKNOWN |
| Native Thread ID and exact test workspace through native interface | UNKNOWN |
| Same original TUI visible/interactive after daemon change | UNKNOWN |
| Authenticated model turn/effect | NOT_RUN; count 0 |

No native database, rollout/transcript or old session was inspected. No surrogate
TUI/server was started. Identity clarification was requested; no reply is not
permission to inspect an unconfirmed session.
