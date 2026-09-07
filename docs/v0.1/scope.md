# v0.1 Scope and Stop Boundary

The current contract is G04 as corrected by
[G04A](../../goals/FLEETSPLICE-G04A-VISIBLE-MVP-PREDEVELOPMENT-CLOSURE-004A.md).
[Current status](../train/G04A-status.md) governs PASS and implementation flags.
[Architecture 0.1](../architecture/baseline-0.1.md) at G03 commit
`96cb7a4965a651b8582a3ee35049d52204c3fc73`, tree
`b554b8568b633397681307d73c7d7fec105963bd`, remains the immutable base;
the [G04A amendment](../architecture/amendments/g04a-visible-mvp-simplification.md)
is the explicit normative override. Both literal accepted objects must be cited
by later implementation receipts.

## Product promise

One Owner-facing URL controls real Codex sessions on a small Fleet, with local
truth and provider credentials kept at each per-user Edge. The first useful
remote product is G06: mobile browser -> Tencent Beijing Hub + WebUI ->
SKYFORGE-01 windows-user Edge -> native Codex. ZenBook Duo follows in G07.

`VISIBLE_INCREMENT_RULE=true`. Every major implementation Goal ends in a
directly operable and observable capability. Infrastructure-only chains delaying
usable behavior across several Goals require a concrete unavoidable dependency
and the shortest visible delivery path.

| Goal | Visible increment | Boundary |
| --- | --- | --- |
| G05 / M0 | Local SKYFORGE real Codex prompt/stream, choose Workspace, create/continue session. | Minimum W1/W5; same-host loopback HCP; real native session, never fixture-only PASS. |
| G06 / M1 | Remote mobile MVP, v0.1-alpha.1: secure login, session/prompt/stream, harmless approval, interrupt, basic reconnect and state. | Tencent Hub + WebUI; real mobile-network or equivalent remote browser; no ZenBook dependency. |
| G07 / M2 | Operate either SKYFORGE or ZenBook from the same browser/mobile UI. | Distinct identities, selected Workspace, no silent retarget, explicit controller/takeover. |
| G08 / M3 | Restart/disconnect and return to the same honest Fleet session/history. | Complete recovery journals, checkpoints/cursors, response-loss reconciliation and explicit ambiguity. |
| G09 / M4 | Confirm qualified migration or see evidence-backed NO_QUALIFIED_TARGET. | No transparent failover or credential copying. |
| G10 | Hardened two-host/mobile release with usable backup/restore/update/rollback. | No feature expansion except safety/acceptance defects. |

The future shape remains React/TypeScript/Vite WebUI, Node/TypeScript Hub and
per-user Edge, shared closed contracts, native Codex stdio driver, and separate
Hub/Edge SQLite journals. See [repo layout](repo-layout.md). Full history/blob
storage belongs to G08, but safety journals, IDs, dedupe, native identity capture,
controller fencing, no blind retry and visible AMBIGUOUS_EFFECT start in G05.

## Exclusions

ACP, Admin/WSL, TUI, IDE/files/diff/Git/terminal panels, transparent provider
failover, enterprise tenancy, scheduling, Workspace synchronization and
Coordination Loop integration are outside v0.1. The external AuthorityAnchor,
participant pins, renewable permits, seamless rollback continuity and old
SafetyControl/D/O/R machinery are outside the v0.1 critical path under the
amendment; their retained safety properties have explicit simpler replacements.

## Stop

G04A creates documentation only. It creates no apps/, packages/, package.json,
lockfile, product runtime/database, dependencies, CI workflow, Docker
deployment, credentials or enrollment and never contacts/mutates Tencent Cloud.
G05 remains unstarted even after formal G04/G04A PASS.

`OWNER_RESUME_REQUIRED_FOR_G05=true`. Station A readiness is not Station A
merge or execution authority. The [decision ledger](acceptance-contract.md#owner-decision-ledger)
assigns policy at first use; future G06/G10 inputs do not block G05.
