import { Fault, requireThat } from '../contracts/index.ts';

export type DeploymentProfileKind = 'LOOPBACK' | 'LAN' | 'PUBLIC_HTTPS' | 'PRIVATE_OVERLAY';
export type DeploymentProfileInput = {
  kind: DeploymentProfileKind;
  publicBaseUrl: string;
  apiBaseUrl?: string;
  realtimeUrl?: string;
  hcpUrl?: string;
  loginUrl?: string;
  enrollmentUrl?: string;
};
export type DeploymentDiscovery = {
  version: 1;
  profile: DeploymentProfileKind;
  apiBaseUrl: string;
  realtimeUrl: string;
  hcpUrl: string;
  loginUrl: string;
  enrollment: { supported: true; url: string; keyType: 'Ed25519' };
};
export type ResolvedDeploymentProfile = DeploymentProfileInput & { baseUrl: string; discovery: DeploymentDiscovery };

const noCredentials = (url: URL) => !url.username && !url.password;
const loopbackHost = (host: string) => host === 'localhost' || host === '127.0.0.1' || host === '[::1]';
const parse = (value: string, code: string) => {
  try { const url = new URL(value); requireThat(noCredentials(url) && !url.hash && !url.search, code); return url; }
  catch (error) { if (error instanceof Fault) throw error; throw new Fault(code); }
};
const publicUrl = (value: string, kind: DeploymentProfileKind, code: string) => {
  const url = parse(value, code);
  const loopback = kind === 'LOOPBACK';
  requireThat(loopback ? url.protocol === 'http:' && loopbackHost(url.hostname) : url.protocol === 'https:', code);
  requireThat(url.pathname === '/' || url.pathname === '', code);
  return url;
};
const endpoint = (value: string | undefined, fallback: URL, protocol: 'http:' | 'https:' | 'ws:' | 'wss:', kind: DeploymentProfileKind, code: string) => {
  const url = value ? parse(value, code) : fallback;
  const expected = kind === 'LOOPBACK' ? (protocol === 'wss:' ? 'ws:' : 'http:') : protocol;
  requireThat(url.protocol === expected && (kind !== 'LOOPBACK' || loopbackHost(url.hostname)), code);
  return url.toString();
};

export function resolveDeploymentProfile(input: DeploymentProfileInput): ResolvedDeploymentProfile {
  const base = publicUrl(input.publicBaseUrl, input.kind, 'DEPLOYMENT_BASE_URL_INVALID');
  const http = input.kind === 'LOOPBACK' ? 'http:' : 'https:';
  const ws = input.kind === 'LOOPBACK' ? 'ws:' : 'wss:';
  const at = (pathname: string, protocol = http) => new URL(pathname, `${protocol}//${base.host}`);
  const apiBaseUrl = endpoint(input.apiBaseUrl, at('/api/'), 'https:', input.kind, 'DEPLOYMENT_API_URL_INVALID');
  const realtimeUrl = endpoint(input.realtimeUrl, at('/api/events', http), 'https:', input.kind, 'DEPLOYMENT_REALTIME_URL_INVALID');
  const hcpUrl = endpoint(input.hcpUrl, at('/hcp/v1/connect', ws), 'wss:', input.kind, 'DEPLOYMENT_HCP_URL_INVALID');
  const loginUrl = endpoint(input.loginUrl, at('/auth/login', http), 'https:', input.kind, 'DEPLOYMENT_LOGIN_URL_INVALID');
  const enrollmentUrl = endpoint(input.enrollmentUrl, at('/api/devices/enroll', http), 'https:', input.kind, 'DEPLOYMENT_ENROLLMENT_URL_INVALID');
  return { ...input, baseUrl: `${base.protocol}//${base.host}`, discovery: { version: 1, profile: input.kind, apiBaseUrl, realtimeUrl, hcpUrl, loginUrl, enrollment: { supported: true, url: enrollmentUrl, keyType: 'Ed25519' } } };
}
