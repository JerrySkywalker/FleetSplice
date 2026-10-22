import { fork } from 'node:child_process';
import { mkdirSync, writeFileSync, createWriteStream } from 'node:fs';
import path from 'node:path';
import { once } from 'node:events';
import { createEphemeralTlsMaterial } from '../../packages/remote-transport/index.ts';

export async function authFixture(directory: string) {
  mkdirSync(directory, { recursive: true });
  const tls = createEphemeralTlsMaterial();
  writeFileSync(path.join(directory, 'cert.pem'), tls.certPem); writeFileSync(path.join(directory, 'key.pem'), tls.keyPem);
  const log = createWriteStream(path.join(directory, 'worker.log'));
  const child = fork(new URL('./u160-auth-worker.js', import.meta.url), [directory], { env: { ...process.env, NODE_EXTRA_CA_CERTS: path.join(directory, 'cert.pem') }, stdio: ['ignore', 'pipe', 'pipe', 'ipc'] });
  child.stdout!.pipe(log); child.stderr!.pipe(log);
  const ready = await Promise.race([once(child, 'message').then(([value]) => value as { origin: string }), once(child, 'exit').then(([code]) => { throw Error(`AUTH_FIXTURE_EXIT_${code}`); })]);
  let id = 0;
  return { origin: ready.origin, async control(kind: 'counters' | 'expire' | 'idle14' | 'idle2' | 'unknown' | 'otherOwner' | 'holdLogin') {
    const wanted = ++id;
    return await new Promise<Record<string, number>>(resolve => { const listener = (value: any) => { if (value.id === wanted) { child.off('message', listener); resolve(value); } }; child.on('message', listener); child.send({ kind, id: wanted }); });
  }, async close() { child.send({ kind: 'stop' }); await once(child, 'exit'); log.end(); } };
}
