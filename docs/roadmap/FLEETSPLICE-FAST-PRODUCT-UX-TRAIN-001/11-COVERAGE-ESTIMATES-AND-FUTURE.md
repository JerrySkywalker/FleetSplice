# 功能覆盖、开发清单归属与后续 Goal

## 1. 完整交付覆盖矩阵

| 需求 | 实现/准备 Goal | 源码证明 | 真实接受 |
| --- | --- | --- | --- |
| 当前基线/版本/PR 栈/工作树 | S00 | 元数据/DAG一致性 | 实际开发前重新核对 |
| modern/legacy PID 与身份 | N00 | 两家族/复用/陈旧/冲突 fixture | N01/H1 的独立身份链 |
| 原始已加载线程，无 resume/new Writer | N00 | 精确 loaded/no-start/no-resume | H1 原 TUI/PID/Thread/Writer |
| 无 caller echo 的 native Turn 回执 | N00 | 无回显与交错反例 | H1 单独授权的返回证据 |
| 未知效果跨连接/重启不重放 | N00 | Hub→Edge→Adapter 耐久集成反例 | H1/G06 允许范围；G08 扩展恢复 |
| Fleet 导航/最近/快速切换 | UX00/UX01 | scoped selection、late-response 与布局 | H0/H2 |
| 会话流式/Markdown/工具卡 | UX02 | item upsert/final/长代码/scroll | H0/H2 |
| Composer/模型/能力/权限显示 | UX02 | IME/draft/Viewer/unsupported | H0/H1/H2 |
| Attention/审批/Review/UNKNOWN | UX03 | stale fence/审批竞态/唯一 CTA | H0/H1/H2 |
| 手机/折叠/软键盘/PWA | UX04 | 视口矩阵和离线真相 | H2 真机/真实网络 |
| 桌面 Manager/Workspace | UX05 | Tauri/IPC/origin/身份 | H0；真实安装在 G10/H4 |
| 本地可运行体验与反馈 | UX06 | 合成演示可启动 | H0 |
| OIDC/TLS/outbound WSS/Enrollment | 已有 G06 predeploy + FPX-G06 接缝 | 受影响 auth/HCP/reconnect fixture | Gate S + H2/G06_ACCEPTED |
| 两 Host 控制/撤销/generation | G07 | 两 Host 控制反例 | H3/G07_ACCEPTED |
| 完整历史/工具 Blob/索引/锚点 | G08 | 同完整度长历史/页/字节/故障 | G08_ACCEPTED；H4 真使用 |
| 迁移或无资格目标 | G09 | proposal/quiescence/不明 predecessor | G09_ACCEPTED |
| 安装/更新/备份/恢复/长时运行 | G10 | release suite 与候选产物 | H4 + independent review + Owner release admission |
| 只读 Changes/Diff/PR | UX07（可选） | 路径/只读/受界渲染 | H2 后 Owner 选择 |
| 第二类 Agent/Admin/WSL/TUI/自举 | V02 → 独立 G11–G16 | 未来独立准入 | 不作为 v0.1 blocker |

这些行描述覆盖责任，不把旧源码已有能力全部列为“待重写”，也不把先前 mock 通过改写为真实接受。
每个 Goal 文件中的任务框均为设计待办，实际完成以回执和精确候选为准。

## 2. 最早可见交付与执行批次

| 批次 | 逻辑顺序 | 最小可见结果 | 遇阻时可做 |
| --- | --- | --- | --- |
| A 基线/契约 | S00；然后 N00 与 UX00 | 可审阅 Native 修正差异、确定 UI 契约 | 另一条独立 source 线 |
| B 可运行 cockpit | UX01→UX02→UX03；UX05 可在接口稳定后接入；UX04→UX06 | 本地模拟会话/工具/Attention/手机布局/Tauri | N00/N01 准备、G06 合格源码 |
| C 原生/人工准备 | N01 + H0/H1 | 真正原 TUI 与 UI 的分开体验证据 | 无 live 条件时保存操作卡 |
| D 手机闭环 | G06 source；H0/H1/Gate S 后真实 H2 | 离开电脑后的手机控制 | 缺外部条件时停在 source-ready |
| E 两主机 | G07 → H3 | 两个真实 Host 的切换/控制 | 资格化阻碍不能靠模拟代替 |
| F 耐久与发布 | G08→G09→G10→H4 | 旧全文可取、诚实恢复、可靠发布 | 不回退为尾部缓存或伪迁移 |
| G 可选扩展 | UX07；V02/G11–G16 | 基于 dogfood 的下一能力 | 默认延后 |

