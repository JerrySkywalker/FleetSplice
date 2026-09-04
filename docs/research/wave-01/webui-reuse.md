# WebUI reuse

## Decision standard

FleetSplice should own the Fleet-specific shell and authority language, not recreate commodity chat, Markdown, code, terminal, file, diff and Git interaction. Reuse is acceptable only when a component consumes a Fleet view model; it must not become the source of execution, approval or history truth.

Evidence was frozen at these revisions observed on 2026-09-04:

- assistant-ui `191bd9728471816ead3cc5c5d40bb57b082ff4d2`, MIT;
- OpenHands/Agent Canvas `0c194180ac67c40aec7c0c2d724579ebd8934f92`, MIT;
- T3 Code `09d13de4381925fa2a6dea74eff8185fa301e905`, MIT;
- Vercel AI SDK `abb9ebfd688daf1ef8302fe9cf2fad2a20d8e9c2`, Apache-2.0.

A same-day closing audit found assistant-ui at `6fe899759c8f7f5837f649e91705a179fc549233` and T3 Code at `d5b94100863057fb4629f9ad4a35753d16917924`. The comparisons did not change cited public component/domain documents or licenses, so this report retains its reproducible frozen evidence cuts.

The historical moved `OpenHands/agent-canvas` repository has ambiguous license metadata and is not a donor.

## Comparison

| Capability | assistant-ui | current OpenHands Canvas | T3 Code frontend | Vercel AI SDK |
| --- | --- | --- | --- | --- |
| framework | framework-agnostic core plus React packages/components | React/TypeScript application/library surfaces; TanStack Query + Zustand | React/Electron/web with Effect RPC/domain state | framework integrations and stream/message utilities |
| chat streaming | strong runtime abstraction | strong through Agent Server event stream | strong through T3 events/RPC | strong low-level stream protocol |
| tool cards/results | strong extensible message parts | rich coding-agent events/views | rich T3-specific tool events | data representation, little commodity UI |
| approvals/user input | explicit tool approval UI/runtime | available through Agent Server/ACP event domain | normalized questions/permissions in T3 domain | application-built |
| Markdown/code | strong | strong | strong | application-built |
| terminal | not a coding terminal framework | integrated terminal | integrated terminal | none |
| files/diff/Git | not supplied as a coding workspace | integrated workspace/file/Git surfaces | integrated project/worktree/VCS surfaces | none |
| browser | none | integrated browser surface | not a general reusable browser surface | none |
| session navigation | thread/runtime primitives, branches | conversation/project UI | thread/project/worktree UI | application-built |
| long-history virtualization | not proven for Fleet scale; current issues show degradation/races | pagination exists; startup/projection issues remain | bounded replay exists; large resume issue remains | stream layer, not durable history UI |
| accessibility | explicit accessible primitive goals; still needs Fleet audit | no independent Fleet audit | no independent Fleet audit | depends on application |
| theming | strong component-level styling/theming | application theme coupled to Canvas | application theme coupled to T3 | depends on application |
| backend coupling | low-to-medium through runtime adapter | medium-to-high Agent Server domain | high T3 domain/RPC | low, but supplies little UI |
| extension surface | runtime adapters, message parts, tools/generative UI | discriminated events and API services | driver/provider capabilities and domain components | custom data parts/stream protocols |
| donor practicality | **best common-session candidate** | selective coding-workspace candidate | design/leaf-component candidate | optional transport/parser helper only |

## assistant-ui

**FACT:** assistant-ui separates render components, a runtime that owns thread/message/run/branch/edit/regeneration behavior, integration adapters and persistence adapters. Current message types include text, reasoning, tool calls/results/errors, artifacts, sources/files/data, timing, nested messages and approval resolution.

**FACT:** `@assistant-ui/core` is framework-agnostic and MIT; React integration is separately packaged. The repository's `packages/ui` is private and exports source paths rather than a stable published UI binary, so some attractive components may require selective source donation rather than a normal public package dependency.

