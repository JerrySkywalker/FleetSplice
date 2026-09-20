# ADR 0007 — Remote Native Adoption over typed HCP

Status: Accepted for G06 predeploy local implementation (train T04).  
Does not authorize Tencent access, production enrollment, or live remote acceptance.

## Context

Local G05C Native Adoption keeps an in-process `AdoptionPort` on the Hub
(`snapshot` / `execute` / `renewClient` / `lookup` / realtime subscribe-poll).
Historical loopback HCP primarily carried managed `EdgeCommand` traffic for
`FLEETSPLICE_MANAGED`.

G06 must project the **same** Native Adoption product path to a remote Hub
without making managed Codex primary again, and without tunneling raw Codex
JSON-RPC, terminal/ANSI authority, or provider credentials.

## Decision

Preserve `PRIMARY_NATIVE_PATH=NATIVE_ADOPTED` for remote G06.

Adopt this additive topology as a typed semantic binding of Architecture 0.1
HCP carriage:

```text
Browser
  -> Remote Hub
  -> RemoteAdoptionPortProxy (implements AdoptionPort)
  -> typed HCP adoption messages
  -> SKYFORGE Edge NativeAdoption endpoint
  -> NativeAdoptionAdapter
  -> existing ordinary Codex native session
```

Hub may hold only Fleet-owned semantic projection/control contracts. Native
execution truth, Codex stdio, and provider credentials remain Edge-local.

## Allowed HCP adoption surface

Additive closed message kinds (same envelope versioning/correlation rules as
existing HCP v1) may carry:

| Semantic | Notes |
| --- | --- |
| snapshot / read projection | `AdoptionSnapshot` only |
| execute typed native Fleet control | existing `AdoptionCommand` families only |
| client renewal | `AdoptionClient` + continuity fence |
| receipt lookup | by `commandId` |
| Agent Execution realtime | existing Core stream envelopes |
| Fleet Control realtime | existing Core stream envelopes |
| cursor / catch-up / resync | `sinceRevision` + explicit `RESYNC_REQUIRED` |

## Forbidden on the wire

- raw Codex JSON-RPC method names or arbitrary native-any calls
- terminal / ANSI / PTY byte streams as authority
- provider credentials or Windows auth material
- promoting `FLEETSPLICE_MANAGED` as the remote primary product path
- mandatory third-party relay

## Correlation, backpressure, ambiguity

- Every request carries opaque UUIDv4 correlation IDs; responses echo the same ID.
- Duplicate request with the same ID returns the original receipt (no replay).
- Lost response → lookup by `commandId`; never resend as a new effect.
- Disconnect during possible effect → `AMBIGUOUS_EFFECT` / fail-closed; no silent retry.
- Bounded send queues; overflow fails closed rather than dropping authority events silently.
- Cursor gaps publish explicit `RESYNC_REQUIRED` and force authoritative reconcile.

## Carriage profiles

| Profile | Use |
| --- | --- |
| Local loopback HCP | retained for G05 local / test |
| `REMOTE_ENROLLED_WSS` | Edge-initiated strict-TLS WSS, `fleetsplice.hcp.v1`, compression off, decoded cap 262144 |

Enrollment identity, WebAuthn, and reconnect grace are specified by the
acceptance contract and implemented in later train children; this ADR only
admits the Native Adoption seam.

## Consequences

- T05 may implement `RemoteAdoptionPortProxy` + Edge endpoint against this seam.
- Web `/api/native/*` should remain placement-agnostic (local port or remote proxy).
- If a future requirement needs native-any tunneling or managed-primary remote
  semantics, stop with `OWNER_ARCHITECTURE_DECISION_REQUIRED`.

## Gate A

```text
GATE_A=PASS
PRIMARY_NATIVE_PATH=NATIVE_ADOPTED
REMOTE_NATIVE_ADOPTION_SEAM=ADDITIVE_HCP_BINDING
OWNER_ARCHITECTURE_DECISION_REQUIRED=false
```
