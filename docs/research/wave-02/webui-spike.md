# WebUI reuse spike

## Disposition

`WEBUI_REUSE_RECOMMENDATION=ASSISTANT_UI_COMMON_SESSION_PLUS_SELECTIVE_OPENHANDS_FILE_TREE_OR_PATTERNS`

**RECOMMENDATION:** use public assistant-ui packages behind a Fleet-owned projection/command adapter for common conversation, tool, and approval rendering. Do not depend on private `@assistant-ui/ui`. Reuse OpenHands only at narrow leaf/pattern level—principally a pure file-tree interaction or Monaco diff composition after replacing its data layer. Do not import the Agent Canvas application or its terminal state model.

Source/import/dependency qualification is sufficient for this architecture direction. Runtime browser behavior remains `NEEDS_TARGETED_TEST`, so no performance or UX pass is claimed.

## Boundary and method

No FleetSplice frontend, package manifest, dependency, or persistent fixture was created. The architecture-only repository had no UI toolchain, and installing one merely to manufacture a screenshot would violate the smallest-dependency rule. Research used exact upstream commits, recursive trees/raw source, package metadata, `npm view`, and `npm pack --dry-run --json`. No donor code was copied.

Evidence cut:

- assistant-ui `6fe899759c8f7f5837f649e91705a179fc549233` (2026-09-04), MIT;
- OpenHands `0c194180ac67c40aec7c0c2d724579ebd8934f92` (2026-09-04), MIT.

Representative exact package commands:

```powershell
npm view '@assistant-ui/react@0.15.18' version license dependencies dist --json
npm pack '@assistant-ui/react@0.15.18' --dry-run --json
npm view '@assistant-ui/core@0.3.17' version license dependencies dist --json
npm pack '@assistant-ui/core@0.3.17' --dry-run --json
npm view '@assistant-ui/react-markdown@0.14.14' version license dependencies dist --json
npm pack '@assistant-ui/react-markdown@0.14.14' --dry-run --json
npm view '@assistant-ui/ui' version license dependencies --json
npm view '@openhands/agent-canvas@1.16.0' version license engines dependencies dist --json
npm pack '@openhands/agent-canvas@1.16.0' --dry-run --json
```

`npm pack --dry-run` reported metadata only and did not install into this repository.

## assistant-ui package weight

| Package | License | Packed files | Tarball | Unpacked |
| --- | --- | ---: | ---: | ---: |
| `@assistant-ui/react@0.15.18` | MIT | 1,172 | 511,355 B | 2,337,001 B |
| `@assistant-ui/core@0.3.17` | MIT | 1,490 | 1,192,363 B | 5,496,334 B |
| `@assistant-ui/react-markdown@0.14.14` | MIT | 61 | 35,439 B | 136,451 B |

`@assistant-ui/ui` is private version `0.0.0`, has 31 runtime and 18 development dependencies at the inspected commit, exports source aliases, and is not published (`npm view` returned E404). Selected styled thread/tool/approval/Markdown/file/image source was about 96.9 KiB; `thread.aui.tsx` was 650 lines and `tool-fallback.aui.tsx` 740 lines with many private `@/components`, `@/hooks`, and `@/lib` imports. It is not a stable package boundary.

## assistant-ui capability findings

| Required behavior | Source evidence | Qualification/consequence |
| --- | --- | --- |
| streaming messages | external-store runtime accepts messages, running state, new/reload/resume/cancel callbacks | strong adapter seam; browser soak not run |
| tool-heavy history | typed reasoning/tool partial args/result/error/artifact/nested parts | expressive; Wave-01 degradation issues still require test |
| approvals | host-owned approval ID, closed option modes, free-form validation, expiry/retry tests | good fit after Fleet authority/digest adapter |
| history prepend | thread-list runtime has cursor loadMore/dedup/generation fences | not Fleet cursor/anchor proof |
| reconnect/replacement | stale adapter responses rejected by adapter generation in source/tests | useful pattern; Fleet receipts/events remain canonical |
| large tool output refs | `result`/file/image can be large values; `artifact` is untyped | inadequate as authority; Fleet lazy blob references required |
| long histories | default message primitive builds/mounts all messages | not virtualized by default |
| virtualization | official 500-message example uses `@tanstack/react-virtual`, stable IDs, measurement, overscan 4 | source example only, no performance result |

