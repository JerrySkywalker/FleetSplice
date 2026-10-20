# Human Experience milestones H0–H4

Human gates are **explicit evidence-producing Owner actions**. The autonomous Agent may prepare data, UI builds, fixtures and an instruction card; it may not simulate Owner presence, approve a native model effect, assert a phone test was performed, or invent a Gate. At a human gate, record `OWNER_ACTION_REQUIRED` and continue other independent local source goals when possible.

| Gate | Precondition | Owner's real task | Required evidence | Time budget (Owner) |
| --- | --- | --- | --- | --- |
| **H0 UI first-use** | UX01–UX03 have a usable, **synthetic or local no-effect** cockpit build; no production needed | Open a real Web/Tauri build; browse Host→Session, change theme, use Composer (mock), inspect tool/approval/attention, judge density/responsive appearance | selected design, written feedback, screenshots per viewport, approve/revise/hold | ~15–20 min |
| **H1 original TUI control** | PR #23 Native C product paths correction + qualified read-only local check; exact effect separately admitted | Start ordinary `codex --yolo` in existing Windows Terminal, observe/approve *one explicitly scoped test turn if separately authorized*, return to **same** PID and Native Thread | OS/native identity + event/effect receipt, Owner visual return, no replay | ~20–30 min |
| **H2 remote phone first-use** | local Native qualified; UI smoke; full **Gate S infra and Owner deployment admission**; G06 code ready | phone over real cellular network → authorized Hub → outbound Edge on ZenBook14; view, control/approval/reconnect | exact remote auth/network/receipt, Owner feedback; no fixture substitution | ~20–30 min |
| **H3 two-host first-use** | accepted G06/H2; second Host independently enrolled and qualified; G07 ready | switch Host/Workspace, observe viewer/controller/takeover, stale generation and revocation | two different real Host identities, consent, receipt/fence, Owner result | ~15–20 min |
| **H4 long-session/release first-use** | G07 accepted, G08/G09/G10 code and release gates ready | old-history exact tool output retrieval, restart/restore, desktop installer/update/rollback, regular desktop/phone dogfood | complete history/cursor/Blob proof, backup/security/release receipts, Owner result | ~30–45 min plus longer G10 soak elsewhere |

## Authoritative gate result fields

Each Gate receipt records `GATE_ID, PREPARED_AT, OWNER_EXECUTED, OWNER_APPROVED, SOURCE_SHA, ARTIFACTS, REAL_EFFECTS, SCOPE, DISPOSITION, NEXT`. Acceptable statuses: `NOT_READY, READY_FOR_OWNER, PASS_OWNER_OBSERVED, FAIL, OWNER_ACTION_REQUIRED, BLOCKED_EXTERNAL`.

- H0 can be performed before G06 and without Native effects. If feedback requests layout revisions, fix only the affected UI, then repeat H0 once.
- H1 verifies **FS's corrected product path**; the historical PR #20 qualifies upstream native availability, not this new product candidate. Its one-effect permission is exhausted.
- H2 requires deployment-specific Gate S, real phone and external network; no source-only Goal may mark it PASS.
- H3 must show 2 real independently identified Hosts; no copied credentials or second browser tab pretending to be a Host.
- H4 waits for accepted G08 history and G09, and real package qualification; the early mock stage does not certify a release.

## Non-blocking independent work

If an Owner Gate is unavailable, the agent should still complete only independent eligible UI tests, documentation, mock performance fixtures or release *preparation*. It **must not** continue dependent real native/G06 deployment/G07/G08/G09/G10 admission out of order. It must produce one consolidated gate checklist for the Owner instead of many interruptive messages.

Gate S and Gate H are independent: H0 alone cannot enable a remote deployment, and passing source tests cannot enable H1/H2.
