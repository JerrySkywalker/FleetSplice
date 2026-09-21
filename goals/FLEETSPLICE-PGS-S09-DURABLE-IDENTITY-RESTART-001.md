# FLEETSPLICE-PGS-S09-DURABLE-IDENTITY-RESTART-001

## 目标

补齐 G06/Pre-Gate-S 所需的 durable identity/config facts 和 fail-closed restart
semantics，但不偷做 G08 complete history/recovery。

## 必须 durable

As applicable:
- admitted owner HumanPrincipal binding / OIDC provider configuration identity
- Device public identity
- enrollment generation
- revocation state
- Gateway deployment/config generation
- Agent runtime sharing configuration
- local device private-key custody using the appropriate Windows per-user protection seam

## 可以重启失效

- browser Fleet session
- CSRF/clientInstanceId
- controller lease
- reconnect grace

Restart must require reauthentication/re-admission as needed and must never resurrect old
control authority merely from persisted metadata.

## Faults

Test corrupted/missing identity stores, stale generation, revoked device, Gateway restart,
Agent restart and config incompatibility. Fail closed and produce doctor diagnostics.

Complete LogicalSession durable history/checkpoints remain product G08 scope.

PASS token:
`PASS_PGS_S09_DURABLE_IDENTITY_RESTART`