# Experimental B2/C contract parity harness

**Current status: SCAFFOLD_REQUIRED.** No source code or tests have been written into this pilot harness yet. The local 12-hour Implementer creates and commits a minimal reproducible implementation here. Do not count this README as an SDK compile/load receipt.

Authoritative plan: [GOAL-TRAIN](../../../docs/research/platform-decision/FLEETSPLICE-B2-C-CONTRACT-PARITY-PILOT-001/GOAL-TRAIN.md) and [Acceptance](../../../docs/research/platform-decision/FLEETSPLICE-B2-C-CONTRACT-PARITY-PILOT-001/ACCEPTANCE-AND-EVIDENCE.md).

## Required structure after local execution

- `package.json` and lockfile appropriate to a **standalone** small research sandbox; installed SDK must be genuine, reproducibly pinned.
- `src/`: original test-only minimal B2 provider implementing official `ProviderRegistration`, an injected fully synthetic native port, and an adaptor for the existing FS C implementation without changing `packages/native-adoption/**`.
- `fixtures/`: synthetic normalized same-contract scenarios for both routes, including native 0.163 installation families, server generation and no caller ID echo.
- `tests/`: deterministic case suite, one-command documented runner, command exit/result table, no real network/native connection.
- `README.md` revised with actual prerequisites and exact local reproduction commands once known. Reject any claim that a toy interface copied from a blog is an "actual Paseo SDK".

## Security/scope

Use `C:\Dev\worktrees` for the current FS Goal worktree, `C:\Dev\cache` for controlled dependency cache, and `C:\Dev\artifacts\fleetsplice\FLEETSPLICE-B2-C-CONTRACT-PARITY-PILOT-001` for private evidence. Do not place private-only or credential files in the public GitHub tree.

Actual Paseo plugin SDK may require project-scoped npm package resolution, compiling its official source, or launching an ephemeral isolated test loader. **Never** run `paseo plugin add`, `paseo reload` or alter the owner's existing Paseo configuration/daemon. If isolation cannot be demonstrated, stop at actual SDK import/registration against a mock host and explicitly record `LOADER_NOT_RUN`.

Do not call a native Codex app-server or existing Windows daemon. All simulated "turns" and "effects" must only manipulate plain mock records in the harness process. No native effect count is inherited from [PR #20](https://github.com/JerrySkywalker/FleetSplice/pull/20). Never delete/kill unknown processes, touch an existing TUI, or expose public listeners.

Paseo SDK remains Apache-2.0 third-party dependency; FleetSplice remains MIT. Prefer SDK package imports over copy/paste. Pin versions and respect license notices. Do not vendor Paseo source or AGPL sources into this pilot.
