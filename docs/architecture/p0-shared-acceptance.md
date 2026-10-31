# P0：MCP 与 FS 客户端共用验收设计

- 日期：2026-11-01（Asia/Shanghai）。对应契约：[`0.1-draft.1`](p0-interface-contract.md)。
- 状态：验收向量、预期与证据要求；**本轮未启动 FS、MCP、driver 或 CL，运行用例均未执行**。
- 本文件是架构文档，不是测试实现、测试通过报告或产品实现授权。`ARCHITECTURE_0_1_READY=false`；`IMPLEMENTATION_AUTHORIZED=false`。

## 1. 三条路径与共同判据

未来对同一向量分别运行：H = headless 公共接口；M = 真实 MCP 工具调用进入同一应用服务；U = FS 客户端将编辑器绑定编译为请求并直接调用该服务。M 不要求聊天模型参与；验证的是实际工具调用后的契约，不把宿主 prompt 传参忠实性混为一谈。

P0 只作人工契约推演和文档检查；P1 执行 H/M 与 Edge 闭环；P2 必须从实际 FS 编辑器执行 U，不能用直接 API 调用冒充 GUI 验收。P3 再执行真实两 Host 的异构联动。使用 driver double 可以验证故障分支，但不能替代实际 driver 对启动、完成、取消和产物能力的证明。

共同判据：normalized_spec、spec_digest、资源绑定、幂等语义、phase/observation/cancel、结果、错误 code/recovery 相同。不同独立部署产生的时间/不透明 ID 无需逐字相同；同一服务、同一 principal、同一 request_id 的跨入口重复请求必须返回同一 run_id。比较的是结构和事实，不比较自然语言回复措辞。

每例使用干净状态或独立 request_id，除非该例专门测试复用。成功/失败都记录实际 dispatch/native-start 次数、Run/command 身份、来源事件和结果摘要；只看 MCP 文本或 UI 截图不足以证明执行正确。

## 2. 公共样例目录

下表均为未来验收资源，当前不存在。引用 generation 初值均为 1；使用 [契约中的完整 RunSpec](p0-interface-contract.md) 作为 BASE，按用例仅修改声明的字段。

| 样例 | 关系/行为 |
| --- | --- |
| principal-a | 同一 FS 身份分别从 H/M/U 访问；可见 A/B，具有提交、读取、取消权限 |
| principal-b | 无权看 A 的 Run、资源、产物；客户端自报 principal-a 不改变授权 |
| host-a / env-a-user | 第一台真实 Host 的用户环境；fresh/online |
| ws-a / rt-a | 都在 env-a-user；rt-a 具备 BASE 所用能力，输出受管理文本结果 |
| profile-a / model-a / tool-a | 与 rt-a 兼容；profile/tool 可位于其他环境，但兼容必须由 driver 证明 |
| host-b / env-b-user / ws-b / rt-b | 第二台真实 Host，不能用 A 的 WSL/容器代替；P3 选择不同环境/driver 路径 |
| limited-runtime | 不支持指定 inference/tool/max_workers 之一，用于明确拒绝；不假定所有真实 harness 都支持 BASE |
| artifact-a | A 成功后产生的不可变文本结果，清单含生产 Run、字节数、SHA-256；初始不存在 |

P1 实际 driver 不支持某个可选绑定时，先移除相应可选字段完成基本闭环，并把该可选能力记为未验证；不能通过声称兼容来让 BASE “通过”。P0 的负向拒绝要求仍然适用。

## 3. 共用用例

以下均为未来预期，状态统一为“设计完成、待运行”。H/M 为 P1 基础路径，U 在 P2 重放相同向量；标为 P3 的向量不能由 P1 单机结果代替。

