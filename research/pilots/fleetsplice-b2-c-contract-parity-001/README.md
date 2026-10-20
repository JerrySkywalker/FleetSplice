# Experimental B2/C contract parity harness

**Current status: EXECUTED.** Genuine `@getpaseo/plugin@0.12.0` compiles and the
published official PluginRuntime/worker/context loads this original provider in
an isolated in-process sandbox. The app-session host and native port are synthetic.
18 assertion groups / 36 route-case records include deliberate contract blockers;
this is not a real Codex qualification. Native connections/effects are **0/0**.

## Reproduce in an isolated Windows worktree

Prerequisites: this PR and its unchanged FS base, npm, tar, network access to the
public npm registry, and existing **Node 24.20.0 / SQLite 3.53.4** recognized by the
root qualified-Node wrapper. Missing runtime stops; no global installation occurs.

From this pilot directory:

```powershell
$env:PILOT_ARTIFACT_DIR = 'C:\Dev\artifacts\fleetsplice\FLEETSPLICE-B2-C-CONTRACT-PARITY-PILOT-001\reproduce'
npm run reproduce
```

This restores root FS and pilot lockfiles with lifecycle scripts disabled, then
builds and executes only the focused pilot. Run it only in an isolated worktree:
npm ci replaces that worktree's node_modules. With restored dependencies, `npm test`
runs the focused runner. The wrapper selects qualified Node; final pilot
TypeScript is 5.9.3, while root FS keeps its unchanged compiler.

Logs default to ignored `results/` if the artifact variable is absent. The
integrity-pinned official server tarball/vendor source is extracted privately;
its loader bundle/cache stays ignored. No native socket or listener is needed.
`scripts/loader.mjs` uses the official built-in loader path and stops its own
in-memory plugins. It stages original provider/mock sources in the required
`server/` layout; this tree is not a distributable daily Paseo plugin.

`tests/routes.mjs` constructs unchanged compiled FS C classes;
`tests/discovery.mjs` executes unchanged discovery in a wholly synthetic Windows
VM, never real PowerShell/ACL checks. `tests/parity.test.mjs` emits normalized
receipts. `scripts/check.mjs` checks public JSON/links/license/lock/evidence.
[Dependency provenance](THIRD-PARTY.md) distinguishes original MIT work from SDK
dependencies; no vendor implementation is committed.

The B2 provider is sequential and fixture-bound with a connection-local memory
ledger. CP15 demonstrates a fresh-connection/bare-adapter second dispatch after
unknown delivery; C detects conflict only after sending. Real Windows security,
Writer custody, native cursors and G08 complete history remain unqualified.

Authoritative plan: [GOAL-TRAIN](../../../docs/research/platform-decision/FLEETSPLICE-B2-C-CONTRACT-PARITY-PILOT-001/GOAL-TRAIN.md) and [Acceptance](../../../docs/research/platform-decision/FLEETSPLICE-B2-C-CONTRACT-PARITY-PILOT-001/ACCEPTANCE-AND-EVIDENCE.md).

## Structure

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
