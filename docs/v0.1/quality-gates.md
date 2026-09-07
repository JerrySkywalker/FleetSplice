# v0.1 Quality Gates and Evidence Plan

Use the [current contract](acceptance-contract.md) and
[G04A amendment](../architecture/amendments/g04a-visible-mvp-simplification.md).
The immutable G03 and accepted G04A citations are both required for future
implementation receipts. Current acceptance is in [G04A-status](../train/G04A-status.md).

## Evidence vocabulary

| Class | What it proves |
| --- | --- |
| STATIC | Exact source/document/schema/link/lineage properties inspected. |
| UNIT / DISPOSABLE_INTEGRATION | Named isolated behavior in its specific test environment. |
| SYNTHETIC_BROWSER | UI/rendering/auth/cursor behavior in automation; not real phone/network dogfood. |
| FAULT_INJECTION | Specified crash, loss, replay, race or recovery scenario actually exercised. |
| LIVE_SINGLE_HOST | Real native Codex path on SKYFORGE under its exact environment. |
| LIVE_REMOTE_BROWSER | Actual external/mobile-network browser -> Tencent -> SKYFORGE real Codex. |
| LIVE_TWO_HOST | Real selected Codex path on both required distinct Hosts. |
| OWNER_ATTENDED_LIVE | Exact authorized enrollment, recovery, lifecycle or Owner dogfood operation. |
| INDEPENDENT_EXACT_HEAD_REVIEW | Fresh separate read-only process examines literal SHA/tree and primary evidence. |
| HOSTED_CI | Exact workflow/run/head evidence if a workflow actually exists and ran. |

Skipped, unavailable, stale-source, mock and fixture evidence cannot be relabeled
as live product acceptance. G04A runs documentation checks and independent
review only; product/hosted/live tests are NOT_RUN.

## Kernel and first-use fault gates

| First goal | Required checks |
| --- | --- |
| G05 | Closed FleetCommand/plan/EdgeCommand contracts; Hub admission commit before delivery; Edge attempt flush before native write/spawn; duplicate/changed-ID/idempotency conflict; lost response before/after native start; native identity capture/unknown handling; exact Host/Environment/Workspace/runtime and lane fences; one local Edge/native writer; wrong principal/elevated token/root escape fail closed; local auth/Origin; visible ambiguity and blocked conflicting new IDs. Real prompt/stream is mandatory. |
| G06 | Strict TLS/Host enrollment/challenge and stale-key rejection; browser passkey/cookie/Origin/CSRF/recovery; unauthorized event/output denial; exact harmless Allow Once and Deny; target interrupt/terminal race/delivery-loss no re-emission; reconnect cursor gap/deduplication; expiry/fence; actual remote path and narrow/fold/keyboard layouts; quiesced local-to-cloud Hub cutover and cold-start admission. |
| G07 | Both actual Hosts/Workspaces, selection-versus-admitted-target invariance, stale generation/runtime reconnect, controller CAS/takeover/fence race, rotation/revocation including disconnected predecessor and independent credentials. |
| G08 | Browser/Hub/Edge/native restart, Hub-only/Edge-only/combined restore, response loss with and without native IDs, history/cursor/checkpoint/segment restoration, storage reopen/integrity/blob publication, frozen attempt markers, no replay effect and append-only ambiguity resolution. |
| G09 | Actual candidate qualification and exact confirmed target; source quiescence/reconciliation, stale proposal/changed capability rejection, new segment/continuity labeling; verified NO_QUALIFIED_TARGET when none qualifies. |
| G10 | Full two-host/mobile Owner dogfood; storage/WAL pressure/retention/database+blob backup and restore; upgrade/downgrade/rollback and installation diagnostics; credential/log/output boundaries; long/tool-heavy 10k history/virtualization/prepend/accessibility; release regression and independent exact-head acceptance. |

G05 may leave post-restart sessions RECOVERY_REQUIRED; it must never silently
replay. G06 reconnect means same verified Hub/Edge/native incarnation, not a
claim that G08 complete durable recovery is already implemented. Later required
Owner policies are evaluated at first use, not as G05 prerequisites.

## Recovery acceptance matrix

For Hub-only, Edge-only and combined restarts/restores, prove that the start gate
is closed before restored rows are usable. Full authority namespace plus runtime
nonce changes, old decisions/grants/commands reject, and predecessor native
evidence is reconciled before any new overlapping effect. A new generation,
timer expiry, PID/socket absence or user click cannot prove no effect.

Test unknown predecessor inventory, missing journal/tombstones, native ID loss,
old still-running native process, corrupted/incompatible backup and attempted
duplicate Edge/Hub activation. Missing evidence must leave quarantine visible.
Verify supported restore stops processes, replaces storage only while stopped,
and cold-starts admission; no live memory-snapshot continuation or clone/standby
promotion is accepted. Show browser access/session revocation after Hub recovery
and explicit Owner re-admission/reenrollment where identity continuity is lost.

No Anchor append/CAS, participant pin, permit renewal, SafetyControl or D/O/R
implementation/test suite is required in G05-G10. Their safety properties are
covered by this kernel matrix; old architectural qualification lists are
superseded by the amendment, not silently marked passed.

## G04A-only checks

Check all current Markdown links/anchors and JSON DAG; exact starting lineage;
Goal-only first commit; additive amendment coverage of all six ADRs; roadmap
dependencies/visible increments; current flags versus historical receipts;
unchanged research/fixtures/G03 evidence; documentation-only changed paths;
absence of product/package/dependency/CI/deployment artifacts; diff whitespace;
clean branch and live remote equality after normal push.

After committing/pushing the candidate, hand off the literal SHA/tree and scope
to a fresh read-only GPT-6 Astra max process. Verify actual model/effort/sandbox/
approval and tool admission from process evidence. All actionable findings,
including Low, require correction and fresh review. Maximum three
correction/review cycles; no self-acceptance or fabricated PASS on tool failure.
Any receipt-only final child also needs fresh exact-head review.
