# Open Architecture Questions

These questions must remain visible until research produces an accepted answer.

## Product/fleet semantics

- Is `Host -> Environment -> Workspace/Worktree -> AgentRuntime -> NativeSession` the right hierarchy, or should AgentRuntime attach differently?
- Which host/environment facts are durable identity versus dynamic capability?
- What is the minimum useful fleet scale and what assumptions break above it?
- How much workspace discovery should be automatic versus explicitly registered?

## Control and failure semantics

- What is the exact command/idempotency/generation model?
- How are stale hosts, reenrollment, host replacement, and tombstones handled?
- What durable state must live on Edge Runtime versus Hub?
- How should in-flight approvals/turns behave through disconnect/reconnect?
- Is a single outbound WebSocket-like channel sufficient for v0.1, and what data eventually needs a direct channel?

## Agent integration

- Which Codex app-server surfaces are stable enough for a native driver?
- What provider/model changes can Codex actually perform in place versus only by new thread/segment?
- Which agents are sufficiently covered by ACP today, and which capabilities require native adapters?
- Can T3 Code/OpenHands accelerate coverage without importing their execution-boundary assumptions?
- What is the long-term driver packaging/version-negotiation model?

## Logical sessions/history

- Is LogicalSession the correct top-level user unit when multiple native segments or subagents run concurrently?
- What normalized event schema is both useful and not overfitted to Codex?
- Which raw native events should be preserved, normalized, referenced, or discarded?
- How should checkpoints be generated, versioned, edited, and audited?
- What makes a HandoffCapsule sufficient for cross-provider or cross-agent continuation?
- What storage/index architecture supports very long histories without overengineering v0.1?

## Inference plane

- Where do provider credentials live for local and cloud profiles?
- Should FleetSplice call inference gateways directly, or only configure agent-native provider bindings?
- How are local inference resources discovered and advertised without making FleetSplice a model scheduler?
- Which failover transitions can be safely automated, suggested, or manual-only?

## WebUI

- Which assistant-ui/OpenHands/T3 components can be reused cleanly under MIT/provenance rules?
- What common event/capability model supports a unified UI without lowest-common-denominator UX?
- How are agent-specific extension renderers trusted and distributed?
- How should huge timelines, terminal output, diffs, checkpoints, and segment boundaries be presented?

## Windows and security

- Should Edge Runtime be a user process, service plus user companion, scheduled task, or another topology on Windows?
- How are user/admin/WSL environments controlled without confusing privilege authority?
- How are native credentials shared or isolated without duplicating full agent homes and creating token conflicts?
- What threat model applies when coding agents can request filesystem/terminal actions through a remote WebUI?

## Coordination Loop and self-iteration

- What exact FleetSplice API should CLF consume?
- How do CLF claims/receipts coexist with FleetSplice command generations without duplicate locking systems?
- How does stable FleetSplice N safely orchestrate development and canary deployment of N+1?
- Which extension points may be dynamic, and what remains part of the trusted non-hot-mutable kernel?

## Technology and licensing

- Which language/runtime best fits the Windows Edge Runtime and shared protocol contracts?
- Which database/storage choices remain simple while satisfying offline journal/history requirements?
- Which permissive donors are worth source-level reuse versus design-only study?
- What exact attribution/provenance process is sufficient for an MIT project with multiple upstream donors?
