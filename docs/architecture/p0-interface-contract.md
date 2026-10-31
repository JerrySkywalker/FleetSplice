# P0：FS 最小公共接口契约

- 日期：2026-11-01（Asia/Shanghai）。版本：`0.1-draft.1`。
- 状态：可供评审的架构提案；接口与字段尚未发布，以下 MUST/必须均为未来实现的验收要求。
- 依据：[并行发展方案](mcp-client-parallel-plan.md)、[领域模型](domain-model.md)、[权威模型](authority-model.md)、[Edge 模型](host-runtime-model.md)。共用用例见 [P0 验收设计](p0-shared-acceptance.md)。
- `ARCHITECTURE_0_1_READY=false`；`IMPLEMENTATION_AUTHORIZED=false`。本轮没有产品实现或运行时验收。

## 1. 范围与权威

一个 Run 表示一次显式资源绑定的执行请求。P0 只定义创建新执行；每个受理的 Run 获得自己的 LogicalSession，实际启动后关联 NativeSegment/NativeSession。Run ID 不能冒充原生会话 ID；本版不定义 resume、迁移、自动重试、批量提交或依赖图。

完成/取消指本次 Run 所属的工作单元；共享 harness 服务进程或原生会话可以继续存在。driver 必须能区分“本次工作已结束”与“连接断开/服务进程退出”，不能只靠退出码猜任务成功。

FS 公共服务拥有目录、请求与执行记录；Edge 拥有本地进程/原生会话事实、命令 journal 和断连事件。MCP 与 FS 客户端调用同一应用接口，不各建执行队列。资源准入与恢复不调用 CL/CLE/CLF，也不要求外部 Goal、WorkOrder、claim 或数据库。

这是传输无关契约，不冻结 HTTP 路径、MCP SDK、存储或语言。身份来自 FS 的认证上下文，不接受请求体自报 principal。相同 FS principal 的 MCP 与 UI 共享请求幂等空间和访问权限；不同 principal 的权限必须分别校验。

## 2. 资源目录与显式选择

### 2.1 ResourceRef 与目录记录

`ResourceRef = {id: string, generation: positive_integer}`。ID 不透明且不复用；显示名/别名只用于发现。generation 表示会影响绑定或执行权的配置/身份代次，不随普通心跳、负载变化递增。相同 ID 的替换、重新入网或绑定语义变化必须使旧引用失效；具体入网协议留待后续研究。

目录共同字段：`ref`、`kind`、`display_name`、`availability`（`online|offline|unknown`）、`freshness`（`fresh|stale|unknown`）、`observed_at`、`received_at`。时间用 UTC RFC 3339；没有来源观测时 `observed_at=null`。freshness 由 FS 按公布的观测有效期计算，不能依赖客户端与远端时钟精确同步。

| kind | 最小关系/信息 |
| --- | --- |
| `host` | 真实机器；入网代次与可达性 |
| `environment` | `host: ResourceRef`；OS、用户/权限边界 |
| `workspace` | `environment: ResourceRef`；已登记根目录，调用者不能任意替换为全局 cwd |
| `worktree` | 可选；`workspace: ResourceRef`，实际文件/Git 事实归 Edge |
| `runtime` | `environment: ResourceRef`；driver 标识、能力集合、已登记兼容绑定 |
| `inference_profile` | provider、可选择的 model ID；位置可独立于执行 Host，只暴露凭据引用之外的公共元数据 |
| `tool_binding` | 工具身份及其实际环境、与 runtime 的兼容信息；不含凭据值 |

runtime 最小能力词汇：`run.create`、`run.observe_completion`、`run.cancel`、`artifact.output_text`、`artifact.input`、`binding.inference`、`binding.tools`、`limits.max_workers`。能力缺省视为不支持；具体 driver 必须提供证据，不能由产品名称推断。P1 的首个 driver 必须满足 create、完成观测、取消和文本结果能力。

