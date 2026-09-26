import assert from 'node:assert/strict';
import test from 'node:test';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const { diagnoseOpenSsl } = await import(pathToFileURL(path.resolve('scripts/development-doctor.mjs')).href);

test('missing OpenSSL reports bounded local test prerequisite', () => {
  const result = diagnoseOpenSsl(() => ({ status: null, error: new Error('ENOENT') }));
  assert.equal(result.code, 'OPENSSL_LOCAL_TEST_TLS');
  assert.equal(result.status, 'MISSING_OR_UNQUALIFIED');
  assert.match(result.detail, /localhost test TLS only/);
  assert.match(result.detail, /no production runtime dependency/);
});

test('available OpenSSL reports version', () => {
  const result = diagnoseOpenSsl(() => ({ status: 0, stdout: 'OpenSSL 3.6.1\n' }));
  assert.equal(result.status, 'PASS');
  assert.equal(result.detail, 'OpenSSL 3.6.1');
});
