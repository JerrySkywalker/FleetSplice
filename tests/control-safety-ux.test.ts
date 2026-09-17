import test from 'node:test';
import assert from 'node:assert/strict';
import {
  approvalResolveUnavailableLabel,
  controlSurfaceMode,
  externalAdvanceSeverity,
  observationSeverity,
  permissionPresentation,
  residualSeverity,
} from '../apps/web/control-safety-ux.ts';

test('YOLO / approval=never reads as normal permission state', () => {
  assert.equal(permissionPresentation('dangerFullAccess · approval=never', false).severity, 'info');
  assert.match(approvalResolveUnavailableLabel('dangerFullAccess · approval=never', false), /auto-approves|YOLO|approval=never/i);
  assert.doesNotMatch(approvalResolveUnavailableLabel('dangerFullAccess · approval=never', false), /APPROVAL_UNAVAILABLE/);
});

test('external advance is cooperative info; residual and recovery keep stronger severity', () => {
  assert.equal(externalAdvanceSeverity(), 'info');
  assert.equal(residualSeverity('MAY_STILL_BE_RUNNING'), 'attention');
  assert.equal(observationSeverity('NATIVE_EFFECT_UNKNOWN_NO_REPLAY'), 'danger');
});

test('control surface is context-sensitive', () => {
  assert.equal(controlSurfaceMode({ attached: false, controlled: true, externalAdvance: false, activeTurn: false, outcomeUnknown: false, viewer: false }), 'attach');
  assert.equal(controlSurfaceMode({ attached: true, controlled: true, externalAdvance: false, activeTurn: false, outcomeUnknown: false, viewer: false }), 'send');
  assert.equal(controlSurfaceMode({ attached: true, controlled: true, externalAdvance: false, activeTurn: true, outcomeUnknown: false, viewer: false }), 'steer_interrupt');
  assert.equal(controlSurfaceMode({ attached: true, controlled: true, externalAdvance: true, activeTurn: false, outcomeUnknown: false, viewer: false }), 'review');
  assert.equal(controlSurfaceMode({ attached: true, controlled: true, externalAdvance: false, activeTurn: false, outcomeUnknown: true, viewer: false }), 'receipt_lookup');
  assert.equal(controlSurfaceMode({ attached: true, controlled: false, externalAdvance: false, activeTurn: false, outcomeUnknown: false, viewer: true }), 'viewer');
});
