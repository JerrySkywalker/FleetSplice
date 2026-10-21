# FLEETSPLICE-V0_2-ENVIRONMENTS-012

## Objective

Expand the Host runtime from windows-user to explicit windows-admin and WSL companions without collapsing privilege boundaries.

## Scope

- separately enrolled/authenticated elevated Windows companion;
- WSL Ubuntu companion where required;
- exact Environment generation and principal/path/credential/lifecycle identity;
- narrow out-of-process native helper only for proven Win32 needs such as ACL/token/Job/process handles/DPAPI/ConPTY/reparse/update verification;
- Rust is permitted for the helper but not required by name;
- no Session-0 service as default Agent owner.

## Owner-attended gates

UAC/elevation, logout/reboot/sleep, cross-integrity IPC, destructive WSL lifecycle tests may be `OWNER_ATTENDED_REQUIRED`. Never bypass OS consent or persist broad elevation.

## Acceptance

User/admin/WSL environments are distinct in UI and authority; normal-user commands cannot cross into admin by payload; safe lifecycle/reconnect tests pass for qualified capabilities.

Return `DISPOSITION=PASS_V0_2_ENVIRONMENTS` or accurate `OWNER_ATTENDED_REQUIRED`.

## 详细执行设计（后续独立准入）

### 开发清单

- [ ] G11 后明确采用 user/admin/WSL 中哪些环境；没有实际需求不创建额外常驻 companion。
- [ ] 为每个 Environment 单独建立 principal、generation、Workspace 路径、能力与凭据/lifecycle 边界。
- [ ] user 发给 admin 的权限提升不是普通 payload 字段；UAC/登记与最小授权必须经真实 Owner/OS 同意。
- [ ] WSL 是独立执行/路径/凭据域；不能把 Windows 路径与权限简单字符串替换。
- [ ] 只有已证实 Win32 缺口才加入窄进程外 helper；不以安全之名重做整个 runtime。
- [ ] UI 明显显示所选环境与实际命令目标；过期 generation/不同 integrity 的命令拒绝。
- [ ] 以 fixture 验证边界，再分别申请登录/休眠/重启/UAC/WSL 生命周期的真实必要测试。
- [ ] 关闭观察者不停止其他环境的原生工作；真实清理限已确认由测试拥有的实例。

### 验收与证据

真实 user/admin/WSL 身份各自独立，没有 normal-user 越权或复制凭据。
缺权限、人或环境时 OWNER_ATTENDED_REQUIRED/BLOCKED_EXTERNAL，不能用两个 mock 环境替代。
历史 Windows Terminal 首选与无默认 Session-0 Agent 原则不变；后续 UX/TUI 可消费能力但不提升权限。
