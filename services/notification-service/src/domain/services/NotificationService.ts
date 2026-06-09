import { Notification, NotificationChannel } from '../entities/Notification';
import { AppError } from '../errors/AppError';
import { INotificationRepository } from '../repositories/INotificationRepository';

export class NotificationService {
  private retryTimer: ReturnType<typeof setInterval> | null = null;

  constructor(
    private readonly notificationRepository: INotificationRepository,
    private readonly retryIntervalMs: number,
    private readonly maxRetryAttempts: number
  ) {}

  startRetryWorker(): void {
    if (this.retryTimer) {
      return;
    }

    this.retryTimer = setInterval(() => {
      this.processRetryQueue().catch((err) => {
        console.error('[notification-service] Retry worker error:', err);
      });
    }, this.retryIntervalMs);

    console.log(`[notification-service] Retry worker started (interval: ${this.retryIntervalMs}ms)`);
  }

  stopRetryWorker(): void {
    if (this.retryTimer) {
      clearInterval(this.retryTimer);
      this.retryTimer = null;
    }
  }

  async send(data: {
    userId: string;
    type: string;
    channel: NotificationChannel;
    message: string;
  }): Promise<Notification> {
    const notification = new Notification({
      userId: data.userId,
      type: data.type,
      channel: data.channel,
      message: data.message,
      status: 'pending',
    });

    const saved = await this.notificationRepository.create(notification);
    return this.dispatch(saved);
  }

  async getByUserId(userId: string): Promise<Notification[]> {
    return this.notificationRepository.findByUserId(userId);
  }

  async retryById(id: string): Promise<Notification> {
    const notification = await this.notificationRepository.findById(id);
    if (!notification) {
      throw AppError.notFound('Notification not found');
    }

    if (!notification.canRetry(this.maxRetryAttempts)) {
      throw AppError.badRequest('Notification cannot be retried');
    }

    notification.status = 'pending';
    notification.nextRetryAt = new Date();
    const updated = await this.notificationRepository.update(notification);
    return this.dispatch(updated);
  }

  async processRetryQueue(): Promise<void> {
    const pending = await this.notificationRepository.findPendingRetries(new Date());

    for (const notification of pending) {
      await this.dispatch(notification);
    }
  }

  private async dispatch(notification: Notification): Promise<Notification> {
    try {
      await this.simulateDelivery(notification);
      notification.status = 'sent';
      notification.nextRetryAt = null;
      notification.updatedAt = new Date();
      return this.notificationRepository.update(notification);
    } catch {
      notification.status = 'failed';
      notification.retryCount += 1;
      notification.nextRetryAt = new Date(Date.now() + this.retryIntervalMs);
      notification.updatedAt = new Date();
      return this.notificationRepository.update(notification);
    }
  }

  private async simulateDelivery(notification: Notification): Promise<void> {
    console.log(
      `[Notification] Sending ${notification.type} via ${notification.channel} to ${notification.userId}`
    );

    if (notification.message.includes('[FAIL]')) {
      throw new Error('Simulated delivery failure');
    }
  }
}
