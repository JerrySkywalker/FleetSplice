# FLEETSPLICE-U160-U08-001 — 开发候选交付包

状态NOT_STARTED；单项计划上限8h，不要求耗尽。依赖U07。

总授权/160h截止见[执行契约](../../docs/roadmap/FLEETSPLICE-UNATTENDED-DEVELOPMENT-160H-001/EXECUTION-CONTRACT.md)。实现依据[已接受Architecture0.1](../../docs/architecture/baseline-0.1.md)、[G04A](../../docs/architecture/amendments/g04a-visible-mvp-simplification.md)、[Owner产品边界](../../docs/product/owner-thesis.md)和[design.md](../../docs/ux/design.md)。不是IDE/ADE。

## 可见交付与清单

- [ ] 打包当前正式UI构建、测试专用入口、启动/停止脚本和直接可看的截图/短演示。
- [ ] 使用一次性profile及私有runtime目录，不触及日常环境；不制作或发布生产安装包。
- [ ] 确保候选可从明确入口启动，证据绑定HEAD/hash并列明模拟、实际桌面和未执行项。

## 文件所有权与最小检查

唯一Implementer writer；Git/仓库写前持有coordinator lease；独立Supervisor期间释放lease。直接允许范围：`scripts`、`tests`、`docs/roadmap/FLEETSPLICE-UNATTENDED-DEVELOPMENT-160H-001`；只增补直接依赖的构建接缝。

范围内源码采用最小真实流程/失败用例验证。文档仅JSON/链接/diff；源码类型/受影响单测或浏览器；Rust仅受影响编译/测试；实际WebView只用测试入口。无完整重复CI/审计，不为未知假设加框架。一次必要独立只读差异评审，修正仅复查增量。

## 完成、阻碍与证据

SOURCE_COMPLETE需要实际源码/产物与受影响检查，不能仅凭文件存在。证据严格区分源码、browser IPC mock、真实WebView+合成身份、mock Native和真实Native。超权限/外部条件记BLOCKED_EXACT或NOT_RUN，继续独立Goal。U09可收束已阻塞依赖，不伪造其完成。

真实Native connections/effects=0/0；不发现或连接现有Codex端点、不复用旧许可、不启动普通Desktop/现有Agent；不改Profile、全局工具链、daemon或生产，不发布部署main，不启动G07/G08，不选择最终B2/B3/C路线。

每Goal写本程序receipts/U08.md，包含准确base/head/PR、范围、实际检查、证据、阻碍和下一项；私有日志/URL/token/截图只放本程序artifacts。SOURCE_COMPLETE不是H0-H4或Gate S通过。
