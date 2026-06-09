import { Request, Response, NextFunction } from 'express';
import { NotificationService } from '../../../domain/services/NotificationService';
import { AppError } from '../../../domain/errors/AppError';
import { NotificationChannel } from '../../../domain/entities/Notification';

export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  sendNotification = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { userId, type, channel, message } = req.body;

      if (!userId || !type || !channel || !message) {
        throw AppError.badRequest('userId, type, channel, and message are required');
      }

      const validChannels: NotificationChannel[] = ['email', 'sms', 'push'];
      if (!validChannels.includes(channel)) {
        throw AppError.badRequest('channel must be email, sms, or push');
      }

      const notification = await this.notificationService.send({
        userId,
        type,
        channel,
        message,
      });

      res.status(201).json({ success: true, data: notification.toJSON() });
    } catch (error) {
      next(error);
    }
  };

  getByUserId = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const notifications = await this.notificationService.getByUserId(req.params.userId);
      res.status(200).json({ success: true, data: notifications.map((n) => n.toJSON()) });
    } catch (error) {
      next(error);
    }
  };

  retryNotification = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const notification = await this.notificationService.retryById(req.params.id);
      res.status(200).json({ success: true, data: notification.toJSON() });
    } catch (error) {
      next(error);
    }
  };
}

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: { message: err.message, code: err.code },
    });
    return;
  }

  if (err.message.includes('required') || err.message.includes('must be')) {
    res.status(400).json({ success: false, error: { message: err.message } });
    return;
  }

  console.error('[notification-service]', err);
  res.status(500).json({
    success: false,
    error: { message: 'Internal server error' },
  });
}
