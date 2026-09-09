# Explicit local Workspace targeting

P2A registers existing directories on the current Owner Host. It never clones,
creates, moves or deletes a Workspace, repository, branch or worktree. Native
Codex still owns file/tool execution, under the P1 read-only policy.

Use the normal local entrypoint from the FleetSplice checkout:

```powershell
.\fleetsplice.cmd workspace add 'V:\src\FleetSplice' 'FleetSplice'
.\fleetsplice.cmd workspace add 'V:\existing-directory' 'Another Workspace'
.\fleetsplice.cmd workspace list
.\fleetsplice.cmd workspace select '<registered-id>'
.\fleetsplice.cmd workspace remove '<registered-id>'
.\fleetsplice.cmd start
```

`add` requires an existing local absolute directory and records its canonical
path, filesystem identity, display name, registration ID and observation time.
The registry is `%LOCALAPPDATA%\FleetSplice\workspaces.json`, bound to the
current local Windows principal/SID. At most sixteen explicit roots are kept;
canonical roots longer than 1,024 characters are rejected without publishing.
Only the initial registry creation selects its first root automatically.
`list` reports current validity without changing the registry. `remove` removes
only the registration; it preserves all files. Removing the default selection
requires an explicit new `select` before a normal start. No disk-wide discovery
is performed. Present malformed or foreign-Host registries fail closed.

The local `select` command chooses the default root for the next runtime. A
running WebUI lists the registered roots admitted at its startup. Its Workspace
selector chooses only the target for **new sessions**. Existing sessions retain
their root, exact target and native thread regardless of the selector. The
selected new-session root and current session root/identity are shown separately.
New registrations become available after a normal clean stop/start.

Every Edge command revalidates registration and filesystem identity; the same
checks run synchronously immediately before native dispatch, after asynchronous
native configuration discovery. Missing, removed or substituted roots close
admission. No existing native thread's cwd is rebound. Multiple registered roots
can have distinct native threads in the one local managed app-server; productive
turns remain serialized by the existing conservative local gate.

Model/reasoning choices still come from the live native catalog. Configuration
and inherited-integration exclusions are checked separately for each root.
There is no write/YOLO/Controlled mode, remote transport or phone UI in P2A.

## 简体中文

工作区注册表仅记录当前设备上明确指定的已有目录，不创建、克隆、移动或删除仓库、
分支或工作树。`workspace add` 注册已有目录；`list` 只读检查有效性；`select`
选择下次启动的默认工作区；`remove` 仅删除注册记录，文件保持不变。
仅首次创建注册表时自动选择首个目录。移除默认选择后，即使再添加目录也必须显式
`select`；超过 1,024 字符的规范目录路径在写入注册表前拒绝。

网页中的工作区选择只影响新建会话。已有会话始终保留原目录、目录身份及原生线程。
新增注册目录在正常停止并重新启动后可用；被移除、缺失或已替换的目录禁止继续派发。
当前仍仅支持原生只读执行，没有加入写入权限、远程网络或手机界面。
