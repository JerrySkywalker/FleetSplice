# Gate S production-admission decision package

Status: OWNER DECISIONS RECORDED; PRODUCTION INPUTS UNRESOLVED; NOT ADMITTED.
This package originated under the local Gate S preparation train. PR #11 was
merged at `a659eec21e4828a55e9210b9a3b88c08ab507b9a`; its prior handoff
`78c6d08bc1feead8496cea85a3ec52b3e2a0d4a1` is historical ancestry.

[Current status](current-status.md) controls readiness. The immutable
[S11 receipt](receipts/PGS-S11-installer-dogfood-closeout.md) proves local
Pre-Gate-S completion only. This package neither performs nor authorizes a
deployment. No production values below have been inferred from local fixtures.
ZenBook14 local managed-daemon S10 is
`BLOCKED_EXTERNAL_CODEX_MANAGED_DAEMON_UNAVAILABLE`; its current Windows host
cannot start the Codex managed daemon. An unavailable native daemon or skipped
historical integration test is not a live PASS. Prior SKYFORGE S10 evidence
remains historical evidence only.

## Admission inputs

| Input | Owner selection / required evidence |
| --- | --- |
| 1. Hub/Web identity | `<PRODUCTION_HOSTNAME>` and `https://<PRODUCTION_HOSTNAME>`; exact canonical origin, deployment profile and DNS operator `<OWNER>`. Target server remains `tencent-pek-01`; readiness and access are unverified here. |
| 2. HCP/WSS | Default candidate `wss://<PRODUCTION_HOSTNAME>/hcp/v1/connect`; `<EXPLICIT_OVERRIDE_OR_NONE>`. Record discovery response and authenticated outbound Edge connection. No inbound development-host port or required third-party relay. |
| 3. HTTPS/TLS/ingress | `<INGRESS_OPERATOR>`, `<TLS_TERMINATION_AND_GATEWAY_TLS_PATH>`, `<CERTIFICATE_ISSUER_AND_RENEWAL_OWNER>`, bind host/port and firewall policy. Non-loopback Gateway listener currently requires supplied TLS material; do not assume cleartext proxy-to-Gateway is supported. Prove hostname verification, renewal and failure behavior. Do not reuse localhost test certificates. |
| 4. Human OIDC | Casdoor is the Owner-selected production IdP candidate pending configuration. `<ISSUER>`, `<CLIENT_ID>`, `<CONFIDENTIAL_OR_PUBLIC_CLIENT_POLICY>`, `<SECRET_CUSTODY_IF_REQUIRED>`, exact registered `<CALLBACK_URL>`, selected owner issuer/subject, MFA/passkey and recovery policy and operator all remain unresolved. Generic Authorization Code implementation validates state, nonce, issuer, audience, signature and time. Provider tokens remain server-side; Fleet sessions authorize browser actions separately from native/provider credentials. Decision A below is resolved. |
| 5. Service account | `<HUB_SERVICE_ACCOUNT>`, least necessary filesystem/network permissions, service supervisor and update operator. Edge remains the selected interactive non-elevated Windows user; Windows/provider credentials remain local. No shared machine credential is created here. |
| 6. Data and limits | `<HUB_STATE_PATH>`, `<LOG_PATH>`, `<EDGE_STATE_PATH>`, `<DISK_CAPACITY_AND_RETENTION>`, `<CPU_MEMORY_PROCESS_LIMITS>`, `<CONNECTION_REQUEST_LIMITS>` and `<EXHAUSTION_ALERTS>`. Protect journals, durable enrollment/revocation and authority state. Validate supported Node/SQLite and packaged dependency inventory on the later target. |
| 7. Device lifecycle | `<ENROLLMENT_OPERATOR>` attends public-fingerprint verification and approval against the selected Fleet/Host/Environment/generation. Local private key custody remains on Edge; Gateway stores public identity. `<REVOCATION_OPERATOR>` proves revoke/disconnect, rejected stale-key reconnect and explicit fresh enrollment. Local test device keys provide no production authority. |
| 8. Backup/restore | `<BACKUP_OPERATOR>`, `<DESTINATION_AND_ENCRYPTION>`, `<RETENTION>`, `<RPO_RTO>`. Stop processes before replacing stores; rehearse a cold, admission-closed restore. Reconcile old native effects and invalidate old authority before explicit re-admission. A copied database, new generation or elapsed timeout cannot prove predecessor closure. |
| 9. Monitoring/logging | `<MONITORING_OPERATOR_AND_DESTINATION>`; TLS expiry, service health, outbound WSS freshness, admission-closed/recovery state, disk/journal failures and backup alerts. Correlate command/receipt identities without logging tokens, cookies, provider credentials or unrestricted transcripts. Specify redaction, access and retention. |
| 10. Incident/rollback | `<INCIDENT_OWNER>`, `<CONTACT_PATH>`, `<ROLLBACK_OPERATOR_AND_KNOWN_BUILD>`. Stop new admission, preserve evidence, reconcile unknown effects, stop old components and cold-start fail-closed. Rollback is not replay or automatic recovery; require explicit re-admission. |
| 11. First live Edge | SKYFORGE-01; `<SKYFORGE_WINDOWS_PRINCIPAL>`, `<REGISTERED_WORKSPACE>`, current native runtime source identity/capabilities, outbound connectivity, power/network policy and attended enrollment remain unverified. Fresh SKYFORGE qualification is required before enrollment/deployment. Decision B below is resolved. |
| 12. External/mobile acceptance | `<DEVICE_BROWSER>`, `<EXTERNAL_OR_MOBILE_NETWORK>`, `<OWNER_TEST_WINDOW>`. Real HTTPS Tencent Gateway -> authenticated outbound WSS -> selected real native Edge. Record prompt/stream, Allow Once/Deny, exact-turn interrupt, viewer/controller fencing, same-incarnation reconnect/lookup without replay and away-from-computer operation. Responsive emulation, localhost HTTPS/WSS and LAN-only tests cannot substitute. |

