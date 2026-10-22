# FLEETSPLICE-U160-U02-001 — Desktop首次登录闭环

状态SOURCE_COMPLETE；单项计划上限18h，不要求耗尽。依赖U00。

总授权/160h截止见[执行契约](../../docs/roadmap/FLEETSPLICE-UNATTENDED-DEVELOPMENT-160H-001/EXECUTION-CONTRACT.md)。实现依据[已接受Architecture0.1](../../docs/architecture/baseline-0.1.md)、[G04A](../../docs/architecture/amendments/g04a-visible-mvp-simplification.md)、[Owner产品边界](../../docs/product/owner-thesis.md)和[design.md](../../docs/ux/design.md)。不是IDE/ADE。

## 可见交付与清单

- [x] 先写明首开认证、Cookie/窗口、正常OIDC与loopback bootstrap边界，复用Gateway既有认证。
- [x] 让首次打开的Workspace能发现未登录并进入正常登录流程，成功后进入实际应用。
- [x] 明确退出、过期和无认证配置状态；不复制浏览器profile或将旧token桥接到新窗口。
- [x] 用合成IdP和一次性本地状态证明首开登录/身份；真实Native0/0。

## 文件所有权与最小检查

唯一Implementer writer；Git/仓库写前持有coordinator lease；独立Supervisor期间释放lease。直接允许范围：`apps/web`、`apps/desktop`、`apps/hub/server.ts`、`packages/oidc`、`tests`、`docs/architecture/amendments`、`docs/deployment`；只增补直接依赖的构建接缝。

范围内源码采用最小真实流程/失败用例验证。文档仅JSON/链接/diff；源码类型/受影响单测或浏览器；Rust仅受影响编译/测试；实际WebView只用测试入口。无完整重复CI/审计，不为未知假设加框架。一次必要独立只读差异评审，修正仅复查增量。

## 完成、阻碍与证据

SOURCE_COMPLETE需要实际源码/产物与受影响检查，不能仅凭文件存在。证据严格区分源码、browser IPC mock、真实WebView+合成身份、mock Native和真实Native。超权限/外部条件记BLOCKED_EXACT或NOT_RUN，继续独立Goal。U09可收束已阻塞依赖，不伪造其完成。

真实Native connections/effects=0/0；不发现或连接现有Codex端点、不复用旧许可、不启动普通Desktop/现有Agent；不改Profile、全局工具链、daemon或生产，不发布部署main，不启动G07/G08，不选择最终B2/B3/C路线。

每Goal写本程序receipts/U02.md，包含准确base/head/PR、范围、实际检查、证据、阻碍和下一项；私有日志/URL/token/截图只放本程序artifacts。SOURCE_COMPLETE不是H0-H4或Gate S通过。

## 本次回执

[U02](../../docs/roadmap/FLEETSPLICE-UNATTENDED-DEVELOPMENT-160H-001/receipts/U02.md)。源码状态不授予人工或Native通过。
