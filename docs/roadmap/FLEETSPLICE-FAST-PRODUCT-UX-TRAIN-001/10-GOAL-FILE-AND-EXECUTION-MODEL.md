# 一个 Goal 一个 MD：文件结构、执行与验收模型

## 1. 拆分准则

一个 Goal 对应一个可观察增量与一个主要文件所有权集合，不按“写测试/写代码/改 CSS”横向拆 Goal。
同一 Goal 可跨多次最长 12 小时的桌面会话；12 小时不是预估工程量，也不是必须持续运行。
前置缺失只阻塞依赖它的工作，不能因此获得另一类 live 权限。

当前 17 个 FPX 文件是唯一执行入口。历史 G06–G10 是规范语义来源；FPX-G06 等是同一产品
Gate 的当前交付切片，不是第二套并行产品里程碑。N00 续用 PR23/C00–C07，避免重复实现。
V02 为未来规划入口；G11–G16 各已有独立 MD，未自动加入当前可执行 DAG。

## 2. 单文件模板

```markdown
# <GOAL_ID> — 一项可见增量

状态：PLANNED；计划依据：<读取日期、基线、Owner 合同>
依赖：<哪些 SOURCE_COMPLETE，哪些必须 ACCEPTED>
接受门禁：<H0/H1/Gate S/...>；会话上限：12h

## 目标与可见产物
用一句话说明 Owner 最终能实际看到/操作什么。

## 入口与证据
当前分支/PR/真实 HEAD、工作树、已接受 baseline、必要接口/回执。
每次恢复重新核对发生变化的引用。

## 范围与唯一 writer
允许的模块/文件，明确相邻不做的能力与共享文件集成责任。

## 开发清单
- [ ] 最小反例或既有可复用契约
- [ ] 最小可见切片
- [ ] 所需权限/身份/未知状态路径
- [ ] 受影响验证与可运行产物
- [ ] 精确 HEAD 的回执与交接

## 验收
Given/When/Then、必要反例、可测阈值、证据等级。
SOURCE_COMPLETE 条件与 ACCEPTED / 人工 Gate 条件分别写。

## 停止与恢复
外部阻碍、权限边界、未知结果、scope 漂移的处理；
恢复入口与回滚，不隐含重新发送或重建原生会话。

## 下游
源码完成能解锁什么；哪些动作仍缺人类/真实环境接受。
```

不要为每个 Goal 创建一整套重复治理文件。单 MD 足以承载计划和链接；
实际测试/源码属于产品对应目录，原始证据与状态放私有 artifacts。

## 3. 三类依赖

| 类型 | 例子 | 判断 |
| --- | --- | --- |
| 源码依赖 | UX02 依赖 UX01 | 对应候选源码/接口、测试及有效回执匹配 |
| 产品接受依赖 | G08 依赖 G07_ACCEPTED | 不能用 G07 SOURCE_COMPLETE 替代 |
| 外部/人工准入 | H1、Gate S、H2 | 真实操作/权限/环境证据；文件存在不等于准入 |

H2/H3/H4 是所属 G06/G07/G10 的**验收产物**，不可误写成开始该 Goal 源码工作的循环依赖。
Gate S 是部署前置而非合成测试结果。未获 live 准入时，只执行该文件明确允许的 source-only 范围。

## 4. 状态与进度位置

- manifest 保存 DAG、范围和初始状态；本次不修改其 NOT_STARTED 初始值。
- 私有 state 保存实际进度，并指向精确 HEAD 的真实回执；Markdown 复选框不是另一份权威调度数据库。
- 建议进程：NOT_STARTED → ACTIVE → SOURCE_COMPLETE；人工/外部等待以 READY_FOR_OWNER/BLOCKED_EXACT 单列。
- ACCEPTED 仅在该 Goal 所有实际接受条件成立时写入。H0–H4 用 PASS_OWNER_OBSERVED；Gate S 用 ADMITTED。
- helper 的 receipt 校验只做结构/路径/字段一致性，不能鉴别人类是否真的操作，不能授予网络/原生/生产权限。
- Owner 不在线不伪造布尔值；已验证回执失效（候选变化、接口变化）只复核有关部分，不重跑全历史。

