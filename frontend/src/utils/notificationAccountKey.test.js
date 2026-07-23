import test from 'node:test';
import assert from 'node:assert/strict';
import { getNotificationAccountKey } from './notificationAccountKey.js';

test('notification state is partitioned when accounts change', () => {
  const citizen1Key = getNotificationAccountKey({ id: 'citizen-1' }, 'token-1');
  const loggedOutKey = getNotificationAccountKey(null, null);
  const citizen2Key = getNotificationAccountKey({ id: 'citizen-2' }, 'token-2');

  assert.notEqual(citizen1Key, loggedOutKey);
  assert.notEqual(citizen1Key, citizen2Key);
  assert.notEqual(loggedOutKey, citizen2Key);
});

test('a replaced token remounts notification state for the same user', () => {
  assert.notEqual(
    getNotificationAccountKey({ userId: 'citizen-1' }, 'old-token'),
    getNotificationAccountKey({ userId: 'citizen-1' }, 'new-token')
  );
});
