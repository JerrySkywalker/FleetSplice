# Codex CLI / ChatGPT 桌面端：资源补全扩展接口核实

- 核实日期：2026-10-31（Asia/Shanghai）。
- 类型：官方文档、固定提交源码与本机 CLI 只读检查；不是插件端到端验收报告。
- 对应设计：[资源感知 prompt 与异构执行工作台](../architecture/resource-aware-prompt-design.md)。
- 架构 gate 不变：`ARCHITECTURE_0_1_READY=false`，`IMPLEMENTATION_AUTHORIZED=false`。

## 1. 结论

1. **标准 MCP 有参数补全协议，但不赋予任意客户端输入框控制权。** `completion/complete` 为 prompt 参数和 resource template 变量返回候选；宿主决定是否调用及如何呈现。不能由此推断 Codex CLI 会显示 FS 灰字。
2. **ChatGPT 桌面端确有原生 Composer Mentions 扩展。** FS 可以通过 OpenAI MCP Extensions 提供动态搜索候选和资源标识；不需要为这一层先做独立 FS 桌面应用。它属于宿主特定扩展，不能称为所有 MCP 客户端都支持的标准能力。
3. **Mentions 不等于完整的 VS Code completion provider。** 已核实的搜索请求只有 `query`；没有全文、光标位置、任务范围、任意 `insertText` / `textEdit`、ghost text 或候选框自定义布局的公开契约。可以做宿主原生资源候选，不能承诺与设计图逐项一致。
4. **本机 Codex CLI 0.164.0 以及本轮检查的源码/配置，没有找到普通插件可注册任意 FS 原位灰字的受支持接口。** 内建 mention/file/skill/command 菜单的存在不等于动态第三方资源 completion provider。
5. **外部编辑器和 FS 自有输入组件是可行的适配方向。** CLI 的 Ctrl+G 外部编辑器通道有官方文档和发布版源码支持；完整灰字可放在外部编辑器里。自有 TUI 可经 app-server 使用 Codex，但这都是 FS 拥有的输入表面，不是向 stock Codex TUI 注入灰字。
6. **精确 GUI 编辑体验也不必立刻变成独立桌面安装包。** MCP App 可以在 ChatGPT 面板内承载 FS 自有编辑器；网页编辑器也是选项。需要的是输入组件所有权，是否独立打包是下一层产品取舍。

## 2. 核实范围与证据等级

本轮实际执行：

- 本机 `codex --version`：返回 `codex-cli 0.164.0`。
- 本机 `codex --help`：确认 `completion`、`plugin`、`mcp`、`app-server` 和 `--remote` 等入口的说明。
- 打开官方 CLI customization、Hooks、Plugin Extensions、MCP UI、App Server 和 Composer Predictions 文档。
- 读取 MCP completion 标准、OpenAI MCP Extensions 协议与 TypeScript SDK。
- 对照 CLI 0.164.0 对应的发布提交读取 composer、popup state、配置 schema；另检查 2026-10-31 的 main composer。

没有执行：

- 没有安装或注册 FS MCP server、插件、浏览器扩展或全局 hook。
- 没有打开或控制真实用户的原生会话，没有发送消息、启动模型任务或连接 app-server。
- 没有对 ChatGPT 内部实现或闭源输入组件作源码级声明。
- 没有改用户配置、读取凭据、运行产品构建或解除架构 gate。

因此，本文的“支持”指公开契约已存在；“适配可行”指基于契约的工程推导；只有以后完成真实客户端验收才能写成“FS 接入已跑通”。

## 3. 标准 MCP：能补参数，不能指定宿主输入行为

