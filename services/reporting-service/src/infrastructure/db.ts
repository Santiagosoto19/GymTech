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
    CREATE TABLE IF NOT EXISTS reports (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      type VARCHAR(20) NOT NULL CHECK (type IN ('revenue', 'attendance')),
      format VARCHAR(10) NOT NULL CHECK (format IN ('pdf', 'excel')),
      from_date TIMESTAMPTZ NOT NULL,
      to_date TIMESTAMPTZ NOT NULL,
      content_base64 TEXT,
      status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL,
      action VARCHAR(100) NOT NULL,
      resource VARCHAR(150) NOT NULL,
      details JSONB,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS revenue_entries (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      amount DECIMAL(10, 2) NOT NULL,
      source VARCHAR(100) NOT NULL,
      recorded_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS attendance_snapshots (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL,
      class_id UUID NOT NULL,
      class_name VARCHAR(150) NOT NULL,
      attended_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_reports_type ON reports(type);
    CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_revenue_recorded ON revenue_entries(recorded_at);
    CREATE INDEX IF NOT EXISTS idx_attendance_attended ON attendance_snapshots(attended_at);
  `);

  const revenueCount = await query<{ count: string }>(
    'SELECT COUNT(*)::text AS count FROM revenue_entries'
  );
  if (revenueCount.rows[0]?.count === '0') {
    await query(
      `INSERT INTO revenue_entries (amount, source, recorded_at) VALUES
         (49.99, 'membership', NOW() - INTERVAL '5 days'),
         (29.99, 'membership', NOW() - INTERVAL '3 days'),
         (15.00, 'class', NOW() - INTERVAL '1 day')`
    );
  }

  const attendanceCount = await query<{ count: string }>(
    'SELECT COUNT(*)::text AS count FROM attendance_snapshots'
  );
  if (attendanceCount.rows[0]?.count === '0') {
    await query(
      `INSERT INTO attendance_snapshots (user_id, class_id, class_name, attended_at) VALUES
         ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000010', 'Yoga Flow', NOW() - INTERVAL '2 days'),
         ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000011', 'HIIT Training', NOW() - INTERVAL '1 day')`
    );
  }
}

export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
