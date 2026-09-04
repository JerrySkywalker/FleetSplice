# FLEETSPLICE-V0_1-M2-DAILY-CONTROL-007

## Objective

Make the two-host loop usable for real daily remote coding control.

## Scope

Implement and surface:

- `approval.resolve` with exact approval revision/action digest;
- `turn.interrupt` and exact target identity;
- SessionLane acquire/release/takeover with controlEpoch + laneMutationRevision;
- human takeover pauses automation but never implicitly interrupts;
- browser reconnect/resume;
- approval attention view and primary W1 control sidebar;
- minimal single-owner remote WebUI authentication/recovery chosen in G04.

## Acceptance

- second browser/client becomes viewer, not hidden writer;
- explicit takeover fences old controller;
- harmless Codex approval can be allowed once or denied remotely;
- interrupt request is distinct from target turn terminal state;
- browser close/reopen restores current Fleet projection without duplicate effect;
- no privilege escalation through approval payload.

Return `DISPOSITION=PASS_M2_DAILY_CONTROL`.