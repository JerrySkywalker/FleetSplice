# FLEETSPLICE-G04A-VISIBLE-MVP-PREDEVELOPMENT-CLOSURE-004A

## Owner mandate and admission

Persisted before substantive architecture mutation. This bounded G04A correction
closes pre-development architecture and roadmap; it is not Research Wave 03.

```text
REPOSITORY=V:\src\FleetSplice
REQUIRED_START_BRANCH=planning/v0.1-full-train
REQUIRED_START_HEAD=2597f03a2288bdd11c1b94a3e5cc4bfee42ad7ac
REQUIRED_START_TREE=75f39d5adae787844f0ddcb4a574d6671652437c
MODEL=gpt-6-astra
REASONING_EFFORT=max
ALLOW_MODEL_SUBSTITUTION=false
VISIBLE_INCREMENT_RULE=true
G05_STARTED=false
OWNER_RESUME_REQUIRED_FOR_G05=true
```

The current Owner instruction overrides older train model and automatic
continuation policy for this Goal. The root Implementer is the sole repository
writer. A deterministic coordinator holds its writer lease and releases it for
the separate read-only Supervisor phase. Model/effort must be verified from
actual process evidence, not inferred from a profile name. No same-process
subagent counts as permission-isolated acceptance.

## Mission

1. Simplify Architecture 0.1 where high-assurance machinery blocks the first
   usable vertical slice.
2. Keep the safety kernel against duplicate effects, wrong targets, stale
   generations, privilege confusion, blind retry, and dishonest recovery.
3. Make each G05-G10 increment directly visible and dogfoodable. Major later
   implementation Goals also end in Owner-operable, observable capability.
   Infrastructure-only chains may not defer usability across several Goals
   without a documented concrete dependency.
4. Make remote browser/mobile control through the Owner's Tencent Cloud
   Beijing server the first product/dogfood milestone.
5. Obtain fresh process-isolated read-only GPT-6 Astra max exact-head review of
   the entire pre-development state after all corrections are committed.
6. Stop before G05. Do not begin it while the Owner is asleep.

## Required implementation sequence

| Goal | Visible outcome and mandatory limits |
| --- | --- |
| G05 local walking skeleton | SKYFORGE-01 only: Browser -> WebUI -> Hub -> typed FleetCommand -> Edge -> native Codex app-server -> real streaming output -> Browser. Real Codex session; mocks/fixtures cannot pass. Minimum W1/W5 selects a registered Workspace, creates/continues a session, submits a prompt, shows output. Local/loopback only; no public mobile, ZenBook Duo, ACP, TUI, provider migration, Admin/WSL, full history, or IDE dependency. |
| G06 remote mobile MVP | First usable product and v0.1-alpha.1: phone/remote browser -> HTTPS -> Tencent Hub + WebUI -> authenticated outbound Edge-initiated WSS HCP -> SKYFORGE windows-user Edge -> native Codex. Secure browser authentication, Host/Workspace visibility, create/open LogicalSession, prompt/real stream, one harmless Allow Once / Deny approval, interrupt, basic reconnect/resume, visible Host/Environment/Agent/turn state. A real mobile-network path or equivalent real remote browser is mandatory; Owner phone dogfood follows when Xiaomi Fold is available. |
| G07 multi-host expansion | Add ZenBook Duo through the same Hub/HCP/FleetCommand. Both Hosts visible; distinct Host/Environment identity; select Workspace and run real turn on either; switching cannot retarget admitted commands; reconnect retains exact generations; normal browser observation or explicit controller takeover. Move former G06 two-host requirements here and retain relevant daily-control semantics from former G07. |
| G08 durable session and recovery | Durable LogicalSession/SessionLane/NativeSegment, complete recovery journals, history/cursors, checkpoints, browser/Hub/Edge/native restart, response-loss reconciliation, explicit AMBIGUOUS_EFFECT, no blind retry. Owner closes/restarts/disconnects components and returns to the same honest Fleet session state. |
| G09 provider/binding migration | Explicit user-confirmed actual qualified migration or honest visible NO_QUALIFIED_TARGET. No transparent failover. |
| G10 hardening/release | Storage, backup/restore, security, upgrade/rollback, long-history UI, two-host/mobile dogfood and release acceptance. No feature expansion except safety/acceptance defects. |

## Architecture correction contract

Re-evaluate external AuthorityAnchor, participant pins, permit activation and
renewal, predecessor barriers, rollback continuity, SafetyControl, and D/O/R.
Give every mechanism an explicit disposition from:

```text
KEEP_G05
MOVE_G06
MOVE_G07
MOVE_G08_G10
DEFER_POST_V0_1_HARDENED_PROFILE
REWRITE
```

Do not retain a mechanism solely because G03 accepted it. Do not casually
remove a safety invariant. Preserve at minimum:

- typed FleetCommand, distinct ResolvedExecutionPlan, exact EdgeCommand;
- immutable target identities/generations, stable command and EdgeCommand IDs;
- Hub admission journal and Edge journal before native dispatch;
- idempotency, conflicting-ID detection, native Codex identity capture;
- no blind retry, explicit AMBIGUOUS_EFFECT, and SessionLane controller ownership;
- fail-closed generation discontinuity after restore.

v0.1 need not seamlessly continue execution authority across arbitrarily
restored or rolled-back Hub/Edge state. Preferred behavior is:

```text
RESTORE_OR_ROLLBACK_DETECTED
-> FAIL CLOSED
-> increment/invalidate relevant authority and runtime generations
-> reject stale commands/permits
-> reconcile native durable evidence
-> explicit re-admission / reenrollment where required
-> new effects only after recovery completes
```

