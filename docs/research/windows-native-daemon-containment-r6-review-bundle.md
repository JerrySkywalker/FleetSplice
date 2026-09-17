# R6 Medium-worker-first audit: sanitized review bundle

Disposition: `OWNER_ACTION_REQUIRED_MEDIUM_WORKER_BOOTSTRAP`.
This is an incomplete local research result, not qualification of a production fix.
The R6 Goal controls scope; the R5 report, receipt and hash manifest remain unchanged.

## Admission and preservation facts

- Repository start HEAD: `141ac34628978e4765b69a29b5bfafbcb498d7ab` (clean).
- R0: `AUDITOR_MODE=INDEPENDENT_EXEC_SERVER`, executor PID `54892`,
  `EXECUTOR_IN_ANCESTOR_CHAIN=True`, `TARGET_DAEMON_IS_AUDITOR_ANCESTOR=False`,
  `ADMISSION_RESULT=PASS`.
- R0 proof SHA256: `5F720EF9C67298B75ABEFB8583EFD831AD1ECE1606712FE90C5C5FAD8163D1E8`.
- The only audit-shaped exec-server observed is this current executor. R5's
  executor PID `28776` is absent. The current launcher checks for old audit
  exec-servers before creating a new one. No new auditor was launched here.
- R5: all **34** entries in its hash manifest reverified, zero mismatches.
  Preservation record SHA256: `6A364D66691B63CFCDB5CE2035E4C5559E2B5F4CDE4FE145D07CAF38F5D105C3`.
- Owner cleanup receipt timestamp `2026-09-14T09:44:54.5493534+08:00` reports
  `PASS_VERIFIED_R5_CANARY_REMOVED`; fresh check confirms `V:\_fscx154-r5a` absent.
- Production daemon PID `43884`, created `2026-09-13 14:26:13`, remains present
  at its original official release executable path. No production lifecycle or
  effect-capable RPC was issued. This does not assert absence of other native users.

## Exact source authority

All source references use commit **6b9826e3aa83b1a5947db50f4332cb9c65f1b340**.
The 13 preserved R5 source files were rehashed and their Git blob IDs recomputed;
both match the preserved source manifest. Source reverification record SHA256:
`28BDE220ED924861C34B3212EC01742306E991E297686B4CDE8DFF13571288BB`.
This is local exact-object reverification, not a new release-tag network lookup.

