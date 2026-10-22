# Workspace browser authentication — U160

Accepted Architecture0.1/G04A remains the authority boundary. The Workspace Web surface uses the Gateway's existing human OIDC session, independently of Desktop Manager IPC and host Agent identity. First open reads same-origin `/api/auth/status`; unauthenticated OIDC users follow `/auth/login` and the existing verified callback. Tokens stay server-side. The browser receives only the existing HttpOnly/Secure/SameSite cookie, then obtains a new client grant. Public status contains mode/authentication and, only for a valid session, principal ID/expiry; it grants no control and does not extend idle expiry.

Desktop's external Workspace WebView follows the same flow. Its cookie store belongs to that application profile, not an existing system-browser profile. No credential copying, Manager token bridge or implicit control acquisition is introduced. Actual WebView proof is U06; browser OIDC proof alone is not Desktop acceptance.

LOOPBACK_BOOTSTRAP remains an attended development path with a fresh one-use private fragment link. An origin-only Manager launch cannot invent that authentication. The signed-out page explains this limitation rather than reusing an old token. Logout/expiry continuity is completed separately in U03; H0-H4/Gate S and real Native availability remain unaccepted.
