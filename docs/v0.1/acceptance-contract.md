# v0.1 Acceptance Contract

G04 is closed through the bounded [G04A Goal](../../goals/FLEETSPLICE-G04A-VISIBLE-MVP-PREDEVELOPMENT-CLOSURE-004A.md),
subject to [current exact-head acceptance status](../train/G04A-status.md).
The immutable G03 citation is commit
`96cb7a4965a651b8582a3ee35049d52204c3fc73`, tree
`b554b8568b633397681307d73c7d7fec105963bd`, path
`docs/architecture/baseline-0.1.md`, recorded by
[G03](../train/receipts/G03.md) at receipt commit
`ca671e66cf1980a88f0c197016f2d2556390b7be`.
The [G04A amendment](../architecture/amendments/g04a-visible-mvp-simplification.md)
supersedes exactly the listed accepted clauses; later receipts cite its literal
accepted commit/tree in addition to G03.

Formal `PASS_V0_1_IMPLEMENTATION_CONTRACT` freezes the conditional scope
G05-G10 only. It does not start product work: the Owner must separately resume
G05. No later policy decision, enrollment or deployment is reported as completed.

## Contract-level protocol choices

| Concern | Frozen design | Boundary |
| --- | --- | --- |
| External contracts | Versioned JSON Schema 2020-12 closed discriminated unions. Unknown closed fields/arms reject. | One FleetCommand mutation surface; no native-any or mobile/transport backchannel. |
| IDs/revisions | Opaque UUIDv4 IDs; canonical decimal strings for revisions/counters; fresh unpredictable authority/runtime incarnation IDs. | Generations compare only inside the exact authority namespace. A restored number is never proof of a higher generation. |
| Digests | RFC 8785 canonical JSON, SHA-256 with registered ASCII domain prefix per digest kind. Reject duplicate keys, invalid UTF-8/surrogates, lossy/non-finite values. | Digest covers all effect-relevant fields; no alternate interpretation. |
| FleetCommand -> plan -> EdgeCommand | Hub durably journals accepted intent, lane CAS and complete immutable plan before dispatch; Edge journals a stable exact step and dispatch-attempt marker before native write/spawn. | IDs remain distinct/correlated; same tuple replay returns original state; conflict rejects. No native retry after possible effect. |
| HCP v1 semantics | One versioned envelope/schema carrying commands, decisions, target generations/instances, snapshots, cursors, receipts and reconciliation. | Local and remote carriage have identical command semantics. Native Codex stdio stays behind Edge. |
| G05 carriage | Edge-initiated same-host loopback WebSocket at /hcp/v1/connect, subprotocol fleetsplice.hcp.v1, per-run authenticated local bootstrap. | Bind explicitly to loopback; exact Origin/Host and local actor checks; no public/mobile exposure or remote enrollment prerequisite. |
| G06+ carriage | Edge-initiated strict-TLS authenticated WSS at the same path/subprotocol. One UTF-8 JSON object per reassembled message, decoded cap 262144 bytes, compression off. | Challenge proves exact Fleet/Host/Environment, enrollment generation, authority/runtime incarnation and cursors. Peer/Origin validation never turns socket presence into process truth. |
| Flow control | Bounded queues/backpressure; cursor gaps show RESYNC_REQUIRED. | No guessed output, silent history loss or new effect on reconnect. G06 needs bounded active-session replay; complete history/cursors/checkpoints arrive G08. |
| Large data | Reject oversized mutations visibly; G05/G06 can bound accepted content. G08 adds separately authenticated HTTPS blob transfer with digest/length checks. | No unauthenticated blob route or dependency on full blob storage for G05. |
| HTTP/event resources | Typed mutation endpoint, authorized reads and separately authorized observation stream. | Events, reads, refresh and reconnect never carry native mutation authority. |

The minimum kernel, controller rules, exact approval/interrupt semantics and
restart/restore contract are normative in the amendment. They replace all
AuthorityAnchor/permit/barrier/SafetyControl/D/O/R prerequisites from the old
G04 plan. There is no replacement external service in disguise.

## Milestone acceptance and evidence

| Goal | Passing behavior | Minimum evidence |
| --- | --- | --- |
| G05 | Local Browser -> WebUI -> Hub -> FleetCommand -> Edge -> native Codex -> real streaming response; registered Workspace and create/continue session. | LIVE_SINGLE_HOST on SKYFORGE, real Codex identity/turn and focused failure/dedupe checks; mocks cannot pass. |
| G06 | Remote mobile MVP at Tencent Hub, all minimum prompt/control/reconnect functions, usable away from SKYFORGE. | LIVE_REMOTE_BROWSER through an actual external/mobile-network path, authenticated real Codex on SKYFORGE, [mobile acceptance](remote-mobile-acceptance.md); v0.1-alpha.1. |
| G07 | Both Hosts visible; select a Workspace and real turn on each; distinct generations; viewer/explicit takeover; no retarget on switch/reconnect. | LIVE_TWO_HOST and real mobile/remote browser path. Unavailable ZenBook blocks G07 only. |
| G08 | Same LogicalSession/history after browser/Hub/Edge/native disruption; honest known or ambiguous state; no replay effect. | Fault matrix and real single/two-host recovery as applicable, durable evidence reconciliation and cold restore qualification. |
| G09 | Exact target qualified, confirmed and activated, OR visible NO_QUALIFIED_TARGET after recorded relevant probes. | Real candidate/probe evidence, source quiescence, target/binding/digest confirmation. |
| G10 | Hardened two-host/mobile release, backup/restore, security, upgrade/rollback and long-history UI. | Live two-host/mobile Owner dogfood, storage/fault/lifecycle evidence and fresh independent exact-head review. |

