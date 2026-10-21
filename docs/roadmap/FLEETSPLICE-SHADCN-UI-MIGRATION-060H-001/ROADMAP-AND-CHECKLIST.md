# Detailed roadmap and delivery checklist

规范：[design.md](../../ux/design.md)；任务：[9 个 Goal MD](../../../goals/shadcn/README.md)。
当前复选框均为计划，不能当完成证据。后续实际状态以准确 HEAD 的回执为准。

## 四步路线

### 第一步：固定规范与工程基础（S00–S01）

采用本次实际研究结果，锁定 preset/CLI/组件来源。根 components.json 与两个 Vite 入口接入同一私有 UI 源码目录。
先做可打开的控件/主题样板，验证 Base UI 的 Portal/focus、Lucide 和本地字体；不创建独立通用组件平台。
新页面使用 shadcn 语义 token，旧页面在迁移期间只留明确的适配边界。

- [ ] 记录执行授权原文、启动 UTC、截止 UTC、真实开发 HEAD、工作树与单一 writer。
- [ ] 复核固定 preset 只针对发生变化的字段；生成结果、CLI/包版本与文件哈希可复验。
- [ ] 通过锁文件安装局部依赖；使用现有 qualified Node，不改全局工具链或包管理器。
- [ ] `packages/ui/`、root components.json、Web/Desktop alias 和 CSS 入口形成同一来源。
- [ ] Button/Input/Textarea/Badge/Tooltip/Dialog/Sheet/Menu/Command 按真实首批需求加入。
- [ ] Base UI 和 Mira 不混装其他 base/style；组件本地修改与许可可追踪。
- [ ] 脱离外部字体 CDN 仍可显示中文和英文；保留既有代码字体。
- [ ] Tailwind Preflight 与旧全局 button/input/heading/pre 规则不相互覆盖。
- [ ] 新 token 不误用旧 `--muted`；Portal 与主文档使用同一主题。

### 第二步：构建可复用的代表页（S02）

在现有合成预览路径上展示正式候选。一个会话页包括列表、正文、输入区、详情和一处当前需要处理的操作。
覆盖 normal、approval、unknown 和窄屏，让视觉选择尽早落到可操作页面。
后续自主开发不以等待中途 H0 为前提，代表页截图是机器准备证据；Owner 最终接受保留在 S08 后。

- [ ] 移除 Workspace 顶部重复 overview；身份/角色在紧凑标题和输入上下文中清楚可见。
- [ ] 采用正式组件与既有状态，不能使用最后被丢弃的单独静态原型。
- [ ] 正常会话以对话正文为主体，不叠加正常状态通知卡。
- [ ] 审批面板直接展示必要上下文与唯一动作；unknown 保留回执查询而非重发。
- [ ] 1440×900 与 390×844 都可看到完整输入区，导航和详情可收起。
- [ ] 把布局/组件决定和有因偏差写进结果，后续沿同一路线扩展。

### 第三步：迁移所有现有表面（S03–S06）

| Goal | 主要文件所有权 | 必须复用 |
| --- | --- | --- |
| S03 | AppShell、SessionNavigation、layout/session-navigation、main、关联 i18n/CSS | 每线程选择、搜索排序、窗口尺寸/焦点状态 |
| S04 | Presentation、MessageText、NativeAdoption 呈现与 Composer、相关 UI 组合 | 原始消息身份、流式归并、复制、草稿、阅读位置、IME |
| S05 | Attention 呈现、PreferencesControl、SessionConfigBar、相关组合 | Controller、capability、requested/effective、exact approval/receipt |
| S06 | Desktop src/style、GatewayDashboard、共用 UI 引用 | 已有 Manager IPC/Workspace origin 边界与只读预览 |

- [ ] 左栏行名称、上下文、活动与选中状态可区分；未报告的 Host 不虚构。
- [ ] Quick Switch 用通用 Command/Dialog，保留本地匹配与方向键操作。
- [ ] 默认关闭 Inspector/Context；完整 Native ID/fence 保持可查、可复制。
- [ ] 窄屏抽屉、关闭焦点、触摸目标、键盘避让和保存宽度仍有效。
- [ ] 工具摘要为紧凑行；长正文和代码不撑宽页面、不被截断成假完成。
- [ ] 旧消息渲染/复制安全约束保留；不为换外观重写 Markdown 引擎。
- [ ] 草稿/pending/unknown 不跨 Thread，列表切换不触发 native connect/acquire。
- [ ] Enter 换行、Ctrl/Cmd+Enter 发送/Steer、IME 不误发，按钮与快捷键共用 handler。
- [ ] Attention 按现有优先级聚合；审批、Review、未知结果不出现两条独立命令入口。
- [ ] 模型/权限配置来自实际观察能力；requested 与 effective 继续分开。
- [ ] Desktop Manager 的按钮/列表/设置改用同一组件与 token，Workspace 仍用原授权 Web origin。
- [ ] Gateway 保留现有登录/连接状态；认证失败诚实呈现，不新增 token 桥、跨域授权或 profile 读取。
- [ ] 残存 legacy managed UI 若仍可到达，同样迁移通用外观；不可达片段仅凭引用证据删除。

### 第四步：收敛、反馈与交付（S07–S08）

- [ ] 只提供 system/light/dark，旧 appearance 值按 design.md 一次映射，locale 和非外观偏好保留。
- [ ] 两个应用入口不再导入旧自研皮肤的活动 CSS；历史 token/Flutter 证据不重写。
- [ ] 删除已替代的全局样式、重复按钮/模态/状态标记和没有消费者的组件；不清理相邻业务。
- [ ] 新文案有 zh-CN/en-US；中英文增长和长路径不挤掉操作。
- [ ] 焦点可见、名称可读、颜色不是唯一信号，触屏动作不依赖 hover。
- [ ] 短面板过渡和反馈遵循 reduced-motion；默认不引入 React Bits、持续动画或背景特效。
- [ ] 一次综合合成流程验证 Web、窄屏和 Desktop 只读预览，复用已有 fixture。
- [ ] Web 和 Desktop UI build；Rust/IPC 没变化时不重编全套 Rust、不制作安装包。
- [ ] 引用前序审查，末次差异/集成接缝一次聚焦独立只读审查；真实修正只复查增量，不反复全量审计。
- [ ] 提供当前候选启动/停止、实际截图、已知限制、FINAL-RECEIPT.json 和简短 OWNER-HANDOFF.md。
- [ ] `REAL_NATIVE_CONNECTIONS=0`、`REAL_NATIVE_EFFECTS=0`，H0=READY_FOR_OWNER，H1–H4/Gate S 不变。

## 60h 内的取舍顺序

优先保证规范统一、可操作的主会话页、审批/unknown 和窄屏输入，然后完成 Manager/设置、旧样式退出和最终交接。
额外动效、第三方装饰、全部无关组件、编辑器/终端/Git 功能不纳入；修正余量只用于已发生的本范围失败。
时间不足保留已通过切片并列明未完成表面；不能为了宣布迁移完成删掉未迁移入口、权限提示或现有功能。
