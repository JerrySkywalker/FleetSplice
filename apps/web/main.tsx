import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { digest } from '../../packages/contracts/json.ts';
import type { FleetCommand, Intent, Snapshot, CommandRecord, PermissionPreset } from '../../packages/contracts/index.ts';
import { stateText, systemText, translate, type MessageKey, type Locale } from './i18n.ts';
import { browserStorage, persistPreference, readPreferences, resolveTheme, type Appearance } from './preferences.ts';
import { PreferencesControl } from './PreferencesControl.tsx';
import { NativeAdoption } from './NativeAdoption.tsx';
import { BrowserClientSession } from './client-session.ts';
import { SessionConfigBar } from './components/SessionConfigBar.tsx';
import { OwnershipSurface } from './components/Presentation.tsx';
import { GatewayDashboard } from './components/GatewayDashboard.tsx';
import { AppShell } from './components/AppShell.tsx';
import { Button } from '../../packages/ui/components/button.tsx';
import { Input } from '../../packages/ui/components/input.tsx';
import { NativeSelect, NativeSelectOption } from '../../packages/ui/components/native-select.tsx';
import { InputGroup, InputGroupTextarea, InputGroupAddon } from '../../packages/ui/components/input-group.tsx';
import { AuthGate, type AuthStatus } from './AuthGate.tsx';
import './style.css';

