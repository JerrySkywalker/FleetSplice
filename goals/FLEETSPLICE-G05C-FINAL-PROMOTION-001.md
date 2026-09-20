
# FLEETSPLICE-G05C-FINAL-PROMOTION-001

Owner authorization: G05C_FINAL_PROMOTION_WITH_REPO_HYGIENE.

This Goal promotes the final accepted local G05C product candidate into the
canonical functional-development baseline before remote/mobile work resumes.

It also performs a full Git worktree/branch hygiene audit and safely retires
obsolete G05/G05C worktrees and branch refs while preserving exact historical
commits under an archive namespace.

## Exact start

BASE_PRODUCT_HEAD=017a89472436702a9f6228bf680a3674bb0a2d32
BRANCH=train/g05c-final-promotion-001
WORKTREE=V:\src\FleetSplice-g05c-final-promotion
ARTIFACT_ROOT=V:\artifacts\FleetSplice\FLEETSPLICE-G05C-FINAL-PROMOTION-001

PRODUCT_G06_STARTED=false
TENCENT_DEPLOYMENT_AUTHORIZED=false
REMOTE_TENCENT_WORK=false
MERGE_MAIN=false

## Product facts to preserve

- Architecture 0.1 remains accepted.
- PRIMARY_NATIVE_PATH=NATIVE_ADOPTED.
- Realtime two-stream control is accepted.
- Common Web turn snapshot fanout remains bounded.
- Responsive Web UI and near-term UI/UX are frozen.
- Design tokens / Flutter portability seam are frozen.
- Native Adoption model/reasoning/permission mutation remains observe-only when
  upstream structured mutation is unproved.
- Three historical CODEX_ARTIFACT_UNQUALIFIED failures from the ordinary local
  Codex managed pin remain environment debt, not a G05C product regression.

Do not change product behavior in this Goal unless required to fix a concrete
promotion blocker discovered by validation.

## PROMO-00 — exact candidate and environment audit

Audit the exact starting candidate.

Record:
- HEAD/tree;
- branch;
- status;
- remotes;
- Node/runtime qualification;
- relevant Codex daemon identity if available;
- current test/acceptance commands;
- UI portability freeze receipt location.

Run:
- npm run check
- npm run build
- npm run tokens:check
- npm run accept:native-browser
- npm run accept:ux-browser

Do not run repeated full suites during every phase.

## PROMO-01 — full local worktree audit

Run a complete Git worktree audit from the repository common dir.

At minimum collect:

- git worktree list --porcelain
- each registered worktree path
- HEAD
- branch/detached state
- git status --porcelain=v2 --untracked-files=all
- whether the path exists
- whether the branch has an upstream
- ahead/behind
- whether the HEAD is reachable from a remote ref
- whether the HEAD is an ancestor of the final product candidate
- disk footprint where practical

Classify every worktree as:

KEEP_CANONICAL
KEEP_ACTIVE_OTHER_SCOPE
REMOVE_SAFE
BLOCKED_DIRTY
BLOCKED_UNPUSHED
BLOCKED_UNRESOLVED

The new final-promotion worktree must be kept.

Do not remove:
- a dirty worktree;
- a worktree with untracked content;
- a worktree whose HEAD is not safely reachable from a verified remote/archive ref;
- a worktree used by another clearly active FleetSplice scope.

For REMOVE_SAFE:
1. prove clean state;
2. prove exact HEAD preservation;
3. archive/verify the branch when needed;
4. remove with normal git worktree remove, without --force;
5. verify the path registration disappears.

After removals:
- run git worktree prune --dry-run;
- review output;
- run normal git worktree prune only for stale administrative records;
- do not delete arbitrary directories that are not registered worktrees.

Write BEFORE and AFTER manifests.

## PROMO-02 — full branch audit and archive namespace

Audit:
- local branches;
- origin branches;
- upstream status;
- exact SHAs;
- merged/ancestor relation to BASE_PRODUCT_HEAD;
- open PR association if available;
- active worktree ownership;
- unique/unmerged commits.

Archive obsolete historical G05/G05A/G05B/G05C implementation, docs, fix and
train branches under:

archive/2026-09/g05c/<original-branch-name>

Examples:
archive/2026-09/g05c/feat/g05c-p3-approval-control
archive/2026-09/g05c/train/g05c-ux-r2-density-semantics-001

The exact original branch name may remain nested under the archive prefix.

SAFE ARCHIVE PROCEDURE:

For each branch selected for archival:
1. record original ref + exact SHA;
2. ensure no open PR needs the original branch;
3. ensure no dirty worktree depends on the branch;
4. create remote archive ref pointing to the exact same SHA;
5. verify archive ref with git ls-remote / fetch;
6. only then delete the obsolete original remote ref if classification says ARCHIVE;
7. remove the obsolete local branch only after its worktree is gone and the
   exact SHA is preserved remotely.

Never force-update archive refs.

Do not archive/delete automatically:
- main;
- the current final-promotion branch;
- branches clearly active in another ongoing scope;
- a branch with unpushed/local-only commits;
- a branch with ambiguous provenance.

