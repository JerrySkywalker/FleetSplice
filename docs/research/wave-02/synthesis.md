# Wave 02 synthesis

## Status

- Goal: `FLEETSPLICE-ARCH-RESEARCH-WAVE02`
- Parent research HEAD: `7785000cdb2d019c14f507e319e0bf6d507b3847`
- Evidence cut: 2026-09-04
- Mode: architecture semantic closure and qualification
- `ARCHITECTURE_0_1_READY=false`
- `IMPLEMENTATION_AUTHORIZED=false`
- `PRODUCT_IMPLEMENTATION_AUTHORIZED=false`

This is research for owner review. It is not Architecture Baseline 0.1 and grants no implementation authority.

## Central answer

**RECOMMENDATION:** Architecture 0.1 can now be drafted in a separate owner-authorized goal. The architecture-invalidating gaps left by Wave 01 have a coherent closure:

1. every external mutation is one typed `FleetCommand` family through the Hub;
2. typed read resources/projections, immutable receipts, normalized history, and cursor event subscriptions are observation only;
3. each SessionLane has one actor+client controller epoch and many authorized viewers;
4. one immutable capability grant revision is evaluated per command, with exact resource lineage and a separate admin boundary;
5. the Hub freezes a `ResolvedExecutionPlan` and emits exact generation-fenced EdgeCommands; identities never collapse;
6. driver compatibility is admitted per artifact/schema/protocol/capability/conformance fingerprint;
7. Codex native ambiguity and recovery limits are explicit rather than hidden behind retry;
8. the Windows default is a per-user Edge plus separate admin/WSL companions;
9. v0.x stores Hub/Edge authority in separate patched local SQLite databases and large content in blobs;
10. Hub/Edge/WebUI are TypeScript-first, with a narrow out-of-process native Windows helper;
11. assistant-ui is the conversation candidate behind Fleet-owned state, with only selective OpenHands leaf/pattern reuse;
12. isolated OpenCode ACP v1 conformance proves the model is not Codex-specific;
13. provider migration is suggested only after probes and always user-confirmed; there is no transparent failover;
14. Coordination Loop is irrelevant to core correctness and is not a 0.1 prerequisite.

## Imported Wave-01 premises

Wave 02 does not re-prove the process-thin/stateful Hub, host-authoritative Edge, HCP below product semantics, Agent/Provider separation, LogicalSession → SessionLane → NativeSegment, explicit placement/no scheduler, no transparent failover, Edge-owned native protocols, or Fleet-owned history/UI authority. Those remain the input in [Wave-01 synthesis](../wave-01/synthesis.md).

`OWNER_DECISION_001` supersedes only the Coordination Loop emphasis: it is single-machine-first and an independent optional client, not a Fleet scheduler, architecture consumer, or dependency. Baseline 0.0 is preserved as historical working hypotheses even where its research-gate wording is now superseded.

## Required decision ledger

The counts below apply to exactly these 15 decisions. A `READY_FOR_0_1` item can retain normal implementation/conformance gates; it means its architecture contract is sufficiently determined.

