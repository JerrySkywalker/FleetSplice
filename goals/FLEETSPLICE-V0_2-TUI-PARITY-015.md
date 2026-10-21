# FLEETSPLICE-V0_2-TUI-PARITY-015

## Objective

Prove WebUI and TUI are two renderers of one Fleet product model rather than diverging clients.

## Parity matrix

Verify equivalent semantics for:

- Fleet/Host/Environment/Workspace navigation;
- LogicalSession/Lane/Segment identity;
- controller/viewer/takeover state;
- message/tool/history projection;
- approval decisions;
- interrupt/cancel distinction;
- command receipt/ambiguity display;
- provider/binding migration and continuity labels;
- files/diff/Git/terminal surfaces where supported;
- reconnect/stale/unknown behavior.

Pixel/layout equivalence is not required; semantic/action equivalence is.

## Acceptance

Automated/shared contract tests plus manual dogfood show both clients operate the same backend resources and FleetCommands. Any renderer-specific capability is explicitly presentation-only or capability-gated.

Complete the v0.2 release acceptance on exact-head independent review.

Return `DISPOSITION=PASS_V0_2_TUI_PARITY_ACCEPTED`.

## 详细执行设计（跨客户端资格化）

### 开发清单

- [ ] 以被实际接受的 G11–G14 能力为基线，建立 Web 与 TUI 的同一资源/动作/状态对照表。
- [ ] 对同一测试 backend 交错使用两客户端，检查 Viewer、takeover、fence、审批竞争与撤销。
- [ ] 同一 commandId、native Turn、history cursor 和 UNKNOWN 在两 renderer 中语义一致。
- [ ] 一端切 Session/重连不能把迟到结果投到另一目标；一端关闭不误报另一端工作停止。
- [ ] 文件/terminal/迁移等只有已资格化能力才加入接受矩阵，其余准确标 unsupported。
- [ ] 重用共享契约测试，只增加 renderer-specific mapping 与真实操作卡，不重复建两套长测试框架。
- [ ] 同一发布候选的实际 Web/TUI dogfood + independent exact-head 审查，保留不一致的原始失败。

### 验收与后续

语义/动作相同而非像素相同。未解决的权限/回执/未知差异阻塞接受，不能靠隐藏某一客户端的错误通过。
G15 接受后才整理 G16 稳定/候选自举准入；不给候选自动更新生产的权限。
