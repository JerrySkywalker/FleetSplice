/**
 * Ingress contract / template only.
 * Does not modify NginxUI or any production ingress.
 * Production host/TLS values stay UNRESOLVED placeholders. Active Gate S
 * inputs are the v2 admission draft validated offline before external audit.
 */

export type IngressContractTemplate = {
  kind: 'G06_INGRESS_CONTRACT_TEMPLATE';
  https: {
    exactHostPlaceholder: 'PUBLIC_HOSTNAME';
    originPlaceholder: 'HTTPS_ORIGIN';
    rejectWildcardHost: true;
  };
  wss: {
    upgradeRequired: true;
    subprotocol: 'fleetsplice-hcp';
    sameExactHostAsHttps: true;
  };
  limits: {
    requestTimeoutMs: number;
    maxBodyBytes: number;
    maxHeaderBytes: number;
  };
  cors: {
    allowWildcard: false;
    exactOriginsFromAdmission: true;
  };
  securityHeaders: Record<string, string>;
  productionPlaceholdersUnresolved: true;
  nginxUiMutationAuthorized: false;
};

export function createIngressContractTemplate(): IngressContractTemplate {
  return {
    kind: 'G06_INGRESS_CONTRACT_TEMPLATE',
    https: {
      exactHostPlaceholder: 'PUBLIC_HOSTNAME',
      originPlaceholder: 'HTTPS_ORIGIN',
      rejectWildcardHost: true,
    },
    wss: {
      upgradeRequired: true,
      subprotocol: 'fleetsplice-hcp',
      sameExactHostAsHttps: true,
    },
    limits: {
      requestTimeoutMs: 30_000,
      maxBodyBytes: 262_144,
      maxHeaderBytes: 16_384,
    },
    cors: {
      allowWildcard: false,
      exactOriginsFromAdmission: true,
    },
    securityHeaders: {
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'no-referrer',
      'X-Frame-Options': 'DENY',
      'Content-Security-Policy': "default-src 'self'; frame-ancestors 'none'; base-uri 'self'",
    },
    productionPlaceholdersUnresolved: true,
    nginxUiMutationAuthorized: false,
  };
}
