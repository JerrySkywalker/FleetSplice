# FLEETSPLICE-SELF-HOSTING-016

## Objective

Prove FleetSplice version N can safely participate in developing N+1 without granting the candidate authority to activate itself.

## Scope

- stable N remains the trusted control plane during N+1 work;
- N+1 develops in a separate workspace/worktree/installation generation;
- explicit bounded grant and exact repository/workspace identity;
- development session, tests, build artifacts, receipts, compatibility evidence;
- canary install/start isolated from stable N;
- migration/upgrade verification and rollback;
- external/owner acceptance before activation;
- N+1 cannot overwrite/stop/replace stable N merely because its tests pass.

## Failure cases

Exercise bounded candidate crash, incompatible schema/driver generation, failed canary, rollback, and stale candidate activation attempt.

## Acceptance

A real FleetSplice change is developed through FleetSplice-controlled Agents, produces reviewable evidence, runs as a separate canary, and is either promoted only after external acceptance or safely rolled back. Stable N remains recoverable throughout.

Return `DISPOSITION=PASS_SELF_HOSTING_ACCEPTED`.