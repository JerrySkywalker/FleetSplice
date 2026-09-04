# Driver upgrade and compatibility admission

## Decision

**RECOMMENDATION — `READY_FOR_0_1`:** compatibility is feature-scoped conformance evidence for an exact semantic fingerprint, not an exact-version allowlist and not a single global pass bit.

Four identities are distinct:

1. `DriverBuild` — Fleet adapter code and digest;
2. `DriverInstallation` — exact executable/launcher in one Environment;
3. `DriverCompatibilityRecord` — immutable conformance evidence for one fingerprint;
4. `BindingQualification` — time-bounded provider/model/auth/health evidence that may drift without changing the executable.

This prevents “same reported version,” “same bytes,” “compatible driver,” and “provider reachable now” from becoming unsafe aliases.

## Semantic fingerprint

Key an immutable compatibility record by:

```text
Fleet driver build digest
Agent executable or entrypoint digest
interpreter/runtime path, version, and digest when applicable
stable generated-schema manifest digest
experimental-schema digest only when explicitly enabled
native protocol kind
offered and negotiated protocol version
required capability-set digest
OS/architecture/Environment class
launch/profile contract digest
```

Provider endpoint, auth profile, model catalog, and live health belong to a related `BindingQualification`, not the immutable artifact identity.

## Required record

| Area | Required fields |
| --- | --- |
| identity | record ID/revision, driver ID, Fleet build/digest |
| executable | canonical path, resolved shim/symlink chain, file identity, reported version |
| artifact | SHA-256 or stronger digest, size, signer/package/provenance where practical |
| scripted Agent | entrypoint plus exact interpreter/runtime identity |
| schema | stable raw bundle manifest digest; experimental bundle separate; required-surface digest |
| protocol | kind, offered versions, negotiated version, handshake implementation metadata |
| capabilities | normalized snapshot, retained native-detail reference, required-set digest |
| environment | Host/Environment IDs and generations, OS/architecture, principal class |
| profile | redacted config/profile identity such as a `CODEX_HOME` reference/digest |
| conformance | suite ID/version/digest, fixture fingerprint, case outcomes |
| freshness | discovery, passive-probe, behavioral-qualification times and invalidation triggers |
| disposition | `QUALIFIED`, `QUALIFIED_WITH_LIMITS`, `UNKNOWN_UNQUALIFIED`, `UNSUPPORTED`, `QUARANTINED`, or `MISSING`, with restrictions |
| evidence | sanitized receipts/log references, schema-diff result, and blocker detail |

Store both the raw schema digest and a semantic digest of the required surface. A raw digest change triggers analysis; it does not by itself prove incompatibility.

## Dispositions

| Disposition | Meaning | Mutation admission |
| --- | --- | --- |
| `QUALIFIED` | named required capability sets passed | admit only those families |
| `QUALIFIED_WITH_LIMITS` | some families proven, others missing/failed | admit the proven subset |
| `UNKNOWN_UNQUALIFIED` | new, stale, or incompletely probed fingerprint | fail affected mutations safely |
| `UNSUPPORTED` | known incompatible protocol/capability/behavior | reject affected families |
| `QUARANTINED` | integrity, provenance, corruption, or security defect | do not launch/resume through it |
| `MISSING` | recorded installation no longer resolves | reject new commands; retain history |

Individual cases use `PASS`, `FAIL`, `UNAVAILABLE`, `NOT_APPLICABLE`, `SKIPPED_OWNER_ATTENDED`, or `AMBIGUOUS`. Skipped and unavailable checks are never a pass.

## Three admission layers

### 1. Discovery and passive probe

- resolve and pin the absolute executable/entrypoint chain;
- hash the artifact and relevant runtime;
- read the reported version;
- generate or read the stable schema;
- initialize or negotiate protocol;
- capture capabilities and effective profile/Environment identity;
- do not touch valuable native history or user state.

### 2. Disposable behavioral conformance

Run only cases needed by enabled command families in isolated workspaces and native sessions:

- create, list/read, load/resume, and fork when claimed;
- turn/prompt, streaming, durable-history recovery, and response loss;
- steer, interrupt/cancel, approvals, and elicitation;
- process disconnect/restart and ambiguity classification;
- model/provider changes only when offered and safely isolated;
- ACP filesystem/terminal client responsibilities where enabled.

Advertisement or schema presence alone never proves behavior.

### 3. Per-command admission

Immediately before dispatch require a matching installation generation and fingerprint, a qualified capability set for the FleetCommand kind, a sufficiently fresh binding qualification, exact target generations, and current Fleet/local authority.

## Capability-scoped qualification

Suggested capability groups are:

```text
driver.observe
session.create
session.resume_or_load
session.read_or_reconcile
turn.submit_and_stream
turn.interrupt
approval.resolve
workspace.fs
workspace.terminal
session.fork                 optional
checkpoint.native            optional
binding.model_change         optional
binding.provider_change      optional
```

