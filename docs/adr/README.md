# Architecture decision records

## Status

The records below are accepted with
[Architecture Baseline 0.1](../architecture/baseline-0.1.md).

`ARCHITECTURE_0_1_READY=true`

`IMPLEMENTATION_AUTHORIZED=false`

`Accepted` records the Owner-authorized Architecture 0.1 status promotion. It
does not mean implementation-ready or product-authorized. This promotion object
still requires its fresh independent exact-head/tree review before G03 records
the literal accepted object. Product mutation then requires exact-head G04 PASS.

## Accepted records

| ADR | Decision cluster | Status |
| --- | --- | --- |
| [ADR-0001](0001-hub-edge-command-and-failure-boundary.md) | Fleet-scoped AuthorityAnchor lineage, Hub/Edge authority, FleetCommand/EdgeCommand, reconnect, and ambiguity | Accepted |
| [ADR-0002](0002-session-identity-control-and-authority.md) | LogicalSession/Lane/Segment identity, lane control, and immutable grants | Accepted |
| [ADR-0003](0003-driver-compatibility-and-provider-binding.md) | native Codex, generic ACP, capability admission, and provider migration | Accepted |
| [ADR-0004](0004-windows-runtime-storage-and-native-helper.md) | per-user Windows runtime, companions, SQLite/blobs, and native helper | Accepted |
| [ADR-0005](0005-shared-interaction-semantics-and-ui-reuse.md) | shared WebUI/TUI semantics, UI reuse, and milestone terminology | Accepted |
| [ADR-0006](0006-security-provenance-and-self-iteration.md) | AuthorityAnchor trust separation, security, donor provenance, trusted kernel, and stable-N self-iteration | Accepted |

All six ADRs are Accepted in this promotion. No ADR authorizes implementation.
