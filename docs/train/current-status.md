# Current FleetSplice development status

This file is the current train-status pointer. Historical goal receipts and
accepted status files remain evidence and are not rewritten by this summary.

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
G05C_P2A_STATUS=LIVE_ACCEPTANCE_PASSED_PENDING_INDEPENDENT_REVIEW
G05C_P2B_STARTED=false
G05C_P3_STARTED=false
G06_STARTED=false
IMPLEMENTATION_AUTHORIZED=G05C_LOCAL_CONTROL_PARITY_ONLY_SERIAL_STATIONS
PRODUCT_IMPLEMENTATION_AUTHORIZED=G05C_LOCAL_CONTROL_PARITY_ONLY_SERIAL_STATIONS
CURRENT_CHANGE_CLASS=G05C_P2A_WORKSPACE_TARGETING
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