前两批可以完全使用合成原生端口。中途等待人时只继续真独立任务；
不能为“无人值守”把 G08 赶到 G07 前，也不能为了忙碌再跑一次已通过的大 CI。

## 3. 工程量与时间盒的区别

manifest 中 15 个必需 Goal 的乐观分项直接相加是 **19–43 工程日**（另有 2 个可选项）。
这是单人工作量的粗估，不是固定日程；已有总览所写 15–31 天是更乐观的关键路径讨论值，
不应被解释为单人保证工期或 12 小时会话数。

本次复核发现 PR23 仍 plan-only：N00 继续沿用 #22 的 **3–6 日**风险估计，比 manifest 的
1–3 日续做乐观窗口更保守。用这一替换计算，当前建议预算为 **21–46 工程日**；
其中本地准备/体验十项约 **10–21 日**，G06–G10 约 **11–25 日**。
不含基础设施等待、人工档期、真实环境故障和新增范围；不能按当前 AI 生成速度线性外推。

- UX07：额外 1–3 日，仅 Owner 从 H2 dogfood 选择后计入。
- V02/G11–G16：暂不并入 v0.1 工期；接受 v0.1 后重新估算。
- 12h：每次实际执行会话的最大墙钟预算；一个 Goal 可多次恢复，不为凑时长重复测试。
- H0–H4 的 Owner 操作卡合计约 100–145 分钟，另加 Gate S 配置、实际故障处理与更长 G10 soak。
- 默认当前单 writer；独立任务可切换，不把未批准的并发折算成确定提速。

## 4. v0.2 与自举：继续一个 Goal 一个文件

以下已有文件分别补充了执行清单；本次仅规划，不增加到当前 FPX helper 的 17 个可执行节点。
V02 在 H4 后负责选择下一项，而不是一次启动六项。

| Goal | 独立文件 | 关键前置与最小验收 |
| --- | --- | --- |
| G11 | [ACP Agent](../../../goals/FLEETSPLICE-V0_2-ACP-AGENT-011.md) | v0.1 接受；同 UI 真实第二 Agent 与能力缺失诚实展示 |
| G12 | [Environments](../../../goals/FLEETSPLICE-V0_2-ENVIRONMENTS-012.md) | G11 后，显式 UAC/WSL 准入；user/admin/WSL 不串权 |
| G13 | [Workspace UX](../../../goals/FLEETSPLICE-V0_2-WORKSPACE-UX-013.md) | G11 后按 dogfood 选择；文件/diff/Git 只读先行，终端单独资格化 |
| G14 | [Remote TUI](../../../goals/FLEETSPLICE-V0_2-TUI-014.md) | G11 后稳定共享契约；另一 renderer 不产生独有权限 |
| G15 | [Web/TUI parity](../../../goals/FLEETSPLICE-V0_2-TUI-PARITY-015.md) | 实际采纳的 G12–G14 完成；同一 backend 的权限/回执/历史一致 |
| G16 | [Self-hosting](../../../goals/FLEETSPLICE-SELF-HOSTING-016.md) | G15 接受；稳定 N 管控开发，N+1 候选无自激活权 |

G12–G14 只有在未来明确分工/写权限允许时才可并行，不在当前会话启动 agents。
AI4S、fleet inference、MATLAB/STK 等仍是后续研究议题；需要独立价值/权限/架构方案，
不会因为出现在这个表中自动进入 FS core。

## 5. 本设计的交付状态

17 个当前 Goal + 6 个既有后续 Goal 均保持独立 Markdown。
增加的内容为规划细化与清单，未给任何源码/真人 gate 填完成状态，
未修改产品源码、manifest DAG、离线 helper 或历史回执。
文档从独立 planning worktree 按 Owner 后续授权提交为文档 PR 并正常合入开发分支；
后续执行见 [200 小时授权](12-OWNER-200H-EXECUTION-AUTHORIZATION.md)，实际进度仍以私有回执为准。
