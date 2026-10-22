# Same-contract execution and gaps

**18 focused test groups / 36 route-case records** exercise one original synthetic
contract. Final assertions pass; those assertions include expected incompatibilities.
They do **not** mean 36 feature passes. B2 has **11 pass / 6 blocked / 1 not_run**;
C has **9 pass / 7 blocked / 2 not_run**, including SDK not-applicable. Source-only
and security ceilings are explicit. Neither route satisfies complete P0 here.

The [sanitized case receipts](parity-results.json) include source/package pins,
command, scope, result, hard gap, evidence grade and private artifact reference.
Assertions and fixtures are committed in the [pilot](../../../../research/pilots/fleetsplice-b2-c-contract-parity-001/README.md).
**Native connections=0; native effects=0; LIVE_NATIVE=NOT_RUN.**

## Method and evidence separation

B2 imports real SDK schemas and compiles original provider code. Actual official
loader lifecycle is a separate measured test; the full matched matrix invokes the
same provider directly for deterministic injection. Do not label all injections
as official-loader lifecycle tests. The loader's app-session host is synthetic.

C imports the unchanged compiled NativeAdoptionAdapter, NativeActivityJournal,
Journal and NativeRpcError. SQLite is an in-memory test DB. Identity callbacks
return fixture metadata. `OfficialNativeRpc` is never instantiated. Capability
probes address nonexistent fixture thread IDs only. No native Writer is launched.
The same MockNative and payload variants drive both routes; the C shim only
constructs existing classes and grants, and does not fix product behavior.

Unmodified compiled discovery runs in a VM with synthetic fs/process/PowerShell
results. The VM cannot call the real OS or home directory. PowerShell source is
not executed: owner/ACL/kernel peer and actual TUI/PID binding are
**SOURCE_ONLY / NOT_MEASURED**. This deliberately refuses a real security PASS.
The observed modern-layout failure is not patched through a compatibility shim.

## Matched results

`M` = pass in the stated mock/source scope; `B` = contract blocked;
`N` = not run/deferred or not applicable. A disabled unsafe action can pass its
refusal assertion while the missing feature remains a hard gap.

| Case | B2 | C | Observation and limit |
| --- | --- | --- | --- |
| CP01 actual SDK | M | N | Published SDK types/imports compile; C is not a plugin |
| CP02 registration | M | M | Official B2 loader and protocol 1; C fixture qualifies ADOPT_FULL |
| CP03 original TUI/Writer | B | B | Fixture creates no process/thread, Writer count stays 1; real custody unmeasured |
| CP04 layout | B | B | B2 discovery absent; actual C legacy read succeeds, daemon.pid layout fails |
| CP05 OS/security proof | B | B | Metadata injection cannot prove actual ACL, kernel peer, principal or TUI binding |
| CP06 stale identities | M | M | PID/birth/workspace changes rejected before mocked dispatch; ACL is not measured |
| CP07 loaded exact thread | M | B | B2 uses read only; C attach calls resume on loaded thread |
| CP08 events/order | B | B | Same duplicate delta maps once in B2 with fixture event ID, twice in C; no native replay cursor |
| CP09 config injection | M | M | Adopted env/MCP/model/permission injection refused |
| CP10 mock idle submit | M | M | Echoed-ID baseline: one dispatch, exact native Turn ID completed |
| CP11 no caller ID echo | M | B | B2 uses response Turn ID/exact-turn items; C reports AMBIGUOUS_EFFECT |
| CP12 duplicate/unknown | M | M | Exact duplicate cached; changed payload refused; lost reply blocks new ID in same runtime |
| CP13 stale steer | M | M | B2 disables capability; C rejects stale native Turn before dispatch |
| CP14 generic controls | M | M | Untargeted interrupt/approval refused; B2 lacks full exact-target UX |
| CP15 close/recovery | B | B | Observer close preserves fixture; fresh connection/adapter forgets uncertain delivery |
| CP16 absent/unsupported | M | M | No managed-launch fallback; missing turn/start cannot produce an effect |
| CP17 G08 history | N | N | NOT_IMPLEMENTED / DEFERRED; no history or performance qualification |
| CP18 API boundary | B | M | B2 schema rejects added expectedTurnId; C already carries exact target/fence |

## Decisive counterexamples

**C installation and loaded adoption:** 0.163 source distinguishes legacy
`app-server.pid` from daemon-owned `daemon.pid`. C's discovery reads the former
unconditionally. Its loaded-thread attach calls `thread/resume` once; missing
loaded membership is rejected, and no `thread/start` is sent. That does not prove
a new Writer is created, but fails this Goal's stricter no-resume oracle. No live
Writer claim is inferred from fixture writerCount.

**C no-echo correlation:** with an accepted/completed native turn and a user item
whose native ID differs from the command ID, C looks up `message.clientId ??
message.id`. With no caller echo it classifies its own user item as external,
returns AMBIGUOUS_EFFECT and closes control. The echoed-ID baseline succeeds.
B2 associates the local command with the accepted native Turn ID and exact-turn
items; that association is not native idempotency or proof under concurrent writers.

**Recovery:** both routes hold ambiguity within one connection/runtime. A matched
counterexample accepts a mock turn, loses its response, closes the observer, lets
the mock complete while disconnected, then retries the same logical command in a
fresh connection/adapter. Both dispatch a second time. B2 reports that second
result; C detects the repeated caller-ID correlation conflict only **after** the
second dispatch and returns ambiguity. The adapter's SQLite activity journal is
not a durable dispatch ledger. FS outer Hub admission/recovery is outside this
bare-adapter test: this is not a claim that every integrated Hub path replays.
Cross-client races and process-crash recovery remain unqualified.

**B2 control boundary:** actual public `ProviderPrompt` contains local
clientMessageId and delivery, but no expected native Turn ID. Adding that field
fails the actual strict schema. Generic session.interrupt is also targetless.
The pilot safely disables steer, permission and config changes and rejects generic
interrupt. A provider cannot retrofit an unmodified core caller's authority
snapshot by comparing the result after sending. Custom plugin RPC plus a dedicated
client control surface, or an upstream core contract change, is a separate route.

## Builds, failures and bounded reruns

Provider compilation, FS TypeScript build, published official loader preparation
and lifecycle all pass. Final clean `npm run reproduce` restores the committed
closure and executes the small runner. No full FS/Paseo CI, Web build, native test,
phone, G08, soak or performance benchmark was run.

All failures remain private: initial SDK session-summary type error; loader
requirements/default-export/input-shape errors; the first matrix's incorrect
expectation that unknown SDK fields are stripped (they are rejected); and the
new reconnect counterexample's initial assumption that C reports success (it
dispatches twice, then reports ambiguity). Corrections changed the assertions
to the measured stricter outcome, not to a feature PASS. Focused post-fix checks
and final dependency-range alignment are recorded with commands and exits.

Full P0 same-TUI visible return, independent Windows identity/Writer proof,
canonical durable history, phone topology and cost/performance remain open.
