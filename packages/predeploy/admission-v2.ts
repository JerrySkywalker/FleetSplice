/** Gate S admission draft. This is data for offline review, never a secret store. */
export const GATE_S_ADMISSION_VERSION = 2 as const;
export const GATE_S_FIELDS = [
  'PUBLIC_HOSTNAME', 'HTTPS_ORIGIN', 'HCP_WSS_ENDPOINT', 'TLS_INGRESS',
  'OIDC_ISSUER', 'OIDC_CLIENT_ID', 'OIDC_CALLBACK_URL', 'OIDC_CLIENT_TYPE',
  'OIDC_SECRET_CUSTODY_REFERENCE_OR_POLICY', 'HUB_SERVICE_PRINCIPAL',
  'HUB_DATA_PATH', 'HUB_LOG_PATH', 'RESOURCE_LIMITS', 'ENROLLMENT_OPERATOR',
  'REVOCATION_OPERATOR', 'BACKUP_POLICY', 'RESTORE_POLICY',
  'MONITORING_POLICY', 'INCIDENT_OWNER', 'ROLLBACK_OWNER', 'CORS_ORIGINS',
] as const;

export type GateSField = (typeof GATE_S_FIELDS)[number];
export const GATE_S_OWNER_DECISIONS = {
  HUMAN_AUTH_CONTRACT: 'GENERIC_OIDC',
  FIRST_LIVE_EDGE: 'SKYFORGE-01',
} as const;
export type GateSAdmissionDraftV2 = {
  schemaVersion: typeof GATE_S_ADMISSION_VERSION;
  decisions: typeof GATE_S_OWNER_DECISIONS;
  values: Record<GateSField, string | string[]>;
};

export function createGateSAdmissionDraftV2(): GateSAdmissionDraftV2 {
  return {
    schemaVersion: GATE_S_ADMISSION_VERSION,
    decisions: { ...GATE_S_OWNER_DECISIONS },
    values: Object.fromEntries(GATE_S_FIELDS.map(field => [field, 'UNRESOLVED'])) as GateSAdmissionDraftV2['values'],
  };
}
