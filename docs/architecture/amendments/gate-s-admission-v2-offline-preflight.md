# Gate S admission v2 and offline preflight

Status: local hardening contract for review; Gate S remains unadmitted.

The Owner's [generic OIDC decision](gate-s-g06-human-oidc.md) replaces the
passkey-specific first-live-G06 requirement. The historical v1 local predeploy
placeholder object remains unchanged for compatibility. Its `RP_ID` is not an
active generic OIDC Gate S input. The active machine-readable production draft
is `GateSAdmissionDraftV2` in `packages/predeploy/admission-v2.ts`, with an
unresolved template at `docs/train/gate-s-admission-v2.template.json`.

The draft records `GENERIC_OIDC` and `ZENBOOK14` only as resolved Owner
decisions. `FIRST_LIVE_EDGE` is not a production value: offline preflight
enforces the decision and rejects a `values.FIRST_LIVE_EDGE` override. The 21
production infrastructure inputs start `UNRESOLVED`. The draft carries an OIDC
custody reference or policy, never a client secret, and exact CORS origins. Offline
preflight validates internal shape and consistency only. A fully shaped draft
can reach `READY_FOR_EXTERNAL_INFRA_VALIDATION`; that result proves no DNS,
certificate, IdP, Edge, infrastructure or Gate S readiness. The future external
audit and explicit deployment authorization remain separate gates.

This amendment does not change runtime identity, native qualification,
enrollment, authority fencing, or historical receipts.

The Owner's portable-host decision supersedes the earlier SKYFORGE first-live
selection. ZenBook14 is the primary development host and first live G06 Edge;
SKYFORGE is offline and optional. No fresh SKYFORGE qualification is required
for Gate S or first live G06. ZenBook14 still requires real native-runtime and
remote-path qualification before those later gates can pass.
