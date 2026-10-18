# R02 — Official daemon reachable; exact-thread/Writer proof missing

Continuation: `20261018-r01-continuation`.

Status: **PARTIAL_READ_ONLY — target identity and server continuity unresolved**.

## Distinct server incarnations

The first post-launch `codex app-server daemon version` succeeded:
running, pid backend, CLI 0.163.0 and managed/app-server version 0.162.1.
Version returned no PID; the official PID record was checked separately against
Windows process metadata.

| Incarnation | PID and local creation time, 2026-10-18 | Version / SHA-256 |
| --- | --- | --- |
| Initial daemon candidate | 18768; 20:26:42.254344 +08:00; same user | 0.162.1 / `DD13BDB162A184FA04039488B234A8258EF9B76F84E926C505D5742B19249A6A` |
| Later daemon candidate | 33120; 20:32:11.867961 +08:00; same user | 0.163.0 / `2692C8C7BB2CF8B0AEFE638741FC90236F4B824C59578CE84994F9DE58200993` |

At 20:33:20, PID 18768 and its distinct updater PID 36412 were absent. The current
official daemon record named 33120. Its creation FILETIME converts to
12:32:11.8679613 UTC, matching Windows process creation to exposed precision.
A new-incarnation status check succeeded with managed/CLI/app-server 0.163.0.
Matching executable hashes do not prove shared thread membership.

Research issued no install/update/start/bootstrap/restart/stop. The
[daemon guide](https://github.com/openai/codex/blob/092d3acd6bec3e3a14bdc7e7a2810ab628ab759d/codex-rs/app-server-daemon/README.md)
describes eligible updater behavior after five minutes. Timing/version change
are consistent with that explanation; **cause is not directly proved**.
The documented settings-file location was absent at the inspected cut; no
settings were created or changed, and defaults were not called measured values.

## Separate endpoint and process evidence

The [official status probe](https://github.com/openai/codex/blob/092d3acd6bec3e3a14bdc7e7a2810ab628ab759d/codex-rs/app-server-daemon/src/client.rs#L44)
uses initialize/initialized on the canonical AF_UNIX endpoint, then closes.
Successful status is stronger than a socket file alone.

Socket owner SID matched the research user; the observed ACL grants that SID
full access. Its address is 65 bytes including terminator, within the documented
108-byte Windows bound. Exact path/SID/SDDL remain private. This does not prove
Windows Job policy or identify the peer process of the original TUI connection.
The official PID record matched a live same-user PID and creation time;
**direct socket peer-PID attribution was not performed**.

| Required proof | Current result |
| --- | --- |
| Official daemon reachable at observed cuts | MEASURED_LOCAL, yes |
| Same-user socket owner/ACL | MEASURED_LOCAL, yes |
| Official PID record matched to live process/creation time | MEASURED_LOCAL, yes |
| Socket peer PID and original TUI server connection | UNKNOWN |
| Exact Owner Native Thread loaded in current incarnation | UNKNOWN |
| Native Writer holder and supported cooperation | UNKNOWN |
| Original TUI visible/interactive after server change | UNKNOWN |

No thread or Writer claim crosses the incarnation boundary. No competing
Writer, resume, thread/start, turn/start, lock inspection/acquisition or deletion
was attempted. The source-only exclusive Writer contract is not a measured
lock-holder/cooperation result. R02 is incomplete; R03 is gated.
