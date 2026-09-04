# FLEETSPLICE-V0_1-M0-WALKING-SKELETON-005

## Objective

Produce the first real vertical slice on SKYFORGE-01:

```text
Browser -> React/Vite WebUI -> Hub -> FleetCommand -> Edge -> Codex app-server -> events -> WebUI
```

The milestone is not complete until a user prompt entered in the browser receives a real Codex response through FleetSplice.

## Scope

- React + TypeScript + Vite WebUI;
- Node/TypeScript Hub and per-user Edge;
- minimal shared typed contracts;
- native Codex app-server stdio driver;
- minimum command families: workspace.register, logicalSession.create, sessionLane.acquireControl, sessionLane.continue, turn.submit;
- minimal durable command/Edge journals required by Architecture 0.1;
- W1/W5 UI subset only.

## Non-goals

Second host, rich auth, ACP, admin/WSL, provider migration, full history, file tree/diff/terminal, TUI.

## Acceptance

- clean install/build/test path;
- WebUI loads;
- SKYFORGE/windows-user and one registered workspace are visible;
- a LogicalSession is created;
- Codex native session is started/continued;
- prompt streams real output back to browser;
- command IDs/receipts are inspectable;
- no native-any escape hatch.

Return `DISPOSITION=PASS_M0_WALKING_SKELETON`.