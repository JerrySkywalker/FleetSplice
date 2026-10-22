# U00–U09 Goal Train

[执行授权](EXECUTION-CONTRACT.md)。独立源码不依赖H0-H4真人在场；不自动授予Gate通过。

| Goal | 依赖 | 可见交付 | 计划上限h |
|---|---|---|---:|
| [U00](../../../goals/u160/FLEETSPLICE-U160-U00-001.md) | 授权 | 执行准入与基线整理 | 2 |
| [U01](../../../goals/u160/FLEETSPLICE-U160-U01-001.md) | U00 | Native支持契约增量核对 | 4 |
| [U02](../../../goals/u160/FLEETSPLICE-U160-U02-001.md) | U00 | Desktop首次登录闭环 | 18 |
| [U03](../../../goals/u160/FLEETSPLICE-U160-U03-001.md) | U02 | Web与PWA会话状态体验 | 14 |
| [U04](../../../goals/u160/FLEETSPLICE-U160-U04-001.md) | U02 | Manager与Workspace连续性 | 12 |
| [U05](../../../goals/u160/FLEETSPLICE-U160-U05-001.md) | U03, U04 | 可操作的连接与错误提示 | 10 |
| [U06](../../../goals/u160/FLEETSPLICE-U160-U06-001.md) | U02, U04 | 实际Tauri自动化 | 14 |
| [U07](../../../goals/u160/FLEETSPLICE-U160-U07-001.md) | U03, U04, U05 | 隔离产品链路联调 | 12 |
| [U08](../../../goals/u160/FLEETSPLICE-U160-U08-001.md) | U07 | 开发候选交付包 | 8 |
| [U09](../../../goals/u160/FLEETSPLICE-U160-U09-001.md) | U01, U06, U08 | 集成评审与统一交接 | 6 |

U00→U02→U03/U04→U05→U07→U08→U09；U01独立。U06在U02/U04后开展。一个writer串行集成共享文件。U01/U06受阻不令其余源码停摆；U09保留部分/阻碍并收束。总100h工作计划+最多60h修正，不为耗尽额度扩功能。

状态NOT_STARTED→ACTIVE→SOURCE_COMPLETE或BLOCKED_EXACT；SOURCE_COMPLETE≠Owner/Native/生产通过。源码PR最小可审阅单元，可合并紧密相关Goal但分开收据。文档PR用确定性轻量检查；源码必须定向验证+独立只读增量评审。目标开发分支，不自动合并历史研究PR。
