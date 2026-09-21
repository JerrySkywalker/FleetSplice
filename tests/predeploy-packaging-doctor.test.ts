import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import {
  PRODUCTION_PLACEHOLDERS,
  UNRESOLVED,
  createUnresolvedAdmissionDraft,
  assertPlaceholdersUnresolved,
  createLocalHubPredeployConfig,
  HubPredeployRuntime,
  EdgePredeployController,
  createIngressContractTemplate,
  validateHubConfig,
} from '../packages/predeploy/index.ts';

test('production placeholders remain unresolved', () => {
  const draft = createUnresolvedAdmissionDraft();
  assert.equal(PRODUCTION_PLACEHOLDERS.length, 8);
  for (const key of PRODUCTION_PLACEHOLDERS) {
    assert.equal(draft[key], UNRESOLVED);
  }
  assertPlaceholdersUnresolved(draft);
  assert.throws(() => assertPlaceholdersUnresolved({
    ...draft,
    PUBLIC_HOSTNAME: 'example.invalid',
  } as unknown as typeof draft), /PRODUCTION_PLACEHOLDER_MUST_REMAIN_UNRESOLVED:PUBLIC_HOSTNAME/);
});

test('hub config, health, doctor, graceful stop, backup restore, redaction', () => {
  const stateDirectory = mkdtempSync(path.join(tmpdir(), 'fs-hub-predeploy-'));
  const config = createLocalHubPredeployConfig(stateDirectory, 0);
  validateHubConfig(config);
  assert.throws(() => validateHubConfig({
    ...config,
    allowedOrigins: ['*'],
  }), /HUB_WILDCARD_CORS_FORBIDDEN/);

  const hub = new HubPredeployRuntime(config);
  assert.equal(hub.health().status, 'not_ready');
  hub.start();
  assert.equal(hub.health().status, 'ok');
  assert.equal(hub.readiness().status, 'ok');
  const doctor = hub.doctor();
  assert.equal(doctor.configValid, true);
  assert.equal(doctor.placeholdersUnresolved, true);
  assert.equal(doctor.healthy, true);

  const backup = hub.createFailClosedBackup('t09');
  const restored = hub.restoreBackupBytes(backup);
  assert.equal(restored.authority, 'BLOCKED_PENDING_READMISSION');

  const redacted = hub.redactLogLine('Authorization: Bearer secret __Host-fleetsplice=abcdef0123456789');
  assert.match(redacted, /Authorization:\s*<redacted>/);
  assert.match(redacted, /__Host-fleetsplice=<redacted>/);

  hub.stop();
  assert.equal(hub.health().stopping, true);
  assert.equal(hub.health().status, 'not_ready');
  hub.disposeStateForTests();
});

test('edge enroll/status/doctor/disconnect/re-enroll/revoke; no inbound listener', () => {
  const edge = new EdgePredeployController({
    hubWssUrl: 'wss://localhost:9443/hcp',
    expectedHostname: 'localhost',
    fleetId: 'fleet-local',
    hostId: 'host-local',
    environmentId: 'env-local',
    enrollmentGeneration: '1',
  });
  assert.equal(edge.inboundFleetListenerAllowed(), false);
  assert.throws(() => new EdgePredeployController({
    hubWssUrl: 'ws://localhost/hcp',
    expectedHostname: 'localhost',
    fleetId: 'f',
    hostId: 'h',
    environmentId: 'e',
    enrollmentGeneration: '1',
  }), /EDGE_HUB_URL_MUST_BE_WSS/);

  const enrolled = edge.run('enroll');
  assert.equal(enrolled.inboundFleetListener, false);
  assert.equal(enrolled.enrolled, true);
  assert.equal(edge.run('status').connected, true);
  const doctor = edge.run('doctor') as { endpointValid: boolean; inboundFleetListener: false };
  assert.equal(doctor.endpointValid, true);
  assert.equal(doctor.inboundFleetListener, false);
  assert.equal(edge.run('disconnect').connected, false);
  const re = edge.run('re-enroll');
  assert.equal(re.enrolled, true);
  assert.equal(edge.run('revoke').revoked, true);
  assert.throws(() => edge.run('enroll'), /EDGE_REVOKED/);
});

test('ingress contract template forbids wildcard CORS and nginx mutation', () => {
  const template = createIngressContractTemplate();
  assert.equal(template.kind, 'G06_INGRESS_CONTRACT_TEMPLATE');
  assert.equal(template.cors.allowWildcard, false);
  assert.equal(template.nginxUiMutationAuthorized, false);
  assert.equal(template.productionPlaceholdersUnresolved, true);
  assert.equal(template.https.exactHostPlaceholder, 'PUBLIC_HOSTNAME');
  assert.ok(template.securityHeaders['Strict-Transport-Security']);
  assert.equal(template.wss.upgradeRequired, true);
});
