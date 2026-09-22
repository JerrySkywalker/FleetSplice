# Self-hosted deployment profiles

FleetSplice Core receives one deployment profile; it does not configure DNS,
TLS, IdP applications, WireGuard, Tailscale, reverse proxies, or cloud hosts.
The public discovery document is `/.well-known/fleetsplice` and contains only
versioned, non-secret endpoint data.

## Simple profiles

| Profile | Gateway URL | Derived carriage |
| --- | --- | --- |
| Local development | `http://127.0.0.1:43155` | HTTP API/SSE and loopback `ws://.../hcp/v1/connect` |
| LAN self-hosting | `https://fleet.lan.example` | HTTPS API/SSE and `wss://fleet.lan.example/hcp/v1/connect` |
| Public self-hosting | `https://fleet.example` | HTTPS API/SSE and `wss://fleet.example/hcp/v1/connect` |
| Private overlay | `https://fleet.mesh.example` | HTTPS API/SSE and `wss://fleet.mesh.example/hcp/v1/connect` |

Only the explicit `LOOPBACK` profile permits HTTP/WS, and it must use
`localhost`, `127.0.0.1`, or `[::1]`. All other profiles require HTTPS/WSS.

## Gateway listener binding

The Gateway listener is configured separately from its public identity. A
deployment supplies a physical bind host/port and, for every non-loopback
profile, already-provisioned TLS key/certificate material. FleetSplice derives
Host, Origin and discovery endpoints from the deployment profile rather than
from the bind address. It never creates DNS records, certificates, OIDC
applications or a reverse-proxy configuration. Agents use the explicit (or
discovered) HCP URL; a non-loopback `ws://` endpoint is rejected. Normal TLS
verification remains enabled. A test may inject an ephemeral CA explicitly,
but that is not a production trust default.

## Advanced endpoint overrides

An advanced profile may override API, realtime, HCP, login, or enrollment URLs
when the deployment has a separate ingress path. Each override remains an
absolute credential-free URL with the profile-appropriate protocol. Wildcard
origins, URL credentials, query strings, and fragments are rejected. Discovery
never serializes secrets, OIDC client values, or device private keys.

Casdoor, Keycloak, Authentik, Zitadel, Dex, Entra, Okta, ingress products and
network overlays are deployment choices, not FleetSplice Core dependencies.
