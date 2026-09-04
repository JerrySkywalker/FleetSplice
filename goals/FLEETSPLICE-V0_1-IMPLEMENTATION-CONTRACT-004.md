# FLEETSPLICE-V0_1-IMPLEMENTATION-CONTRACT-004

## Objective

Freeze the v0.1 implementation contract before product code begins.

## Required outputs

Create `docs/v0.1/` planning artifacts covering:

- `scope.md`;
- `acceptance-contract.md`;
- `implementation-roadmap.md`;
- `quality-gates.md`;
- `repo-layout.md`;
- development/test/merge policy.

Freeze a deliberately small initial repo shape:

```text
apps/web
apps/hub
apps/edge
packages/contracts
packages/driver-codex
```

Additional packages require demonstrated need.

## v0.1 required loop

One URL must control a real Codex session on either SKYFORGE-01 or ZenBook Duo,
with two-host visibility, prompt/stream, approval/interrupt, durable
history/reconnect, Hub restart survival, and explicit ambiguity. The G09
provider-migration gate has exactly the outcomes defined by its Goal: either a
real qualified migration after owner confirmation of the exact target, or a
verified, visible, fail-closed `NO_QUALIFIED_TARGET`. Only the first claims that
a migration occurred; every target activation requires confirmation and no
transparent failover is allowed.

## Explicitly deferred from v0.1

ACP second Agent, admin/WSL, full files/diff/Git/terminal UX, TUI, Coordination Loop integration, scheduler, transparent failover, enterprise tenancy, plugin SDK.

## Gate

No feature may enter v0.1 merely because it is convenient while implementing another feature. Out-of-scope discoveries become backlog notes.

## Acceptance

Implementation contracts cite the literal accepted Architecture 0.1 commit
SHA/tree and baseline path from the G03 receipt and authorize exactly G05-G10
product implementation.

Return `DISPOSITION=PASS_V0_1_IMPLEMENTATION_CONTRACT`.
