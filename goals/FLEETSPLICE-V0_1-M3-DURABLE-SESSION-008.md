# FLEETSPLICE-V0_1-M3-DURABLE-SESSION-008

## Objective

G08 — DURABLE SESSION AND RECOVERY. The Owner closes/restarts/disconnects
components and returns to the same honest Fleet session state.
VISIBLE_INCREMENT_RULE=true.

## Admission and scope

Require G07 PASS, accepted G03 plus G04A citations and D1a decisions before
backup/restore operations. Apply the
[amended recovery kernel](../docs/architecture/amendments/g04a-visible-mvp-simplification.md#restart-restore-and-rollback-fail-closed).

Add complete durable LogicalSession/SessionLane/NativeSegment, Hub/Edge recovery
journals, history/cursors, checkpoints, blobs and required search/pagination,
runtime attachment evidence and append-only ambiguity resolution. Minimum
dispatch journals and AMBIGUOUS_EFFECT already exist from G05.

## Failure and visible acceptance

Exercise browser close, Hub restart, Edge restart/reconnect, native restart and
response loss before/after dispatch with known and missing native identities.
Also exercise Hub-only/Edge-only/combined restored storage, old native work
still running, missing/corrupt evidence and conflicting new IDs.

Every server/runtime cold-start is admission-closed. Invalidate relevant
authority incarnations, generations and runtime identities, reject old
commands/decisions/permits, reconcile native evidence and prove exclusive
attachment/old execution closure. Require explicit re-admission/reenrollment
where appropriate before new effects. Neither restored counters nor timeouts
prove continuity; no live memory-snapshot/clone authority activation.

History/cursors/checkpoints return to the same Fleet LogicalSession with exact
segment/native continuity labels. Unknown possible effects stay visibly
AMBIGUOUS_EFFECT and quarantine conflicts, even if that blocks forever.
RESOLVED_NO_EFFECT evidence permits a new explicitly admitted intent; no blind
retry or rewrite of the old receipt.

Return DISPOSITION=PASS_M3_DURABLE_SESSION with real recovery evidence and
the full applicable fault matrix. Complete release storage/retention/update
qualification remains G10.
