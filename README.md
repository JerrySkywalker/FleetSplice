# FleetSplice

FleetSplice is an open-source, self-hosted control plane for coding-agent
sessions running in existing development environments.

It is intentionally **not** an AI IDE/ADE. FleetSplice is meant to let an Owner
observe, authorize, interrupt, steer and resume coding agents across devices
without replacing the local terminal, editor, Git workflow or native agent
runtime. See the [Owner Thesis and Product Boundary](docs/product/owner-thesis.md).

Architecture 0.1 is accepted: `ARCHITECTURE_0_1_READY=true`. Read the
[current architecture](docs/architecture/README.md),
[visible implementation roadmap](docs/v0.1/implementation-roadmap.md), and
[current train status](docs/train/current-status.md).

## Current state

The Owner-accepted local G05C implementation is
`ba8c6fa84db528b9821be5aa672e8267ae744c70`. The post-reboot closeout passes both fresh local smoke lanes; see the
[current status](docs/train/current-status.md) for the controlling state.
`G05C_ACCEPTED=true`, `G06_STARTED=false`, and
`PRODUCT_IMPLEMENTATION_AUTHORIZED=NONE`.

The primary native path is `NATIVE_ADOPTED`: start ordinary Codex in the existing
Workspace and Windows Terminal, then attach FleetSplice to that same thread.
The north-star local command is:

```powershell
codex --yolo
```

FleetSplice requires no wrapper or transparent PATH shim. The native permission
choice remains explicit; bounded approval testing can use native read-only,
on-request settings. Both `NATIVE_ADOPTED` and `FLEETSPLICE_MANAGED` session
origins remain supported. Compatibility is capability-driven: Codex semantic
version and executable SHA are evidence / incarnation metadata, not a native
adoption compatibility allowlist. The managed path retains its historical
artifact qualification fixture.

The proven local train includes safe operation and persistent proxy, live
model/reasoning discovery, read-only native coding, explicit Workspace targeting,
session-scoped READ_ONLY / WORKSPACE_AUTO / YOLO with a Host ceiling, late TUI
adoption, same-thread Web continuation and cooperative controller semantics.
Source provenance, Working / Done and native duration, exact-turn Steer and
Interrupt with honest residual-command state, browser/controller renewal,
scalable activity evidence, command approval Allow Once / Deny, viewer isolation,
TUI/Web approval races and return to the original TUI are part of that train.

FleetSplice owns control authority, not the development environment. Windows
Terminal remains the preferred local human terminal. FleetSplice is not an
IDE/ADE, terminal replacement, Git GUI, worktree manager, embedded editor or
ChatGPT Mobile clone. A transparent PATH shim is not the primary architecture.

[Known non-blocking debts](docs/train/receipts/G05C-native-control-closeout.md#known-non-blocking-debts)
remain documented. G06 requires a separate Owner decision and would project the
proven surface through Tencent Hub + WebUI and authenticated outbound WSS to a
real phone/browser. No G06 transport, phone UI or deployment is authorized here.