Old authority must never silently resurrect. External AuthorityAnchor and
rollback-resistant seamless authority continuity must not be mandatory online
prerequisites for each G05/G06 turn. If a concrete security/effect counterexample
cannot be contained by epoch reset, generation fencing, journals, idempotency,
and reconciliation, record that exact counterexample and stop with
`OWNER_ARCHITECTURE_DECISION_REQUIRED`.

Keep G03 and historical receipts immutable. Normative changes are additive in
`docs/architecture/amendments/g04a-visible-mvp-simplification.md`, with exact
superseded clauses and rationale. Current entry points and planning documents
must resolve normative precedence so old mechanisms cannot remain accidental
first-effect prerequisites.

## HCP, deployment, identity, and phone UX

Use one HCP semantic protocol: same-host/loopback carriage in G05, authenticated
Edge-initiated remote WSS in G06 onward. No second local command semantics.

Freeze only the G06 deployment design:

- Tencent VPS: Hub, WebUI/backend, durable Hub state, HTTPS/WSS ingress.
- SKYFORGE: per-user Edge, Workspace/local truth, Codex app-server, local Edge
  journal, provider credentials and local execution state.
- Phone never exposes or connects directly to a SKYFORGE listening port.
- Prefer cloud Hub + WebUI. Do not add a separate FleetSplice Relay service or
  protocol to preserve a local Hub. Relay-only is deferred unless a concrete
  requirement proves the Hub cannot reside on Tencent Cloud.
- No actual Tencent Cloud server mutation during G04A.

Fold/unfold and narrow layouts render the same FleetNavigationModel,
SessionHeaderModel, SessionTimelineModel, ControlContextModel, and AttentionModel.
A mobile browser is a normal clientInstanceId, with no mobile-specific mutation
API. Add an explicit real remote mobile acceptance contract.

## Owner policy decisions at first use

| First use | Required decision scope |
| --- | --- |
| G05 | Minimum local identity, generation, and safety policy only. |
| G06 | Minimum SKYFORGE/cloud Host trust and enrollment, browser/mobile authentication, approval, reconnect/session policy, Tencent deployment/security profile. |
| G07 | Second Host enrollment, richer controller/takeover, multi-host rotation/revocation. |
| G08-G10 | Backup, retention, restore, update, and lifecycle hardening when each is first used. |

Future G10 policy must not block G05. This Goal defines reviewable decisions;
it does not enroll Hosts, issue credentials, or perform deployments.

## Final audit and bounded corrections

After the candidate is committed and pushed, launch a fresh process-isolated
read-only reviewer at literal candidate SHA/tree, GPT-6 Astra, effort max,
approval never, no substitution. Review the whole pre-development state:

- Architecture 0.1, all six ADRs and current amendments; G04/G04A and G05-G10;
- root train, manifest, visible increments, dependencies and stop boundary;
- Tencent topology, real remote/mobile acceptance, and HCP sequencing;
- Host/Environment/Workspace identities and SessionLane controller semantics;
- no duplicate effect path or blind retry; restore/rollback fail closed;
- secret/credential placement; no orphaned AuthorityAnchor prerequisites;
- no future milestone blocking G05, product implementation, dependencies,
  package/CI/deployment mutation; all links/status flags;
- exact lineage, immutable history, clean and pushed branch.

All actionable Low findings must be fixed. Every correction requires a fresh
independent process review. Maximum correction/review cycles: 3. If clean PASS
cannot be obtained within that bound, stop with
`DISPOSITION=BLOCKED_G04A_OWNER_REVIEW`. A tool/admission failure is not a PASS.
Do not use an unbounded architecture review loop.

An acceptance receipt may identify a reviewed parent SHA/tree; it must never
pretend to be its own reviewed object. Any later receipt-only commit must itself
receive a fresh exact-head review before the final branch is accepted. External
review custody may carry final literal-head evidence without another repository
mutation. Historical receipt contents are never rewritten.

## Prohibited artifacts and actions

G04A creates no apps/, packages/, package.json, lockfile, product runtime, CI
workflow, Docker deployment, Tencent mutation, Host enrollment, credential, or
product database. Research fixtures remain historical evidence. G05 stays
unstarted; no main merge or later train execution is part of this Goal.

## Target success state

These are acceptance targets, not claims made by persisting this mandate:

```text
DISPOSITION=PASS_G04A_VISIBLE_MVP_PREDEVELOPMENT_CLOSURE
ARCHITECTURE_0_1_READY=true
G04A_PASS=true
G04_FORMAL_PASS=true
STATION_A_READY=true
VISIBLE_INCREMENT_RULE=true
G05_TARGET=LOCAL_SKYFORGE_REAL_CODEX
G06_TARGET=PHONE_TENCENT_HUB_SKYFORGE_REAL_CODEX
G07_TARGET=MOBILE_MULTI_HOST_SKYFORGE_ZENBOOK
TENCENT_MVP_ROLE=HUB_AND_WEBUI
SEPARATE_RELAY_REQUIRED=false
PREDEVELOPMENT_AUDIT=PASS
CRITICAL_FINDINGS=0
HIGH_FINDINGS=0
MEDIUM_FINDINGS=0
UNRESOLVED_LOW_FINDINGS=0
G05_STARTED=false
OWNER_RESUME_REQUIRED_FOR_G05=true
PRODUCT_CODE_CREATED=false
DEPENDENCIES_CREATED=false
CI_CREATED=false
TENCENT_CLOUD_MUTATED=false
WORKTREE_CLEAN=true
PUSH_VERIFIED=true
NEXT_STEP=OWNER_REVIEW_THEN_G05
```
