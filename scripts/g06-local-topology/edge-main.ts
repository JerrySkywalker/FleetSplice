/**
 * Edge process entry for G06 local multi-process topology.
 * Outbound WSS only — no inbound Fleet listener.
 */
import { readFileSync } from 'node:fs';
import { issueEnrollmentChallenge, verifyEnrollmentProof, signEnrollmentChallenge } from '../../packages/remote-enrollment/index.ts';
import { startEdgeTopologyProcess } from '../../packages/local-topology/edge.ts';
import type { Target } from '../../packages/contracts/index.ts';
import type { EphemeralTlsMaterial } from '../../packages/remote-transport/index.ts';

const statePath = process.env.FLEETSPLICE_TOPOLOGY_STATE!;
const state = JSON.parse(readFileSync(statePath, 'utf8')) as {
  port: number;
  connectionId: string;
  target: Target;
  certPem: string;
  keyPem: string;
  material: any;
  identity: any;
};

const target = state.target;

const tls: EphemeralTlsMaterial = {
  hostname: 'localhost',
  certPem: state.certPem,
  keyPem: state.keyPem,
};

const challenge = issueEnrollmentChallenge(state.identity);
const proof = signEnrollmentChallenge(state.material, challenge);
verifyEnrollmentProof(challenge, proof);

const edge = await startEdgeTopologyProcess({
  port: state.port,
  tls,
  target,
  material: state.material,
  challenge,
});

process.stdout.write(JSON.stringify({
  ready: true,
  role: 'edge',
  inboundFleetListener: false,
  enrolled: true,
}) + '\n');

const shutdown = async () => {
  await edge.close();
  process.exit(0);
};
process.on('SIGTERM', () => { void shutdown(); });
process.on('SIGINT', () => { void shutdown(); });
