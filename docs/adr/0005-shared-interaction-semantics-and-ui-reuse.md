# ADR-0005: Shared WebUI/TUI semantics and UI reuse

- Status: Proposed
- Baseline: [Architecture Baseline 0.1 DRAFT](../architecture/baseline-0.1.md)
- `IMPLEMENTATION_AUTHORIZED=false`

## Context

FleetSplice needs one first-party browser surface now and a first-party remote
TUI later without creating two control models. Donor libraries can render
conversation or workspace elements but do not understand Fleet authority,
history, continuity, ambiguity, or reconnect evidence.

## Proposed decision

1. The primary v0.x client is a Fleet-owned React/TypeScript/Vite WebUI with
   Fleet navigation, Session core, and Control context.
2. A future first-party TUI is another renderer of the same resources,
   projections, receipts, events/history, view models, typed FleetCommands,
   grants, control epochs, approval revisions, continuity labels, and reconnect
   behavior. It owns a distinct `clientInstanceId` and no parallel protocol.
3. Fleet IDs, cursors, history, blobs, receipts, authority, and state are
   canonical. Donor caches and component message/thread IDs are disposable.
4. Public assistant-ui packages are the leading conversation/tool/approval
   candidate behind a Fleet external-store adapter, subject to a synthetic
   browser qualification. A minimal Fleet renderer is the fallback if donor
   integration delays the walking skeleton.
5. OpenHands is limited to exact, provenance-reviewed leaf patterns/files after
   replacing its data/auth/path layer. Do not depend on private
   `@assistant-ui/ui`, full Agent Canvas/backend, or its terminal state model.
6. Operational state is textual and inspectable: online/stale/unknown,
   viewer/controller/takeover, command/effect lifecycle, continuity,
   compatibility, provider transition, and ambiguity cannot rely only on color.
7. G05/M0 is a **single-host SKYFORGE-01 walking skeleton**. G06 adds the
   two-host minimum Fleet loop. The minimum-useful two-host v0.1 product is not
   accepted until G10 completes its control, durability, recovery, security,
   update, storage, and UI gates.

## Consequences

- Every UI mutation is a FleetCommand; approvals show exact target, offered
  decisions, revision/action digest, and privilege/Environment.
- Provider migration is a review/confirmation surface, never a silent switch.
- Long history uses Fleet cursor/watermark/blob/reconnect mechanics rather than
  mounting donor state as durable authority.
- Browser runtime qualification must cover slow streaming, tool/approval-heavy
  histories, 10k-row virtualization, prepend/anchors, reconnect, blob auth,
  lane/tab isolation, accessibility, and hostile output.

## Evidence

- [Interaction model](../architecture/webui-model.md)
- [Interaction wireframes](../architecture/webui-wireframes.md)
- [Wave-01 WebUI reuse](../research/wave-01/webui-reuse.md)
- [Wave-02 WebUI spike](../research/wave-02/webui-spike.md)
- [Full development train roadmap](../roadmap/full-development-train.md)

## Acceptance gate

This ADR remains Proposed until G02 exact-head review and G03 owner acceptance.
UI implementation and donor selection additionally require exact-head G04 PASS
and the named browser/provenance gates.
