/**
 * Historical v1 local predeploy placeholders for G06. The active Gate S
 * admission draft is v2 in admission-v2.ts. Values here remain unresolved;
 * the Owner supplies production admission separately. Never invent fake
 * production hostnames, origins, TLS material, or custody answers.
 */
export const PRODUCTION_PLACEHOLDERS = [
  'PUBLIC_HOSTNAME',
  'HTTPS_ORIGIN',
  'RP_ID',
  'TLS_INGRESS',
  'HUB_OS_PRINCIPAL',
  'HUB_DATA_PATH',
  'RESOURCE_BUDGET',
  'PRODUCTION_HOST_KEY_CUSTODY',
] as const;

export type ProductionPlaceholder = (typeof PRODUCTION_PLACEHOLDERS)[number];

export const UNRESOLVED = 'UNRESOLVED' as const;

export type ProductionAdmissionDraft = Record<ProductionPlaceholder, typeof UNRESOLVED>;

export function createUnresolvedAdmissionDraft(): ProductionAdmissionDraft {
  return Object.fromEntries(
    PRODUCTION_PLACEHOLDERS.map(key => [key, UNRESOLVED]),
  ) as ProductionAdmissionDraft;
}

export function assertPlaceholdersUnresolved(draft: ProductionAdmissionDraft): void {
  for (const key of PRODUCTION_PLACEHOLDERS) {
    if (draft[key] !== UNRESOLVED) {
      throw new Error(`PRODUCTION_PLACEHOLDER_MUST_REMAIN_UNRESOLVED:${key}`);
    }
  }
}