可选负载观测以 `{metric, value, unit, observed_at, received_at, freshness}` 表达；无数据不是零负载。P0 只显示观测并在提交时准入，不定义自动负载均衡，也不把 `max_workers` 当作 GPU/CPU 使用率上限。

### 2.2 解析与准入顺序

1. 只返回当前 principal 可见资源；GUI 别名选择必须落为 ID/generation，MCP 使用同一目录。
2. 新请求校验 Host→Environment、Workspace/Worktree→Environment、runtime→Environment 的一致性。推理/工具可以在别的 Host，但必须有该 runtime 已验证的绑定能力与兼容关系。
3. 校验全部引用的 generation、授权、在线/新鲜观测、必要能力、输入产物可用性及本地容量。Hub 与 Edge 都检查其负责的执行边界，Edge 启动前再次准入。
4. 拒绝不能落实的硬约束。不能静默换机器、提升权限、替换模型、移除工具或忽略限额。P0 不提供软偏好/自动选址。

`runs.validate` 是只读快照，不预留容量，不产生 Run，不发命令；`runs.submit` 必须重新准入。资源在受理后变化，可导致执行拒绝或失败，但仍不得改投其他目标。

## 3. RunSpec

以下 JSON 是规范字段示例；ID 是验收样例，不是实际机器。

```json
{
  "schema_version": "0.1-draft.1",
  "request_id": "req-a-001",
  "scope_id": "prompt-block-a",
  "target": {
    "host": {"id": "host-a", "generation": 1},
    "environment": {"id": "env-a-user", "generation": 1},
    "workspace": {"id": "ws-a", "generation": 1},
    "runtime": {"id": "rt-a", "generation": 1}
  },
  "inference": {
    "profile": {"id": "profile-a", "generation": 1},
    "model_id": "model-a"
  },
  "tools": [{"id": "tool-a", "generation": 1}],
  "limits": {"max_workers": 1},
  "inputs": [],
  "correlation_id": "demo-a-to-b",
  "prompt": "读取已登记工作区，生成结果表。"
}
```

| 字段 | 必需/缺省与含义 |
| --- | --- |
| `schema_version` | 必需，精确匹配受支持版本；不做猜测式降级 |
| `request_id` | 必需，调用者生成；在 principal + `runs.submit` 范围内幂等 |
| `target` | 必需，示例中的四个引用必须齐全；可加 `worktree: ResourceRef` |
| `prompt` | 必需，非空字符串；原文保留，不裁剪/改写/解析为 shell |
| `scope_id` | 可选，编辑器任务段的不透明 ID；只作关联，不表达权限或依赖 |
| `inference` | 可选；若提供，profile 与 model_id 都必需。省略表示保留 runtime 自身配置，记录 `mode=runtime_default`；未能观测实际值时明确标为 unknown |
| `tools` | 缺省 `[]`，请求额外接入的 FS 工具绑定；不表示禁用 harness 已有工具或构建完整工具沙箱 |
| `limits` | 缺省 `{}`；唯一 P0 字段为正整数 `max_workers`，含主 worker 的同时受管理工作单元上限。不能控制嵌套工作单元的 driver 必须拒绝此约束 |
| `inputs` | 缺省 `[]`，已发布且授权可读的不可变 artifact ID；不是外部任意路径/URL |
| `correlation_id` | 可选、不透明，仅作分组；不隐含依赖、调度、验收或 CL 语义 |

未知字段、重复 JSON 对象键、非法类型/null、重复工具/输入引用必须拒绝。P0 不接受 Goal、WorkOrder、shell、任意 cwd 或模糊资源别名字段。文本包装如以后加入，也只能先严格解析为同一对象；此版 MCP 工具直接接收 `spec` 对象。

重复键检查适用于 FS 拥有的原始 JSON 解码边界；若宿主在送达工具前已经改写/折叠原文，服务端无法恢复该信息，不能将此检查宣传为宿主原文保真保证。

