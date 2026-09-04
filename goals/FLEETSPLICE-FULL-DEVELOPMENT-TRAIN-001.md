# FLEETSPLICE-FULL-DEVELOPMENT-TRAIN-001

## Mission

Execute the accepted FleetSplice architecture closure, v0.1 minimum-useful product, v0.2 interaction/environment expansion, and first self-hosting proof as one bounded development train.

This Goal is a **development supervisor Goal**, not a FleetSplice runtime dependency and not a Coordination Loop integration. It borrows Coordination Loop fast-track discipline: explicit DAG, exact-head admission, one writer per owned file domain, independent review, hard gates, checkpoint receipts, and automatic continuation after PASS.

## Owner model selection

```text
MODEL=gpt-5.6-sol
REASONING_EFFORT=ultra
ALLOW_MODEL_SUBSTITUTION=false
```

Use Sol Ultra for the root supervisor and, where controllable, all delegated workers/reviewers. Multi-agent work is encouraged only when scopes are disjoint and the root supervisor retains integration authority.

## Admission

1. Work in `V:\src\FleetSplice`.
2. Read repository `AGENTS.md`, this Goal, `train-manifest.v1.json`, the two research waves, Wave-02 synthesis, and current architecture UI/TUI documents before mutation.
3. Resolve the commit containing this Goal and verify it descends from research/UI planning base `1eb39b669de9a9e3dd24fdd7af74ed45a661b7d4`.
4. Require a clean worktree before train mutation.
5. Never mutate an unrelated repository except for explicit, read-only conformance inspection or owner-authorized two-host deployment/qualification required by a child Goal.

## Train gates

The train has three merge stations:

```text
Station A: G01-G04  Architecture + implementation contract
Station B: G05-G10  v0.1 minimum-useful Fleet + hardening/release
Station C: G11-G16  v0.2 expansion + TUI parity + self-hosting proof
```

A station may merge only after exact-head independent review is PASS. The root supervisor may open/update draft PRs, create bounded branches/worktrees, commit, push, and normally merge exact accepted heads where repository rules and GitHub permissions allow. Never bypass a failing required check or force-update `main`.

## Architecture gate

G01-G04 are mandatory before product implementation.

- G01 drafts Architecture 0.1 only.
- G02 is independent/adversarial and may not self-approve its own fixes.
- G03 may declare `ARCHITECTURE_0_1_READY=true` only after a fresh PASS review. If review finds architecture-invalidating issues, remediate narrowly and re-run an independent review until PASS or BLOCKED.
- G04 freezes v0.1 scope/quality/repository layout and explicitly authorizes
  only G05-G10.
- No product source, package manifest, runtime dependency, service, deployment,
  CI workflow, or other product mutation may be created before G03 PASS and
  exact-head G04 `PASS_V0_1_IMPLEMENTATION_CONTRACT`; admission to or execution
  of G04 is not implementation authority.

G04 authorizes only G05-G10. Running this owner-authored root Goal separately
authorizes its listed G11-G16 after the accepted Architecture 0.1 commit is
cited, G10 and Station B pass on exact heads, and every manifest dependency,
child-Goal gate, owner-attended ceremony, and independent-review requirement is
satisfied. This post-v0.1 authority does not widen G04 or authorize unlisted
scope.

## Fast-track policy

Optimize wall-clock by removing duplicated process work, not by weakening product gates.

- The root supervisor may coordinate several Sol Ultra workers.
- One writable file/package domain has one writer at a time.
- Read-only research/review may overlap implementation.
- Protocol/contract producers settle before dependent consumer mutation.
- G05-G10 remain mostly sequential because each is a vertical product slice.
- After v0.1, G12-G14 may overlap only if the supervisor proves file/resource ownership is disjoint; merge/integration remains serialized.
- Do not create governance machinery merely to govern the train.

## Product critical path

```text
G01 -> G02 -> G03 -> G04
                    |
                    v
G05 -> G06 -> G07 -> G08 -> G09 -> G10
                                      |
                                      v
                                     G11
                              +--------+--------+
                              |        |        |
                             G12      G13      G14
                              \        |        /
                               +-------+-------+
                                       v
                                      G15
                                       |
                                       v
                                      G16
```

