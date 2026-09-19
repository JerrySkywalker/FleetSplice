import React from 'react';
import { AlertTriangle, CheckCircle2, Circle, Loader2, ShieldAlert, XCircle } from 'lucide-react';
import type { TimelinePresentationItem } from '../../../packages/contracts/realtime-timeline.ts';

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
  const streaming = item.kind === 'message.delta';
  return <article
    className={`message assistant streaming-message ${streaming ? 'is-streaming' : 'is-final'}`}
    data-live-kind={item.kind}
    data-ephemeral="true"
    data-item-id={item.itemId ?? undefined}
    data-testid={streaming ? 'streaming-assistant' : 'final-assistant'}
  >
    <div className="message-label">Codex{streaming ? <small className="streaming-indicator" aria-live="polite">{streamingLabel}</small> : null}</div>
    <div className="message-text">{item.text || (streaming ? '…' : '')}{streaming ? <span className="streaming-caret" aria-hidden="true" /> : null}</div>
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

export function ToolActivityCard({ item, runningLabel, completedLabel, failedLabel, detailsLabel }: {
  item: TimelinePresentationItem;
  runningLabel: string;
  completedLabel: string;
  failedLabel: string;
  detailsLabel: string;
}) {
  const status = (item.status ?? item.kind).toLowerCase();
  const running = item.kind === 'tool.started' || /inprogress|running|started|in_progress/.test(status);
  const failed = item.kind === 'tool.failed' || /fail|error/.test(status);
  const stateLabel = failed ? failedLabel : running ? runningLabel : completedLabel;
  const { title, detail } = toolTitle(item.text);
  return <article
    className={`tool-card ${running ? 'is-running' : failed ? 'is-failed' : 'is-completed'}`}
    data-live-kind={item.kind}
    data-ephemeral="true"
    data-item-id={item.itemId ?? item.toolId ?? undefined}
    data-tool-status={running ? 'running' : failed ? 'failed' : 'completed'}
    data-testid="tool-activity-card"
  >
    <div className="tool-card-head">
      <strong>{title}</strong>
      <span className={`tool-state ${running ? 'pulse' : ''}`}>
        {running ? <Loader2 size={14} className="tool-icon spin" aria-hidden="true" />
          : failed ? <XCircle size={14} className="tool-icon" aria-hidden="true" />
            : <CheckCircle2 size={14} className="tool-icon" aria-hidden="true" />}
        {stateLabel}
      </span>
    </div>
    {detail ? <div className="tool-summary">{detail}</div> : null}
    {item.text && item.text.trim() !== detail ? <details><summary>{detailsLabel}</summary><pre>{item.text}</pre></details> : null}
  </article>;
}

export function OwnershipSurface({ controlled, controllerLabel, viewerLabel, releaseLabel, acquireLabel, canRelease, canAcquire, onRelease, onAcquire }: {
  controlled: boolean;
  controllerLabel: string;
  viewerLabel: string;
  releaseLabel: string;
  acquireLabel: string;
  canRelease: boolean;
  canAcquire: boolean;
  onRelease: () => void;
  onAcquire: () => void;
}) {
  return <div className="ownership-surface" data-testid="ownership-surface" data-controlled={controlled}>
    <div className="ownership-status">
      <span className={`status-dot ${controlled ? 'is-filled' : 'is-outline'}`} aria-hidden="true" />
      <span>{controlled ? controllerLabel : viewerLabel}</span>
    </div>
    {controlled
      ? <button type="button" data-testid="ownership-action" disabled={!canRelease} onClick={onRelease}>{releaseLabel}</button>
      : <button type="button" className="primary" data-testid="ownership-action" disabled={!canAcquire} onClick={onAcquire}>{acquireLabel}</button>}
  </div>;
}

export function ReviewCard({ title, body, actionLabel, disabled, onReview }: {
  title: string; body: string; actionLabel: string; disabled: boolean; onReview: () => void;
}) {
  return <div className="review-card notice-card severity-info" data-testid="external-advance-notice" data-severity="info">
    <div className="notice-card-head">
      <AlertTriangle size={16} aria-hidden="true" />
      <strong>{title}</strong>
    </div>
    <p>{body}</p>
    <button type="button" className="primary" data-testid="external-review-action" disabled={disabled} onClick={onReview}>{actionLabel}</button>
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
      <ShieldAlert size={16} aria-hidden="true" />
      <strong>{statusLabel}</strong>
    </div>
    <p style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{summary}</p>
    <small>{meta}</small>
    {unsupportedHint ? <p className="muted">{unsupportedHint}</p> : null}
    {(canAllow || canDeny) && <div className="approval-actions">
      <button type="button" className="primary" disabled={!canAllow} onClick={onAllow}>{allowLabel}</button>
      <button type="button" disabled={!canDeny} onClick={onDeny}>{denyLabel}</button>
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
  return <button
    type="button"
    className={`session session-item ${selected ? 'selected' : ''}`}
    data-testid={testId ?? 'session-item'}
    data-connected={connected}
    onClick={onSelect}
  >
    <strong>{title}</strong>
    <span>{subtitle}</span>
    <small>{workspace}</small>
    <small className="session-item-status">
      {connected ? <CheckCircle2 size={12} aria-hidden="true" /> : <Circle size={12} aria-hidden="true" />}
      {status}
    </small>
  </button>;
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
      <dt>{workspaceLabel}</dt><dd>{workspace}</dd>
      <dt>{modelLabel}</dt><dd>{model}</dd>
      <dt>{stateLabel}</dt><dd>{state}</dd>
      <dt>{threadLabel}</dt><dd className="id">{threadShort}</dd>
    </dl>
    <p className="muted connect-body">{body}</p>
    <button type="button" className="primary" data-testid="connect-session" disabled={disabled} onClick={onConnect}>
      {actionLabel}
    </button>
  </div>;
}
