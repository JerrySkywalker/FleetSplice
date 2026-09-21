import { WebSocket } from 'ws';
import { canonical, parseJson, validate, type Hcp, type Target } from '../contracts/index.ts';
import { EdgeNativeAdoptionEndpoint } from '../remote-adoption/index.ts';
import { connectEphemeralHcpWss, type EphemeralTlsMaterial } from '../remote-transport/index.ts';
import {
  signEnrollmentChallenge,
  type HostEnrollmentPrivateMaterial,
  type EnrollmentChallenge,
} from '../remote-enrollment/index.ts';
import { DisposableTopologyAdoption } from './adoption-fixture.ts';

export async function startEdgeTopologyProcess(options: {
  port: number;
  tls: EphemeralTlsMaterial;
  target: Target;
  material: HostEnrollmentPrivateMaterial;
  challenge: EnrollmentChallenge;
}) {
  const proof = signEnrollmentChallenge(options.material, options.challenge);
  const adoption = new DisposableTopologyAdoption();
  const ws = connectEphemeralHcpWss({
    port: options.port,
    tls: options.tls,
    expectedHostname: 'localhost',
    authorization: `Enrollment ${proof.signatureDerBase64}`,
  });
  await new Promise<void>((resolve, reject) => {
    ws.once('open', () => resolve());
    ws.once('error', reject);
  });

  const endpoint = new EdgeNativeAdoptionEndpoint(adoption, options.target, msg => {
    if (ws.readyState !== WebSocket.OPEN) throw new Error('HCP_BACKPRESSURE_OR_DISCONNECTED');
    ws.send(canonical(msg));
  });
  endpoint.startRealtimePush();
  ws.on('message', async data => {
    const message = validate<Hcp>('hcp', parseJson(new TextDecoder('utf-8', { fatal: true }).decode(data as Buffer)));
    if (message.kind === 'adoption.request') await endpoint.accept(message);
  });

  return {
    adoption,
    endpoint,
    ws,
    close: async () => {
      endpoint.stop();
      adoption.markStale();
      ws.close();
    },
  };
}
