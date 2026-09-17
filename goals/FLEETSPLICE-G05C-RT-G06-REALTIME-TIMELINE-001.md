# G06 — realtime Agent Execution timeline

Parent train: `FLEETSPLICE-G05C-POST-DOGFOOD-REALTIME-UX-TRAIN-001`.
Dependency: `PASS_G05C_RT_G05_OPTIMISTIC_COMMAND_UX`.

## Objective

Render Agent Execution Stream events in realtime without reproducing provider CLI/TUI presentation.

## Required work

- Stream provider-neutral message deltas/finals, turn lifecycle and tool/activity lifecycle into the Web timeline.
- Codex mapping may consume structured native notifications such as turn/item/message events, but UI must render FleetSplice semantic items rather than raw Codex terminal text/ANSI.
- Conversation and tool activity remain one execution stream in Core; UI may present messages and tool cards differently.
- Live deltas are ephemeral presentation state. Durable authority remains completed/reconciled provider state plus Fleet receipts/evidence.
- Support provider capability absence: if an adapter lacks delta streaming, degrade to started/completed semantic updates rather than fabricate deltas.
- Keep bounded history and durable command-safety evidence independent from live presentation caches.
- Add deterministic stream tests for turn start, agent message delta/final, tool start/completion/failure, interrupt completion, duplicate/late events and final reconciliation.

## Non-goal

Do not implement Claude Code, Gemini CLI or OpenCode adapters in this train. The contract must merely allow them to be added later.

## Pass token

`PASS_G05C_RT_G06_REALTIME_TIMELINE`
