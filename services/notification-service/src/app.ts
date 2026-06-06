import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { NotificationService } from './domain/services/NotificationService';
import { NotificationRepository } from './infrastructure/repositories/NotificationRepository';
import { NotificationController, errorHandler } from './interfaces/http/controllers/notificationController';
import { createNotificationRoutes } from './interfaces/http/routes/notificationRoutes';
import { config } from './config';

export function createApp(): { app: express.Application; notificationService: NotificationService } {
  const app = express();

  const notificationRepository = new NotificationRepository();
  const notificationService = new NotificationService(
    notificationRepository,
    config.retry.intervalMs,
    config.retry.maxAttempts
  );

  const controller = new NotificationController(notificationService);

  app.use(helmet());
  app.use(cors());
  app.use(morgan('combined'));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'UP', service: 'notification-service' });
  });

  app.use('/api/v1/notification', createNotificationRoutes(controller));
  app.use(errorHandler);

  return { app, notificationService };
}
