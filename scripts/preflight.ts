/** Offline Gate S draft check. Reads one local JSON file and writes only stdout. */
import { readFileSync } from 'node:fs';
import { validateGateSAdmission } from '../packages/predeploy/preflight.ts';

const file = process.argv[2];
if (!file || process.argv.length !== 3) {
  console.error('USAGE: npm run preflight -- <admission-v2.json>');
  process.exit(2);
}
let input: unknown;
try { input = JSON.parse(readFileSync(file, 'utf8')); }
catch { console.error('ADMISSION_DRAFT_UNREADABLE_OR_INVALID_JSON'); process.exit(2); }
const report = validateGateSAdmission(input);
console.log(JSON.stringify(report, null, 2));
console.log(`Gate S offline preflight: ${report.category}; unresolved=${report.unresolved.length}; invalid=${report.findings.length}; admitted=false`);
process.exitCode = report.category === 'INVALID_CONFIGURATION' ? 2 : report.category === 'UNRESOLVED_OWNER_INPUT' ? 1 : 0;
