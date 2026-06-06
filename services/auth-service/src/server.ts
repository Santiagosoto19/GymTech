import { createApp } from './app';
import { config } from './config';
import { initSchema, closePool } from './infrastructure/db';

async function bootstrap(): Promise<void> {
  try {
    await initSchema();
    const app = createApp();

    const server = app.listen(config.port, () => {
      console.log(`Auth Service running on port ${config.port}`);
    });

    const shutdown = async (signal: string) => {
      console.log(`[auth-service] Received ${signal}, shutting down...`);
      server.close(async () => {
        await closePool();
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    console.error('[auth-service] Failed to start:', error);
    process.exit(1);
  }
}

bootstrap();
