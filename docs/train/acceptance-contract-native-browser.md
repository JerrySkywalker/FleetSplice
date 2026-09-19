# Acceptance contract (G05C-RT R2-R1)

```text
npm test
  deterministic unit/integration regression

npm run accept:native-browser
  real Hub + real Web + SSE + Playwright + deterministic native fixture
  fully automated and required for Native realtime/control changes

npm run accept:native-live
  product-equivalent discoverDaemon() preflight for local real Codex daemon
  may DEFER with REAL_DAEMON_PRECHECK=<exact discovery error>
  or REAL_DAEMON_PRECHECK=PASS and REAL_DAEMON_HARNESS=DEFERRED_WITH_REASON=...

Owner UX smoke
  subjective feel + ordinary Windows Terminal / codex --yolo return-to-TUI
  milestone-level only, not every correction
```

`accept:live` semantics are unchanged (managed live single-host acceptance).
