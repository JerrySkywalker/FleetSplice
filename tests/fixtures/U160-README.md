# U160 evidence and reproduction

`u160-auth-worker.ts` runs a real Gateway with a disposable HTTPS OIDC provider/JWKS/signature exchange and a synthetic Native port. Keys, state, logs and browser profiles are generated only under this Goal's private artifacts. Backend CA trust is scoped to the forked worker. This is not production IdP, TLS, OS identity or Native qualification.

Browser checks: compile with `tsc -p tsconfig.test.json`, build Web, then run the compiled `u160-auth`, `u160-session`, `u160-errors` and `u160-font` cases using the qualified Node runtime. The fixtures use Edge headless, and accept their own self-signed certificates only in those disposable contexts. Default tests do not launch Desktop.

## Actual Tauri/WebView2

The opt-in `u160-webview.test.ts` uses the official [Microsoft WebView2 WebDriver interface](https://learn.microsoft.com/en-us/microsoft-edge/webview2/how-to/webdriver) with [documented capabilities](https://learn.microsoft.com/en-us/microsoft-edge/webdriver/capabilities-edge-options). This is the native Windows driver underlying the [Tauri manual path](https://v2.tauri.app/develop/tests/webdriver/manual-setup/). No global driver/plugin installation or additional product runtime dependency is required. Download a driver matching the actual WebView2 runtime into private Goal tools; the observed matching pair was155.0.4283.62. Preserve the downloaded license with the private tools.

Build Desktop frontend, then in a process-scoped PowerShell environment:

```powershell
$env:CARGO_TARGET_DIR='<program-artifacts>/U06/cargo-target'
$env:TAURI_CONFIG='{"bundle":{"resources":[]},"app":{"withGlobalTauri":true}}'
cargo build --manifest-path apps/desktop/src-tauri/Cargo.toml --locked --offline --example u160-workspace
```

The test build omits Agent bundle resources and exposes Tauri's official global JS API for the IPC probe; it does not alter the Manager-only capability file. The example reuses product UI and Workspace window helpers, has only static synthetic Agent read responses and window IPC, and has no ordinary Desktop setup, Agent control record, autostart/single-instance plugin or Native adapter. It requires a named disposable `--profile` argument because WebDriver prepends its own process arguments.

After test compilation, set `FLEETSPLICE_U160_WEBVIEW_BINARY` to the private `debug/examples/u160-workspace.exe`, `FLEETSPLICE_U160_WEBVIEW_DRIVER` to the private `msedgedriver.exe`, and run compiled `tests/u160-webview.test.js`. Both paths must be inside this program's artifact root. The test creates its own Gateway pair, WebView profile and loopback driver; it deletes the driver session and stops only its own process tree/fixtures. The certificate exception is confined to the isolated test WebView; it is not a production trust-store change.

Evidence includes actual WebView OIDC, reuse during an IdP document, explicit Manager close/reopen, separate Gateway sessions, and exact remote IPC denial. A WebDriver page close is not an OS window close; the test uses the product Manager's explicit close-window command. Native menu clicks remain NOT_RUN because WebView WebDriver cannot operate native menus. This does not accept H0-H4/Gate S or prove real Codex availability. Native connections/effects stay0/0.

## U07/U08 transport and candidate

The worker's explicit `remote` fixture mode uses the production Gateway RemoteAdoptionPortProxy, Edge endpoint/receiver and Edge TLS endpoint resolver over authenticated outbound loopback WSS. Only the local AdoptionPort is synthetic. HCP targets, requests, command/Thread IDs and lookups are recorded privately. The ordinary Agent lifecycle, OS identity custody and production device enrollment are NOT_RUN; the handshake uses fresh synthetic identity and a private test bearer. No native adapter is constructed, and no product mock switch is added.

The local TLS helper also covers127.0.0.1 and can create its temporary files inside the supplied private run directory. This lets normal certificate verification authenticate the loopback WSS fixture without changing OS trust or disabling TLS checks. `u160-integration.test.ts` covers response loss, disconnect/reconnect, exact receipt lookup, Viewer and OIDC expiration without replay. Optional video uses `FLEETSPLICE_U160_RECORD_VIDEO=1` and a Goal-local Playwright FFmpeg tool path; it installs no browser or global toolchain.

`scripts/u160-candidate.mjs` starts the same synthetic preview with a30min lifetime, stdin commands and an own-run STOP marker. `scripts/package-u160-candidate.mjs` collects the current Web/Manager builds, qualified test executable, private screenshots/video and start/stop instructions. It requires a passing integration result and matching passing WebView binary hash. The bundle is deliberately workspace-bound: preserve its source worktree, restored dependencies and compiled fixtures. It is not a portable product installer. All runtime data and packages remain private artifacts; only source and deidentified receipts belong in Git.
