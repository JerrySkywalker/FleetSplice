import React from 'react';
import type { TimelinePresentationItem } from '../../../packages/contracts/realtime-timeline.ts';

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
      <span className={`tool-state ${running ? 'pulse' : ''}`}>{running ? <span className="tool-spinner" aria-hidden="true" /> : null}{stateLabel}</span>
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
      <span className={`ownership-dot ${controlled ? 'is-controller' : 'is-viewer'}`} aria-hidden="true" />
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
  return <div className="review-card severity-info" data-testid="external-advance-notice" data-severity="info">
    <strong>{title}</strong>
    <p>{body}</p>
    <button type="button" className="primary" data-testid="external-review-action" disabled={disabled} onClick={onReview}>{actionLabel}</button>
  </div>;
}
