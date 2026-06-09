/// <reference lib="webworker" />
import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheFirst, NetworkFirst } from 'workbox-strategies';

declare const self: ServiceWorkerGlobalScope & {
  __WB_MANIFEST: Array<{ url: string; revision: string | null }>;
};

precacheAndRoute(self.__WB_MANIFEST);

registerRoute(
  ({ request }) => request.destination === 'style' || request.destination === 'script' || request.destination === 'font',
  new CacheFirst({ cacheName: 'static-assets' })
);

registerRoute(
  ({ url }) => url.pathname.startsWith('/icons/'),
  new CacheFirst({ cacheName: 'icons' })
);

registerRoute(
  ({ url, request }) => url.pathname.startsWith('/api/v1/') && request.method === 'GET',
  new NetworkFirst({ cacheName: 'api-cache', networkTimeoutSeconds: 5 })
);

const DB_NAME = 'gymtech-offline';
const STORE_NAME = 'attendances_queue';

async function openOfflineDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('by-synced', 'synced');
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function enqueueInSW(record: Record<string, unknown>): Promise<void> {
  const db = await openOfflineDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put({ ...record, synced: 0 });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function getPendingFromSW(): Promise<Array<Record<string, unknown>>> {
  const db = await openOfflineDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const req = tx.objectStore(STORE_NAME).getAll();
    req.onsuccess = () => {
      const all = req.result as Array<Record<string, unknown> & { synced: number }>;
      resolve(all.filter((r) => r.synced === 0));
    };
    req.onerror = () => reject(req.error);
  });
}

async function markSyncedInSW(id: string): Promise<void> {
  const db = await openOfflineDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function drainAndSync(): Promise<void> {
  const pending = await getPendingFromSW();
  for (const record of pending) {
    try {
      const res = await fetch('/api/v1/membership/attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': record.idempotencyKey as string,
        },
        body: JSON.stringify({
          userId: record.userId,
          type: 'check_in',
        }),
      });
      if (res.ok || res.status === 409) {
        await markSyncedInSW(record.id as string);
      }
    } catch {
      /* retry on next sync */
    }
  }
  const clients = await self.clients.matchAll();
  clients.forEach((c) => c.postMessage({ type: 'QUEUE_UPDATED' }));
}

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  if (
    event.request.method === 'POST' &&
    url.pathname.includes('/membership/attendance')
  ) {
    event.respondWith(
      fetch(event.request.clone())
        .then((res) => res)
        .catch(async () => {
          const body = await event.request.clone().json();
          const id = crypto.randomUUID();
          const idempotencyKey =
            event.request.headers.get('Idempotency-Key') || crypto.randomUUID();

          await enqueueInSW({
            id,
            userId: body.userId,
            timestamp: new Date().toISOString(),
            idempotencyKey,
            synced: 0,
          });

          const clients = await self.clients.matchAll();
          clients.forEach((c) => c.postMessage({ type: 'QUEUE_UPDATED' }));

          return new Response(
            JSON.stringify({ queued: true, id, message: 'Guardado localmente' }),
            { status: 202, headers: { 'Content-Type': 'application/json' } }
          );
        })
    );
  }
});

self.addEventListener('sync', (event: Event) => {
  const syncEvent = event as SyncEvent;
  if (syncEvent.tag === 'sync-attendances') {
    syncEvent.waitUntil(drainAndSync());
  }
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'FLUSH_QUEUE') {
    event.waitUntil(drainAndSync());
  }
});
