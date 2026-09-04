# HAPI teardown

## Evidence boundary

Research used HAPI `main` at `980a921ba15665c54998a6ddb658103d467ff4cb` (2026-08-29), release `v0.29.0` (2026-08-19), current official documentation, selected source boundaries, and representative issues. HAPI is AGPL-3.0. Issue reports establish observed failure instances, not prevalence.

## Process topology

**FACT:** the documented deployment consists of:

```text
Web PWA / Telegram
       |
 REST + SSE
       v
HAPI Hub: API, routing, SQLite, session/machine/message state
       ^
       | Socket.IO / optional tunnel or relay
       |
HAPI CLI / Runner on execution machine
       |
 Codex app-server / ACP / headless CLI / RPC / PTY agent
```

The Hub may run locally or remotely. The web client is served with the Hub and consumes its API/event projection. The CLI/Runner launches and tracks agent processes near the workspace.

**FACT:** Hub SQLite records sessions, machines, messages, sequence/native IDs, activity, and model/reasoning metadata. Runner source also maintains a PID-keyed in-memory active-process map and can launch detached children. Native agents keep additional state in their own stores/processes.

**INTERPRETATION:** “HAPI session” spans at least four facts with different owners: a Hub record/projection, Runner tracking, OS process state, and native-agent state. A socket reconnect cannot by itself reconcile all four.

## Multi-machine routing and handoff

**FACT:** machine/Runner connections let the Hub route remote session commands to the Runner that owns an execution process. Optional tunnel/relay features improve reachability. The web client directs operations through the Hub rather than talking to the native agent.

**FACT:** current integrations are heterogeneous: Codex app-server, ACP agents, structured headless/NDJSON or RPC paths, local wrappers, and fallback terminal behavior. Resume, model switching, MCP, permissions, telemetry, and native identity differ by adapter.

**INTERPRETATION:** the useful idea is a local execution representative with an outbound/control connection. The unsafe inference is that every adapter now has equivalent lifecycle or continuity semantics.

**RECOMMENDATION:** FleetSplice should expose per-driver capability and conformance evidence and retain native identifiers. “Remote handoff” means either reattachment to the same native/process authority or a new segment with a capsule; it is never a UI routing flag.

## Permission flow

**FACT:** HAPI transports agent-specific approval/input requests through its Runner/Hub/UI path, but the shapes and available decisions depend on the underlying adapter.

**INTERPRETATION:** a unified approval UI is valuable only if it retains native action identity, cwd/Environment, requested privileges, expiry, and decision set. Normalizing away those fields changes security semantics.

**RECOMMENDATION:** adopt the user experience, not the assumption of equivalent permission contracts. Fleet's Edge enforces local authority and its UI presents normalized plus native detail.

## Restart, update, and recovery evidence

Representative issue reports reveal concrete split-authority failures:

