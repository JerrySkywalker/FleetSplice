# First Owner-experience startup repair Goal

Goal: `FLEETSPLICE-ZENBOOK14-FIRST-OWNER-EXPERIENCE-REPAIR-TRAIN-001`.
Base: `train/pre-gate-s-development-001` at `8f9a8f2045a706013a66c1b0827da6f310e08178` (PR #14 merged).
Accepted implementation architecture: [baseline 0.1](../architecture/baseline-0.1.md), `ARCHITECTURE_0_1_READY=true`; portable supervised-native custody: [ADR 0008](../adr/0008-portable-shared-native-server-custody.md).

The first Owner-attended ZenBook14 Desktop start failed with `PRECHECK_FAILED / LOCAL_ABSOLUTE_ROOT_REQUIRED` after the Owner entered an existing absolute workspace. This Goal corrects only that first-use installed-product startup contract. The local receipt and proposal in `C:\Dev\artifacts\FleetSplice\FLEETSPLICE-PORTABLE-HOST-RUNTIME-TRAIN-001` are evidence, not proof of a particular cause.

Sequence: reconcile the historical P05 runtime without an unsafe kill; reproduce the Desktop-to-bundled-CLI path and prove root cause; make a minimal identity-preserving correction; cover first-use registration, selection, cwd, invalid-root, and explicit-root boundaries; qualify source and installed Desktop on the disposable Owner-experience workspace; obtain independent exact-head read-only review; merge one PR **only** into the train branch; package/install and retest exact merged head; prepare an E1 resume handoff.

Stop without implementation if predecessor effects/identity are ambiguous or the startup cause cannot be proven. Stop without merge if regression or independent review blocks. Stop without an Owner handoff if installed retest fails. Never send an Owner prompt, perform the manual experience, contact Tencent/SKYFORGE/Casdoor, change Codex or Windows power/security policy, start G07, or merge main.
