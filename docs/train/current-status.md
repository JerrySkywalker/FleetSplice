# Current FleetSplice development status

The bounded [D0 long-session correction](../../goals/FLEETSPLICE-G05C-D0-LONG-SESSION-R2-003.md)
adds explicit ClientGrant/controller renewal and durable native-command evidence
with bounded recent activity. Typecheck/build and 134 tests passed. Real local
smoke retained the same ordinary TUI thread across Web renewal, more than 64
terminal commands, interrupted residual drain and return to TUI. Browser timers
were accelerated for renewal; this is not a wall-clock soak. The candidate on
`fix/g05c-d0-long-session-r2` requires its separate exact-head read-only review;
that receipt and final Git identity remain in the external Goal directory.
P3 and G06 remain unstarted; no merge is authorized. See the
[additive contract](../architecture/amendments/g05c-d0-long-session-continuity.md).

The Owner reports successful personal D0 dogfood and authorizes only the three
UX corrections in [FLEETSPLICE-G05C-D0-DOGFOOD-UX-R1-002](../../goals/FLEETSPLICE-G05C-D0-DOGFOOD-UX-R1-002.md):
exact message-source badges, native turn timing/lifecycle, and residual-command
drain. The candidate remains on `fix/g05c-d0-dogfood-ux-r1`; its exact acceptance
and separate review receipts are retained in the external Goal directory.
The Windows popup is native code-mode-host owned; no FleetSplice shell
workaround was added. P3 and G06 remain unstarted and unauthorized.

This file is the current train-status pointer. Historical goal receipts and
accepted status files remain evidence and are not rewritten by this summary.

The later Owner Goal `FLEETSPLICE-G05C-D0-NATIVE-ADOPTION-HUMAN-DEMO-001`
authorizes a local native adoption demo from accepted P1/P2A/P2B. Its candidate
is on `feat/g05c-native-adoption-demo`. The visible local sequence and subsequent
review corrections are recorded in its Goal and external acceptance evidence.
Owner personal dogfood is not claimed. See [the demo guide](native-adoption-demo.md) and
[the additive native adoption contract](../architecture/native-adoption-d0.md).
The new adoption path is capability-driven. P3 and G06 remain unstarted.

The later Owner decision `FLEETSPLICE-G05C-P2B-PATH-A-RESUME-003` selects
session-scoped permissions and treats native project trust as a separate
prerequisite. P2B raw proof and real product stages passed in the already-trusted
disposable fixture with byte-identical persistent config and unchanged source
during dogfood. READ_ONLY, Workspace Auto file/test work and bounded YOLO outside
the Workspace were observed; stop was CLOSED/SAFE_TERMINAL with native exit and
Host ceiling restored to READ_ONLY. The exact candidate's fresh independent
review and final Git identity are recorded in the external Goal receipt under
`V:\artifacts\FleetSplice\FLEETSPLICE-G05C-P2B-PATH-A-RESUME-003`.
P3 and G06 remain unstarted and unauthorized. The older chronological entries
below retain their historical review/stop state and do not override this update.

