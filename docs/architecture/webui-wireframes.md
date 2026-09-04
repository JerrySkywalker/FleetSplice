# FleetSplice Interaction Surface Wireframes

## Status

- Purpose: owner-reviewable interaction wireframes
- Scope: first-party WebUI now, future first-party TUI later
- Fidelity: information architecture / semantic layout only
- `ARCHITECTURE_0_1_READY=false`
- `IMPLEMENTATION_AUTHORIZED=false`

These wireframes define what information must remain visible and how Fleet concepts relate on screen. They are not a pixel-perfect design, component library specification, or implementation authorization.

The WebUI and any future TUI should preserve the same information architecture and Fleet semantics. A TUI may reorganize panes or replace buttons with keybindings, but it must not redefine controller ownership, approval meaning, provider migration, continuity, history, or command state.

See [webui-model.md](webui-model.md) for the shared surface contract.

---

# W1 - Primary Session Workspace

**Priority:** P0 / minimum useful loop

**Purpose:** daily-use Fleet + Session + Control surface. This is the primary v0.1 screen.

```text
+------------------------------------------------------------------------------------------------+
| FleetSplice                                                      [Jerry] [Settings] [Status]   |
| Fleet: 2 online / 0 stale / 0 unknown                    [New Session] [Refresh]                |
+------------------------+------------------------------------------------+-----------------------+
| FLEET NAVIGATION       | CURRENT SESSION                                | CONTROL / CONTEXT     |
|                        |                                                |                       |
| [Hosts]                | LogicalSession: FS-2026-0007                   | Host: ZenBookDuo      |
| [Workspaces]           | Lane: main                                     | Env: windows-user     |
| [Sessions]             | Controller: Jerry / browser-tab-1              | Workspace: repo-A     |
| [Approvals]            | Segment: seg-004                               |                       |
| [History/Search]       | Agent: Codex                                   | Agent: Codex          |
|                        | Provider: OpenAI / gpt-5.6-sol                 | Driver: codex-native  |
| --------------------   | State: RUNNING                                 | Provider: OpenAI      |
| Hosts                  | ---------------------------------------------- |                       |
| > SKYFORGE-01          |                                                | Session Controls      |
|   |- windows-user      | [User]                                         | [Interrupt]           |
|   |- windows-admin     | Check this repository's build failure.         | [Take Control]        |
|   `- wsl-ubuntu        |                                                | [Checkpoint]          |
|                        | [Assistant]                                    | [Migrate Binding]     |
| > ZenBookDuo           | I am inspecting the repository...              |                       |
|   `- windows-user      |                                                | Approval Queue        |
|                        | [Tool] git status                              | - none -              |
| Workspaces             | completed                                      |                       |
| > repo-A               |                                                | Lane Control          |
|   ZenBookDuo           | [Tool] npm test                               | epoch: 8              |
| > FleetSplice          | running...                                     | revision: 42          |
|   SKYFORGE-01          |                                                | holder: this client   |
|                        | [Assistant]                                    |                       |
| Sessions               | Found three likely causes...                   | Current Turn          |
| > repo-A build fix     |                                                | state: streaming      |
| > FleetSplice arch     |                                                | command: cmd-882      |
|                        |                                                | native: turn-119      |
|                        +------------------------------------------------+                       |
|                        | [ message input .................................................. ]   |
|                        |                                                     [Send]             |
+------------------------+------------------------------------------------+-----------------------+
| Hub connected | SKYFORGE online | ZenBookDuo online | History synced | No ambiguity          |
+------------------------------------------------------------------------------------------------+
```

### Required semantics

- Left pane answers **where can work run and what can I open?**
- Center answers **what is happening in this LogicalSession?**
- Right pane answers **who controls it, where is it bound, and what actions are valid now?**
- `Controller`, `Host`, `Environment`, `Workspace`, `Agent`, and `Provider` are separate identities.
- The displayed LogicalSession ID is never replaced by a native Codex/OpenCode thread ID.
- Tool events are first-class timeline items, not hidden debug logs.
- The composer uses `turn.submit`; it must not silently become `turn.steer`.

### Future TUI mapping

```text
left Fleet tree     -> tree pane
center timeline     -> main scrollback pane
right control       -> inspector/attention pane
composer            -> command/input line
bottom Fleet status -> persistent status bar
```

---

# W2 - Approval Attention