| ID | Required decision | Classification | Explicit recommendation | Residual gate |
| --- | --- | --- | --- | --- |
| D01 | FleetCommand envelope and families | `READY_FOR_0_1` | closed versioned discriminated union; stable ID/actor/grant/typed target/preconditions/idempotency/deadline/correlation/payload digest; small explicit families | finalize schema syntax/ID format and per-driver reconcilers |
| D02 | mutation versus observation | `READY_FOR_0_1` | FleetCommand is the only mutation; typed resources/projections, FleetReceipt, FleetEvent, history and subscriptions are read-only | select REST/GraphQL/stream transports during design |
| D03 | multi-client/writer model | `READY_FOR_0_1` | one lane controller bound to actor+client instance; monotonic control epoch and CAS mutation revision; many viewers; explicit takeover | test Hub CAS and Edge epoch ordering |
| D04 | AuthorityGrant model | `READY_FOR_0_1` | immutable capability grant, one revision per command, exact Host/Environment/Workspace/session lineage, provider/model/time/approval bounds, no general delegation | choose bootstrap/remote-auth UX and test revocation/admin companion |
| D05 | FleetCommand → EdgeCommand | `READY_FOR_0_1` | immutable resolution plan; exact per-step Edge IDs/generations; no retry retarget; finite typed composites only | select HCP framing/transport and minimal composite list |
| D06 | Codex native failure semantics | `READY_FOR_0_1` | Edge-owned explicit `--stdio`; journal before native dispatch; known-ID reconciliation; list miss is not absence; blind retry prohibited; ambiguity terminal and append-only | authenticated stream/approval/provider cases remain capability tests |
| D07 | Agent compatibility admission | `READY_FOR_0_1` | artifact+runtime+schema+protocol+capability+behavior fingerprint; `QUALIFIED`/`QUALIFIED_WITH_LIMITS`/`UNKNOWN_UNQUALIFIED`/`UNSUPPORTED`/`QUARANTINED`/`MISSING`; no silent auto-update | implement conformance suite and artifact rollback packaging |
| D08 | Windows Edge topology | `READY_FOR_0_1` | interactive per-user Edge, separate authenticated admin/WSL companions, no default Session-0 Agent owner | owner-attended logout/reboot/UAC/ConPTY/WSL lifecycle acceptance |
| D09 | storage engine/binding direction | `READY_FOR_0_1` | patched SQLite for separate Hub and Edge databases; local WAL/FULL for authority; filesystem blobs; Node `node:sqlite` preferred, better-sqlite3 fallback | pin runtime, test power/concurrency/blob restore and final binding package |
| D10 | TypeScript versus native helper | `READY_FOR_0_1` | `TS_PLUS_NATIVE_HELPER`: TS coordinator/drivers; narrow native process for ACL/token/Job/process/DPAPI/ConPTY/update/path primitives | disposable helper and slow-consumer qualification |
| D11 | WebUI donor | `NEEDS_TARGETED_TEST` | public assistant-ui behind Fleet adapter; selective OpenHands file-tree/pattern; no private UI/full Agent Canvas dependency | synthetic browser test for long/tool-heavy/prepend/reconnect/blob/virtualization behavior |
| D12 | ACP generic-driver viability | `READY_FOR_0_1` | OpenCode 1.18.16 ACP v1 qualifies create/prompt/stream/tool/approval/cancel/load/restart/resume/list/model-selector semantics in isolation | real-provider, active-process-loss, terminal/filesystem, concurrent-client tests per capability |
| D13 | provider migration behavior | `READY_FOR_0_1` | `SUGGESTED_PLUS_USER_CONFIRMED`; new segment, normally new native ID/reconstructed continuity; no transparent failover | cross-host TLS/auth/tool/context and exact Codex transition qualification |
| D14 | remaining unresolved scope | `DEFER_POST_0_1` | scheduler, transparent failover, enterprise tenancy, mobile/macOS, marketplace, universal routing, workspace sync, A2A, Coordination Loop adapter, general Driver SDK remain outside 0.1 | revisit only from demonstrated product need |
| D15 | may Architecture 0.1 now be drafted? | `NEEDS_OWNER_DECISION` | **yes, recommended**; start a separate drafting goal that cites Wave 01, Wave 02, and this owner correction | owner must authorize draft; later acceptance alone may set readiness |

## Counts

| Classification | Count |
| --- | ---: |
| `READY_FOR_0_1` | 12 |
| `NEEDS_OWNER_DECISION` | 1 |
| `NEEDS_TARGETED_TEST` | 1 |
| `DEFER_POST_0_1` | 1 |
| **Total** | **15** |

## FleetCommand closure

