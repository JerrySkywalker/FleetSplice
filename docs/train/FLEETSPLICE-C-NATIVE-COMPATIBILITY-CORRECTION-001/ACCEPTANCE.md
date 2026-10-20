# Acceptance and regression cases — FS C 0.163-compatible native path

## Evidence grades
`SOURCE_ONLY` (code/source assertion), `TESTED_SYNTHETIC` (compiled FS product path with injected synthetic NativeRpc and SQLite), `REAL_NATIVE_READ_ONLY` (not requested and normally NOT_RUN), `LIVE_NATIVE_EFFECT` (forbidden; always 0). Build PASS + simulated turns do not prove real original-TUI control. All successful claims link to exact regression test command, fixture, source commit and output.

| ID | Existing failure | Required result |
| --- | --- | --- |
| C01 PID_LAYOUT | `CP04-C BLOCKED` due legacy-only `app-server.pid` | Accept supported old/new record selected by official native installation/status evidence; reject conflicting, stale and ambiguous layouts |
| C02 IDENTITY | `CP05-C source-only OS/peer/ACL` | Strong host-side validation preserved, PID FILETIME/hash/endpoint/incarnation mismatch fails; never claim synthetic ACL as measured Windows kernel evidence |
| C03 LOADED_ATTACH | `CP07-C BLOCKED`: already loaded attach calls resume | Exact pre-existing loaded thread/workspace is observed via supported read/list/subscription, `resumeCalls=0` / `threadStartCalls=0` in adopted path; other paths remain separately qualified |
| C04 NO_ECHO | `CP11-C BLOCKED`: absent caller ID → false external advance | Accepted native Turn ID + complete exact-turn evidence can attribute within valid fence; unknown/concurrent cases remain AMBIGUOUS; no ownership by text-only similarity |
| C05 DUP_EVENTS | `CP08-C BLOCKED` duplicate projections | With stable native ID, identical event observed twice yields one accepted projection; no source ID/gap produces honest unknown/resnapshot not arbitrary suppression |
| C06 UNKNOWN_DELIVERY | `CP15-C BLOCKED`: fresh bare adapter can redispatch | Test *integrated Hub* durable pre-dispatch admission across observer loss/new connection/restart and prevent second dispatch; cannot assert bare adapter independently safe without that boundary |
| C07 CONTROLLER_FENCE | existing behavior and `CP12/CP13/CP14` | Controller ownership/expiry/stale Turn validation and same-command duplicate vs changed-payload refusal remain unchanged |
| C08 NEGATIVE_PATHS | native endpoint unavailable, version unknown, wrong principal, missing thread | Distinct safe fail-closed statuses, no profile/global Daemon mutation/auto-start |
| C09 HISTORY | `CP17-C NOT_RUN` | G08 durable complete-history still NOT_IMPLEMENTED; do not treat recent execution-events cache/journal as a completed G08 |
| C10 NO_REAL_EFFECT | goal-specific boundary | `native_connections=0`, `real_native_turns=0`, `auth_or_writer_mutation=0`; only isolated synthetic NativeRpc used |

**Version/contract guard:** source/fixture versions should match public Codex 0.163.0 evidence used in PR #22; do not create a semver or binary SHA **allowlist** for future compatibility. Differences from newer native source must be logged and targeted with capability probing when safe. A transient live process does not prove the own-client PID field is natively exposed.

**Recovery rule:** persist attempt and authoritative status *before* transport dispatch at the existing integrated boundary; duplicate command + same semantic payload => existing outcome/unknown, not resend; conflicting payload => fail; unknown transport outcome remains `AMBIGUOUS_EFFECT` pending independent reconciliation, never inferred-success or replay. This is an at-most-one local dispatch admission rule, **not** a promise of native exactly-once effect across arbitrary failures.

**No inflated success:** 18 pilot assertion groups and 36 case records included expected failures. Do not convert a disabled control into full-control PASS, source-only kernel claim into measured OS PASS, or a facade over `thread/resume` into a no-resume read path. Fixes must be backed by negative/failure tests and visible rollback instructions.

## Preferred commands, not rote requirements

Use current repository script definitions and qualified Node/SQLite from `npm run development:doctor` (Node 24.20.0, SQLite 3.53.4 expected in previous host receipt, re-check actual). Favor `npm run check` and named `tests/native-adoption.test.ts`, `tests/reconnect-noreplay.test.ts` and `tests/hub-product-path.test.ts` or their compiled equivalents. Reuse `research/pilots/fleetsplice-b2-c-contract-parity-001` with `npm run reproduce` as a version-pinned external contract, ideally without rewriting its historical test data. After changes, run a proportional affected suite plus build and one independent review; no giant CI/soak/installer.

## Exit interpretation

`READY_FOR_OWNER_PRODUCT_REVIEW` requires C01/C03/C04/C06 failure cases now have **actual compiled implementation and synthetic test evidence**, C02/C05 truthful evidence grades, negative tests pass, and no new unsafe retry/resume path. If a required official native API behavior cannot be implemented soundly, record `PARTIAL_WITH_SPECIFIC_BLOCKERS` and do not greenwash. Actual mobile, multi-host, production Gate S, real native Writer/turn, G08 and G06–G10 remain unqualified.
