import {
  drainQueue,
  markSynced,
  getPendingCount,
  type AttendanceRecord,
} from './indexeddb';
import { isOnline, onNetworkChange } from './network';

const API_BASE = '/api/v1';

type SyncListener = (count: number) => void;
const listeners = new Set<SyncListener>();

function notify(count: number): void {
  listeners.forEach((cb) => cb(count));
}

export function onSyncChange(cb: SyncListener): () => void {
  listeners.add(cb);
  getPendingCount().then(notify);
  return () => listeners.delete(cb);
}

async function syncRecord(record: AttendanceRecord): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/membership/attendance`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Idempotency-Key': record.idempotencyKey,
        Authorization: `Bearer ${localStorage.getItem('gymtech_token') || ''}`,
      },
      body: JSON.stringify({
        userId: record.userId,
        type: 'check_in',
      }),
    });

    if (res.ok || res.status === 409) {
      await markSynced(record.id);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export async function flushQueue(): Promise<void> {
  if (!isOnline()) return;

  const pending = await drainQueue();
  for (const record of pending) {
    await syncRecord(record);
  }

  const count = await getPendingCount();
  notify(count);

  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({ type: 'SYNC_COMPLETE' });
  }
}

export function initSyncQueue(): void {
  onNetworkChange((online) => {
    if (online) flushQueue();
  });

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data?.type === 'QUEUE_UPDATED') {
        getPendingCount().then(notify);
      }
    });
  }

  if (isOnline()) flushQueue();
}

export async function registerBackgroundSync(): Promise<void> {
  if ('serviceWorker' in navigator) {
    const reg = await navigator.serviceWorker.ready;
    if ('sync' in reg) {
      await (reg as ServiceWorkerRegistration & { sync: { register: (tag: string) => Promise<void> } }).sync.register('sync-attendances');
    }
  }
}
