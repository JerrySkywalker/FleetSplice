# v0.1 Acceptance Contract

## Status and authoritative inputs

| Field | Value |
| --- | --- |
| Planning Goal | FLEETSPLICE-V0_1-IMPLEMENTATION-CONTRACT-004 (G04) |
| Accepted promotion head | 96cb7a4965a651b8582a3ee35049d52204c3fc73 |
| Accepted promotion tree | b554b8568b633397681307d73c7d7fec105963bd |
| Accepted baseline | docs/architecture/baseline-0.1.md |
| Recording receipt path | docs/train/receipts/G03.md |
| Recording receipt commit | ca671e66cf1980a88f0c197016f2d2556390b7be |

~~~text
ARCHITECTURE_0_1_READY=true
IMPLEMENTATION_AUTHORIZED=false
PRODUCT_IMPLEMENTATION_AUTHORIZED=false
G04_CONTRACT_STATUS=DRAFT_PENDING_OWNER_DECISIONS_AND_EXACT_HEAD_REVIEW
G04_PASS=false
~~~

The promotion object is the immutable architecture citation. This document
proposes implementation-facing choices within that accepted architecture; it
does not alter command, permit, anchor, barrier, renewal, SafetyControl, or
D/O/R semantics. The baseline and accepted ADRs remain normative.

## Contract-level protocol choices

| Concern | G04 proposal | Non-negotiable boundary |
| --- | --- | --- |
| External contracts | JSON Schema 2020-12 with versioned, closed discriminated unions. Unknown union arms or fields where the schema closes them reject; there is no native-any escape hatch. | One typed FleetCommand mutation boundary and observation-only resources, projections, receipts, events, history, and blobs remain as defined by the baseline. |
| IDs and revisions | Persist opaque UUIDv4 identifiers; never infer meaning from one. Encode revisions, sequence-like values, and durable decimal counters as canonical decimal strings, not lossy JSON numbers. | IDs and revision values remain non-lossy across browser, Hub, Edge, persistence, and signatures. |
| Canonical bytes and digests | Canonicalize JSON with RFC 8785, then apply SHA-256 under a registered, ASCII domain-separated prefix per digest kind. Reject invalid UTF-8, lone or invalid surrogates, duplicate object keys, non-finite/lossy numeric conversions, and any value that cannot round-trip losslessly. | A digest is evidence over a closed semantic object; canonicalization cannot invent a second interpretation. |
| HCP v1 carriage | Edge initiates strict-TLS WSS to the future Hub endpoint path /hcp/v1/connect and negotiates subprotocol fleetsplice.hcp.v1. Each decoded message is one fully reassembled UTF-8 JSON object. Compression is disabled and decoded object size is capped at 262144 bytes. | HCP carries exact identities, generations, runtime/stream identities, snapshots, cursors, receipts, and reconciliation. It does not define FleetCommand or permit semantics. |
| Large transfer and flow control | Larger payloads use separately authenticated HTTPS blob transfer with digest/length verification. Both sides use bounded buffering, backpressure, and explicit gap-to-resync behavior. | No large payload bypasses authorization, blob provenance, cursor repair, or resource quotas. |
| HCP admission | Challenge/response binds exact Fleet, Host, Environment, generation, runtime/boot/instance identity, and known cursors before a session is considered usable. | TLS validation is strict; a connection or challenge response is never process truth, replacement authority, or a barrier proof. |
| Fleet-facing HTTP | HTTP exposes typed Fleet mutation, read, and resource endpoints. The event stream is separately authorized and only publishes observations/events; it is not an alternate mutation transport. | A browser, TUI, script, or HCP transport cannot gain an alternate privileged write path. |

