# FLEETSPLICE-V0_2-ENVIRONMENTS-012

## Objective

Expand the Host runtime from windows-user to explicit windows-admin and WSL companions without collapsing privilege boundaries.

## Scope

- separately enrolled/authenticated elevated Windows companion;
- WSL Ubuntu companion where required;
- exact Environment generation and principal/path/credential/lifecycle identity;
- narrow out-of-process native helper only for proven Win32 needs such as ACL/token/Job/process handles/DPAPI/ConPTY/reparse/update verification;
- Rust is permitted for the helper but not required by name;
- no Session-0 service as default Agent owner.

## Owner-attended gates

UAC/elevation, logout/reboot/sleep, cross-integrity IPC, destructive WSL lifecycle tests may be `OWNER_ATTENDED_REQUIRED`. Never bypass OS consent or persist broad elevation.

## Acceptance

User/admin/WSL environments are distinct in UI and authority; normal-user commands cannot cross into admin by payload; safe lifecycle/reconnect tests pass for qualified capabilities.

Return `DISPOSITION=PASS_V0_2_ENVIRONMENTS` or accurate `OWNER_ATTENDED_REQUIRED`.