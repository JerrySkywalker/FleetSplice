import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '../../../packages/ui/components/collapsible.tsx';
import { Button } from '../../../packages/ui/components/button.tsx';
import React from 'react';
import { Circle, ChevronRight } from 'lucide-react';
import { SemanticIcon, toolFailedIcon as ToolFailedIcon } from '../icons/semantic-icons.tsx';
import type { TimelinePresentationItem } from '../../../packages/contracts/realtime-timeline.ts';
import type { MessageSource } from '../../../packages/native-adoption/types.ts';
import type { Locale } from '../i18n.ts';
import { MessageText } from './MessageText.tsx';

export function StatusChip({ kind, label, testId }: {
  kind: 'controller' | 'viewer' | 'working' | 'attention' | 'connected';
  label: string;
  testId?: string;
}) {
  return <span className={`status-chip status-chip-${kind}`} data-testid={testId ?? `status-chip-${kind}`} data-kind={kind}>
    <span className={`status-dot ${kind === 'viewer' ? 'is-outline' : kind === 'attention' ? 'is-attention' : kind === 'working' ? 'is-working' : 'is-filled'}`} aria-hidden="true" />
    <span>{label}</span>
  </span>;
}

export function StreamingMessage({ item, streamingLabel }: {
  item: TimelinePresentationItem;
  streamingLabel: string;
}) {
  return <ConversationMessage role="assistant" text={item.text ?? ''} itemId={item.itemId ?? undefined}
    liveKind={item.kind === 'message.delta' ? 'message.delta' : 'message.final'} label="Codex" streamingLabel={streamingLabel} />;
}

export function ConversationMessage({ role, text, itemId, source, liveKind, label, streamingLabel, turnEnded = false, locale = 'en-US' }: {
  role: 'user' | 'assistant'; text: string; itemId?: string; source?: MessageSource;
  liveKind?: 'message.delta' | 'message.final'; label: string; streamingLabel: string; locale?: Locale;
  turnEnded?: boolean;
}) {
  const partial = liveKind === 'message.delta' && turnEnded;
  const streaming = liveKind === 'message.delta' && !turnEnded;
  return <article
    className={`message ${role} ${role === 'assistant' ? 'streaming-message' : ''} ${streaming ? 'is-streaming' : partial ? 'is-partial' : 'is-final'}`}
    data-live-kind={liveKind} data-ephemeral={liveKind ? 'true' : undefined} data-item-id={itemId}
    data-testid={liveKind ? streaming ? 'streaming-assistant' : partial ? 'partial-assistant' : 'final-assistant' : 'conversation-message'}
  >
    <div className="message-label">{label}
      {role === 'user' && <small className="native-source-badge" data-source={source?.kind ?? 'NATIVE_EXTERNAL'} title={source?.kind === 'FLEETSPLICE_WEB' ? source.clientInstanceId : undefined}>
        {source?.kind === 'FLEETSPLICE_WEB' ? `Web${source.deviceLabel || source.clientDisplayLabel ? ` · ${source.deviceLabel || source.clientDisplayLabel}` : ''}` : locale === 'zh-CN' ? '原生' : 'Native'}
      </small>}
      {streaming ? <small className="streaming-indicator" aria-live="polite">{streamingLabel}</small> : null}
      {partial && <small>{locale === 'zh-CN' ? '轮次已结束，内容观察不完整' : 'Turn ended; partial observation'}</small>}
    </div>
    <MessageText text={text || (streaming ? '…' : '')} locale={locale} />
    {streaming ? <span className="streaming-caret" aria-hidden="true" /> : null}
  </article>;
}

function toolTitle(text: string | undefined): { title: string; detail: string } {
  const raw = (text ?? '').trim();
  if (!raw) return { title: 'Tool', detail: '' };
  const firstLine = raw.split('\n')[0]!.trim();
  const parts = firstLine.split(/\s+/);
  const maybeShell = parts[0] && /^[A-Za-z0-9_./\\:-]+$/.test(parts[0]) ? parts[0] : 'Tool';
  return { title: maybeShell, detail: firstLine };
}