```text
ARCHITECTURE_0_1_READY=true
LAST_ACCEPTED_TRAIN_HEAD=dabde5d60f211c4a16075443901ab3465ee16b2c
LAST_ACCEPTED_TRAIN_TREE=f1242113d28486b64f24f348b04a16456adb09aa
G05B_R1_CORRECTED_PRODUCT_HEAD=233af340945ed0ec4fa18c13458e12f33235f85d
G05B_R1_CORRECTED_PRODUCT_TREE=8480ee17d3dc4a4644ac2648b38a5c9f2c9c30da
G05B_R1_VALIDATED_CANDIDATE_HEAD=39ccf9d7113df97c6e937e5b332c729e90328dfe
G05B_R1_VALIDATED_CANDIDATE_TREE=ccbf5f8dff5cf2a5cb3d08c0112c36a2b9df00f1
G05_PASS=true
G05A_PASS=true
G05B_PASS=true
G05B_R1_PASS=true
G05C_PLANNED=true
G05C_STARTED=true
G05C_P1_AUTHORIZED=true
G05C_P1_STATUS=PASS_G05C_P1_LIVE_CAPABILITY_READONLY_CODING
G05C_P1_ACCEPTED_HEAD=be95b9f7796f432ba339bce6d8ddcbcfabb6f909
G05C_P1_ACCEPTED_TREE=430b02cb6ae4dac7ad2b27c2f55d638f11309642
G05C_P2_STARTED=true
G05C_P2A_STATUS=PASS_G05C_P2A_WORKSPACE_TARGETING
G05C_P2A_ACCEPTED_HEAD=1a1ab9b7ffd5e768d26a9bf95d7ed0f9378d1f70
G05C_P2A_ACCEPTED_TREE=6754673e5358d26ee96422112c2ac7822b2c6f0b
G05C_P2B_STARTED=true
G05C_P2B_STATUS=PATH_A_PROOF_COMPLETE_REVIEW_RECEIPT_EXTERNAL
G05C_ACCEPTED=false
G05C_P3_STARTED=false
G06_STARTED=false
IMPLEMENTATION_AUTHORIZED=G05C_P2B_ONLY
PRODUCT_IMPLEMENTATION_AUTHORIZED=G05C_P2B_ONLY
CURRENT_CHANGE_CLASS=G05C_P2B_PATH_A_CANDIDATE
NEXT_PLANNED_GOAL=G05C_NATIVE_AGENT_CONTROL_PARITY
```

The Owner has personally dogfooded the post-G05B-R1 local lifecycle: persistent
FleetSplice proxy configuration, fresh-shell start, detached Supervisor/Hub/Edge
and native Codex runtime, second-shell status, clean stop, and `SAFE_TERMINAL`.
The additive correction evidence is recorded in
[G05B-R1-persistent-proxy.md](receipts/G05B-R1-persistent-proxy.md).

The current product boundary is [Owner Thesis and Product Boundary](../product/owner-thesis.md).
That boundary narrows the next planned local step to native-agent control parity
and explicitly keeps G06 remote deployment unstarted.

The later Owner authorization
`FLEETSPLICE-G05C-NIGHT-TRAIN-20260909-001` admits local G05C only, in serial
P1, P2A, P2B, P3 and closeout stations. Each successor requires the preceding
station's independent PASS. P2B/P3 remain unstarted. G06, Tencent,
remote networking, phone UI, second Host, embedded terminal, editor, Git IDE,
worktree manager, provider migration and merges remain unauthorized.

P1 real-browser acceptance on 2026-09-09 used the live native catalog and
requested/observed `gpt-6-astra / low`, completed two turns on one thread,
and projected seven completed native read-only command lifecycles without
rejected observations. All 199 tracked/untracked source file hashes and Git
diff/status fingerprints matched before and after. Run
`69d2fb2c-fe45-4ba3-8926-33aef02556aa` stopped normally with proven native exit,
sound guard/admission, intact journals and `SAFE_TERMINAL`. Historical retired
runs remain UNKNOWN. This is a review candidate, not independent acceptance.
Sanitized evidence is outside Git under the train's `V:\artifacts\FleetSplice`
directory. No G06 implementation has begun.

Independent review of candidate `c83f55f699871173e70a75a1d4dd991f762a6f58`
returned five findings. The bounded correction handles correlated reasoning
notifications, durable lane-less capability failures, immutable existing-thread
configuration, complete bounded catalog pagination, and invalidation of effective
configuration after a native model reroute. A raw pinned-native probe observed
six catalog pages and a completed `ultra` read-only turn; reasoning deltas and
rerouting were not emitted by that probe and are schema/fixture-qualified only.

The corrected real-browser run `2829cafc-8040-4de3-81e7-fcaca9d71d4a` completed
two turns on one native thread with requested/observed `gpt-6-astra / ultra`.
Changing the new-session reasoning selection did not change the existing
thread's configuration. Its 200-file pre/post fingerprints matched exactly;
normal stop proved native exit and `SAFE_TERMINAL`. Seventy-five tests passed.
Fresh independent review of the correction is still required. The train has
used one protocol repair loop and zero runtime retirements. P2A remains gated.

