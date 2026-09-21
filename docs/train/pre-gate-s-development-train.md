# Pre-Gate-S Development Train

The accepted product baseline is the G06 predeploy night-train head
`221e326bc74be1d9ae680e373d9fd40be1631ca3`.

The next product-development train is
[FLEETSPLICE-PRE-GATE-S-DEVELOPMENT-TRAIN-001](../../goals/FLEETSPLICE-PRE-GATE-S-DEVELOPMENT-TRAIN-001.md).

Its purpose is to turn the proven G06 remote primitives into a complete
self-hostable Gateway + Windows Agent/Desktop product before any production
deployment.

## Sequence

```text
S00 Independent Audit
S01 Product Path Consolidation
==== Gate A ====
S02 Deployment Profiles + /.well-known discovery
S03 Generic OIDC Human Authentication
S04 Gateway Dashboard
==== Gate B ====
S05 Windows Agent + Local IPC
S06 AgentRuntime Registry / Selective Sharing
S07 Tauri Desktop + Local CLI
S08 Device Pairing
==== Gate C ====
S09 Durable Identity / Restart
S10 Real Native Remote Local E2E
S11 Installer / Installed Dogfood / Closeout
==== Gate S ====
OWNER_PRODUCTION_DEPLOYMENT_ADMISSION_REQUIRED
STOP
```

## Product usage target

Normal Windows operation after the train:

```text
Windows login
 -> FleetSplice Agent/Desktop (autostart if enabled)
 -> outbound Gateway connection
 -> Codex sharing ON / other runtimes independently configurable
 -> user runs ordinary codex --yolo
 -> session/workspace is discovered automatically
 -> Web Dashboard sees and controls the allowed session
```

`fleetsplice adopt --workspace` remains only as a debug/manual override.

## Deployment target

FleetSplice is open-source/self-hostable. URLs and identity providers are
deployment configuration, not Core dependencies.

- generic Gateway URL / derived endpoints;
- optional explicit HCP WSS override;
- standard `/.well-known/fleetsplice` discovery;
- generic OIDC with Casdoor as the Owner's first provider/preset;
- HTTPS/WSS regardless of public/LAN/private-overlay topology;
- Ed25519 device identity independent of human OIDC.

Gate S is a production deployment admission ceremony, not another implementation
milestone.