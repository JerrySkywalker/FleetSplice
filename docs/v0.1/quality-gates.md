# v0.1 Quality Gates and Evidence Plan

## Status and authoritative inputs

| Field | Value |
| --- | --- |
| Planning Goal | FLEETSPLICE-V0_1-IMPLEMENTATION-CONTRACT-004 (G04) |
| Accepted promotion head | 96cb7a4965a651b8582a3ee35049d52204c3fc73 |
| Accepted promotion tree | b554b8568b633397681307d73c7d7fec105963bd |
| Accepted baseline | docs/architecture/baseline-0.1.md |
| Recording receipt path | docs/train/receipts/G03.md |
| Recording receipt commit | ca671e66cf1980a88f0c197016f2d2556390b7be |

~~~text
ARCHITECTURE_0_1_READY=true
IMPLEMENTATION_AUTHORIZED=false
PRODUCT_IMPLEMENTATION_AUTHORIZED=false
G04_CONTRACT_STATUS=DRAFT_PENDING_OWNER_DECISIONS_AND_EXACT_HEAD_REVIEW
G04_PASS=false
~~~

This is a future evidence plan. It does not claim that an implementation,
fixture, browser, Host, provider, credential, or service exists. G04’s only
executable evidence is static documentation validation on its eventual exact
head; every later product gate is NOT_RUN until its named Goal performs it.

## Evidence-class vocabulary

| Class | What it can establish | What it cannot establish |
| --- | --- | --- |
| STATIC | Schema shape, link resolution, source policy, declared scope, formatting, and static provenance facts. | A live transport, native Agent, Host, database, or browser behavior. |
| UNIT | Isolated deterministic behavior of a bounded implementation unit. | Cross-process ordering, transport recovery, or real Codex behavior. |
| DISPOSABLE_INTEGRATION | Disposable, isolated process/store interaction with no valuable Host state. | Owner environment, real credentials, or two-host acceptance. |
| SYNTHETIC_BROWSER | Controlled browser rendering, event, auth, and hostile-output behavior. | A real remote owner session or native side effect. |
| LIVE_SINGLE_HOST | Real owner-approved behavior on one named Host and Environment. | Two-host control or a remote-browser security claim. |
| LIVE_TWO_HOST | Real selected behavior across SKYFORGE-01 and ZenBookDuo. | Universal Host/provider compatibility or unattended security ceremonies. |
| OWNER_ATTENDED_LIVE | A necessary interactive security, credential, lifecycle, or elevation ceremony performed by the Owner. | An unattended substitute or a blanket authorization. |
| FAULT_INJECTION | Defined crash, loss, replay, race, rollback, or recovery failure path. | A claim that an untested real platform cannot fail differently. |
| HOSTED_CI | Reproducible hosted source/package checks on the exact SHA. | Local two-host dogfood or Owner-attended proof. |
| INDEPENDENT_EXACT_HEAD_REVIEW | A read-only review bound to one literal SHA/tree and its evidence. | Acceptance of a later changed commit or self-approval by the writer. |

No class upgrades another by implication. In particular, source inspection,
fixtures, or a safe disposable test never substitute for LIVE_SINGLE_HOST,
LIVE_TWO_HOST, OWNER_ATTENDED_LIVE, or independent acceptance.

## Cross-cutting future gates

| Gate family | Required future challenge | Required evidence classes |
| --- | --- | --- |
| Canonical contracts | Closed JSON Schema 2020-12 unions; UUID/revision validation; RFC 8785/domain-separated digest vectors; invalid UTF-8, surrogate, duplicate-key, and lossy-conversion rejection; no native-any. | STATIC, UNIT, DISPOSABLE_INTEGRATION |
| HCP and reconnect | Strict TLS, Edge-initiated HCP, bounded framing/backpressure, authenticated challenge binding, cursor/watermark resync, gap handling, and stale-generation rejection. | UNIT, DISPOSABLE_INTEGRATION, FAULT_INJECTION, LIVE_TWO_HOST |
| AuthorityAnchor | Append before/after crash, acknowledgement loss/exact-ID lookup, changed-tuple rejection, competing predecessor CAS, scoped writer, participant pins, fork/rollback/clone/loss, closed rollover, and fresh-namespace catastrophic reset. | UNIT, DISPOSABLE_INTEGRATION, FAULT_INJECTION, OWNER_ATTENDED_LIVE where O1 requires it, INDEPENDENT_EXACT_HEAD_REVIEW |
| Permit and recovery | Permit/activation participant intersection, finite horizon, renewal A/R/B/X sequence, restore/recovery generations, transitive predecessor barrier, exact disjointness, and quarantine. | UNIT, DISPOSABLE_INTEGRATION, FAULT_INJECTION, LIVE_SINGLE_HOST, LIVE_TWO_HOST |
| SafetyControl | Exact target, local STOP_PENDING non-barging, at-most-one already-linearized conflict, complete latch/cut/consistency map, and separate productive versus delivery uncertainty. | UNIT, DISPOSABLE_INTEGRATION, FAULT_INJECTION, INDEPENDENT_EXACT_HEAD_REVIEW |
| Safety D/O/R | Finite precommitted D/O/R manifests; one atomic D classification cut; exactly one emission owner; terminal tombstones; marker-versus-fence ordering; later terminal cut; immutable ambiguity and quarantine; no fallback or re-emission. | UNIT, DISPOSABLE_INTEGRATION, FAULT_INJECTION, INDEPENDENT_EXACT_HEAD_REVIEW |
| Lane and browser control | Viewer/controller distinction, epoch and mutation-revision fencing, takeover, reconnect grace, exact approval target/action/revision, and no browser privilege escalation. | UNIT, SYNTHETIC_BROWSER, FAULT_INJECTION, LIVE_TWO_HOST, OWNER_ATTENDED_LIVE as selected by O3/O4 |
| Durable storage | Hub/Edge one-writer SQLite WAL behavior, migrations/rollback, crash/reopen, recovery barriers, blob publication/GC fencing, database-plus-blob backup/restore, and integrity. | UNIT, DISPOSABLE_INTEGRATION, FAULT_INJECTION, LIVE_SINGLE_HOST, OWNER_ATTENDED_LIVE where data policy requires it |
| Driver/provider | Real Codex app-server lifecycle, response-loss ambiguity, approval/interrupt behavior, exact Driver fingerprint, provider probe, binding pinning, and no credential copying. | DISPOSABLE_INTEGRATION, LIVE_SINGLE_HOST, LIVE_TWO_HOST, INDEPENDENT_EXACT_HEAD_REVIEW |
| UI, security, provenance | Canonical IDs/history over renderer cache; 10k-history virtualization, prepend/anchor, blob auth, hostile output, authorization, CSRF/Origin, redaction, dependency license/NOTICE/provenance, and update boundaries. | STATIC, SYNTHETIC_BROWSER, FAULT_INJECTION, HOSTED_CI, LIVE_TWO_HOST, INDEPENDENT_EXACT_HEAD_REVIEW |