**Priority:** P0

**Purpose:** make a consequential Agent request reviewable from desktop or phone without requiring lane-control takeover.

```text
+--------------------------------------------------------------------------+
| Approval Required                                               [x]       |
+--------------------------------------------------------------------------+
| Session        repo-A build fix / lane main                              |
| Host           ZenBookDuo                                                |
| Environment    windows-user                                              |
| Workspace      V:\src\repo-A                                             |
| Agent          Codex                                                     |
| Approval ID    appr-184 / revision 3                                     |
|                                                                          |
| Tool request                                                             |
| ------------------------------------------------------------------------ |
| command: npm test                                                        |
| cwd:     V:\src\repo-A                                                   |
| reason:  validate build configuration after the proposed edit            |
|                                                                          |
| Offered decisions                                                        |
|                                                                          |
| [Allow Once]                 [Deny]                 [Interrupt Turn]      |
|                                                                          |
| Controller: desktop browser / epoch 8                                    |
| You may resolve this approval without taking lane control.                |
+--------------------------------------------------------------------------+
```

### Required semantics

- Show exact Session/Lane, Host, Environment, Workspace/cwd, action, approval revision, and offered decision set.
- `Allow Once`/`Deny` maps to `approval.resolve` with exact approval revision/action digest.
- The UI must not invent a decision that the Agent did not offer.
- Approval authority and lane controller authority are independent.
- v0.x should prefer one-shot approval decisions until persistent native approval semantics are qualified.

### TUI mapping

A future TUI should open the same item in a focused pane/dialog and require an explicit action key. The approval identity and decision set must match WebUI exactly.

---

# W3 - Provider / Binding Migration Review

**Priority:** P1, when provider migration is implemented

**Purpose:** make provider/agent/host changes explicit and prevent a false claim of seamless native continuity.

```text
+--------------------------------------------------------------------------------+
| Migration Suggested                                                            |
+--------------------------------------------------------------------------------+
| Current binding                                                                |
|   Execution Host       ZenBookDuo                                               |
|   Environment          windows-user                                             |
|   Workspace            repo-A                                                   |
|   Agent                Codex                                                    |
|   Provider             OpenAI / gpt-5.6-sol                                    |
|   Native Segment       seg-004                                                  |
|                                                                                |
| Proposed binding                                                               |
|   Inference Host       SKYFORGE-01                                              |
|   Provider             local / Qwen                                             |
|   Agent path           compatible Agent binding                                 |
|                                                                                |
| Capability comparison                                                          |
|   tools                PARTIAL                                                  |
|   context              LOWER                                                    |
|   reasoning controls   DIFFERENT                                                |
|   privacy              LOCAL                                                    |
|   endpoint health      PASS (time-bounded)                                      |
|                                                                                |
| Continuity                                                                     |
|   new NativeSegment    YES                                                      |
|   native continuity    NO                                                       |
|   reconstruction       checkpoint + selected evidence                           |
|   unresolved effects   none                                                     |
|                                                                                |
| [Review Checkpoint]      [Create Checkpoint and Continue]      [Cancel]         |
+--------------------------------------------------------------------------------+
```

### Required semantics

- Migration is suggested, never transparent in v0.x.
- Show current and proposed binding separately.
- Surface capability differences before confirmation.
- A confirmed migration creates a new NativeSegment.
- The UI must label continuity honestly: native, reconstructed, related-only, or unknown.
- In-flight ambiguity blocks automatic migration until reconciled or explicitly handled by policy.

### TUI mapping

Render as a two-column binding diff plus an explicit confirm command. The TUI must not reduce this to a one-line `switch model` command that hides capability or continuity changes.

---

# W4 - Session Index

**Priority:** P0

**Purpose:** browse long-lived work across Hosts without treating native threads as the Fleet catalog.

