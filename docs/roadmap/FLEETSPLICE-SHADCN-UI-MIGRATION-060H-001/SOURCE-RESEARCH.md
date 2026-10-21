> **Execution result,2026-10-22:** S00–S08 source delivery is complete. [RESULTS](RESULTS.md) and [H0 card](../../ux/sui-h0-owner-card.md) are current. Below preserves the original planning/research snapshot; pending statements do not override the later explicit authorization or actual receipts. H0/native are not accepted.

# Source research and transfer decisions

日期：2026-10-22（Asia/Shanghai）。这是源码/文档研究，不是依赖安装、视觉渲染或真实 Native 验证。

## 固定来源

| 来源 | 固定版本与读取范围 | 结论 |
| --- | --- | --- |
| FS 开发分支 | `f42313b5e32f73957d331227a967394f2f3ad805`；AGENTS、当前状态、FPX 合同与 H0 卡、组件和 token | 复用业务成果，替换呈现规范 |
| Paseo | `e522e6ea8e25140d2ef0c819986175ad6d6379b8` 的 [完整 design.md](https://github.com/getpaseo/paseo/blob/e522e6ea8e25140d2ef0c819986175ad6d6379b8/docs/design.md)，§1–§15 | 学习工程习惯，按 FS 职责转化 |
| shadcn/ui | `ba1503c64472b82256d9de95e2e62c5901a38e8b` 的 [preset 定义](https://github.com/shadcn-ui/ui/blob/ba1503c64472b82256d9de95e2e62c5901a38e8b/packages/registry/src/preset/preset.ts)、[默认配方](https://github.com/shadcn-ui/ui/blob/ba1503c64472b82256d9de95e2e62c5901a38e8b/packages/shadcn/src/preset/defaults.ts)、[style 目录](https://github.com/shadcn-ui/ui/blob/ba1503c64472b82256d9de95e2e62c5901a38e8b/apps/v4/registry/styles.tsx) | 固定 Mira，Lucide 替代 Mira 默认 Hugeicons 是官方支持的配方项 |
| 官方运行文档 | [Vite](https://ui.shadcn.com/docs/installation/vite)、[Blocks](https://ui.shadcn.com/blocks)、[AI Elements](https://ui.shadcn.com/docs/ai-elements)、[preset 命令](https://ui.shadcn.com/docs/changelog/2026-04-preset-commands) | 接入现有 Vite；组合 UI，不迁移服务端模型执行 |

Paseo 文档原始字节 SHA256：`f731c6b89e209ed819611f94bd0928c64caeae4d16f1bb82211266f218560f4b`。
完整原文仅保存在私有 artifacts，本仓库保存固定链接和本项目判断，不复制整份 donor 文档。
固定 Paseo 根 LICENSE 为 Apache-2.0 并保留第三方例外；shadcn/ui 为 MIT。本次不复制 donor 产品实现。

## Paseo 各节的工程含义

以下是阅读后的简要归纳，FS 的具体规则由 [design.md](../../ux/design.md)独立规定。

| Paseo 章节 | 学习点 | FS 转化 |
| --- | --- | --- |
| 1 Character | 安静、留白、以任务为中心 | 对话为工作主体 |
| 2 Component reuse | 相同语义同一组件 | 共用 shadcn 原件与少量业务组合 |
| 3 Hierarchy | 字重、颜色表达主次 | 身份、正文、诊断分层 |
| 4 Buttons | variant/size 各司其职 | 固定一份按钮使用表 |
| 5 Borders | 边界表达分组 | 撤去逐值、逐消息卡片 |
| 6 Pickers | 按选项规模/任务选控件 | 搜索会话、配置、详情使用适当组合 |
| 7 Density | 一致节奏、可读宽度 | 列表紧凑，正文宽松 |
| 8 Alignment | 内容轨道一致 | 图标、文字和动作对齐 |
| 9 Responsiveness | 窄屏先设计，共用内容 | Sheet 与宽屏复用逻辑 |
| 10 Copy | 简短直接、术语一致 | zh-CN/en-US 对齐 |
| 11 States | 状态出现在影响范围 | 局部失败不遮盖全部对话 |
| 12 Rows | 导航和行内操作可区分 | 选中不触发连接/授权 |
| 13 Status | 集中定义状态信号 | 同一业务状态共用映射 |
| 14 Forbidden | 用具体规则避免漂移 | 禁止页面私造通用控件 |
| 15 Canonical surfaces | 每类场景有参考实现 | S02 成为后续正式页面样板 |

这些习惯可迁移，Paseo 特定 RN 事件、窗口控制、Git/worktree/IDE 业务和颜色生成算法不成为 FS 的必需依赖。
特别是审批内容、控制权和 unknown 提示仍服从 FS 的明确契约，不能为追求安静而隐藏必要条件。

## 实际 FS 差距

当前 Web/Desktop 是 React 19 + Vite + Lucide + 自有 CSS，没有 Tailwind 或统一组件库。
`NativeAdoption.tsx` 已有 Thread 草稿、pending/receipt、控制权、阅读位置和 IME；这些是迁移资产。
`PreferencesControl.tsx`、`SessionNavigation.tsx` 有自写 dialog/focus/listbox；适合复用通用原件。
`AppShell.tsx` 已有 resize/drawer/VisualViewport，不能因换组件丢失这些行为。
Web/Desktop 全局 CSS、两套表面和六种旧主题是主要整理成本；同名 `--muted` 语义不同必须显式映射。
顶层 Fleet overview、Ownership、Attention、Context 和 footer 的重复展示需要合并，安装组件库本身不能解决。

## 已验证和仍待验证

已用固定源码内无网络/文件副作用的官方编码函数生成 `bdvw9FeS` 并逐字段 decode 比对；输入配方见 preset.json。
研究用系统 Node 实测 v24.5.0，仅运行编码器；它不替代执行时项目 qualified Node 的资格检查。
尚未运行 shadcn CLI、下载产品依赖、验证 React 19 构建、生成组件哈希、渲染 Mira 或取得 Owner 视觉通过。
S00/S01 负责这些实际交付；源码 pin 不是组件 registry 内容哈希，后续必须另记实际生成文件。
