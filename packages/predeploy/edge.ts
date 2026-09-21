import { Fault, requireThat } from '../contracts/json.ts';
import { generateHostEnrollmentKey, type HostEnrollmentPrivateMaterial } from '../remote-enrollment/index.ts';

export type EdgeRemoteEndpointConfig = {
  /** Must be wss:// with exact hostname; no wildcard. */
  hubWssUrl: string;
  expectedHostname: string;
  fleetId: string;
  hostId: string;
  environmentId: string;
  enrollmentGeneration: string;
};

export type EdgeDoctorReport = {
  command: 'doctor';
  endpointValid: boolean;
  inboundFleetListener: false;
  tlsIdentity: {
    expectedHostname: string;
    enrollmentFingerprint: string | null;
    status: 'present' | 'missing';
  };
  findings: string[];
};

export type EdgeCommand =
  | 'enroll'
  | 'status'
  | 'doctor'
  | 'disconnect'
  | 're-enroll'
  | 'revoke';

export class EdgePredeployController {
  private material: HostEnrollmentPrivateMaterial | null = null;
  private enrolled = false;
  private connected = false;
  private revoked = false;

  constructor(private readonly endpoint: EdgeRemoteEndpointConfig) {
    validateEdgeRemoteEndpoint(endpoint);
  }

  /** Edge never opens an inbound Fleet listener for phone/Internet. */
  inboundFleetListenerAllowed(): false {
    return false;
  }

  run(command: EdgeCommand): Record<string, unknown> {
    switch (command) {
      case 'enroll':
        return this.enroll();
      case 'status':
        return this.status();
      case 'doctor':
        return this.doctor();
      case 'disconnect':
        return this.disconnect();
      case 're-enroll':
        return this.reEnroll();
      case 'revoke':
        return this.revoke();
      default:
        throw new Fault('EDGE_COMMAND_UNKNOWN');
    }
  }

  private enroll() {
    requireThat(!this.revoked, 'EDGE_REVOKED');
    this.material = generateHostEnrollmentKey({
      fleetId: this.endpoint.fleetId,
      hostId: this.endpoint.hostId,
      environmentId: this.endpoint.environmentId,
      enrollmentGeneration: this.endpoint.enrollmentGeneration,
    });
    this.enrolled = true;
    this.connected = true;
    return {
      command: 'enroll',
      enrolled: true,
      publicFingerprint: this.material.publicFingerprint,
      inboundFleetListener: false,
    };
  }

  private status() {
    return {
      command: 'status',
      enrolled: this.enrolled,
      connected: this.connected,
      revoked: this.revoked,
      inboundFleetListener: false,
      expectedHostname: this.endpoint.expectedHostname,
      hubWssUrl: this.endpoint.hubWssUrl,
    };
  }

  private doctor(): EdgeDoctorReport {
    const findings: string[] = [];
    let endpointValid = true;
    try {
      validateEdgeRemoteEndpoint(this.endpoint);
    } catch (error) {
      endpointValid = false;
      findings.push(error instanceof Fault ? error.code : String(error));
    }
    if (!this.enrolled) findings.push('EDGE_NOT_ENROLLED');
    return {
      command: 'doctor',
      endpointValid,
      inboundFleetListener: false,
      tlsIdentity: {
        expectedHostname: this.endpoint.expectedHostname,
        enrollmentFingerprint: this.material?.publicFingerprint ?? null,
        status: this.material ? 'present' : 'missing',
      },
      findings,
    };
  }

  private disconnect() {
    this.connected = false;
    return { command: 'disconnect', connected: false, inboundFleetListener: false };
  }

  private reEnroll() {
    requireThat(!this.revoked, 'EDGE_REVOKED');
    this.connected = false;
    this.enrolled = false;
    this.material = null;
    return this.enroll();
  }

  private revoke() {
    this.revoked = true;
    this.enrolled = false;
    this.connected = false;
    this.material = null;
    return { command: 'revoke', revoked: true, inboundFleetListener: false };
  }
}

export function validateEdgeRemoteEndpoint(config: EdgeRemoteEndpointConfig): void {
  requireThat(config.hubWssUrl.startsWith('wss://'), 'EDGE_HUB_URL_MUST_BE_WSS');
  requireThat(!config.hubWssUrl.includes('*'), 'EDGE_HUB_URL_WILDCARD_FORBIDDEN');
  let url: URL;
  try {
    url = new URL(config.hubWssUrl);
  } catch {
    throw new Fault('EDGE_HUB_URL_INVALID');
  }
  requireThat(url.hostname === config.expectedHostname, 'EDGE_HOSTNAME_MISMATCH');
  requireThat(config.fleetId.length > 0, 'EDGE_FLEET_ID_REQUIRED');
  requireThat(config.hostId.length > 0, 'EDGE_HOST_ID_REQUIRED');
  requireThat(config.environmentId.length > 0, 'EDGE_ENVIRONMENT_ID_REQUIRED');
  requireThat(config.enrollmentGeneration.length > 0, 'EDGE_ENROLLMENT_GENERATION_REQUIRED');
}
