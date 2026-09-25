# Gate S production-admission decision package

Status: REVIEWABLE DRAFT; NOT ADMITTED. Prepared under
`FLEETSPLICE-ZENBOOK14-LOCAL-REQUALIFY-AND-GATE-S-PREP-001` from handoff
`78c6d08bc1feead8496cea85a3ec52b3e2a0d4a1`.

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
| 4. Human OIDC | `<ISSUER>`, `<CLIENT_ID>`, `<CONFIDENTIAL_OR_PUBLIC_CLIENT_POLICY>`, `<SECRET_CUSTODY_IF_REQUIRED>`, exact registered `<CALLBACK_URL>`, selected owner issuer/subject and recovery operator. Generic Authorization Code implementation validates state, nonce, issuer, audience, signature and time. Provider tokens remain server-side; only Fleet sessions authorize browser actions. Casdoor is a candidate preset, not a selected production deployment. Decision A below remains open. |
| 5. Service account | `<HUB_SERVICE_ACCOUNT>`, least necessary filesystem/network permissions, service supervisor and update operator. Edge remains the selected interactive non-elevated Windows user; Windows/provider credentials remain local. No shared machine credential is created here. |
| 6. Data and limits | `<HUB_STATE_PATH>`, `<LOG_PATH>`, `<EDGE_STATE_PATH>`, disk capacity/retention, CPU/memory and process limits, connection/request limits and exhaustion alerts. Protect journals, durable enrollment/revocation and authority state. Validate supported Node/SQLite and packaged dependency inventory on the later target. |
| 7. Device lifecycle | `<ENROLLMENT_OPERATOR>` attends public-fingerprint verification and approval against the selected Fleet/Host/Environment/generation. Local private key custody remains on Edge; Gateway stores public identity. `<REVOCATION_OPERATOR>` proves revoke/disconnect, rejected stale-key reconnect and explicit fresh enrollment. Local test device keys provide no production authority. |
| 8. Backup/restore | `<BACKUP_OPERATOR>`, `<DESTINATION_AND_ENCRYPTION>`, `<RETENTION>`, `<RPO_RTO>`. Stop processes before replacing stores; rehearse a cold, admission-closed restore. Reconcile old native effects and invalidate old authority before explicit re-admission. A copied database, new generation or elapsed timeout cannot prove predecessor closure. |
| 9. Monitoring/logging | `<MONITORING_OPERATOR_AND_DESTINATION>`; TLS expiry, service health, outbound WSS freshness, admission-closed/recovery state, disk/journal failures and backup alerts. Correlate command/receipt identities without logging tokens, cookies, provider credentials or unrestricted transcripts. Specify redaction, access and retention. |
| 10. Incident/rollback | `<INCIDENT_OWNER>`, `<CONTACT_PATH>`, `<ROLLBACK_OPERATOR_AND_KNOWN_BUILD>`. Stop new admission, preserve evidence, reconcile unknown effects, stop old components and cold-start fail-closed. Rollback is not replay or automatic recovery; require explicit re-admission. |
| 11. First live Edge | `<SKYFORGE-01_OR_ZENBOOK14_OWNER_DECISION>`; exact Windows principal, registered workspace, native runtime source identity/capabilities, outbound connectivity, power/network policy and attended enrollment. Decision B below remains open. |
| 12. External/mobile acceptance | `<DEVICE_BROWSER>`, `<EXTERNAL_OR_MOBILE_NETWORK>`, `<OWNER_TEST_WINDOW>`. Real HTTPS Tencent Gateway -> authenticated outbound WSS -> selected real native Edge. Record prompt/stream, Allow Once/Deny, exact-turn interrupt, viewer/controller fencing, same-incarnation reconnect/lookup without replay and away-from-computer operation. Responsive emulation, localhost HTTPS/WSS and LAN-only tests cannot substitute. |

## Decision A: generic OIDC versus passkey-specific acceptance

The older [acceptance contract, O3](../v0.1/acceptance-contract.md) and
[remote/mobile checklist](../v0.1/remote-mobile-acceptance.md) explicitly require
a user-verifying WebAuthn passkey, exact origin/RP ID and attended backup or
recovery. The later [Pre-Gate-S train](pre-gate-s-development-train.md) and
[implemented OIDC contract](../deployment/oidc.md) select generic OIDC. A valid
OIDC token does not itself prove that the identity provider used a passkey or
performed the older recovery ceremony.

Smallest Owner decision: state the required human authentication assurance for
first live G06 and approve an additive acceptance mapping. Either accept the
generic OIDC login and an explicitly selected IdP recovery policy for G06, or
retain the passkey assurance requirement at the IdP and specify how that
assurance and recovery will be verified. The latter requires evidence of IdP
policy and any agreed assurance-claim validation; it must not be claimed from
the current generic token checks alone. Requiring Fleet-owned WebAuthn would
need separate implementation scope. No option is selected by this package.

Keep the original contracts as historical evidence; record the Owner's exact
decision and any normative amendment before live acceptance. Do not relabel
the synthetic WebAuthn tests or OIDC fixture tests as production assurance.

## Decision B: first live G06 Edge

Older accepted topology and [G06 deployment design](../v0.1/tencent-mobile-deployment.md)
name SKYFORGE-01. Moving primary development to ZenBook14 does not silently
amend the live target. The Owner must explicitly confirm one of these options;
this package does not rank them.

| Option | Consequences |
| --- | --- |
| A. SKYFORGE-01 remains first live Edge | Preserves the named historical topology and has prior S10 native-daemon evidence. Requires fresh qualification of that machine's current native runtime, principal, workspace and outbound connectivity, plus attended enrollment and power/availability arrangements. ZenBook14 results cannot certify SKYFORGE. Recreating old worktrees is not required or authorized. |
| B. ZenBook14 becomes first live Edge | Currently blocked by its unavailable Codex managed daemon. Requires an additive Owner amendment to the named G06 topology and acceptance target, then successful native daemon startup and fresh qualification of its ordinary native route and selected workspace before enrollment. Establish laptop sleep, power and network availability for away-from-computer operation. Use fresh host/environment identity and local credential custody; copy neither SKYFORGE credentials nor its authority. This remains one-host G06 and does not start G07. |

## Review and later admission record

Record `<OWNER_DECISION_REFERENCE>`, selected values, accountable operators,
candidate commit/package hashes, local test debt disposition, target readiness,
and the two acceptance decisions. Then obtain a **separate bounded deployment
Goal**. This train stops before production changes. Deployment, live acceptance
and release remain separate evidence gates, including the previously required
real unattended soak. No unresolved field can be filled by a test fixture.

```text
GATE_S_PACKAGE_READY=REVIEWABLE_WITH_UNRESOLVED_INPUTS
OIDC_ACCEPTANCE_DECISION_REQUIRED=true
FIRST_LIVE_G06_EDGE_DECISION_REQUIRED=true
GATE_S=OWNER_PRODUCTION_DEPLOYMENT_ADMISSION_REQUIRED
TENCENT_DEPLOYED=false
PRODUCTION_MUTATED=false
LIVE_G06_ACCEPTANCE=false
G07_STARTED=false
```