归一化补齐上述默认值；对象键序不影响相等性，tools/inputs 作为集合按 ID 归一化排序，字符串逐字符保留、不做 Unicode 等价转换。scope/correlation 等已声明字段也属于请求内容。公共服务返回 `normalized_spec` 和版本内稳定、不透明的 `spec_digest`；两入口不分别计算摘要。幂等冲突以归一化内容比较，不能只依赖摘要碰撞假设。具体摘要编码留在实现选型，摘要不充当认证凭证。

GUI 每个任务段先生成独立 RunSpec；相邻段的绑定不互相继承。移动光标或调整排版不能改变已经受理的 spec。修改后另开 request_id；本版不把段落顺序编译为依赖。

## 4. 公共操作与两个入口

成功统一为 `{ok:true, data:...}`，失败为 `{ok:false, error:...}`。以下名称是提案，不是现有可调用工具。

| 公共操作 | MCP 名称 | 输入与最小返回 |
| --- | --- | --- |
| `resources.list` | `fs_resources` | 可选 kind/cursor/limit → 目录记录、`catalog_revision`、`next_cursor` |
| `runs.validate` | `fs_validate` | spec → normalized_spec、spec_digest、resolved_binding、`validated_at`；无执行副作用 |
| `runs.submit` | `fs_submit` | spec → RunRecord；响应只承诺持久受理，不承诺已启动 |
| `runs.get` | `fs_get_run` | selector 恰含 run_id 或 request_id 之一 → RunRecord；request_id 查询限当前 principal |
| `runs.list` | `fs_list_runs` | 可选 correlation_id/cursor/limit → RunRecord 列表、next_cursor、snapshot_cursor |
| `runs.cancel` | `fs_cancel` | run_id、独立 request_id → RunRecord 与 cancel_disposition（requested / already_terminal） |
| `events.list` | `fs_events` | 可选 run_id 或 correlation_id、cursor、limit → events、next_cursor、has_more |
| `artifacts.read` | `fs_read_artifact` | artifact_id、可选 cursor/limit_bytes → artifact_id、content_digest、offset、encoding、data、next_cursor |

相较前轮六项候选，增加 runs.list 支撑工作台及事件缺口后的快照恢复，增加 artifacts.read 保证结果可实际取得。后者首版仅要求不可变文本产物，`encoding=base64` 传输字节；拼接结果按清单的 SHA-256 校验。目录/任务分页缺省 100、最多 200；事件缺省 100、最多 500；产物读取缺省且最多 65536 字节，均拒绝非正数/越界值。

目录与任务列表分页绑定首屏快照及过滤条件；任务列表首屏给出同一时点的 snapshot_cursor，读完全部页面后可从该游标增量读事件。events 的 run_id/correlation_id 互斥；runs.list 的事件游标适用于相同 correlation_id 或同为无过滤条件。RunRecord 的 snapshot_cursor 仅用于该 run_id 的 events 查询。游标不透明、绑定 principal 与查询条件，不能跨查询混用。

MCP adapter 必须保留相同的成功/错误结构，不把执行失败包装成成功文本；宿主只能展示文本时也应携带完整 JSON。协议层错误与 FS 领域错误分开。UI 直接消费相同结构。调用 provenance 可以记录入口类型，但不参与幂等键、资源选择或执行权。

聊天模型是否调用工具、是否忠实传参不属于服务端保证。客户端应展示收到的 normalized_spec、实际绑定与摘要；共用用例在应用接口/实际工具调用边界比较，不声称验证了任意宿主聊天的逐字传递。

## 5. 受理、幂等与派发