UNQUALIFIED is a per-candidate result. NO_QUALIFIED_TARGET is a terminal product
outcome after the relevant candidate set and failed/missing capability evidence
are recorded. Only MIGRATION_EXECUTED claims migration. A compatible endpoint
shape, new segment, new Host or Owner click never proves safe source closure.

## Owner decision ledger

G04A adopts the following design boundaries and provisional product defaults.
Deployment-specific values and real ceremonies are selected/authorized at their
first use. Their absence today does not leave the pre-development contract
unfrozen or import a future milestone dependency into G05.

| ID | First use | Frozen minimum / future Owner input |
| --- | --- | --- |
| L1 local identity/safety | G05 admission | SKYFORGE windows-user, one existing Workspace, foreground per-user Edge, non-elevated principal/session proof, explicit loopback bootstrap, one controller, no persistent auto-approval, no automatic startup or authority recovery. Owner selects the Workspace and real-session permission envelope when resuming. |
| O1 external authority continuity | Deferred post-v0.1 hardened profile | No mechanism/custody/pin service is required in G04-G10. Any future requirement for invisible live snapshot continuation or overlapping activation without evidence triggers OWNER_ARCHITECTURE_DECISION_REQUIRED. |
| O2a first remote Host | G06 before remote trust | One attended SKYFORGE-to-Tencent enrollment, per-Host-generation public-key identity (Ed25519 design), locally protected private material (DPAPI on Windows), public fingerprint verification and challenge binding. Owner chooses exact endpoint/Fleet identity and credential custody/recovery action; no private material is sent to browser/Hub. Minimal manual revoke/disconnect and stale-key rejection are required now. |
| O3 remote browser/security | G06 before exposure | Single Owner, user-verifying WebAuthn passkey, exact HTTPS origin/RP ID, no public signup. Opaque server-side cookie __Host-fleetsplice: Secure, HttpOnly, SameSite=Strict, Path=/, no Domain. Design defaults 8-hour absolute/15-minute idle; strict Origin and CSRF for mutations, authenticated observation subscription with one-use nonce. Owner selects hostname/RP ID and attends bootstrap plus backup/recovery/revocation rehearsal. |
| O4a basic control/reconnect | G06 | 60-second reconnect grace by default, no automation reclaim, Allow Once / Deny only. Same authenticated client may resume within grace; fresh client is viewer and can acquire an unowned lane only after Edge fence acknowledgement. Expiry closes new authority, never implies running turn termination. |
| O2b/O4b multi-host control | G07 | Attend ZenBook enrollment; qualify exact second identity, rotation/revocation across Hosts and richer takeover notifications/races. Rotation fences old key/Host generation only on observed Edge acknowledgement; unavailable predecessors block overlapping use. |
| D1a recovery/data | G08 | Owner selects backup destination, encryption/custody and restore workflow before those operations. No automatic canonical-history deletion; preserve actionable dedupe tombstones; combined database/blob provenance; cold-start/re-admission after restore. |
| D1b release/lifecycle | G10 | Final retention, backup schedule, redaction, update channel, support/rollback and installation policy. Manual encrypted backup and side-by-side update are defaults to qualify; no automatic update/start before explicit selection and qualification. |

O3 step-up is required before sensitive native/blob details beyond the normal
session/approval projection. Render decision-critical action/target detail
safely; if unavailable under exposure policy, disable approval. Provider secrets
are never intentionally projected; Agent output is untrusted and may itself
contain sensitive text. The remote Owner session must explicitly accept the
selected transcript exposure, with output escaping, redaction and bounded logs.
No complete secret-detection or compromised-admin/kernel guarantee is claimed.

Owner recovery must fail closed if a passkey is lost. G06 requires an attended
backup passkey or equivalent explicitly selected recovery ceremony with session
revocation; no default password, email bypass or anonymous recovery route.
No browser credentials/tokens flow to Edge/native. G04A creates none of these
credentials, sessions, registrations or DNS/TLS settings.

## Formal acceptance and stop

A fresh independent process review of the whole literal candidate head/tree
must return both PASS_G04A_VISIBLE_MVP_PREDEVELOPMENT_CLOSURE and
PASS_V0_1_IMPLEMENTATION_CONTRACT, with zero Critical/High/Medium/unresolved
actionable Low findings. Status is centralized in
[G04A-status](../train/G04A-status.md); a historical G04 planning review is not
this formal acceptance.

Conditional implementation scope is G05-G10 only, after exact accepted object
citations, Station A requirements and renewed Owner resume. Station A readiness
does not mean a PR/main merge has occurred. G04A stops there.
