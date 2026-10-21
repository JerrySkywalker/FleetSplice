# FleetSplice UI design contract

`DESIGN_VERSION=1` · `DATE=2026-10-22` · `IMPLEMENTATION=AUTHORIZED_SOURCE_ONLY_60H`

本文件是新 UI 的唯一呈现规范。修改界面前先读本文件，再读对应的 [SUI Goal](../../goals/shadcn/README.md)。
Owner 已决定替换旧自研外观，采用单一 shadcn 预设，学习 Paseo 的组件复用和规范执行习惯。
本文规定未来实现，不表示迁移、兼容性验证或 Owner 视觉验收已完成。

## 1. 依据和优先级

- 产品边界继续是 [Owner thesis](../product/owner-thesis.md) 和已接受的 [Architecture 0.1](../architecture/baseline-0.1.md)：已有环境中 coding agent 的控制平面。
- [来源研究](../roadmap/FLEETSPLICE-SHADCN-UI-MIGRATION-060H-001/SOURCE-RESEARCH.md)记录完整读取的 Paseo design.md、固定源码和本项目的适用性判断。
- 本文替代旧 UI grammar、pattern/cockpit contract 中的**外观、密度、常驻面板、主题和禁止 Tailwind**条款；线程身份、能力、审批、未知结果与权限语义继续有效。
- 不把 Paseo 的 RN API、工作区编辑器、终端、Git、daemon 操作或工程专用禁词移植为 FS 功能。
- H0 尚未通过；旧候选保存为历史，新候选在 S08 交接。规划合并不启动实现。

## 2. 唯一预设

[机器可读配方](../roadmap/FLEETSPLICE-SHADCN-UI-MIGRATION-060H-001/preset.json)：

| 属性 | 固定选择 |
| --- | --- |
| style / registry | Mira / `base-mira` |
| component base | Base UI；不与其他 base 混装同类基础控件 |
| baseColor / theme | Zinc / Zinc |
| icons | 已有 Lucide，统一线宽和尺寸层级 |
| font / heading | Inter / inherit，中文使用本机系统无衬线回退 |
| radius / menu | 官方 default / subtle accent / default color |
| modes | system、light、dark，属于同一预设的明暗模式 |
| preset code | `bdvw9FeS`；base 单独指定，不包含在编码字段中 |

规划阶段完成编码器 round-trip；执行 S00/S01 已由官方 CLI 4.22.1 实际生成、安装、构建并渲染控件样板。见本 train 回执。
S00 固定实际 CLI、组件依赖版本及生成输出；不能用 floating latest 建立不可复验的完成回执。
配方无法复现时记录准确差异，继续独立文档工作；不悄悄选择另一套风格。
字体随应用本地打包并保留许可，页面渲染不依赖外部字体 CDN；不安装全局字体。

## 3. 组件和文件习惯

- 通用 UI 原件集中在 `packages/ui/` 的私有源码目录，由 Web 和 Desktop 同用；不发布新的通用组件产品。
- 根 `components.json`、两个 Vite 入口与 TypeScript alias 指向同一目录；S01 确认适合现有构建的具体映射。
- 官方 Button、Dialog、Sheet、DropdownMenu、Select/Combobox、Command、Tooltip、Badge、Collapsible 是首选。先查现有组件，再按需加入。
- SessionList、Conversation、Composer、Approval/Unknown 等 FS 组合组件保留明确 props 和既有动作回调。
- 使用官方 Blocks 和 AI Elements 的合适组合，不整体导入 Next.js chatbot 或另建模型调用层。
- 初期保持生成组件原貌，差异集中在 token、尺寸 variant 和少量业务组合；不逐页面 fork Button、Modal、状态 pill。
- 不建设插件注册器、通用渲染引擎、配置驱动页面系统或第二套 UI 框架。
- 每次引入组件记录精确来源、版本和本地修改；代码、字体和图标保留适用许可。

## 4. 页面结构

| 表面 | 默认内容 | 按需内容 |
| --- | --- | --- |
| Workspace | 左侧会话列表、中央对话、固定输入区、一条紧凑标题栏 | 会话详情、模型/权限配置、完整身份/回执 |
| 窄屏 Workspace | 对话、输入区、会话标题 | 导航用 Sheet；详情全屏或 Sheet，一次只有一个活动覆盖层 |
| Fleet/Gateway | 现有 Host/环境/连接的列表与明确状态 | 当前对象详情；仅显示服务端已经提供的能力 |
| Desktop Manager | 已有管理列表与详情、Workspace 入口 | 相关设置与错误；不在对话顶部复制 Manager 仪表板 |
| Settings | 分组行与字段，宽屏限制可读列宽 | 复杂设置进入聚焦 Dialog 或详情页 |

Workspace 不再同时常驻 Fleet overview、Ownership 大卡、Attention 大标题和 Context 仪表板。
导航选择与真实连接/获得控制是不同动作；折叠信息不隐藏当前输入目标或可用控制权。
空会话提供短说明和一个适用动作，不伪造未报告的 Host/Environment。

## 5. 信息层级与密度

