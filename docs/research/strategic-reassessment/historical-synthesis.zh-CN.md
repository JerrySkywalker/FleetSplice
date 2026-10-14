# FleetSplice 思想变迁与产品定位：2026-10 研究归档

> 状态：**讨论结论归档（非规范性）**。这是对 2026 年 9–10 月原始仓库证据与 Owner 讨论的综合整理，不是历史聊天逐字稿。事实、推断、待验证假设及建议分别标注；不自动改变正式 `Owner thesis` 或已接受架构。

## 0. 核心结论

FS 的最初目标并非制作一个新的 Codex 手机客户端。它想解决的是：**一人/小团队在多台异构机器、多个 Environment、多个 Workspace 中运行长期 Coding Agent 时，如何以可控的附加资源成本统一发现、观察、受控操作与恢复，且不改变原生工作习惯。**

两类问题贯穿始终：

1. **管理与可靠性**：Hub、Runner、OS 进程、原生线程和模型上下文并非同一事实；重启、断线、重复执行、失去 Controller、跨 Windows/WSL 凭据边界等会造成状态分裂。
2. **性能效率**：不为了手机访问而复制一个完整 IDE/终端运行环境；不让频繁 Agent delta 触发全量权威 Snapshot；不让无限聊天历史压垮移动 UI；减少重复 RPC 和无意义的多机服务组件。

这两项是 `research thesis`，不是“FS 已经比 HAPI/Orca/Paseo 更快”的结论。早期选择称得上**合理且有明确证据依据的架构折中**，但没有标准化跨产品 Benchmark 支持“全局最优”。

## 1. 可追踪的思想演变

| 阶段 | 发生的转折 | 证据与边界 |
| --- | --- | --- |
| 2026-09-04：Baseline 0.0 / Wave 01 | 从 HAPI、Orca、T3 等现有远程 Agent 工具的性能/权威边界和故障模式出发，提出 `stateful but process-thin Hub + host-authoritative Edge`，而非一个厚服务器复制到每个 Environment | `docs/research/wave-01/{hapi,orca,synthesis}.md` |
| 9 月上旬：Wave 02 / G03 | 明确 `Host → Environment → Workspace`、`LogicalSession → SessionLane → NativeSegment`、生成代/控制栅栏、外部 Coordination Loop 边界、独立 InferenceProvider | `docs/architecture/baseline-0.1.md`；`docs/research/wave-02/synthesis.md` |
| G04A | 对过于复杂的 AuthorityAnchor / 外部证明和部署前强制项做简化；保留最小身份、可审计命令、无盲目重放及失败关闭 | `docs/architecture/amendments/g04a-visible-mvp-simplification.md` |
| G05 / G05C | 从抽象 Fleet 控制转向真实 Codex 的本地可用性；原生 Windows Terminal 中普通 `codex --yolo` 为北极星工作流；Native Adoption 旨在控制已有线程，而不是要求用户迁入新 IDE | `docs/product/owner-thesis.md`；G05C closeout |
| 9 月 17–20 日：Realtime / Gate P | 新增 Agent Execution / Fleet Control & Safety 双流、事件直达投影、有界历史、按需权威协调；对重复 Discovery RPC 和 pre-effect Read 做针对性减少 | `docs/architecture/realtime-two-stream.md`；`docs/performance/{measured-decision-freeze,t03-perf-closeout-gate-p}.md` |
| G06 / Pre-Gate-S | 首个可见交付被收敛到手机浏览器 → Owner-controlled Hub → 出站 WSS Edge → ZenBook Codex；本地 G06 协议和 S00–S11 候选完成，真实公网验收仍未发生 | `docs/train/pre-gate-s-development-train.md`；Gate S 包 |
| P00–P06 / 首启修复 | 解决 Windows managed daemon/Job Object 与可携式笔记本的进程生命周期差异；转向 Agent-supervised 官方 app-server，完成本地安装/启动修复 | PR #14、PR #15 和历史本地回执 |
| 2026-10-14 审计及本轮战略讨论 | 官方 Codex 0.162.1 已恢复为默认 CLI；`main` 仍 0.0，产品候选在开发列车；Gate S/G06 Live 与 Owner 完整体验未通过。引入 Paseo/TUIOS/官方远程工具后，重新质疑是否在复制成熟客户端 | Owner 提供的七份本机审计、远端 `main` 与开发列车 |

**解释**：把“手机远程控制 Codex”作为第一个可见产品切片，是 MVP 收敛，不等于它就是 FS 的全部创立理由。反过来，恢复多 Host 愿景也不能授权 G07–G16 全部自动开发。

## 2. 当年为什么选择 Hub/Edge 的中间方案