## Decision A: generic OIDC for first live G06 — resolved

The older [acceptance contract, O3](../v0.1/acceptance-contract.md) and
[remote/mobile checklist](../v0.1/remote-mobile-acceptance.md) explicitly require
a user-verifying WebAuthn passkey, exact origin/RP ID and attended backup or
recovery. The later [Pre-Gate-S train](pre-gate-s-development-train.md) and
[implemented OIDC contract](../deployment/oidc.md) select generic OIDC. A valid
OIDC token does not itself prove that the identity provider used a passkey or
performed the older recovery ceremony.

The Owner selects generic OIDC Authorization Code as FleetSplice's first-live-G06
human authentication contract. FleetSplice will not implement a separate
Fleet-owned WebAuthn/passkey stack for Gate S. The narrow
[normative amendment](../architecture/amendments/gate-s-g06-human-oidc.md)
supersedes the passkey-specific acceptance wording while preserving historical
evidence. Production MFA/passkey and recovery policy is an IdP/operator concern.
The current token checks and synthetic WebAuthn fixtures prove neither
production identity assurance nor passkey use. Casdoor is the Owner's first
provider/preset in the local train and is now the Owner-selected production
candidate; no production application, secret or configuration is established.
The readiness audit must verify its production capability and policy.

## Decision B: SKYFORGE-01 first live G06 Edge — resolved

The Owner keeps SKYFORGE-01 as the first live G06 Edge and ZenBook14 as the
primary development machine. The accepted older topology and
[G06 deployment design](../v0.1/tencent-mobile-deployment.md) already name
SKYFORGE-01, which has historical S10 native-daemon evidence. ZenBook14
currently cannot start the Codex managed daemon because of the external
Windows residual-Job blocker. Selecting SKYFORGE preserves the named live
acceptance target. Historical SKYFORGE evidence does not qualify the current
runtime or establish live G06 acceptance. Fresh SKYFORGE native, principal,
workspace, outbound-network and availability qualification is required before
enrollment/deployment. Do not copy credentials or authority state between the
machines. This decision does not start G07 or constitute two-host operation.

## Current sequence after the readiness audit

The Owner reported the completed readiness audit disposition as
`BLOCKED_INFRASTRUCTURE_NOT_READY`. Local implementation can continue, but this
does not make production infrastructure ready or authorize deployment.

