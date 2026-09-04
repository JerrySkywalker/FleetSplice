# Safe Self-Iteration

## Objective

FleetSplice should eventually be capable of helping develop its successor versions without allowing an agent to rewrite the trusted running control/runtime core in place.

## Stable-N pattern

```text
stable FleetSplice N
        |
        v
agents develop N+1 in normal workspaces/worktrees
        |
        v
tests / architecture checks / evaluation / review
        |
        v
staging or canary update
        |
        v
accepted N+1
```

The running trusted version remains recoverable while candidate work is developed and evaluated.

## Trusted kernel hypothesis

A small set of functions should remain outside hot dynamic mutation: host identity, authentication, command journal/idempotency, generation/lease validation, secret boundaries, protocol validation, durable-state integrity, and update verification.

## Extensible perimeter

Agent drivers, inference adapters, context policies, compatibility backends, and trusted UI renderers are candidates for modular extension. Whether they are in-process plugins, separate processes, WASM modules, packages, or static build-time components remains a research question.

## DSH/Cordis research relevance

DeepSeek Harness and similar plugin-oriented harnesses should be studied for typed events, service/plugin lifecycle, runtime introspection, reversible effects, and per-session composition. FleetSplice should not assume that a harness plugin model is safe for fleet-control trusted state.

## Coordination Loop

A future Coordination Loop workflow may drive the N-to-N+1 development program, but update acceptance and runtime replacement still require explicit FleetSplice update/security semantics.
