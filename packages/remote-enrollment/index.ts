import { createPrivateKey, createPublicKey, generateKeyPairSync, randomBytes, sign, verify, createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { Fault, requireThat } from '../contracts/json.ts';

export type HostEnrollmentIdentity = {
  fleetId: string;
  hostId: string;
  environmentId: string;
  enrollmentGeneration: string;
  publicKeySpkiPem: string;
  publicFingerprint: string;
};

export type HostEnrollmentPrivateMaterial = HostEnrollmentIdentity & {
  privateKeyPkcs8Pem: string;
};

export type EnrollmentChallenge = {
  challengeId: string;
  nonce: string;
  issuedAt: number;
  expiresAt: number;
  expected: HostEnrollmentIdentity;
};

export type EnrollmentProof = {
  challengeId: string;
  signatureDerBase64: string;
};

export type DpapiCustodyAdapter = {
  protect(plaintext: Buffer): Buffer;
  unprotect(blob: Buffer): Buffer;
};

/** Test/local custody only. Production Windows DPAPI must be a later adapter. */
export const ephemeralFileCustody: DpapiCustodyAdapter = {
  protect: plaintext => Buffer.from(plaintext),
  unprotect: blob => Buffer.from(blob),
};

const dpapi = (operation: 'Protect' | 'Unprotect', value: Buffer): Buffer => {
  requireThat(process.platform === 'win32', 'WINDOWS_DPAPI_UNAVAILABLE');
  const script = `$ErrorActionPreference='Stop';Add-Type -AssemblyName System.Security;$b=[Convert]::FromBase64String([Console]::In.ReadToEnd().Trim());$r=[System.Security.Cryptography.ProtectedData]::${operation}($b,$null,[System.Security.Cryptography.DataProtectionScope]::CurrentUser);[Console]::Out.Write([Convert]::ToBase64String($r))`;
  try {
    const output = execFileSync('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', script], { input: value.toString('base64'), encoding: 'utf8', windowsHide: true, stdio: ['pipe', 'pipe', 'ignore'] }).trim();
    return Buffer.from(output, 'base64');
  } catch { throw new Fault('WINDOWS_DPAPI_CUSTODY_FAILED'); }
};

/** Windows CurrentUser DPAPI; plaintext enters PowerShell only through stdin. */
export const windowsCurrentUserDpapiCustody: DpapiCustodyAdapter = { protect: value => dpapi('Protect', value), unprotect: value => dpapi('Unprotect', value) };

export function fingerprintSpkiPem(publicKeySpkiPem: string): string {
  return createHash('sha256').update(publicKeySpkiPem).digest('hex');
}

export function generateHostEnrollmentKey(input: {
  fleetId: string;
  hostId: string;
  environmentId: string;
  enrollmentGeneration: string;
}): HostEnrollmentPrivateMaterial {
  const { privateKey, publicKey } = generateKeyPairSync('ed25519');
  const privateKeyPkcs8Pem = privateKey.export({ type: 'pkcs8', format: 'pem' }).toString();
  const publicKeySpkiPem = publicKey.export({ type: 'spki', format: 'pem' }).toString();
  return {
    ...input,
    privateKeyPkcs8Pem,
    publicKeySpkiPem,
    publicFingerprint: fingerprintSpkiPem(publicKeySpkiPem),
  };
}

export function issueEnrollmentChallenge(expected: HostEnrollmentIdentity, now = Date.now(), ttlMs = 60_000): EnrollmentChallenge {
  return {
    challengeId: randomBytes(16).toString('hex'),
    nonce: randomBytes(32).toString('base64url'),
    issuedAt: now,
    expiresAt: now + ttlMs,
    expected: structuredClone(expected),
  };
}

function challengeBytes(challenge: EnrollmentChallenge): Buffer {
  return Buffer.from(JSON.stringify({
    challengeId: challenge.challengeId,
    nonce: challenge.nonce,
    fleetId: challenge.expected.fleetId,
    hostId: challenge.expected.hostId,
    environmentId: challenge.expected.environmentId,
    enrollmentGeneration: challenge.expected.enrollmentGeneration,
    publicFingerprint: challenge.expected.publicFingerprint,
    expiresAt: challenge.expiresAt,
  }), 'utf8');
}

export function signEnrollmentChallenge(material: HostEnrollmentPrivateMaterial, challenge: EnrollmentChallenge): EnrollmentProof {
  requireThat(material.publicFingerprint === challenge.expected.publicFingerprint, 'ENROLLMENT_IDENTITY_MISMATCH');
  requireThat(material.enrollmentGeneration === challenge.expected.enrollmentGeneration, 'STALE_ENROLLMENT_GENERATION');
  const key = createPrivateKey(material.privateKeyPkcs8Pem);
  const signature = sign(null, challengeBytes(challenge), key);
  return { challengeId: challenge.challengeId, signatureDerBase64: signature.toString('base64') };
}

export function verifyEnrollmentProof(challenge: EnrollmentChallenge, proof: EnrollmentProof, now = Date.now()): void {
  requireThat(proof.challengeId === challenge.challengeId, 'ENROLLMENT_CHALLENGE_MISMATCH');
  requireThat(now <= challenge.expiresAt, 'ENROLLMENT_CHALLENGE_EXPIRED');
  const key = createPublicKey(challenge.expected.publicKeySpkiPem);
  const ok = verify(null, challengeBytes(challenge), key, Buffer.from(proof.signatureDerBase64, 'base64'));
  requireThat(ok, 'ENROLLMENT_SIGNATURE_INVALID');
}

export class HostEnrollmentRegistry {
  private readonly active = new Map<string, HostEnrollmentIdentity>();
  private readonly revoked = new Set<string>();

  enroll(identity: HostEnrollmentIdentity) {
    const key = this.keyOf(identity);
    requireThat(!this.revoked.has(key), 'ENROLLMENT_REVOKED');
    const prior = this.active.get(identity.hostId);
    if (prior) {
      requireThat(BigInt(identity.enrollmentGeneration) >= BigInt(prior.enrollmentGeneration), 'STALE_ENROLLMENT_GENERATION');
      if (BigInt(identity.enrollmentGeneration) > BigInt(prior.enrollmentGeneration)) {
        this.revoked.add(this.keyOf(prior));
      }
    }
    this.active.set(identity.hostId, structuredClone(identity));
  }

  revoke(identity: HostEnrollmentIdentity) {
    this.active.delete(identity.hostId);
    this.revoked.add(this.keyOf(identity));
  }

  requireActive(identity: HostEnrollmentIdentity) {
    const key = this.keyOf(identity);
    requireThat(!this.revoked.has(key), 'ENROLLMENT_REVOKED');
    const active = this.active.get(identity.hostId);
    requireThat(active, 'HOST_NOT_ENROLLED');
    requireThat(active.enrollmentGeneration === identity.enrollmentGeneration, 'STALE_ENROLLMENT_GENERATION');
    requireThat(active.publicFingerprint === identity.publicFingerprint, 'ENROLLMENT_IDENTITY_MISMATCH');
  }

  disconnect(hostId: string) { this.active.delete(hostId); }

  private keyOf(identity: Pick<HostEnrollmentIdentity, 'hostId' | 'enrollmentGeneration' | 'publicFingerprint'>) {
    return `${identity.hostId}:${identity.enrollmentGeneration}:${identity.publicFingerprint}`;
  }
}
