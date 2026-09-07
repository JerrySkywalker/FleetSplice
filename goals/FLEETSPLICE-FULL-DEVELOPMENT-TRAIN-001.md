# FLEETSPLICE-FULL-DEVELOPMENT-TRAIN-001

## Mission and current stop

Develop FleetSplice through visible Owner-operable increments. This is a
repository development train, not a runtime dependency or Coordination Loop
integration. The active authorization is ONLY
[FLEETSPLICE-G04A-VISIBLE-MVP-PREDEVELOPMENT-CLOSURE-004A](FLEETSPLICE-G04A-VISIBLE-MVP-PREDEVELOPMENT-CLOSURE-004A.md).
It corrects the architecture and G04 contract, obtains final independent
acceptance and stops before G05.

```text
VISIBLE_INCREMENT_RULE=true
CURRENT_GOAL=G04A
MODEL=gpt-6-astra
REASONING_EFFORT=max
ALLOW_MODEL_SUBSTITUTION=false
G05_STARTED=false
OWNER_RESUME_REQUIRED_FOR_G05=true
```

The model/effort override above applies to G04A writer and reviewer processes.
Older train selections/reviews remain historical evidence; future resumed
execution must admit its applicable routing. Prior automatic continuation
authority is suspended by this Owner stop. No document in this train can
automatically start G05 while the Owner is asleep.

## Admission and architecture authority

Repository V:\src\FleetSplice. G04A starts from branch
planning/v0.1-full-train, HEAD `2597f03a2288bdd11c1b94a3e5cc4bfee42ad7ac`,
tree `75f39d5adae787844f0ddcb4a574d6671652437c`, descending from the original
research/UI base `1eb39b669de9a9e3dd24fdd7af74ed45a661b7d4`.
Require a clean exact worktree and admitted scope. The Goal-only persistence
commit precedes architecture mutation.

G03 is immutable accepted architecture evidence: promotion
`96cb7a4965a651b8582a3ee35049d52204c3fc73`, tree
`b554b8568b633397681307d73c7d7fec105963bd`,
`docs/architecture/baseline-0.1.md`, recorded by
[G03 receipt](../docs/train/receipts/G03.md). Its current normative override is
the additive [G04A amendment](../docs/architecture/amendments/g04a-visible-mvp-simplification.md).
Later implementation receipts cite both literal accepted objects. Historical
research/receipts are not rewritten.

G04/G04A may create/revise architecture, Goal and roadmap documents only.
Formal PASS_V0_1_IMPLEMENTATION_CONTRACT freezes conditional G05-G10 scope.
Even formal PASS requires Owner review/resume and applicable Station A admission
before product work. G11-G16 remain later listed work after G10/Station B, their
manifest dependencies and child gates; none is authorized to execute now.

## Visible critical path

```text
G01 -> G02 -> G03 -> G04 -> G04A -> Station A ready -> OWNER STOP
   Owner resume / Station A admission
 -> G05 -> G06 -> G07 -> G08 -> G09 -> G10 -> Station B -> G11
 -> [G12, G13, G14] -> G15 -> G16 -> Station C
```

| Goal | Directly visible outcome |
| --- | --- |
| G05 | SKYFORGE-only local Browser -> WebUI -> Hub -> FleetCommand -> Edge -> native Codex -> real stream. |
| G06 | Phone/real remote browser -> Tencent Hub + WebUI -> outbound WSS SKYFORGE Edge -> real Codex; approval/interrupt/basic reconnect; v0.1-alpha.1. |
| G07 | Same mobile/WebUI controls either SKYFORGE or ZenBook; exact identities and explicit takeover. |
| G08 | Close/restart/disconnect and return to the same honest durable Fleet session/history. |
| G09 | Actual qualified confirmed migration or visible evidence-backed NO_QUALIFIED_TARGET. |
| G10 | Hardened two-host/mobile release; usable backup/restore/update/rollback. |
| G11 | Real second ACP Agent through existing Fleet UI. |
| G12 | Operate separately authorized Admin/WSL Environment through explicit privilege boundaries. |
| G13 | Operate files/diff/Git/terminal Workspace surfaces. |
| G14 | Use first-party remote TUI through the same Fleet semantics. |
| G15 | Observe accepted WebUI/TUI parity through actual dogfood. |
| G16 | Observe stable N develop/canary N+1, with independent external activation and rollback. |

Every major implementation Goal must end with Owner-operable and observable
capability. Infrastructure-only chains that delay usability across several
Goals require a concrete unavoidable dependency and shortest delivery path.
No Anchor/pin/permit/SafetyControl/D/O/R service/test chain, future G10 policy,
TUI, ACP, Admin/WSL or second Host can block G05.

One HCP semantic protocol uses loopback in G05 and authenticated outbound
Edge-initiated WSS in G06 onward. Tencent runs Hub + WebUI; no separate Relay
protocol/service or phone-to-SKYFORGE port. Shared Fleet-owned responsive
models apply to phone/fold/unfold and desktop alike.

## Stations, evidence and permissions

| Station | Gate |
| --- | --- |
| A | Formal G04 + G04A exact-head acceptance and current architecture contract. Readiness is not merge or implementation authorization. |
| B | G05-G10 real visible increments, two-host/mobile Owner dogfood, release/security/recovery/storage/upgrade gates. |
| C | G11-G16 exact DAG/capability/parity/self-hosting acceptance. |

One intentional Implementer owns repository and Git writes with a coordinator
writer lease. Final acceptance is a fresh separate read-only Supervisor process;
release the writer lease during review. Same-process subagents are not
permission isolation. Never self-certify, force push, bypass failed checks,
mutate unrelated repositories, or use literal bypass mode.

G04A authorizes normal commits/pushes to the planning branch, not PR/main merge,
product code, packages/lockfiles/dependencies/CI, deployment, server contact,
enrollment or credential creation. Future live/Owner-attended operations are
admitted at their first-use Goal. Fixtures cannot pass live requirements;
offline/stale is not stopped; new generation is not predecessor closure.

G05-G11 are sequential. Later G12-G14 may overlap only under separately
admitted disjoint ownership; G15 integrates them and G16 stays serial.
No concurrency is needed to enlarge the current G04A scope.

## Review and completion

Follow [development policy](../docs/v0.1/development-test-merge-policy.md)
and the [manifest](train-manifest.v1.json). G04A requires GPT-6 Astra max
process-isolated exact SHA/tree review of the entire pre-development state,
zero actionable findings, fresh review after correction and no more than three
correction/review cycles. Stop BLOCKED_G04A_OWNER_REVIEW if the bound is exhausted.

Current state is [G04A-status](../docs/train/G04A-status.md).
Successful G04A returns PASS_G04A_VISIBLE_MVP_PREDEVELOPMENT_CLOSURE and
NEXT_STEP=OWNER_REVIEW_THEN_G05. This is not PASS_FULL_DEVELOPMENT_TRAIN.
Full-train completion remains a later claim requiring all manifest goals and
stations with clean/pushed exact-head evidence.
