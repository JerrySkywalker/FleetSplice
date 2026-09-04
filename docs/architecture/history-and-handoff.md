# History, Context, Checkpoints, and Handoff

## Two different problems

FleetSplice must separate durable history from model context. A WebUI may retain very long session history even when no model can consume that history in one request.

## Durable normalized timeline

Working model: append-oriented normalized events keyed to a logical session, with large raw outputs stored by reference/chunk rather than forcing every terminal log or diff into one message row.

Native agent history remains host/runtime-owned truth where the agent supports it. FleetSplice history is a normalized durable view, not a promise to reproduce private vendor state.

## Context tiers

Research should evaluate a layered context strategy:

- **hot** — recent relevant turns/events;
- **warm** — structured current checkpoint/session memory;
- **cold** — full older history, tool outputs, diffs, and attachments available through retrieval.

Retrieval should not rely only on embeddings. Coding work benefits from structured indexes, exact identifiers, full-text search, and semantic retrieval.

## Checkpoint

A checkpoint should be a structured object, not an arbitrary prose summary. Candidate fields include objective, plan, decisions, completed work, remaining work, blockers, workspace/branch/HEAD/dirty state, important files, test status, and relevant source-event references.

## Handoff Capsule

A handoff capsule carries the minimum durable work state needed to continue in a new native session, provider, agent, or host. It should not claim to transfer hidden reasoning, vendor-private state, or opaque authentication/session internals.

Candidate contents:

- objective and current plan;
- important decisions/constraints;
- completed and remaining work;
- workspace/worktree identity and Git state;
- changed/important files;
- tests and blockers;
- selected recent conversation/events;
- selected tool results;
- source native/logical session references.

## Open implementation questions

Storage engine, chunk/blob format, compression, indexing, retrieval policy, checkpoint triggers, privacy/redaction, retention, and maximum handoff size are all research topics, not frozen decisions.
