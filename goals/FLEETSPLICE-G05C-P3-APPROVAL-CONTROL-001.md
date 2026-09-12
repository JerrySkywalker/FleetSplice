# G05C P3 native approval control

Owner authorization: `G05C_P3_APPROVAL_AND_CONTROL_COMPLETION_ONLY`.
Start branch: `feat/g05c-p3-approval-control`.
Start head: `080466a427b5946b6a859967db582dea8fd43186`.
Start tree: `879650e67f0c57c493735083285b3a5307b9aa3f`.

This bounded Goal adds approval projection and Allow once / Deny to the accepted
ordinary-native-session adoption path. It does not redesign adoption, controller
renewal, native Steer, native Interrupt, activity continuity or residual drain.
No G06, merge, wrapper, managed Agent launch or persistent permission change is
authorized by this Goal.

## Native contract

The connected daemon's native server requests select approval support. Neither
semantic versions nor executable hashes select this capability. Resume of the
exact loaded thread delivers an already-pending request on the live runtime.

Only `item/commandExecution/requestApproval` for command actions with complete,
inspectable command/reason/environment/permission context is admitted. The whole
context must fit 4,000 characters and contain no hidden control sequences; it is
never silently truncated. Otherwise controls remain unavailable.
Command decisions respect `availableDecisions` when supplied. Allow once maps to
`accept`; Deny maps to `decline` when offered, otherwise `cancel` when offered.
No session decision or policy amendment is sent. Native cancellation can interrupt
the turn; the conversation remains available on the same thread.

Command-scoped sandbox escalation is handled by the same command approval.
The separate `item/permissions/requestApproval` grants permissions for a turn or
session, rather than one action, and remains `APPROVAL_UNAVAILABLE` in this slice.
`item/fileChange/requestApproval` parameters alone contain no affected paths or
diffs, so dedicated file-change approval remains unavailable until complete
exact-item context can be projected. Managed-network prompts, persistent file
grants and unknown server requests are not treated as supported coding approvals.

Each request retains its typed JSON-RPC request ID (including numeric zero),
thread, turn, item and request type. Its digest covers the entire native request,
including callback/environment IDs and additional fields when supplied. The
projected authority also binds runtime, daemon incarnation, exact controller,
fence, browser grant identity, revision, session binding and expiry. Human command
text alone never authorizes a response. Native request IDs cannot be reused with
a changed payload on the same connection.

The Edge checks identity, controller, grant, native state and pending status
before one response. It journals the attempt before sending. Only a matching
`serverRequest/resolved` completes that attempt; this notification proves native
resolution, not execution success or an atomic winner identity. Concurrent
decisions are arbitrated by the native runtime. Execution outcomes require native
item/turn observation and, in acceptance, the disposable filesystem result.
One deadline bounds both transport delivery and native resolution, including a
stalled WebSocket send callback. Unknown delivery closes control without replay.
Resolved requests and ended turns
invalidate old controls. Controller renewal mints a new authority only through
the accepted same-browser renewal path; old fences/grants remain stale.

## Qualification and visible acceptance

On 2026-09-12, the first candidate's check/build and **146 tests** passed: all 134
existing tests plus 12 focused approval tests. The unchanged managed tests used their preserved
official pinned fixture through `FLEETSPLICE_MANAGED_TEST_CODEX`; adoption used the
live independently updated daemon. An initial test run without that historical
fixture failed three managed artifact gates; those gates were not relaxed.

Headed Edge browser and Windows Terminal automation exercised a real ordinary
`codex --sandbox read-only --ask-for-approval on-request` in the existing
disposable demo Workspace. This is human-visible automation, not a claim of
Owner personal dogfood. The native TUI requested approval before FleetSplice
attached, and retained thread `01a095c3-142c-7e50-8da0-7715c14b0420` throughout:

- Web Allow once resolved native request `0`; the exact one-time write produced
  `p3-approval-once.txt` with `P3_ALLOW_ONCE`. The native TUI showed completion and
  removed its approval prompt, leaving no second approval control to answer.
- Web Deny resolved the next request using the offered native `cancel` decision.
  `p3-approval-denied.txt` remained absent and the TUI observed interruption.
- TUI Escape resolved the third request first. With the old enabled Web DOM
  deliberately retained, clicking Allow once returned
  `NATIVE_APPROVAL_ALREADY_RESOLVED`. Its target file remained absent.
- A second tab had disabled approval controls; an explicit authenticated viewer
  request was rejected with `FLEET_VIEWER_CANNOT_CONTROL`.
- The original browser renewed grant revision 1 to 2 and fence 1 to 2 while the
  first approval was pending, then approved successfully. Only browser timers
  were accelerated; this is not a wall-clock soak.
- The original TUI answered `P3_NATIVE_TUI_RETURN_OK` on the same thread at the end.

Command approval and command-scoped write escalation are real-runtime qualified.
Dedicated file-change and permission-grant request schemas were evaluated; both
remain unavailable in the corrected candidate. Interrupt/Steer beside pending
approvals passed exact-turn regression
tests; those controls were not redesigned.

Persistent Codex config SHA-256 matched before and after. All 229 source-file
hashes matched across the smoke. Two pre-effect browser harness errors are
retained externally: boolean predicate coercion and late simulated-clock setup.
Neither sent an approval response. The first successful complete harness is `live-3`.

The first independent review of `47c547e528d88ec55c13250b6528a2e9753a93fe`
returned CHANGES_REQUIRED: incomplete action context, a timeout that did not
bound stalled delivery, and a return screenshot that did not show the message.
The correction fails closed on uninspectable actions, bounds delivery and
resolution together, and explicitly scrolls the rendered native return response
into view before capture. Two further focused tests cover complete/oversized/
hidden context and stalled delivery/resolution with no replay. Corrected gates
and complete repeated visible acceptance are retained as `*-r2-final.log` and `live-4`.
All **148 tests** passed, including the original 134. The repeated smoke used
`p3-approval-once-r2.txt`, `p3-approval-denied-r2.txt` and
`p3-approval-tui-race-r2.txt` on the same original TUI thread. Its journal export
again contains exactly two approval attempts. The corrected return PNG visibly
shows `P3_NATIVE_TUI_RETURN_R2_OK`; source and persistent config hashes remained
unchanged across that complete smoke.

Evidence, screenshots, logs, native identities, source hashes, writer-lease state,
final Git identity and separate exact-head review are retained outside Git under
`V:\artifacts\FleetSplice\FLEETSPLICE-G05C-P3-APPROVAL-CONTROL-001`.
The final disposition is governed by the fresh correction review, not this author summary.
`G06_STARTED=false`.
