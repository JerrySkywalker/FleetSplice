# FLEETSPLICE-V0_1-M3-DURABLE-SESSION-008

## Objective

Make LogicalSession history and recovery durable across browser, Hub, Edge, and native-process disruption.

## Scope

- full v0.1 LogicalSession/SessionLane/NativeSegment persistence;
- Hub SQLite canonical state/history/receipts/checkpoints/FTS as required;
- Edge SQLite command/idempotency/resource/spool journal;
- content-addressed blob store for large outputs/native detail;
- stable history pagination/cursors and W7 continuity view;
- checkpoint creation;
- reconnect/reconciliation;
- explicit `AMBIGUOUS_EFFECT` and later append-only resolution.

## Failure acceptance

Exercise safe failure injection for browser close, Hub restart, Edge restart/reconnect, response loss around native dispatch, and known native ID reconciliation.

Never blind-retry a possibly side-effecting native turn.

## Acceptance

History survives restart, running/native truth is not inferred from transport presence, duplicate commands remain deduplicated, and ambiguity is visible rather than hidden.

Return `DISPOSITION=PASS_M3_DURABLE_SESSION`.