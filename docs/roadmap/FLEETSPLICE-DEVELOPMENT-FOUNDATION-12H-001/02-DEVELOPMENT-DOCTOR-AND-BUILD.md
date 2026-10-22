# F01–F02 — Development doctor and focused baseline

Verdict: **READY_FOR_SCOPED_NODE_DEVELOPMENT_AND_MOCK_BROWSER_TESTS**.
This is not a globally READY host, native-adoption qualification, complete
desktop-package qualification or release receipt. No global installation occurred.

## Actual toolchain and restoration

| Component | Observation | Scope |
| --- | --- | --- |
| Qualified Node / built-in SQLite | **v24.20.0 / 3.53.4**, x64, existing FS toolcache | PASS through existing qualified-node wrapper |
| Default PATH Node / SQLite | v24.5.0 / 3.50.3 | Not qualified for SQLite-dependent FS commands; PATH unchanged |
| npm | 11.5.1 | Existing installation; update notice ignored |
| Rust / Cargo | 1.88.0 / 1.88.0, host x86_64-pc-windows-msvc | Version probes and disposable MSVC link PASS |
| Tauri CLI | 2.11.5 | Version probe PASS; full Tauri/NSIS packaging NOT_RUN |
| Windows SDK | Include directory 10.0.26100.0 observed | Inventory plus minimum Rust link; full SDK feature coverage not claimed |
| Edge / Playwright | Edge 156.0.4314.30 / package 1.63.0 | One real headless Edge test against a mock-only loopback Hub PASS |
| OpenSSL | 3.6.1, library 3.6.1 | Existing PATH executable; local TLS prerequisite probe PASS |

The first doctor exited **1**: qualified Node and OpenSSL were available, but
the fresh worktree lacked npm closure, Tauri CLI and Playwright package.
The browser finding's prose mentioned availability despite its failing status;
the status and missing package were inspected rather than accepting that prose.

Before restoration, package scripts and lockfile were reviewed: lockfile v3,
75 package entries including root, resolved hosts only registry.npmjs.org,
no root lifecycle install hooks. The only hasInstallScript entry is optional
Darwin fsevents 2.3.3. Restoration used the **already installed qualified Node**
to run existing npm's CLI:

```text
node scripts/with-qualified-node.mjs <installed-npm-cli.js> ci --ignore-scripts --no-audit --no-fund --cache C:\Dev\cache\npm
```

Exit **0**, 74 packages added. Install scripts were not run; the Windows build
and CLI checks below independently verified the needed package binaries.
No npm/Paseo/Codex/Node/Rust update, browser download or global config edit.

Unchanged manifest SHA-256:

- package.json: `4266DB9DA3796E001F333B5C0AD4CAF0ABA9B9EC4C8971641935F96FA8DD4941`
- package-lock.json: `DED18F8CE14E20A12378EF8AECD61F4AE344B010FBB81DEE5700A50FE30EB90E`

## Command receipt

Each listed command ran once. Logs and exact UTC start/end/exit values are in
private F01/F02 receipts. Commands are relative to the isolated worktree.

| Command / bounded probe | Result | Actual evidence |
| --- | --- | --- |
| npm run development:doctor before restore | FAIL, exit 1 | Expected fresh-worktree dependency absence; no speculative product fix |
| Project npm ci above | PASS, exit 0 | Lock closure restored without lifecycle scripts |
| npm run development:doctor after restore | PASS, exit 0 | All five existing doctor findings PASS |
| npm run tokens:check | PASS, exit 0 | Token artifacts unchanged |
| npm run check | PASS, exit 0 | Qualified Node + TypeScript noEmit |
| npm run build | PASS, exit 0 | TypeScript product build and Vite Web output |
| qualified-node tsc -p tsconfig.test.json | PASS, exit 0 | Compile existing test suite; not full test execution |
| Qualified Node test runner: development-doctor, native-config-state, reconnect-noreplay files | PASS, exit 0 | 14 tests; no real native port |
| Native-adoption named contract subset | PASS, exit 0 | 7 tests: owner/race, incarnation, exact loaded thread, same-thread mock control, source identity, connection loss, ambiguous outcome |
| SYNTHETIC_BROWSER_ADOPTION named test | PASS, exit 0 | 1 headless Edge test; fixture RPC only, temporary 127.0.0.1 Hub closed in finally |
| Tauri CLI --version | PASS, exit 0 | Native CLI package available |
| rustc disposable empty main, default MSVC target, link to private scratch executable | PASS, exit 0 | Executable linked, **not executed**; no Cargo dependency fetch |
| Full npm test / large CI / soak | NOT_RUN | Outside proportional baseline; no changed product surface |
| Full desktop/package / NSIS installer | NOT_RUN | Larger Cargo/package lifecycle not needed for this smoke; package readiness unqualified |
| Real-native / phone / deployed topology tests | BLOCKED_OWNER_REQUIRED / NOT_RUN | Current Goal allows zero native effects and no deployment |

**22 existing tests passed, 0 failed**. The separate F03 original mock/source
spike adds **12 checks**, not 12 real plugin/native integration tests.
Filtered tests do not count the rest of the suite as executed.

The initial vswhere inventory did not report C++ workload versions. That alone
was insufficient to conclude MSVC was missing: the subsequent direct rustc
link probe succeeded. No MSVC install is recommended from the earlier absence.
The existing doctor's Rust/Tauri PASS is also shallower than a package build.

## Outputs, reproduction and remaining work

Build output includes index.html (412 bytes), CSS (27,488 bytes), bundled JS
(283,143 bytes) and static preferences-init.js (1,015 bytes).
Private F02-build-artifact-hashes.json records SHA-256 for all four files.
dist/, node_modules/ and test-results/ remain ignored and unstaged.
Test temporary files were directed to private Goal scratch; no normal native
session home or real server was used. Temporary browser/Hub jobs completed.

Reproduction uses the existing repository scripts and wrapper. The named native
subset and synthetic browser selection, plus exact arguments, are retained in
F02-command-results.json. Do not use accept:native-live, accept:s10-real-native,
native-demo or adopt as unattended environment probes: they have different
authority and can connect to or affect native state.

No environment repair is currently required for scoped Node development.
Later desktop delivery must separately qualify the actual Cargo lock closure,
Tauri build resources and installer. Later native work first needs the source
compatibility corrections/qualification identified in [03](03-PASEO-B2-VS-FS-FEASIBILITY.md).