The detailed semantic obligations remain linked rather than simplified:
[required adversarial cases](../architecture/baseline-0.1.md#required-adversarial-qualification-cases),
[retained capability gates](../architecture/baseline-0.1.md#required-capability-and-owner-gates-retained),
and the accepted [ADR set](../adr/README.md).

## Milestone gate map

| Goal | Future tests that are required before its token | Explicitly insufficient substitute |
| --- | --- | --- |
| G05 | Contract/static checks, focused units, disposable Hub/Edge/native integration, and real SKYFORGE-01 browser-to-Codex turn. | A mocked driver, a screenshot, or a source-only app-server observation. |
| G06 | HCP/reconnect/generation faults plus real two-host selection, turn, stream, and identity proof. | A second hostname in a fixture or an offline projection. |
| G07 | Browser controller/viewer, takeover, approval, interrupt, reconnect, Origin/CSRF/session, and duplicate-effect faults. | A UI that hides control state or a transport acknowledgement treated as terminality. |
| G08 | Hub/Edge/browser/native disruption, response loss, idempotency, cursor/history/blob, WAL/concurrency, recovery, and ambiguity reconciliation. | Restarting a process without checking the exact predecessor barrier and outcomes. |
| G09 | Exact target capability/security/context probes, visible proposal and confirmation, source fence/continuity, then real migration or visible no-qualified-target path. | Endpoint compatibility shape, model name, or automatic fallback. |
| G10 | Full regression: two-host dogfood, fault/recovery, storage/restore, upgrade/rollback, long history, security/provenance, installation/update/uninstall, and independent exact-head review. | Green prior slices, absent CI, or a reviewer summary without logs and literal identity. |

Admin-only live capability tests stay assigned to G12. The baseline’s
Edge-plus-elevated-companion rules remain normative, but G05-G10 neither enable
an admin capability nor count skipped admin qualification as a v0.1 pass.
Likewise, W6 and TUI tests remain G13/G14 work.

## Required fault matrices

### Authority, effect, and safety

- Anchor append, lookup after lost response, competing CAS, writer-scope denial,
  pin restart, stale/parallel lineage, rollback, read-only copy, promoted clone,
  outage, loss, rollover closure, and fresh-namespace reset.
- Grant, permit, renewal, revocation, Hub/Edge restore, runtime replacement,
  transitive predecessor, barrier Path 1/Path 2 eligibility, horizon expiry,
  timer discontinuity, and reconnect/re-entry.
- Safety interrupt/cancel with an exact target; r1/r2/fence non-barging; local
  latch before cross-participant wait; companion cut/Edge map where applicable;
  crash/replay and no ability to reopen a latch.
- D/O/R rows across terminal/nonterminal, withdrawn/live, supported/unsupported,
  current/noncurrent, and READY/non-READY inputs. Zero/multiple/out-of-domain
  classification must seal rejected without D receipt or emission. Marker-first
  and fence-first races must preserve the accepted effect/no-effect rules.

### State, history, and product behavior

- Node SQLite WAL writer pressure, migration and downgrade/rollback behavior,
  database integrity, blob durable publication, GC reachability, backup fence,
  and database-plus-blob restore.
- Native Codex start/continue/list/known-ID recovery, approval, interrupt,
  response loss, provider/binding change, and no blind retry after uncertainty.
- Browser 10k histories, tool/approval-heavy streams, prepend/scroll anchor,
  reconnect, stale/unknown, blob access, lane/tab isolation, accessibility, and
  hostile output.
- Driver/package/update provenance, binary/schema fingerprint changes, retained
  compatibility evidence, install/update/uninstall diagnostics, rollback, and
  release two-host regression.

## G04-only validation and reporting

The G04 exact commit must at minimum demonstrate:

1. only the six permitted documentation paths changed;
2. every document carries the literal accepted promotion, tree, baseline,
   receipt path, and receipt commit;
3. for this draft checkpoint, required flags remain false and the G04 status
   remains pending; a later Owner-approved G04 transition needs a new exact
   commit and fresh exact-head review;
4. relative links and Markdown fences are structurally valid;
5. no product tree, package manifest, lockfile, dependency, workflow, service,
   credential, enrollment, or live network mutation was added; and
6. a focused exact-head scope review sees no G05 execution claim.

No CI workflow is created by this plan. If a future hosted check is required,
it is introduced only by an independently admitted implementation Goal and is
not treated as passing merely because it does not yet exist.
