# G05C Native Local Control closeout

```text
GOAL_ID=FLEETSPLICE-G05C-POST-REBOOT-RECOVERY-CLOSEOUT-005
START_HEAD=ba8c6fa84db528b9821be5aa672e8267ae744c70
START_TREE=37cccb8d342d65433330e90f342be9662fa49d28
BRANCH=docs/g05c-native-control-closeout
G05C_ACCEPTED=true
G06_STARTED=false
PRODUCT_IMPLEMENTATION_AUTHORIZED=NONE
PRIMARY_NATIVE_PATH=NATIVE_ADOPTED
ORIGINS=NATIVE_ADOPTED,FLEETSPLICE_MANAGED
NATIVE_ADOPTION_COMPATIBILITY=CAPABILITY_DRIVEN
VERSION_SHA_ROLE=EVIDENCE_AND_INCARCATION_METADATA
VERSION_SHA_NOT_PRODUCT_COMPATIBILITY_ALLOWLIST=true
LOCAL_SMOKE=PASS_TWO_FRESH_LANES
TYPECHECK=PASS
BUILD=PASS
TESTS=156_PASS_0_FAIL
WRONG_THREAD_FAILOVER=false
AUTO_MATERIALIZATION_USED=false
PERSISTENT_CONFIG_CHANGED_DURING_SMOKE=false
NEXT_OWNER_DECISION=PERSONAL_G05C_DOGFOOD
```

This committed candidate requires a matching external `FINAL-ACCEPTANCE.json`
and fresh separate read-only exact-head review with zero unresolved findings
before `PASS_G05C_NATIVE_CONTROL_CLOSEOUT`. Final HEAD/tree and push evidence
live in that external record to avoid self-referential commit identities.
Evidence root: `V:\artifacts\FleetSplice\FLEETSPLICE-G05C-POST-REBOOT-RECOVERY-CLOSEOUT-005`.
The [current status](../current-status.md) controls readiness. No merge or G06.

## Recovery and historical attempts

Phase 0 matched the expected branch, committed HEAD/tree, all 230 tracked-file
hashes and all three untracked-file hashes against audit-004. The two preserved
source/test paths and nine closeout documentation paths were intact. The
historical execution-history copy remains byte-identical.

Audit `FLEETSPLICE-G05C-THREAD-LIFECYCLE-OVERNIGHT-AUDIT-004` is
`INCOMPLETE_DUE_TO_OS_SERVICING_REBOOT`. Windows Event 1074 records SYSTEM's
TrustedInstaller planned OS upgrade restart, reason `0x80020003`, at
2026-09-13 03:03:38 and 03:04:36 +08:00; EventLog stop/start corroborates the
boundary. No missing audit phases or three-hour soak are claimed. Audit-004
was not modified, completed retrospectively or used as acceptance.

Old daemon: PID 69988, creation FILETIME `134336639632871106`, incarnation
`e64625fde05fa51d0868c7b00e3bb7a1d447891365fe91e4159e40bdf8fea899`.
New daemon: PID 43884, creation FILETIME `134337543732876247`, incarnation
`a904fa1b6c07474409164a4b1557e9731cc3ae18be8389fd141a700e598aaf6b`.
The native socket creation timestamp survived the reboot; PID creation and the
full composite identity establish the changed incarnation. Old Fleet authority
and browser controller leases were not reused.

Before any fresh fixture TUI, scoped native inventory/read/turns queries found
all six persisted Workspace threads readable, including P3 and both prior
smoke lanes. Stable copied state DB and rollout metadata were consistent.
Known unmaterialized thread `01a09601-02c9-78f3-95d3-721e72203bcd` was absent.

Closeout-001 had stopped before attach with an unclassified turns-list failure.
Fast-closeout-003 later passed Lane A and denied Lane B's approval, then held
on unbound `thread/read` `THREAD_UNAVAILABLE` before Lane B's TUI return.
Those incomplete attempts are retained as such; their PASS fragments do not
replace this goal's complete smoke.

## Final lifecycle diagnosis and correction

The initial old-daemon-only hypothesis was superseded when this goal's first
fresh Lane A reproduced an unbound discovery read failure. Its productive turn
completed and drained natively; no effect was retried. Its original TUI return,
empty approval state and clean journals were proved before supported shutdown.
The held attempt is preserved under `smoke`; accepted smoke is `smoke-corrected`.

