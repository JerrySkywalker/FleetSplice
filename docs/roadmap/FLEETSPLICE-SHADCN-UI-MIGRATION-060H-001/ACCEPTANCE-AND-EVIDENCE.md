# Acceptance and evidence

本次规划只验证 Markdown/JSON/引用/DAG/预设配方和 diff；不运行产品构建、完整 CI、Native 审计或合成体验来冒充实现。
下表是未来获得执行授权后的最小验证计划。用例仅在受影响时运行，已有通过且未变化的证据可继续引用。

## 变更与检查

| 改动 | 最小必要检查 | 证据 |
| --- | --- | --- |
| S00 文档/锁 | JSON、配方 round-trip、来源与实际版本/生成哈希 | DOCS_AND_SOURCE_METADATA |
| S01 UI 基础 | qualified Node 类型检查、Web/Desktop UI build、一个主题/Portal/控件样板 | TESTED_UI_COMPONENTS |
| S02 代表页 | normal/approval/unknown 的一个合成页面流程，1440/390 两个视口截图 | SYNTHETIC_BROWSER |
| S03 导航 | 既有 `fpx-session-navigation`、必要 `fpx-responsive` 受影响场景 | SYNTHETIC_BROWSER |
| S04 对话 | `fpx-conversation` 受影响场景；现有消息安全/复制用例仅改动时补验 | SYNTHETIC_BROWSER |
| S05 Attention/设置 | `fpx-attention`、配置/Preferences 相关行为 | SYNTHETIC_BROWSER |
| S06 Desktop/Gateway | `fpx-desktop` 相关 UI flow + Desktop UI build；固定 IPC mock | SYNTHETIC_BROWSER / TAURI_READ_ONLY_PREVIEW |
| S07 样式/偏好 | 改变的偏好映射与 token 一致性，浅/深主题和 reduced-motion | TESTED_PRESENTATION |
| S08 交接 | 一次综合 `fpx-owner-preview` 流程和最终截图、两入口构建、末次差异与集成接缝审查 | SOURCE_COMPLETE / READY_FOR_OWNER |

现有测试文件名是定位入口，执行时先检查实际 scripts 与用例选择方式；不用会启动真实 Native 的 `accept:native-*`。
可复用 `scripts/with-qualified-node.mjs` 编译 `tsconfig.test.json`，再只运行对应 compiled test 文件。
构建覆盖 JS/CSS 接缝，不在每个只有文案变化的提交重复 Web/Desktop build。
首次集成/终态两个构建点覆盖不同候选；若终态输入未改变且已有相同 tree 构建证据，可引用而不重跑。
失败只在实质修正后复验有关部分，不把几十个旧断言复制成新测试。不修改服务端契约来迁就界面。
最终审查引用前序准确候选的已通过报告，只审未覆盖的末次差异和集成接缝；无变化源码不重复全量审计。

## 合成验收矩阵

| 场景 | 观察重点 | 必须保留的反例 |
| --- | --- | --- |
| 空/加载/观察错误 | 不同短文案，现有入口可操作 | 不捏造 Host、连接或停止状态 |
| normal / working / done | 对话是主体，短状态、单一输入区 | Accepted 不等于 completed |
| long code / tool | 复制原文，工具可展开，局部横滚 | HTML inert；不能撑宽整个页面 |
| Viewer / Controller | 当前输入目标和角色明确 | Viewer 不能发送；选中不等于 acquire |
| approval | 完整请求上下文、Allow once/Deny 可见 | exact request/Thread/Turn/fence 不变；竞态由现有拒绝语义处理 |
| external review | 只有一条适用 Review 路径 | 不自动接受新原生状态 |
| unknown | 保留临时消息和回执查询 | 无自动重发、换 ID、重连 replay |
| offline / gap | 观察限制和 recent-history 范围明确 | 不声称原生停止或完整历史 |
| 切会话/输入 | 草稿和阅读位置隔离，快捷键清晰 | IME 不误发；pending 不跨 Thread |
| Desktop | Manager/Workspace 语义、设置和错误一致 | 无新增 IPC 权限、Agent 生命周期或认证绕过 |

截图最小组合：1440×900 深色 normal、1440×900 浅色 approval、390×844 深色 unknown、390×844 浅色导航/输入、1024×768 适应、360×740 窄屏、960×680 Manager。
900×700 展开态与150%桌面缩放只做布局变更影响的检查，不把所有状态×主题×视口做笛卡尔积。
每张截图注明 fixture、theme、viewport、candidate SHA；脚本截图必须实际查看，不能只证明 PNG 文件存在。
最终图像不是与旧丑界面的像素一致性比较，而是检查新 design.md 的层级、溢出、遮挡、可读性和一致性。

## 可观察通过标准

- Workspace 默认一个应用标题区；Fleet overview 不再叠加在当前对话顶部。
- 当前 Thread/角色能在紧凑上下文中辨认，完整 IDs 可在详情查阅；没有永久诊断仪表板挤压对话。
- 390px 下可进入会话、读消息、查看审批、操作输入；底部/覆盖层不遮住必需动作。
- 窄屏导航/详情不互相叠出两个活动模态；Esc、关闭和焦点恢复有效。
- 状态变更不引入无关大块排版跳动；工具输出和实时文字不夺走用户主动滚离的位置。
- 浅/深色文本对比、焦点、44px 触摸目标、键盘导航、zh-CN/en-US 与 reduced-motion 符合 design.md。
- Web 和 Manager 同一组件/主题来源；可达 legacy 表面不遗留一套旧外观。
- 功能正确性和视觉层级分别检查；测试通过不能代替 Owner 的审美接受。

## H0 与 Native 边界

S02 的早期候选不要求中途逐项确认；自动推进只限后来明确批准的 source-only 范围。
S08 输出 `H0=READY_FOR_OWNER`、`OWNER_EXECUTED=false`、`OWNER_APPROVED=false`。
只有 Owner 实际打开**准确候选**并反馈后，才可登记 H0 观察/批准。
旧 [H0 卡](../../ux/fpx-h0-owner-card.md)作为功能场景参考保留，不挪用其候选 SHA。

使用已有 `demo:fpx` 合成 Port 和 test-only Desktop preview；不得启动普通 Desktop 主程序（历史 setup 可能启动 Agent）。
若独立 worktree 没有可用只读预览二进制，可构建该已存在 test-only example，一次构建只为交接所需；不运行生产 setup。
Desktop 完整内嵌认证仍为既有 blocker；mock Window/IPC 不证明真实登录或 Workspace 连续性。
所有 Native 连接/effect 指标都针对受测原生 runtime；研究/构建/独立评审驱动不能冒充受测 TUI/Server/Thread。
本 train 的受测 `REAL_NATIVE_CONNECTIONS=0`、`REAL_NATIVE_EFFECTS=0`；不消费 PR20 的旧 ACK 授权。

## 回执

私有 `FINAL-RECEIPT.json` 至少记录 PROGRAM_ID、准确起止/截止、elapsed、预算授权来源、base/candidate/merged HEAD、
各 Goal 实际状态/PR、检查命令和退出码、截图索引、源与生成物 hash、Native 计数、H0、真实阻碍和唯一下一步。
`OWNER-HANDOFF.md` 给准确启动/停止、需要看的场景、已知未执行项和候选来源。
公开目录只保存脱敏结果和合成 fixture；凭据、bootstrap URL、控制 token、私有全文/截图路径不进入 PR。
终态固定 `STOP_FOR_OWNER_SHADCN_UI_REVIEW`；遇预算到期或 blocker 仍用此终态并另外标明 partial/blocked。