G15 requires G13 and G14 and must also reconcile any interaction-surface changes caused by G12. G16 starts only after the v0.2 interaction/runtime baseline is accepted.

## Scope freeze

### Required through v0.1

- React + TypeScript + Vite WebUI.
- Node/TypeScript Hub and per-user Edge coordinator.
- FleetCommand / FleetProjection / FleetReceipt / FleetEvent boundaries.
- native Codex app-server driver.
- SKYFORGE-01 single-host walking skeleton.
- SKYFORGE-01 + ZenBook Duo two-host minimum Fleet loop.
- approval, interrupt, controller takeover, reconnect/resume.
- durable LogicalSession/SessionLane/NativeSegment history and recovery.
- SQLite + content-addressed blobs.
- explicit ambiguity/reconciliation semantics.
- provider-migration gate ending in either a real qualified owner-confirmed
  migration or a verified, visible, fail-closed `NO_QUALIFIED_TARGET`; every
  activated target requires confirmation and transparent failover is forbidden.
- fault injection, backup/restore, upgrade compatibility, long-history UI qualification.

### Required after v0.1 in this train

- one real ACP second Agent (OpenCode unless fresh evidence invalidates it).
- Windows admin + WSL companion model with least-privilege boundary.
- files/diff/Git/terminal workspace UX.
- first-party remote TUI using the same Fleet semantics.
- WebUI/TUI semantic parity.
- bounded FleetSplice N -> N+1 self-hosting/canary/rollback proof.

### Explicit non-goals for this train

- Coordination Loop runtime integration.
- scheduler/general DAG orchestration inside FleetSplice.
- transparent provider failover.
- enterprise multi-tenancy/RBAC.
- Kubernetes/Raft/distributed consensus.
- universal model gateway.
- native mobile app.
- macOS production support.
- plugin marketplace/public third-party Driver SDK.
- automatic workspace synchronization.

## Owner-attended operations

UAC/elevation bootstrap, logout/reboot/sleep, credential enrollment, destructive WSL lifecycle tests, or other interactive security ceremonies may require owner attendance. If an affected Goal cannot complete such a test safely unattended:

1. mark `OWNER_ATTENDED_REQUIRED` with exact command/action and reason;
2. continue independent safe lanes when DAG/resource ownership permits;
3. never fake PASS;
4. before final Station C acceptance, all required owner-attended gates must be resolved or explicitly reclassified as post-train acceptance by the owner.

## Review policy

Every mutation Goal ends with:

- focused tests proportional to changed behavior;
- exact-head diff review;
- independent reviewer for architecture/security/cross-boundary goals;
- scope check against this train;
- clean-worktree/push verification.

A reviewer reports findings first and does not modify the reviewed head. Fixes land in a later commit and require fresh review.

## Child Goals

Execute the 16 Goal files in `train-manifest.v1.json`. Treat each file as authoritative for its local scope and acceptance criteria. This root Goal is authoritative for train order, stop conditions, model selection, and cross-goal scope. No child admission or local wording bypasses the accepted-architecture citation, exact-head G04 PASS, or its manifest dependencies.

## Final disposition

Success requires all required goals to pass, all merge stations to settle, and the final repository to be clean and pushed.

Return at least:

```text
DISPOSITION=PASS_FULL_DEVELOPMENT_TRAIN
GOAL_ID=FLEETSPLICE-FULL-DEVELOPMENT-TRAIN-001
MODEL=gpt-5.6-sol
REASONING_EFFORT=ultra
TRAIN_START_HEAD=
TRAIN_FINAL_HEAD=
ARCHITECTURE_0_1_READY=
V0_1_RELEASE_ACCEPTED=
V0_2_PARITY_ACCEPTED=
SELF_HOSTING_ACCEPTED=
GOALS_PASS_COUNT=
GOALS_BLOCKED_COUNT=
OWNER_ATTENDED_REMAINING=
WORKTREE_CLEAN=
PUSH_VERIFIED=
SCOPE_EXPANSION=false
```

If incomplete, return accurate PARTIAL/BLOCKED state and the exact first unsatisfied hard gate.