```text
+------------------------------------------------------------------------------------------------+
| Sessions                                          [Search................] [Filter] [New]        |
+------------------------------------------------------------------------------------------------+
| Status   LogicalSession              Workspace       Host          Env         Agent / Provider |
| ------------------------------------------------------------------------------------------------|
| RUNNING  repo-A build fix            repo-A          ZenBookDuo   win-user    Codex / OpenAI   |
| IDLE     FleetSplice architecture    FleetSplice     SKYFORGE-01  win-user    Codex / OpenAI   |
| BLOCKED  API migration experiment    repo-B          SKYFORGE-01  wsl-ubuntu  OpenCode / ...   |
| DONE     old cleanup                  repo-C          ZenBookDuo   win-user    Codex / OpenAI   |
| ------------------------------------------------------------------------------------------------|
| Selected: repo-A build fix                                                                  >   |
| Lane: main | Segment: seg-004 | Controller: browser-tab-1 | Turn: RUNNING                     |
| Last checkpoint: cp-31 | Continuity: native | Updated: 18s ago                               |
|                                                                                               |
| [Open] [History] [Checkpoint]                                                                 |
+------------------------------------------------------------------------------------------------+
```

### Required semantics

- Rows are LogicalSessions, not native Agent threads.
- Status should expose stale/unknown where relevant instead of guessing.
- Current Host/Environment/Agent/Provider is a projection of the selected active binding, not session identity.
- Session search/history must use Fleet canonical history.

### TUI mapping

The same information can render as a fuzzy searchable table or command palette. Opening a row selects the same LogicalSession/Lane.

---

# W5 - Host / Environment / Workspace Explorer

**Priority:** P0

**Purpose:** expose the Fleet topology without implying homogeneous workers or arbitrary global cwd access.

```text
+--------------------------------------------------------------------------------------+
| Fleet / Hosts                                                       [Refresh]         |
+--------------------------------------------------------------------------------------+
| SKYFORGE-01                                              ONLINE / observed 4s ago    |
|                                                                                      |
|  windows-user                                             READY                      |
|    principal: Jerry / normal integrity                                              |
|    Agent bindings: Codex QUALIFIED, OpenCode ACP QUALIFIED_WITH_LIMITS               |
|    Workspaces:                                                                       |
|      FleetSplice    V:\src\FleetSplice                                                |
|      repo-X         V:\src\repo-X                                                    |
|                                                                                      |
|  windows-admin                                            READY                      |
|    privilege: explicit elevated companion                                          |
|    Workspaces: [not shown without authority]                                        |
|                                                                                      |
|  wsl-ubuntu                                              READY                      |
|    distro/user: Ubuntu / jerry                                                    |
|    Workspaces: /home/jerry/src/...                                                   |
|                                                                                      |
| ZenBookDuo                                               ONLINE / observed 8s ago    |
|                                                                                      |
|  windows-user                                            BUSY                       |
|    Workspaces:                                                                       |
|      repo-A         V:\src\repo-A                                                    |
|      repo-B         V:\src\repo-B                                                    |
|                                                                                      |
| [Register Existing Workspace]        [Open Session]                                  |
+--------------------------------------------------------------------------------------+
```

### Required semantics

- Environment is a principal/process/path/credential/lifecycle authority, not a tag.
- `windows-user`, `windows-admin`, and `wsl-ubuntu` remain distinct.
- `Register Existing Workspace` is explicit and read-only with respect to repository contents in v0.x.
- The Hub never treats a user-entered arbitrary path as sufficient authorization.
- Host observations carry freshness and confidence.

### TUI mapping

This becomes the natural Fleet tree view. A TUI should be able to navigate `Host -> Environment -> Workspace -> Session` with the same IDs and readiness states.

---

# W6 - Coding Workspace: Files / Diff / Git / Terminal

**Priority:** P2 / later workspace richness

**Purpose:** enrich daily coding use without turning FleetSplice into an IDE or moving workspace authority into the browser.

```text
+----------------------+-------------------------------------------+--------------------------+
| Session              | Conversation / Events                     | Workspace                |
|                      |                                           |                          |
| repo-A build fix     | [Assistant]                               | repo-A                   |
| Lane: main           | I changed three files.                    | |- src/                   |
| Segment: seg-004     |                                           | |  |- index.ts            |
|                      | [Tool] apply_patch                         | |  `- build.ts            |
| Host: ZenBookDuo     | completed                                 | |- package.json           |
| Env: windows-user    |                                           | `- README.md              |
|                      | [Assistant]                               |                          |
|                      | Build configuration is fixed.             | Selected: src/build.ts   |
|                      |                                           | ------------------------ |
|                      |                                           | - old value              |
|                      |                                           | + new value              |
|                      |                                           |                          |
|                      |                                           | [Files] [Diff] [Git]     |
|                      |                                           | [Terminal]               |
+----------------------+-------------------------------------------+--------------------------+
```