| Exact source | Required fact | SHA256 |
| --- | --- | --- |
| [daemon lib.rs:193](https://github.com/openai/codex/blob/6b9826e3aa83b1a5947db50f4332cb9c65f1b340/codex-rs/app-server-daemon/src/lib.rs#L193) | Windows Start/Restart invokes `ensure_not_elevated`; `Daemon::from_environment` at 281 resolves socket, state and managed binary from CODEX_HOME. | `021DD9240549B300B15D40A9FCC0807E7F5B70FA99EFC098876E02DAF88D1786` |
| [backend/windows.rs:51](https://github.com/openai/codex/blob/6b9826e3aa83b1a5947db50f4332cb9c65f1b340/codex-rs/app-server-daemon/src/backend/windows.rs#L51) | `TOKEN_ELEVATION` / `TokenElevation` query; rejects `TokenIsElevated != 0`. `ensure_detached` at 172 checks `IsProcessInJob` and terminates/rejects a retained child. | `737AACC29A771B5D3F3779E44836AEE43D686CA6EBA72575F63A6AFE27C628E5` |
| [backend/pid_start.rs:18](https://github.com/openai/codex/blob/6b9826e3aa83b1a5947db50f4332cb9c65f1b340/codex-rs/app-server-daemon/src/backend/pid_start.rs#L18) | Backend also rejects elevated startup; line 169 sets `DETACHED_PROCESS \| CREATE_BREAKAWAY_FROM_JOB`. | `A9BBFC28F61135EE5BADABE798089A780E525789733652C57860B9FA66243F7A` |
| [uds/windows_peer.rs](https://github.com/openai/codex/blob/6b9826e3aa83b1a5947db50f4332cb9c65f1b340/codex-rs/uds/src/windows_peer.rs) | Same-user, non-elevated peer checks do not themselves prove cross-session attachment. | `BF64909A21CD3D36FB4AF9B27B3B69C07F4EF9361566BD5CA1EA3D667E77CC72` |

Installed/auditor binary evidence SHA256:
`be96b992178b1e467c225800da0d65f2c86d5eba1ef0b14632f65db381cbdfde`,
`codex-cli 0.154.0`. No binary was copied into a new R6 CODEX_HOME.

## Worker token facts and bounded Owner action

The new C# helper compiled successfully with the local .NET Framework x64 compiler.
Its **read-only `inspect` mode** returned for the current Session-1 audit child:

```text
UserSID=S-1-5-21-427755835-4166587223-1687755325-1001
SessionId=1
IntegritySID=S-1-16-8192
TokenElevation=0
AdministratorsAttributes=16 (deny-only)
SeDebugPrivilege=absent
SeImpersonatePrivilege=absent
ProfilePath=C:\Users\jerry
```

The observed token lacks SeTcbPrivilege, SeAssignPrimaryTokenPrivilege and
SeIncreaseQuotaPrivilege. No token mutation or task registration was attempted
by the auditor. Existing R5 notes record the host's S4U Limited request yielding
High authority; a Limited label is not accepted as Medium-token proof.

Candidate helpers, all under `scripts/audit`:

| File | SHA256 at review request |
| --- | --- |
| `r6-medium-worker.cs` | `EAE45FB01D3C5B96875258E4A7084EF54130498AF6585C84C0A1F9AC0C684B88` |
| `invoke-r6-owner-medium-bootstrap.ps1` | `72994CCDE343E8AAFBD2C00D74D113A3F75B9E10D40ABAC4A8E68B4C9CF11FA5` |
| `cleanup-r6-medium-canary.ps1` | `B3F1F4972D9E2201712F536538FA2DC2DAB0F09BD87E0131C43DB3061E768890` |

Corrected file Git blob identities (`git hash-object --no-filters`, no Git writes):

```text
r6-medium-worker.cs=285dbc87dcc3c4aed8e9e547b1a62908e2c2daf3
invoke-r6-owner-medium-bootstrap.ps1=05df70f76862a21f1b7961cc4ea68ced1294b149
cleanup-r6-medium-canary.ps1=cb2355f5568cc690cfe94c1cb8a186215c90e38f
```

The Owner script is fixed to the same Owner SID, Session 1, one unused root and
one unused task name. It stages hash-pinned source under administrator-owned
ACLs in `V:\_fscx154-r6w\bootstrap`; only the scratch subtree is Owner-writable.
It requests S4U Limited and starts the fixed bootstrap once. The Session-0
bootstrap creates a LUA restricted token, explicitly deletes privileges, sets
Medium integrity and checks every required token property. It checks the actual
suspended child's token and absence of Job membership before resuming it, then exits.
Failure is preserved and does not trigger a retry, elevation bypass or daemon launch.

The worker has no command input, shell, listener, plugin/config reader or Codex
launch path. Its fixed operations are token/profile/job evidence, synthetic
DPAPI CurrentUser continuity, scratch write, loopback port 7890 and public
credential-free HTTPS to api.github.com, then a 90-second idle lifetime and exit.
The synthetic DPAPI blob was generated by this non-elevated auditor; it contains
only a public fixed canary string. It is not production DPAPI data.

Windows references supporting the proposed primitive (not behavior qualification):
[CreateRestrictedToken](https://learn.microsoft.com/en-us/windows/win32/api/securitybaseapi/nf-securitybaseapi-createrestrictedtoken),
[CreateProcessAsUserW](https://learn.microsoft.com/en-us/windows/win32/api/processthreadsapi/nf-processthreadsapi-createprocessasuserw).
The former documents LUA_TOKEN and explicit privilege deletion; the latter
documents session selection and the restricted-self-token privilege exception.
Neither replaces the mandatory runtime TokenElevation and Job checks.

Both new PowerShell scripts parse without errors. First compiler invocation used
forward slashes in a relative source path and failed file lookup; the corrected
absolute Windows path compiled. No canary execution was retried.

## Untested transport, observer and cleanup state

```text
CANARY_WORKER_ROOT=V:\_fscx154-r6w (planned; absent)
CANARY_CODEX_HOME=NOT_CREATED
CANARY_DAEMON_PID=NONE
CROSS_SESSION_ATTACH_ARTIFACTS=NONE_NOT_RUN
WINDOW_OBSERVER_ARTIFACTS=NONE_NOT_RUN
```

The corrected Owner action uses a short fixed native bootstrap to create and
verify a suspended restricted Medium Session-1 observer first; only that Medium
child launches the existing checked-in visible-window observer with no profile
and no window. The High launcher exits after creating the restricted child.
A later resume must verify that its actual Started/Finished
interval covers worker creation and exit, and inspect relevant windows and
foreground events. Merely starting the observer does not qualify zero windows.
Its source SHA256 is `5274704DC2B31729D6C4C293AC325D4A5B3FE55DDE46E5E01274C1DFE1CECB08`.

No R6 task, Session-0 worker, daemon or disposable root has been created. The
compiled read-only probe and audit receipts are retained evidence outside the
canary. Current executor cleanup is pending TUI exit through the existing
launcher; the executor serving this turn must not be killed mid-audit.

The fixed Owner cleanup helper refuses live task/process references, missing
worker exit evidence, reused PIDs, reparse points, production-home overlap,
unexpected Codex binaries and unprovable exclusive file/directory access. It
preserves receipts before acquiring exclusive handles. It checks canonical names
and reparse attributes on those handles, verifies every held file's SHA256 against
both the preservation manifest and the archived bytes, retains exclusive archive
handles, and deletes through the same retained original handles, children before
parents. It never kills a process. This cleanup path is
syntax-checked (including its native declarations), not deletion-qualified.
Later daemon qualification needs its own exact disposable identity/cleanup binding.

## Final disposition

```text
LIVE_PRODUCTION_DAEMON_QUIESCENCE=UNPROVABLE_ON_0_154_0_PUBLIC_SURFACES
LIVE_DAEMON_MIGRATION=NOT_AUTHORIZED_BY_RUNTIME_INTROSPECTION
PRODUCTION_DAEMON=READ_ONLY
ROOT_CAUSE_CURRENT=PRIOR_NATIVE_DAEMON_DESCENDANT_PRESENTATION_EVIDENCE_NO_NEW_REPRODUCTION
R5_DEPENDENCY_CYCLE=CORRECTED
SESSION0_WORKER=OWNER_BOOTSTRAP_NOT_RUN
SESSION0_WORKER_TOKEN_ELEVATION=NOT_MEASURED
SESSION0_WORKER_JOB_STATE=NOT_MEASURED
OFFICIAL_DAEMON_DETACHED_LAUNCH=NOT_TESTED
CROSS_SESSION_OFFICIAL_DAEMON=NOT_TESTED
SESSION1_IMPLICIT_ATTACH=NOT_TESTED
MEDIUM_EQUIVALENT_DAEMON_TOKEN=NOT_QUALIFIED
ZERO_FOREGROUND_WINDOWS=NOT_TESTED
CANARY_CLEANUP=R5_VERIFIED_ABSENT_R6_NOT_CREATED
INDEPENDENT_REVIEW=PASS_BOUNDED_OWNER_ACTION_SOURCE_READINESS_ONLY
REBOOT_GATED_CUTOVER_RECOMMENDED=CONDITIONAL_HYPOTHESIS_NOT_QUALIFIED
NATIVE_SAME_THREAD_LATE_ATTACH_IMPACT=UNQUALIFIED_NO_PRODUCT_CHANGE
RECOMMENDED_FIX_CLASS=UNDETERMINED_PENDING_MEDIUM_WORKER_AND_CROSS_SESSION_QUALIFICATION
NEXT_IMPLEMENTATION_GOAL=NONE
G06_STARTED=false
MERGED=false
```

After a successful Owner bootstrap, resume this same R6 Goal to inspect the
receipts. Sections 4–6 remain gated on actual section-3 PASS; no production
cutover, reboot or implementation is authorized.

## Initial independent review and corrections

The first separate `jerry-supervisor` process confirmed active read-only/never
permissions and read all requested repository files. It returned
`INDEPENDENT_REVIEW_BLOCKED_BY_POLICY`: its SHA256 attempts could not complete
because Get-FileHash was unavailable and direct .NET hashing was disallowed in
ConstrainedLanguage. No policy was changed and no independent PASS was claimed.
It identified elevated observer inheritance and release of cleanup handles
before pathname deletion. Both have been corrected as described above.

A fresh review of the corrected code can bind exact bytes using read-only Git
blob identities, separately from author-provided SHA256 values; it must not
repeat the disallowed .NET operation or weaken its permission context. A final
review result is still required. The non-elevated Owner-script refusal guard was
also exercised: it returned the required Owner-action marker before creating
any canary directory.

The second separate review confirmed active read-only/never permissions and all
three Git blob identities, and accepted the observer/retained-handle corrections.
It returned `CHANGES_REQUIRED` because archived bytes were not yet compared with
retained original bytes. That comparison and exclusive archive-handle retention
are now implemented. A non-deleting synthetic fixture confirms that held-file
hashing matches SHA256 and leaves the original handle valid. This is not a
deletion test or worker qualification.

The third, fresh separate Supervisor review returned **PASS — bounded Owner-action
source readiness only** after confirming active read-only/never permissions,
repository HEAD and all three corrected Git blob identities above. It confirmed
the restricted observer and the held-file/manifest/archive comparison, identified
no remaining material source-readiness issue, and explicitly excluded worker
runtime, observer coverage, actual deletion and sections 4–6 from its PASS.
The reported SHA256 values remain author-recomputed; independent identity
verification used Git blobs. All three review attempts are retained separately.
Final review JSONL SHA256:
`B9FD23A1D8804215EBA7F320C2ED217CAE0726642C8C62E8BFF542B183DAEEAC`;
exit-0 receipt SHA256:
`8C7DE28C1EA4889617046BA6156E94A558A04A24382A08A535AECCF4E47121E3`.
Non-deleting held-hash fixture result SHA256:
`1B29A1AAC5D55893C8FFC5AE23BAB2BD418FC3FB3E46DB7890BDA5F1441D1E7F`.

## Exact Owner handoff

Run once from **elevated Owner PowerShell**, as required by R6 section 3's
elevation boundary. Do not rerun on a failure or an existing canary root.

```powershell
$R6Bootstrap = 'V:\src\FleetSplice\scripts\audit\invoke-r6-owner-medium-bootstrap.ps1'
if ((Get-FileHash -LiteralPath $R6Bootstrap -Algorithm SHA256).Hash -cne '72994CCDE343E8AAFBD2C00D74D113A3F75B9E10D40ABAC4A8E68B4C9CF11FA5') { throw 'R6 bootstrap hash mismatch' }
& $R6Bootstrap
```

Wait 160 seconds for the fixed worker and observer to finish, then resume this
same R6 Goal. The receipt is `V:\_fscx154-r6w\OWNER-BOOTSTRAP.json`, with token,
worker and observer evidence under `scratch`. Do not interpret command exit as
qualification; the later auditor must verify every required fact and coverage.
The worker-only primitive is deliberately bounded and has no daemon-launch input;
section 4 still requires a separately bound fixed official lifecycle operation
under the qualified placement primitive. No Agent/daemon is launched by this script.

At this stop the three helpers and this bundle are repository-local uncommitted
additions. No Git commit, push, merge, product code change, production lifecycle
mutation, reboot or G06 work occurred. No claim of final R6 acceptance is made.
