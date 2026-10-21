# FLEETSPLICE-V0_2-TUI-014

## Objective

Implement the first-party remote TUI as an alternate renderer of the already-stable Fleet interaction model.

## Architecture rule

The TUI consumes the same Hub read resources, FleetProjection, FleetReceipt, FleetEvent/history, and sends the same typed FleetCommands as WebUI. It receives its own `clientInstanceId` and obeys the same Lane controller/takeover/approval rules.

## Scope

- dense Fleet tree: Hosts/Environments/Workspaces/Sessions;
- current Session timeline/tool events;
- Control/Context pane;
- approval focus/dialog;
- command palette/keybindings for Send, Interrupt, Take Control, Checkpoint, Migrate;
- remote connection/auth using the same first-party client boundary;
- implementation language/library chosen for minimal maintenance; Rust is not required merely because this is a TUI.

## Non-goal

Do not fork Fleet semantics or add TUI-only mutation endpoints.

## Acceptance

A terminal user can select a remote workspace/session, converse with an Agent, approve/interrupt, and observe exact statuses using the same backend state as WebUI.

Return `DISPOSITION=PASS_V0_2_TUI`.

## 详细执行设计（替代 renderer）

### 开发清单

- [ ] G11 后确认稳定共享 read/command 契约，选择维护成本最低的 TUI 语言/库，不重写 Hub。
- [ ] 使用独立 clientInstanceId、人类登录与既有 Viewer/Controller/takeover 规则。
- [ ] Fleet 树、Session timeline/tool、Context/Attention、approval、显式发送/interrupt 形成最小可用路径。
- [ ] 键盘快捷键、终端尺寸/重连、宽字符/中文/粘贴、焦点与未知结果有明确交互。
- [ ] 每个动作与 Web 同一 FleetCommand/Receipt；不得添加 TUI-only mutation endpoint。
- [ ] unsupported 能力按服务端声明显示，不以键盘快捷键绕过禁用。
- [ ] fixture 对比 Web/TUI 同一 source projection，随后单独准入真实 remote TUI 最小流程。
- [ ] 连接关闭只释放该客户端观察/既有控制权，不误杀原生 Agent。

### 验收与边界

可以从真实终端选择远程 Session 并完成准入范围内的相同操作；原生效果仍有具体授权。
布局/像素无需与 Web 相同，身份、目标、完成/未知与权限必须相同。
交付 G15 所需动作/状态映射和精确候选，不提前声称全部 Web/TUI parity。
