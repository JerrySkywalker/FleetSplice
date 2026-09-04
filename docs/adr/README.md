# Architecture decision records

## Status

The records below are proposals produced with
[Architecture Baseline 0.1 DRAFT](../architecture/baseline-0.1.md).

`ARCHITECTURE_0_1_READY=false`

`IMPLEMENTATION_AUTHORIZED=false`

`Proposed` means the decision is ready for independent architecture review. It
does not mean accepted, implementation-ready, or product-authorized. G02 must
review the exact draft head; only G03 may accept the baseline and promote these
records. Product mutation then requires exact-head G04 PASS.

## Proposed records

| ADR | Decision cluster | Status |
| --- | --- | --- |
| [ADR-0001](0001-hub-edge-command-and-failure-boundary.md) | Hub/Edge authority, FleetCommand/EdgeCommand, observation, reconnect, and ambiguity | Proposed |
| [ADR-0002](0002-session-identity-control-and-authority.md) | LogicalSession/Lane/Segment identity, lane control, and immutable grants | Proposed |
| [ADR-0003](0003-driver-compatibility-and-provider-binding.md) | native Codex, generic ACP, capability admission, and provider migration | Proposed |
| [ADR-0004](0004-windows-runtime-storage-and-native-helper.md) | per-user Windows runtime, companions, SQLite/blobs, and native helper | Proposed |
| [ADR-0005](0005-shared-interaction-semantics-and-ui-reuse.md) | shared WebUI/TUI semantics, UI reuse, and milestone terminology | Proposed |
| [ADR-0006](0006-security-provenance-and-self-iteration.md) | security, donor provenance, trusted kernel, and stable-N self-iteration | Proposed |

No ADR is Accepted in the current tree.