The design must retain the full accepted
[FleetCommand boundary](../architecture/baseline-0.1.md#one-northbound-mutation-contract),
[dispatch-permit ordering](../architecture/baseline-0.1.md#rollback-resistant-pre-effect-dispatch),
and [failure/ambiguity rules](../architecture/baseline-0.1.md#failure-and-effect-semantics).
This table chooses framing and encoding only.

## Milestone acceptance and evidence

| Goal | Acceptance claim that must eventually be proven | Minimum evidence class at the gate |
| --- | --- | --- |
| G05 | A browser prompt produces a real Codex response on SKYFORGE-01 through WebUI, Hub, FleetCommand, Edge, and native app-server; command IDs and receipts are inspectable. | LIVE_SINGLE_HOST plus focused contract/unit evidence. A mock or fixture is insufficient. |
| G06 | One URL shows both required Hosts, selects a ZenBookDuo Workspace, performs a real native Codex turn there, streams it through Hub, and preserves exact Host/Environment identity across reconnect. | LIVE_TWO_HOST. A genuinely unavailable required Host returns BLOCKED_REQUIRED_HOST_UNAVAILABLE, not PASS. |
| G07 | A second client is a viewer until explicit takeover; old control is fenced; one harmless exact approval can be resolved; interrupt remains distinct from terminality; close/reopen restores projection without duplicate effect. | SYNTHETIC_BROWSER plus LIVE_TWO_HOST for the owner path and security/control fault evidence. |
| G08 | Full history survives specified disruptions; dedupe is visible; Hub/Edge/native restart and response loss keep possible effects ambiguous until reconciled. | FAULT_INJECTION, DISPOSABLE_INTEGRATION, and LIVE_SINGLE_HOST or LIVE_TWO_HOST as the affected behavior requires. |
| G09 | Either a qualified exact proposal is owner-confirmed and activates a new binding/segment, or probes prove no target qualifies and the UI visibly remains fail-closed as NO_QUALIFIED_TARGET. | LIVE_TWO_HOST or real qualifying environment evidence. An OpenAI-compatible endpoint alone is not qualification. |
| G10 | The exact v0.1 head passes recovery, storage, upgrade, security, long-history UI, installation/rollback, and two-host dogfood gates with a fresh independent review. | Combined FAULT_INJECTION, OWNER_ATTENDED_LIVE where required, LIVE_TWO_HOST, and INDEPENDENT_EXACT_HEAD_REVIEW. |

UNQUALIFIED is the per-candidate disposition: it means a named candidate fails
capability, behavior, or security criteria. NO_QUALIFIED_TARGET is G09’s
terminal product outcome only after the relevant candidate/probe set is recorded
and the migration affordance remains disabled. Neither outcome permits silent
fallback or credential copying.

## Owner decision ledger

All choices below are reviewable proposals, not Owner-selected values. Design,
an explicit Owner security/product decision, and later qualification are all
mandatory. No entry claims a provisioned service, enrolled Host, credential, or
live network.

| ID | Pending group and proposed default | Owner values still required | Future verification gate |
| --- | --- | --- | --- |
| O1 | **AuthorityAnchor.** Owner-operated software, one-active external append/CAS journal, with independent admin custody and a restore domain outside Hub, Edge, companion, blob, and ordinary-backup rollback domains. Receipts are signed; writers are scoped; participants pin exact lineage; ambiguity uses exact-ID lookup; rollover is closed and one-way; catastrophic loss creates a fresh namespace. No standby, clone promotion, same-lineage restore, transparent failover, quorum, or consensus. | Exact mechanism, location, lifecycle writer principal, custody holder, writer/pin storage, restore procedure, retention, and operator workflow. A separate directory or process is not evidence of a distinct rollback domain. The architecture does not require a dedicated physical TPM/HSM appliance. | G04 Owner decision, mechanism review, then append/ambiguity/fork/rollback/clone/loss/rollover/reset qualification. A dedicated anchor daemon/package needs demonstrated need and the additional-package exception; current plan is an external dependency, not silent apps/hub authority. |
| O2 | **Host enrollment and key custody.** Per-Host-generation Ed25519 identity, protected by DPAPI with no plaintext private-key persistence. Bootstrap and rotation are attended operations; revocation is explicit and generation-fenced. | Enrollment issuer/principal, public-key distribution and pinning, rotation interval/trigger, revocation authority, recovery procedure, and exact custody/backup treatment. | Owner-attended enrollment/rotation/revocation ceremony plus generation, transport, stale-key, replay, and recovery-barrier qualification. |
| O3 | **Browser bootstrap, remote auth/recovery, and sensitive exposure.** Local attended bootstrap and WebAuthn user-verifying passkey for remote browser access. Proposed, unapproved session bounds: 8-hour absolute and 15-minute idle. Use an opaque server-side session in `__Host-fleetsplice` (`Secure`, `HttpOnly`, `SameSite=Strict`, `Path=/`, no `Domain`); neither credentials nor session identifiers in `localStorage`, `sessionStorage`, or URLs. Mutations require strict Origin plus CSRF; an observation WebSocket authenticates before any data and consumes a one-use subscription nonce. | Origin and RP ID, passkey backup/recovery policy, remote-client enrollment/revocation, final session/idle durations, exact sensitive native/blob/approval projection classes, and break-glass rules. | Owner security decision plus synthetic browser/security tests and attended remote recovery qualification without emitting secrets. Raw native/blob detail requires step-up; an approval must show complete decision-critical detail or the resolve action is disabled. |
| O4 | **Reconnect grace and approval defaults.** Proposed reconnect grace is 60 seconds. No automation reclaim after human takeover. Persistent native approvals are disabled initially; only deny and allow-once are available until an exact policy is qualified. | Final grace duration, actor/session recovery policy, takeover notifications, and any later persistent-approval policy. | Controller/takeover/reconnect and approval fault tests; attended remote-browser qualification if the selected policy needs it. |
| D1 | **Data, backup, retention, update.** Proposed default: no automatic deletion of canonical history; manual encrypted database-plus-blob backup excludes AuthorityAnchor material, participant pins, and credentials; manual side-by-side update; no automatic start or update. Preserve canonical event/receipt meaning, redact by policy, retain tombstones, and require separately verified update/canary/rollback evidence. | Retention periods, encryption/key custody, backup location/schedule, restore authorization, redaction classes, remote exposure, update channel, and support/rollback policy. | Owner disposition is required before G10 release acceptance; the proposal is not an already configured default. |

The O1 proposal preserves the accepted
[AuthorityAnchor lifecycle](../architecture/baseline-0.1.md#fleet-scoped-authorityanchor-lineage).
It does not turn the Hub into the anchor or make a copied journal writable
authority.

## Owner-attended future actions

These actions are intentionally not run by G04. They must be recorded with the
selected decision values and sanitized evidence, never secrets.

| Required state | Exact future action | Required result |
| --- | --- | --- |
| OWNER_ATTENDED_REQUIRED | Attend the selected O2 bootstrap on each selected Host generation and present only the public identity/proof material to the enrollment flow. | The recorded Host/Environment/generation and public-key fingerprint match the selected policy; private key material is absent from output, logs, URLs, and receipts. |
| OWNER_ATTENDED_REQUIRED | Attend O1 custody/rollover or recovery operation only under the selected single-active mechanism. | Exact anchor lineage, scoped writer, pin, and recovery evidence are verified; no clone, standby, or substitute becomes active. |
| OWNER_ATTENDED_REQUIRED | Attend O3 local bootstrap and remote recovery under the chosen RP/origin/backup policy. | User-verifying authentication succeeds, recovery is auditable, stale sessions are rejected, and sensitive values are not exposed. |
| OWNER_ATTENDED_REQUIRED | Perform any required UAC, credential-enrollment, destructive lifecycle, or live network ceremony only after the future implementation is independently admitted. | The exact action/result is recorded as passed, blocked, or failed; absence of a safe ceremony is never converted to PASS. |

## Formal disposition

~~~text
DISPOSITION=BLOCKED_PENDING_OWNER_DECISIONS_AND_EXACT_HEAD_REVIEW
G04_PASS=false
IMPLEMENTATION_AUTHORIZED=false
PRODUCT_IMPLEMENTATION_AUTHORIZED=false
G05_TO_G10_CONDITIONAL_SCOPE=ONLY_AFTER_OWNER_CHOICES_EXACT_REVIEW_STATION_A_AND_RENEWED_RESUME
~~~
