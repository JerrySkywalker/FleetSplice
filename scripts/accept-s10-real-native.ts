/** S10 product-only HTTPS/WSS native-adoption admission harness. No topology fixtures. */
import { createServer } from 'node:net';
import { mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { request } from 'node:https';
import { randomUUID } from 'node:crypto';
import { launch } from './local.ts';
import { discoverDaemon } from '../packages/native-adoption/discovery.ts';
import { createEphemeralTlsMaterial } from '../packages/remote-transport/index.ts';
import { generateHostEnrollmentKey } from '../packages/remote-enrollment/index.ts';

const option = (name: string) => { const i = process.argv.indexOf(name); return i >= 0 ? process.argv[i + 1] : undefined; };
const workspace = option('--workspace') ?? '';
const evidence = path.resolve(option('--evidence') ?? path.join(tmpdir(), 'fleetsplice-s10-evidence'));
if (!workspace) throw new Error('S10_WORKSPACE_REQUIRED');
const port = await new Promise<number>(resolve => { const p = createServer(); p.listen(0, '127.0.0.1', () => { const value = (p.address() as { port: number }).port; p.close(() => resolve(value)); }); });
const tls = createEphemeralTlsMaterial(); const origin = `https://localhost:${port}`;
mkdirSync(evidence, { recursive: true });
const executable = discoverDaemon().executablePath; if (!executable) throw new Error('S10_NATIVE_EXECUTABLE_UNAVAILABLE');
const localAppData = path.join(evidence, 'isolated-localappdata'); mkdirSync(localAppData, { recursive: true });
const run = await launch(path.resolve(workspace), executable, port, { environment: { ...process.env, LOCALAPPDATA: localAppData }, productPath: 'NATIVE_ADOPTION', transport: { deployment: { kind: 'PUBLIC_HTTPS', publicBaseUrl: origin }, listener: { host: '127.0.0.1', tls }, hcpUrl: `wss://localhost:${port}/hcp/v1/connect`, testTlsCaPem: tls.certPem } });
try {
  const session = await new Promise<{ cookie: string; clientInstanceId: string; csrf: string }>((resolve, reject) => {
    const token = new URL(run.url).hash.slice('#bootstrap='.length);
    const bootstrap = request({ hostname: 'localhost', port, method: 'POST', path: '/api/bootstrap', ca: tls.certPem, servername: 'localhost', headers: { origin, 'content-type': 'application/json' } }, res => {
      const cookie = res.headers['set-cookie']?.[0]?.split(';')[0]; if (!cookie) { reject(new Error('S10_BOOTSTRAP_COOKIE_MISSING')); return; }
      const client = request({ hostname: 'localhost', port, method: 'POST', path: '/api/client', ca: tls.certPem, servername: 'localhost', headers: { origin, cookie, 'content-type': 'application/json' } }, clientResponse => {
        const clientChunks: Buffer[] = []; clientResponse.on('data', x => clientChunks.push(x)); clientResponse.on('end', () => {
          const grant = JSON.parse(Buffer.concat(clientChunks).toString()) as { clientInstanceId: string; csrf: string };
          resolve({ cookie, ...grant });
        });
      }); client.on('error', reject); client.end('{}');
    }); bootstrap.on('error', reject); bootstrap.end(JSON.stringify({ token }));
  });
  const api = <T>(method: 'GET' | 'POST', endpoint: string, body?: unknown) => new Promise<T>((resolve, reject) => {
    const req = request({ hostname: 'localhost', port, method, path: endpoint, ca: tls.certPem, servername: 'localhost', headers: { origin, cookie: session.cookie, 'x-fleet-client': session.clientInstanceId, 'x-fleet-csrf': session.csrf, ...(body === undefined ? {} : { 'content-type': 'application/json' }) } }, res => {
      const chunks: Buffer[] = []; res.on('data', x => chunks.push(x)); res.on('end', () => {
        const payload = JSON.parse(Buffer.concat(chunks).toString());
        if ((res.statusCode ?? 500) >= 400) reject(new Error(`S10_GATEWAY_${res.statusCode}_${payload.error ?? 'REJECTED'}`)); else resolve(payload);
      });
    }); req.on('error', reject); req.end(body === undefined ? undefined : JSON.stringify(body));
  });
  const enrollment = generateHostEnrollmentKey({ fleetId: 's10-local', hostId: run.target.hostId, environmentId: run.target.environmentId, enrollmentGeneration: '1' });
  const requested = await api<{ requestId: string }>('POST', '/api/devices/enroll', { hostName: 'SKYFORGE-01 S10', identity: {
    fleetId: enrollment.fleetId, hostId: enrollment.hostId, environmentId: enrollment.environmentId, enrollmentGeneration: enrollment.enrollmentGeneration,
    publicKeySpkiPem: enrollment.publicKeySpkiPem, publicFingerprint: enrollment.publicFingerprint } });
  const approved = await api<{ requestId: string; state: string }>('POST', `/api/devices/${requested.requestId}/approve`, {});
  if (approved.requestId !== requested.requestId || approved.state !== 'APPROVED') throw new Error('S10_ENROLLMENT_APPROVAL_FAILED');
  await run.replaceEdgeWithEnrollment(enrollment);
  const snapshot = await api<any>('GET', '/api/native/snapshot?discover=1');
  const thread = snapshot.threads?.find((item: any) => item.workspace.toLowerCase() === path.resolve(workspace).toLowerCase());
  if (!thread) throw new Error('S10_QUALIFIED_ORDINARY_THREAD_NOT_PROJECTED');
  const command = (family: string, current: any, text = '') => ({ commandId: randomUUID(), runtimeId: current.runtimeId, clientInstanceId: session.clientInstanceId,
    expectedFence: current.fence, incarnation: current.incarnation, threadId: thread.id, stateToken: current.threads.find((item: any) => item.id === thread.id)?.stateToken,
    activeTurnId: current.threads.find((item: any) => item.id === thread.id)?.activeTurnId ?? null, family, text, clientDisplayLabel: 'S10 acceptance' });
  const attach = await api<any>('POST', '/api/native/commands', command('native.attach', snapshot));
  if (attach.status !== 'SUCCEEDED' || attach.code !== 'NATIVE_SAME_THREAD_ATTACHED_COOPERATIVE') throw new Error('S10_SAME_THREAD_ATTACH_FAILED');
  const attached = await api<any>('GET', '/api/native/snapshot');
  const receipt = await api<any>('GET', `/api/native/commands/${attach.commandId}`);
  if (receipt.commandId !== attach.commandId || receipt.status !== 'SUCCEEDED') throw new Error('S10_RECEIPT_LOOKUP_FAILED');
  const submit = await api<any>('POST', '/api/native/commands', command('native.submit', attached,
    'S10 product acceptance continuation. Reply exactly: S10_PRODUCT_E2E_OK. Do not use tools or modify files.'));
  if (submit.status !== 'SUCCEEDED' || submit.code !== 'NATIVE_CONTINUATION_ACCEPTED' || !submit.turnId) throw new Error(`S10_NATIVE_CONTINUATION_NOT_ACCEPTED:${submit.status}:${submit.code}`);
  const submitReceipt = await api<any>('GET', `/api/native/commands/${submit.commandId}`);
  if (submitReceipt.commandId !== submit.commandId || submitReceipt.status !== 'SUCCEEDED' || submitReceipt.turnId !== submit.turnId) throw new Error('S10_CONTINUATION_RECEIPT_LOOKUP_FAILED');
  let terminal: any = null;
  for (let attempt = 0; attempt < 30; attempt++) {
    const observed = await api<any>('GET', '/api/native/snapshot?discover=1');
    const turn = observed.threads?.find((item: any) => item.id === thread.id)?.turns?.find((item: any) => item.id === submit.turnId);
    if (turn?.state === 'COMPLETED') { terminal = observed; break; }
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  if (!terminal) throw new Error('S10_NATIVE_CONTINUATION_TERMINAL_OBSERVATION_MISSING');
  const result = { status: 'PASS_PGS_S10_REAL_NATIVE_REMOTE_E2E_PAIRED_CONTINUATION', gateway: origin, hcp: `wss://localhost:${port}/hcp/v1/connect`, enrollment: { requestId: requested.requestId, state: approved.state }, threadId: thread.id, attach, receipt, submit, submitReceipt, snapshot: terminal };
  writeFileSync(path.join(evidence, 's10-product-native-admission.json'), JSON.stringify(result, null, 2)); console.log(JSON.stringify(result));
} finally { await run.stop(); }
