import {
  Notification,
  NotificationChannel,
  NotificationStatus,
} from '../../domain/entities/Notification';
import { INotificationRepository } from '../../domain/repositories/INotificationRepository';
import { query } from '../db';

interface NotificationRow {
  id: string;
  user_id: string;
  type: string;
  channel: NotificationChannel;
  message: string;
  status: NotificationStatus;
  retry_count: number;
  next_retry_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

function mapRow(row: NotificationRow): Notification {
  return new Notification({
    id: row.id,
    userId: row.user_id,
    type: row.type,
    channel: row.channel,
    message: row.message,
    status: row.status,
    retryCount: row.retry_count,
    nextRetryAt: row.next_retry_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  });
}

export class NotificationRepository implements INotificationRepository {
  async create(notification: Notification): Promise<Notification> {
    const { rows } = await query<NotificationRow>(
      `INSERT INTO notifications (user_id, type, channel, message, status, retry_count, next_retry_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [
        notification.userId,
        notification.type,
        notification.channel,
        notification.message,
        notification.status,
        notification.retryCount,
        notification.nextRetryAt,
      ]
    );
    return mapRow(rows[0]);
  }

  async findById(id: string): Promise<Notification | null> {
    const { rows } = await query<NotificationRow>(
      'SELECT * FROM notifications WHERE id = $1',
      [id]
    );
    return rows[0] ? mapRow(rows[0]) : null;
  }

  async findByUserId(userId: string): Promise<Notification[]> {
    const { rows } = await query<NotificationRow>(
      'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    return rows.map(mapRow);
  }

  async findPendingRetries(now: Date): Promise<Notification[]> {
    const { rows } = await query<NotificationRow>(
      `SELECT * FROM notifications
       WHERE status IN ('pending', 'failed')
         AND (next_retry_at IS NULL OR next_retry_at <= $1)
       ORDER BY created_at ASC
       LIMIT 50`,
      [now]
    );
    return rows.map(mapRow);
  }

  async update(notification: Notification): Promise<Notification> {
    const { rows } = await query<NotificationRow>(
      `UPDATE notifications
       SET status = $1, retry_count = $2, next_retry_at = $3, updated_at = NOW()
       WHERE id = $4 RETURNING *`,
      [
        notification.status,
        notification.retryCount,
        notification.nextRetryAt,
        notification.id,
      ]
    );
    return mapRow(rows[0]);
  }
}