export function ToolActivityCard({ item, runningLabel, completedLabel, failedLabel, detailsLabel, unknownLabel = 'Status unknown', detailsHint }: {
  item: Pick<TimelinePresentationItem, 'kind' | 'status' | 'text' | 'toolId' | 'itemId'> & { ephemeral?: boolean };
  runningLabel: string;
  completedLabel: string;
  failedLabel: string;
  detailsLabel: string;
  unknownLabel?: string; detailsHint?: string;
}) {
  const status = (item.status ?? item.kind).toLowerCase();
  const running = item.kind === 'tool.started' || /inprogress|running|started|in_progress/.test(status);
  const failed = item.kind === 'tool.failed' || /fail|error/.test(status);
  const completed = item.kind === 'tool.completed' || status === 'completed';
  const stateLabel = failed ? failedLabel : running ? runningLabel : completed ? completedLabel : unknownLabel;
  const { title, detail } = toolTitle(item.text);
  return <Collapsible render={<article/>}
    className={`tool-card ${running ? 'is-running' : failed ? 'is-failed' : completed ? 'is-completed' : 'is-unknown'}`}
    data-live-kind={item.kind} data-ephemeral={item.ephemeral === false ? undefined : 'true'}
    data-item-id={item.itemId ?? item.toolId ?? undefined}
    data-tool-status={running ? 'running' : failed ? 'failed' : completed ? 'completed' : 'unknown'} data-testid="tool-activity-card">
    <CollapsibleTrigger render={<Button variant="ghost"/>} className="tool-trigger" aria-label={`${detailsLabel}: ${title}`}>
      <ChevronRight size={14} className="tool-chevron" aria-hidden="true"/>
      <span className="tool-summary">{detail || title}</span>
      <span className="tool-state">
        {running ? <SemanticIcon intent="toolRunning" size={14} className="tool-icon" spin/>
          : failed ? <ToolFailedIcon size={14} className="tool-icon" aria-hidden="true"/>
            : completed ? <SemanticIcon intent="toolCompleted" size={14} className="tool-icon"/> : <Circle size={14} aria-hidden="true"/>}
        {stateLabel}
      </span>
    </CollapsibleTrigger>
    <CollapsibleContent className="tool-details"><pre>{item.text}</pre>{detailsHint && <p className="muted">{detailsHint}</p>}</CollapsibleContent>
  </Collapsible>;
}

export function OwnershipSurface({
  controlled, controllerLabel, viewerLabel, releaseLabel, acquireLabel,
  canRelease, canAcquire, onRelease, onAcquire,
  connected = true, notConnectedLabel = 'Not connected',
}: {
  controlled: boolean;
  controllerLabel: string;
  viewerLabel: string;
  releaseLabel: string;
  acquireLabel: string;
  canRelease: boolean;
  canAcquire: boolean;
  onRelease: () => void;
  onAcquire: () => void;
  connected?: boolean;
  notConnectedLabel?: string;
}) {
  if (!connected) {
    return <div className="ownership-surface" data-testid="ownership-surface" data-controlled="false" data-connected="false">
      <div className="ownership-status">
        <span className="status-dot is-outline" aria-hidden="true" />
        <span data-testid="ownership-not-connected">{notConnectedLabel}</span>
      </div>
    </div>;
  }
  return <div className="ownership-surface" data-testid="ownership-surface" data-controlled={controlled} data-connected="true">
    <div className="ownership-status">
      <span className={`status-dot ${controlled ? 'is-filled' : 'is-outline'}`} aria-hidden="true" />
      <span>{controlled ? controllerLabel : viewerLabel}</span>
    </div>
    {controlled
      ? <Button variant="outline" type="button" data-testid="ownership-action" disabled={!canRelease} onClick={onRelease}>{releaseLabel}</Button>
      : <Button variant="default" type="button" data-testid="ownership-action" disabled={!canAcquire} onClick={onAcquire}>{acquireLabel}</Button>}
  </div>;
}