**INTERPRETATION:** its runtime is an excellent UI abstraction but cannot be Fleet's session/history authority. It does not model Host/Environment generations, native process state, Edge event cursor, ambiguous effects or Fleet provider binding.

Representative issues reinforce the boundary:

- [#3489](https://github.com/assistant-ui/assistant-ui/issues/3489): degradation in tool/attachment-heavy histories;
- [#4944](https://github.com/assistant-ui/assistant-ui/issues/4944): external-history replacement raced resumable streams and could drop a reply;
- [#5327](https://github.com/assistant-ui/assistant-ui/issues/5327): global resumable-stream keys cross-wired replies between threads;
- [#4573](https://github.com/assistant-ui/assistant-ui/issues/4573): streaming-to-settled grouping could remount/reshuffle tool UI;
- [#6172](https://github.com/assistant-ui/assistant-ui/issues/6172): prepend/id conversion could drop fetched history.

**RECOMMENDATION:** make assistant-ui the leading common conversation candidate behind a Fleet runtime adapter. Pin exact packages, retain Fleet stable IDs/cursors as the source, and test prepend, reconnect, branch, tool grouping, approval expiry and very long history. If private UI components are copied, create exact MIT donor receipts.

Do not allow arbitrary model-generated React components. Generative UI/tool renderers come from an allowlisted trusted registry keyed by Fleet capability and schema version.

## OpenHands Agent Canvas

**FACT:** current Canvas includes conversation, terminal, browser, files, settings, automation and workspace surfaces behind typed Agent Server API adapters. It is the broadest integrated coding-workspace candidate in this set.

**INTERPRETATION:** that breadth is coupled to Agent Server conversations, workspaces, events, provider settings and server actions. Reusing the whole app would make Fleet a skin over another control domain. Leaf panels or patterns may be valuable after an import/state analysis.

**RECOMMENDATION:** use design patterns immediately and evaluate selected conversation/tool/terminal/file/diff/Git components in a later authorized UI spike. Keep Agent Server as an optional compatibility backend. Do not use the moved historical Canvas repository as a source donor without license resolution.

## T3 Code frontend

**FACT:** T3's UI is built around T3 ExecutionEnvironment, projects, threads, worktrees, providers, VCS, terminal and Effect RPC event state.

**INTERPRETATION:** T3 may have the closest visual domain to FleetSplice, yet it has the strongest semantic coupling. A visually small component can depend on project/provider/orchestration stores and server commands.

**RECOMMENDATION:** take interaction/layout patterns and consider narrowly pure renderers only. Treat the full frontend as the UI of an optional T3 compatibility backend rather than Fleet's primary shell.

## Vercel AI SDK

**FACT:** the Vercel AI SDK provides an Apache-2.0 streaming/message protocol and framework hooks, not terminal/files/diff/Git/session-authority UI. Current issue reports include native-agent lifecycle/resume mismatches when behavior exceeds the stream abstraction.

**RECOMMENDATION:** optional parser/transport compatibility only. It is not HCP, Fleet history, or the Unified UI architecture. It is not clearly superior to assistant-ui for the requested component layer.

## Proposed Unified UI architecture

```text
Fleet-owned shell
  hosts / environments / workspaces / worktrees
  logical sessions / lanes / segments / continuity
  provider bindings / capabilities / stale confidence
  authorization / enrollment / command receipts
                    |
          Fleet projection adapter
  stable normalized events + native detail references
  paginated history + blob loader + live cursor
                    |
       reusable common session surface
  assistant-ui conversation/tool/approval primitives
                    |
       reusable coding workspace ports
  terminal | files | diff | Git | browser (selective donors)
                    |
        trusted capability extension slots
  native Codex | ACP | optional backend-specific controls
```

### Fleet-owned shell

The shell is the only place that can express:

- current/stale/unknown Host and Environment state;
- workspace/worktree and writer authority;
- LogicalSession/lane/NativeSegment graph;
- native versus reconstructed continuity;
- provider/profile and execution-host versus inference-host binding;
- command generation, deadline, receipt and ambiguous effect;
- external Coordination Loop references.

No donor has this domain, and pretending otherwise would corrupt authority semantics.

### Fleet projection adapter

The adapter maps durable normalized events to component-friendly message/tool objects while retaining stable Fleet IDs and cursors. It pages older canonical events and blobs, coalesces live deltas, repairs from snapshots after reconnect, and exposes native detail by capability. UI library thread stores are caches/projections only.

### Coding workspace ports

Define UI-facing ports rather than adopting a donor backend:

- terminal stream/control with Environment and process identity;
- file tree/read/write capability with root/path evidence;
- diff/artifact rendering with source commit/blob references;
- Git status/log/branch/worktree actions with exact repository generation;
- optional browser/screenshot artifact view.

OpenHands/T3 components can be evaluated against these ports. A panel never receives an arbitrary host token or unrestricted path.

### Trusted extension slots

An extension declares exact driver, capability/schema range, renderer ID/hash and permitted native payload type. It returns safe view data or a reviewed local component. It cannot:

- register arbitrary remote JavaScript;
- bypass Fleet approval rendering;
- issue raw Hub/Edge commands;
- read credentials or ungranted files;
- mutate event history;
- claim support when capability negotiation failed.

## Long-history requirements

**RECOMMENDATION:** Fleet, not the UI library, supplies cursor pagination, windowing/virtualization, blob lazy-loading, search, anchor restoration and live-tail reconciliation. Conformance must cover weeks of history, large tool output, duplicate/reordered live events, branch navigation, compaction boundaries and deleted/retained blobs.

Accessibility and theming remain acceptance criteria: keyboard traversal, focus after streamed updates, screen-reader tool/approval status, color-independent state, reduced motion, high contrast and stable scroll anchoring. Current upstream claims do not substitute for a Fleet audit.

## Reuse recommendation

- **assistant-ui:** primary common session UI candidate through an adapter; dependency or narrow donor after exact review.
- **OpenHands:** best source of coding workspace patterns and possible selective panels; optional Agent Server compatibility backend.
- **T3:** design/reference and perhaps pure leaf renderers; optional compatibility backend, not primary Fleet UI.
- **Vercel AI SDK:** optional lower-level stream parser only.
- **FleetSplice:** owns shell, history/cursors, authority, normalization and trusted extension registry.

## Open questions

- exact published assistant-ui package versus copied private-UI component boundary;
- import/dependency/license maps for selected OpenHands/T3 panels;
- a framework choice for the Fleet shell, deliberately not selected here;
- compatible terminal/editor/diff libraries after separate license/security review;
- virtualization and accessibility benchmarks over representative Fleet traces;
- native payload redaction and safe renderer sandbox;
- offline/reconnect UX for stale state and ambiguous effects.

## Primary evidence

- [assistant-ui architecture](https://www.assistant-ui.com/docs/architecture)
- [assistant-ui source at the researched commit](https://github.com/assistant-ui/assistant-ui/tree/191bd9728471816ead3cc5c5d40bb57b082ff4d2)
- [assistant-ui message types](https://github.com/assistant-ui/assistant-ui/blob/191bd9728471816ead3cc5c5d40bb57b082ff4d2/packages/core/src/types/message.ts)
- [Current OpenHands architecture](https://github.com/OpenHands/OpenHands/blob/0c194180ac67c40aec7c0c2d724579ebd8934f92/docs/architecture.md)
- [T3 internals overview](https://github.com/pingdotgg/t3code/blob/09d13de4381925fa2a6dea74eff8185fa301e905/docs/internals/overview.md)
- [Vercel AI SDK stream protocol](https://ai-sdk.dev/docs/ai-sdk-ui/stream-protocol)
