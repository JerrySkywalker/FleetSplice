# Gate S admission v2 and offline preflight

Status: local hardening contract for review; Gate S remains unadmitted.

The Owner's [generic OIDC decision](gate-s-g06-human-oidc.md) replaces the
passkey-specific first-live-G06 requirement. The historical v1 local predeploy
placeholder object remains unchanged for compatibility. Its `RP_ID` is not an
active generic OIDC Gate S input. The active machine-readable production draft
is `GateSAdmissionDraftV2` in `packages/predeploy/admission-v2.ts`, with an
unresolved template at `docs/train/gate-s-admission-v2.template.json`.

The draft records `GENERIC_OIDC` and `SKYFORGE-01` only as resolved Owner
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
