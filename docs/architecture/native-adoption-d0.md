# D0 native adoption: bounded local contract

The Owner's `FLEETSPLICE-G05C-D0-NATIVE-ADOPTION-HUMAN-DEMO-001`
authorization admits an additional Codex adapter. This is an additive exception
to the older managed-only app-server topology; accepted receipts remain intact.
P3 and G06 remain unstarted. Only the designated disposable Workspace is admitted.

The official native lifecycle starts the shared daemon. Windows Terminal runs
ordinary `codex --yolo`; FleetSplice never starts, wraps, shadows or parents that
TUI. The adapter uses official `codex app-server proxy --sock <discovered>` and
the unchanged native WebSocket/JSON-RPC protocol. The proxy is a connection client,
not the server identity. Closing FleetSplice closes only its client connection.

The Windows native status surface supplies the endpoint and managed executable.
The adapter validates the current per-user default endpoint, private native
directory ACL, official PID record and FILETIME against OS process owner,
creation time, executable and native `app-server --listen unix://` invocation.
Endpoint creation metadata is observed through Windows because Node cannot stat
the AF_UNIX reparse point. Initialize must return the same Codex home. Missing or
contradictory identity closes admission. A changed incarnation cannot inherit
existing control. Version/hash/path are recorded; version and hash do not select
compatibility. These checks do not defend against a malicious same-user process
or administrator forging native runtime state.

Compatibility is a snapshot of successful read RPCs, native notification
observation and recognized missing-thread rejections for supported operations.
Each capability retains its proof level. An arbitrary error is not support.
`ADOPT_FULL` requires shared connection, list/read, resume, submit, event transport
and active-turn observation. Missing event or active-turn capability yields
`ADOPT_RESUME`; insufficient shared adoption with managed control surfaces yields
`MANAGED_ONLY`; otherwise `UNSUPPORTED`. Steer, interrupt, approvals, models and
effective configuration are separate capabilities. D0 controls require FULL.
Thread-specific subscription, history and effects still require the human demo;
the compatibility classification alone is not acceptance.

Loaded thread identity, exact cwd and current filesystem Workspace identity are
required before resume/attach. Resume supplies only the exact thread ID, with
no rollout path, injected history or configuration override. Returned identity
must match. No `thread/start` route exists. Recent native history uses at most
12 turns and 48 projected messages, labeled when limited. Foreign thread history
is never hydrated. Origin is `NATIVE_ADOPTED`; managed lane projections remain
`FLEETSPLICE_MANAGED`. Receipts never claim adopted-thread creation ownership.

One authenticated Fleet Web client holds the D0 controller fence. All others
view the shared projection. Typed Web commands pass through the authenticated
Hub into a separate Edge process, whose serialized adapter owns native effects
and FULL SQLite attempts/receipts. The fixed loopback Hub port excludes concurrent
D0 instances before native attachment. Browser client/grant expiration and every
fence are rechecked. Old command IDs return their receipt, never dispatch again;
uncertain effects close admission, and cold restart refuses unresolved attempts.

Local TUI input is an external writer. Before an effect, the adapter rechecks
daemon/Workspace identity, loaded thread membership, native turn state, user input
state, observed native state events and the Fleet controller fence. Newly seen
native input requires explicit review. Steer uses `expectedTurnId`; interrupt
uses exact `threadId`/`turnId`. Neither is emulated by a continuation or process
termination. Interrupt response means request accepted; only native interrupted
turn evidence yields the human `Turn interrupted` label. Residual command state
remains conservative. Native approvals stay with the TUI in D0.

The native submit API does not expose an atomic idle-state comparison token.
The final freshness read and event fence detect already-observed advancement;
they cannot provide an exclusive lease against a simultaneous TUI write after
the read. The demo uses cooperative, sequential human input. Unexpected response
identity or uncertain native outcome closes control without replay. FleetSplice
does not claim atomic fencing of the native TUI.

Follow-up debt: the existing managed driver still requires its historically
qualified artifact. Its regression tests may select an official preserved
artifact via `FLEETSPLICE_MANAGED_TEST_CODEX`; the original managed version/hash
gate still validates that fixture. No product launch resolution or pin changes
are included in D0. Neither that test fixture version nor the demonstrated native
version is an adoption product requirement.