1. 认证/授权与结构校验后，先查 `(principal, runs.submit, request_id)`。相同归一化内容返回原 RunRecord，即使资源此后离线也不能重新准入并生成第二个 Run；不同内容返回 IDEMPOTENCY_CONFLICT。
2. 首次提交完成资源准入后，原始请求、normalized_spec、绑定、run_id、logical_session_id、幂等映射与待派发意图必须在一次持久事务中提交，才能回复 accepted。并发相同键只能有一个成功创建者。
3. Hub→Edge 使用稳定 command_id、run_id、目标资源代次、`execution_generation` 与请求摘要。P0 execution_generation 从 1 开始且不自动加代重做；它不是 CL 的 lease。Edge 用持久 journal 识别重复命令并返回已有结果，不重复派发原生操作。
4. Edge 执行前再次检查代次/绑定/容量；已拒绝的命令不能因链路重放而执行。Hub/outbox 与 Edge/journal 的崩溃窗口必须在 P1 证明，P0 不以跨机器原子事务掩盖它。
5. 派发后回执未知：保留同一执行身份，查询 journal/原生身份并 reconciliation；不能通过换 command_id、换 request_id 或换机器“恢复”。原生启动有副作用但无法确认时维持不确定状态，不承诺端到端 exactly-once。

超时后先按原 request_id 查询，也可用相同 spec/同一 request_id 重送以收敛。查询暂未找到不是“原请求永远未受理”的证明；不得因此换键盲目重做。幂等记录在 Run 可查询期内必须保留，删除历史后的键重用策略尚未定义，P0 不提供删除操作。

## 6. RunRecord 与状态

RunRecord 最小字段：`run_id`、`logical_session_id`、`request_id`、`normalized_spec`、`spec_digest`、`resolved_binding`、`execution_generation`、`phase`、`observation`、`cancel`、`materialized_inputs`、`diagnostics`、`revision`、`created_at`、`updated_at`、`snapshot_cursor`、`result`。diagnostics 缺省为 []，记录不应被静默忽略的矛盾/缺口，使用 code/message/details。实际启动前 native_segment_id/native_session_id 可以为空；启动后保存映射，调用者不能伪造这些值。

resolved_binding 记录受理时的引用和 inference 的 explicit/runtime_default 模式；实际观测值另存于 observation，未知值明确表示。显式绑定不一致时报告错误，不把实际偏离伪装为成功解析。

| phase | 权威与转换 |
| --- | --- |
| `accepted` | Hub 已持久受理；尚无原生启动事实 |
| `starting` | 正在派发/启动；不代表已经执行 prompt |
| `running` | Edge/driver 已确认运行 |
| `waiting` | Edge/driver 报告等待用户/原生审批等；不自动批准，P0 通过原生入口继续 |
| `succeeded` | 权威完成证据与结果清单已持久记录 |
| `failed` | 执行端确认失败，或派发前已确定拒绝/无法执行；含 execution_error |
| `cancelled` | 确认从未派发且派发已被原子禁止，或 Edge 确认执行已停止 |

允许的转换：accepted→starting/failed/cancelled；starting→running/waiting/任一终态；running→waiting/任一终态；waiting→starting/running/任一终态。Hub 在派发前持久记录 starting；原生快速完成可从 starting 直接到终态，但必须带完成证据。终态不因旧事件倒退，重复终态证据去重；矛盾证据记录 CONSISTENCY_ERROR 并显式调查，不静默改写历史。

`observation = {status:fresh|stale|reconciling, last_phase, observed_at, received_at, source, native_segment_id, native_session_id}`。last_phase 允许 unknown；无 Edge 报告时 source/时间/原生身份为空。链路断开只使 observation 失效；phase 保留最后已知值并展示“最后观测”，不能自动改为 failed/cancelled/idle。terminal phase 与产物当前是否可读取也是不同事实。

取消是期望操作：`cancel = {requested:boolean, command_id?, requested_at?}`。受理取消不直接把 phase 改为 cancelled；断连时保留 pending。不同取消 request_id 对同一个 Run 也必须合并为同一个未完成取消意图，避免重复副作用。原生完成先发生则保留 succeeded/failed；取消不篡改结果。对已知终态取消返回 already_terminal，不报成新的停止事实。

取消幂等键为 `(principal, runs.cancel, request_id)`，内容为 run_id；同键不同 run_id 返回 IDEMPOTENCY_CONFLICT。取消意图持久化后才确认 requested。若取消先于 create 命令到达 Edge，journal 必须阻止该 execution_generation 的迟到启动；若启动结果不明，则先恢复其身份再停止该 Run，不能取消其他会话。取消回包未知时按目标 run_id 查询或以原取消键重送，不能用取消 request_id 冒充 submit request_id 查询。