The active machine-readable draft is
[Gate S admission v2](gate-s-admission-v2.template.json). Its resolved decision
metadata records generic OIDC and SKYFORGE-01 while every production value
remains `UNRESOLVED`. Historical v1 `packages/predeploy/placeholders.ts` remains
the local predeploy invariant, including its former RP_ID field; it is not the
active generic OIDC admission requirement. The v2 draft is the authoritative
machine-readable production input surface for a future Gate S review. This
human-readable package explains the evidence and ownership required for each
field. The [admission v2 architecture amendment](../architecture/amendments/gate-s-admission-v2-offline-preflight.md)
records that separation.

Copy the v2 template to a local, untracked draft outside the repository and
fill only values established by the Owner and later infrastructure audit. Never
place OIDC client secrets, TLS private keys, bearer tokens or provider
credentials in the draft. `OIDC_SECRET_CUSTODY_REFERENCE_OR_POLICY` is a
reference such as `policy://...`, `vault://...` or `document://...`, not a
secret. `CORS_ORIGINS` is an array of exact HTTPS origins. The offline command
is `npm run preflight -- <path-to-admission-v2.json>`. It prints JSON findings
and a short human summary; exit status 0 means
`READY_FOR_EXTERNAL_INFRA_VALIDATION`, 1 means `UNRESOLVED_OWNER_INPUT`, and 2
means `INVALID_CONFIGURATION`. This command reads only the local file. It does
not resolve DNS, contact an IdP or Edge, issue TLS material, write production
configuration, or admit Gate S.

For local build/test prerequisites, run `npm run development:doctor`. It
checks the qualified Node/SQLite pair, installed npm closure, Rust/Tauri,
Playwright/Edge and OpenSSL. OpenSSL is required by ephemeral localhost test
TLS generation only; the doctor does not make it a production FleetSplice
runtime dependency or install it.

The future sequence is: production admission draft, offline preflight, external
infrastructure audit with evidence, then explicit Owner authorization for a
separate deployment Goal. The completed audit's infrastructure blocker must be
resolved before a later audit can establish production readiness. Fresh
SKYFORGE qualification and real mobile acceptance remain separate gates.

## Readiness audit checklist (historical request)

The completed audit was requested to inspect:

1. Tencent PEK server readiness.
2. DNS and production hostname availability.
3. Ingress and TLS architecture.
4. Casdoor production OIDC capability, application configuration, MFA/passkey
   and recovery policy.
5. Deployment, service and data paths, including service account and limits.
6. Backup, monitoring and rollback plan with accountable operators.
7. Fresh SKYFORGE Edge qualification.
8. External/mobile acceptance device, network and window readiness.

No production value is established by the reported blocked audit. Unresolved
fields in the admission table remain placeholders until a later authorized
audit obtains evidence and the Owner admits a bounded deployment Goal.

## Review and later admission record

Record the later audit's selected values, accountable operators, candidate
commit/package hashes, local test debt disposition and target readiness. Then
obtain a **separate bounded deployment Goal**. This train stops before production
changes. Deployment, live acceptance and release remain separate evidence
gates, including the previously required real unattended soak. No unresolved
field can be filled by a test fixture.

```text
GATE_S_PACKAGE_READY=OWNER_DECISIONS_RECORDED_PRODUCTION_INPUTS_UNRESOLVED
DECISION_A=GENERIC_OIDC
PRODUCTION_IDP=OWNER_SELECTED_CANDIDATE_PENDING_CONFIGURATION:CASDOOR
DECISION_B=SKYFORGE-01_FIRST_LIVE_G06_EDGE
PRODUCTION_VALUES_COMPLETE=false
GATE_S_READINESS_AUDIT=BLOCKED_INFRASTRUCTURE_NOT_READY
NEXT_EXTERNAL_GATE=PRODUCTION_INFRASTRUCTURE_PREPARED_AND_OWNER_REAUTHORIZES_GATE_S
GATE_S=OWNER_PRODUCTION_DEPLOYMENT_ADMISSION_REQUIRED
GATE_S_ADMITTED=false
TENCENT_DEPLOYED=false
PRODUCTION_MUTATED=false
LIVE_G06_ACCEPTANCE=false
G07_STARTED=false
```