The fresh P1 correction review returned
`PASS_G05C_P1_LIVE_CAPABILITY_READONLY_CODING` with zero unresolved findings
at the exact accepted head/tree above. Its receipt remains in the external
night-train evidence directory as `p1-review-2-final.md`.

P2A now provides a bounded per-user registry of explicitly registered existing
roots, new-session Workspace selection, immutable per-session root/target
binding, and per-root native configuration checks. It does not own repositories,
worktrees or branches. The real run `a9c88cd5-f695-4834-8a02-3b52ae543ed6`
completed two read-only turns in the disposable Workspace A and a third turn
in FleetSplice source, using two distinct native threads in one managed process.
Changing the new-session selection preserved the existing fixture thread.
All 202 source-file/Git fingerprints and fixture-file hashes matched; clean
stop proved native exit, intact journals and `SAFE_TERMINAL`. Seventy-nine
tests passed before live acceptance. P2A awaits fresh independent review;
P2B and P3 have not started, and no write permission has been added.

The first P2A review at `71278c0817c8af9bc158c2d4d770d5a66523ff3c`
returned two registry findings. The correction preserves an explicit null
selection after removal even when another root is added, and rejects canonical
roots longer than 1,024 characters before publication. Regression tests cover
both empty and nonempty registries after removal, and prove byte preservation
after a real overlong-root rejection. Fresh exact-head review remains required.

The fresh P2A correction review accepted head
`1a1ab9b7ffd5e768d26a9bf95d7ed0f9378d1f70`, tree
`6754673e5358d26ee96422112c2ac7822b2c6f0b`, with zero unresolved findings
and 81 passing tests (`p2a-review-2-final.md`, external artifacts).

The night train then entered P2B on `feat/g05c-p2b-permission-write-yolo`.
Its uncommitted implementation projects native permission profiles, a local
Host ceiling, separate requested/effective permission evidence and bounded
file-change activity. Eighty-six tests passed before live acceptance.
Native schema/configuration probes observed all three profiles and exact
workspace-write/danger-full-access mappings. A separate raw disposable write
probe changed its two designated files; its test command failed, so it is not
test-pass acceptance evidence.

Real product run `5d35b881-f3cd-4c8d-8f8f-07d8adca4fc2` completed its
read-only fixture turn. It created a Workspace Auto thread with proven native
permission, then failed the next dispatch at `NATIVE_CONFIG_CHANGED`. No write
turn was accepted. All 206 source-file/Git fingerprints matched. Normal stop
returned `UNKNOWN_CLOSURE`, not SAFE_TERMINAL. Subsequent read-only proof found
exact native exit, zero live conflicts, sound guard/admission, intact SQLite
journals and `EFFECT_EVIDENCE_UNBOUND`. The exact run alone is admitted to the
Owner-authorized narrow retirement rule; its effect outcome must remain UNKNOWN.

Two configuration-only raw probes did not reproduce the config-stamp change.
The original driver retains only the full config/origins stamp, so its changed
field and cause are unproven. The train stops rather than relax that integrity
gate or reissue the command. P2B is not accepted or pushed; P3 and G06 never
started. Preserved work requires an Owner-reviewed bounded investigation before
any further product run. No G05C closeout or G06 readiness claim is made.

Stop custody completed through the normal `retire-stale --run ...
--ack-unknown-effect` entrypoint after the unchanged narrow predicates passed.
The run is `RETIRED_UNPROVABLE`, its old effect remains UNKNOWN, replay is false,
and this train has used one of its two authorized retirement slots. Final
status is STOPPED, not SAFE_TERMINAL for this run. The train's Host ceiling was
reduced back to READ_ONLY. Final check/build and 87 tests pass, but neither those
tests nor retirement qualify P2B or G05C acceptance. All historical receipts and
the dirty P2B patch remain preserved; no branch was merged or deleted.
