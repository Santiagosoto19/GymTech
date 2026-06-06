import cron from 'node-cron';
import { createApp } from './app';
import { config } from './config';
import { initSchema, closePool } from './infrastructure/db';

async function bootstrap(): Promise<void> {
  try {
    await initSchema();
    const { app, controller } = createApp();

    cron.schedule(config.cron.expireSubscriptions, async () => {
      try {
        await controller.getRenewalService().expireOverdueSubscriptions();
      } catch (error) {
        console.error('[membership-service] Cron job failed:', error);
      }
    });

    const server = app.listen(config.port, () => {
      console.log(`Membership Service running on port ${config.port}`);
      console.log(`[membership-service] Subscription expiry cron: ${config.cron.expireSubscriptions}`);
    });

    const shutdown = async (signal: string) => {
      console.log(`[membership-service] Received ${signal}, shutting down...`);
      server.close(async () => {
        await closePool();
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    console.error('[membership-service] Failed to start:', error);
    process.exit(1);
  }
}

bootstrap();
