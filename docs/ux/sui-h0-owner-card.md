# Mira H0 Owner experience card

H0=READY_FOR_OWNER; OWNER_EXECUTED=false; OWNER_APPROVED=false. Program FLEETSPLICE-SHADCN-UI-MIGRATION-060H-001. Tested app source:5089e3747d240d8acfd664c50316704f5374dc9b; [final delivery PR43](https://github.com/JerrySkywalker/FleetSplice/pull/43), [full results](../roadmap/FLEETSPLICE-SHADCN-UI-MIGRATION-060H-001/RESULTS.md). Old FPX H0 card remains historical.

## Open and stop

Use the existing isolated SUI worktree and private artifact paths from the local handoff. Web assets are already built. In a terminal at that worktree:

    $env:FLEETSPLICE_FPX_PREVIEW_ROOT = '<PRIVATE_SUI_ARTIFACTS>\owner-web'
    npm run demo:fpx

The CLI prints the path to a private LAUNCH-URL.txt; open its URL in a fresh browser tab. Do not post that bootstrap URL. Type quit or Ctrl+C in this preview terminal to stop its own server.

The built test-only fpx-desktop-preview.exe can be launched with one new disposable WebView profile directory argument (exact local command in private handoff). It serves the current Manager assets and static status; every mutating/Workspace IPC rejects SYNTHETIC_PREVIEW_MANAGEMENT_DISABLED. Closing this test window stops only its own preview. Do not launch ordinary FleetSplice Desktop, install anything or supply real Gateway/Agent credentials for this card.

## One experience pass

1. Check the dark normal session at1440px: hierarchy, readable messages, compact tool expansion, code copy, details reachable without permanent dashboard.
2. Resize near390px, switch light/dark/zh/en, open/close navigation, quick switch and configuration. Check focus return, draft,44px actions and input visibility. Browser screenshots are simulations; use real devices only as your own observations, not retroactive automated PASS.
3. In CLI type approval and select fixture-thread-approval; inspect the whole internally scrolling context and mock Allow once/Deny. Type viewer (no sending), controller, external (one explicit Review), offline (state unverified), normal.
4. Run unknown last: submit synthetic text and look up its receipt. Unknown/provisional state stays visible with no automatic resend; close the demo afterward rather than trying to force it clear.
5. Open the test-only Manager; inspect Overview/Gateway/Workspace launcher, preferences and narrow layout. Build success and IPC-mock browser captures do not prove actual embedded authentication. Native GUI observation in this train was NOT_RUN.

Return approve/revise/hold and the top issues, candidate SHA, viewport and actions. Acceptance concerns visual hierarchy/usability only. Native effects, Writer/daemon verification, H1–H4, Gate S, deployment and route selection remain unapproved. The existing Desktop first-use auth and PR23 observer-contract blockers are unchanged.