| Issue | Reported behavior | Failure class |
| --- | --- | --- |
| [#915](https://github.com/tiann/hapi/issues/915) | Hub/systemd restart cascaded to Runner/children; many sessions archived; one lost a cursor/session link in a persistence race | lifecycle coupling and non-atomic identity persistence |
| [#929](https://github.com/tiann/hapi/issues/929) | detached children survived Runner restart, but the new Runner's empty PID map could not discover/control them | volatile process ownership without cold-start reconciliation |
| [#1307](https://github.com/tiann/hapi/issues/1307) | Pi reopen replaced/removed active state before native resume succeeded | destructive state transition before proving successor |
| [#565](https://github.com/tiann/hapi/issues/565) | failed Codex retry lost apparent thread context | ambiguous native request/retry and identity |
| [#338](https://github.com/tiann/hapi/issues/338) | resumed native history did not appear correctly in UI | durable native state versus product projection |
| [#833](https://github.com/tiann/hapi/issues/833) | duplicate/orphan session UI state | projection/identity reconciliation |
| [#446](https://github.com/tiann/hapi/issues/446) | wrong session/thread routing | alias/routing identity |

**FACT:** the Codex remote launcher source explicitly recognizes indeterminate transport outcomes and cannot safely replay an unproven steer after a Runner restart.

**INTERPRETATION:** these are not all “rapid project bugs.” #915, #929, #1307 and the indeterminate-launch path expose architecture classes: volatile ownership, duplicated lifecycle authority, non-atomic successor transitions, and no general native reconciliation/replay contract. Individual mapping/UI defects can be fixed, but the class recurs until identities and authority are separated.

## Windows behavior

**FACT:** HAPI issue reports include Windows/WSL process, hook and identity failures, including [#491](https://github.com/tiann/hapi/issues/491), [#566](https://github.com/tiann/hapi/issues/566), and [#899](https://github.com/tiann/hapi/issues/899).

**INTERPRETATION:** these reports do not prove HAPI cannot run on Windows. They show that “machine” plus inherited process environment is insufficient to reason about normal-user, elevated, WSL, hook, pipe, and terminal semantics.

**RECOMMENDATION:** FleetSplice makes Environment explicit and qualifies each driver in user/admin/WSL separately.

## Provider/model semantics

**FACT:** HAPI stores and displays model/reasoning/provider-adjacent metadata, but actual provider configuration and context behavior remain adapter/native-runtime concerns. Issue [#1631](https://github.com/tiann/hapi/issues/1631) reports lost or fallback Codex context/provider configuration; [#1428](https://github.com/tiann/hapi/issues/1428) reports Cursor ACP model-wire/catalog drift on resume, including a persisted bracketed model form that no longer matched the live catalog form.

**INTERPRETATION:** fast-moving native model catalogs and configuration conventions are upstream churn. The architectural weakness appears when a central session row or UI label is treated as stronger evidence than the active native binding.

**RECOMMENDATION:** store an observed binding snapshot per NativeSegment. Do not make HAPI-style product metadata the provider authority.

## Why regressions recur

| Cause | Architectural or churn? | Thin-Edge consequence |
| --- | --- | --- |
| Hub record, Runner map, OS process and native session disagree | architectural | Edge journal and reconciliation own local truth; Hub projection carries confidence |
| response/result lost during remote command | architectural | operation-specific idempotency and explicit ambiguity |
| session replacement occurs before resume succeeds | architectural | create/admit successor, then transition; never destroy predecessor speculatively |
| live event stream misses/reorders UI updates | architectural when no read/replay repair exists | durable event cursor plus snapshot/read reconciliation |
| upstream method/field/model IDs change | rapid upstream change | version/schema/capability probes and compatibility matrix |
| hook/sandbox/PTY behavior changes by platform | both | native structured path first; per-Environment conformance |
| model/provider account configuration changes | mostly upstream/config churn | Environment-local provider binding and explicit migration |

## Would a thinner Hub remove the failures?

**INTERPRETATION:** a thinner *process-authority* Hub removes several failure classes only if the Edge becomes more durable, not merely smaller. Moving PID tracking out of the Hub while retaining an in-memory Runner does not help.

**RECOMMENDATION:** the Fleet Hub owns logical history and intent; the Edge owns an embedded journal, native/process identities, attachment evidence, idempotency and event spool. Hub restart does not cascade process shutdown. On reconnect, the Edge presents snapshot/cursors and reconciles named effects before accepting duplicates.

This design reduces lifecycle coupling, stale remote truth, and blind respawn. It does **not** eliminate upstream schema churn, native history bugs, Windows platform defects, or opaque provider state. Those remain driver compatibility and conformance work.

## Disposition

### ADOPT IDEA

- unified remote/mobile-capable session UI;
- execution representative near the workspace;
- outbound/reachable host connection;
- native structured adapters before PTY wrapping;
- capability-gated agent features;
- explicit human approval flow;
- separating web/control presentation from agent processes.

### REJECT IDEA

- HAPI Hub/Runner topology as Fleet's authority or recovery model;
- one overloaded session identity spanning Hub row, process, native thread and UI;
- volatile PID maps as sufficient process ownership;
- treating a live socket/event stream as durable reconciliation;
- assuming provider/model labels make adapters semantically uniform;
- Hub lifecycle cascading into remote native process lifecycle.

### COMPATIBILITY ONLY

HAPI can be studied or, if later justified, addressed as an external versioned process/API. Its AGPL implementation code must not enter FleetSplice's MIT source. Compatibility must map HAPI row, machine, native session and provider binding separately and cannot promote HAPI projection to Fleet truth.

## Open questions

- which current HAPI APIs are stable enough for an optional compatibility adapter;
- how surviving native processes could be rediscovered without HAPI's original Runner state;
- exact event replay/snapshot behavior for every current adapter;
- whether any externally supported HAPI mode exposes sufficient generation/receipt identity;
- licensing and distribution obligations of a future optional compatibility mode.

## Primary evidence

- [How HAPI works](https://hapi.run/docs/guide/how-it-works)
- [HAPI deployment](https://hapi.run/docs/guide/deployment)
- [HAPI agents](https://hapi.run/docs/guide/agents)
- [Hub session store](https://github.com/tiann/hapi/blob/980a921ba15665c54998a6ddb658103d467ff4cb/hub/src/store/sessions.ts)
- [Hub store types](https://github.com/tiann/hapi/blob/980a921ba15665c54998a6ddb658103d467ff4cb/hub/src/store/types.ts)
- [Runner source](https://github.com/tiann/hapi/blob/980a921ba15665c54998a6ddb658103d467ff4cb/cli/src/runner/run.ts)
- [Codex remote launcher](https://github.com/tiann/hapi/blob/980a921ba15665c54998a6ddb658103d467ff4cb/cli/src/codex/codexRemoteLauncher.ts)