| ID | 输入/故障注入 | 共同预期与关键证据 |
| --- | --- | --- |
| C01 目录与选择 | list 资源；UI 由显示别名选中 A；M 使用同一个 ref | 两者生成相同 ID/generation；显示 Host/环境/观测新鲜度；缺负载时显示未知而不是 0 |
| C02 validate 无副作用 | BASE 连续 validate 两次 | 相同 normalized_spec/digest；无新 Run、命令、容量预留或原生进程；validated_at 不代表预留承诺 |
| C03 请求格式 | 缺 target/runtime、未知字段、版本不支持、非法 null/类型、重复 tools/inputs；对 FS 自己解析的文本加入重复对象键 | INVALID_REQUEST 或 VERSION_UNSUPPORTED，受理数/派发数为 0；协议解码前已被宿主拒绝的输入另记协议错误 |
| C04 身份/层级/代次 | workspace 属于 B 却绑定 A；指定过期 generation；只给模糊别名 | 确定拒绝，指出允许公开的错误字段；无改投、权限提升或 native-start |
| C05 能力与硬限额 | 向 limited-runtime 指定模型/额外工具/max_workers=1 | CAPABILITY_UNSUPPORTED；不悄悄删字段。对不能限制嵌套 worker 的 driver 同样拒绝 |
| C06 观测与容量竞态 | validate 成功；submit 前改为 offline/stale/容量不足；另测受理后 Edge 才发现代次变化 | 前者明确 not_accepted；后者保留原 Run，失败/拒绝原因可查；都不能换目标。validate 不充当执行授权票据 |
| C07 成功闭环 | submit BASE；Edge 确认运行及完成；读取 artifact-a | 返回持久 run_id/logical_session_id；实际 native 身份另记；succeeded 有完成证据；分块读到真实内容并校验长度/摘要 |
| C08 顺序/并发幂等 | 同 principal 同 spec/request_id，先 M 再 U/H；另做并发重送 | 同一 Run、LogicalSession 和派发意图；Edge 原生启动一次；连接/入口类型不形成新幂等命名空间 |
| C09 内容比较 | 重排键、补齐默认值、调整 tools/inputs 顺序；再改 prompt/scope/correlation 或一个目标 | 等价内容返回原 Run；实质变化返回 IDEMPOTENCY_CONFLICT；旧请求不被覆盖，修订需新 request_id |
| C10 submit 回包丢失 | Hub 提交受理事务后丢响应；按原 request_id get，或同键同 spec 重送 | 查到原 Run；无重复启动。查询短暂 NOT_FOUND 时也不能换键；未知响应给出 OUTCOME_UNKNOWN/lookup_request |
| C11 Hub 崩溃窗口 | 分别在事务前、事务后派发前、派发后回执前中断并恢复 | 未提交不能宣称 accepted；已提交恢复原幂等映射/command；重复派发由 Edge journal 收敛；证据须覆盖窗口，不能只重启 UI |
| C12 Edge 崩溃/重放 | native 启动后回执丢失；重放 command；另测副作用后 journal 尚无法确认的窗口 | 已知命令返回原结果；不确定窗口标记 reconciling 并检查原生身份；无法确认时不重启第二份工作、不声称 exactly-once |
| C13 断连与观测 | running 时切断 Hub↔Edge，随后恢复 | Edge 继续拥有进程；phase 保留最后已知值、observation=stale/reconciling；无伪 failed/idle/completed；恢复同一身份和缺失事件 |
| C14 取消与断连 | 对长任务 cancel；停止确认前读状态；断连期间再 cancel | cancel.requested=true 不等于 cancelled；重复意图合并；重连后由 Edge 停止证据才进入 cancelled；无停止证据则保持 pending |
| C15 取消竞态 | 同键重复 cancel、同键换目标、不同键重复 cancel、cancel 先于 create、取消回包丢失、自然完成与取消并发；取消已终态 Run | 同键换目标拒绝冲突；同一取消意图不重复产生副作用；迟到 create 不启动已取消代次；未知回包按 run_id 查询/同取消键重送；自然完成先发生保留 succeeded/failed；already_terminal 不伪造停止 |
| C16 事件重复/乱序 | 重放同 event_id；延迟 running 到完成后；source_seq 缺口；Edge 换 instance 重启 | 去重、不倒退；缺口触发恢复/显示不完整；新 instance 序号与旧 spool 不混淆；不靠跨机墙钟判因果 |
| C17 游标恢复 | 事件分页、空页、过期游标、换 run/过滤条件/权限；读任务快照分页时加入新事件 | 事件去重后连续；错误 code 明确；完整快照 + 对应 snapshot_cursor 无漏增量，历史缺口可见；不能复用其他查询的游标 |
| C18 两入口互见 | M 提交、U list/get/cancel；U 新任务、M list/get/events/read artifact | 相同授权下操作同一个 Run 和结果；不各自建“聊天任务”和“桌面任务”；可从 runs.list 发现另一入口的新任务 |
| C19 错误保真 | 对每类格式/准入/幂等/游标/产物/内部错误重放 H/M/U | 相同 code、acceptance、recovery 和字段定位；M 不转成成功文本；U 不仅显示通用“失败”；按错误文案变化不影响处理 |
| C20 授权与身份 | principal-b 查询/取消/读 A；伪造 principal 字段；同名 request_id 从不同 principal 提交 | 拒绝且无副作用，不泄露隐藏资源；未知自报字段不改变身份；幂等和游标按真实认证主体隔离 |
| C21 结果与源离线 | A 已 succeeded 后唯一可读产物源离线且无缓存；再次 get/read；另测篡改输入字节 | Run 的已完成事实仍可查；读产物给 ARTIFACT_UNAVAILABLE，不能重跑 A；有可信副本时允许正常读；输入完整性失败在 B 执行 prompt 前阻止启动 |
| C22 scope 与参数保真 | U 两任务段分别绑定 A/B；移动光标、撤销、重排段落；M 手写等价 spec | 每段独立请求，已受理 spec 不变；prompt 字符保留（含中文/Unicode）；没有隐式依赖。IME/候选插入细节另在 P2 实际 UI 验收 |
| C23 等待/失败事实 | driver 报告 waiting/原生审批、原生失败、矛盾终态证据 | 不自动批准；允许原生入口继续并回传 running；failed 附 execution_error/部分产物；get 本身可成功；矛盾报告可见且不静默重写终态 |

