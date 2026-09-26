import { GATE_S_FIELDS, GATE_S_OWNER_DECISIONS, type GateSField } from './admission-v2.ts';
import { isIP } from 'node:net';

export type PreflightCategory = 'READY_FOR_EXTERNAL_INFRA_VALIDATION' | 'UNRESOLVED_OWNER_INPUT' | 'INVALID_CONFIGURATION';
export type PreflightFinding = { field: string; code: string };
export type GateSPreflightReport = {
  schemaVersion: 2;
  category: PreflightCategory;
  admitted: false;
  offline: true;
  unresolved: GateSField[];
  findings: PreflightFinding[];
};

const object = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);
const isUnresolved = (value: unknown): boolean => typeof value === 'string' && value.trim() === 'UNRESOLVED';
const placeholderLike = (value: unknown): boolean => typeof value === 'string'
  && (/^<(?:[^<>]+)>$/.test(value.trim()) || /^(?:TBD|TODO|PLACEHOLDER|CHANGEME)$/i.test(value.trim()));
const secretLike = (value: string): boolean =>
  /-----BEGIN (?:[A-Z ]*PRIVATE KEY|CERTIFICATE)-----|\bBearer\s+\S+|\bsk-(?:proj-)?[A-Za-z0-9_-]{12,}|client_secret\s*[:=]/i.test(value);
const forbiddenKey = (key: string): boolean =>
  /SECRET|PASSWORD|TOKEN|PRIVATE.?KEY|KEY.?PEM|CERT.?PEM/i.test(key)
  && key !== 'OIDC_SECRET_CUSTODY_REFERENCE_OR_POLICY';

function parseUrl(value: unknown, protocols: string[], originOnly = false): URL | null {
  if (typeof value !== 'string') return null;
  try {
    const url = new URL(value);
    if (!protocols.includes(url.protocol) || url.username || url.password || url.hash || url.search) return null;
    if (originOnly && (url.pathname !== '/' || url.href !== url.origin + '/')) return null;
    return url;
  } catch { return null; }
}

const validDnsName = (host: string): boolean => host.length <= 253 && host.includes('.')
  && host.split('.').every(label => label.length > 0 && label.length <= 63
    && /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i.test(label));
const reservedHost = (host: string): boolean =>
  !validDnsName(host) || host === 'localhost' || host === '127.0.0.1' || host === '[::1]'
  || host.endsWith('.localhost') || host.endsWith('.invalid') || host.endsWith('.example')
  || host.endsWith('.test') || host.endsWith('.local') || host.endsWith('.internal')
  || ['example.com', 'example.net', 'example.org'].some(domain => host === domain || host.endsWith(`.${domain}`))
  || isIP(host) !== 0
  || host.includes('*') || host.includes('<') || host.includes('>');