The public envelope contains schema/kind version, client-persisted command ID, Hub-derived actor, exact evaluated grant, typed Fleet target and preconditions, optional Hub-scoped idempotency key, audit issue time, authoritative deadline, bounded causal/external references, typed payload, and canonical digest. Hub retains a broader immutable intent digest.

Required families cover existing-workspace registration; LogicalSession metadata/lifecycle; lane control/fork/continue/migration; turn submit/steer/interrupt; command cancellation; approval; checkpoint; and grant issue/revoke. Logical creation does not implicitly start an Agent, submit does not silently steer, deadline does not cancel, and no native-any RPC exists.

Lifecycle facts remain separate:

```text
command accepted
-> Hub admitted/resolved
-> EdgeCommand admitted
-> Edge effect started
-> native operation started (when observable)
-> command terminal

turn terminal and LogicalSession terminal are independent axes
```

Exact duplicate returns the recorded receipt. Reusing command ID or scoped idempotency key with changed semantics is a no-effect conflict. `AMBIGUOUS_EFFECT` applies only where an external/native boundary may have been crossed without reconcilable identity; later evidence appends a resolution rather than rewriting the ambiguity.

## Observation closure

Fleet reads expose freshness, confidence, completeness, resource revision, authorization filtering, and source watermarks. History uses a stable snapshot watermark and opaque before/after cursors; replay gap requires resync. Durable events deliver at least once and ephemeral token/terminal deltas may coalesce. A projection may be a precondition source but never mutates authority.

CloudEvents can later wrap an external event projection, and W3C trace context can map telemetry. Neither becomes the internal mutation or event authority. A2A remains a possible future facade only.

## Writer and grant closure

Lane control is not a time-based claim over a repository. Disconnect enters a bounded reconnect-grace projection; active native work continues. Takeover raises epoch, pauses automation, awaits the Edge fence, and does not interrupt implicitly. Submit/steer/interrupt races resolve by Hub CAS and exact active-turn identity. External native activity degrades control until reviewed adoption, fork, or reattachment.

Grants are immutable allow capabilities over explicit lineage tuples. Omitted scope never means wildcard, rights from multiple grants do not union for one command, browser credentials do not flow to Edge, and normal-user authority cannot turn into admin authority via an approval payload. General delegation and enterprise policy languages are deferred.

## Resolution and compatibility closure

The Hub may auto-resolve only a unique already-selected binding. Multiple lanes, stale unknown placement, provider change, privilege change, capability gap, external native writer, or continuity choice needs explicit input. Once any Edge step admits or may have started, the plan freezes; retry never moves it elsewhere.

Driver admission is capability-scoped. A new binary/schema digest creates a new installation generation, but a raw digest difference does not automatically mean incompatibility. Required shape/behavior probes decide affected capabilities; unknown terminal/approval semantics fail that operation closed. Active segments remain bound to their original exact record through an update.

## Qualification summary

### Codex 0.153.2

Observed exact binary/schema identity; explicit `--stdio` requirement; initialize gating; thread start/read/list divergence; turn start/steer/interrupt; EOF and hard-kill differences; known-ID restart/read/resume; lost start-response ambiguity; and same-thread model transition. Isolated no-auth prevented successful stream, approval, and provider cases. That limits capabilities, not the failure architecture.

### Windows

Observed medium-integrity interactive user context, explicit PowerShell paths, same-user/session child launch and survival, same-user Node pipe and loopback IPC, ReFS/NTFS facts, and WSL 2 user/path discovery. Disruptive lifecycle/elevation/ACL/ConPTY tests remain owner-attended.

### Storage and runtime

Node 24's SQLite 3.53.3 completed 1M event+FTS rows, keyset/offset comparison, 10k durable journal commits, WAL checkpoint, online backup, crash/reopen, migration, and integrity checks in a disposable fixture. Results qualify features, not capacity. Node handled ordinary Edge protocol/process/IPC/WSL work; missing Win32 primitives justify the helper.