## 4. 三个可逐步评审的轨迹

### T1：M 提交、U 观察与取消

| 步骤 | 操作 | 必须保持的事实 |
| --- | --- | --- |
| 1 | M validate BASE、submit BASE | validate 无 Run；submit 得 Run R、phase=accepted |
| 2 | U list/get R；Edge 确认 native N 运行 | U 看到同 R；R 与 N 身份不同，phase=running |
| 3 | M 再提交 BASE | 仍为 R；native-start 计数仍为 1 |
| 4 | U cancel R，暂不送达 Edge | cancel.requested=true；不能显示 cancelled |
| 5 | Edge 确认 N 中属于 R 的工作已停止 | phase=cancelled，M get/events 读取同一停止证据；共享 harness 进程可以仍在运行 |

### T2：受理响应未知与恢复

| 步骤 | 操作 | 必须保持的事实 |
| --- | --- | --- |
| 1 | Hub 持久受理 req-a-001，但客户端未收到响应 | 请求可能已存在；适配层只能报告 unknown |
| 2 | U 以相同 principal 按 request_id get | 查到原 R；若暂时未找到，不据此换键重做 |
| 3 | M 同键同内容重送；Hub/Edge 重连 | 原 R、原 command，journal 收敛；不创建 R2/N2 |
| 4 | 原运行完成，读结果并校验字节 | 观察原事实，恢复成功不是重新执行成功 |

### T3：A 产物到 B，调用方负责串接

| 步骤 | 操作 | 必须保持的事实 |
| --- | --- | --- |
| 1 | 在 host-a 显式提交 A，correlation_id=demo-a-to-b | 只有 A 被创建；correlation 不自动创建 B |
| 2 | A 完成，调用方 get/read artifact-a | 真正取得已授权内容与 digest；没有暴露路径当作传输 |
| 3 | 调用方创建新 request_id，target 改为 B 全部引用，inputs=[artifact-a] | 新 Run B；Edge B 拉取、校验并记录受管理输入位置 |
| 4 | B 读取该输入、输出派生结果；两个入口查询同 correlation | 结果内容证明使用了 A 产物；两个真实 Host 的来源和原生身份可查 |
| 5 | 制造时钟偏差/延迟事件 | 时间轴标出观测与接收时间；A→B 关系来自输入产物，不能仅靠墙钟排序 |