export function ReviewCard({ title, body, actionLabel, disabled, onReview }: {
  title: string; body: string; actionLabel: string; disabled: boolean; onReview: () => void;
}) {
  return <div className="review-card notice-card review-card-compact severity-info" data-testid="external-advance-notice" data-severity="info">
    <div className="review-card-body">
      <SemanticIcon intent="review" size={16} className="review-card-icon" />
      <div className="review-card-copy">
        <strong>{title}</strong>
        <p>{body}</p>
      </div>
    </div>
    <Button variant="default" type="button" className="review-card-action" data-testid="external-review-action" disabled={disabled} onClick={onReview}>{actionLabel}</Button>
  </div>;
}

export function ApprovalCard({
  statusLabel, summary, meta, unsupportedHint, canAllow, canDeny, onAllow, onDeny, allowLabel, denyLabel,
}: {
  statusLabel: string;
  summary: string;
  meta: string;
  unsupportedHint?: string;
  canAllow: boolean;
  canDeny: boolean;
  onAllow: () => void;
  onDeny: () => void;
  allowLabel: string;
  denyLabel: string;
}) {
  return <article className="approval-card" data-testid="approval-card">
    <div className="notice-card-head">
      <SemanticIcon intent="warning" size={16} />
      <strong>{statusLabel}</strong>
    </div>
    <p style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{summary}</p>
    <small>{meta}</small>
    {unsupportedHint ? <p className="muted">{unsupportedHint}</p> : null}
    {(canAllow || canDeny) && <div className="approval-actions">
      <Button variant="default" type="button" disabled={!canAllow} onClick={onAllow}>{allowLabel}</Button>
      <Button variant="outline" type="button" disabled={!canDeny} onClick={onDeny}>{denyLabel}</Button>
    </div>}
  </article>;
}

export function SessionItem({
  selected, title, subtitle, workspace, status, connected, onSelect, testId,
}: {
  selected: boolean;
  title: string;
  subtitle: string;
  workspace: string;
  status: string;
  connected: boolean;
  onSelect: () => void;
  testId?: string;
}) {
  return <Button variant="ghost" type="button"
    className={`session-item grid h-auto min-h-14 w-full grid-cols-[minmax(0,1fr)_auto] gap-x-2 gap-y-1 px-3 py-2 text-left font-normal ${selected ? 'bg-accent text-accent-foreground' : ''}`}
    data-testid={testId ?? 'session-item'} data-connected={connected} aria-current={selected ? 'page' : undefined}
    title={`${workspace} · ${subtitle} · ${status}`} onClick={onSelect}>
    <span className="truncate font-medium" title={title}>{title}</span>
    <span className="session-row-state" title={status} aria-label={status}>{connected ? <SemanticIcon intent="connected" size={12}/> : <Circle size={12} aria-hidden="true"/>}</span>
    <span className="col-span-2 truncate text-xs text-muted-foreground" title={workspace}>{workspace.split(/[\\/]/).filter(Boolean).at(-1)} · {status}</span>
  </Button>;
}

export function SessionConnectPreview({
  title, workspaceLabel, modelLabel, stateLabel, threadLabel,
  workspace, model, state, threadShort, body, actionLabel, disabled, onConnect,
}: {
  title: string;
  workspaceLabel: string;
  modelLabel: string;
  stateLabel: string;
  threadLabel: string;
  workspace: string;
  model: string;
  state: string;
  threadShort: string;
  body: string;
  actionLabel: string;
  disabled: boolean;
  onConnect: () => void;
}) {
  return <div className="session-connect-preview" data-testid="session-connect-preview">
    <div className="eyebrow">Codex</div>
    <h2>{title}</h2>
    <dl className="connect-facts">
      <dt>{workspaceLabel}</dt><dd className="text-ellipsis" data-clipping-policy="ellipsis" title={workspace}>{workspace}</dd>
      <dt>{modelLabel}</dt><dd className="text-ellipsis" data-clipping-policy="ellipsis" title={model}>{model}</dd>
      <dt>{stateLabel}</dt><dd>{state}</dd>
      <dt>{threadLabel}</dt><dd className="id text-wrap-safe">{threadShort}</dd>
    </dl>
    <p className="muted connect-body text-wrap-safe">{body}</p>
    <Button variant="default" type="button" className="connect-session-action" data-testid="connect-session" disabled={disabled} onClick={onConnect}>
      {actionLabel}
    </Button>
  </div>;
}
