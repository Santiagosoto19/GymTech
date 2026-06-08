import { openDB, type IDBPDatabase } from 'idb';

export interface AttendanceRecord {
  id: string;
  userId: string;
  timestamp: string;
  idempotencyKey: string;
  synced: number;
}

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDB(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB('gymtech-offline', 1, {
      upgrade(db) {
        const store = db.createObjectStore('attendances_queue', { keyPath: 'id' });
        store.createIndex('by-synced', 'synced');
      },
    });
  }
  return dbPromise;
}

export async function enqueueAttendance(
  record: Omit<AttendanceRecord, 'synced'>
): Promise<void> {
  const db = await getDB();
  await db.put('attendances_queue', { ...record, synced: 0 });
}

export async function getPendingAttendances(): Promise<AttendanceRecord[]> {
  const db = await getDB();
  const all = (await db.getAll('attendances_queue')) as AttendanceRecord[];
  return all.filter((r) => r.synced === 0);
}

export async function getPendingCount(): Promise<number> {
  const pending = await getPendingAttendances();
  return pending.length;
}

export async function markSynced(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('attendances_queue', id);
}

export async function drainQueue(): Promise<AttendanceRecord[]> {
  return getPendingAttendances();
}
