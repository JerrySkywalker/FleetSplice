# FLEETSPLICE-PGS-S06-RUNTIME-SHARING-001

## 目标

建立 AgentRuntime registry 和 selective sharing policy，使常规产品使用不再要求每次
`adopt --workspace`。

## Runtime model

Each adapter exposes product-neutral state:

- runtime adapter id/kind
- installed/discoverable
- enabled
- shared
- healthy/degraded/unavailable
- discovered session count
- capability evidence

At minimum integrate Codex as a real adapter. AGY may be a disabled/unavailable adapter
entry if its full native contract is not yet implemented; do not fake AGY control.

The key product requirement is that an installed runtime can remain unshared.

Example:

```text
Codex installed=true enabled=true shared=true
AGY   installed=true enabled=false shared=false
```

## Automatic Workspace/session discovery

For shared Codex:
native inventory -> thread cwd -> exact filesystem/root proof -> Workspace binding ->
Gateway projection.

Do not weaken current Workspace identity checks.

Sharing scope supports at least:
- all eligible workspaces
- allowed roots

"Ask on first discovery" may be implemented only if it stays within train scope.

`adopt --workspace` remains debug/manual override.

PASS token:
`PASS_PGS_S06_RUNTIME_SHARING`