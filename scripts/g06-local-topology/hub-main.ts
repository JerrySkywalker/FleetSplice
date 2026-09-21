/**
 * Hub process entry for G06 local multi-process topology.
 * Speaks JSON lines on stdout: {"ready":true,"port":N,"origin":"...","connectionId":"..."}
 */
import { writeFileSync } from 'node:fs';
import { startHubTopologyProcess, makeTopologyTarget } from '../../packages/local-topology/hub.ts';

const statePath = process.env.FLEETSPLICE_TOPOLOGY_STATE!;
const rpId = process.env.FLEETSPLICE_TOPOLOGY_RP_ID ?? 'localhost';
const connectionId = process.env.FLEETSPLICE_TOPOLOGY_CONNECTION_ID!;

const target = makeTopologyTarget(connectionId);
const hub = await startHubTopologyProcess({ rpId, target });

writeFileSync(statePath, JSON.stringify({
  role: 'hub',
  port: hub.port,
  origin: hub.origin,
  connectionId,
  target,
  rpId,
  certPem: hub.tls.certPem,
  keyPem: hub.tls.keyPem,
  material: hub.material,
  identity: hub.identity,
}, null, 2));

process.stdout.write(JSON.stringify({
  ready: true,
  port: hub.port,
  origin: hub.origin,
  connectionId,
}) + '\n');

const shutdown = async () => {
  await hub.close();
  process.exit(0);
};
process.on('SIGTERM', () => { void shutdown(); });
process.on('SIGINT', () => { void shutdown(); });