### Required semantics

- Panels consume Fleet workspace ports/view models; they do not receive arbitrary Host credentials.
- File operations remain root-scoped and capability/authority checked.
- Diff/Git state references exact repository/worktree observations where available.
- Terminal is an explicitly identified process/stream, not proof of native Agent session state.
- Selective OpenHands patterns/components may be evaluated here; importing the whole Agent Canvas is not required.

### TUI mapping

This is where a future remote TUI can become especially strong: native tree, diff, Git, and terminal panes can feel richer than the WebUI while sharing the same WorkspaceSurfaceModel and authority checks.

---

# W7 - History / Checkpoint / Continuity Inspector

**Priority:** P1

**Purpose:** make long-running LogicalSessions auditable across compaction, reconnect, provider changes, forks, and NativeSegments.

```text
+------------------------------------------------------------------------------------------------+
| History: FleetSplice architecture / lane main                     [Search] [Create Checkpoint]  |
+------------------------------------------------------------------------------------------------+
| 14:02  event-801  USER MESSAGE                                                            native|
| 14:02  event-802  TURN STARTED            Codex / OpenAI / seg-003                           |   |
| 14:05  event-814  TOOL COMPLETED          git status                                         |   |
| 14:08  event-827  CHECKPOINT cp-30        reviewed                                           |   |
|                                                                                                  |
| ------------------------------ SEGMENT BOUNDARY -----------------------------------------------  |
| reason: provider/model binding changed                                                           |
| continuity: native thread retained / new binding epoch                                           |
|                                                                                                  |
| 14:09  event-830  SEGMENT STARTED         seg-004 / gpt-5.6-sol                               |   |
| 14:21  event-911  APPROVAL RESOLVED       allow-once                                        |   |
| 14:31  event-970  CHECKPOINT cp-31        reviewed                                           |   |
|                                                                                                  |
| ----------------------------- RECONSTRUCTED HANDOFF --------------------------------------------  |
| target: local provider candidate                                                                  |
| native continuity: no                                                                             |
| transferred: checkpoint + selected messages + artifact manifest                                  |
| excluded: hidden reasoning / credentials / in-flight effects                                     |
|                                                                                                  |
| [Open Event] [Open Native Detail] [Open Blob] [Compare Checkpoints]                              |
+------------------------------------------------------------------------------------------------+
```

### Required semantics

- Long UI history and model-visible context are separate concepts.
- Segment and continuity boundaries are visible, not hidden inside chat chronology.
- Checkpoints retain source-watermark and reviewed/unreviewed state.
- Native payload detail is optional/capability-gated and may be redacted.
- Expired blobs leave a tombstone/metadata record rather than erasing the historical event.
- `AMBIGUOUS_EFFECT` receipts remain immutable even if later evidence resolves them.

### TUI mapping

A TUI can render this as a dense event log/timeline with expandable rows and jump-to-checkpoint commands. This view is likely to be especially effective in terminal form.

---

# W8 - Compact Remote / Future TUI-equivalent Surface

**Priority:** future TUI; compact WebUI can use the same hierarchy now

**Purpose:** prove that the interaction architecture is not coupled to a wide browser layout.

```text
+--------------------------------------------------------------------------------+
| FleetSplice | ONLINE | ZenBookDuo/win-user | repo-A | Codex/OpenAI             |
+----------------------+---------------------------------------------------------+
| FLEET                | SESSION: repo-A build fix                              |
|                      | lane main | epoch 8 | rev 42 | RUNNING                 |
| > ZenBookDuo         |---------------------------------------------------------|
|   > win-user         | U  Check this repository's build failure.             |
|     > repo-A         |                                                         |
|       > *build fix   | A  I am inspecting the repository...                   |
|                      |                                                         |
|   SKYFORGE-01        | T  git status                              [done]        |
|     win-user         | T  npm test                                [running]     |
|     wsl-ubuntu       |                                                         |
|                      | A  Found three likely causes...                         |
|                      |---------------------------------------------------------|
| ATTENTION 1          | > _                                                     |
| ! approval pending   |                                                         |
+----------------------+---------------------------------------------------------+
| ^A approval | ^I interrupt | ^K checkpoint | ^T take control | ^P palette      |
+--------------------------------------------------------------------------------+
```

### Required semantics

