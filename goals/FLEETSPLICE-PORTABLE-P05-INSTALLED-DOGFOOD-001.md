# FLEETSPLICE-PORTABLE-P05-INSTALLED-DOGFOOD-001

Purpose: turn the P04 source-tree proof into a reversible installed ZenBook14
candidate suitable for the Owner's first experience.

## Installed product

Build the current Windows package from the exact train head.

Install only a per-user/reversible candidate on ZenBook14. Do not alter the
Owner's Codex installation.

Prove:

- Agent/Desktop start and status;
- optional user-controlled autostart behavior;
- exact package/build provenance;
- shared native server starts only when required by enabled sharing;
- no orphan app-server after FleetSplice shutdown;
- native server restart/fencing remains correct;
- Codex sharing pause/resume;
- fresh-shell CLI/Desktop parity;
- uninstall/rollback path is documented and does not delete Codex/provider
  credentials.

## Launch UX

Ordinary `codex --yolo` remains the north-star.

First Owner experience may use an explicit, product-supported FleetSplice launch
action or Codex remote attachment if that is the only upstream-supported route.

Do not add a transparent PATH shim or fake `codex` executable.

If ordinary-launch convergence requires a separate change to
`codex-windows-patched`, record a bounded follow-up rather than patching Codex
inside this FleetSplice child.

## PASS

`PASS_P05_INSTALLED_ZENBOOK14_DOGFOOD_READY`
