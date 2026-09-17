import test from 'node:test';
import assert from 'node:assert/strict';
import {
  advancePresentation,
  correlateProvisional,
  createProvisional,
  markOutcomeUnknown,
  shouldClearComposer,
} from '../apps/web/optimistic-command.ts';

test('local provisional starts as LOCAL_PENDING immediately', () => {
  const item = createProvisional('cmd-1', 'native.submit', 'hello', 100);
  assert.equal(item.state, 'LOCAL_PENDING');
  assert.equal(item.text, 'hello');
  assert.equal(item.createdAt, 100);
});

test('success without observation stays NATIVE_ACCEPTED; observation advances to OBSERVED', () => {
  assert.equal(advancePresentation('LOCAL_PENDING', { status: 'SUCCEEDED' }, false), 'NATIVE_ACCEPTED');
  assert.equal(advancePresentation('NATIVE_ACCEPTED', { status: 'SUCCEEDED' }, true), 'OBSERVED');
  assert.equal(shouldClearComposer('NATIVE_ACCEPTED'), true);
});

test('rejection before effect and ambiguous outcomes stay failure-honest', () => {
  assert.equal(advancePresentation('LOCAL_PENDING', { status: 'REJECTED' }, false), 'REJECTED');
  assert.equal(advancePresentation('LOCAL_PENDING', { status: 'AMBIGUOUS_EFFECT' }, false), 'AMBIGUOUS_EFFECT');
  assert.equal(shouldClearComposer('REJECTED'), false);
  assert.equal(shouldClearComposer('AMBIGUOUS_EFFECT'), false);
});

test('lost response marks OUTCOME_UNKNOWN without fabricating success', () => {
  assert.equal(markOutcomeUnknown('LOCAL_PENDING'), 'OUTCOME_UNKNOWN');
  assert.equal(markOutcomeUnknown('NATIVE_ACCEPTED'), 'OUTCOME_UNKNOWN');
  assert.equal(markOutcomeUnknown('OBSERVED'), 'OBSERVED');
  assert.equal(advancePresentation('OUTCOME_UNKNOWN', null, false), 'OUTCOME_UNKNOWN');
});

test('provisional correlates exact Web source identity and text', () => {
  const provisional = createProvisional('cmd-1', 'native.submit', 'exact text');
  assert.equal(correlateProvisional(provisional, [
    { role: 'user', text: 'exact text', source: { kind: 'NATIVE_EXTERNAL' } },
  ], 'client-a'), false);
  assert.equal(correlateProvisional(provisional, [
    { role: 'user', text: 'exact text', source: { kind: 'FLEETSPLICE_WEB', clientInstanceId: 'client-a' } },
  ], 'client-a'), true);
});
