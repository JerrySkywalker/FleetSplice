# Owner decision pack — Post-launch native identity audit

GOAL_ID: `FLEETSPLICE-ZENBOOK-UNWRAPPED-NATIVE-AVAILABILITY-001`

Continuation: `20261018-r01-continuation`, Asia/Shanghai.

DISPOSITION: **STOP_FOR_OWNER_NATIVE_AVAILABILITY_REVIEW**

NATIVE_RESULT: **AMBIGUOUS_STOP**

## Question, provenance and authority

Can ordinary `codex --yolo`, physically started in Windows Terminal, later
share an official native endpoint while preserving the original TUI process,
Native Thread and native Writer? A replacement/resumed TUI is a different oracle.

[Draft PR #20](https://github.com/JerrySkywalker/FleetSplice/pull/20) uses
`docs/fs-zenbook-unwrapped-native-availability-20261015`, based on
`train/pre-gate-s-development-001@ee98a6282c7733ca1658547022ab55c3b61c0e1f`.
This continuation rechecked starting head
`a78897f7bed6b50778bc8abf9174e6873934123d` and reused its clean isolated
worktree. Exact final published SHA belongs in the local receipt and PR history.
No new Goal, implementation, merge or route selection is admitted.

The driver is ChatGPT desktop Codex local on ZENBOOKS14. It replaces planned
Console A only; Desktop PID/server/thread never count as Console B.

## Actual result and remaining uncertainty

At the earlier 17:43 R00 checkpoint, CLI was 0.162.1 and the pre-launch daemon
probe was refused. Later the Owner reported an independent Windows Terminal,
exact `codex --yolo`, normal user, original TUI open and **no model prompt**.
The supplied “Shell PID” is a UUID, not a Windows PID; it was not assumed to be
a Native Thread or read as a session.

The measured chain is Windows Terminal **34928** → PowerShell **3944** →
Node **34404** → TUI candidate **18004**, created
**2026-10-18 20:28:47.239692 +08:00**. Owner queries return the current user;
flag-only inspection finds yolo and no no-daemon/remote/profile/resume.
The executable reports **0.163.0**, SHA-256
`2692C8C7BB2CF8B0AEFE638741FC90236F4B824C59578CE84994F9DE58200993`.
Its intended-original-TUI binding awaits Owner clarification.

Official daemon status succeeded. Same-user socket ownership/ACL and a 65-byte
AF_UNIX address were measured separately from process identity.
Initial daemon **18768**, created **20:26:42.254344**, was 0.162.1.
It and its updater disappeared during inspection. The later official record
names daemon **33120**, created **20:32:11.867961**, version 0.163.0;
record creation FILETIME matches OS metadata. A new-incarnation status succeeded.
The TUI candidate remained alive with unchanged PID/creation time.
Research requested no installation or daemon lifecycle mutation.
Autonomous update is consistent with source/timing, **not a proved cause**.

These facts do not prove the exact native thread, Writer cooperation or visible
interactive return in the original TUI. Direct socket peer-PID attribution was
not performed. No thread claim was carried across the incarnation change.
No native database, rollout, transcript or old private session was inspected.

## Phase record

| Phase | Actual execution |
| --- | --- |
| R00 | COMPLETE; retained earlier checkpoint and revalidated drift |
| R01 | PARTIAL; Owner launch plus measured candidate; exact binding/thread UNKNOWN |
| R02 | PARTIAL_READ_ONLY; reachable daemon and same-user metadata; full chain incomplete |
| R03 | NOT_RUN / BLOCKED; no exact-thread read/subscription or effect |
| R04 | COMPLETE_CLASSIFICATION_ONLY; native continuity incomplete |
| R05 | Updated reports/README/manifest, lightweight checks and same Draft PR; publication outcome in local receipt |

Physical test executed: **true, OWNER_REPORTED**.
Authenticated native effects: **0**. Phone test: **false**.
Native daemon status initialize/close is not SECOND_CLIENT_READ.
No Writer conflict was tested, inferred or bypassed.
October 15 historical R02 evidence remains no current PASS.

## Route decision and sole next step

[PR #19](https://github.com/JerrySkywalker/FleetSplice/pull/19), pinned at
`25f2bae8b39eb6222c7d2e0b8237227f53504acc`, concluded
[INSUFFICIENT_EVIDENCE](https://github.com/JerrySkywalker/FleetSplice/blob/25f2bae8b39eb6222c7d2e0b8237227f53504acc/docs/research/platform-decision/FLEETSPLICE-PASEO-BUILD-OR-REUSE-DECISION-001/08-OWNER-DECISION-PACK.md).
Vanilla Paseo's separate native runtime/history gaps, conditional provider/core
changes, and FS's G08/maintenance costs remain unresolved comparison inputs.
A reachable daemon chooses neither FS nor a Paseo change. A future local sharing
PASS would still not qualify phone P0, multi-Host or G08.

**Owner clarifies the still-open original Console B's identity:** confirm whether
PID 18004 is the intended candidate, where the supplied UUID came from, whether
Codex was exited/reopened, and whether the original visible UI remains interactive
after the server change. No model prompt, restart, resume or settings change.

After clarification, establish a fresh current-incarnation/Thread/Writer chain
through official safe read-only surfaces before R03. Stop if it cannot be proved.
One harmless effect needs **new explicit authorization naming the proved
disposable thread**, after cooperation is established; never retry an unknown
effect. Effect authorization is not requested while that gate is missing.

## Custody and independent continuation

Private evidence is in `evidence/20261018-r01-continuation/` under this Goal's
Owner-designated artifact root; fetched source is in
`scratch/20261018-r01-continuation/`. Prior receipt/handoff were archived there
before root FINAL-RECEIPT.json and OWNER-HANDOFF.md update.
No credentials, tokens, exact user-home paths or native transcripts enter Git.
Canonical main and the older dirty research worktree remain preserved.

[README](README.md) is the entry. [01](01-PREFLIGHT-AND-RUNTIME-IDENTITY.md)
retains preflight history; [02](02-UNWRAPPED-TUI-OBSERVATION.md) covers identity;
[03](03-SHARED-ENDPOINT-AND-WRITER.md) separates endpoint/PID/Writer;
[04](04-SECOND-CLIENT-AND-RETURN-TO-TUI.md) records the gated observer;
[05](05-QUALIFICATION-AND-ROUTE-IMPLICATION.md) gives classification.