Exact error-message SHA256 matching recovered the prior unavailable identity
`01a09673-18ab-7a63-abdc-6f9835a79be7` and fresh unavailable identity
`01a09978-a5d5-7f32-a1c5-3962c25788c7`. Native logs show idle thread teardown
at the corresponding failure times. Both identities return exact RPC -32600
`thread not loaded: <id>` and have no state-DB row or rollout. The prior identity
is `ABSENT_AFTER_REBOOT`. Confidence is high for these matched identities and
teardown events; the vanished candidates' Workspace/background purpose is not
inferred. This is a native loaded-inventory/discovery versus idle-teardown race,
not evidence of persisted-thread corruption or a failure confined to old cache.

The preserved unmaterialized fix excludes only exact pre-first-message
turns-list absence on unattached candidates. The one additional correction
excludes exact `thread not loaded: <same id>` at `thread/read` on unattached
identities from the existing bounded discovery inventory. It records
`NATIVE_THREAD_TEMPORARILY_UNAVAILABLE`, removes any stale attachable view and
continues independently proven candidates. Metadata-only loaded discovery may
not yet establish Workspace membership; exclusion never grants membership.
Later independent readable discovery must prove identity normally.

Neither correction sends a first message, resumes an unavailable thread,
fabricates history, substitutes another identity, replays effects or adds a
version allowlist. Already attached read failures and unknown errors remain
fail closed. Focused tests cover stale projection removal, both inventory read
paths, rediscovery, no input, exact binding, attached failure and error lookalikes.
All accepted 148 tests remain, plus four preserved and four additional tests.

After the two-lane smoke, a logging-only refinement ensured an earlier ephemeral
classification cannot suppress the later temporarily-unavailable reason for the
same ID. Its regression case and all required gates were rerun. The live smoke
predates this evidence-deduplication refinement; native exclusion and control
semantics are unchanged. The final independent review assesses that validation
boundary explicitly rather than treating the smoke as a second run of it.

## Fresh smoke and cleanup

Lane A: `01a09980-515c-7093-9f2f-a333ca6097ad`, ordinary `codex --yolo`, completed no-tool readiness.
Browser/controller/viewer evidence proves same daemon/thread/Workspace,
`NATIVE_ADOPTED`, terminal/Web provenance, continuation, Working, Done with
native duration, exact-turn Steer and Interrupt, observed residual drain,
viewer rejection and return to the original TUI. Lane A has no approval test.

Lane B: `01a09984-e2aa-7741-8c00-d8cc954b8763`, ordinary
`codex --sandbox read-only --ask-for-approval on-request`, no persistent override.
After Lane A released control, exact Lane B attachment observed native
`readOnly / on-request`. The controller denied the exact inspectable native
request to create `g05c-closeout-lane-b-denied-005.txt`; viewer approval was
rejected. One native decision resolved, no replay occurred, the file stayed
absent, and the same native thread completed a no-tool return in its original TUI.

Current persistent configuration fingerprints immediately before and after
smoke match, including the current user config SHA recorded externally. This
does not infer the historical writer of earlier P3 config drift. Cleanup proved
no unresolved FleetSplice effects or pending approvals, stopped only this goal's
demo and fixture TUIs after terminal/drain evidence, and left port 4319 free.
The official daemon remained running in the same post-reboot incarnation.

## Product boundary and remaining debts

Ordinary `codex --yolo` is the north-star local workflow. FleetSplice owns
control authority, not editor, Git, terminal, worktrees or environment. Windows
Terminal remains preferred. No wrapper, transparent PATH shim, ADE, embedded
editor/browser, Git GUI or ChatGPT Mobile clone is introduced. Native agents own
their tool/runtime semantics. Native adoption is capability-driven; historical
managed artifact qualification is scoped to `FLEETSPLICE_MANAGED` only.

Non-blocking debts remain: native Windows command popup; historical managed
fixture; dedicated file-change approval without complete native context;
turn/session permission grants that cannot be labeled Allow Once; historical
config writer UNKNOWN; real 2–4h+ endurance before final G06/v0.1 release.
This goal did not repeat a three-hour soak. These debts do not individually
reopen G05C. The next Owner decision is personal G05C dogfood, with separate
authorization required for any later G06 work.