result 为 `{outcome, summary?, artifacts, execution_error?}`；outcome 使用 pending/succeeded/failed/cancelled，与 phase 的终态一致。summary 是执行报告，不能自动代表业务验收合格。execution_error 使用 `{code, message, details}`，属于已受理 Run 的执行结果，不等于读取该 Run 的 RPC 失败。每项产物清单包含 artifact_id、producer_run_id、media_type、byte_length、content_digest、availability（available/unavailable/unknown）；P0 文本 media_type 为 text/plain 或 application/json。产物不可变；执行失败仍可附部分产物。

输入产物由 FS/Edge 通过授权的产物接口取得、校验并落在工作区内的受管理输入位置；RunRecord 记录实际 materialization。不能把 A 机器绝对路径交给 B 当作已传输成功。输入读取/校验失败必须在执行 prompt 前阻止启动。存储介质/大文件传输以后选型。

materialized_inputs 缺省为 []，每项记录 artifact_id、content_digest、目标 environment 引用与受管理输入根下的 relative_path；调用者不能借此指定任意输出/输入绝对路径。

产物 content_digest 的格式为 `sha256:` 加 64 位小写十六进制，byte_length 为非负整数；它与不透明的 spec_digest 不同，必须能由读取字节独立复核。产物读取结束时 next_cursor=null；offset 按原始字节计数。

## 7. 事件与恢复

事件最小 envelope：`schema_version`、`event_id`、`run_id`、`run_revision`、`type`、`source`（host/environment/edge_instance；Hub 事件用 hub）、`source_seq`、`occurred_at`、`received_at`、`payload`。Edge source_seq 在同一 edge_instance 内递增并随 spool 持久保存；重启若重新计数必须更换 instance 身份。event_id 重放保持不变。

最小事件族：run.accepted、run.phase_changed、run.observation_changed、run.cancel_requested、artifact.published、artifact.availability_changed。取消停止使用 phase_changed(cancelled)。payload 包含变更后的字段与证据/原因，不能靠自然语言日志猜状态。phase_changed 的 evidence 至少指明权威来源、command_id、execution_generation、原生工作身份/报告引用；派发前终止则明确记录未派发证据。materialized_inputs 的变化随 observation_changed 记录。Hub 在归约时赋予 run_revision，与快照 revision 单调对应，重复来源事件不重复增加 revision。所有快照字段变化均有相应事件；snapshot 与恢复游标同一提交边界，防止读快照后漏掉增量。

Hub 对来源事件去重，按可验证来源顺序归约；逆序/缺号先标记缺口并查询 journal/snapshot，不能让晚到的 running 覆盖完成。events.list 的游标是 Hub 持久接收顺序，只保证可恢复读取，不保证跨 Host 的实际因果次序。跨机因果依赖使用输入产物/关联 ID，不能只比较 occurred_at。

读取通常可重复返回已见事件，消费者按 event_id 去重；无新事件返回空列表、has_more=false 和可继续读取的 next_cursor。游标过期返回 CURSOR_EXPIRED，客户端用 runs.list 或 runs.get 获取快照及对应游标，再继续；明确标示不能恢复的历史覆盖缺口。不得从“缺事件”推导任务完成。访问范围变化也必须使不再有效的游标失败并要求重建快照。

## 8. 错误与恢复指引

错误形状如下，样例表示原 submit 的受理结果未知，尚不知道 run_id：

```json
{
  "ok": false,
  "error": {
    "code": "OUTCOME_UNKNOWN",
    "message": "提交响应中断；请按原 request_id 查询。",
    "operation": "runs.submit",
    "request_id": "req-a-001",
    "acceptance": "unknown",
    "recovery": "lookup_request",
    "details": {}
  }
}
```

