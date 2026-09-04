# FleetSplice Interaction Surface Model

## Status

- Scope: architecture / interaction model
- Applies to: first-party WebUI and any future first-party TUI
- Evidence basis: Architecture Baseline 0.0, Research Waves 01 and 02, including the FleetCommand, multi-client authority, WebUI reuse, and session/history findings
- `ARCHITECTURE_0_1_READY=false`
- `IMPLEMENTATION_AUTHORIZED=false`

This document defines the interaction model FleetSplice surfaces should preserve. It is not a pixel specification and does not authorize implementation. The companion [webui-wireframes.md](webui-wireframes.md) records reviewable character wireframes.

## 1. Product-surface thesis

FleetSplice is not primarily a chat page and is not intended to become a browser IDE.

The first-party interaction surface is a **Fleet shell + Session core + Control context**:

```text
Fleet shell
  Hosts / Environments / Workspaces / Sessions
            |
            v
Session core
  LogicalSession / SessionLane / NativeSegment
  conversation / tools / approvals / history
            |
            v
Control context
  controller / binding / provider / command / receipt / interrupt / checkpoint
```

The WebUI is the required first-party client for v0.1. A future TUI is an optional alternate renderer of the same Fleet semantics. CLI automation and other external clients are not part of the v0.1 UI requirement.

## 2. Shared WebUI/TUI contract

A future TUI must not invent a parallel product model. WebUI and TUI should consume the same Hub resources, projections, receipts, history, event stream, and typed FleetCommand families.

The surfaces differ only in presentation and input:

| Concern | WebUI | Future TUI |
| --- | --- | --- |
| navigation | sidebar, tabs, routes | pane tree, command palette, keybindings |
| session timeline | rich message/tool cards | dense event/message rows and expandable detail |
| approvals | inline card, attention panel, modal | focused approval pane/dialog |
| control actions | buttons/menus | keybindings/command palette |
| status | badges, icons, tooltips | textual state, symbols, status bar |
| files/diff | rich panels | terminal-native tree/diff panes |
| authoritative semantics | Fleet-owned | Fleet-owned |

A different renderer must not change the meaning of `RUNNING`, `STALE`, `UNKNOWN`, controller ownership, approval decisions, continuity labels, command outcomes, or provider migration.

### 2.1 Surface identity

Every interactive surface instance has its own `clientInstanceId`. Two browser tabs, a phone browser, a desktop TUI, and an automation process are distinct clients even when they authenticate as the same actor.

This is required by the one-controller-per-SessionLane model. A TUI must therefore participate in the same control epoch, takeover, viewer, approval, and reconnect rules as WebUI.

## 3. Mutation and observation boundary

The UI must preserve the Wave-02 boundary:

```text
mutation                         observation
--------                         -----------
FleetCommand                     typed resources
                                 FleetProjection
                                 FleetReceipt
                                 FleetEvent
                                 history pages / blobs
```

All first-party state-changing actions use FleetCommand. There is no privileged WebUI-only mutation path and no future TUI-only mutation path.

Examples:

- `Send` -> `turn.submit`
- `Steer` -> `turn.steer`
- `Interrupt` -> `turn.interrupt`
- `Allow once` / `Deny` -> `approval.resolve`
- `Take control` -> `sessionLane.takeover`
- `Checkpoint` -> `checkpoint.request`
- confirmed provider/host/agent transition -> `sessionLane.migrateBinding`

Read projections may be stale and must show freshness/confidence where it affects decisions. A projection never becomes authority merely because a UI displays it.

## 4. Canonical UI view models

The implementation should expose Fleet-owned view models between Hub state and concrete render components. Names below are architectural roles rather than frozen TypeScript identifiers.

### 4.1 `FleetNavigationModel`

Contains:

- Host list and state (`ONLINE`, `STALE`, `UNKNOWN`, later other defined states);
- Environment children and privilege/runtime identity;
- registered Workspace roots;
- recent/pinned LogicalSessions;
- pending approval count;
- search/history entry points.

### 4.2 `SessionHeaderModel`

Contains the currently selected:

- LogicalSession identity/title;
- SessionLane identity and purpose;
- current controller and control epoch;
- lane mutation revision;
- NativeSegment identity;
- Agent/Driver identity and compatibility state;
- execution Host/Environment/Workspace;
- provider/model/reasoning binding;
- continuity classification;
- current turn state.

### 4.3 `SessionTimelineModel`

Contains canonical Fleet timeline items derived from normalized history plus live events:

- user and assistant messages;
- tool lifecycle;
- approvals and their resolution;
- turn start/completion/interruption/ambiguity;
- checkpoints and handoffs;
- binding/provider transitions;
- warnings such as external native control or stale observation;
- optional links to native payload detail.

Token deltas and terminal bytes are projections. Canonical completed content, tool transitions, approvals, command receipts, and checkpoints remain backed by durable Fleet evidence.

### 4.4 `ControlContextModel`

