# Architecture decision records

All six records were accepted with immutable G03 Architecture 0.1.
Current v0.1 semantics apply the additive
[G04A amendment](../architecture/amendments/g04a-visible-mvp-simplification.md)
first. Its exact supersession register identifies each affected numbered
decision and consequence; record bodies remain historical accepted evidence.

| ADR | Retained decision / current override |
| --- | --- |
| [0001](0001-hub-edge-command-and-failure-boundary.md) | Hub/Edge ownership, typed intent/plan/exact command and honest effects; anchor/permit/safety delivery replaced by minimum journaled dispatch. |
| [0002](0002-session-identity-control-and-authority.md) | Session/Lane/Segment, exact generations, one controller and immutable grants; anchored transitions/renewal replaced by fences and cold recovery. |
| [0003](0003-driver-compatibility-and-provider-binding.md) | Native Codex, capability qualification, explicit migration and local credentials; source closure uses amended recovery. ACP first use is G11. |
| [0004](0004-windows-runtime-storage-and-native-helper.md) | Per-user Edge and SQLite; generic helper/Admin/WSL breadth deferred, minimum journals G05, complete recovery/storage G08-G10. |
| [0005](0005-shared-interaction-semantics-and-ui-reuse.md) | Shared Fleet-owned WebUI/future TUI; G06 now remote mobile alpha and G07 multi-host. |
| [0006](0006-security-provenance-and-self-iteration.md) | Secret/privilege/provenance and independent activation boundaries; external anchor/continuity profile deferred. |

`ARCHITECTURE_0_1_READY=true`. No ADR is implementation authorization.
[Current status](../train/G04A-status.md) governs formal G04/G04A acceptance and
the explicit stop before G05. Old pending-review wording inside a G03 body
describes that historical object, not current repository status.
