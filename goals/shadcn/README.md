# SUI individual Goals

Program: [FLEETSPLICE-SHADCN-UI-MIGRATION-060H-001](../../docs/roadmap/FLEETSPLICE-SHADCN-UI-MIGRATION-060H-001/README.md)。一个Goal一个MD，每个文件定义可见增量、文件所有权、清单和实际通过标准。

当前S00–S08 SOURCE_COMPLETE，H0 READY_FOR_OWNER且未执行/批准；见程序RESULTS与逐Goal回执。先读[design.md](../../docs/ux/design.md)。

| Goal | 文件 | 依赖 | 计划小时 |
| --- | --- | --- | ---: |
| S00 | [执行准入与单一预设锁定](FLEETSPLICE-SUI-S00-001.md) | 执行授权 | 3 |
| S01 | [共享组件基础与明暗主题样板](FLEETSPLICE-SUI-S01-001.md) | S00 | 6 |
| S02 | [正式会话路径的代表页竖切](FLEETSPLICE-SUI-S02-001.md) | S01 | 8 |
| S03 | [会话导航与自适应工作区完成](FLEETSPLICE-SUI-S03-001.md) | S02 | 6 |
| S04 | [对话、工具记录和Composer统一](FLEETSPLICE-SUI-S04-001.md) | S03 | 8 |
| S05 | [Attention、审批、配置与设置](FLEETSPLICE-SUI-S05-001.md) | S04 | 6 |
| S06 | [Desktop Manager与Gateway统一呈现](FLEETSPLICE-SUI-S06-001.md) | S02 | 5 |
| S07 | [旧外观退出与视觉收敛](FLEETSPLICE-SUI-S07-001.md) | S05, S06 | 5 |
| S08 | [最终合成体验包与Owner交接](FLEETSPLICE-SUI-S08-001.md) | S07 | 5 |

合计52h，加8h修正余量，总60h墙钟上限。H0是最终Owner接受条件，不是中途每一步暂停点。
源状态由私有回执记录，不从复选框或旧FPX调度器推断。终态STOP_FOR_OWNER_SHADCN_UI_REVIEW。
