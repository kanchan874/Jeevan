const test = require('node:test');
const assert = require('node:assert');
const sseService = require('../services/sseService');

test('SSE Service - Initial active client count should be zero', () => {
  const count = sseService.getActiveClientCount();
  assert.strictEqual(typeof count, 'number');
  assert.strictEqual(count, 0);
});

test('SSE Service - Broadcast handles zero clients gracefully', () => {
  assert.doesNotThrow(() => {
    sseService.broadcastEvent('donor_status_changed', {
      donorId: 'test_123',
      bloodGroup: 'O+',
      isAvailable: true
    });
  });
});
