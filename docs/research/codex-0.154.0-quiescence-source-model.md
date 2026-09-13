# Codex 0.154.0 quiescence source model

Purpose: bounded research evidence for `FLEETSPLICE-WINDOWS-NATIVE-DAEMON-CONTAINMENT-AUDIT-001`. This note is not a product design decision and does not authorize daemon lifecycle mutation.

## Exact upstream release authority

The installed CLI under audit reports `0.154.0`. The upstream tag `rust-v0.154.0` resolves to release commit:

```text
6b9826e3aa83b1a5947db50f4332cb9c65f1b340
```

Use that exact commit when reasoning about target quiescence. Current upstream `main` is comparative evidence only.

Relevant exact-release files:

```text
codex-rs/app-server/src/thread_status.rs
codex-rs/app-server/src/request_processors/thread_processor.rs
codex-rs/app-server/src/request_processors/thread_lifecycle.rs
codex-rs/app-server/src/request_processors/thread_enrichment.rs
codex-rs/app-server/src/outgoing_message.rs
codex-rs/app-server-protocol/src/protocol/v2/thread_data.rs
```

## Corrected source observations

### 1. `thread/loaded/list` alone is insufficient

The prior R3 hypothesis was false. The archive/removal path removes a thread from the core `ThreadManager` before it waits for shutdown and before final app-server teardown. Therefore an empty loaded registry can exist temporarily while a removed thread is still draining and its app-server pending requests have not yet been cancelled.

Do not use `thread/loaded/list == []` by itself as proof of target quiescence.

### 2. App-server separately tracks runtime status and pending interactive requests

`ThreadWatchManager` keeps runtime facts independently of the core loaded registry. In 0.154.0 it tracks at least:

```text
running
pending_permission_requests
pending_user_input_requests
is_loaded
```

Pending permission/user-input guards make the thread status `Active` and expose active flags corresponding to waiting on approval or waiting on user input. A running turn also yields `Active`.

### 3. Thread list responses carry runtime status

The v2 `Thread` response model contains `status: ThreadStatus`.

`thread/list` obtains stored thread rows and then calls `enrich_loaded_threads(...)`. That enrichment consults `ThreadWatchManager.loaded_statuses_for_threads(...)` and overwrites the stored row's status when a watched runtime status exists.

This means a stored thread can remain observable through `thread/list` with its live app-server status even when it has already disappeared from the core loaded registry.

### 4. Archive ordering closes the specific loaded-list blind spot

For an active thread being archived, the exact-release ordering is materially:

```text
prepare_thread_for_archive
  -> prepare_thread_for_removal
       -> ThreadManager.remove_thread(thread_id)
       -> wait_for_thread_shutdown(...)   # bounded at 10 seconds
       -> finalize_thread_teardown(thread_id)
            -> cancel_requests_for_thread(...)
            -> remove app-server thread state/watch bookkeeping
  -> thread_store.archive_threads(...)
```

Therefore, during the known archive gap:

- the core loaded registry may already omit the thread;
- the thread has not yet been moved to archived storage;
- its stored unarchived row still exists;
- `thread/list` can still be enriched from `ThreadWatchManager` until final teardown removes that status;
- final teardown cancels thread-scoped pending requests before removing app-server thread-state/watch bookkeeping.

After final teardown, that particular pending-request hazard has been cancelled before the watched state disappears.

### 5. Idle automatic unload has a different, safer ordering

The no-subscriber idle-unload path cancels thread-scoped pending requests before shutdown/unload, and only removes the core thread after successful shutdown. Do not assume every removal path has this ordering; audit every path relevant to 0.154.0 before accepting a composite quiescence proof.

## Candidate composite quiescence proof — hypothesis to validate, not authority

A stronger candidate is to combine, with complete pagination and exact daemon-incarnation fencing:

```text
A. thread/loaded/list
B. thread/list archived=false
C. thread/list archived=true
D. thread/read for every currently loaded id when needed to resolve status/races
```

and reject quiescence if any observed thread status is `Active`, including active flags for approval or user input.

The candidate is acceptable only if the resumed auditor proves from the exact 0.154.0 source that **every path capable of hiding a thread from one inventory while preserving a live Agent-turn/pending approval is covered by another member of the composite inventory, or cancels the pending request before becoming invisible to all members**.

If any removal/archive/revert/unsubscribe/error path violates that coverage, stop. Do not weaken the gate merely to advance the experiment.

## Scope

The quiescence requirement is only:

```text
no active native Agent turn
no pending Agent-turn approval
no pending Agent-turn user-input/elicitation that daemon lifecycle would interrupt
```

Do not claim that unrelated global authentication/account ceremonies are absent unless separately observed and relevant to daemon lifecycle safety.
