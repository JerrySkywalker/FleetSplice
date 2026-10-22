import type { ReactNode } from 'react';
import { Button } from '../../packages/ui/components/button.tsx';
import { translate, type Locale } from './i18n.ts';

export type AuthStatus = { mode: 'OIDC' | 'LOOPBACK_BOOTSTRAP'; authenticated: boolean; principalId?: string; expiresAt?: number };
export function AuthGate({ locale, status, checking, error, reason, preferences, retry }: {
  locale: Locale; status: AuthStatus | null; checking: boolean; error: string | null; reason?: 'expired' | 'signed_out' | null; preferences: ReactNode; retry: () => void;
}) {
  const t = (key: Parameters<typeof translate>[1]) => translate(locale, key);
  return <main className="auth-gate" data-testid="auth-gate">
    <header><strong>FleetSplice</strong>{preferences}</header>
    <section><h1>{t(checking ? 'authChecking' : 'authWelcome')}</h1>
      <p>{t(status?.mode === 'LOOPBACK_BOOTSTRAP' ? 'authLoopback' : 'authDescription')}</p>
      {reason && <p role="status">{t(reason === 'expired' ? 'authExpired' : 'authSignedOut')}</p>}
      {error && <p role="alert">{t(error === 'GATEWAY_UNREACHABLE' ? 'gatewayUnreachable' : 'authUnavailable')} <code>{error}</code></p>}
      {!checking && status?.mode === 'OIDC' && <a className="auth-login" href="/auth/login">{t('authSignIn')}</a>}
      <Button variant="outline" disabled={checking} onClick={retry}>{t('authCheckAgain')}</Button>
    </section>
  </main>;
}
