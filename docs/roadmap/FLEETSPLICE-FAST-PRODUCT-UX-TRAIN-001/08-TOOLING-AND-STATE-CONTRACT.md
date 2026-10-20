# 08 — Offline FPX state and next-goal helper

A small **Node standard-library only** script is installed at `scripts/fpx-train.mjs`. It never launches Codex, changes Git or an existing worktree, calls the internet, mutates Native state, deploys production or writes a human Gate receipt. The only write is explicit `init`, creating a **new private** state JSON.

## Commands (PowerShell from repo root)

```powershell
node scripts/fpx-train.mjs verify

$state = 'C:\Dev\artifacts\fleetsplice\FLEETSPLICE-FAST-PRODUCT-UX-TRAIN-001\state.json'
node scripts/fpx-train.mjs init --state $state
node scripts/fpx-train.mjs next --state $state

node --test tests/fpx-train.test.mjs
```

The results are a recommendation of *which local source Goals are unblocked*, not a claim that a ChatGPT background agent is currently running. The implementer still reads the detailed Goal file and independently fetches latest GitHub SHA and receipts before writes.

## State rules

`state.json` is private, excluded from GitHub by location. \`goals[GOAL_ID]\` stores \`status\`, \`receipt\` and \`head_sha\`. A \`SOURCE_COMPLETE\` or \`ACCEPTED\` record is valid for downstream scheduling only if the referenced local JSON receipt exists and matches \`GOAL_ID\` and \`FINAL_HEAD\` (a real 40-character Git SHA). A fabricated status string without evidence is ignored.

\`gates[GATE_ID]\` stores a \`status\` plus local receipt file. For H0–H4, the referenced JSON needs \`GATE_ID\`, \`SOURCE_SHA\`, \`DISPOSITION=PASS_OWNER_OBSERVED\`, \`OWNER_EXECUTED=true\`, and \`OWNER_APPROVED=true\`; for Gate S use \`ADMITTED\`, for accepted G06–G09 Gate results use \`ACCEPTED\`. The script only checks receipt structure and local existence; it **cannot itself prove that a person attended or that a production service was deployed**. The Owner and independent test receipts remain authoritative.

After a completed source task, ChatGPT Desktop may write an accurate private receipt, update its \`state.json\` and run \`next\` again. Never auto-upgrade a Gate from \`OWNER_ACTION_REQUIRED\`. G06 \`SOURCE_COMPLETE\` will **not** enable G07; G06 must be \`ACCEPTED\` with H2 and explicit G06 Gate acceptance.

Default optional UX07 and V02 are deferred; editing the local enabled-optional array does **not** override their real human/phase prerequisites.

## Tool test / limits

Run \`node --test tests/fpx-train.test.mjs\` for DAG cycles, readiness, G06 gate sequencing and rejected fake human gate status. No full CI is needed for this docs/tool helper. It does not decide when a real server request or native effect is safe. User-facing orchestration remains a ChatGPT Desktop Codex foreground local session, not a scheduled or continuously running background task.
