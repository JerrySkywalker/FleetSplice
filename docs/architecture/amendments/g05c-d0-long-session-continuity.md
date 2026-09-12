# D0 long-session continuity

This additive correction is authorized by
[FLEETSPLICE-G05C-D0-LONG-SESSION-R2-003](../../../goals/FLEETSPLICE-G05C-D0-LONG-SESSION-R2-003.md).
It supersedes the D0 terminal-command overflow hold for this Goal only. Earlier
receipts remain historical evidence. P3 and G06 remain unauthorized.

## Browser authority

ClientGrant lifetime remains thirty minutes within the authenticated eight-hour
browser session. Native-adoption browsers renew five minutes before grant expiry
and check renewal when becoming visible or admitting a request. A rotation
barrier drains in-flight requests before replacing credentials. It never retries
a failed or ambiguous renewal and never automatically obtains a replacement
client. Managed-browser request behavior remains unchanged.

The Hub authenticates the current session, client and CSRF after reading the
renewal body. It checks the exact grant ID/revision, retires the old credentials,
and rotates CSRF/revision with expiry capped by the original session. A response
lost after rotation cannot resurrect the old grant. A new tab has a distinct
client and initially remains a Viewer.

The Edge serializes controller renewal with commands. Lease extension requires
the exact old client, hashed session binding, grant identity/revision/expiry,
runtime, native incarnation, current controller and current fence. Successful
controller renewal journals that binding and increments the fence. Stale grants
and stale-fence commands cannot dispatch. A Viewer renewal cannot acquire control.
Renewal performs no native thread or turn operation and never replays an effect.

## Command evidence and recent activity

The Edge SQLite journal uses FULL synchronous transactions. Each changed command
observation commits both append-only evidence and its exact incarnation/thread/
item/turn state before any terminal cache eviction. An archived terminal identity
wins over stale nonterminal history; a conflicting turn identity closes admission.

Every nonterminal command remains in the safety map and durable store. The cache
keeps only sixteen terminal items. The recent projection prioritizes nonterminal
items so historical terminal reads cannot hide an active command. The Web list
is explicitly bounded and warns that omitted activity does not imply completion.

Interrupted-turn membership is durable. Drain queries include all corresponding
command records, including archived commands outside recent native history.
Completion of a turn is not completion of its commands. UNKNOWN stays unknown
after an actual SQLite reopen; unresolved commands from a different incarnation
block recovery. Constructor rejection closes the native proxy and journal.
Interrupt continues to make no OS process-termination claim.

## Qualification

Typecheck, build and 134 tests passed, preserving the prior 123 cases while
updating three obsolete terminal-overflow expectations. New checks cover renewal
identity/expiry/fences, no-retry failure, 400 terminal commands, 80 active commands,
actual SQLite reopen, durable drain and journal failures before compaction or
final dispatch. Source provenance and native Worked-for rendering remain covered.

The real ordinary `codex --yolo` thread retained 154 terminal command items,
including 120 in one turn. The final build re-adopted its archive, renewed the
same Web client with a second tab remaining Viewer, observed Web interruption
with a visible residual command followed by terminal drain, and returned to the
original TUI. The renewal harness advanced only browser timers; Hub, Edge and
native clocks/TTLs were real. This is not a thirty-minute wall-clock soak.

Failed harness attempts and the late native continuation of an interrupted batch
are retained separately. No Fleet command was replayed. Exact pushed identity,
source hashes, local gates, native receipts and the separate read-only review
are recorded in the external Goal evidence directory.
