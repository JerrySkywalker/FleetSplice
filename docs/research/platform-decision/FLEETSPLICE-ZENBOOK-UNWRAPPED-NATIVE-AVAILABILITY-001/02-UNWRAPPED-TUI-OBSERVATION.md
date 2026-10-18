# R01 — Original unwrapped TUI observation

Audit run: `20261018-desktop-local`
Execution: **NOT_RUN — OWNER_ACTION_REQUIRED**.

At this audit cut, the Owner has not reported the requested fresh physical
Console B launch. The request is in the [R00 instruction card](01-PREFLIGHT-AND-RUNTIME-IDENTITY.md).
The research driver launched only version/help and a source-verified passive
daemon version probe; it did not start an interactive surrogate.

| Required proof | Current run |
| --- | --- |
| Owner typed exact `codex --yolo` in Windows Terminal | NOT_OBSERVED |
| Console B command provenance / normal principal | UNKNOWN |
| Original native TUI PID + immutable creation time | UNKNOWN |
| Actual test executable + flags | UNKNOWN |
| Native Thread ID | UNKNOWN |
| Initial and later visible TUI interactivity | NOT_OBSERVED |
| Owner marker / native effect | NOT_RUN |

Desktop's processes, server and thread are excluded. October 15 PID/thread/marker
records are historical and are not reuse candidates. No existing private session,
state database or transcript was inspected in this audit.

`PHYSICAL_TEST_EXECUTED=false`;
`AUTHENTICATED_NATIVE_EFFECT_EXECUTED=0`.
Exact invocation is unobserved, not a measured false Boolean.
The eventual receipt uses null plus NOT_OBSERVED to avoid inventing an invocation.
