import dotenv from 'dotenv';

dotenv.config();

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const config = {
  port: parseInt(process.env.PORT || '3005', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  db: {
    host: requireEnv('DB_HOST'),
    port: parseInt(process.env.DB_PORT || '5432', 10),
    name: requireEnv('DB_NAME'),
    user: requireEnv('DB_USER'),
    password: requireEnv('DB_PASSWORD'),
  },
  retry: {
    intervalMs: parseInt(process.env.RETRY_INTERVAL_MS || '30000', 10),
    maxAttempts: parseInt(process.env.RETRY_MAX_ATTEMPTS || '5', 10),
  },
} as const;
