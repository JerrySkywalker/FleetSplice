/**
 * Owner Experience Pack — deterministic local showcase.
 * Real built Web UI + disposable Native Adoption fixture.
 * No real Codex daemon, no network, no Owner-thread mutation.
 */
import { createServer } from 'node:net';
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { startHub } from '../apps/hub/server.ts';
import { target } from '../tests/helpers.ts';
import { createDisposableAdoptionFixture } from '../tests/fixtures/native-adoption-browser-fixture.ts';

const ARTIFACT_ROOT = path.resolve(
  process.env.FLEETSPLICE_OWNER_EXPERIENCE_ROOT
    ?? 'V:\\artifacts\\FleetSplice\\FLEETSPLICE-G05C-UX-R2-DENSITY-SEMANTICS-001\\OWNER-EXPERIENCE',
);

const EXPERIENCE_TRANSCRIPT = {
  title: 'FleetSplice Owner Experience — disposable demo conversation',
  disclaimer: 'Demonstration content only. Not work performed in an Owner production repository.',
  workspace: 'V:\\disposable-native-browser-accept',
  turns: [
    {
      id: 'demo-turn-1',
      user: 'What is the current git branch and short HEAD for this disposable workspace?',
      assistantStream: [
        'Checking the disposable repository state…',
        'I will run a harmless read-only git status probe.',
      ],
      tool: {
        command: 'git branch --show-current && git rev-parse --short HEAD',
        running: 'Running…',
        completed: 'Completed · 0.4s',
        result: 'demo/r2-owner-experience\na1b2c3d',
      },
      assistantFinal: 'Branch `demo/r2-owner-experience`, short HEAD `a1b2c3d`. This is disposable fixture content.',
    },
    {
      id: 'demo-turn-2',
      user: 'Summarize how FleetSplice should feel as a Quiet Data Instrument.',
      assistantFinal: [
        'Quiet Data Instrument means:',
        '1. Neutral AI-workspace appearance with low permanent chrome.',
        '2. Conversation-first layout and developer-grade density.',
        '3. Progressive disclosure for configuration and Inspector details.',
        '4. Precise controller/viewer, approval, and external-review semantics.',
        '5. Mobile keeps only header, conversation, and an outlined composer.',
      ].join('\n'),
    },
  ],
  externalReview: {
    title: 'Native session changed outside this Web controller.',
    body: 'New conversation activity is already shown below.',
    action: 'Review and continue',
  },
};

async function freePort(): Promise<number> {
  const probe = createServer();
  await new Promise<void>(resolve => probe.listen(0, '127.0.0.1', resolve));
  const port = (probe.address() as { port: number }).port;
  await new Promise<void>(resolve => probe.close(() => resolve()));
  return port;
}

function writePack() {
  mkdirSync(ARTIFACT_ROOT, { recursive: true });
  writeFileSync(path.join(ARTIFACT_ROOT, 'experience-transcript.json'), JSON.stringify(EXPERIENCE_TRANSCRIPT, null, 2));
  writeFileSync(path.join(ARTIFACT_ROOT, 'experience-content.md'), `# Owner experience content

Disclaimer: disposable demonstration only. Not Owner production work.

## Seeded conversation

### Turn 1
**User:** ${EXPERIENCE_TRANSCRIPT.turns[0]!.user}

**Assistant (stream):** ${EXPERIENCE_TRANSCRIPT.turns[0]!.assistantStream!.join(' ')}

**Tool:** \`${EXPERIENCE_TRANSCRIPT.turns[0]!.tool!.command}\` — Running → Completed

**Assistant:** ${EXPERIENCE_TRANSCRIPT.turns[0]!.assistantFinal}

### Turn 2
**User:** ${EXPERIENCE_TRANSCRIPT.turns[1]!.user}

**Assistant:**
\`\`\`
${EXPERIENCE_TRANSCRIPT.turns[1]!.assistantFinal}
\`\`\`

### External review state
- ${EXPERIENCE_TRANSCRIPT.externalReview.title}
- Primary action: **${EXPERIENCE_TRANSCRIPT.externalReview.action}**
`);
  writeFileSync(path.join(ARTIFACT_ROOT, 'owner-review-checklist.md'), `# Owner review checklist

1. Run \`npm run demo:owner-experience\` and open the printed URL.
2. Confirm Quiet Data Instrument feel: low chrome, conversation first.
3. Desktop: outlined composer, compact config chips, coherent ownership.
4. Resize to tablet: drawers for sessions/context; no cramped three-column.
5. Resize to ~390px: one config capsule row, no helper paragraphs, tall message area.
6. Open config capsule/sheet: exact model/permission + read-only honesty.
7. Open Inspector: daemon PID / endpoint remain details only.
8. Send a prompt: watch tool Running → Completed in place.
9. Trigger preferences theme switch across dark / OLED / light.
10. Confirm Connect session wording (reload before connecting if needed).
`);
  writeFileSync(path.join(ARTIFACT_ROOT, 'README.md'), `# FleetSplice Owner Experience Pack (R2)

## Start (exact one command)

\`\`\`bash
npm run demo:owner-experience
\`\`\`

Then open the printed \`http://127.0.0.1:<port>/#bootstrap=...\` URL in a local browser.

## What this is

- Real built FleetSplice Web UI (\`dist/web\`)
- Deterministic disposable Native Adoption fixture
- No real Codex daemon
- No mutation of real native threads
- No external network dependency

## What to evaluate

See \`owner-review-checklist.md\` and \`experience-content.md\`.

## Simulated lifecycle

After connect, send any prompt. The fixture emits a streaming assistant message,
an in-place tool Running→Completed transition, and a final assistant message.

Optional: the process prints control tips for theme / drawer / Inspector review.
`);
  writeFileSync(path.join(ARTIFACT_ROOT, 'launch-owner-experience.ps1'), `# Canonical command remains: npm run demo:owner-experience
Set-Location -Path (Resolve-Path (Join-Path $PSScriptRoot '..\\..\\..\\src\\FleetSplice-g05c-ux-r2') -ErrorAction SilentlyContinue)
if (-not (Test-Path package.json)) { Set-Location -Path $PSScriptRoot }
npm run demo:owner-experience
`);
}