- 对 HAPI：**保留**中央目录、移动访问、远端 Runner 的可用管理模型；**拒绝**中心记录与内存 PID Map 被误当作实际进程真相。Hub 重启或 Runner 重启之后需要可验证的 attach/reconcile，而非盲目 respawn。
- 对 Orca：**保留**靠近用户的进程/凭据/工作区权威与本机 daemon 优点；**拒绝作为默认方案**把完整项目管理、终端/IDE、UI 状态与更新边界复制到所有执行 Environment。
- FS 的折中是**逻辑状态集中、效果真相留在 Host**：Hub 可以 `stateful`，却不接管远程 Agent 生命周期；一个 Host 级 Edge 可以有显式 Environment companion，而非每个 Environment 一个完整服务器。
- 进一步用结构化 Agent Event + 分层日志 + Hub/Edge HCP 协议，把“不频繁刷新、不复制完整 TUI”和“控制权事实始终需要校验”分开。

这是职责边界上的折中，并非根据竞争产品实测内存曲线找到的数字最优点。参见 [Wave 01](../wave-01/synthesis.md)。

## 3. 定位逐渐发生的三次偏移

1. **Fleet 管理 → Native-first**：正向纠偏。FS 不应替代已有 Windows Terminal、Git、编辑器和原生 Agent。
2. **异构 Fleet 控制 → 单机手机 Codex first**：有助于 MVP，但不一定能体现多 Environment、长期管理和执行/推理分离的价值。
3. **性能/状态所有权研究 → 版本兼容与部署门禁**：为了 Windows 原生会话生命周期、安装器及 Gate S 付出大量工程成本；真实用户和多机管理价值尚未完全验证。

因此不能把 `G06-first` 等同于 `product-thesis`。但也不能否认 G06 是当时明确批准的可见交付方向。

## 4. 市场同质化的真实风险

- **Paseo** 已有 Host Daemon、客户端直连/可选 Relay、多 Agent、跨机客户端以及可选 Hub，并实现 Agent Stream 节流、历史分页、重连和终端背压。`Central Hub + Daemon` 和“导入已有 Codex 会话”本身不再是 FS 独占差异。
- **TUIOS** 偏 Terminal/PTY-first，Agent 状态/SSH Host/统一 Inbox 与 Remote TUI 目标重叠。FS 若自行实现完整终端复用器，需证明额外价值。
- **官方 Codex Remote** 覆盖一部分手机远程 Agent 操作，但“任意普通 CLI 的同一活跃线程双向控制”应以当时实际版本测试，不能凭宣传推断。
- **原生会话连续性、低资源开销、跨 Environment 权威模型** 均仍可能构成差异，但当前都是需对照实证的假设，而非已经成立的市场优势。

## 5. 当前产品线事实与战略选择

- **VERIFIED（2026-10-14 审计）**：`main` `2c0073f` 为架构 0.0 无产品代码；开发列车 `ee98a62` 有 Hub/Edge/Web/Desktop/CLI 和本地候选实现。PR #14/#15 已合入列车而非 `main`。
- **HISTORICAL EVIDENCE**：本地 P06、首次安装修复有测试/安装回执；它们不是当前 Codex 0.162.1、真实手机公网或 Owner 完整手动体验的证明。
- **UNKNOWN**：Codex 0.162.1 Native Adoption、Agent-supervised 路径和审批语义的实际资格；Paseo 与 FS 在相同负载下的资源/延迟差异。
- **DECISION CANDIDATES**：
  - A：全栈远程 Coding Client 竞争。重复建设风险高，默认不推荐。
  - B：保留轻量异构 Fleet 控制平面，在原生会话权威/管理成本/性能方面形成实证优势；优先研究，不宣布胜利。
  - C：如果现成产品足够满足目标且 FS 优势不可证明，封存或转为小型 Adapter/研究产物。

## 6. 暂定取舍与 Owner 待决事项

建议保留研究与候选源码，暂停自动推进 Gate S、G07–G16、完整 Remote TUI、独立 IDE/Worktree GUI、通用 Provider 热迁移；**此为讨论建议，不改变既有授权**。

未来研究先回答：

1. 在同样 Agent 能力和场景下，FS Edge + Hub 的单机与 1/3/5 Host 额外资源成本是否有价值？
2. 对 Hub 崩溃、断连、重复控制命令和冷恢复，权威身份、Writer 与无法确定的效果能否被精确表达？
3. 长消息/工具输出是否以双预算（条目数 + 字节数）受控？如何在不丢失权威历史的前提下分页？
4. Paseo/TUIOS/Codex Remote 当前实际实现覆盖了哪些目标，哪些差异只是文案或历史 Issue？
5. 首版真正可被 Owner 操作验证的价值是什么？是否值得保持 FS 为独立产品？

**Stop condition**：本文件只记录讨论；无 Owner 新批准前，不改 `AGENTS.md`、`current-status.md`、`baseline-0.1.md`，不触碰生产部署、不合并 `main`，不启动产品实现。
