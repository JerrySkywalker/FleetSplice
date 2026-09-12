import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { digest } from '../../packages/contracts/json.ts';
import type { FleetCommand, Intent, Snapshot, CommandRecord, PermissionPreset } from '../../packages/contracts/index.ts';
import { stateText, systemText, translate, type MessageKey, type Locale } from './i18n.ts';
import { browserStorage, persistPreference, readPreferences, resolveTheme, type Appearance } from './preferences.ts';
import { PreferencesControl } from './PreferencesControl.tsx';
import { NativeAdoption } from './NativeAdoption.tsx';
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
    document.documentElement.dataset.theme = resolveTheme(appearance, systemDark);
  }, [locale, appearance, systemDark]);
  const changeLocale = (value: Locale) => { setLocale(value); const saved = persistPreference(browserStorage(), 'locale', value); setPreferenceSaves(previous => ({ ...previous, locale: saved })); };
  const changeAppearance = (value: Appearance) => { setAppearance(value); const saved = persistPreference(browserStorage(), 'appearance', value); setPreferenceSaves(previous => ({ ...previous, appearance: saved })); };
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
  const headers = () => ({ 'Content-Type': 'application/json', 'X-Fleet-Client': clientRef.current?.clientInstanceId ?? '', 'X-Fleet-Csrf': clientRef.current?.csrf ?? '' });
  async function request(url: string, body?: unknown) {
    const response = await fetch(url, { method: body === undefined ? 'GET' : 'POST', headers: headers(), ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
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
    (async () => {
      const token = new URLSearchParams(location.hash.slice(1)).get('bootstrap');
      history.replaceState(null, '', location.pathname);
      if (token) await request('/api/bootstrap', { token });
      const identity: Client = await request('/api/client', {});
      clientRef.current = identity; setClient(identity);
      const mode = await request('/api/mode');
      if (mode.mode === 'NATIVE_ADOPTION') { setNativeMode(true); return; }
      await refresh();
      events = new EventSource('/api/events'); events.onmessage = () => void refresh();
      events.onerror = () => { setError({ key: 'observationLost', code: 'OBSERVATION_UNKNOWN' }); setSnapshot(old => old ? { ...old, status: 'OBSERVATION_UNKNOWN' } : old); };
    })().catch(e => setError({ key: 'requestFailed', code: errorCode(e) }));
    return () => events?.close();
  }, []);
  useEffect(() => { timeline.current?.scrollTo({ top: timeline.current.scrollHeight }); }, [snapshot?.cursor]);
  useEffect(() => {
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
    const timer = setTimeout(() => setError({ key: 'grantExpired', code: 'GRANT_EXPIRED' }), Math.max(0, client.expiresAt - Date.now()));
    return () => clearTimeout(timer);
  }, [client]);
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
  useEffect(() => {
    if (!focusLane || busy) return;
    if (focusLane !== lane?.laneId || snapshot?.status !== 'READY' || document.querySelector('dialog[open]')) { setFocusLane(null); return; }
    // A successful receipt can precede its observation refresh. Wait for that observation.
    if (!controlled || pending) return;
    // A new P1 native thread also needs a live model/reasoning selection. Keep
    // the explicit guidance pending while the Owner refreshes that catalog.
    if (!lane.nativeThreadId && !configurationSelected) return;
    if (available && !continueButton.current?.disabled) continueButton.current?.focus();
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
      if (family === 'sessionLane.acquireControl' && record.status === 'SUCCEEDED') setFocusLane(lane?.laneId ?? null);
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
  if (nativeMode && client) return <NativeAdoption client={client} request={request} locale={locale}
    preferences={<PreferencesControl locale={locale} appearance={appearance} saved={preferenceSaves.locale && preferenceSaves.appearance} onLocale={changeLocale} onAppearance={changeAppearance}/>}/>;
  return <div className="shell">
    <header><div className="brand"><span className="mark">F</span> FleetSplice <span className="edition">{t('edition')}</span></div><div className="owner"><PreferencesControl locale={locale} appearance={appearance} saved={preferenceSaves.locale && preferenceSaves.appearance} onLocale={changeLocale} onAppearance={changeAppearance}/><span className="owner-name">Jerry</span><span className="avatar">J</span></div></header>
    <aside className="navigation">
      <div className="eyebrow">{t('yourFleet')}</div><div className="host"><span className={`dot ${snapshot?.status === 'READY' ? 'online' : ''}`}/><strong>SKYFORGE-01</strong></div><div className="environment">└ &nbsp; windows-user</div>
      <label className="section-title" htmlFor="workspace">{t('newWorkspaceTarget')}</label>
      <select id="workspace" value={workspace?.registryId ?? ''} disabled={!available} onChange={event => setSelectedWorkspace(event.target.value)}><option value="" disabled>{t('workspace')}</option>{snapshot?.workspaces.map(item => <option key={item.registryId} value={item.registryId} disabled={!item.valid}>{item.displayName}{item.valid ? '' : ` · ${t('workspaceInvalid')}`}</option>)}</select>
      <div className="workspace"><span>▣</span><div><strong>{workspace?.displayName ?? t('localWorkspace')}</strong><small data-testid="selected-workspace-root">{workspace?.root ?? t('bootstrapHint')}</small><small data-testid="selected-workspace-identity">{workspace?.rootIdentity ?? '—'}</small></div></div>
      {!workspace?.registered && <button disabled={!available || !workspace?.valid} onClick={() => command('workspace.register', { root: workspace?.root })}>{t('registerWorkspace')}</button>}
      <div className="section-title">{t('sessions')} <span>{snapshot?.lanes.length ?? 0}</span></div>
      <nav aria-label={t('sessions')}>{snapshot?.lanes.map(item => <button className={`session ${selected === item.laneId ? 'selected' : ''}`} key={item.laneId} onClick={() => setSelected(item.laneId)}><span>{item.title}</span><small>{stateText(locale, item.state)}</small></button>)}</nav>
      <form className="new-session" onSubmit={e => { e.preventDefault(); void command('logicalSession.create', { title: sessionTitle }); }}><label htmlFor="title">{t('newTitle')}</label><input id="title" maxLength={80} value={sessionTitle} onChange={e => setTitle(e.target.value)}/><button disabled={!available || !workspace?.registered || !workspace.valid || (snapshot?.lanes.length ?? 24) >= 24 || !sessionTitle.trim()}>{t('newSession')}</button></form>
      <div className="local-note">{t('onThisMachine')}<br/><span>{t('nativeReadOnly')}</span></div>
    </aside>
    <main>
      <div className="session-heading"><div><div className="eyebrow">{t('mainLane')}</div><h1>{lane?.title ?? t('companion')}</h1><div className="subtitle">{lane ? t('logicalSession', { id: short(lane.sessionId), control: t(controlled ? 'haveControl' : 'viewer') }) : t('chooseSession')}</div></div><span className="status" data-testid="lane-state" data-state={lane?.state ?? 'NO_SESSION'}>{lane ? stateText(locale, lane.state) : t('noSession')}</span></div>
      {(error || (snapshot && snapshot.status !== 'READY')) && <div role="alert" className="alert">{error ? t(error.key, { code: error.code ?? '' }) : stateText(locale, snapshot!.status)}</div>}
      {pending && <div className="pending">{t('pendingReceipt', { id: short(pending.commandId) })}<button disabled={busy} onClick={lookupPending}>{t('checkReceipt')}</button></div>}
      <div ref={timeline} className="timeline" aria-label={t('conversation')} role="log" aria-live="polite" aria-relevant="additions text">
        {!lane?.transcript.length && <div className="empty"><div className="empty-symbol">↗</div><h2>{t('emptyHeading')}</h2><p>{t(lane ? 'emptySession' : 'emptyNoSession')}</p><div className="path">{t('browser')} <span>→</span> Hub <span>→</span> SKYFORGE Edge <span>→</span> Codex</div></div>}
        {lane?.transcript.map((item, index) => <article className={`message ${item.role}`} key={index}><div className="message-label">{t(item.role === 'user' ? 'you' : item.role === 'assistant' ? 'codex' : 'session')}</div><div className="message-text" data-testid={item.role === 'assistant' ? 'assistant-text' : undefined}>{(item.role === 'system' ? systemText(locale, item.text) : item.text) || (lane.state === 'RUNNING' ? '…' : '')}</div></article>)}
      </div>
      <form className="composer" onSubmit={e => { e.preventDefault(); void command('turn.submit', { text: prompt }); }}><label htmlFor="prompt">{t('messageCodex')}</label><textarea id="prompt" placeholder={t('promptPlaceholder')} maxLength={16000} value={prompt} onChange={e => setPrompt(e.target.value)} disabled={!controlled || lane?.state !== 'IDLE'}/><div><span>{t('readOnlyHint')}</span><button className="primary" disabled={!available || !controlled || lane?.state !== 'IDLE' || !prompt.trim()}>{t('sendMessage')} <span aria-hidden="true">↑</span></button></div></form>
    </main>
    <aside className="context"><div className="eyebrow">{t('controlContext')}</div><h3>{t('nativeCapabilities')}</h3><p className="muted">{t('liveCatalogHint')}</p><p className="muted">{t('newSessionConfigurationHint')}</p>
      <button disabled={!available || !workspace?.registered || !workspace.valid} onClick={() => command('native.capabilities.read')}>{t('refreshCapabilities')}</button>
      <label className="capability-label" htmlFor="model">{t('model')}</label><select id="model" aria-label={t('model')} value={selectedModel} disabled={!models.length || !available} onChange={event => chooseModel(event.target.value)}>
        {!models.length && <option value="">{t('selectModel')}</option>}{models.map(model => <option key={model.id} value={model.id}>{model.displayName}{model.isDefault ? ' · default' : ''}</option>)}
      </select>
      <label className="capability-label" htmlFor="reasoning">{t('reasoning')}</label><select id="reasoning" aria-label={t('reasoning')} value={selectedReasoning} disabled={!chosenModel || !available} onChange={event => setSelectedReasoning(event.target.value)}>
        {!chosenModel && <option value="">{t('selectReasoning')}</option>}{chosenModel?.supportedReasoningEfforts.map(choice => <option key={choice.reasoningEffort} value={choice.reasoningEffort}>{choice.reasoningEffort}</option>)}
      </select>
      <label className="capability-label" htmlFor="permission">{t('permission')}</label><select id="permission" aria-label={t('permission')} value={selectedPermission} disabled={!permissions.length || !available} onChange={event => setSelectedPermission(event.target.value as PermissionPreset)}>
        {permissions.map(item => <option key={item.preset} value={item.preset} disabled={!item.allowed}>{t(item.preset)}{item.allowed ? '' : ` · ${t('permissionUnavailable')}`}</option>)}
      </select><p className="muted">{t('permissionHint')}</p>
      <h3>{t('sessionControl')}</h3><p className="muted">{t(controlled ? 'controllerHint' : 'viewerHint')}</p>
      {available && lane && ['EMPTY', 'IDLE'].includes(lane.state) && (controlled || lane.fence.controller === null) && <p className="control-next" role="status">{t(!controlled ? 'nextAcquire' : !lane.nativeThreadId ? 'nextContinue' : 'nextPrompt')}</p>}
      <button disabled={!available || !lane || lane.fence.controller !== null} onClick={() => command('sessionLane.acquireControl')}>{t('acquireControl')}</button>
      <button ref={continueButton} disabled={!available || !controlled || (!lane?.nativeThreadId && !configurationSelected) || !['EMPTY', 'IDLE'].includes(lane?.state ?? '')} onClick={() => command('sessionLane.continue', { model: lane?.nativeThreadId ? lane.requestedModel : selectedModel, reasoningEffort: lane?.nativeThreadId ? lane.requestedReasoningEffort : selectedReasoning, permission: lane?.nativeThreadId ? lane.requestedPermission ?? 'READ_ONLY' : selectedPermission })}>{t('continueSession')}</button>
      <button disabled={!available || !controlled} onClick={() => command('sessionLane.releaseControl')}>{t('releaseControl')}</button>
      <h3>{t('execution')}</h3><dl><dt>{t('host')}</dt><dd>SKYFORGE-01</dd><dt>{t('environment')}</dt><dd>windows-user</dd><dt>{t('agent')}</dt><dd>{t('nativeAgent')}</dd><dt>{t('continuity')}</dt><dd>{lane?.nativeThreadId ? t(snapshot?.status === 'READY' ? 'sameNative' : 'nativeUnavailable') : t('nativeNotStarted')}</dd><dt>{t('controlRevision')}</dt><dd data-testid="control-fence">{lane ? `${lane.fence.epoch} / ${lane.fence.revision}` : '—'}</dd><dt>{t('requestedConfiguration')}</dt><dd>{lane?.requestedModel ? `${lane.requestedModel} / ${lane.requestedReasoningEffort}` : '—'}</dd><dt>{t('effectiveConfiguration')}</dt><dd>{lane?.effectiveModel ? `${lane.effectiveModel} / ${lane.effectiveReasoningEffort}` : '—'}</dd><dt>{t('nativeThread')}</dt><dd className="id" data-testid="native-thread">{lane?.nativeThreadId ?? '—'}</dd><dt>{t('nativeTurn')}</dt><dd className="id" data-testid="native-turn">{lane?.nativeTurnId ?? '—'}</dd></dl>
      <dl><dt>{t('requestedPermission')}</dt><dd data-testid="requested-permission">{lane?.requestedPermission ? t(lane.requestedPermission) : '—'}</dd><dt>{t('effectivePermission')}</dt><dd data-testid="effective-permission">{lane?.effectivePermission ? `${t(lane.effectivePermission.preset)} · ${lane.effectivePermission.sandbox} · approval=${lane.effectivePermission.approvalPolicy} · network=${lane.effectivePermission.network}` : '—'}</dd></dl>
      <h3>{t('activity')}</h3><ul className="activity" aria-label={t('activity')}>{lane?.activity.length ? lane.activity.slice(-8).map((item, index) => <li key={`${item.text}-${index}`}>{item.text}</li>) : <li>{t('noActivity')}</li>}</ul>
      <dl><dt>{t('sessionWorkspace')}</dt><dd data-testid="session-workspace-root">{lane?.root ?? '—'}</dd><dt>{t('workspaceIdentity')}</dt><dd className="id" data-testid="session-workspace-identity">{lane?.target.rootIdentity ?? '—'}</dd></dl>
      <details><summary>{t('commandReceipt')}</summary><pre data-testid="receipt">{receipt ? JSON.stringify({ commandId: receipt.command.commandId, planId: receipt.plan.planId, status: receipt.status, receipt: receipt.receipt }, null, 2) : t('noCommands')}</pre></details>
    </aside><footer><span className={`dot ${snapshot?.status === 'READY' ? 'online' : ''}`}/><span data-testid="connection-status" data-state={snapshot?.status ?? 'CONNECTING'}>{stateText(locale, snapshot?.status ?? 'CONNECTING')}</span><span className="footer-right">{t('footer')}</span></footer>
  </div>;
}
createRoot(document.getElementById('root')!).render(<App/>);