- 标题栏只负责身份、短状态和必要入口；大字号不用于每个区块。
- 默认控件文字约 14px，对话正文 15–16px；中文和系统缩放保持可读。具体值来自锁定组件和 token。
- 标题/分组使用适度字重，正文与行标题正常字重，次要上下文使用 muted foreground。
- 会话列表每行以名称为主，辅以一行简短上下文和一个活动标记；完整 UUID、PID、fence 放到详情。
- 导航、对话和输入区使用同一套对齐基准；图标、文字、尾部动作视觉对齐。
- 使用官方 spacing/radius 体系，不用全局缩放或随手缩小字体实现密度。
- 列表项以留白和选中背景区分；设置中相关行可共用一张卡，不给每个值单独加边框。
- 对话不逐段套卡；工具摘要为紧凑可展开行。长代码只在内容区横向滚动。
- 主动作在同一交互区域只出现一次。少量固定输入状态空间避免流式更新推挤输入框。

## 6. 颜色、主题与旧偏好

- shadcn 语义变量是新界面的颜色来源；业务状态使用一份共用映射，不按组件临时混色。
- 文本使用 `foreground` / `muted-foreground`；背景、边界、选择、焦点和 destructive 各自使用正确语义。
- FS 旧 `--muted` 表示文字色，不得直接绑定成 shadcn 的背景 `--muted`。
- 原 DTCG 数据和 Flutter portability proof 保持历史可追溯；若仍有旧表面消费，使用有限迁移映射并在清理完成后删除失效入口。
- 不在新页面保留六套自研皮肤。旧偏好确定性映射：`oled-black/midnight/graphite → dark`，`warm → light`，`system/light/dark` 原义不变；保留 locale。
- 不因升级弹出重新选择提示；映射只改界面偏好，不改变 Native 配置、权限或账号。
- 普通文字对比至少 4.5:1，必要控件/焦点可辨识对比至少 3:1；使用颜色同时给出文字或图标语义。
- 状态信息按实际重要性显现，不用满屏高饱和背景提醒正常 idle/working。

## 7. 状态和操作

| 状态 | 呈现与唯一动作 |
| --- | --- |
| 正常/working/done | 紧凑状态与时间线；不为正常状态重复生成通知卡 |
| Viewer / Controller | 输入区附近可见有效角色与目标；动作由已有服务端能力决定 |
| Approval | 时间线或输入区附近一个请求面板，先看到请求上下文与 Allow once / Deny；不能将危险命令藏到无意义确认语之后 |
| Unknown | 相关命令旁明确“结果未知”，保留回执查询入口；禁止重发、换 ID、刷新重放 |
| External advance | 明确需要检查的已观察状态，一处 Review 动作 |
| Observation offline / gap | 显示观察限制；不声称 Native 停止，也不把 recent history 称为完整历史 |
| 错误/加载/空态 | 放在影响范围内；字段错误在字段旁，页面错误在页面中，局部失败保留仍可用内容 |

Attention 可以合并为一个优先级入口，但语义不能被一个无解释的红点替代。
纯通知避免打断操作；审批、unknown 和与输入有关的控制条件不能只藏在全局通知中心。
UI 不生成权限，不实现第二个 Writer，不改变既有 identity/fence/Turn/Receipt 契约。

## 8. 输入、焦点与响应式

- 沿用已有每线程草稿和阅读位置；新组件与现有状态相连，不开第二条流式消息 store。
- Enter 换行，Ctrl/Cmd+Enter 调用同一 Send/Steer handler；IME composition/keyCode 229 不发送。
- 发送、Steer、Interrupt 的实际可用性由已有观察状态判断；UI pending 不冒充 native completion。
- 快速切换沿用本地匹配排序；Ctrl/Cmd+K、方向键、Enter、Escape 和关闭后的焦点返回有效。
- 模态层中的可交互内容和焦点受约束；触屏动作不能依赖 hover 才可见。
- 44px 触摸目标通过响应式 hit area 获得，不把所有桌面工具栏都做成大按钮。
- 宽度策略先满足正文：侧栏不能挤没输入区；临时收起不覆盖已保存的桌面宽度偏好。
- 覆盖层、可见视口、软键盘避让和 safe-area 继续使用已经验证的布局语义。
- 自动浏览器视口证据明确标为模拟；真实手机、折叠屏、物理 IME、DPI 体验由相应人工 Gate 证明。

## 9. 文案与动效

zh-CN/en-US 同时提供新文案，短句、明确动词、直接状态；保留协议标识原值及复制入口。
面向用户的主页面使用工作区、会话和控制等概念；原生技术细节在适用详情中解释。
状态改变不应造成无关区域跳动；动效只帮助理解展开、关闭、选择和反馈。
遵守 reduced-motion，流式输出不逐 token 动画。React Bits 默认不引入，所选反馈用现有 CSS 足够时不加依赖。

## 10. 交付判定

每个主要 Goal 提供一个可观察增量；S02 的代表页必须复用到后续迁移，不丢弃重做。
源码完成以具体构建、受影响交互和截图证据为准，不靠 grep 组件名称证明设计完成。
只做与改动直接相关的检查，最终做一次组合回归；不重复 Native 审计或全套 CI。
最终候选保持真实 Native 连接/effect 为 0；独立合成演示与只读 Desktop 预览不能证明实际 Native 可用。
H0 的视觉/可用性批准属于 Owner，自动截图只证明候选已准备好。
