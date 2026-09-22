import { randomUUID } from 'node:crypto';
import { Fault, requireThat } from '../contracts/index.ts';
import { fingerprintSpkiPem, HostEnrollmentRegistry, issueEnrollmentChallenge, verifyEnrollmentProof, type EnrollmentChallenge, type EnrollmentProof, type HostEnrollmentIdentity } from '../remote-enrollment/index.ts';

export type DeviceEnrollmentRequest = { requestId: string; hostName: string; requestedAt: number; identity: HostEnrollmentIdentity; state: 'PENDING' | 'APPROVED' | 'REVOKED' };
export type DeviceProjection = { requestId: string; hostName: string; hostId: string; publicFingerprint: string; enrollmentGeneration: string; state: 'PENDING' | 'APPROVED' | 'REVOKED'; requestedAt: number; lastSeen: string | null; runtimeSharing: 'UNKNOWN' };
export type DurableDeviceEnrollmentState = { v: 1; records: DeviceEnrollmentRequest[] };

const label = (value: unknown) => typeof value === 'string' && value.trim().length > 0 && value.trim().length <= 80 && !/[\u0000-\u001f\u007f]/.test(value);
const identity = (value: unknown): HostEnrollmentIdentity => {
  requireThat(!!value && typeof value === 'object' && !Array.isArray(value), 'DEVICE_ENROLLMENT_INVALID'); const item = value as Record<string, unknown>;
  requireThat(Object.keys(item).sort().join(',') === 'enrollmentGeneration,environmentId,fleetId,hostId,publicFingerprint,publicKeySpkiPem' &&
    [item.fleetId, item.hostId, item.environmentId, item.enrollmentGeneration, item.publicKeySpkiPem, item.publicFingerprint].every(value => typeof value === 'string' && value.length > 0) &&
    /^[0-9a-f]{64}$/.test(String(item.publicFingerprint)) && fingerprintSpkiPem(String(item.publicKeySpkiPem)) === item.publicFingerprint, 'DEVICE_ENROLLMENT_INVALID');
  try { requireThat(BigInt(String(item.enrollmentGeneration)) > 0n, 'DEVICE_ENROLLMENT_INVALID'); } catch (error) { if (error instanceof Fault) throw error; throw new Fault('DEVICE_ENROLLMENT_INVALID'); }
  return structuredClone(item as unknown as HostEnrollmentIdentity);
};

/** Gateway-side approval queue. It never receives a device private key or a human token. */
export class DeviceEnrollmentService {
  private readonly records = new Map<string, DeviceEnrollmentRequest>();
  private readonly enrollment = new HostEnrollmentRegistry();
  private readonly challenges = new Map<string, EnrollmentChallenge>();
  private readonly connected = new Set<string>();

  constructor(state?: DurableDeviceEnrollmentState) {
    if (!state) return;
    requireThat(state.v === 1 && Array.isArray(state.records), 'DURABLE_IDENTITY_STORE_INVALID');
    for (const record of state.records) {
      requireThat(typeof record.requestId === 'string' && /^[0-9a-f-]{36}$/.test(record.requestId) && label(record.hostName) && Number.isInteger(record.requestedAt) && ['PENDING', 'APPROVED', 'REVOKED'].includes(record.state), 'DURABLE_IDENTITY_STORE_INVALID');
      const enrolled = identity(record.identity); this.records.set(record.requestId, { requestId: record.requestId, hostName: record.hostName, requestedAt: record.requestedAt, identity: enrolled, state: record.state });
    }
    for (const record of this.records.values()) if (record.state === 'APPROVED') this.enrollment.enroll(record.identity);
    for (const record of this.records.values()) if (record.state === 'REVOKED') this.enrollment.revoke(record.identity);
  }

  durableState(): DurableDeviceEnrollmentState { return { v: 1, records: [...this.records.values()].map(value => structuredClone(value)) }; }
  request(value: unknown, now = Date.now()): DeviceEnrollmentRequest {
    requireThat(!!value && typeof value === 'object' && !Array.isArray(value), 'DEVICE_ENROLLMENT_INVALID'); const item = value as Record<string, unknown>;
    requireThat(Object.keys(item).sort().join(',') === 'hostName,identity' && label(item.hostName), 'DEVICE_ENROLLMENT_INVALID');
    const requested = { requestId: randomUUID(), hostName: String(item.hostName).trim(), requestedAt: now, identity: identity(item.identity), state: 'PENDING' as const };
    this.records.set(requested.requestId, requested); return structuredClone(requested);
  }
  approve(requestId: string): DeviceEnrollmentRequest {
    const value = this.records.get(requestId); requireThat(value?.state === 'PENDING', 'DEVICE_ENROLLMENT_REQUEST_UNKNOWN');
    this.enrollment.enroll(value.identity); value.state = 'APPROVED'; return structuredClone(value);
  }
  revoke(requestId: string): DeviceEnrollmentRequest {
    const value = this.records.get(requestId); requireThat(value?.state === 'APPROVED', 'DEVICE_ENROLLMENT_REQUEST_UNKNOWN');
    this.enrollment.revoke(value.identity); this.connected.delete(value.identity.hostId); value.state = 'REVOKED'; return structuredClone(value);
  }
  status(requestId: string): DeviceEnrollmentRequest {
    const value = this.records.get(requestId); requireThat(!!value, 'DEVICE_ENROLLMENT_NOT_FOUND'); return structuredClone(value);
  }
  issueChallenge(hostId: string, now = Date.now()): EnrollmentChallenge {
    const device = [...this.records.values()].find(value => value.identity.hostId === hostId); requireThat(device, 'HOST_NOT_ENROLLED');
    this.enrollment.requireActive(device.identity); const challenge = issueEnrollmentChallenge(device.identity, now); this.challenges.set(challenge.challengeId, challenge); return structuredClone(challenge);
  }
  admitProof(hostId: string, proof: EnrollmentProof, now = Date.now()) {
    const challenge = this.challenges.get(proof.challengeId); requireThat(challenge && challenge.expected.hostId === hostId, 'ENROLLMENT_CHALLENGE_MISMATCH');
    this.challenges.delete(proof.challengeId); this.enrollment.requireActive(challenge.expected); verifyEnrollmentProof(challenge, proof, now); this.connected.add(hostId);
  }
  disconnect(hostId: string) { this.connected.delete(hostId); }
  projections(): DeviceProjection[] { return [...this.records.values()].map(value => ({ requestId: value.requestId, hostName: value.hostName, hostId: value.identity.hostId, publicFingerprint: value.identity.publicFingerprint, enrollmentGeneration: value.identity.enrollmentGeneration, state: value.state, requestedAt: value.requestedAt, lastSeen: this.connected.has(value.identity.hostId) ? 'CONNECTED_NOW' : null, runtimeSharing: 'UNKNOWN' })); }
}