The external-store adapter exposes `messages`, `setMessages`, `convertMessage`, `isRunning`, `onNew`, `onReload`, `onResume`, `onCancel`, `onRefetchThread`, tool-result/resume/approval callbacks, branch callbacks, and an optional message repository. That is the correct seam: callbacks submit FleetCommands; message conversion consumes FleetProjection data.

Relevant source:

- [external store adapter](https://github.com/assistant-ui/assistant-ui/blob/6fe899759c8f7f5837f649e91705a179fc549233/packages/core/src/runtimes/external-store/external-store-adapter.ts)
- [`useExternalStoreRuntime`](https://github.com/assistant-ui/assistant-ui/blob/6fe899759c8f7f5837f649e91705a179fc549233/packages/core/src/react/runtimes/useExternalStoreRuntime.ts)
- [message types](https://github.com/assistant-ui/assistant-ui/blob/6fe899759c8f7f5837f649e91705a179fc549233/packages/core/src/types/message.ts)
- [message repository](https://github.com/assistant-ui/assistant-ui/blob/6fe899759c8f7f5837f649e91705a179fc549233/packages/core/src/runtime/utils/message-repository.ts)
- [remote thread-list runtime](https://github.com/assistant-ui/assistant-ui/blob/6fe899759c8f7f5837f649e91705a179fc549233/packages/core/src/react/runtimes/RemoteThreadListThreadListRuntimeCore.tsx)
- [default message mounting](https://github.com/assistant-ui/assistant-ui/blob/6fe899759c8f7f5837f649e91705a179fc549233/packages/core/src/react/primitives/thread/ThreadMessages.tsx)
- [virtualized example](https://github.com/assistant-ui/assistant-ui/blob/6fe899759c8f7f5837f649e91705a179fc549233/examples/with-virtualized-thread/app/VirtualizedThread.tsx)

Approval source/tests explicitly avoid fabricating unknown custom decisions. Fleet still binds each callback to exact approval revision/action digest, actor grant, Environment generation, command receipt, and expiry.

## Required Fleet adapter

```text
FleetProjection
  stable event/message/part IDs
  status and durability class
  approval ID/options/expiry/action digest
  compact blob/tool-output references
  history cursor + source watermark
  lane/segment/binding generations
        |
   convertMessage()
        v
assistant-ui runtime/cache/rendering
        |
UI callback -> typed FleetCommand -> receipt/subscription
```

Assistant-ui's repository/cache is disposable UI state. Fleet owns canonical history, event ordering/cursors, command receipts, authority, generations, ambiguity, native detail references, approval state, response-loss recovery, and reconnect repair.

Large output conversion supplies an immutable compact card with digest, size, media type, availability/redaction, preview, and separately authorized lazy load. It never places megabytes directly in `ThreadMessageLike`.

## OpenHands package/import analysis

`@openhands/agent-canvas@1.16.0` requires Node `>=22.12.0` and React `19.2.8`, declares 50 direct dependencies, and contains 10,804 packed files, a 16,416,834-byte tarball, and 66,164,859 unpacked bytes. Its public package exports only root, browser, conversation, files, settings, sidebar, terminal, i18n, and package metadata—no public diff-viewer entry.

A selected 37-file source analysis measured 110,927 bytes, 168 import edges, 16 unique external imports, and 41 internal-alias imports. This understates broader transitive domain coupling.

### Files

`FileTreeView`, `TreeNode`, and `buildFileTree` are the strongest narrow donor/pattern. The view accepts paths, selected path, and selection callback; its map-based tree builder is conceptually portable. Tests cover empty/collapse/selection and 5,000 siblings but intentionally make no timing claim.

The surrounding `useWorkspaceFiles` is not portable: Agent Server `find`, 2,000-result cap, local/cloud branching, React Query keys, readiness, and backend registry are embedded. File content also depends on active conversation/session, local/cloud auth, URLs, caching, Markdown/highlighting, iframe policy, and binary fallbacks. Replace all data/auth/path authority with Fleet ports.

- [file tree](https://github.com/OpenHands/OpenHands/blob/0c194180ac67c40aec7c0c2d724579ebd8934f92/src/components/features/files-tab/file-tree-view.tsx)
- [tree node](https://github.com/OpenHands/OpenHands/blob/0c194180ac67c40aec7c0c2d724579ebd8934f92/src/components/features/files-tab/tree-node.tsx)
- [tree builder](https://github.com/OpenHands/OpenHands/blob/0c194180ac67c40aec7c0c2d724579ebd8934f92/src/utils/file-tree.ts)
- [workspace file query](https://github.com/OpenHands/OpenHands/blob/0c194180ac67c40aec7c0c2d724579ebd8934f92/src/hooks/query/use-workspace-files.ts)

### Diff

`FileDiffViewer` uses Monaco, lazy-loads on expand, supports diff/old/new and Markdown/deleted/commit modes, and caps height at 600 px. Its query/auth/data model is tightly bound to conversation/session, selected repository, working directory, cloud proxy, Agent Server Git endpoints, and OpenHands types. Use as a design or Monaco-composition reference after replacing that layer; do not import it as a core package dependency.

- [diff viewer](https://github.com/OpenHands/OpenHands/blob/0c194180ac67c40aec7c0c2d724579ebd8934f92/src/components/features/diff-viewer/file-diff-viewer.tsx)
- [Git diff query](https://github.com/OpenHands/OpenHands/blob/0c194180ac67c40aec7c0c2d724579ebd8934f92/src/hooks/query/use-unified-git-diff.ts)

### Terminal

The terminal uses Xterm, 10,000-line scrollback, a Zustand command store, and read-only stdin. Its command rows contain only content plus input/output type—no command/session/process identity, Environment generation, cursor, or receipt. It replays the entire array on mount and uses a module-global last-command index, creating a multi-instance isolation risk. Treat it only as a visual reference. Fleet terminal control and replay need Fleet-owned ports/events/blobs and exact Edge receipts.

- [terminal component](https://github.com/OpenHands/OpenHands/blob/0c194180ac67c40aec7c0c2d724579ebd8934f92/src/components/features/terminal/terminal.tsx)
- [terminal hook](https://github.com/OpenHands/OpenHands/blob/0c194180ac67c40aec7c0c2d724579ebd8934f92/src/hooks/use-terminal.ts)
- [command store](https://github.com/OpenHands/OpenHands/blob/0c194180ac67c40aec7c0c2d724579ebd8934f92/src/stores/command-store.ts)

## Provenance decision

Both inspected repositories are MIT at the pinned commits. A future dependency records exact package/version/lock/provenance. A copied private assistant-ui or OpenHands file requires file-level donor commit, original license notice, modification record, and transitive import/license review. Historical standalone `OpenHands/agent-canvas` remains excluded because Wave 01 found ambiguous license metadata; only the current MIT OpenHands tree/package was evaluated.

No AGPL/HAPI UI code is eligible.

## Runtime spike still required

A later disposable browser fixture using only synthetic Fleet data must measure:

- token/durable-event streaming under a slow consumer;
- tool-heavy and approval-heavy histories;
- `before` prepend with scroll-anchor preservation;
- adapter replacement/reconnect and live-tail cursor repair;
- lazy large-blob cards and authorization failure;
- at least 10k compact rows/turn groups using virtualization;
- branch/lane switching and two-tab isolation;
- keyboard/accessibility and Markdown/untrusted-output safety.

Record browser/runtime/package versions, memory/long-task/frame metrics, exact fixture sizes, screenshots only if useful, and failure injection. Until then, `RUNTIME_OBSERVED=false`; source tests/examples are not performance evidence.

## Sources

- [assistant-ui pinned commit](https://github.com/assistant-ui/assistant-ui/commit/6fe899759c8f7f5837f649e91705a179fc549233)
- [assistant-ui license](https://github.com/assistant-ui/assistant-ui/blob/6fe899759c8f7f5837f649e91705a179fc549233/LICENSE)
- [OpenHands pinned commit](https://github.com/OpenHands/OpenHands/commit/0c194180ac67c40aec7c0c2d724579ebd8934f92)
- [OpenHands package metadata](https://github.com/OpenHands/OpenHands/blob/0c194180ac67c40aec7c0c2d724579ebd8934f92/package.json)
- [OpenHands license](https://github.com/OpenHands/OpenHands/blob/0c194180ac67c40aec7c0c2d724579ebd8934f92/LICENSE)