[MCP Completion 2025-11-25](https://modelcontextprotocol.io/specification/2025-11-25/server/utilities/completion) 定义 `completions` capability 与 `completion/complete`。请求关联 `ref/prompt` 或 `ref/resource`，包含参数名、当前值，并可携带之前已填参数。返回值是候选字符串与分页信息。

协议刻意不规定使用下拉框、popup 还是其他 UI。它没有给服务器安装宿主按键处理器、读取任意编辑器光标或绘制灰字的权限。

对 FS 的含义：

- 资源目录、能力查询、资源解析、执行/取消/状态等可以设计为 MCP 工具/资源；执行效果仍需要 FS 后端与资源准入支持。
- 结构化 prompt/resource template 参数可利用标准 completion。
- 自由文本 prompt 中的任意位置补全，需要宿主主动实现输入映射与 renderer。
- 本轮没有验证 Codex CLI 或 ChatGPT 是否会对 FS 自定义参数调用标准 `completion/complete`；不应把标准存在当成这两个宿主已接入。

## 4. ChatGPT 桌面端：原生候选可做，完整 IntelliSense 未获证明

### 4.1 已核实的 Composer Mentions 契约

[官方扩展入口](https://developers.openai.com/plugins/build/extensions) 明确列出 Composer Mentions，并把它描述为在桌面 composer 中查找和选择插件内容。

固定到 OpenAI MCP Extensions 提交 `9e6d418439cca0790bece62f6cd886ad4c04f133`（2026-10-30）：

- [协议的 Composer At-Mentions 章节](https://github.com/openai/mcp-extensions/blob/9e6d418439cca0790bece62f6cd886ad4c04f133/docs/spec.md#composer-at-mentions) 定义 `openai/mentions`，其中 `searchTool` 指向一个只读工具。
- 搜索工具需要 `annotations.readOnlyHint=true`，并对 app 可见。
- 输入是 `query: string`；返回 `structuredContent.items`。协议示例返回资源链接。
- [SDK server/mentions.ts](https://github.com/openai/mcp-extensions/blob/9e6d418439cca0790bece62f6cd886ad4c04f133/typescript/src/server/mentions.ts) 中的 `setHandler` 注册 `search_mentions` 工具及 capability，搜索不依赖先让模型推理一次。
- [SDK shared/mentions.ts](https://github.com/openai/mcp-extensions/blob/9e6d418439cca0790bece62f6cd886ad4c04f133/typescript/src/shared/mentions.ts) 的 schema 确认输入仅有 `query`；结果除 `ResourceLink` 外也接受带 title/subtitle/resourceUri 的 resource item。文档与 SDK 的结果描述宽度不同，实施时应以目标版本实测为准。
- 该提交的 [SDK package metadata](https://github.com/openai/mcp-extensions/blob/9e6d418439cca0790bece62f6cd886ad4c04f133/typescript/package.json) 标注版本 `0.2.1`、Apache-2.0；本轮只阅读，没有引入依赖或 donor code。

FS 可以把机器、环境、模型端点或工具实例表达为有稳定 URI 的资源候选。候选选中仍只是资源引用，不应产生执行副作用。

### 4.2 未获公开契约支持的部分

本轮检查的 schema 没有提供：

- 完整草稿与当前光标、selection、replace range；
- 自定义触发字符或逐键事件注册；
- LSP 风格的任意 text edit / snippet / commit character；
- 插件控制灰字、列表布局、候选详情侧栏或接受键位的接口。

这是已查协议的边界，不是对所有未公开接口作“不可能存在”的判断。SDK schema 中也没有这些字段，不能把任意 `_meta` 数据理解为宿主一定会处理的 UI 指令。

因此可分两档：

- 原生轻量档：使用宿主 `@` 入口，FS 提供候选；外观和接受行为服从宿主。
- 精确交互档：在 FS 自有输入组件实现设计图中的列表、详情和 token 替换，可嵌入 MCP App，也可在 FS 网页/桌面端中使用。

只有查询词还不足以可靠知道“这是任务 2 的执行位置而不是任务 1 的推理端点”。可先研究在查询中显式携带 role/scope，或让用户选择结构化 binding；不能假定插件能从原生 composer 自动读出完整上下文。资源选择传到最终执行请求后，仍需验证 URI、作用域及约束是否完整保留。

### 4.3 面板内编辑器与草稿交接

[官方 MCP UI 文档](https://developers.openai.com/plugins/build/chatgpt-ui) 允许在隔离 iframe 中运行 MCP App，通过 bridge 通信；[扩展文档](https://developers.openai.com/plugins/build/extensions) 还定义 sidebar/thread entrypoint。

由此推导：FS 可以在自己的 MCP App 面板内提供真正可控的 prompt 编辑器和候选列表，不必先发布独立桌面程序。这是 FS 的自有 UI，只是由 ChatGPT 承载；不能描述成修改了 ChatGPT 原生输入框。

固定协议还提供 [`ui/message` 的 OpenAI 扩展](https://github.com/openai/mcp-extensions/blob/9e6d418439cca0790bece62f6cd886ad4c04f133/docs/spec.md#uimessage-extensions)：

- 协商 `openai/message` 支持后，可对受支持的 target/send 组合指定 `send:false`。
- active draft 的行为是追加内容；new target 可以打开新的可编辑草稿。
- 缺省行为会发送，故 FS 的“放回草稿”必须显式选择不发送，并检查宿主 capability。
- 这个接口不是任意光标处替换，也不是原生草稿全文读取/双向同步。协议还提醒组件不会收到用户移除某些 composer item 的通知。

原生候选、MCP App 内编辑、追加到草稿是三条不同路径，不能混称为同一种原位补全。

### 4.4 可用范围的文档差异

核实当日官方入口页称 Composer Mentions 仅桌面可用，而固定协议的 platform matrix 也对 Web 标为 supported，并说明这里的 Web 指 Work browser、排除 classic ChatGPT。该差异不影响桌面契约存在的判断，但不能据此承诺经典网页端或特定账号已启用。本文不验收 Web/账号覆盖率。

## 5. Codex CLI：内建候选不等于第三方原位灰字接口

### 5.1 发布版与取样源码

本机 `codex-cli 0.164.0` 对应上游 tag `rust-v0.164.0`，tag object 为 `fe3b29455488c2e189e43ad5526a107900c5e1b7`，commit 为 `6aaac694803004a63c6f393d153c96d22521a6b9`。

读取的发布版文件：

| 文件 | 固定来源与观察 |
| --- | --- |
| Chat composer | [chat_composer.rs](https://github.com/openai/codex/blob/6aaac694803004a63c6f393d153c96d22521a6b9/codex-rs/tui/src/bottom_pane/chat_composer.rs#L29)，blob `90e854d12876d8bf2e0763e2253b5593aa77e4b9`；mention 菜单、候选同步和键盘处理由 TUI 自己实现 |
| Popup state | [popup_state.rs](https://github.com/openai/codex/blob/6aaac694803004a63c6f393d153c96d22521a6b9/codex-rs/tui/src/bottom_pane/chat_composer/popup_state.rs)，blob `fdc422c8b80229d9e76c6ce5d1fd9f4fd801fdb2`；候选状态为内建 Command/File/Skill/MentionV2 变体 |
| Config schema | [config.schema.json](https://github.com/openai/codex/blob/6aaac694803004a63c6f393d153c96d22521a6b9/codex-rs/core/config.schema.json)，blob `cce71e46c17084a76d7d7ad7945145f3d4d1a256`；检查 Tui 和 HooksToml 定义，没有自定义灰字 provider 或逐键 completion 事件 |
| External editor | [external_editor.rs](https://github.com/openai/codex/blob/6aaac694803004a63c6f393d153c96d22521a6b9/codex-rs/tui/src/external_editor.rs#L164)；写入临时 Markdown 文件，启动配置编辑器、等待结束，再读取修改后内容 |

另检查当日 main commit `67f0994b532b8740f14b5b738af7b7b2a915b1d6` 的 [composer](https://github.com/openai/codex/blob/67f0994b532b8740f14b5b738af7b7b2a915b1d6/codex-rs/tui/src/bottom_pane/chat_composer.rs)，blob `e7769e31390a01f99bb9f330d45ff5de6bbe1d90`。该取样没有发现对外注册任意 FS 灰字 provider 的路径；这不等于完整审计整个仓库所有未来分支。

应修正“CLI 的 @ 仅搜索文件”的过度概括：这个发布版源码的默认 `mentions_v2` 会列出 plugin、文件和 skill；关闭该功能后才回到旧的 file-only `@`。这是源码观察，没有修改本机 feature flag，也不保证账号/远端服务器实际启用状态。

### 5.2 三种容易混淆的扩展

- [Shell completion](https://learn.chatgpt.com/docs/cli-customization)：`codex completion zsh` 生成 shell 命令补全脚本。不能因此改变已进入 Codex 后的 TUI 草稿。
- [Lifecycle hooks](https://learn.chatgpt.com/docs/hooks)：UserPromptSubmit 等作用于提交或 agent 生命周期；发布版 schema 也包含 model request 事件。它们不是每次按键/光标变化的输入扩展。
- [Composer Predictions](https://learn.chatgpt.com/docs/features/composer-predictions)：官方描述的是桌面端根据会话建议后续消息的内建功能；不能据此认定 CLI 或第三方 MCP 可以注册资源补全模型。

`--no-alt-screen` 改变终端绘制模式；`--remote` 更换 app-server 连接位置。两者都不表示 shell 的行编辑器接管了 Codex composer。

### 5.3 可采用的适配方向

1. **外部编辑器：优先验证。** 官方 [Ctrl+G / VISUAL / EDITOR 契约](https://learn.chatgpt.com/docs/cli-customization) 与发布版源码一致。FS 终端编辑器或已有编辑器扩展可处理资源灰字，关闭后交回文本。代价是一次编辑器切换；不能称为 stock Codex 输入框里的原位灰字。临时文本文件也不自动携带结构化 binding，需设计可往返的文本/URI 表示。
2. **FS 自有 TUI + app-server：完整控制输入。** [官方 app-server 文档](https://learn.chatgpt.com/docs/app-server) 明确面向自有客户端集成。FS 可拥有 prompt buffer 和灰字 renderer，再提交给 Codex。这里改的是前端；协议能力、认证、审批、历史和版本兼容需另验收。
3. **修改 Codex TUI / 推动上游接口：能做工程研究，但维护成本更高。** 若坚持就在 stock composer 里显示动态 FS 灰字，当前不能把普通 MCP 插件列为已经成立的方案。维护 fork 与新增官方 provider 接口应视为单独选择。

PTY overlay、截获所有终端按键、模拟粘贴等没有在本轮获得稳定契约证明，不作为首选方案。也不能把 app-server 视为任意已打开桌面会话的无副作用控制接口；本轮没有验收这种 native adoption。

## 6. 能力分层矩阵

| 需求 | 标准 MCP 足够？ | 还需要什么 | 是否必须独立 FS 桌面程序 |
| --- | --- | --- | --- |
| 目录、状态、解析、执行 API | 可作为传输/工具接口 | 实际资源后端、权限与准入 | 否 |
| 已声明 prompt/template 参数候选 | 标准有协议 | 宿主调用并展示；两目标宿主未实测 | 否 |
| ChatGPT 原生资源候选选择 | 仅标准不足 | OpenAI Composer Mentions 扩展 | 否 |
| ChatGPT 原生任意位置完整 VS Code 补全 | 未查到足够契约 | 更强宿主编辑 API；当前应移到自有组件 | 独立程序也不能凭空给 stock composer 加接口 |
| ChatGPT 内 FS 自有编辑器和完整候选框 | 可用 MCP Apps 承载 | FS 前端、bridge、必要 OpenAI 扩展与 capability 协商 | 否，可用面板 |
| Codex stock TUI 原位 FS 灰字 | 未查到受支持插件路径 | 上游新接口或 TUI 源码修改 | 不必独立桌面程序；但普通 MCP 不足 |
| Codex 外部编辑器里的灰字 | MCP 可供给候选数据 | Ctrl+G 输入适配、编辑器 renderer、文本往返 | 否，可为轻量终端工具 |
| 自有终端/Web/桌面的统一精确输入行为 | MCP 可供给后端数据 | FS 拥有输入组件；Codex 可经 app-server 接入 | 需要 FS 自有前端，不必独立桌面打包 |
| 跨机任务时间轴和会话观察 | MCP 可暴露查询/事件 | FS 事件关联与视图；编排权仍归 CL/CLE/CLF | 可先面板或 Web |
| 无公开 API 的原生桌面专属能力 | MCP 可封装局部控制适配器 | 本地运行环境、桌面/可访问性接口与可靠性验证 | 尚不能认定必须；取决于本地控制与常驻体验需求 |

严格说，当前证据没有证明“仅为了补全就必须独立开发 FS 桌面安装包”。它证明：某些精确交互需要 FS 控制输入组件；某些原生执行能力可能需要本地 runtime；这两项不等同于必须另做一套桌面聊天客户端。

## 7. 建议顺序与待验证项

以下是未来获准后的验证设计，不是启动产品实现：

1. ChatGPT 原生轻量路径：资源目录 + mentions；验证输入查询、空查询、同名环境、稳定 URI、取消、最终消息保留和多任务作用域。首轮接受宿主原生候选外观。
2. CLI 路径：Ctrl+G 外部编辑器往返；验证多行中文、光标、灰字接受、部分路径接受、Esc、不丢前后文和不自动发送。
3. 精确 GUI 路径：MCP App 内 FS 编辑器；验证 IME、替换范围、撤销、异步结果乱序、接受期间负载变化、草稿交接与重复追加。
4. 只有用户明确要求始终处于同一 TUI 时，再比较自有 TUI/app-server 与维护 Codex patch 的成本。
5. 把多机执行能力与补全分别验收：选中的资源必须能解析、校验并形成有来源的执行结果；MCP 资源选中不代表 dispatch 成功或持有执行租约。

验收前的关键 unknown：目标 ChatGPT build/账号是否开放扩展；原生 mention 在最终消息中的位置/结构；active/new draft 的具体 capability 组合；当前 CLI 是否增加了新的输入 provider；真实端点、许可证及跨机状态的新鲜度。它们不应在没有实测时写成 FS 已实现承诺。

## 8. 取证局限与复查方法

取证中 GitHub connector 后续出现传输错误，直连请求也出现 EOF；改用已获取的固定提交内容和可读取的官方源码页面完成必要交叉检查。未成功取得的额外目录和文件不作为证据。没有因为后续读取失败，把“未取得文件”写成“不存在接口”。

复查时：先确认 CLI 版本，重新固定 release/main commit；对照 composer 的输入与绘制路径、Tui/Hook schema、OpenAI mention/message schema，再运行真实宿主中的最小验收。区分协议声明、宿主 capability 和实际 UI 行为。
