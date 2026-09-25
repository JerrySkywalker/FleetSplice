import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createServer } from 'node:net';
import { randomUUID } from 'node:crypto';
import { localIdentity, principalProof, rootProof, validateLocalPrincipal } from '../apps/edge/identity.ts';

test('current Windows token/session proof and directory identity; junction/UNC/relative roots reject', async () => {
  assert.equal(process.platform, 'win32');
  const proof = principalProof();
  assert.ok(proof.principal.length > 0); assert.equal(proof.elevated, false); assert.ok(proof.sessionId > 0); assert.equal(proof.processId, process.pid);
  const directory = mkdtempSync(path.join(tmpdir(), 'fleetsplice-path-'));
  const target = path.join(directory, 'actual'); mkdirSync(target);
  const identity = await localIdentity(target, proof.sid);
  assert.equal(identity.sid, proof.sid); assert.equal(identity.principal, proof.principal);
  assert.deepEqual(await rootProof(target), { root: identity.root, rootIdentity: identity.rootIdentity });
  await assert.rejects(localIdentity(target, 'S-1-5-21-wrong'), /WRONG_PRINCIPAL/);
  const link = path.join(directory, 'junction'); symlinkSync(target, link, 'junction');
  await assert.rejects(rootProof(link), /ROOT_REPARSE_REJECTED/);
  await assert.rejects(rootProof('\\\\server\\share'), /LOCAL_ABSOLUTE_ROOT_REQUIRED/);
  await assert.rejects(rootProof('relative'), /LOCAL_ABSOLUTE_ROOT_REQUIRED/);
});

test('portable principal admission preserves exact SID, privilege and interactive-session guards', () => {
  const proof = { principal: 'OTHER-HOST\\developer', sid: 'S-1-5-21-100-200-300-400', sessionId: 1, elevated: false };
  assert.doesNotThrow(() => validateLocalPrincipal(proof, proof.sid));
  assert.doesNotThrow(() => validateLocalPrincipal({ ...proof, principal: 'DOMAIN\\renamed-user' }, proof.sid));
  for (const expectedSid of ['', 'S-1-5-21-999']) assert.throws(() => validateLocalPrincipal(proof, expectedSid), /WRONG_PRINCIPAL/);
  assert.throws(() => validateLocalPrincipal({ ...proof, sid: 'unproven' }), /WRONG_PRINCIPAL/);
  assert.throws(() => validateLocalPrincipal({ ...proof, principal: '' }), /WRONG_PRINCIPAL/);
  assert.throws(() => validateLocalPrincipal({ ...proof, elevated: true }), /PRIVILEGE_OR_SESSION_REJECTED/);
  assert.throws(() => validateLocalPrincipal({ ...proof, sessionId: 0 }), /PRIVILEGE_OR_SESSION_REJECTED/);
});
test('the qualified Windows pipe primitive excludes a second Environment writer', async () => {
  const name = `\\\\.\\pipe\\fleetsplice-g05-qualification-${randomUUID()}`;
  const first = createServer(); const second = createServer();
  await new Promise<void>((resolve, reject) => { first.once('error', reject); first.listen(name, resolve); });
  try {
    await assert.rejects(new Promise<void>((resolve, reject) => { second.once('error', reject); second.listen(name, resolve); }), /EADDRINUSE/);
  } finally { second.close(); await new Promise<void>(resolve => first.close(() => resolve())); }
});