Contains:

- controller/viewer status;
- command availability from authority and lane state;
- Host/Environment/Workspace binding;
- Agent/Driver compatibility;
- provider/model binding;
- active FleetCommand and Edge/native correlation summaries;
- pending approval summary;
- `Interrupt`, `Take control`, `Checkpoint`, and migration affordances only when valid.

### 4.5 `AttentionModel`

Collects events requiring user attention without redefining their authority:

- approval requested;
- ambiguous effect;
- provider degradation/migration proposal;
- control contested/takeover pending;
- stale/unknown Host or Environment affecting the active lane;
- compatibility qualification loss.

The same attention item may render as a right-rail item, modal, notification, or TUI focus request. The underlying identity and permitted decisions remain identical.

### 4.6 `WorkspaceSurfaceModel`

For later coding-workspace views:

- file tree and exact Workspace root;
- selected file/blob reference;
- diff/artifact references;
- Git/worktree observations;
- terminal identity and bounded stream;
- capability and freshness metadata.

This is a later surface. It must not turn FleetSplice into a general browser IDE or grant arbitrary filesystem access to UI components.

## 5. Primary information architecture

The desktop WebUI should default to three semantic regions:

```text
+--------------------+--------------------------------------+--------------------+
| Fleet navigation   | Session core                         | Control context    |
|                    |                                      |                    |
| Hosts              | LogicalSession / lane header         | binding            |
| Environments       | messages / tools / approvals         | controller         |
| Workspaces         | live turn / durable history          | provider           |
| Sessions           | composer                             | command actions    |
+--------------------+--------------------------------------+--------------------+
```

This is an information architecture, not a fixed pixel layout. Narrow screens may collapse sidebars into drawers/tabs. A TUI may implement the same regions as panes.

### 5.1 Left region: Fleet navigation

Purpose: answer **where can work run and what can I open?**

Minimum v0.1 content:

- Host and Environment hierarchy;
- registered Workspaces;
- LogicalSession navigation;
- pending approval indicator;
- online/stale/unknown state.

The hierarchy must not imply that Environments are interchangeable workers.

### 5.2 Center region: Session core

Purpose: answer **what work is happening and what did the Agent do?**

Minimum v0.1 content:

- selected LogicalSession/Lane identity;
- canonical conversation history;
- streaming assistant output;
- tool lifecycle events;
- approval events;
- input composer;
- explicit empty/idle/running/error/ambiguous states.

The UI must never present native thread identity as the LogicalSession identity.

### 5.3 Right region: Control context

Purpose: answer **who controls this lane, where is it bound, and what may I safely do now?**

Minimum content when relevant:

- execution Host / Environment / Workspace;
- Agent / Driver;
- provider/model;
- controller identity/control epoch;
- current turn/command summary;
- valid control actions;
- pending approvals and attention items.

The right region may collapse when no control context is relevant, but its information must remain reachable.

## 6. Required first-party views

The wireframes define eight views. For architecture purposes they group into these route/surface responsibilities:

1. **Session Workspace** - primary daily-use surface.
2. **Approval Attention** - focused decision surface.
3. **Provider Migration Review** - explicit, user-confirmed transition surface.
4. **Session Index** - fleet-wide LogicalSession browsing.
5. **Host / Environment / Workspace Explorer** - placement and registration surface.
6. **Coding Workspace** - later files/diff/Git/terminal surface.
7. **History / Checkpoint / Continuity Inspector** - audit and long-session surface.
8. **Compact Remote / TUI-equivalent Surface** - proves that the information architecture survives constrained rendering.

These are views over one product model, not separate subsystems.

## 7. v0.1 priority and vertical-slice rule

The architecture should not force all eight views to exist before FleetSplice becomes usable.

### P0 - minimum useful loop

Required for the first two-host daily-use loop:

- Session Workspace;
- basic Approval Attention;
- Session Index;
- Host / Environment / Workspace Explorer;
- shared connection/status presentation.

The first implementation milestone should be able to open the WebUI, select a registered Workspace on one of two Hosts, create/continue a LogicalSession, start native Codex, submit a prompt, receive streaming output, resolve a harmless approval, and preserve history across browser reopen.

### P1 - early daily-use hardening

- History / Checkpoint / Continuity Inspector;
- richer controller/takeover presentation;
- Provider Migration Review when provider migration is implemented.

### P2 - later workspace richness

- files/diff/Git/terminal Coding Workspace;
- richer Agent-native extension panels;
- future remote TUI.

No P1/P2 surface should block the first real Browser -> Hub -> Edge -> Codex -> Browser loop.

## 8. Technology direction

For the first-party WebUI, the current architecture direction is:

```text
Vite + React + TypeScript
```

Rationale:

