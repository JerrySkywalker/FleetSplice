# Agent runtime sharing

FleetSplice discovers a shared Codex runtime through the native adapter; it does
not recreate a Codex session or infer a workspace from a browser request. On a
successful Agent start, the Edge performs one observation-only sequence:

1. Native `thread/list` is scoped to the Agent workspace.
2. Each candidate thread is read only after the native cwd and exact filesystem
   root proof agree.
3. The root must match a valid `WorkspaceBinding` for the admitted target.
4. The resulting observation is projected to the Gateway over the existing HCP.

The default Codex policy is enabled, shared, and `ALL_ELIGIBLE`. An owner may
choose `ALLOWED_ROOTS` or keep an installed runtime unshared. The Agent IPC
runtime list reports installed, discoverable, enabled, shared, health, observed
session count, and evidence. AGY remains an explicit unavailable entry until it
has a native contract; it has no claimed control capability.

`fleetsplice adopt --workspace <absolute-root>` remains a debug/manual route.
It is not needed for normal Agent discovery. A sharing-policy IPC update crosses
the admitted Edge, stops Gateway projection when the runtime becomes unshared,
and performs one fresh observation only when sharing is enabled.
