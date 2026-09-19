/**
 * Product-equivalent native-live acceptance preflight.
 * Authority: packages/native-adoption/discovery.ts#discoverDaemon — no guessed sockets.
 */
import { Fault } from '../packages/contracts/json.ts';
import { discoverDaemon } from '../packages/native-adoption/discovery.ts';
import type { NativeArtifactIdentity } from '../packages/native-adoption/types.ts';

export const DISCOVERY_AUTHORITY = 'packages/native-adoption/discovery.ts#discoverDaemon';

/** Bounded harness stop: full disposable real-daemon + Playwright lifecycle is not yet bound. */
export const HARNESS_NOT_YET_BOUND_REASON =
  'official_structured_disposable_thread_create_via_accept_native_live_not_yet_bound_without_broadening_native_demo_product_entry';

export type DaemonIdentityEvidence = {
  processId: number;
  processCreationTime: string;
  executablePath: string | null;
  reportedVersion: string | null;
  endpoint: string;
  endpointIdentity: string;
};

export type NativeLivePreflightResult = {
  status: 'DEFERRED' | 'PASS' | 'FAIL';
  realDaemonPrecheck: string;
  realDaemonHarness: string | null;
  daemon: DaemonIdentityEvidence | null;
  discoveryAuthority: typeof DISCOVERY_AUTHORITY;
  reason: string;
  exitCode: 0 | 1;
};

export function productDiscoveryErrorCode(error: unknown): string {
  if (error instanceof Fault) return error.code;
  if (error instanceof Error && error.message.trim()) return error.message.trim();
  return 'UNEXPECTED_DISCOVERY_FAILURE';
}

export function identityEvidence(identity: NativeArtifactIdentity): DaemonIdentityEvidence {
  return {
    processId: identity.processId,
    processCreationTime: identity.processCreationTime,
    executablePath: identity.executablePath,
    reportedVersion: identity.reportedVersion,
    endpoint: identity.endpoint,
    endpointIdentity: identity.endpointIdentity,
  };
}

export function classifyNativeLiveDiscovery(
  outcome:
    | { ok: true; identity: NativeArtifactIdentity }
    | { ok: false; error: string; unexpected?: boolean },
): NativeLivePreflightResult {
  if (!outcome.ok) {
    if (outcome.unexpected) {
      return {
        status: 'FAIL',
        realDaemonPrecheck: outcome.error,
        realDaemonHarness: null,
        daemon: null,
        discoveryAuthority: DISCOVERY_AUTHORITY,
        reason: `REAL_DAEMON_PRECHECK=${outcome.error}`,
        exitCode: 1,
      };
    }
    return {
      status: 'DEFERRED',
      realDaemonPrecheck: outcome.error,
      realDaemonHarness: null,
      daemon: null,
      discoveryAuthority: DISCOVERY_AUTHORITY,
      reason: `STATUS=DEFERRED; REAL_DAEMON_PRECHECK=${outcome.error}`,
      exitCode: 0,
    };
  }

  const daemon = identityEvidence(outcome.identity);
  if (
    !Number.isSafeInteger(daemon.processId)
    || daemon.processId <= 0
    || !daemon.processCreationTime
    || !daemon.endpoint
    || !daemon.endpointIdentity
  ) {
    return {
      status: 'FAIL',
      realDaemonPrecheck: 'CONTRADICTORY_DAEMON_IDENTITY',
      realDaemonHarness: null,
      daemon,
      discoveryAuthority: DISCOVERY_AUTHORITY,
      reason: 'REAL_DAEMON_PRECHECK=CONTRADICTORY_DAEMON_IDENTITY',
      exitCode: 1,
    };
  }

  const harness = `DEFERRED_WITH_REASON=${HARNESS_NOT_YET_BOUND_REASON}`;
  return {
    status: 'DEFERRED',
    realDaemonPrecheck: 'PASS',
    realDaemonHarness: harness,
    daemon,
    discoveryAuthority: DISCOVERY_AUTHORITY,
    reason: `STATUS=DEFERRED; REAL_DAEMON_PRECHECK=PASS; REAL_DAEMON_HARNESS=${harness}`,
    exitCode: 0,
  };
}

export function runNativeLivePreflight(
  discover: () => NativeArtifactIdentity = discoverDaemon,
): NativeLivePreflightResult {
  try {
    return classifyNativeLiveDiscovery({ ok: true, identity: discover() });
  } catch (error) {
    const code = productDiscoveryErrorCode(error);
    const unexpected = code === 'UNEXPECTED_DISCOVERY_FAILURE';
    return classifyNativeLiveDiscovery({ ok: false, error: code, unexpected });
  }
}

export function toResultJson(result: NativeLivePreflightResult, finishedAt = new Date().toISOString()) {
  return {
    status: result.status,
    realDaemonPrecheck: result.realDaemonPrecheck,
    realDaemonHarness: result.realDaemonHarness,
    daemon: result.daemon,
    discoveryAuthority: result.discoveryAuthority,
    reason: result.reason,
    constraints: [
      'product-equivalent discoverDaemon only',
      'never update/install/restart Owner Codex',
      'never mutate CODEX_HOME or Owner Codex files',
      'disposable Workspace only when harness is bound',
      'official structured app-server interfaces only',
      'no Windows Terminal/ConPTY/TUI keystroke automation',
      'leave daemon running',
    ],
    finishedAt,
  };
}
