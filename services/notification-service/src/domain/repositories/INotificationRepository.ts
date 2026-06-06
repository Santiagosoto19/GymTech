import { Notification } from '../entities/Notification';

export interface INotificationRepository {
  create(notification: Notification): Promise<Notification>;
  findById(id: string): Promise<Notification | null>;
  findByUserId(userId: string): Promise<Notification[]>;
  findPendingRetries(now: Date): Promise<Notification[]>;
  update(notification: Notification): Promise<Notification>;
}
