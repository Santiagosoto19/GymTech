import { createApp } from './app';
import { config } from './config';
import { initSchema, closePool } from './infrastructure/db';

async function bootstrap(): Promise<void> {
  try {
    await initSchema();
    const { app, notificationService } = createApp();

    notificationService.startRetryWorker();

    const server = app.listen(config.port, () => {
      console.log(`Notification Service running on port ${config.port}`);
    });

    const shutdown = async (signal: string) => {
      console.log(`[notification-service] Received ${signal}, shutting down...`);
      notificationService.stopRetryWorker();
      server.close(async () => {
        await closePool();
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    console.error('[notification-service] Failed to start:', error);
    process.exit(1);
  }
}

bootstrap();
