# FleetSplice Windows native-daemon containment audit 001 — R3 source-backed quiescence resume

Owner authorization: **LOCAL_RESEARCH_AND_AUDIT_ONLY**.

This Goal resumes the parent audit after R2 proved the independent auditor path but stopped because target-daemon quiescence was treated as unproven even though `thread/loaded/list` returned no loaded threads. The parent Goal, R1 and R2 remain authoritative except where this R3 refines the quiescence proof contract. No product implementation or G06 is authorized.

## 0. Preserve prior attempts

Do not rewrite any prior blocked report. Preserve the R2 result under a new additive directory such as:

```text
ATTEMPT-0003-R2\
```

Retain its final report/receipt and SHA-256 values. The recorded first-action ordering deviation remains evidence; it does not by itself invalidate the successful R0 ancestry proof.

## 1. Re-prove independent auditor admission

Start from the current research branch and use the checked-in launcher. As the first harmless tool action of this resumed audit, execute:

```powershell
.\scripts\audit\verify-independent-auditor-context.ps1
```

Require:

```text
AUDITOR_MODE=INDEPENDENT_EXEC_SERVER
EXECUTOR_IN_ANCESTOR_CHAIN=True
TARGET_DAEMON_IS_AUDITOR_ANCESTOR=False
ADMISSION_RESULT=PASS
```

If R0 cannot be re-established, stop with `BLOCKED_INDEPENDENT_AUDITOR_UNAVAILABLE` and do not mutate target daemon lifecycle.

## 2. Quiescence must be source-backed against the installed Codex release

The installed binary at the previous attempt was `codex-cli 0.154.0` with SHA-256
`be96b992178b1e467c225800da0d65f2c86d5eba1ef0b14632f65db381cbdfde`.
Do not assume that remains true; record the current version/hash first.

If the binary is still 0.154.0, independently verify the upstream release mapping:

```text
refs/tags/rust-v0.154.0
  -> annotated tag object
  -> release commit 6b9826e3aa83b1a5947db50f4332cb9c65f1b340
```

If the installed version differs, resolve the exact matching upstream release tag/commit before using source-derived invariants.

At the exact installed-release source, inspect and cite the implementation of at least:

```text
codex-rs/app-server-protocol/src/protocol/v2/thread.rs
codex-rs/app-server-protocol/src/protocol/common.rs
codex-rs/app-server/src/outgoing_message.rs
codex-rs/app-server/src/bespoke_event_handling.rs
```

The audit must determine, from that exact release source rather than current `main`, whether all Agent-turn interactive requests that matter to this gate are necessarily thread-scoped and cannot survive without a loaded/running thread.

For 0.154.0 specifically, verify rather than merely trust these expected source facts:

1. `thread/loaded/list` returns thread ids for sessions **currently loaded in memory**.
2. `ThreadScopedOutgoingMessageSender::send_request` stores/sends the request with `Some(self.thread_id)`.
3. command execution approval, file-change approval, MCP elicitation, permission approval and tool-user-input paths used by Agent turns flow through the thread-scoped outgoing sender.
4. the turn lifecycle states that **all per-thread requests are bound to a turn**, and pending per-thread server requests are aborted on turn completion/transition.
5. no release-0.154.0 Agent-turn approval path relevant to daemon shutdown is found that may remain pending while the associated thread is absent from `thread/loaded/list`.

Do not generalize this conclusion to global account/user-verification ceremonies unless the source proves that separately. The admission gate is about **target Agent workload**: active turns and their unresolved interactive requests.

If source review contradicts any required invariant, stop with `BLOCKED_ADMISSION_OR_ACTIVE_NATIVE_STATE` (or a more specific evidence-backed blocked result) rather than weakening the gate.

## 3. Live quiescence proof

Only after the exact-release source contract is established, use a read-only client against the target official shared daemon and collect a stable empty-loaded-thread observation window.

Requirements:

- use `thread/loaded/list`, not persisted `thread/list`, as the primary live-memory signal;
- follow pagination until `nextCursor`/`next_cursor` is null for every sample;
- collect at least **5 complete samples spanning at least 5 seconds**;
- every sample must return zero loaded thread ids;
- record exact daemon PID, creation time, executable path/hash and canonical endpoint before the first sample and after the last sample;
- the daemon incarnation/endpoint must remain unchanged across the sample window;
- retain raw sanitized request/response evidence and timestamps;
- do not send `thread/start`, `thread/resume`, `turn/start`, approval responses, interrupt, steer or any other mutating/thread-loading method merely to prove quiescence.

If any sample contains a loaded thread, if pagination is incomplete, or if daemon incarnation changes, stop and do not mutate daemon lifecycle.

When both source and live gates pass, record explicitly:

```text
TARGET_AGENT_WORKLOAD_QUIESCENT=true
ACTIVE_NATIVE_TURN=PROVEN_ABSENT
PENDING_AGENT_TURN_APPROVAL_OR_ELICITATION=PROVEN_ABSENT_BY_RELEASE_INVARIANT_PLUS_EMPTY_LOADED_SET
GLOBAL_ACCOUNT_CEREMONIES=OUT_OF_SCOPE_NOT_CLAIMED
```

This is narrower and stronger than claiming the daemon has no possible pending request of any kind.

## 4. Continue the parent research train after quiescence PASS

Do not stop again solely because there is no separate public `pending approvals list` RPC if the exact-release source proof above demonstrates that the relevant Agent-turn requests require a loaded thread and the live loaded set is stably empty.

After quiescence PASS, continue the parent audit in order:

```text
RQ1  reconfirm current popup/process/window root cause
RQ2  reconstruct exact current official native topology
RQ3  qualify cross-session placement of the unmodified official daemon
RQ4  qualify same-user Medium-equivalent background-daemon token/placement
RQ5  re-run literal native same-thread late-attach + zero-window smoke
RQ6  cleanup, research report and strongest separate read-only review
```

All original safety rules remain. In particular:

- no model/tool turn may execute through a known High-integrity experimental target daemon;
- High S4U may be used only for fixed liveness/transport/identity probes until Medium-equivalent execution is proven;
- no HAPI-style private engine as product fix;
- no FleetSplice-owned terminal/runtime replacing literal `codex --yolo`;
- no PATH shim or patched Codex binary as the primary repair;
- no product code edits and no G06;
- every temporary task/process/socket must have exact cleanup evidence;
- never merge.

## 5. Avoid another audit-framework loop

This R3 authorizes bounded corrections under `scripts/audit/**`, `docs/research/**` and `goals/**` only when necessary to make evidence truthful. Do not create R4 merely for a wording or evidence-format issue that can be corrected safely inside this run. Stop only for a real safety/authority/evidence hard gate.

If the research reaches an evidence-backed repair path, finish with the parent Goal fields and `PASS_FIX_PATH_IDENTIFIED`, name the smallest next implementation Goal, and do not implement the repair in this research Goal.
