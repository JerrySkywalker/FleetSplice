# UX05 source result — Desktop modes and IPC boundary

`GOAL_ID=FLEETSPLICE-FPX-UX05-001` · `EVIDENCE=TESTED_UI_AND_TAURI_MOCK_IPC`

Base: development `e3d4cf392f17481a00e5ad21a174347a0fe9a552`. Implements the bounded [UX05](../../goals/fpx/FLEETSPLICE-FPX-UX05-001.md) source increment. Real native connections/effects **0/0**. No daily Desktop, Agent, Codex or autostart setting was changed.

## Modes and authority

The existing Agent Manager keeps its management pages. Workspace is an explicit origin launcher for the same authenticated Web cockpit in a separate Tauri WebView window. Switching modes preserves Manager selection and the entered origin; returning to an existing Workspace focuses it without navigation or reattaching a Thread. A different origin requires closing the prior window. Its native Agent Manager menu provides the return path without granting management IPC to Web content. Both surfaces reuse existing semantic design tokens.

The new launcher accepts only a token-free origin: HTTPS, or loopback HTTP. Credentials, query, fragment and non-root paths are rejected. Navigation remains Web-only, excluding local asset/file schemes. The Workspace obtains ordinary server login/cookies and Fleet authority; Desktop supplies no Controller grant or native token. No iframe, token-injected script or new auth bridge was introduced.

All application commands now have generated Tauri permissions, with one explicit local capability restricted to the bundled `main` Manager. Workspace has no management capability and no remote origin grant. This uses Tauri's documented [application-command manifest and remote access rules](https://v2.tauri.app/security/capabilities/). Window creation uses an async command as required by the [Windows WebView builder contract](https://docs.rs/tauri/2.11.6/tauri/webview/struct.WebviewWindowBuilder.html). Actual locked Rust dependencies resolve to Tauri 2.11.6 / tauri-build 2.6.3; the existing lockfile was preserved.

## Validation

Rust 1.88 and cached dependencies were already usable. Offline locked `cargo check` initially identified absent generated package resources. The existing staging script generated those resources only inside this isolated worktree, then the check passed. No global toolchain or dependency upgrade was needed.

**3 unique focused automated cases passed**: two Rust cases and one browser flow. The real Tauri ACL/dispatch engine uses MockRuntime and fixed fixture responses: local Manager succeeds, Workspace with either remote or local origin is denied, and remote origin in Manager is denied. Production Agent handlers/setup/plugins never run in this test. The second Rust case checks accepted origins and rejection of credentials, bootstrap/query/path and non-Web navigation. Initial fixture compilation exposed Tauri's macro namespace collision; a raw fixed-response handler removes that duplicate command macro. Only these affected Rust tests were rerun.

The Desktop build and browser case passed at 960×680 with synthetic scale 150%, then 640×480. It checks mode/selection/input preservation, explicit Workspace dispatch, rejected bootstrap fragment and connection failure. All IPC responses are browser doubles. No remote page or native command is opened by that browser test. Screenshots were inspected privately.

A separate **test-only native preview example** supplies fixed read-only Manager responses and rejects every management write. It has no production startup hook, Agent pipe, native transport, autostart or single-instance plugin, and receives a disposable WebView profile path. Its first OS launch failed with `0xC0000139`; binary/build output showed that tauri-build linked Common Controls resources to bins, excluding examples. The directly required example-resource link fixed it. The final native window was created in approximately **0.93 seconds** and closed normally. This measures window creation, not full authenticated Workspace rendering or human acceptance.

```powershell
npm run desktop:build
npm run desktop:stage
cargo check --locked --offline --manifest-path apps/desktop/src-tauri/Cargo.toml
cargo test --locked --offline --manifest-path apps/desktop/src-tauri/Cargo.toml ux05_workspace_
cargo build --locked --offline --manifest-path apps/desktop/src-tauri/Cargo.toml --example fpx-desktop-preview
```

The focused browser source is [fpx-desktop.test.ts](../../tests/fpx-desktop.test.ts). The H0 example is [fpx-desktop-preview.rs](../../apps/desktop/src-tauri/examples/fpx-desktop-preview.rs). Use a disposable profile argument when launching it; normal Desktop startup still follows its historical Agent lifecycle and was **not launched** in this zero-native run.

## Limits and next scope

The legacy local Hub's first-use bootstrap is a different auth contract: its URL fragment is deliberately rejected by this launcher. Fresh embedded local authentication is **BLOCKED_PENDING_AUTH_CONTRACT**, not silently bypassed using the control token or browser profile. A configured Gateway login, real external Workspace WebView session/control continuity, physical multi-DPI, original TUI behavior, NSIS/install/update/rollback and H0–H4 are **NOT_RUN**. The source increment does not certify them or admit deployment.

Independent exact-head source review is recorded in the PR/private receipt before development merge. UX06 may prepare the synthetic Web/native-Manager H0 pack with these explicit limits; no human PASS or Native route choice follows automatically.
