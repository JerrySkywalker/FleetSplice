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

One URL must control a real Codex session on either SKYFORGE-01 or ZenBook Duo, with two-host visibility, prompt/stream, approval/interrupt, durable history/reconnect, Hub restart survival, explicit ambiguity, and confirmed provider migration.

## Explicitly deferred from v0.1

ACP second Agent, admin/WSL, full files/diff/Git/terminal UX, TUI, Coordination Loop integration, scheduler, transparent failover, enterprise tenancy, plugin SDK.

## Gate

No feature may enter v0.1 merely because it is convenient while implementing another feature. Out-of-scope discoveries become backlog notes.

## Acceptance

Implementation contracts cite accepted Architecture 0.1 and authorize exactly G05-G10 product implementation.

Return `DISPOSITION=PASS_V0_1_IMPLEMENTATION_CONTRACT`.