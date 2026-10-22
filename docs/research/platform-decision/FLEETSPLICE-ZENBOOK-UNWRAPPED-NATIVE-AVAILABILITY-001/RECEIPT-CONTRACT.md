# Acceptance, evidence and final receipt contract

## Claim levels

| Level | Claim | Required source of proof |
| --- | --- | --- |
| `SOURCE_ONLY` | Official Codex documentation/source supports a feature under some conditions | Exact official native source SHA, contract and applicability |
| `OBSERVED_INVOCATION` | Ordinary PowerShell `codex --yolo` actually invokes a specified binary/mode on this ZenBook | `Get-Command` resolution, version/hash, current normal principal, relevant sanitized argument/runtime evidence |
| `ORIGINAL_TUI_ALIVE` | A fresh original TUI exists throughout the experiment | Process PID + creation time **before and after** + independent UI observation |
| `SHARED_ENDPOINT_QUALIFIED` | Same-user official native server is reachable and bound to the tested native thread | Endpoint origin, PID + creation time, identity/ACL, official initialize and exact Native Thread membership |
| `SECOND_CLIENT_READ` | Independent, nonowning second connection observes the same native thread | Native exact identity and matched read events/turn IDs, no second Writer, no original-TUI shutdown |
| `SAME_TUI_REMOTE_EFFECT` | A separately approved safe remote turn/response affects the original native thread, original TUI remains alive | Explicit Owner authorization, native request/effect/turn receipt, original TUI visual return and unchanged PID/thread |
| `PHONE_HANDOFF` | Real phone connects and returns to original TUI | **OUT OF SCOPE**, do not claim |

Observation-only does not prove the final effect layer. An appended test marker in a text file, new native client using `resume`, or ownership of a different app-server is not a same-thread shared-live PASS.

## Required files committed to study branch after R00–R05

- `01-PREFLIGHT-AND-RUNTIME-IDENTITY.md`
- `02-UNWRAPPED-TUI-OBSERVATION.md`
- `03-SHARED-ENDPOINT-AND-WRITER.md`
- `04-SECOND-CLIENT-AND-RETURN-TO-TUI.md`
- `05-QUALIFICATION-AND-ROUTE-IMPLICATION.md`
- `06-OWNER-DECISION-PACK.md`

If an execution phase is blocked, the corresponding document should clearly say `NOT_RUN`, `BLOCKED` or `OWNER_ACTION_REQUIRED` rather than inventing observations.

## Final local artifact receipt

Location: `C:\Dev\artifacts\fleetsplice\FLEETSPLICE-ZENBOOK-UNWRAPPED-NATIVE-AVAILABILITY-001\FINAL-RECEIPT.json`.

Required machine-readable keys:

`GOAL_ID`, `DISPOSITION`, `NATIVE_RESULT`, `EVIDENCE_CONFIDENCE`, `HOST`, `SHELL_RESOLUTION`, `CODEX_VERSION`, `P0_EXACT_INVOCATION`, `P0_ORIGINAL_TUI_PID_PROVEN`, `P0_ORIGINAL_TUI_RETURN_PROVEN`, `SHARED_ENDPOINT_PROVEN`, `NATIVE_THREAD_ID_PROVEN`, `SECOND_CLIENT_OBSERVATION`, `ONE_EFFECT_RESULT`, `PHYSICAL_TEST_EXECUTED`, `AUTHENTICATED_NATIVE_EFFECT_EXECUTED`, `MOBILE_TEST_EXECUTED`, `RAW_ARTIFACT_DIR`, `DRAFT_PR_URL`, `PR_HEAD_SHA`, `PRODUCT_CODE_MODIFIED`, `MAIN_MERGED`, `GATE_S_ADMITTED`.

- `DISPOSITION=STOP_FOR_OWNER_NATIVE_AVAILABILITY_REVIEW` regardless of success or block.
- `NATIVE_RESULT` is exactly one of:
`SHARED_NATIVE_AVAILABLE`, `READ_ONLY_PROOF_ONLY`, `NO_REACHABLE_SHARED_ENDPOINT`, `UNWRAPPED_LAUNCH_IS_EMBEDDED`, `NATIVE_WRITER_BLOCKED`, `OWNER_ACTION_REQUIRED`, `AMBIGUOUS_STOP`.
- `P0_EXACT_INVOCATION` records an **observed Boolean**: true means the Owner typed ordinary unwrapped `codex --yolo`, while any underlying shell alias/function is documented separately; do not record assumed false/true as a test.
- `P0_ORIGINAL_TUI_PID_PROVEN`/`RETURN_PROVEN`/`SHARED_ENDPOINT_PROVEN`/`NATIVE_THREAD_ID_PROVEN` must be true/false/unknown explicitly; do not use one field to infer another.
- `AUTHENTICATED_NATIVE_EFFECT_EXECUTED` ∈ `{0,1}`; no retry. `MOBILE_TEST_EXECUTED=false`.
- `EVIDENCE_CONFIDENCE=MEASURED_LOCAL|SOURCE_ONLY|OWNER_REPORTED|UNKNOWN`, with exact scope and redacted references.
- `PRODUCT_CODE_MODIFIED=false`, `MAIN_MERGED=false`, `GATE_S_ADMITTED=false`.
- Missing physical evidence is `OWNER_ACTION_REQUIRED` not falsely `NATIVE_WRITER_BLOCKED` or `NO_REACHABLE_SHARED_ENDPOINT`.

## Owner decision after the result

If `SHARED_NATIVE_AVAILABLE`, fund **one small comparison** of Paseo B2 external-native provider vs existing FS Native Adoption on this qualified endpoint. The recommendation must not automatically continue G08. If `READ_ONLY_PROOF_ONLY`, first determine whether native Writer cooperation is possible. If there is no endpoint / embedded launch, propose an upstream Codex behavior/Windows Job research question or an explicit Owner-approved startup change; an independent FS frontend does not conjure the missing native endpoint.

No merge or product authorization follows from the receipt.