- FleetSplice is an application/control console and does not require SSR/SEO for v0.x;
- Wave-02 research selected public assistant-ui React packages as the leading conversation candidate behind a Fleet-owned adapter;
- selective OpenHands React/TypeScript leaf/pattern reuse remains possible later;
- one TypeScript domain/toolchain can span WebUI, Hub contracts, Edge coordinator, and Agent drivers;
- Vite keeps the browser build and development model small.

This choice is not motivated by Open WebUI source reuse. FleetSplice should not adopt another product's frontend state authority.

### 8.1 UI reuse boundary

Preferred approach:

```text
Fleet canonical state
       |
Fleet projection adapter
       |
public assistant-ui primitives
       |
Fleet-owned shell and control surfaces
```

OpenHands may later supply selective file-tree or other leaf patterns/components after exact provenance and coupling review. The full Agent Canvas is not the FleetSplice shell.

If assistant-ui blocks the walking skeleton, a minimal Fleet-owned conversation renderer is acceptable. Donor integration must not delay the first real end-to-end session.

## 9. Visual/state language

A renderer may be visually expressive, but operational states must be explicit and not color-only.

Required distinctions include:

- `ONLINE` vs `STALE` vs `UNKNOWN`;
- viewer vs controller;
- current controller vs takeover pending;
- command accepted/admitted/effect-started/terminal where exposed;
- running vs interrupted vs lost vs ambiguous turn;
- native continuity vs reconstructed continuity vs related history vs unknown continuity;
- qualified vs qualified-with-limits vs unqualified/quarantined Agent binding;
- current provider vs migration candidate.

A future TUI should use stable textual labels/symbols for the same distinctions.

## 10. Approval model

Approval UI must preserve the complete normalized target needed for a safe decision:

- Session/Lane;
- Host/Environment;
- Workspace/cwd where relevant;
- tool/action identity;
- reason/context;
- exact offered decisions;
- approval revision/action digest;
- whether the decision is one-shot or persistent.

v0.x should prefer deny / allow-once until persistent native approval semantics are explicitly qualified.

Approval resolution does not require taking lane control when the actor has a separate approval grant. This enables a phone browser or future TUI to resolve an approval while another client remains the lane controller.

## 11. Provider migration model

Migration is never rendered as silent failover. The review surface must show:

- current execution and provider binding;
- proposed target binding;
- capability gains/losses;
- privacy/cost/residency annotations where available;
- checkpoint/handoff status;
- continuity classification;
- unresolved or ambiguous in-flight work;
- explicit confirmation.

A confirmed migration creates a new NativeSegment and usually reconstructed continuity. The UI must not visually splice the native identities into a false native-continuity claim.

## 12. Long history and continuity

The UI library is never the durable history authority.

FleetSplice supplies:

- stable Fleet event/message IDs;
- cursor pagination and snapshot watermarks;
- blob references/lazy loading;
- reconnect reconciliation;
- checkpoints;
- lane/segment/continuity boundaries;
- search anchors.

Rendering must remain correct when old blobs expire: retain the canonical event and a visible tombstone/reason rather than silently removing the historical action.

## 13. Responsive and remote behavior

### Desktop

Prefer the three-region layout with resizable/collapsible side regions.

### Phone / narrow browser

Prioritize:

1. session timeline and composer;
2. approvals/attention;
3. control context;
4. Fleet navigation.

Use drawers/tabs rather than forcing three narrow columns.

### Future TUI

Preserve the same conceptual focus order:

```text
Fleet tree -> Session timeline -> Control/attention -> optional workspace panes
```

The TUI may be visually ambitious, but it is not a separate control plane. It must use the same FleetCommand families, client-instance/control-epoch semantics, authority grants, history, and provider migration rules.

## 14. Non-goals

The v0.x WebUI is not required to provide:

- a marketing/landing page;
- a full IDE/editor replacement;
- a plugin marketplace;
- arbitrary remote JavaScript extensions;
- automatic host scheduling UI;
- transparent provider failover UI;
- enterprise multi-tenant administration;
- a first-party CLI or TUI before the WebUI minimum loop works.

## 15. Acceptance principles

A surface implementation is conformant only if:

1. all mutations go through typed FleetCommand;
2. Fleet IDs/receipts/history remain canonical over donor-library local state;
3. controller/viewer state is visible before conflicting mutation;
4. stale/unknown state is never rendered as stopped/offline truth without evidence;
5. approvals preserve the exact decision target and revision;
6. migration and continuity labels remain honest;
7. closing/reopening a client does not redefine session identity;
8. the same underlying view model can be rendered by a future TUI without changing Fleet semantics.

## Related documents

- [webui-wireframes.md](webui-wireframes.md)
- [research-findings-wave-02.md](research-findings-wave-02.md)
- [../research/wave-02/fleet-command.md](../research/wave-02/fleet-command.md)
- [../research/wave-02/multi-client-authority.md](../research/wave-02/multi-client-authority.md)
- [../research/wave-02/webui-spike.md](../research/wave-02/webui-spike.md)
- [session-model.md](session-model.md)
- [history-and-handoff.md](history-and-handoff.md)
