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
    CREATE TABLE IF NOT EXISTS membership_plans (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(150) NOT NULL,
      description TEXT,
      price DECIMAL(10, 2) NOT NULL,
      duration_days INTEGER NOT NULL,
      max_occupancy INTEGER,
      monthly_entry_limit INTEGER,
      active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    ALTER TABLE membership_plans
      ADD COLUMN IF NOT EXISTS monthly_entry_limit INTEGER;

    UPDATE membership_plans SET monthly_entry_limit = 12
      WHERE name = 'Basic Monthly' AND monthly_entry_limit IS NULL;
    UPDATE membership_plans SET monthly_entry_limit = 20
      WHERE name = 'Premium Monthly' AND monthly_entry_limit IS NULL;

    CREATE TABLE IF NOT EXISTS subscriptions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL,
      plan_id UUID NOT NULL REFERENCES membership_plans(id),
      status VARCHAR(20) NOT NULL CHECK (status IN ('expired', 'active', 'suspended', 'canceled')),
      start_date TIMESTAMPTZ NOT NULL,
      end_date TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS attendance_records (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL,
      subscription_id UUID REFERENCES subscriptions(id),
      event_type VARCHAR(20) NOT NULL CHECK (event_type IN ('check_in', 'check_out')),
      idempotency_key VARCHAR(255) UNIQUE NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
    CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
    CREATE INDEX IF NOT EXISTS idx_subscriptions_end_date ON subscriptions(end_date);
    CREATE INDEX IF NOT EXISTS idx_attendance_user_id ON attendance_records(user_id, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_attendance_idempotency ON attendance_records(idempotency_key);

    CREATE TABLE IF NOT EXISTS payment_transactions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL,
      plan_id UUID REFERENCES membership_plans(id),
      amount DECIMAL(10, 2) NOT NULL,
      method VARCHAR(50) NOT NULL DEFAULT 'cash',
      recorded_by UUID,
      recorded_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_payments_recorded ON payment_transactions(recorded_at);
  `);

  const planCount = await query<{ count: string }>(
    `SELECT COUNT(*)::text AS count FROM membership_plans`
  );
  if (planCount.rows[0]?.count === '0') {
    await query(
      `INSERT INTO membership_plans (name, description, price, duration_days, max_occupancy, monthly_entry_limit)
       VALUES
         ('Basic Monthly', 'Access to gym floor and cardio equipment', 29.99, 30, 100, 12),
         ('Premium Monthly', 'Full access including classes and sauna', 49.99, 30, 150, 20),
         ('Annual Pass', 'Best value yearly membership', 299.99, 365, 200, NULL)`
    );
    console.log('[membership-service] Default membership plans seeded');
  }
}

export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
