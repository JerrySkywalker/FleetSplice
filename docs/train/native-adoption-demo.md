# Run the local native adoption demo

Use the disposable project at
`V:\artifacts\FleetSplice\demo-native-adoption\workspace`.
The original demo fixture is a README about mint, basil and rosemary.

1. In an ordinary Windows Terminal, start the official daemon if needed:
   `codex app-server daemon start`.
2. Change to the disposable Workspace, then run literally `codex --yolo`.
   Complete a first turn asking Codex to read README.md and name the three plants.
   Leave that TUI open. `/status` shows its daemon endpoint and thread identity.
3. From FleetSplice's checkout run `npm run build`, then
   `.\fleetsplice.cmd native-demo`. Open the local bootstrap URL printed by it.
4. Select the already-running Codex card. Verify Workspace and native thread ID,
   click Attach, and read the existing conversation. The connection is cooperative:
   the local TUI remains able to send input.
5. Send a normal continuation in the browser. Check that its answer appears in
   the original TUI and that the thread ID remains unchanged.
6. Start a harmless long turn, for example asking Codex to run
   `Start-Sleep -Seconds 60; Write-Output NATIVE_D0_STEER_DONE`, then summarize.
   While that exact turn is active, type guidance in the browser and click Steer.
   If the TUI started it, first read and acknowledge the externally advanced state.
7. Start another bounded sleep, then click Interrupt turn. Observe the interrupted
   turn and the separate warning that a native command may still be finishing.
8. Return to the original native TUI, submit a final harmless normal input and
   verify the same thread remains functional. This visible return is required.
9. Type `stop` in the FleetSplice demo terminal to close FleetSplice only. The TUI
   and native daemon remain under native lifecycle control.

Do not operate the TUI and Web controls simultaneously. Stale input is rejected;
read the latest native state before explicitly continuing. If an effect is
unknown, use receipt lookup and preserve evidence. Never resend to work around it.
Additional Web clients are viewers until Fleet control is explicitly released.

Acceptance is pending until all visible steps and a separate read-only review
pass. No P3, G06, phone UI, remote deployment or merge is included.

Regression tests retain the older managed-driver qualification. If the installed
CLI has moved on, set `FLEETSPLICE_MANAGED_TEST_CODEX` to a preserved official
managed qualification artifact and run `npm run check`, `npm run build`, `npm test`.
That fixture selection changes test input only and does not change native adoption
compatibility or the Owner's normal Codex installation.
