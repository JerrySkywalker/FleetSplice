/** Local workspace-bound development bundle. No installer, publication or deployment. */
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';

const root = path.resolve(import.meta.dirname, '..');
const program = 'C:/Dev/artifacts/fleetsplice/FLEETSPLICE-UNATTENDED-DEVELOPMENT-160H-001/execution-20261022';
const head = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim();
const output = path.join(program, 'U08', `candidate-${head.slice(0, 12)}`);
const binary = path.join(program, 'U06/cargo-target/debug/examples/u160-workspace.exe');
if (!fs.existsSync(binary) || !fs.existsSync(path.join(root, 'dist/web/index.html'))) throw Error('CANDIDATE_INPUTS_NOT_BUILT');
fs.mkdirSync(output); fs.mkdirSync(path.join(output, 'desktop'));
fs.cpSync(path.join(root, 'dist/web'), path.join(output, 'web'), { recursive: true });
fs.cpSync(path.join(root, 'apps/desktop/dist'), path.join(output, 'manager-web'), { recursive: true });
fs.copyFileSync(binary, path.join(output, 'desktop/u160-workspace.exe'));
const quote = value => `'${value.replaceAll("'", "''")}'`;
const sessions = path.join(output, 'sessions');
fs.writeFileSync(path.join(output, 'START.ps1'), `Set-Location -LiteralPath ${quote(root)}\n& ${quote(process.execPath)} ${quote(path.join(root, 'scripts/u160-candidate.mjs'))} --artifact-root ${quote(sessions)} --web-directory ${quote(path.join(output, 'web'))}\n`);
fs.writeFileSync(path.join(output, 'STOP.ps1'), `$candidateRun=Get-Content -LiteralPath ${quote(path.join(sessions, 'ACTIVE-RUN.json'))} -Raw | ConvertFrom-Json\nNew-Item -ItemType File -Path (Join-Path $candidateRun.directory 'STOP') -Force | Out-Null\n`);
fs.writeFileSync(path.join(output, 'START-DESKTOP-TEST.ps1'), `$candidateProfile=Join-Path ${quote(path.join(output, 'desktop-profiles'))} ([guid]::NewGuid().ToString())\nNew-Item -ItemType Directory -Path $candidateProfile -Force | Out-Null\n$env:WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS='--ignore-certificate-errors --lang=en-US'\n& ${quote(path.join(output, 'desktop/u160-workspace.exe'))} "--profile=$candidateProfile"\n`);
const media = path.join(output, 'media'); fs.mkdirSync(media);
const copyMedia = (directory, label) => {
  for (const file of fs.readdirSync(directory).filter(name => name.endsWith('.png') || name === 'synthetic-integration.webm')) fs.copyFileSync(path.join(directory, file), path.join(media, `${label}-${file}`));
};
const integrations = fs.readdirSync(path.join(program, 'U07')).filter(name => name.startsWith('integration-')).sort().reverse();
const passed = integrations.find(name => { const result = path.join(program, 'U07', name, 'RESULT.json'); return fs.existsSync(result) && JSON.parse(fs.readFileSync(result, 'utf8')).status === 'PASS'; });
if (!passed) throw Error('PASSING_INTEGRATION_EVIDENCE_REQUIRED');
copyMedia(path.join(program, 'U07', passed), 'browser');
const binaryHash = createHash('sha256').update(fs.readFileSync(binary)).digest('hex');
const webview = fs.readdirSync(path.join(program, 'U06')).filter(name => name.startsWith('webview-')).sort().reverse().find(name => {
  const file = path.join(program, 'U06', name, 'RESULT.json'); if (!fs.existsSync(file)) return false;
  const result = JSON.parse(fs.readFileSync(file, 'utf8')); return result.status === 'PASS' && result.binarySha256 === binaryHash;
});
if (!webview) throw Error('PASSING_TEST_BINARY_EVIDENCE_REQUIRED');
copyMedia(path.join(program, 'U06', webview), 'actual-webview');
fs.writeFileSync(path.join(output, 'OWNER-HANDOFF.md'), `# U160 development candidate\n\nSource ${head}. This is a workspace-bound local development bundle, not a portable installer or release. Preserve the execution worktree and its restored dependencies/compiled fixtures.\n\nRun START.ps1 in PowerShell to start the real Gateway/Edge-HCP + synthetic IdP/Native preview. Its private URL is shown in that console and saved in the session directory. Sign in as the synthetic Owner; trust exceptions belong only to this disposable fixture. Commands: status, disconnect, reconnect, expire, unknown, quit. STOP.ps1 creates the current run's stop marker; quit/Ctrl+C/30min also close its own servers.\n\nSTART-DESKTOP-TEST.ps1 opens only the isolated test executable with a fresh profile and process-only test certificate exception. In its Workspace pane, use the preview origin. No ordinary Desktop setup or daily Agent runs; Manager reads are fixtures and native effects are0. Close its windows separately.\n\nmedia/ distinguishes ordinary-browser real HCP/synthetic Native evidence from actual Tauri/WebView screenshots. Native menu clicks, OS identity qualification, production Agent lifecycle, real Native and H0-H4/Gate S remain unaccepted. Cookie host/port limitations are documented in the source auth amendment.\n`);
const files = [];
function inventory(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name); if (entry.isDirectory()) inventory(file);
    else files.push({ path: path.relative(output, file).replaceAll('\\', '/'), sha256: createHash('sha256').update(fs.readFileSync(file)).digest('hex') });
  }
}
inventory(output);
fs.writeFileSync(path.join(output, 'CANDIDATE-MANIFEST.json'), JSON.stringify({ goalId: 'FLEETSPLICE-UNATTENDED-DEVELOPMENT-160H-001', sourceHead: head, workspaceBound: true, workspace: root, qualifiedNode: process.execPath, evidence: 'DEVELOPMENT_CANDIDATE_SYNTHETIC_NATIVE', realNativeConnections: 0, realNativeEffects: 0, files }, null, 2));
console.log(`Candidate saved: ${output}`);