必需字段为 code、message、operation、acceptance、recovery、details；已知时附 request_id/run_id，字段错误用 details.field（指向请求体字段的 JSON Pointer），冲突资源用 details.resource_ref。客户端按 code/recovery 处理，不解析 message。不得把凭据或无权查看的路径/资源详情放进错误。

`acceptance = not_accepted|accepted|unknown|not_applicable`，指本次变更操作；读操作用 not_applicable。明确已经受理的错误附 run_id，不指示另建 Run。超时/断连由适配层合成为 unknown，除非有证据证明未进入受理事务。

| code | 含义与 recovery |
| --- | --- |
| `INVALID_REQUEST` / `VERSION_UNSUPPORTED` | 类型/未知字段/版本错误；none，修正后新请求 |
| `ACCESS_DENIED` | 无操作权限；none。无权知道某资源是否存在时返回与不存在相同的 NOT_FOUND |
| `NOT_FOUND` | 可见范围内未找到资源/Run/产物；none；request_id 查询的短暂未找到不证明请求未在途 |
| `RESOURCE_GENERATION_MISMATCH` / `RESOURCE_BINDING_INVALID` | 旧代次或层级/兼容组合错误；refresh_resources |
| `CAPABILITY_UNSUPPORTED` | 模型/工具/硬限额等不可落实；none，修正方案 |
| `RESOURCE_OFFLINE` / `RESOURCE_STALE` / `CAPACITY_EXCEEDED` | 首次受理前不能准入；wait_for_source，之后仍只重送原请求或显式改为新意图 |
| `IDEMPOTENCY_CONFLICT` | 同一键对应不同内容；none，不覆盖已有记录 |
| `CURSOR_EXPIRED` / `CURSOR_SCOPE_MISMATCH` | 留存缺口/查询或权限范围不匹配；refresh_snapshot |
| `ARTIFACT_UNAVAILABLE` / `ARTIFACT_INTEGRITY_ERROR` | 结果源离线或输入完整性错误；wait_for_source 或 none，不重新执行生产者 |
| `OUTCOME_UNKNOWN` | 变更请求可能已受理；submit 用 lookup_request，cancel 用 get_run；不换幂等键 |
| `INTERNAL_ERROR` | 服务错误；已证明未受理才可 retry_same_request，否则 acceptance=unknown，按 submit/cancel 分别 lookup_request/get_run |
| `DRIVER_FAILED` / `CONSISTENCY_ERROR` | 执行失败/相互矛盾事实；保存在 Run 的 execution_error 或诊断中，读取 Run 本身仍可成功；不自动重跑 |

recovery 只是下一步建议，不授权模型/客户端自动无限重试。readonly 查询临时断连可重读；写操作始终使用原请求键。传输层具体错误码以后绑定，不能改变这些领域语义。

## 9. 不依赖 CL 的最小闭环与未决项

未来部署必须仅凭 FS 自有配置/入网流程登记 Host、Environment、Workspace、runtime 和授权主体；这一 bootstrap 属于 FS，不能把 CL 当作目录、鉴权或进程管理器。P0 先定义登记后数据契约，不在此引入安装命令、证书服务或复杂注册 API。

验收路径：FS 登记资源→任一入口查目录→validate→submit→Edge 执行→events/get→读取真实结果。另一次长任务验证 cancel；Hub/MCP/UI 断开后由 Edge 维持执行并在重连时恢复。两机时，普通调用方取得 A 的 artifact，显式把它加入 B.inputs；无需 CL 或 FS 内置 DAG。

尚待 P1 证据：driver 的完成/取消/限额及产物能力；持久事务与原生启动之间的崩溃窗口；入网/generation 与权限边界；spool 留存和缺口恢复；跨机产物 materialization。UI 原生审批交互、完整模型切换、自动调度、二进制大文件、通用 workflow 均不由此契约承诺。

本版完成的是契约与验收设计。只有 [共用用例](p0-shared-acceptance.md) 获得未来运行证据后，才能报告“不依赖 CL 的运行闭环已验证”。
