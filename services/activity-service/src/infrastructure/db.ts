import { Pool } from 'pg';
import { config } from '../config';

let pool: Pool | null = null;

export function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      host: config.db.host,
      port: config.db.port,
      database: config.db.name,
      user: config.db.user,
      password: config.db.password,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });
  }
  return pool;
}

export async function query<T = Record<string, unknown>>(
  text: string,
  params?: unknown[]
): Promise<{ rows: T[]; rowCount: number | null }> {
  const result = await getPool().query(text, params);
  return { rows: result.rows as T[], rowCount: result.rowCount };
}

export async function initSchema(): Promise<void> {
  await query(`
    CREATE TABLE IF NOT EXISTS gym_classes (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(150) NOT NULL,
      description TEXT,
      instructor VARCHAR(150) NOT NULL,
      capacity INTEGER NOT NULL CHECK (capacity > 0),
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS schedules (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      class_id UUID NOT NULL REFERENCES gym_classes(id) ON DELETE CASCADE,
      start_time TIMESTAMPTZ NOT NULL,
      end_time TIMESTAMPTZ NOT NULL,
      room VARCHAR(100) NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      CHECK (end_time > start_time)
    );

    CREATE TABLE IF NOT EXISTS routines (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(150) NOT NULL,
      description TEXT,
      exercises JSONB NOT NULL DEFAULT '[]',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS routine_assignments (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      routine_id UUID NOT NULL REFERENCES routines(id) ON DELETE CASCADE,
      user_id UUID NOT NULL,
      assigned_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS class_reservations (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      class_id UUID NOT NULL REFERENCES gym_classes(id) ON DELETE CASCADE,
      user_id UUID NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE (class_id, user_id)
    );

    CREATE TABLE IF NOT EXISTS attendance_records (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL,
      class_id UUID NOT NULL REFERENCES gym_classes(id) ON DELETE CASCADE,
      idempotency_key VARCHAR(255) UNIQUE NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_schedules_room_time ON schedules(room, start_time, end_time);
    CREATE INDEX IF NOT EXISTS idx_reservations_class ON class_reservations(class_id);
    CREATE INDEX IF NOT EXISTS idx_attendance_idempotency ON attendance_records(idempotency_key);

    CREATE TABLE IF NOT EXISTS trainer_client_assignments (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      trainer_id UUID NOT NULL,
      client_id UUID NOT NULL,
      assigned_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE (trainer_id, client_id)
    );

    ALTER TABLE routines ADD COLUMN IF NOT EXISTS difficulty_level VARCHAR(20) DEFAULT 'beginner';
    ALTER TABLE routines ADD COLUMN IF NOT EXISTS created_by UUID;
  `);
}

export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
