# G05A Owner UX foundation

[G05A](../../goals/FLEETSPLICE-V0_1-M0_1-OWNER-UX-FOUNDATION-005A.md) adds
presentation preferences to the accepted [local G05 product](g05-local.md).
The existing qualified Node 24.20.0 / SQLite 3.53.4 and pinned native
codex-cli 0.153.4 requirements remain unchanged. G06 is unstarted.

Open **Preferences / 偏好设置** in the header. Choose **简体中文** or
**English**, then **System / 跟随系统**, **Light / 浅色**, **Dark / 深色**,
or **OLED Black / OLED 黑**. Changes apply immediately without reconnecting
the client, changing control, discarding drafts or creating a native thread.
The modal supports Tab, Shift+Tab and Escape and returns focus to its trigger.

Browser-local explicit preferences take precedence. With no saved locale,
the primary browser language in the `zh` family selects zh-CN; other languages
fall back to en-US. Appearance defaults to System and follows dynamic
`prefers-color-scheme` changes. Saved preferences use only `fleetsplice.locale`
and `fleetsplice.appearance` in localStorage. If storage is unavailable, the
choice still applies to the page and the UI reports that it was not saved.

A blocking same-origin script on the existing `/assets` route applies saved
presentation before the app starts. No Hub route or CSP change is required.
Its small resolver is parity-tested against the typed TypeScript preferences.
Normal labels and statuses use compatible typed catalogs; machine codes,
raw receipts, identities, session titles and user/model text remain literal.
Only known Fleet-owned system messages such as turn completion are localized.

The Owner reported that Acquire Control -> Continue Session is unnecessarily
explicit for the common single-owner path. G05A retains those independent
buttons and their existing handlers. Chaining the current one-command handler
would require additional receipt-driven orchestration; this secondary feature
is deliberately not introduced here. Instead, the UI gives a concise next-step
hint and focuses Continue Session after successful acquire and observed control.
Focus never invokes the command. Failure, uncertain response and receipt lookup
retain the accepted G05 behavior. Controls also remain reachable at narrow widths.

## Validation

Run the existing check/build/test commands. Tests cover both complete catalogs,
key/placeholder parity, fallback, preference persistence, four appearances,
dynamic System behavior, prepaint resolution, keyboard focus, narrow layouts,
and zero command/client emissions or product-state changes on preference switches.
The lost-response test also switches presentation with a pending command and
proves the exact pending intent remains unchanged without retry.

Measured foreground/background pairs on major UI surfaces use at least 4.5:1,
following [W3C's normal-text contrast criterion](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html).
This bounded check does not claim complete WCAG certification or G06 mobile
acceptance. Disabled controls remain visibly disabled.

After committing the clean candidate, use the existing native acceptance path:

```powershell
npm run accept:live -- --owner-ux --workspace 'V:\src\FleetSplice' --codex '<absolute qualified codex.exe path>' --evidence '<new Owner-local evidence directory>'
```

The harness uses the real built Hub/Edge/WebUI and native Codex. It captures
zh-CN/OLED Black and en-US/Light, checks unchanged native thread/control/receipts
and zero mutations across switches, completes two real turns, checks native
receipts and browser streaming, and observes clean shutdown. Screenshot and
sanitized proof files remain outside Git. Synthetic tests are separate evidence.
The candidate then requires a fresh separate read-only independent review of
its literal pushed SHA/tree. External acceptance retains that reviewed object.
