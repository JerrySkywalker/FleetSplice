# FLEETSPLICE-PGS-S03-GENERIC-OIDC-001

## 目标

实现 Gateway 的 generic OIDC human authentication。Casdoor 是首个 preset/test
target，但 Core 不得依赖 Casdoor API。

## HumanAuth contract

Normalize successful external identity into Fleet-owned `HumanPrincipal`:

- provider/issuer
- subject
- stable principal identity derived from issuer + subject
- display name/email/avatar/groups as optional metadata

v0.1 remains single-owner admission. Do not build general RBAC here.

## OIDC flow

Implement:
- Authorization Code flow
- discovery/JWKS
- state + nonce
- callback validation
- issuer/audience/signature/time validation
- server-side FleetSplice session
- secure logout/revocation of Fleet session
- absolute/idle Fleet session policy
- no long-lived OIDC token storage in browser
- no human token forwarding to Agent

Tests use a local OIDC fixture/provider. Production Casdoor issuer/client/secret/callback
remain unresolved until Gate S.

## Existing browser-security

Reuse useful Fleet session/CSRF/origin concepts, but do not expose test-only
`assertionOk` virtual passkey logic as production authentication.

No FleetSplice password or production WebAuthn service is required in this train.

PASS token:
`PASS_PGS_S03_GENERIC_OIDC`