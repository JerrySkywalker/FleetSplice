# DeepSeek Harness, Cordis, and self-iteration

## Evidence boundary

The inspected DeepSeek Harness revision is `d347e703908d0406b7a7ef80e3a0e594d86b2215` (2026-09-04), package version `0.1.3-alpha.1`, MIT. It had no stable GitHub release at the evidence cut. The design is therefore useful current evidence, not a stable dependency contract.

## What Cordis and DSH actually do

**FACT:** Cordis composes plugins that provide services, typed events, and reversible effects. Plugins declare dependencies through injection; registrations have disposers and lifecycle scopes.

**FACT:** DeepSeek Harness deliberately applies this mechanism pervasively: model adapters, tools, session log, context management, and the Agent Loop are plugins rather than a privileged product core.

**FACT:** the session subsystem uses an append-only typed `SessionEvent` log. Durable model-visible request/context facts are separated from live process-local stream chunks. Attempt failure, retry, cancellation, and settlement are explicit, and reconstruction rejects unknown required event types rather than silently ignoring them.

**FACT:** agent ownership has create/resume/dispose scope, status, cancellation, idle, maintenance, follow-up, steering, and provider/model route options.

**FACT:** DSH supports live profile patching in some interactive modes, but applies startup-only profiles in headless/SDK/ACP modes where live replacement would invalidate owned work.

## Transferable concepts

**RECOMMENDATION — ADOPT IDEA:**

- distinguish durable semantic facts from transient token/terminal deltas;
- make attempt and settlement state explicit rather than overwriting failed attempts;
- build projections from append-oriented typed events;
- fail closed when an event required for reconstruction is unknown;
- scope extension registrations and require reversible disposal;
- expose dependency/capability introspection;
- compose driver/context/UI behavior per session rather than through one global singleton;
- fork only at an explicit causal boundary.

**INTERPRETATION:** these ideas improve inspectability without requiring FleetSplice to adopt Cordis or its “everything is a plugin” premise.

## Where the analogy fails

**INTERPRETATION:** FleetSplice's Edge is a remote execution security boundary. A plugin capable of changing command admission or durable recovery can invalidate the very journal and identity evidence needed to contain it.

**REJECT IDEA:** no privileged core. FleetSplice requires a small privileged kernel whose behavior is not replaceable by a session or Agent.

The following may never be hot-replaced by an Agent-controlled extension:

1. host and Environment identity/enrollment;
2. transport authentication and message admission;
3. actor authorization and privilege-boundary enforcement;
4. command journal, idempotency scope, and receipt integrity;
5. host/environment/resource generation validation;
6. secret storage, resolution, redaction, and injection boundary;
7. durable-state integrity, migration, and recovery rules;
8. process ownership, launch identity, and reconciliation authority;
9. audit event integrity and mandatory security filtering;
10. update signature/hash verification, activation, and rollback authority.

**RECOMMENDATION:** initial extensions are built-in or out-of-process adapters selected from a trusted, versioned manifest. They receive scoped capabilities, typed inputs, quotas, and a revocable lifecycle. Agent-specific UI extensions are declarative or separately trusted bundles; arbitrary server-supplied JavaScript never executes in the Fleet shell.

Provider adapters, context policies, normalized renderers, compatibility processes, and search/index implementations are reasonable perimeter extension points. Durable schema writers require stronger review and migration compatibility than a renderer.

## Self-hosting versus self-modification

**RECOMMENDATION:** FleetSplice may eventually expose the same workspace, worktree, session, tool, and receipt APIs to an agent working on FleetSplice itself.

**INTERPRETATION:** that is self-hosting. It becomes unsafe self-modification only when the work session can replace the running trust kernel, rewrite evidence, broaden its grant, or activate its own output without an independent boundary.

**RECOMMENDATION:** modify `stable-N-develops-N+1` into an explicit update protocol:

```text
stable N admits bounded development work
  -> separate N+1 worktree and NativeSegments
  -> ordinary tests and immutable receipts
  -> external/independent review
  -> compatibility and data-migration check
  -> canary under explicit update authority
  -> health/rollback decision made outside N+1
```

N+1 cannot alter N's host identity, journal, authority grant, update verifier, or acceptance result. A failed canary returns to the exact known N state where data compatibility permits. Durable migrations require forward/backward or restore evidence before activation.

## Per-session composition constraints

A future composition manifest should be immutable for a NativeSegment and record:

- exact component IDs, versions, hashes, and provenance;
- capabilities granted to each component;
- service/event dependencies and supported schema versions;
- selected provider/context/tool policies;
- durable event types the component can emit;
- disposal and crash behavior;
- compatibility result against the current kernel.

A changed composition opens a new segment even if the native thread survives. This makes failures and capability changes auditable.

## Open questions

- whether Fleet extensions need a language-neutral subprocess protocol or only compiled-in drivers in v0.x;
- how extension schemas evolve without letting optional events become silent required state;
- which renderers can safely consume native payloads after redaction;
- how an update canary observes user/admin/WSL environments without acquiring broader authority;
- what independent acceptance process is sufficient for N+1;
- how to recover if a migration commits before the new binary is healthy.

DSH does not answer multi-host command replay, host enrollment, remote event cursors, privilege separation, or update trust. It remains a design reference, not a FleetSplice core dependency.

## Primary evidence

- [DeepSeek Harness architecture at the researched commit](https://github.com/deepseek-ai/deepseek-harness/blob/d347e703908d0406b7a7ef80e3a0e594d86b2215/docs/architecture.md)
- [Cordis primer at the researched commit](https://github.com/deepseek-ai/deepseek-harness/blob/d347e703908d0406b7a7ef80e3a0e594d86b2215/docs/cordis-primer.md)
- [Session subsystem at the researched commit](https://github.com/deepseek-ai/deepseek-harness/blob/d347e703908d0406b7a7ef80e3a0e594d86b2215/docs/subsystems/session.md)
- [Core subsystem at the researched commit](https://github.com/deepseek-ai/deepseek-harness/blob/d347e703908d0406b7a7ef80e3a0e594d86b2215/docs/subsystems/core.md)
