# 05 — Full Core, UI, mobile and release checklist

All boxes are **planning placeholders**, not claimed implementation status. Existing partial G05C surfaces may be reused and checked via actual new acceptance receipts.

## Native/Hub correctness
- [ ] PR #23: daemon.pid vs app-server.pid, source identity/owner PID+creation and stale refusal.
- [ ] Already loaded exact native thread attached without resume/new server; same TUI remains.
- [ ] Native Turn ID attribution with missing clientId, no text-matched false ownership.
- [ ] Integrated journal write-before-dispatch, duplicate conflict, unknown-effect no replay across restart.
- [ ] Native event dedupe when stable ID present, bounded resnapshot and honest gaps.
- [ ] Correct role/controller/fence across Web/Hub/Edge; exact approvals/interrupt/steer.
- [ ] H1 corrected *FS product* local native first-use separately authorized.

## Web UX / React
- [ ] Fleet Overview and Host/Workspace/Session selection, quick switch and recent.
- [ ] Stable Session timeline, Markdown/GFM/code, Tool Cards, message identity, copy and render pacing.
- [ ] Composer drafts, actual capability-driven model/reasoning/access; Viewer denies writes.
- [ ] One authoritative attention/review/approval action; unknown result not reissued.
- [ ] Panels/sheets, resizable desktop/compact, themes/tokens/i18n/a11y.
- [ ] Browser screenshot/interaction baseline 1440×900, 390×844, 412×915, 768×1024, 1024×768 and foldable width.
- [ ] H0 human usability feedback; one focused correction round.

## Mobile / Desktop
- [ ] Mobile keyboard/safe area/landscape/foldable and local code/tool scrolling without full-page overflow.
- [ ] PWA manifest/offline truth, no authenticated content cached unprotected.
- [ ] Tauri Workspace Mode + Agent Manager Mode, least privileged IPC.
- [ ] Windows desktop install/update/uninstall smoke at milestone, not every code PR.
- [ ] H2 real cellular phone and H3 real second Host, after actual Gate.

## G06–G10
- [ ] Production Gate S real values, external readiness, auth/TLS/Tencent/Edge enrollment before G06 live.
- [ ] G06 Native mobile command/approval/reconnect, H2.
- [ ] G07 second Host identity, control CAS/fence/takeover/revocation, H3.
- [ ] G08 indexed complete old history, stable cursors, full tool Blob, bounded hot state and restart no replay.
- [ ] G09 explicit qualified migration or true NO_QUALIFIED_TARGET.
- [ ] G10 one full release/security/backup/reinstall/rollback qualification, H4 owner long history/mobile/Desktop.
- [ ] No automatic release/production tag before H4 and exact-head review.

## Optional—not v0.1 blockers
- [ ] UX07 read-only Changes/Diff/PR only after H2 decision.
- [ ] G11–G16 ACP, WSL/Admin, TUI, canary self-hosting separately admitted later.
- [ ] AI4S inference/tool/fleet placement and CSIS visual research not FS v0.1 release prerequisites.

## Fast development enforcement
- [ ] No speculative wrapper/state machine, avoid huge generic refactor.
- [ ] Per changed surface one named test + one reasoned rerun; milestone only full suites.
- [ ] Human screenshot/gate evidence remains distinct from synthetic PASS.
- [ ] Each PR records exact source SHA/tests/changed paths and next dependency.