## 5. “完全无 CL”专项验收

不能用“CL 暂时离线”“用假 CL server 替代”证明无依赖。未来验收环境只包含 FS 自有服务/Edge、所选原生 driver、必要推理服务与两个入口；CL/CLE/CLF 的源码包、进程、数据库、服务地址和必需配置均不参与。

| ID | 阶段与操作 | 必需证据/失败条件 |
| --- | --- | --- |
| N01 独立 bootstrap | P1：仅用 FS 自有配置/入网方式登记资源与 principal | 启动/依赖清单与登记记录不要求 CL；若资源/鉴权从 CL 获取则失败 |
| N02 无 GUI 完整闭环 | P1：H、M 各完成目录→validate→submit→观察→读取文本产物；另例取消长任务 | 同 C07/C14 的执行与内容证据；不安装 GUI、不运行 CL；只有 MCP 返回“已提交”不能算通过 |
| N03 入口生命周期独立 | P1：受理后关闭 MCP 连接；中断 Hub 后恢复 | Edge 原运行继续，重连得到原 Run/原生身份/结果；不靠 CL 守护进程重启工作 |
| N04 客户端使用同一核心 | P2：未装 CL 的环境从真实 FS 编辑器提交，再由 M 查询/取消，反向也执行 | C18/C22 的实际 UI 证据；没有隐藏的 CLF provider、第二目录或第二状态机 |
| N05 两机结果交接 | P3：普通调用方按 T3 显式串接两个真实 Host | FS 自己传递/读取产物与事件；无需 CL claim/receipt/WorkOrder；不依赖同一共享绝对路径 |
| N06 中立请求与负向依赖检查 | P0 查文档；P1/P2 再查实现依赖、配置及该次调用记录 | 公共契约无 CL 专属必填类型；不透明 correlation 不改变执行；FS 路径中任何必经 CL 组件均判失败 |

验证无需增加复杂治理/CI 平台。保留最小可审阅记录即可：运行组件/版本、入网配置中与 CL 无关的字段、canonical 请求与响应、关键 journal/事件、native 身份、产物校验及故障前后观察；不收集凭据值或无关用户数据。

## 6. 本轮设计验证与后续出口

| 检查 | 本轮可验证的结论 | 后续尚待证明 |
| --- | --- | --- |
| D01 依赖方向 | 契约由 FS 拥有，H/M/U 的必经路径不含 CL；资源登记也明定归 FS | 实际安装/运行依赖是否遵守，N01/N06 |
| D02 双入口等价 | BASE、归一化、幂等空间、错误形状和 T1 只有一套定义 | M/U 真实适配是否保真，C08/C18/C19 |
| D03 故障可表达 | 受理未知、观测过期、取消 pending、游标缺口均有明确表示与恢复路径 | journal、事务、driver 的实际行为，C10–C17 |
| D04 结果闭环 | artifacts.read 与 inputs 定义可读取/校验的产物，不依赖 CL 文件服务 | 实际跨 Host 物化、故障与时钟偏差，T3/N05 |

P0 出口：字段/操作/状态/错误及关键轨迹无未定义分支，文档链接和 JSON 示例通过检查；方案可以提交评审。P0 不把“设计可表达”标为“系统已运行”。

P1 出口：C01–C21/C23 的 H/M 基础向量与 N01/N02/N03/N06 有实际记录；仅依赖两机或实际 UI 的部分按 P2/P3 追踪，不得提前标通过。P2 补齐 U 与 scope/IME；P3 补齐 T3/N05。每项证据标明使用实际 driver 还是 double，未支持的可选能力保持未验证。

当前结论：**不依赖 CL 的架构闭环已给出可审阅的契约与轨迹；不依赖 CL 的运行闭环尚待 P1–P3 验证。** 架构 gate 的解除仍须按 [Baseline 0.0](baseline-0.0.md) 单独接受，不能由这些文档自动推导。
