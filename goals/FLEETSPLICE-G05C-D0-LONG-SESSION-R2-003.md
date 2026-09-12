# D0 long-session continuity correction

Owner authorization: `D0_LONG_SESSION_CONTINUITY_ONLY`.
Branch: `fix/g05c-d0-long-session-r2`.
Start HEAD: `bf2a9d124d20230c81a298bc4a135ef2a1a28ac7`.
Start tree: `9e1c97f9bd724cb31ce8ec54d6286fb0d9172895`.

The bounded change renews a still-valid browser ClientGrant within the same
authenticated eight-hour session. The grant remains thirty minutes. Renewal
rotates CSRF and revision; the exact native controller may extend its lease only
with matching client, session binding, grant revision, runtime, incarnation and
current fence. Rotation advances the controller fence. Other clients stay
viewers. A failed or ambiguous browser renewal is never automatically retried.

Native command safety evidence is stored separately from recent activity.
SQLite FULL commits precede terminal cache eviction; nonterminal commands remain
in memory and durable storage. Archived terminal identity defeats stale history.
Interrupted-turn drain is computed from durable command and interruption records,
including commands outside the recent native history window. Recovery retains
UNKNOWN and rejects unresolved commands belonging to a different incarnation.
Neither renewal nor compaction dispatches a native effect or replays a command.

Validation includes all prior regression cases, with the three terminal-overflow
cases updated for the explicitly requested new behavior, and additional renewal,
archive, failure and recovery cases. Final acceptance requires check/build/test,
real ordinary `codex --yolo` adoption smoke, commit/push, and a separate read-only
review of the exact pushed head/tree. Evidence is retained outside Git under
`V:/artifacts/FleetSplice/FLEETSPLICE-G05C-D0-LONG-SESSION-R2-003`.

P3 and G06 remain unstarted and unauthorized. No merge is authorized.

Candidate validation: check/build and 134 tests passed. The real native thread
retained 154 terminal command items, including 120 in one turn; the final build
re-adopted that history, renewed the exact controller, preserved a second-tab
Viewer, showed an interrupted nonterminal command through its terminal drain,
and returned to the original TUI. Renewal used accelerated browser timers with
real Hub/Edge/native clocks; no thirty-minute wall-clock soak is claimed.
All 227 source-file hashes matched during the final live run. Later additions
are this documentation closeout. Exact committed/pushed identity and separate
read-only acceptance are recorded outside Git in the Goal directory.
