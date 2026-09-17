# FleetSplice

FleetSplice is a self-hosted control plane for coding-agent sessions in existing
development environments. It is intentionally **not** an IDE/ADE.

## 1. CURRENT PRODUCT IDENTITY

FleetSplice is a self-hosted control plane for coding-agent sessions in existing
development environments. FleetSplice does not replace the local terminal,
editor, Git workflow, worktree flow, or native runtime semantics.

## 2. CURRENT AUTHORITATIVE STATE

```text
ARCHITECTURE_0_1_READY=true
G05C_ACCEPTED=true
G06_STARTED=false
PRODUCT_IMPLEMENTATION_AUTHORIZED=NONE
PRIMARY_NATIVE_PATH=NATIVE_ADOPTED
```

The accepted G05C implementation head remains
`ba8c6fa84db528b9821be5aa672e8267ae744c70`.

Authoritative references:

- [Current status](docs/train/current-status.md)
- [Owner thesis and product boundary](docs/product/owner-thesis.md)
- [Implementation roadmap](docs/v0.1/implementation-roadmap.md)
- [G05C closeout receipt](docs/train/receipts/G05C-native-control-closeout.md)

## 3. PROVEN G05C LOCAL PATH

The proven local path is ordinary native Codex in the existing Workspace:

```powershell
codex --yolo
```

The accepted local operating path includes:

- `NATIVE_ADOPTED` and `FLEETSPLICE_MANAGED` session origins
- no wrapper or PATH shim requirement
- same native thread and cooperative controller semantics
- native runtime owns execution truth and effect semantics
- FleetSplice owns control authority (observe, approve/deny, steer, interrupt, resume)
- return to and continued usability of the original native TUI

## 4. LONG-TERM / POST-v0.1 PRODUCT PRINCIPLES

- Capability @ Environment (capabilities are meaningful in the concrete environment that owns them)
- brownfield-first operation over real existing environments
- split authority with a thin Edge and explicit local execution truth
- independent orchestration, execution, inference, and tool placement
- inference fabric as a Fleet resource, not assumed agent-local
- typed tool placement bound to concrete environments
- failure-honest receipts and explicit `AMBIGUOUS_EFFECT` handling
- Architecture 0.1 remains accepted and authoritative (`ARCHITECTURE_0_1_READY=true`)

## 5. SCOPE BOUNDARY

Issues [#2](https://github.com/JerrySkywalker/FleetSplice/issues/2) through
[#8](https://github.com/JerrySkywalker/FleetSplice/issues/8) are post-v0.1 and
non-blocking for the accepted G05-G10 implementation line.

G06 remains separately authorized and currently unstarted (`G06_STARTED=false`).
These long-term principles clarify direction, but they do not expand or reopen
G06 scope by themselves.
