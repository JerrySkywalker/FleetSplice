import test from 'node:test';
import assert from 'node:assert/strict';
import * as vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { Journal } from '../packages/journal/index.ts';
import { NativeActivityJournal } from '../packages/native-adoption/activity-journal.ts';
import * as json from '../packages/contracts/json.ts';

test('C06: actual Edge composition rejects uncertain journal before discovery or transport', async () => {
  const directory = mkdtempSync(path.join(tmpdir(), 'fs-edge-recovery-'));
  const journal = new Journal(path.join(directory, 'native-edge.sqlite'));
  journal.append('NATIVE_EFFECT_ATTEMPT', 'fixture-unknown', { command: { commandId: 'fixture-unknown' } }); journal.close();
  let contacts = 0;
  const forbiddenContact = () => { contacts++; throw Error('SYNTHETIC_NATIVE_CONTACT_FORBIDDEN'); };
  // Execute the compiled real composition with fake discovery/transport. A
  // regression can fail the test but can never reach a real native runtime.
  const context = vm.createContext({ process: { send: undefined, argv: [] }, Date });
  const module = new vm.SourceTextModule(readFileSync(new URL('../apps/edge/native-adoption.js', import.meta.url), 'utf8'), { context });
  const imports: Record<string, Record<string, unknown>> = {
    'node:url': { fileURLToPath }, 'node:path': { default: path },
    '../../packages/native-adoption/activity-journal.js': { NativeActivityJournal },
    '../../packages/native-adoption/adapter.js': { NativeAdoptionAdapter: class {} },
    '../../packages/native-adoption/discovery.js': { discoverDaemon: forbiddenContact, nativeHome: forbiddenContact },
    '../../packages/native-adoption/transport.js': { OfficialNativeRpc: { connect: forbiddenContact } },
    '../../packages/native-adoption/compatibility.js': { assertSameIncarnation: forbiddenContact },
    './identity.js': { rootProofNow: () => ({ root: directory, rootIdentity: 'fixture-root' }) },
    '../../packages/journal/index.js': { Journal }, '../../packages/contracts/json.js': { Fault: json.Fault, requireThat: json.requireThat },
    './supervised-native-server.js': { AgentSupervisedNativeServer: class { constructor() { forbiddenContact(); } } },
  };
  await module.link(async specifier => {
    const values = imports[specifier]!;
    return new vm.SyntheticModule(Object.keys(values), function () { for (const [key, value] of Object.entries(values)) this.setExport(key, value); }, { context });
  });
  await module.evaluate();
  const edge = (module.namespace as { nativeAdoptionEdge(workspace: string, state: string): Promise<unknown> }).nativeAdoptionEdge;
  await assert.rejects(edge(directory, directory), /NATIVE_PREDECESSOR_EFFECT_UNKNOWN_NO_REPLAY/);
  assert.equal(contacts, 0);
});
