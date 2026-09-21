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

## Advanced endpoint overrides

An advanced profile may override API, realtime, HCP, login, or enrollment URLs
when the deployment has a separate ingress path. Each override remains an
absolute credential-free URL with the profile-appropriate protocol. Wildcard
origins, URL credentials, query strings, and fragments are rejected. Discovery
never serializes secrets, OIDC client values, or device private keys.

Casdoor, Keycloak, Authentik, Zitadel, Dex, Entra, Okta, ingress products and
network overlays are deployment choices, not FleetSplice Core dependencies.
