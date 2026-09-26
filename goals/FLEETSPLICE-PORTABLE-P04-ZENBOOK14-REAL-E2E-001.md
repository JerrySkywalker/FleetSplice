# FLEETSPLICE-PORTABLE-P04-ZENBOOK14-REAL-E2E-001

Purpose: prove the real portable-host product path on ZenBook14.

Fixtures cannot satisfy this Goal.

## Real topology

```text
FleetSplice Agent
  -> Agent-supervised official Codex app-server
     <- real Codex TUI
     <- FleetSplice Native Adoption
        <- local FleetSplice Hub/Web
```

Use the Owner's normal non-elevated Windows user and an isolated disposable
workspace/thread for test effects. Do not modify the installed Codex package.

## Required acceptance

Prove on one real native thread:

1. server start and exact identity;
2. Codex TUI attach;
3. FleetSplice automatic workspace/thread discovery;
4. TUI prompt is projected to Web;
5. Web prompt reaches the same native thread;
6. real streaming/terminal state;
7. Steer;
8. Interrupt;
9. supported harmless approval Allow Once;
10. supported harmless approval Deny;
11. viewer/controller fencing;
12. pause sharing without terminating Codex work;
13. resume sharing;
14. browser/local transport disconnect and reconnect without replay;
15. Agent/native-server restart produces a new incarnation and rejects stale
    authority;
16. return to the TUI with honest native continuity/history.

Do not claim real sleep/resume yet.

## Portable fault gates

Automate local process/transport failures that are safe to reproduce:

- native server unexpected exit;
- Agent restart;
- local HCP disconnect/reconnect;
- browser disconnect/reconnect;
- stale command/state token after restart.

Every unknown native effect remains explicit and unreplayed.

## PASS

`PASS_P04_ZENBOOK14_REAL_SAME_THREAD_E2E`
