# Requirements from first principles

## Question and method

What is the minimum architecture that meets FleetSplice's actual failure and authority requirements without first assuming HAPI, Orca, T3 Code, OpenHands, ACP, Codex app-server, or a cluster scheduler is the answer?

The requirements below are derived from named assets, trust boundaries, and failure states. Product comparisons come later.

## 1. What “fleet” means

**FACT:** the target contains real developer machines with different filesystems, repositories, installed tools, accelerators, user identities, credentials, network reachability, and privilege levels. A Windows user process, an elevated Windows process, and a WSL process on one physical machine do not share an equivalent authority or process namespace.

**INTERPRETATION:** this is a small set of non-fungible placement and trust domains, not a pool of interchangeable workers. A job cannot be moved merely because another host reports spare capacity: it may lack the worktree, secret, native session, device, legal data boundary, or human desktop.

**RECOMMENDATION:** model a Fleet as a named administrative collection of Hosts and their current capabilities. Placement is explicit in v0.x. Capability data is evidence for a human or external orchestrator, not an implicit scheduler promise.

**OPEN:** multi-user tenancy, hostile host isolation, and anonymous elastic workers are outside Architecture 0.1.

## 2. Host and Environment

**FACT:** a physical Host can expose multiple execution contexts whose identities, credentials, paths, interactive desktops, and privileges differ.

**INTERPRETATION:** `Environment` is not a tag such as `windows` or `admin=true`. It is an independently authorized execution authority with an OS/runtime namespace, principal, privilege boundary, environment variables, credential resolution policy, process-lifecycle owner, and path semantics.

**RECOMMENDATION:** retain `Host -> Environment`, with at least these initial identities:

| Identity | Principal and process boundary | Initial authority rule |
| --- | --- | --- |
| `SKYFORGE-01/windows-user` | logged-in normal Windows user | ordinary default; no silent elevation |
| `SKYFORGE-01/windows-admin` | explicitly elevated companion | separately enrolled and explicitly targeted |
| `SKYFORGE-01/wsl-ubuntu` | named WSL distribution and Linux user | distinct paths, processes, credentials, and lifecycle |

An Environment advertises a time-bounded capability snapshot; it does not acquire authority merely by advertising a capability. Environment generation changes fence commands issued against an obsolete enrollment or configuration.

**OPEN:** whether macOS, Linux, VM, container, and SSH environments need subtypes is deferred until their concrete lifecycle evidence exists.

## 3. Workspace and worktree placement

**FACT:** coding-agent effects are interpreted relative to a filesystem root, often a repository and exact Git state. Two worktrees of the same repository have different paths, branches, dirty state, locks, and intended writers.

**INTERPRETATION:** a global arbitrary `cwd` is not a safe placement contract. Conversely, requiring a Git worktree for every read-only, non-Git, or newly initialized task would encode an implementation mechanism as a universal domain rule.

**RECOMMENDATION:** bind every execution to a registered `Workspace` root before starting a native session. A `WorktreeBinding` is an optional, explicit specialization with repository identity, resolved path, branch/ref, exact head, dirty-state observation, and writer policy. Re-resolve and authorize paths at the Edge; never trust a Hub-provided string alone.

## 4. Interactive and orchestrated execution

**FACT:** a human may steer, approve, interrupt, and inspect a session interactively. An external Coordination Loop may submit durable work, retry after transport failure, and require machine-verifiable receipts.

**INTERPRETATION:** both modes should use the same execution primitives, but their authority and delivery contracts are not interchangeable. A browser click can tolerate an immediate ambiguity dialog; an unattended orchestrator needs stable command identity, generation checks, terminal outcomes, and resumable observation.

**RECOMMENDATION:** make the actor, authority grant, command identity, deadline, and expected resource generation explicit. Interactive presence is not authority. External orchestration does not gain direct access to an agent protocol; it uses the Fleet API and receives Fleet receipts.

## 5. Execution Host and Inference Host

**FACT:** the coding-agent process owns tools, filesystem access, terminals, Git operations, and native session state. Its model request can go to a cloud API, a localhost server, or an inference server on another machine.

**INTERPRETATION:** process placement and inference placement are two independent decisions constrained by reachability, credentials, privacy, model capabilities, and the agent's provider support.

**RECOMMENDATION:** model `ExecutionBinding` separately from `ProviderBinding`. Do not call a machine an execution host merely because it serves a model. Provider changes must be explicit events and may require a new native session even when execution stays on the same host.

## 6. Native and logical sessions

**FACT:** vendors and agent runtimes define their own thread/session identifiers, history stores, compaction behavior, authentication, and resume rules. None supplies a portable continuation contract across all agents and providers.

**INTERPRETATION:** the durable user-facing identity cannot be a vendor thread ID. A single logical work history may include native resumes, forks, provider changes, migrations, subagents, and concurrent branches.

**RECOMMENDATION:** make `LogicalSession` the durable user work identity. Add causal `SessionLane` identities for forks and concurrency. A `NativeSegment` is a binding epoch on a lane: agent/driver version, native session, execution binding, provider/model/reasoning binding, capability snapshot, and start/end cause. Segments may overlap, and a new segment may retain a native thread ID when only its binding epoch changes.

Continuity must be labeled:

- **native continuity:** the same native thread/session was resumed under supported semantics;
- **reconstructed continuity:** a new native session received a reviewed Handoff Capsule;
- **related history only:** prior artifacts are visible but no continuation claim is made.

