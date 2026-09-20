import test from 'node:test';
import assert from 'node:assert/strict';
import { abbreviateModel, abbreviatePermission, abbreviateReasoning, compactConfigSummary } from '../apps/web/compact-config.ts';

test('compact config notation abbreviates observed labels', () => {
  assert.equal(abbreviateModel('gpt-5.6-terra'), '5.6T');
  assert.equal(abbreviateModel('Composer 2.5'), 'C2.5');
  assert.equal(abbreviateReasoning('medium'), 'MED');
  assert.equal(abbreviateReasoning('xhigh'), 'XHIGH');
  assert.equal(abbreviatePermission('dangerFullAccess approval=never'), 'YOLO');
  assert.equal(abbreviatePermission('read-only'), 'RO');
  assert.equal(compactConfigSummary({ model: 'gpt-5.6-terra', reasoning: 'medium', permission: 'YOLO' }), '5.6T · MED · YOLO');
  assert.equal(compactConfigSummary({ model: 'gpt-5.6-terra', reasoning: '', permission: 'YOLO' }), '5.6T · YOLO');
});
