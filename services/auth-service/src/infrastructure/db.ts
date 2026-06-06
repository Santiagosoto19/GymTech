import { Pool, PoolClient } from 'pg';
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

export async function withTransaction<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await getPool().connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function initSchema(): Promise<void> {
  await query(`
    CREATE TABLE IF NOT EXISTS roles (
      id SERIAL PRIMARY KEY,
      name VARCHAR(50) UNIQUE NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      document_number VARCHAR(20) UNIQUE NOT NULL,
      role VARCHAR(50) NOT NULL REFERENCES roles(name),
      status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
      first_name VARCHAR(100),
      last_name VARCHAR(100),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_users_document_number ON users(document_number);
    CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
  `);

  const roles = ['admin', 'receptionist', 'trainer', 'client'];
  for (const role of roles) {
    await query(
      `INSERT INTO roles (name) VALUES ($1) ON CONFLICT (name) DO NOTHING`,
      [role]
    );
  }

  const bcrypt = await import('bcryptjs');
  const defaultPassword = 'gymtech123';
  const hash = await bcrypt.hash(defaultPassword, 10);

  const demoUsers = [
    { email: 'admin@gymtech.local', document: 'ADMIN-001', role: 'admin', firstName: 'System', lastName: 'Admin', password: 'admin123' },
    { email: 'recepcion@gymtech.local', document: 'REC-001', role: 'receptionist', firstName: 'Ana', lastName: 'Recepción' },
    { email: 'entrenador@gymtech.local', document: 'TRN-001', role: 'trainer', firstName: 'Carlos', lastName: 'Entrenador' },
    { email: 'cliente@gymtech.local', document: 'CLI-001', role: 'client', firstName: 'María', lastName: 'Cliente' },
  ];

  for (const user of demoUsers) {
    const userHash = await bcrypt.hash(user.password ?? defaultPassword, 10);
    await query(
      `INSERT INTO users (email, password_hash, document_number, role, status, first_name, last_name)
       VALUES ($1, $2, $3, $4, 'active', $5, $6)
       ON CONFLICT (email) DO NOTHING`,
      [user.email, userHash, user.document, user.role, user.firstName, user.lastName]
    );
  }

  console.log('[auth-service] Demo users ready (password: gymtech123, admin: admin123)');
}

export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