Planning/research branches outside the G05/G05C implementation family should be
audited and reported, but not automatically archived unless their purpose is
unambiguously superseded and their exact history is preserved.

Produce:
BRANCH-AUDIT-BEFORE.json/md
BRANCH-ARCHIVE-MAP.json/md
BRANCH-AUDIT-AFTER.json/md

## PROMO-03 — canonical status reconciliation

Reconcile current status documents with the actual final local product.

Update at minimum:
- docs/train/current-status.md
- README.md
- AGENTS.md
- docs/v0.1/implementation-roadmap.md
- goals/train-manifest.v1.json, but only in a schema-consistent way

The canonical product implementation baseline is:

G05C_FINAL_PRODUCT_IMPLEMENTATION_HEAD=
017a89472436702a9f6228bf680a3674bb0a2d32

Do not create a self-referential attempt to store the future promotion commit as
the implementation head.

Required status semantics:

ARCHITECTURE_0_1_READY=true
G05C_FINAL_PRODUCT_BASELINE_READY=true
PRIMARY_NATIVE_PATH=NATIVE_ADOPTED
NEAR_TERM_UI_UX_DEVELOPMENT=FROZEN
NEXT_DEVELOPMENT_CLASS=FUNCTIONAL_PRODUCT_WORK

G06_STARTED=false
TENCENT_DEPLOYMENT_GATE=DEFERRED_SERVER_NOT_READY
TENCENT_TARGET=tencent-pek-01
REMOTE_TENCENT_WORK=false

The roadmap must no longer say that G06 first implements the mobile UI. It should
state that G06 reuses the already-proven responsive Web/mobile surface and
validates it on the real remote topology.

Do not mark G06 PASS or started.

If train-manifest.v1.json cannot truthfully represent the current state without a
schema extension, make the smallest additive schema-compatible correction and
document it. Do not leave active_goal=G04A / g05_started=false if those fields are
normative current-state fields.

## PROMO-04 — promotion acceptance packet

Run the final full validation once:

- npm run check
- npm run build
- npm run tokens:check
- npm test
- npm run accept:native-browser
- npm run accept:ux-browser

If a preserved qualified managed Codex artifact is locally available without
mutating Owner Codex, run that lane once. Otherwise record the historical
environment debt honestly.

Generate:

V:\artifacts\FleetSplice\FLEETSPLICE-G05C-FINAL-PROMOTION-001\
  FINAL-RECEIPT.txt
  FINAL-ACCEPTANCE.json
  WORKTREE-AUDIT-BEFORE.json
  WORKTREE-AUDIT-AFTER.json
  BRANCH-AUDIT-BEFORE.json
  BRANCH-ARCHIVE-MAP.json
  BRANCH-AUDIT-AFTER.json
  CLEANUP-RECEIPT.md
  G05C-FINAL-PROMOTION-DECISION-PACKET.md

The decision packet must clearly state:
- what was removed locally;
- what was archived remotely;
- what was intentionally kept;
- any blocked dirty/unpushed worktree;
- final branch inventory;
- canonical G05C product head;
- exact remaining local/product debts;
- next recommended functional Goal class.

## Safety / Git rules

- no force push;
- no reset --hard;
- no clean -fdx;
- no deletion of dirty/untracked worktrees;
- no deletion of unique history;
- no main merge;
- no G06 implementation;
- no Tencent access/deployment;
- no DNS/auth/certificate mutation;
- no Codex install/update/restart merely to make tests green.

## Expected return

DISPOSITION=PASS_G05C_FINAL_PROMOTION_READY_FOR_INDEPENDENT_REVIEW
BASE_PRODUCT_HEAD=017a89472436702a9f6228bf680a3674bb0a2d32
FINAL_HEAD=

WORKTREE_AUDIT=PASS
WORKTREES_REMOVED=
WORKTREES_KEPT=
WORKTREES_BLOCKED=

BRANCH_AUDIT=PASS
BRANCHES_ARCHIVED=
BRANCHES_KEPT=
BRANCHES_BLOCKED=
ARCHIVE_NAMESPACE=archive/2026-09/g05c/

STATUS_RECONCILIATION=PASS
MANIFEST_RECONCILIATION=PASS
ROADMAP_RECONCILIATION=PASS

CHECK=
BUILD=
TOKENS_CHECK=
FULL_TESTS=
ACCEPT_NATIVE_BROWSER=
ACCEPT_UX_BROWSER=
PRESERVED_MANAGED_ARTIFACT=

G05C_FINAL_PRODUCT_IMPLEMENTATION_HEAD=017a89472436702a9f6228bf680a3674bb0a2d32
NEAR_TERM_UI_UX_DEVELOPMENT=FROZEN
NEXT_DEVELOPMENT_CLASS=FUNCTIONAL_PRODUCT_WORK

G06_STARTED=false
TENCENT_DEPLOYMENT_GATE=DEFERRED_SERVER_NOT_READY
REMOTE_TENCENT_WORK=false
MERGED_MAIN=false

INDEPENDENT_REVIEW_REQUIRED=true

Then STOP.