## 7. Central authority and host authority

**FACT:** only the host-side process can directly observe the current filesystem, OS process identity, native agent connection, local credentials, and completion of a local effect. Only the Hub can consistently serve a fleet-wide catalog, user authorization policy, logical history, and cross-host projection.

**INTERPRETATION:** either side claiming all authority creates a lie. A rich central supervisor loses truth across partitions; isolated per-host servers cannot alone provide one coherent user history.

**RECOMMENDATION:** split authority by fact ownership:

| Hub authority | Edge authority |
| --- | --- |
| Host/Environment catalog and enrollment policy | current host/environment/process observation |
| actor authorization and placement intent | path resolution and local authorization enforcement |
| LogicalSession, lane, normalized history, search | native session/process lifecycle and local journal |
| desired command status and global projections | command admission, idempotency, effect reconciliation |
| provider profile metadata | credential material and supported local injection |

Neither side may silently overwrite the other's authoritative facts. Projections carry source, generation, observation time, and confidence.

## 8. Failure semantics

### Hub failure and partition

**FACT:** a network link can fail while a native process continues; a stale Hub projection cannot distinguish that case from a stopped process.

**RECOMMENDATION:** Hub loss must not terminate an already-running session by default. The Edge journals commands and durable events locally, applies a bounded offline policy, and later reconnects with a snapshot, event cursor, and command watermark. The Hub displays `STALE` or `UNKNOWN`, never invents `STOPPED`.

### Edge or host failure

**FACT:** an Edge process can die while a child survives, or a host reboot can remove both. PIDs are reusable.

**RECOMMENDATION:** identify a managed process by more than PID: process start time plus a Fleet launch nonce/control marker and native identity where available. On restart, reconcile journaled resources before accepting replay. Classify each as recovered, lost, completed, or ambiguous.

### Delivery ambiguity

**FACT:** a request may be delivered and its result lost. Blind retry can duplicate a turn, subprocess, or tool effect.

**RECOMMENDATION:** use at-least-once delivery with generation-bound idempotency records, but promise effectively-once effects only for operations with an atomic or rediscoverable stable effect identity. Arbitrary agent/tool side effects remain potentially ambiguous and require observation or human resolution.

## 9. Histories and context windows

**FACT:** UI history can last weeks while a model context is bounded and vendor compaction state may be opaque.

**INTERPRETATION:** durable history, searchable evidence, and model-visible context are different products. Treating a transcript as the current prompt either grows without bound or discards provenance during summarization.

**RECOMMENDATION:** maintain canonical structured events plus referenced blobs. Divide context into hot (current model input), warm (validated checkpoints and Handoff Capsule), and cold (full event/blob history). Summaries retain source-event pointers and are claims, not replacements for source evidence. Full-text and structured indexes precede optional semantic indexing.

## 10. Provider migration

**FACT:** hidden reasoning, vendor compaction state, auth state, proprietary server state, and in-flight tools cannot be transferred safely between providers.

**RECOMMENDATION:** v0.x supports manual, explicit migration. FleetSplice can preflight and suggest a compatible target, but it creates a new segment, records capability loss, passes only reviewable capsule content, and requires confirmation. Transparent failover is rejected for v0.x.

## 11. Coordination Loop and future autonomy

**FACT:** the current Coordination Loop Harness owns durable request/goal/run state, repository/resource leases, authority, budgets, bundles, and audit; its public direction explicitly separates orchestration from provider execution.

**INTERPRETATION:** duplicating claims and leases inside FleetSplice would create two authorities that can disagree. FleetSplice still needs short-lived local resource admission and process ownership; those are execution facts, not work-governance claims.

**RECOMMENDATION:** preserve the boundary:

```text
Coordination Loop / CLE: why, what, when, dependency policy
CLF: worker/provider lifecycle and Fleet adapter
FleetSplice: where, how, and which admitted execution resources
Edge: local execution truth
Agent: native work
```

Fleet receipts reference external request/run/claim identifiers without adopting their lifecycle. Cancellation is cooperative and correlated; neither system pretends it rolls back completed effects.

## 12. Stable-N develops N+1

**FACT:** an agent capable of modifying FleetSplice would operate through the same repository and host powers that FleetSplice protects.

**INTERPRETATION:** self-hosting is not in-place self-modification. Letting a running agent replace identity, authorization, journal, update verification, or durable-state code invalidates the evidence used to control it.

**RECOMMENDATION:** stable N may execute development of N+1 in a separate worktree through ordinary commands. N+1 must pass external review, compatibility checks, a canary, and rollback preparation before an explicit update authority activates it. The running trusted kernel is never hot-replaced by an agent.

## Minimum v0.x capability set

The minimum useful architecture therefore needs:

1. one durable Hub for catalog, intent, normalized history, and search;
2. one small Edge per Host with a local transactional journal and reconciliation loop;
3. explicit Environment and Workspace admission;
4. an outbound authenticated Host Control Protocol;
5. a high-fidelity native Codex driver plus a negotiated ACP driver, with compatibility processes optional;
6. a logical session/lane/segment model with honest continuity labels;
7. agent-native provider profiles and explicit migration;
8. a Fleet-owned UI shell and normalized projection API;
9. no scheduler, transparent failover, distributed consensus, universal gateway, or hot-loaded untrusted extensions.

**OPEN:** implementation language, storage engine, transport library, deployment packaging, and exact schemas require Architecture 0.1 decisions or later authorized conformance work. None is selected by this report.
