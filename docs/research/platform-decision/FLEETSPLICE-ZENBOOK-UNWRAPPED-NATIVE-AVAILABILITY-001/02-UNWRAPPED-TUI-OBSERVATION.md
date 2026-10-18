# R01 — Confirmed test thread and corroborated original TUI

Continuation: `20261018-r02-thread-verification`, same Goal, 2026-10-18 (+08:00).

Status: **OWNER_THREAD_CONFIRMED; TUI association corroborated; OS continuity measured**.

The Owner clarified that the earlier UUID is the disposable **Native Thread ID**,
not a shell PID. After the read-only observer disconnected, the Owner checked the
original Console B and reported **still interactive, same Thread ID**.
At that read-only checkpoint no model effect had been authorized or sent. The subsequent separately authorized one-turn ACK is recorded in 04.

To keep public evidence minimal, the test thread is called **T18**.
SHA-256 of its canonical lowercase UUID:
`243106043D8B029720F5E075B9AB7465C03EFE8E17073A98EE3A935038BA6D76`.
The exact UUID and native response IDs are in the private receipt/evidence.

| Process | PID | Parent | Creation time, 2026-10-18 +08:00 |
| --- | ---: | ---: | --- |
| Windows Terminal | 34928 | 16520 | 20:26:23.824921 |
| PowerShell | 3944 | 34928 | 20:26:24.286346 |
| Node launcher | 34404 | 3944 | 20:28:47.187212 |
| Native TUI candidate | 18004 | 34404 | 20:28:47.239692 |

These are the previously measured non-Desktop same-user processes. TUI candidate
18004 still has its original creation time and parent after observer disconnect.
Earlier flag-only inspection found yolo and no no-daemon/remote/profile/resume.
The npm executable is 0.163.0, SHA-256
`2692C8C7BB2CF8B0AEFE638741FC90236F4B824C59578CE84994F9DE58200993`.

The official read returned **T18**, creation **20:28:48 +08:00**, matching the
disposable workspace and the candidate's startup within one second.
This, the measured parent chain and Owner's original-TUI status corroborate
the association. **The protocol response itself does not contain TUI PID 18004**;
that PID-to-thread edge remains corroboration, not a direct native PID field.

Stored metadata says `source=vscode`, `cliVersion=0.162.1`.
These labels are reported faithfully: they do not identify the current
0.163.0 TUI binary or independently prove `codex-tui` origin.
Current loaded membership was proved separately against daemon 33120.

Exact ordinary launch and non-elevation remain Owner-reported; same-user OS owner
queries are measured independently. Original-TUI visible return is Owner-reported
after the observer, while PID/creation continuity is measured locally.
No replacement, private transcript/database read, file/tool task or native effect
was used to strengthen these claims.

## One-effect process continuity

Fresh pre-dispatch gates and post-disconnect OS snapshots for the separately
admitted ACK retained TUI 18004 creation 20:28:47.239692 and daemon 33120 creation
20:32:11.867961 (+08:00). Native receipt proves one completed exact-thread effect.
The earlier Owner UI report was after the read-only observer; **post-effect**
visible ACK, same-ID and interactivity confirmation is pending at this cut.
No replacement TUI or resume was used. See [04](04-SECOND-CLIENT-AND-RETURN-TO-TUI.md).