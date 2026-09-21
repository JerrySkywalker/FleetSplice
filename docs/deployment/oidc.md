# Generic OIDC human authentication

FleetSplice uses the standard OIDC Authorization Code flow for human Gateway
access. A deployment supplies its issuer, client ID, optional confidential
client secret, and callback URL. FleetSplice discovers the provider metadata
and JWKS; it has no provider-specific API dependency.

The successful external identity is normalized to a Fleet-owned
`HumanPrincipal`. Its stable ID is the SHA-256 digest of issuer plus subject.
Display name, email, avatar, and groups are optional metadata and never replace
that stable identity. v0.1 admits one owner principal rather than implementing
general RBAC.

The Gateway validates state, nonce, issuer, audience, token signature, expiry,
and issued-at time. It retains the OIDC token exchange only server-side and
creates a Fleet session cookie with eight-hour absolute and fifteen-minute idle
limits. Logout revokes the Fleet session and associated client grants. Neither
OIDC access/refresh tokens nor browser cookies cross the HCP/Agent boundary.

Casdoor is a supported deployment preset candidate. Keycloak, Authentik,
Zitadel, Dex, Entra, Okta, and other conforming providers use the same Core
contract. Production issuer/client/secret/callback selection remains a Gate-S
Owner deployment admission input.