现有 helper 的 SOURCE_COMPLETE 条目可同时出现在“等待 Gate”列表中；没有必要为等待而重跑同一源码。
遇到 BLOCKED_EXACT 时执行者先检查阻碍是否已经变化；`next` 是建议列表，不是自动执行授权。

## 5. 最小回执

私有 JSON 的最小源码完成样例：

```json
{
  "GOAL_ID": "FLEETSPLICE-FPX-UX01-001",
  "BASE_SHA": "<actual 40-hex commit>",
  "FINAL_HEAD": "<actual 40-hex commit>",
  "DISPOSITION": "SOURCE_COMPLETE",
  "CHANGED_FILES": ["<actual relative paths>"],
  "TESTS": [{"command": "<actual>", "exit_code": 0}],
  "EVIDENCE_LEVEL": ["SYNTHETIC_BROWSER"],
  "REAL_NATIVE_CONNECTIONS": 0,
  "REAL_NATIVE_EFFECTS": 0,
  "HUMAN_GATES": {"H0": "NOT_RUN"},
  "BLOCKERS": [],
  "NEXT_READY_GOAL": "<recomputed from verified state>"
}
```

这里的占位符不是可登记的完成回执；必须由执行者以实际结果填写。人工 Gate 另有
GATE_ID、SOURCE_SHA、OWNER_EXECUTED、OWNER_APPROVED、DISPOSITION 和证据链接。
一个 SOURCE_COMPLETE 回执不能改名当作人工 Gate 回执。

私有状态/日志/真实 thread/token/截图位于：
`C:\Dev\artifacts\fleetsplice\FLEETSPLICE-FAST-PRODUCT-UX-TRAIN-001\`。
公开只放合成样例、脱敏结果、源码和正式被接受的规范；不复制私有会话全文。

## 6. 快速开发与最小验证

| 改动 | 最小本地验证 | 延后到何时 |
| --- | --- | --- |
| Goal/docs/manifest | 链接、JSON、DAG、scope、diff whitespace | 不跑产品 CI |
| Native/Journal/Hub | 类型 + 对应反例 + integrated no-replay | live H1/G06 另行准入 |
| Web | 组件/状态测试 + 代表视口浏览器场景 | H0/H2 真体验 |
| Desktop | UI 构建 + origin/IPC smoke | G10 安装/升级/回滚 |
| G08 | cursor/Blob/耐久故障 + 同完整度历史验收 | 不在 UX02 提前启动 |
| G10 | 一次完整 release 资格化 + 独立 exact-head review | 发布仍由 Owner 准入 |

执行时用现有 qualified-node wrapper，按锁复用依赖，不每个 Goal 重装。
受影响 TS 测试的典型方式是编译 `tsconfig.test.json`，再只运行对应的 compiled test 文件；
确切命令由当前脚本与改动面确定。不把全量 `npm test` 当每次提交默认动作。
修改造成实质失败再有理由地复验，不因文档编辑重复完整 SDK/性能/原生测试。

## 7. 文件所有权与 PR

- 一个 writer 同时拥有一个源文件。N00 负责 Native/直接 Hub 接缝，UX 线不改其权限协议来绕过拒绝。
- UX01→UX02→UX03→UX04 重叠 AppShell/NativeAdoption/Presentation/style.css，默认串行集成。
- UX05 主要拥有 desktop；用冻结 Web 接口，公共 bridge 由一位集成人修改。
- 一个 Goal 一个主要审阅单元，必要时数个小提交；一个 MD 不意味着必须只有一次会话或一次巨大提交。
- 初始设计请求仅生成可审阅文档；后续 Owner 已批准先提交/合并本次文档 PR，再按 [200 小时授权](12-OWNER-200H-EXECUTION-AUTHORIZATION.md) 推进有权限的源码工作。
- 未来 qualified source-only UI PR 是否可入开发 train，依已批准 FPX 原条件；main、PR19–23、Native/live/production 不继承自动合并许可。

PR23 与开发分支分属不同 ancestry 时，先给出 explicit integration candidate 和受影响文件；
source reviewed 不等于已接受或已合并。不能为方便 UX 把整条研究栈盲目合入。
