import { Router } from 'express';
import { NotificationController } from '../controllers/notificationController';

export function createNotificationRoutes(controller: NotificationController): Router {
  const router = Router();

  router.post('/notifications', controller.sendNotification);
  router.get('/notifications/:userId', controller.getByUserId);
  router.patch('/notifications/:id/retry', controller.retryNotification);

  return router;
}
