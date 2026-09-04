# FLEETSPLICE-V0_1-M1-TWO-HOST-LOOP-006

## Objective

Prove FleetSplice is actually a Fleet control plane by controlling SKYFORGE-01 and ZenBook Duo from one WebUI.

## Scope

- authenticated outbound Edge-to-Hub control transport selected by the accepted implementation contract;
- Host/Environment enrollment and generation fencing;
- SKYFORGE-01/windows-user and ZenBookDuo/windows-user;
- existing workspace registration on either host;
- remote Codex start/continue/prompt/stream through the same FleetCommand path;
- online/stale/unknown projection.

## Hard truths

Offline/stale is not stopped. Reconnect cannot silently create a new Host generation or retarget an admitted command.

## Acceptance

From one browser URL:

1. both hosts and environments are visible;
2. owner selects a ZenBook Duo workspace;
3. creates/continues a LogicalSession;
4. submits a prompt;
5. the ZenBook Codex performs the work;
6. output streams back through Hub to WebUI;
7. reconnect preserves exact host/environment identity.

If either required host is genuinely unavailable, report `BLOCKED_REQUIRED_HOST_UNAVAILABLE`; do not fake two-host acceptance.

Return `DISPOSITION=PASS_M1_TWO_HOST_LOOP`.