async function run() {
  writePack();
  if (!existsSync(path.resolve('dist/web/index.html'))) {
    console.error('dist/web missing. Run npm run build first.');
    process.exit(1);
  }

  const fixture = await createDisposableAdoptionFixture();
  // Richer disposable history for immediate review after connect.
  fixture.rpc.turns[0].items = [
    { id: 'demo-user-1', type: 'userMessage', content: [{ type: 'text', text: EXPERIENCE_TRANSCRIPT.turns[0]!.user }] },
    { id: 'demo-answer-1', type: 'agentMessage', text: String(EXPERIENCE_TRANSCRIPT.turns[0]!.assistantFinal) },
    {
      id: 'demo-user-2', type: 'userMessage',
      content: [{ type: 'text', text: EXPERIENCE_TRANSCRIPT.turns[1]!.user }],
    },
    { id: 'demo-answer-2', type: 'agentMessage', text: String(EXPERIENCE_TRANSCRIPT.turns[1]!.assistantFinal) },
  ];
  fixture.rpc.afterTurnStart = (turnId) => {
    fixture.rpc.emitOwnedTurnLifecycle(turnId, {
      assistantA: 'Checking disposable repository state…',
      assistantB: 'Branch demo/r2-owner-experience · HEAD a1b2c3d (fixture only).',
      toolCommand: 'git branch --show-current',
    });
  };

  const port = await freePort();
  const bootstrapToken = randomUUID();
  const hub = await startHub({
    port,
    target: target(),
    root: 'V:\\disposable-native-browser-accept',
    sid: 'owner-experience',
    principal: 'owner-experience',
    sessionId: 1,
    stateDirectory: mkdtempSync(path.join(tmpdir(), 'fleet-owner-experience-')),
    webDirectory: path.resolve('dist/web'),
    hcpToken: randomUUID(),
    bootstrapToken,
  }, fixture.adoptionPort);

  const url = `http://127.0.0.1:${port}/#bootstrap=${bootstrapToken}`;
  writeFileSync(path.join(ARTIFACT_ROOT, 'LAUNCH-URL.txt'), `${url}\n`);
  console.log('');
  console.log('============================================================');
  console.log('FleetSplice Owner Experience Pack');
  console.log('============================================================');
  console.log(`URL: ${url}`);
  console.log(`Pack: ${ARTIFACT_ROOT}`);
  console.log('');
  console.log('Tips:');
  console.log('  1. Click "Connect session"');
  console.log('  2. Review seeded disposable conversation');
  console.log('  3. Send a prompt to see streaming + tool lifecycle');
  console.log('  4. Resize browser for tablet/mobile density');
  console.log('  5. Use Preferences for theme switching');
  console.log('  6. Ctrl+C to stop');
  console.log('============================================================');
  console.log('');

  const stop = async () => {
    await hub.close();
    fixture.rpc.close();
    process.exit(0);
  };
  process.on('SIGINT', () => { void stop(); });
  process.on('SIGTERM', () => { void stop(); });

  // Keep alive
  await new Promise(() => {});
}

run().catch(error => {
  console.error(error);
  process.exit(1);
});
