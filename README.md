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

The accepted local train has reached G05B-R1. The Owner has personally
dogfooded the local lifecycle on SKYFORGE: persistent proxy configuration,
fresh-shell start, detached Supervisor/Hub/Edge and native Codex runtime,
second-shell status, clean stop and `SAFE_TERMINAL`.

No further product implementation is authorized by the current documentation
maintenance. `G05C_STARTED=false` and `G06_STARTED=false`.

The next **planned** local step is G05C Native Agent Control Parity. It is scoped
to the control capabilities needed before remote phone use: explicit Workspace
targeting, live model/reasoning discovery, permission presets including YOLO,
effective-permission verification, native Codex tool activity, approval,
interrupt, steer and compact activity projection. Simple left/right sidebar
collapse is a bounded usability correction.

G05C is not a workstation rebuild: no embedded terminal, editor, Git IDE,
browser, worktree manager, Tencent deployment or phone UI is part of that
planned local step.

After local control parity is separately authorized, implemented and personally
dogfooded, G06 will project the already-proven control surface to a real
phone/browser through an Owner-controlled Tencent Cloud Beijing Hub + WebUI and
an authenticated outbound Edge connection from SKYFORGE. ZenBook remains a
later multi-host step.
