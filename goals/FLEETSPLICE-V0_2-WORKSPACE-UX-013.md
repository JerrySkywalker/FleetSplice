# FLEETSPLICE-V0_2-WORKSPACE-UX-013

## Objective

Add focused coding-workspace UX without turning FleetSplice into a browser IDE.

## Scope

Implement W6-class surfaces behind Fleet-owned workspace state:

- file tree/read view;
- diff view;
- Git status/branch/commit context;
- terminal/PTY only after exact process/authority qualification;
- links between tool/file events and Session history;
- selective permissive donor patterns/components only with provenance.

## Guardrails

Do not import the full OpenHands Agent Canvas/backend. Do not create hidden workspace mutation APIs outside FleetCommand/typed Edge operations. Do not add editor/IDE features unrelated to remote Agent control.

## Acceptance

A user can inspect workspace files/diffs/Git and use a qualified terminal from the same session surface without confusing workspace state with Agent/session authority.

Return `DISPOSITION=PASS_V0_2_WORKSPACE_UX`.

## 详细执行设计（按 dogfood 选择）

### 开发清单

- [ ] G11 后确认真实查看/诊断痛点；如果 UX07 已交付，复用其只读路径而不是另造 Diff。
- [ ] 先交付当前 Session 明确 Workspace 的文件只读、Git 状态与 diff，并关联 native 工具/历史引用。
- [ ] 文件大小/类型/权限/路径边界可见；大文件受界读取，二进制与缺失不冒充文本。
- [ ] 更新 Workspace 视图不会改变 Agent/Controller 的事实来源。
- [ ] 若 Owner 需要 terminal/PTY，先单列精确进程/权限、窗口交互与终止语义的准入卡；未资格化则只交付只读切片。
- [ ] Windows Terminal 交互兼容要求真实 dogfood；PTY 输出不能作为 native structured receipt 的替代。
- [ ] 任何新写操作必须使用 typed FleetCommand，不能藏在“只读查看”的 shell/文件 endpoint 中。
- [ ] 组件/供体只用许可允许且有来源记录的最小部分；不引入完整 IDE 后端。

### 验收与终态

Owner 可从同一 Session 看到正确 Workspace 的文件/diff/Git，与权限/历史关系清楚。
终端纳入接受范围时必须有真实资格化；否则明确缩小接受范围、保留未做项，不能称完整终端 PASS。
不以本 Goal 扩展 Monaco、worktree 管理、浏览器或自动代码修改。