A driver remains useful for proven families when an optional family fails. Each FleetCommand kind declares the capability-set digest it requires.

## Codex and ACP consequences

**FACT:** current Codex app-server requires one initialize exchange per connection, distinguishes stable from experimental APIs, and generates TypeScript/JSON Schema for the exact installed version. It does not negotiate a general semantic protocol version. Codex admission therefore combines executable identity, generated schema, required method/field probes, and behavioral conformance; a version string is insufficient. See the [official app-server documentation](https://developers.openai.com/codex/app-server/) and the inspected [app-server source documentation](https://github.com/openai/codex/blob/88f87d907a91aea5e9ea38a3e9a653bfedd71f9b/codex-rs/app-server/README.md).

**FACT:** ACP negotiates a protocol major and capabilities; its schema release is a separate artifact identity. At this evidence cut, record these independently:

```text
negotiated ACP protocol version: 1
schema release: schema-v1.21.0
schema content digest: exact local/qualification hash
```

An omitted capability is unsupported. See [ACP v1 initialization](https://github.com/agentclientprotocol/agent-client-protocol/blob/23925785ad006d136d0af96c73824edc5dda9311/docs/protocol/v1/initialization.mdx) and [schema-v1.21.0 metadata](https://github.com/agentclientprotocol/agent-client-protocol/blob/schema-v1.21.0/schema/v1/meta.json).

The selected Codex source snapshot was `88f87d907a91aea5e9ea38a3e9a653bfedd71f9b`. A late same-day drift check observed the Codex default head at `99d66aa1c5f8394729a97a6eea91880fa420352b`, the ACP default head at `23925785ad006d136d0af96c73824edc5dda9311`, and the ACP `schema-v1.21.0` tag at `fe2db5aa7c7f5565424515075c00a66f8f6715d8`. Conclusions remain pinned to the cited snapshots and installed artifacts, not to a floating branch name; no equivalence to the later Codex head is claimed.

## Avoiding brittle lockouts

1. Protocol major and required semantic shapes are invariants.
2. Additive optional fields/methods are tolerated and, where useful, retained as opaque native detail.
3. Removal or incompatible change disables only affected capability sets.
4. Unknown lifecycle, terminal, or approval variants that change durable meaning fail that operation closed.
5. Artifact or schema changes create a new installation generation and targeted requalification.
6. Identical schema with changed bytes still refreshes provenance and risk-based behavior tests.
7. Known-bad versions/digests may be quarantined.
8. Version ranges gate only documented upstream compatibility boundaries or hazards that semantic probes cannot establish.

## Freshness and invalidation

| Change | Required reaction |
| --- | --- |
| executable/entrypoint/runtime digest | new installation generation and relevant full conformance |
| stable schema digest | structural diff plus affected behavior probes |
| negotiated protocol major | new adapter or unsupported |
| required capability removed | disable affected commands immediately |
| optional capability added | remain disabled until its probe passes |
| Host/Environment generation | passive reprobe plus platform checks |
| profile/config identity | new binding qualification |
| provider/model/auth/health | refresh binding qualification, not necessarily driver conformance |
| time only | refresh volatile evidence; do not rerun risky tests without a trigger |

Expiry blocks new effects; it does not kill an active process. Observation, reconciliation, and separately qualified risk-reducing interruption may remain available.

## Auto-update and active segments

- Same path with new bytes is a new installation generation.
- Never move an active NativeSegment silently to a replacement binary.
- Bind every segment to its exact compatibility record.
- Continue observing an old running process through its original record.
- Qualify a new artifact in isolation before new starts/resumes.
- If an external updater removes the old binary, report `CHANGED_UNQUALIFIED`; do not invent rollback availability.
- Never test a new binary by resuming valuable history.

## Upgrade and rollback

Use a staged path:

```text
DISCOVER_CANDIDATE
-> VERIFY_PROVENANCE_AND_DIGEST
-> GENERATE_AND_DIFF_SCHEMA
-> PASSIVE_HANDSHAKE
-> DISPOSABLE_TARGETED_CONFORMANCE
-> HISTORY/DATA COMPATIBILITY ON A COPY
-> QUALIFIED_CANDIDATE
-> NEW-SEGMENT CANARY
-> PROMOTED FOR NEW WORK
```

Rollback selects a retained, previously qualified artifact for future commands. It cannot undo turns, provider requests, tools, data migrations, history written by the candidate, or candidate processes already running. If downgrade compatibility is unknown, preserve state and use reviewed reconstructed continuity rather than destructive downgrade.

## Remaining work

The compatibility model is ready for Architecture 0.1. Exact SKYFORGE-01 Codex and second-agent cases are recorded separately as qualification evidence. Automatic update distribution and full rollback packaging are `DEFER_POST_0_1`; detection, fencing, and no-silent-activation are required in 0.1.
