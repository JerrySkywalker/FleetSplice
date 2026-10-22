# Product development checklist

## U00 执行准入与基线整理

- [ ] 记录真实开发HEAD、160h授权、UTC截止、隔离worktree和writer lease。
- [ ] 生成每Goal独立MD及manifest；同步旧的待执行摘要，历史收据不改写。
- [ ] 按锁文件恢复局部依赖，复用qualified Node；只确认入口可编译。

## U01 Native支持契约增量核对

- [ ] 只对既有固定官方源码和当前官方源码的相关差异取证，不连接真实Native。
- [ ] 若无新的非修改loaded-thread观察契约，沿用PR23 BLOCKED；不重复旧审计。
- [ ] 若出现新契约，输出最小可复验源码/协议依据，后续PR23仍遵循其原合同，不自动合并或选择路线。

## U02 Desktop首次登录闭环

- [ ] 先写明首开认证、Cookie/窗口、正常OIDC与loopback bootstrap边界，复用Gateway既有认证。
- [ ] 让首次打开的Workspace能发现未登录并进入正常登录流程，成功后进入实际应用。
- [ ] 明确退出、过期和无认证配置状态；不复制浏览器profile或将旧token桥接到新窗口。
- [ ] 用合成IdP和一次性本地状态证明首开登录/身份；真实Native0/0。

## U03 Web与PWA会话状态体验

- [ ] 提供登录中、未登录、过期和登出状态，继续Mira/zh/en与可见焦点。
- [ ] 保留适用草稿、当前页面与待查回执；重新登录不自动重发命令。
- [ ] 覆盖认证失效后的禁用控制及重新认证，保持既有server fence/identity语义。

## U04 Manager与Workspace连续性

- [ ] 打开/返回/重复打开/关闭再开Workspace，保持明确origin和窗口目标。
- [ ] 切origin或身份时旧请求不能污染新目标；选择窗口不授予Controller。
- [ ] 实际URL验证与IPC边界保持；不新增Agent启动、daemon或生产生命周期路径。

## U05 可操作的连接与错误提示

- [ ] 针对网关不可达、未登录、Agent不可用、Native不支持和未知结果提供区别明确的提示。
- [ ] 动作限定登录、重新观察、查看细节等现有语义；原生命令不自动重试。
- [ ] 正常页面保持简洁，协议码可查，不添加通用fallback框架或第二套状态库。

## U06 实际Tauri自动化

- [ ] 优先采用官方支持的WebDriver路径，依赖只放隔离项目/测试用途，不改全局工具链。
- [ ] 实际测试二进制复用产品UI/Workspace路径，但不运行production setup或读取日常Agent控制记录。
- [ ] 自动化真实WebView的窗口/登录/IPC接缝；与普通浏览器mock证据分开。
- [ ] 驱动/会话环境不支持时限定排障后标BLOCKED，继续其他任务，不伪称真实GUI通过。

## U07 隔离产品链路联调

- [ ] 复用真实Hub/Edge、认证/通信/回执代码，仅Native端明确替换为合成Port。
- [ ] 验证登录→目标→会话→模拟操作→断线/过期→回执的完整流。
- [ ] 保持未知不重放、Viewer不能写、身份切换不串目标；不加入生产mock开关。

## U08 开发候选交付包

- [ ] 打包当前正式UI构建、测试专用入口、启动/停止脚本和直接可看的截图/短演示。
- [ ] 使用一次性profile及私有runtime目录，不触及日常环境；不制作或发布生产安装包。
- [ ] 确保候选可从明确入口启动，证据绑定HEAD/hash并列明模拟、实际桌面和未执行项。

## U09 集成评审与统一交接

- [ ] 复用已通过受影响检查，对最终变化做一次组合检查及新进程只读增量评审。
- [ ] 合格源码PR正常合并开发分支；研究PR23、main和发布不动。
- [ ] 生成私有FINAL-RECEIPT.json/OWNER-HANDOFF.md，汇总每Goal状态、PR/head、阻碍、关闭自建进程。
- [ ] H0-H4和GateS不代填；终态STOP_FOR_OWNER_160H_CANDIDATE_REVIEW。

检查/完成以实际收据为准；复选框不作为额外测试计划。真实Native、人工门禁、生产均不因SOURCE_COMPLETE通过。