type Client = { actorId: string; clientInstanceId: string; grantId: string; grantRevision: string; expiresAt: number; csrf: string };
type Notice = { key: MessageKey; code?: string };
const initialPreferences = readPreferences(browserStorage(), navigator.languages.length ? navigator.languages : [navigator.language]);
const short = (id: string | null | undefined) => id ? id.slice(0, 8) : '—';
const errorCode = (error: unknown) => error instanceof Error && /^[A-Z][A-Z0-9_]+$/.test(error.message) ? error.message : 'REQUEST_FAILED';
class RequestError extends Error {
  constructor(readonly status: number, readonly result: Record<string, unknown>) { super(typeof result.error === 'string' ? result.error : 'REQUEST_FAILED'); }
}
function App() {
  const [locale, setLocale] = useState(initialPreferences.locale);
  const [appearance, setAppearance] = useState(initialPreferences.appearance);
  const [systemDark, setSystemDark] = useState(() => matchMedia('(prefers-color-scheme: dark)').matches);
  const [preferenceSaves, setPreferenceSaves] = useState({ locale: true, appearance: true });
  const t = (key: MessageKey, values?: Record<string, string | number>) => translate(locale, key, values);
  useLayoutEffect(() => {
    const media = matchMedia('(prefers-color-scheme: dark)');
    const update = () => setSystemDark(media.matches);
    update(); media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  useLayoutEffect(() => {
    document.documentElement.lang = locale; document.title = translate(locale, 'pageTitle');
    document.documentElement.dataset.appearance = appearance;
    const theme = resolveTheme(appearance, systemDark);
    document.documentElement.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#18181b' : '#ffffff');
  }, [locale, appearance, systemDark]);
  const changeLocale = (value: Locale) => { setLocale(value); const saved = persistPreference(browserStorage(), 'locale', value); setPreferenceSaves(previous => ({ ...previous, locale: saved })); };
  const changeAppearance = (value: Appearance) => { setAppearance(value); const saved = persistPreference(browserStorage(), 'appearance', value); setPreferenceSaves(previous => ({ ...previous, appearance: saved })); };
  const [auth, setAuth] = useState<AuthStatus | null>(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authAttempt, setAuthAttempt] = useState(0);
  const [client, setClient] = useState<Client | null>(null);
  const [nativeMode, setNativeMode] = useState(false);
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [selectedWorkspace, setSelectedWorkspace] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedReasoning, setSelectedReasoning] = useState('');
  const [selectedPermission, setSelectedPermission] = useState<PermissionPreset>('READ_ONLY');
  const [prompt, setPrompt] = useState('');
  const [title, setTitle] = useState<string | null>(null);
  const sessionTitle = title ?? t('defaultTitle');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<Notice | null>(null);
  const [focusLane, setFocusLane] = useState<string | null>(null);
  const continueButton = useRef<HTMLButtonElement>(null);
  const [pending, setPending] = useState<FleetCommand | null>(() => {
    try { return JSON.parse(sessionStorage.getItem('fleetsplice.pending') ?? 'null'); } catch { return null; }
  });
  const clientRef = useRef<Client | null>(null);
  const refreshing = useRef(false);
  const dirty = useRef(false);
  const timeline = useRef<HTMLDivElement>(null);
  const catalogVersion = snapshot?.capabilities ? JSON.stringify(snapshot.capabilities) : '';
  const catalogSeen = useRef('');
  const sessionRef = useRef<BrowserClientSession | null>(null);
  if (!sessionRef.current) sessionRef.current = new BrowserClientSession(identity => { clientRef.current = identity; setClient(identity); });
  async function request(url: string, body?: unknown) {
    if (sessionRef.current!.native) {
      try { return await sessionRef.current!.request(url, body); }
      catch (error: any) { if (error.status && error.result) throw new RequestError(error.status, error.result); throw error; }
    }
    const response = await fetch(url, { method: body === undefined ? 'GET' : 'POST', headers: {
      'Content-Type': 'application/json', 'X-Fleet-Client': clientRef.current?.clientInstanceId ?? '', 'X-Fleet-Csrf': clientRef.current?.csrf ?? ''
    }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
    const result = await response.json(); if (!response.ok) throw new RequestError(response.status, result); return result;
  }
  async function refresh() {
    if (refreshing.current) { dirty.current = true; return; }
    refreshing.current = true;
    try {
      do { dirty.current = false; const next: Snapshot = await request('/api/snapshot'); setSnapshot(next); }
      while (dirty.current);
    } catch (e) { setError({ key: 'requestFailed', code: errorCode(e) }); }
    finally { refreshing.current = false; }
  }
  useEffect(() => {
    let events: EventSource | undefined;
    let cancelled = false;
    setAuthChecking(true); setAuthError(null);
    (async () => {
      const token = new URLSearchParams(location.hash.slice(1)).get('bootstrap');
      history.replaceState(null, '', location.pathname);
      if (token) await request('/api/bootstrap', { token });
      const response = await fetch('/api/auth/status');
      const status: AuthStatus = await response.json();
      if (!response.ok) throw new RequestError(response.status, status as unknown as Record<string, unknown>);
      if (cancelled) return;
      setAuth(status);
      if (!status.authenticated) return;
      const identity: Client = await request('/api/client', {});
      sessionRef.current!.setClient(identity);
      const mode = await request('/api/mode');
      if (mode.mode === 'NATIVE_ADOPTION') { sessionRef.current!.native = true; setNativeMode(true); return; }
      await refresh();
      events = new EventSource('/api/events'); events.onmessage = () => void refresh();
      events.onerror = () => { setError({ key: 'observationLost', code: 'OBSERVATION_UNKNOWN' }); setSnapshot(old => old ? { ...old, status: 'OBSERVATION_UNKNOWN' } : old); };
    })().catch(e => { if (!cancelled) setAuthError(errorCode(e)); })
      .finally(() => { if (!cancelled) setAuthChecking(false); });
    return () => { cancelled = true; events?.close(); };
  }, [authAttempt]);
  useEffect(() => { timeline.current?.scrollTo({ top: timeline.current.scrollHeight }); }, [snapshot?.cursor]);
  useLayoutEffect(() => {
    if (!catalogVersion || catalogSeen.current === catalogVersion) return;
    const catalog = snapshot?.capabilities!; const priorModel = selectedModel; const priorReasoning = selectedReasoning;
    catalogSeen.current = catalogVersion;
    const model = catalog.models.find(item => item.id === priorModel);
    if (priorModel && !model) {
      setSelectedModel(''); setSelectedReasoning(''); setError({ key: 'commandOutcome', code: 'STALE_MODEL_SELECTION' }); return;
    }
    const selectedModelValue = model ?? catalog.models.find(item => item.isDefault) ?? catalog.models[0];
    if (!selectedModelValue) { setSelectedModel(''); setSelectedReasoning(''); return; }
    if (!priorModel) { setSelectedModel(selectedModelValue.id); setSelectedReasoning(selectedModelValue.defaultReasoningEffort); return; }
    if (!selectedModelValue.supportedReasoningEfforts.some(choice => choice.reasoningEffort === priorReasoning)) {
      setSelectedReasoning(''); setError({ key: 'commandOutcome', code: 'STALE_REASONING_SELECTION' });
    }
  }, [catalogVersion]);
  useEffect(() => {
    if (!client) return;
    if (!nativeMode) {
      const timer = setTimeout(() => setError({ key: 'grantExpired', code: 'GRANT_EXPIRED' }), Math.max(0, client.expiresAt - Date.now()));
      return () => clearTimeout(timer);
    }
    const renew = () => { void sessionRef.current!.request().catch(e => setError({ key: 'requestFailed', code: errorCode(e) })); };
    const timer = setTimeout(renew, Math.max(0, client.expiresAt - Date.now() - 5 * 60_000));
    const visible = () => { if (document.visibilityState === 'visible') renew(); };
    document.addEventListener('visibilitychange', visible);
    return () => { clearTimeout(timer); document.removeEventListener('visibilitychange', visible); };
  }, [client, nativeMode]);
  const lane = snapshot?.lanes.find(item => item.laneId === selected);
  const workspace = snapshot?.workspaces.find(item => selectedWorkspace ? item.registryId === selectedWorkspace : item.target.workspaceId === snapshot.target.workspaceId);
  const controlled = !!lane && lane.fence.controller === client?.clientInstanceId;
  const available = snapshot?.status === 'READY' && !!client && client.expiresAt > Date.now() && !busy && !pending;
  const models = snapshot?.capabilities?.models ?? [];
  const chosenModel = models.find(item => item.id === selectedModel) ?? null;
  const permissions = snapshot?.capabilities?.permissions ?? [];
  const configurationSelected = !!chosenModel && chosenModel.supportedReasoningEfforts.some(item => item.reasoningEffort === selectedReasoning) && permissions.some(item => item.preset === selectedPermission && item.allowed);
  const receipt = snapshot?.commands.at(-1);
  // Guidance only: successful acquire focuses the separate explicit action. It never invokes it.
  useLayoutEffect(() => {
    if (!focusLane || busy) return;
    if (focusLane !== lane?.laneId || snapshot?.status !== 'READY' || document.querySelector('dialog[open]')) { setFocusLane(null); return; }
    // A successful receipt can precede its observation refresh. Wait for that observation.
    if (!controlled || pending) return;
    // A new P1 native thread also needs a live model/reasoning selection. Keep
    // the explicit guidance pending while the Owner refreshes that catalog.
    if (!lane.nativeThreadId && !configurationSelected) return;
    const button = continueButton.current;
    // This is a post-acquire accessibility contract, not a best-effort hint:
    // commit focus in the layout phase so a concurrent observation paint cannot
    // leave the newly enabled explicit action inactive.
    if (!available || !button || button.disabled) return;
    button.focus();
    setFocusLane(null);
  }, [focusLane, busy, controlled, available, configurationSelected, pending, lane?.laneId, snapshot?.status]);
  function acknowledgeRejection(e: unknown, value: FleetCommand): boolean {
    if (!(e instanceof RequestError) || e.status !== 409 || e.result.admission !== 'REJECTED_BEFORE_ADMISSION' || e.result.commandId !== value.commandId || e.result.intentDigest !== value.intentDigest) return false;
    sessionStorage.removeItem('fleetsplice.pending'); setPending(null);
    setError({ key: 'rejected', code: e.message }); return true;
  }
  async function lookupPending() {
    if (!pending) return;
    setBusy(true);
    try {
      const record: CommandRecord = await request(`/api/commands/${pending.commandId}`);
      if (record.status === 'ADMITTED' || record.status === 'DISPATCHED') { setError({ key: 'stillPending' }); return; }
      sessionStorage.removeItem('fleetsplice.pending'); setPending(null); setError(record.status === 'SUCCEEDED' ? null : { key: 'commandOutcome', code: `${record.status}: ${record.receipt?.code ?? 'EFFECT_UNKNOWN'}` }); await refresh();
    } catch (e) { if (acknowledgeRejection(e, pending)) await refresh(); else setError({ key: 'requestFailed', code: errorCode(e) }); } finally { setBusy(false); }
  }
  async function command(family: Intent['family'], body: unknown = {}) {
    if (!available || !client || !snapshot) return;
    setBusy(true); setError(null); if (family !== 'native.capabilities.read') setFocusLane(null);
    const intent = { v: 1, actorId: client.actorId, clientInstanceId: client.clientInstanceId, grantId: client.grantId, grantRevision: client.grantRevision,
      target: ['workspace.register', 'logicalSession.create', 'native.capabilities.read'].includes(family) ? workspace?.target : lane?.target, laneId: ['workspace.register', 'logicalSession.create', 'native.capabilities.read'].includes(family) ? null : lane?.laneId ?? null,
      expected: ['workspace.register', 'logicalSession.create', 'native.capabilities.read'].includes(family) ? null : lane?.fence ?? null, family, body } as Intent;
    const value: FleetCommand = { commandId: crypto.randomUUID(), idempotencyKey: crypto.randomUUID(), intentDigest: await digest('intent', intent), intent };
    // Storage failure prevents sending. Response loss keeps the exact intent available for lookup.
    try {
      sessionStorage.setItem('fleetsplice.pending', JSON.stringify(value)); setPending(value);
      const record: CommandRecord = await request('/api/commands', value);
      sessionStorage.removeItem('fleetsplice.pending'); setPending(null);
      if (record.status !== 'SUCCEEDED') setError({ key: 'commandOutcome', code: `${record.status}: ${record.receipt?.code ?? 'EFFECT_UNKNOWN'}` });
      if (family === 'logicalSession.create') setSelected(record.plan.laneId);
      if (family === 'turn.submit' && record.status === 'SUCCEEDED') setPrompt('');
      await refresh();
      // Bind guidance to the accepted receipt, never the pre-refresh render's
      // lane closure. The latter may still be null while React applies the
      // observation that made Continue available.
      if (family === 'sessionLane.acquireControl' && record.status === 'SUCCEEDED') {
        setFocusLane(record.plan.laneId);
        // The command receipt is authoritative, but the corresponding
        // observation can render one frame later. Retry only a bounded number
        // of frames to place keyboard guidance on the explicit next action.
        let frames = 0;
        const focusContinue = () => {
          const button = continueButton.current;
          if (button && !button.disabled) { button.focus(); return; }
          if (++frames < 8) requestAnimationFrame(focusContinue);
        };
        requestAnimationFrame(focusContinue);
      }
    } catch (e) {
      if (acknowledgeRejection(e, value)) await refresh();
      else setError({ key: 'commandUncertain', code: errorCode(e) });
    }
    finally { setBusy(false); }
  }
  function chooseModel(value: string) {
    const model = models.find(item => item.id === value);
    setSelectedModel(value); setSelectedReasoning(model?.defaultReasoningEffort ?? '');
  }
  const preferences = <PreferencesControl locale={locale} appearance={appearance} saved={preferenceSaves.locale && preferenceSaves.appearance} onLocale={changeLocale} onAppearance={changeAppearance}/>;
  if (authChecking || authError || !auth?.authenticated) return <AuthGate locale={locale} status={auth} checking={authChecking} error={authError} preferences={preferences} retry={() => setAuthAttempt(value => value + 1)}/>;
  if (nativeMode && client) return <div className="native-workspace"><NativeAdoption client={client} request={request} locale={locale} fleet={<GatewayDashboard locale={locale} request={request} ready={true} compact/>}
    preferences={<PreferencesControl locale={locale} appearance={appearance} saved={preferenceSaves.locale && preferenceSaves.appearance} onLocale={changeLocale} onAppearance={changeAppearance}/>}/></div>;
  return <div className="native-workspace"><AppShell
    brand={<div className="brand session-brand"><span className="mark">F</span><div><h1>{lane?.title ?? 'FleetSplice'}</h1><span className="session-target">{t('mainLane')} · {lane ? stateText(locale, lane.state) : t('noSession')}</span></div></div>}
    headerActions={<PreferencesControl locale={locale} appearance={appearance} saved={preferenceSaves.locale && preferenceSaves.appearance} onLocale={changeLocale} onAppearance={changeAppearance}/>}
    navTitle={t('sessions')} contextTitle={t('controlContext')} navigationSelection={selected ?? ''}
    navigation={<><label className="section-title" htmlFor="workspace">{t('newWorkspaceTarget')}</label>
      <NativeSelect className="w-full [&_select]:w-full" id="workspace" value={workspace?.registryId ?? ''} disabled={!available} onChange={event => setSelectedWorkspace(event.target.value)}><NativeSelectOption value="" disabled>{t('workspace')}</NativeSelectOption>{snapshot?.workspaces.map(item => <NativeSelectOption key={item.registryId} value={item.registryId} disabled={!item.valid}>{item.displayName}{item.valid ? '' : ` · ${t('workspaceInvalid')}`}</NativeSelectOption>)}</NativeSelect>
      <div className="workspace"><span>▣</span><div><strong>{workspace?.displayName ?? t('localWorkspace')}</strong><small data-testid="selected-workspace-root">{workspace?.root ?? t('bootstrapHint')}</small><small data-testid="selected-workspace-identity">{workspace?.rootIdentity ?? '—'}</small></div></div>
      {!workspace?.registered && <Button variant="outline" disabled={!available || !workspace?.valid} onClick={() => command('workspace.register', { root: workspace?.root })}>{t('registerWorkspace')}</Button>}
      <div className="section-title">{t('sessions')} <span>{snapshot?.lanes.length ?? 0}</span></div>
      <nav aria-label={t('sessions')}>{snapshot?.lanes.map(item => <Button variant="ghost" className={`session h-auto items-start justify-start ${selected === item.laneId ? 'selected' : ''}`} key={item.laneId} onClick={() => setSelected(item.laneId)}><span>{item.title}</span><small>{stateText(locale, item.state)}</small></Button>)}</nav>
      <form className="new-session" onSubmit={e => { e.preventDefault(); void command('logicalSession.create', { title: sessionTitle }); }}><label htmlFor="title">{t('newTitle')}</label><Input id="title" maxLength={80} value={sessionTitle} onChange={e => setTitle(e.target.value)}/><Button type="submit" variant="outline" disabled={!available || !workspace?.registered || !workspace.valid || (snapshot?.lanes.length ?? 24) >= 24 || !sessionTitle.trim()}>{t('newSession')}</Button></form>
      <div className="local-note">{t('onThisMachine')}<br/><span>{t('nativeReadOnly')}</span></div>
    </>}
    conversation={<><span className="sr-only" data-testid="lane-state" data-state={lane?.state ?? 'NO_SESSION'}>{lane ? stateText(locale, lane.state) : t('noSession')}</span>
            <section className="session-attention"><div className="attention-cards">{(error || (snapshot && snapshot.status !== 'READY')) && <div role="alert" className="alert">{error ? t(error.key, { code: error.code ?? '' }) : stateText(locale, snapshot!.status)}</div>}
      {pending && <div className="pending">{t('pendingReceipt', { id: short(pending.commandId) })}<Button variant="outline" disabled={busy} onClick={lookupPending}>{t('checkReceipt')}</Button></div>}
      </div></section>
      <div ref={timeline} className="timeline" aria-label={t('conversation')} role="log" aria-live="polite" aria-relevant="additions text">
        {!lane?.transcript.length && <div className="empty"><div className="empty-symbol">↗</div><h2>{t('emptyHeading')}</h2><p>{t(lane ? 'emptySession' : 'emptyNoSession')}</p></div>}
        {lane?.transcript.map((item, index) => <article className={`message ${item.role}`} key={index}><div className="message-label">{t(item.role === 'user' ? 'you' : item.role === 'assistant' ? 'codex' : 'session')}</div><div className="message-text" data-testid={item.role === 'assistant' ? 'assistant-text' : undefined}>{(item.role === 'system' ? systemText(locale, item.text) : item.text) || (lane.state === 'RUNNING' ? '…' : '')}</div></article>)}
      </div>
      <form className="composer composer-surface" onSubmit={e => { e.preventDefault(); if (available && controlled && lane?.state === 'IDLE' && prompt.trim()) void command('turn.submit', { text: prompt }); }}>
        <div className="composer-status"><OwnershipSurface
        controlled={controlled}
        controllerLabel={t('haveControl')}
        viewerLabel={t('viewer')}
        releaseLabel={t('releaseControl')}
        acquireLabel={t('acquireControl')}
        canRelease={!!available && controlled}
        canAcquire={!!available && !!lane && lane.fence.controller === null}
        onRelease={() => void command('sessionLane.releaseControl')}
        onAcquire={() => void command('sessionLane.acquireControl')}
      /></div>
        <div className="managed-continue"><Button variant="outline" ref={continueButton} disabled={!available || !controlled || (!lane?.nativeThreadId && !configurationSelected) || !['EMPTY', 'IDLE'].includes(lane?.state ?? '')} onClick={() => command('sessionLane.continue', { model: lane?.nativeThreadId ? lane.requestedModel : selectedModel, reasoningEffort: lane?.nativeThreadId ? lane.requestedReasoningEffort : selectedReasoning, permission: lane?.nativeThreadId ? lane.requestedPermission ?? 'READ_ONLY' : selectedPermission })}>{t('continueSession')}</Button></div>
        <InputGroup className="composer-input-group">
        <InputGroupTextarea className="min-h-16 max-h-40 resize-none text-[15px] md:text-[15px]" id="prompt" data-testid="managed-prompt" placeholder={t('promptPlaceholder')} aria-label={t('messageCodex')} maxLength={16000} value={prompt} onChange={e => setPrompt(e.target.value)} disabled={!controlled || lane?.state !== 'IDLE'} rows={1} onKeyDown={event => { if (!event.nativeEvent.isComposing && event.nativeEvent.keyCode !== 229 && event.key === 'Enter' && (event.ctrlKey || event.metaKey)) { event.preventDefault(); event.currentTarget.form?.requestSubmit(); } }}/>
        <InputGroupAddon align="block-end" className="composer-toolbar">
        <SessionConfigBar locale={locale} showController={false}
          modelLabel={t('model')} reasoningLabel={t('reasoning')} permissionLabel={t('permission')}
          controllerLabel={controlled ? t('haveControl') : t('viewer')}
          model={selectedModel} reasoning={selectedReasoning} permission={selectedPermission}
          models={models.map(model => ({ id: model.id, label: `${model.displayName}${model.isDefault ? ' · default' : ''}` }))}
          reasonings={(chosenModel?.supportedReasoningEfforts ?? []).map(choice => ({ id: choice.reasoningEffort, label: choice.reasoningEffort }))}
          permissions={permissions.map(item => ({ id: item.preset, label: `${t(item.preset)}${item.allowed ? '' : ` · ${t('permissionUnavailable')}`}`, disabled: !item.allowed }))}
          modelDisabled={!models.length || !available} reasoningDisabled={!chosenModel || !available} permissionDisabled={!permissions.length || !available}
          onModel={chooseModel} onReasoning={setSelectedReasoning} onPermission={value => setSelectedPermission(value as PermissionPreset)}
          mutationSupported={true}
        />
        <div className="composer-actions">
          <Button type="submit" variant="default" disabled={!available || !controlled || lane?.state !== 'IDLE' || !prompt.trim()}>{t('sendMessage')} <span aria-hidden="true">↑</span></Button>
        </div>
        </InputGroupAddon></InputGroup>
      </form>
    </>}
    context={<><div className="eyebrow">{t('controlContext')}</div><h3>{t('nativeCapabilities')}</h3><p className="muted">{t('liveCatalogHint')}</p><p className="muted">{t('newSessionConfigurationHint')}</p>
      <Button variant="outline" disabled={!available || !workspace?.registered || !workspace.valid} onClick={() => command('native.capabilities.read')}>{t('refreshCapabilities')}</Button>
      <p className="muted">{t('permissionHint')}</p>
      <h3>{t('sessionControl')}</h3><p className="muted">{t(controlled ? 'controllerHint' : 'viewerHint')}</p>
      {available && lane && ['EMPTY', 'IDLE'].includes(lane.state) && (controlled || lane.fence.controller === null) && <p className="control-next" role="status">{t(!controlled ? 'nextAcquire' : !lane.nativeThreadId ? 'nextContinue' : 'nextPrompt')}</p>}


      <h3>{t('execution')}</h3><dl><dt>{t('agent')}</dt><dd>{t('nativeAgent')}</dd><dt>{t('continuity')}</dt><dd>{lane?.nativeThreadId ? t(snapshot?.status === 'READY' ? 'sameNative' : 'nativeUnavailable') : t('nativeNotStarted')}</dd><dt>{t('controlRevision')}</dt><dd data-testid="control-fence">{lane ? `${lane.fence.epoch} / ${lane.fence.revision}` : '—'}</dd><dt>{t('requestedConfiguration')}</dt><dd>{lane?.requestedModel ? `${lane.requestedModel} / ${lane.requestedReasoningEffort}` : '—'}</dd><dt>{t('effectiveConfiguration')}</dt><dd>{lane?.effectiveModel ? `${lane.effectiveModel} / ${lane.effectiveReasoningEffort}` : '—'}</dd><dt>{t('nativeThread')}</dt><dd className="id" data-testid="native-thread">{lane?.nativeThreadId ?? '—'}</dd><dt>{t('nativeTurn')}</dt><dd className="id" data-testid="native-turn">{lane?.nativeTurnId ?? '—'}</dd></dl>
      <dl><dt>{t('requestedPermission')}</dt><dd data-testid="requested-permission">{lane?.requestedPermission ? t(lane.requestedPermission) : '—'}</dd><dt>{t('effectivePermission')}</dt><dd data-testid="effective-permission">{lane?.effectivePermission ? `${t(lane.effectivePermission.preset)} · ${lane.effectivePermission.sandbox} · approval=${lane.effectivePermission.approvalPolicy} · network=${lane.effectivePermission.network}` : '—'}</dd></dl>
      <h3>{t('activity')}</h3><ul className="activity" aria-label={t('activity')}>{lane?.activity.length ? lane.activity.slice(-8).map((item, index) => <li key={`${item.text}-${index}`}>{item.text}</li>) : <li>{t('noActivity')}</li>}</ul>
      <dl><dt>{t('sessionWorkspace')}</dt><dd data-testid="session-workspace-root">{lane?.root ?? '—'}</dd><dt>{t('workspaceIdentity')}</dt><dd className="id" data-testid="session-workspace-identity">{lane?.target.rootIdentity ?? '—'}</dd></dl>
      <details><summary>{t('commandReceipt')}</summary><pre data-testid="receipt">{receipt ? JSON.stringify({ commandId: receipt.command.commandId, planId: receipt.plan.planId, status: receipt.status, receipt: receipt.receipt }, null, 2) : t('noCommands')}</pre></details>

<GatewayDashboard locale={locale} request={request} ready={!!client} compact/>
</>}
    footer={<><span className={snapshot?.status === 'READY' ? 'dot online' : 'dot'}/><span data-testid="connection-status" data-state={snapshot?.status ?? 'CONNECTING'}>{stateText(locale, snapshot?.status ?? 'CONNECTING')}</span></>}
  /></div>;
}
createRoot(document.getElementById('root')!).render(<App/>);
