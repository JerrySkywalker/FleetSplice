# Architecture Constitution

These principles are the strongest current design constraints. Research may propose amendments, but implementation must not silently violate them.

1. **Global intent belongs to the Control Plane.** Fleet catalog, logical-session intent, desired operations, and global metadata have one central authority.
2. **Actual execution belongs to the Host Runtime.** Processes, filesystems, worktrees, native sessions, and observed runtime state are host-owned facts.
3. **Logical Session is not Native Session.** Vendor thread IDs and processes are segments of a larger user-facing work history.
4. **Agent is not Inference Provider.** A coding-agent implementation and the service/model used for inference are different resources.
5. **Execution Host is not Inference Host.** A Codex process on one machine may use inference served by another machine or a cloud service.
6. **Workspace precedes Agent Session.** Session placement is anchored to an admitted workspace/worktree and environment, not an unstructured cwd string.
7. **Remote commands are idempotent and generation-bound.** Retries must not create duplicate effects or mutate stale identities.
8. **Capability negotiation beats product/version assumptions.** UI and orchestration should consume declared behavior rather than grow a matrix of hard-coded agent versions.
9. **Transport is replaceable and below product semantics.** WebSocket, WireGuard, relay, direct channels, or later transports must not define session meaning.
10. **Hub failure must not terminate running development sessions.** Edge execution must survive central-control interruption and reconcile later.
11. **Stable N develops N+1; the trusted core is not self-rewritten in place.** Self-iteration remains repository/test/review/update work, not unrestricted live mutation.
12. **Coordination/orchestration is an external consumer.** FleetSplice provides execution primitives; higher-level DAG/Goal/WorkOrder semantics stay outside the fleet core.

A future ADR should document any accepted change to these principles.
