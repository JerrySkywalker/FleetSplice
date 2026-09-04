# Session Model

## Two session identities

FleetSplice must not equate a vendor-native conversation with the user's durable work session.

- **LogicalSession** — user-facing work identity, durable history, objectives, checkpoints, and continuity.
- **NativeSession** — actual Codex thread, ACP session, OpenCode session, process, or another runtime-owned identity.

A `NativeSegment` records when one native session served one logical session.

## Why segmentation exists

A segment boundary may occur because of:

- provider failure or deliberate provider change;
- agent change;
- native context compaction or incompatibility;
- host/environment migration;
- runtime upgrade or unrecoverable native-session failure;
- deliberate user checkpoint/handoff.

FleetSplice should never claim an in-place hot switch when an agent actually requires a new native session.

## Provider switching capability

Provider behavior should be capability-driven, with concepts such as:

- bind at native-session creation;
- bind at resume;
- switch in place;
- migrate only through a new native segment;
- unsupported.

The exact capability names remain provisional.

## Logical state

A logical session may need states such as active, waiting, paused, degraded, completed, or archived, but the state machine is not frozen. Native observed state remains separate.

## Human-visible transition

When FleetSplice creates a new native segment, the WebUI should expose the transition: old/new host, environment, agent, provider/model, native identity, and what context was transferred.

## Open questions

- whether multiple native sessions may simultaneously contribute to one logical session;
- subagent representation;
- how to reconcile agent-native forks with FleetSplice logical forks;
- which native metadata is durable versus diagnostic;
- how approvals and in-flight turns behave across disconnect and migration.