export function validateGateSAdmission(input: unknown): GateSPreflightReport {
  const findings: PreflightFinding[] = [];
  const unresolved: GateSField[] = [];
  const add = (field: string, code: string) => findings.push({ field, code });
  if (!object(input)) add('root', 'ADMISSION_OBJECT_REQUIRED');
  const root = object(input) ? input : {};
  for (const key of Object.keys(root)) if (!['schemaVersion', 'decisions', 'values'].includes(key)) add(key, 'UNKNOWN_ADMISSION_FIELD');
  if (root.schemaVersion !== 2) add('schemaVersion', 'ADMISSION_V2_REQUIRED');
  const decisions = object(root.decisions) ? root.decisions : {};
  for (const key of Object.keys(decisions)) if (!['HUMAN_AUTH_CONTRACT', 'FIRST_LIVE_EDGE'].includes(key)) add(`decisions.${key}`, 'UNKNOWN_DECISION_FIELD');
  if (decisions.HUMAN_AUTH_CONTRACT !== GATE_S_OWNER_DECISIONS.HUMAN_AUTH_CONTRACT) add('decisions.HUMAN_AUTH_CONTRACT', 'OWNER_AUTH_DECISION_MISMATCH');
  if (decisions.FIRST_LIVE_EDGE !== GATE_S_OWNER_DECISIONS.FIRST_LIVE_EDGE) add('decisions.FIRST_LIVE_EDGE', 'OWNER_EDGE_DECISION_MISMATCH');
  const values = object(root.values) ? root.values : {};
  if (!object(root.values)) add('values', 'ADMISSION_VALUES_REQUIRED');
  for (const field of GATE_S_FIELDS) {
    const value = values[field];
    if (value === undefined || value === null) add(field, 'REQUIRED_FIELD_MISSING');
    else if (isUnresolved(value)) unresolved.push(field);
    else if (placeholderLike(value)) add(field, 'PLACEHOLDER_NOT_RESOLVED');
    else if (field !== 'CORS_ORIGINS' && (typeof value !== 'string' || !value.trim())) add(field, 'NONEMPTY_VALUE_REQUIRED');
  }
  for (const key of Object.keys(values)) if (!GATE_S_FIELDS.includes(key as GateSField)) add(key, 'UNKNOWN_ADMISSION_FIELD');
  const scan = (value: unknown, field: string): void => {
    if (typeof value === 'string' && secretLike(value)) add(field, 'EMBEDDED_SECRET_FORBIDDEN');
    if (object(value)) for (const [key, child] of Object.entries(value)) {
      if (forbiddenKey(key)) add(`${field}.${key}`, 'SECRET_FIELD_FORBIDDEN');
      scan(child, `${field}.${key}`);
    }
    if (Array.isArray(value)) value.forEach((item, index) => scan(item, `${field}[${index}]`));
  };
  scan(root, 'root');
  const active = (field: GateSField): unknown => unresolved.includes(field) ? undefined : values[field];
  const hostname = active('PUBLIC_HOSTNAME');
  if (hostname !== undefined && (typeof hostname !== 'string' || reservedHost(hostname)))
    add('PUBLIC_HOSTNAME', 'PUBLIC_HOSTNAME_INVALID_OR_EXAMPLE');
  const origin = active('HTTPS_ORIGIN') === undefined ? null : parseUrl(active('HTTPS_ORIGIN'), ['https:'], true);
  if (active('HTTPS_ORIGIN') !== undefined && (!origin || reservedHost(origin.hostname))) add('HTTPS_ORIGIN', 'PUBLIC_HTTPS_ORIGIN_INVALID');
  if (origin && typeof hostname === 'string' && origin.hostname !== hostname) add('HTTPS_ORIGIN', 'PUBLIC_HOSTNAME_MISMATCH');
  const hcp = active('HCP_WSS_ENDPOINT') === undefined ? null : parseUrl(active('HCP_WSS_ENDPOINT'), ['wss:']);
  if (active('HCP_WSS_ENDPOINT') !== undefined && (!hcp || reservedHost(hcp.hostname))) add('HCP_WSS_ENDPOINT', 'HCP_WSS_ENDPOINT_INVALID');
  if (hcp && hcp.pathname !== '/hcp/v1/connect') add('HCP_WSS_ENDPOINT', 'HCP_PATH_INVALID');
  if (hcp && origin && hcp.host !== origin.host) add('HCP_WSS_ENDPOINT', 'HCP_HTTPS_HOST_MISMATCH');
  const issuer = active('OIDC_ISSUER') === undefined ? null : parseUrl(active('OIDC_ISSUER'), ['https:']);
  if (active('OIDC_ISSUER') !== undefined && (!issuer || reservedHost(issuer.hostname))) add('OIDC_ISSUER', 'OIDC_ISSUER_INVALID');
  const callback = active('OIDC_CALLBACK_URL') === undefined ? null : parseUrl(active('OIDC_CALLBACK_URL'), ['https:']);
  if (active('OIDC_CALLBACK_URL') !== undefined && (!callback || reservedHost(callback.hostname) || callback.pathname !== '/auth/oidc/callback')) add('OIDC_CALLBACK_URL', 'OIDC_CALLBACK_INVALID');
  if (callback && origin && callback.origin !== origin.origin) add('OIDC_CALLBACK_URL', 'OIDC_CALLBACK_ORIGIN_MISMATCH');
  if (active('OIDC_CLIENT_TYPE') !== undefined && !['PUBLIC', 'CONFIDENTIAL'].includes(String(active('OIDC_CLIENT_TYPE')))) add('OIDC_CLIENT_TYPE', 'OIDC_CLIENT_TYPE_INVALID');
  if (active('OIDC_CLIENT_ID') !== undefined && !/^[^\s]{1,256}$/.test(String(active('OIDC_CLIENT_ID')))) add('OIDC_CLIENT_ID', 'OIDC_CLIENT_ID_INVALID');
  const custody = active('OIDC_SECRET_CUSTODY_REFERENCE_OR_POLICY');
  if (custody !== undefined && (typeof custody !== 'string' || !/^(?:policy|vault|document):\/\/[A-Za-z0-9/_.:-]+$/.test(custody))) add('OIDC_SECRET_CUSTODY_REFERENCE_OR_POLICY', 'CUSTODY_REFERENCE_REQUIRED');
  const cors = active('CORS_ORIGINS');
  if (cors !== undefined) {
    if (!Array.isArray(cors) || cors.length === 0 || cors.some(item => typeof item !== 'string' || item === '*' || !parseUrl(item, ['https:'], true))) add('CORS_ORIGINS', 'EXACT_HTTPS_CORS_ORIGINS_REQUIRED');
    else if (origin && (cors.length !== 1 || cors[0] !== origin.origin)) add('CORS_ORIGINS', 'PUBLIC_ORIGIN_NOT_ALLOWED');
  }
  for (const field of ['HUB_DATA_PATH', 'HUB_LOG_PATH'] as const) {
    const value = active(field);
    if (value !== undefined && (typeof value !== 'string' || !(/^(?:[A-Za-z]:\\|\/)/.test(value)))) add(field, 'ABSOLUTE_PATH_REQUIRED');
  }
  const category: PreflightCategory = findings.length ? 'INVALID_CONFIGURATION'
    : unresolved.length ? 'UNRESOLVED_OWNER_INPUT' : 'READY_FOR_EXTERNAL_INFRA_VALIDATION';
  return { schemaVersion: 2, category, admitted: false, offline: true, unresolved, findings };
}
