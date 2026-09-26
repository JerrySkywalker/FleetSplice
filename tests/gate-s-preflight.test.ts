import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { createGateSAdmissionDraftV2, validateGateSAdmission } from '../packages/predeploy/index.ts';

const complete = () => ({
  ...createGateSAdmissionDraftV2(),
  values: {
    PUBLIC_HOSTNAME: 'hub.fleet-owner.org', HTTPS_ORIGIN: 'https://hub.fleet-owner.org',
    HCP_WSS_ENDPOINT: 'wss://hub.fleet-owner.org/hcp/v1/connect', TLS_INGRESS: 'owner-operated TLS termination and renewal policy',
    OIDC_ISSUER: 'https://id.fleet-owner.org/oidc', OIDC_CLIENT_ID: 'fleetsplice-g06',
    OIDC_CALLBACK_URL: 'https://hub.fleet-owner.org/auth/oidc/callback', OIDC_CLIENT_TYPE: 'CONFIDENTIAL',
    OIDC_SECRET_CUSTODY_REFERENCE_OR_POLICY: 'policy://owner/oidc-secret-custody',
    HUB_SERVICE_PRINCIPAL: 'fleetsplice-service', HUB_DATA_PATH: '/srv/fleetsplice/data', HUB_LOG_PATH: '/var/log/fleetsplice',
    RESOURCE_LIMITS: 'documented CPU memory disk connection limits', ENROLLMENT_OPERATOR: 'named owner operator',
    REVOCATION_OPERATOR: 'named owner operator', BACKUP_POLICY: 'documented encrypted backup and retention',
    RESTORE_POLICY: 'documented cold restore and readmission', MONITORING_POLICY: 'documented health and expiry monitoring',
    INCIDENT_OWNER: 'named incident owner', ROLLBACK_OWNER: 'named rollback owner',
    CORS_ORIGINS: ['https://hub.fleet-owner.org'],
  },
});

test('v2 draft retains explicit unresolved fields and resolved owner decisions', () => {
  const template = JSON.parse(readFileSync('docs/train/gate-s-admission-v2.template.json', 'utf8'));
  assert.deepEqual(template, createGateSAdmissionDraftV2());
  const report = validateGateSAdmission(createGateSAdmissionDraftV2());
  assert.equal(report.category, 'UNRESOLVED_OWNER_INPUT');
  assert.equal(report.unresolved.length, 21);
  assert.equal(Object.hasOwn(template.values, 'FIRST_LIVE_EDGE'), false);
  assert.equal(report.admitted, false);
});

test('fully shaped offline draft can reach external audit only', () => {
  const report = validateGateSAdmission(complete());
  assert.equal(report.category, 'READY_FOR_EXTERNAL_INFRA_VALIDATION');
  assert.equal(report.admitted, false);
  assert.equal(report.offline, true);
});

test('rejects fake hostnames, transport drift, embedded secrets, and owner decision drift', () => {
  const draft = complete();
  draft.values.PUBLIC_HOSTNAME = 'example.com';
  draft.values.HCP_WSS_ENDPOINT = 'ws://other.example.com/hcp';
  draft.values.OIDC_CALLBACK_URL = 'https://other.example.com/callback';
  draft.values.OIDC_SECRET_CUSTODY_REFERENCE_OR_POLICY = 'client_secret=x';
  draft.values.CORS_ORIGINS = ['*'];
  draft.decisions = { ...draft.decisions, FIRST_LIVE_EDGE: 'OTHER' } as any;
  const report = validateGateSAdmission(draft);
  assert.equal(report.category, 'INVALID_CONFIGURATION');
  for (const code of ['PUBLIC_HOSTNAME_INVALID_OR_EXAMPLE', 'HCP_WSS_ENDPOINT_INVALID', 'OIDC_CALLBACK_ORIGIN_MISMATCH',
    'EMBEDDED_SECRET_FORBIDDEN', 'EXACT_HTTPS_CORS_ORIGINS_REQUIRED', 'OWNER_EDGE_DECISION_MISMATCH'])
    assert.ok(report.findings.some(f => f.code === code), code);
});

test('production values cannot override the resolved first live Edge', () => {
  const draft = complete() as any;
  draft.values.FIRST_LIVE_EDGE = 'OTHER';
  const report = validateGateSAdmission(draft);
  assert.equal(report.category, 'INVALID_CONFIGURATION');
  assert.ok(report.findings.some(f => f.field === 'FIRST_LIVE_EDGE' && f.code === 'UNKNOWN_ADMISSION_FIELD'));
});

test('missing fields and raw secret keys fail closed', () => {
  const draft = complete() as any;
  delete draft.values.BACKUP_POLICY;
  draft.values.OIDC_CLIENT_SECRET = 'x';
  const report = validateGateSAdmission(draft);
  assert.equal(report.category, 'INVALID_CONFIGURATION');
  assert.ok(report.findings.some(f => f.code === 'REQUIRED_FIELD_MISSING'));
  assert.ok(report.findings.some(f => f.code === 'SECRET_FIELD_FORBIDDEN'));
});

test('placeholder text cannot claim readiness', () => {
  const draft = complete();
  draft.values.TLS_INGRESS = 'TBD';
  draft.values.BACKUP_POLICY = ' UNRESOLVED ';
  const report = validateGateSAdmission(draft);
  assert.equal(report.category, 'INVALID_CONFIGURATION');
  assert.ok(report.unresolved.includes('BACKUP_POLICY'));
  assert.ok(report.findings.some(f => f.field === 'TLS_INGRESS' && f.code === 'PLACEHOLDER_NOT_RESOLVED'));
});