### WebUI

Pinned package/source analysis supports public assistant-ui's external-store seam and approval/message model. It also found non-virtualized defaults, private UI coupling, and no first-class large-output reference. OpenHands full Agent Canvas is 50-dependency/~66 MiB unpacked and tightly domain-coupled; file-tree patterns are the strongest leaf candidate. No browser runtime benchmark ran.

### ACP and provider

OpenCode ACP v1 passed a disposable loopback conformance sequence including a harmless approved tool and cancellation; load after process restart replayed history. A live model/provider selector changed, but load restored the original model, proving Fleet must own binding history.

Ollama 0.33.2 was reachable locally by native and OpenAI-compatible metadata paths with one model entry suppressed. Codex/OpenCode document adapters, but no inference POST was issued. Same-host reachability is not cross-host TLS/auth/tool fidelity.

## What remains unresolved

### Required before claiming an affected implementation capability

- authenticated Codex stream, pending approval/disconnect, active-turn loss, and provider transition;
- browser long-history/tool/approval/prepend/reconnect/blob/virtualization measurements;
- native helper ACL/Job/handle/DPAPI/ConPTY/update-verifier behavior;
- owner-attended Windows logout/reboot/sleep/UAC/WSL lifecycle;
- SQLite power loss, multi-thread pressure, migrations/rollback, and full database+blob restore;
- real cross-host inference security/reachability and end-to-end Agent tool/context behavior;
- Hub CAS/revocation/Edge fencing fault injection.

These are capability and acceptance gates. Unsupported/unqualified features remain off; they do not force another broad architecture survey.

### Owner policy defaults for the later baseline/product design

- local owner bootstrap and remote phone authentication/recovery;
- sensitive native/approval data classes visible to remote clients;
- reconnect-grace duration and automation reclaim default;
- persistent native approval choices (recommended disabled initially);
- retention/encryption/backup policy and installation/update distribution.

### Deliberately deferred

Automatic scheduling, transparent provider failover, multi-user enterprise tenancy, native mobile/macOS, marketplace, general workspace synchronization, universal model routing, Coordination Loop integration, A2A implementation, and a public third-party Driver SDK.

## Top findings

1. FleetCommand and EdgeCommand are different identities separated by a durable resolution record.
2. One mutation abstraction does not mean one untyped operation; typed families preserve safety and evolution.
3. Lane control plus capability grants solves multi-client concurrency without a distributed lock service.
4. Native ambiguity is a terminal fact, not a retry inconvenience.
5. Exact conformance evidence permits fast-moving Agent versions without brittle equality lockouts.
6. SQLite and TypeScript fit the broad v0.x shape; a narrow native helper owns the Windows risk seam.
7. OpenCode ACP conformance validates the generic Agent model.
8. Coordination Loop contributes no required core concept.

## Top remaining architecture risks

1. A successful side-effecting native turn can still become irreducibly ambiguous after response/process loss.
2. Windows privileged/process/terminal primitives require a very small but security-sensitive helper boundary.
3. UI libraries can corrupt perceived history/approval state unless Fleet IDs/cursors/receipts remain canonical.
4. Provider/model compatibility is behavioral; an OpenAI-compatible route alone is weak evidence.
5. Revocation, Edge fencing, database/blob recovery, and update rollback need fault-injection acceptance.

Each is explicitly contained by failure states, capability gates, or a deferred feature. None requires solving scheduling, failover, enterprise tenancy, or Coordination Loop before drafting 0.1.

## Draft recommendation

`ARCHITECTURE_0_1_DRAFT_RECOMMENDED=true`

The next authorized step is owner review of Wave 02, followed—if accepted—by a separate Baseline 0.1 drafting goal. That draft should incorporate the decisions above, cite both waves, and remain non-implementation authority until the owner separately accepts it and declares readiness. This wave leaves all readiness and implementation flags false.
