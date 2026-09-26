# FLEETSPLICE-PORTABLE-P06-OWNER-EXPERIENCE-HANDOFF-001

Purpose: perform final automated qualification, merge the portable-host train,
prepare the installed candidate, and stop immediately before the first manual
Owner experience.

## Final qualification

Run at minimum:

- `npm run check`;
- `npm run tokens:check`;
- focused portable-host/native-adoption suites;
- full serial suite;
- default-concurrency full suite;
- build/package;
- exact installed-product smoke;
- privacy/secret/path scan;
- `git diff --check`.

Do not relabel unavailable or Owner-attended checks as PASS.

## Final PR and merge

Create one PR from `train/portable-host-runtime-001` to
`train/pre-gate-s-development-001`.

Obtain a fresh independent read-only exact-head Codex review. Correct all
findings and repeat until zero unresolved findings or a hard blocker.

When clean, the unattended train is authorized to merge that PR into the train
branch. Verify exact ancestry and build/install the final local candidate from
the merged head.

No main merge.

## Owner experience package

Write:

`C:\Dev\artifacts\FleetSplice\FLEETSPLICE-PORTABLE-HOST-RUNTIME-TRAIN-001\OWNER-FIRST-EXPERIENCE.md`

It must contain only the minimal manual steps for the first ZenBook14 experience:

- start/open FleetSplice;
- start or attach Codex through the supported launch path;
- open local FleetSplice Web/Desktop;
- identify the same native thread;
- suggested harmless prompt/Steer/Interrupt/approval exercise;
- pause/resume sharing;
- browser reconnect;
- return to TUI;
- one Owner-attended Modern Standby sleep/wake observation;
- how to stop/rollback the local candidate.

Do not execute those Owner actions automatically.

## Terminal PASS

```text
DISPOSITION=PASS_PORTABLE_HOST_RUNTIME_OWNER_EXPERIENCE_READY
FIRST_LIVE_G06_EDGE=ZENBOOK14
ZENBOOK14_REAL_LOCAL_E2E=PASS
INSTALLED_PRODUCT_READY=PASS
OWNER_FIRST_ZENBOOK14_EXPERIENCE_READY=true
REAL_MODERN_STANDBY_OWNER_ACCEPTANCE=PENDING_OWNER_EXPERIENCE
TENCENT_DEPLOYED=false
GATE_S_ADMITTED=false
LIVE_G06_ACCEPTANCE=false
G07_STARTED=false
```

Then STOP.
