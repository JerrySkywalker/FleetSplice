# D0 personal-dogfood UX correction

Owner authorization: `D0_DOGFOOD_CORRECTIONS_ONLY`.
Start branch: `fix/g05c-d0-dogfood-ux-r1`.
Start HEAD: `d9b4336f6aff49717a1c86f8f53ecf5c06e49f68`.
Start tree: `74198c106b7d819aa994c6116c3ecb5b65e758d2`.

Bounded changes: exact user-message provenance, structured native turn timing
and lifecycle display, and observed interrupted-command drain. Keep the existing
Native Adoption interface and cooperative control semantics. Native Codex owns
tool execution. No shell workaround, installed-binary patch, shim, window-hiding
race, P3, G06, remote deployment, or merge is authorized.

Web attribution uses exact `clientUserMessageId` correlation and preserves the
authenticated Fleet client ID plus optional explicit client/device labels.
Uncorrelated input displays `Native external client`; no physical device is
inferred from a thread's origin. Successful journal receipts retain attribution
on reconnect; unknown attempts remain blocked without replay.

Turn timestamps are native Unix seconds and durations are native milliseconds.
Missing or invalid fields remain unavailable. Command warning drain requires
terminal evidence for every retained command of interrupted turns; later stale
history cannot resurrect an observed terminal command. At the 64-command
evidence bound, observation/control holds instead of evicting terminal facts.
Interrupt never claims OS process termination.

Corrected candidate validation: typecheck/build and 121 tests passed, preserving all 115
previous tests. Live evidence outside Git under the matching Goal directory in
`V:/artifacts/FleetSplice` records the literal ordinary TUI launch, TUI/Web source
badges on one thread, visible working/completion timing, residual warning and
drain, and successful return to TUI. The final header visibility and reconnect
correction is additionally exercised by the `final-live` evidence. After the
activity-bound correction, `corrected-live-r2` repeats the source, working,
normal completion, interrupt/residual/drain sequence on the same original
native thread. The earlier corrected-live harness stopped before any Web input
because it checked Send with an empty prompt; only Attach had succeeded.

The one harmless command attribution established native daemon children and
their ConHost parents. Subsequent read-only console/window observation and a
target-only capture identified the code-mode-host popup, its separate console,
and OpenConsole presentation process without another native command. The event
subscription was unavailable; read-only creation-time polling is explicitly
limited. See the [sanitized upstream draft](../docs/research/native-adoption-windows-popup-upstream-draft.md).
No supported native no-window setting was established. The draft is not posted.

The interim read-only review found terminal-evidence eviction at the activity
bound. The correction holds rather than evicts, with an additional regression
exceeding 64 commands. A temporary console-observation JSON file inadvertently
landed in the checkout during that review; the Implementer relocated that exact
owned artifact outside Git after reacquiring the writer lease. All candidate
source hashes had remained unchanged during review. The new candidate boundary
must be revalidated.

Final acceptance requires the corrected gates and live evidence, then
commit/push and a fresh separate strongest read-only review of the exact
committed head/tree. Source review of a dirty candidate is not that final gate.
P3 and G06 remain unstarted; no merge is permitted.