- This is not a separate TUI protocol. It is another rendering of the same FleetNavigationModel, SessionTimelineModel, ControlContextModel, AttentionModel, and Fleet status.
- Keybindings map to the same typed FleetCommands as WebUI buttons.
- A TUI instance has its own `clientInstanceId` and participates in the same lane-control epoch rules.
- Attention count must include approvals/ambiguity/provider/control conditions derived from Fleet evidence.
- Dense terminal symbols may supplement labels, but operational meaning must remain inspectable in text.

### Potential TUI expansion

A future advanced TUI may add:

```text
[Fleet Tree] [Session] [Files] [Diff] [Git] [Terminal] [History]
```

as tabs or panes while preserving the same state model. This makes WebUI and TUI complementary first-party surfaces rather than independent products.

---

# Cross-wireframe invariants

All eight wireframes must preserve these architecture rules:

1. **Fleet identity before native identity.** LogicalSession/Lane/Segment remain Fleet-owned even when native IDs are displayed.
2. **One mutation path.** WebUI and future TUI mutate through typed FleetCommand only.
3. **Observation is not authority.** Freshness/confidence/revision are visible where stale state affects a decision.
4. **One controller per lane.** Viewers, controller, takeover, approval authority, and automation are distinct concepts.
5. **Environment is a trust boundary.** Normal user, admin, and WSL are never collapsed into a privilege toggle.
6. **Approval is explicit.** The target, revision, and exact offered choices remain visible.
7. **Migration is explicit.** Provider/Agent/Host transition is never rendered as transparent failover.
8. **Continuity is honest.** Native and reconstructed continuity are visibly different.
9. **Ambiguity is visible.** `AMBIGUOUS_EFFECT` is not presented as retrying, failed, or succeeded until evidence exists.
10. **Donor libraries are renderers.** assistant-ui/OpenHands/T3 state cannot replace Fleet IDs, receipts, history, authority, or projection semantics.

# Development-train order implied by the wireframes

The wireframes span G05-G16 and are intentionally broader than the first
implementation milestone.

```text
G05 / M0 Single-host Walking Skeleton
  W1 minimal Session Workspace
  W5 minimal Host/Workspace selection
  real Browser -> Hub -> SKYFORGE-01 Edge -> Codex -> Browser

G06 / M1 Two-host Minimum Fleet Loop
  W4 Session Index
  two Hosts visible and selectable
  exact Host/Environment identity across Edge reconnect

G07 / M2 Daily-use Control
  W2 Approval Attention
  interrupt/resume/controller state
  browser close/reopen projection without duplicate effect

G08 / M3 Durable Session
  W7 History/Checkpoint/Continuity
  durable Fleet history and Hub/Edge/native disruption recovery
  explicit ambiguity when effect evidence cannot resolve outcome

G09 / M4 Provider Migration
  W3 Migration Review

G10 / v0.1 Hardening and Acceptance
  recovery/storage/update/security/UI gates

G11 / v0.2 ACP Second Agent
  same W1/W2/W7 surfaces through ACP/OpenCode

G12 / v0.2 Environment Expansion
  admin/WSL states in W5

G13 / v0.2 Coding Workspace UX
  W6 Files/Diff/Git/Terminal

G14 / v0.2 First-party Remote TUI
  W8 full first-party remote TUI

G15 / v0.2 WebUI/TUI Semantic Parity
  shared backend resources, commands, statuses, and dogfood

G16 / Stable-N Self-hosting Proof
  separate N+1 worktree/canary, external activation, rollback
```

No later wireframe is allowed to delay the G06 two-host Fleet session loop.

# Owner review checklist

When reviewing future visual designs or implementations, check:

- Can the user always identify the current Host, Environment, Workspace, Agent, Provider, LogicalSession, and Lane without opening debug information?
- Is the timeline the primary working surface while Fleet navigation and control context remain reachable?
- Are tool actions and approvals first-class, not hidden logs?
- Is control ownership visible before a conflicting action?
- Does provider migration show capability/continuity consequences before confirmation?
- Can stale/unknown/ambiguous states be distinguished without relying on color?
- Does closing/reopening the surface preserve the same LogicalSession identity?
- Could a terminal renderer present the same state and actions without inventing a new product model?

If the answer to the last question becomes no, the UI implementation has leaked renderer-specific semantics into FleetSplice architecture and should be corrected.
