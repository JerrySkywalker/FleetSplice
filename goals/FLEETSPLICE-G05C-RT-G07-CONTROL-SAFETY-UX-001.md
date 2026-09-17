# G07 — Fleet Control/Safety UX and product information architecture

Parent train: `FLEETSPLICE-G05C-POST-DOGFOOD-REALTIME-UX-TRAIN-001`.
Dependency: `PASS_G05C_RT_G06_REALTIME_TIMELINE`.

> This is train child G07 only. Product roadmap G07 remains untouched and unstarted.

## Objective

Present Fleet Control & Safety Stream events as understandable product state instead of exposing internal machine codes as the default UI.

## Required work

- Introduce a clear presentation severity model: informational cooperative events, attention/warning states, and danger/recovery states.
- Keep `NATIVE_STATE_ADVANCED_EXTERNALLY` safety semantics and explicit review-state gate, but present ordinary TUI advancement as neutral cooperative-control information rather than a fault-colored banner.
- Display actual new Agent Execution events immediately while Web control remains gated until explicit review.
- Make controls context-sensitive: idle => Send; active => Steer/Interrupt when supported; external state unreviewed => Review/continue; outcome unknown => receipt lookup.
- Make approval UI capability-aware. `approval=never` / YOLO should read as a normal permission state, not `APPROVAL_UNAVAILABLE` error text.
- Remove stale hard-coded read-only Codex launch guidance from the normal product path.
- Compress duplicated state. Default top-level status should show only useful session/model/permission/connectivity summaries; daemon PID, fence, runtime/incarnation IDs, raw capability evidence, receipts and machine codes belong in an Inspector/Developer Details surface.
- Keep composer reachable/sticky where practical, add restrained message/status transitions and `prefers-reduced-motion`, and implement sensible follow-tail/new-message scrolling behavior.
- Preserve accessibility, localization and existing theme support.

## Safety

Presentation changes may never auto-acknowledge review-state, approval, residual effects, ambiguous outcomes or controller transitions.

## Pass token

`PASS_G05C_RT_G07_CONTROL_SAFETY_UX`
