# H0 体验卡 — 合成 Web 与 Desktop 预览

`GOAL_ID=FLEETSPLICE-FPX-UX06-001` · `H0=READY_FOR_OWNER`  
`OWNER_EXECUTED=false` · `OWNER_APPROVED=false` · `REAL_NATIVE_EFFECTS=0`

这是一份可操作的 UI 候选。所有 Thread、消息、工具、审批和回执均为合成数据。
不会连接现有 Codex、运行命令、读取工作文件或消费历史原生授权。它不能证明 Native Adoption、真实手机或生产可用性。

## 启动与停止

使用隔离工作树的当前已合并开发分支；本机精确工作树、构建路径、SHA 和两个启动脚本见私有 `OWNER-HANDOFF.md`。
依赖及 Web 构建已在该工作树准备好。Web 启动：

```powershell
npm run demo:fpx
```

终端会给出私有 `LAUNCH-URL.txt` 的位置。在**新的浏览器标签**打开其中的本地 URL。
这是一次性演示 Hub 的既有 bootstrap，不是 Desktop Workspace 的新认证方案；不要粘贴到 Desktop 的 origin 输入框。
仅在演示终端输入下表场景名。输入 `quit` 或 Ctrl+C 停止这个演示，关闭其浏览器标签。
重启会建立新的合成环境，不恢复或重发旧命令。演示不应长期留在后台。

Desktop 使用 UX05 的 **`fpx-desktop-preview.exe`** 和专用一次性 WebView profile，私有交接给出启动入口。
它仅返回固定的模拟 Manager 状态，所有管理写操作都拒绝。不要为本次 H0 启动普通 Desktop 主程序，后者仍保留历史 Agent 启动行为。
预览的 Workspace 打开动作也被禁用；完整 Web 体验在上面的浏览器中评估。

## 五步体验（约 15–20 分钟）

1. **找到会话。** 用侧栏/抽屉或 Ctrl/Cmd+K 搜索 `MOCK` 会话，查看工作区和选中状态。Host/Environment 未提供时应明确显示未报告，不能冒充真实 Host。点击模拟 Acquire control，仅取得该夹具的控制权。
2. **读对话与工具。** 在 normal 会话输入一条不含私密内容的模拟文本；查看流式回答、工具完成以及 Accepted 与原生 Turn 完成的区别。切到 code/tool 会话，查看代码局部滚动和只读工具摘要。
3. **检查 Attention。** 终端输入 `approval`，切到 `fixture-thread-approval`；滚动 Attention 卡查看完整请求和模拟 Allow/Deny。输入 `viewer` 看不可发送但可准备草稿；输入 `controller` 恢复夹具角色；再输入 `external`，查看唯一 Review 动作。等待观察状态更新后再操作，过期 fence 应被拒绝。
4. **试窄屏和主题。** 调整到约 390px，打开/关闭导航、Context 和配置面板，确认 Composer、草稿、触摸目标、焦点返回、浅/深主题。`offline` 只切换夹具观察状态；`normal` 恢复观察。实际软键盘、折叠设备与手机网络仍需后续真实观察。
5. **最后试 UNKNOWN。** 确认已是夹具 Controller，终端输入 `unknown`，等最新状态可见，再发送一条模拟文本。界面应保留 Ambiguous/Unknown、只读查回执，不能自动重发。这个状态刻意不通过重置或刷新消除；完成后停止演示并关闭标签。再看 Desktop 的 Manager/Workspace 模式与明确的认证限制。

## 反馈与判定

请记录 `approve / revise / hold`，以及最影响使用的三个问题。重点是：是否找对会话、看懂 Controller/Viewer、理解未知结果、窄屏能否输入、是否存在重复或不明确的主动作。视觉偏好与权限语义问题分别记录。

H0 只有在 Owner 实际打开候选并给出反馈后才能填 `PASS_OWNER_OBSERVED`。回执需包含候选 SHA、视口、操作、反馈、Owner 执行/批准状态和实际截图。当前全为 **未执行**；自动化截图不替代这一步。

## 已知限制

- 手机审批区域需要内部滚动才能看到完整上下文和底部动作；这是 H0 重点体验项。
- Viewer 是这个合成 runtime 的整体角色；选择一个名字叫 viewer 的 Thread 不会自动改变权限，需用终端场景切换。
- 模拟 Port 不验证生产 Native Writer、OS 身份、锁、SDK 兼容性或真实审批竞态。
- Desktop 新窗口的首次本地认证尚缺独立契约；不能拿旧 bootstrap、控制 token 或浏览器 profile 绕过。
- H1、Gate S、H2–H4、原生 effect、Tencent、安装升级和最终产品路线均未获自动通过。
