export type NotificationStatus = 'pending' | 'sent' | 'failed';
export type NotificationChannel = 'email' | 'sms' | 'push';

export interface NotificationProps {
  id?: string;
  userId: string;
  type: string;
  channel: NotificationChannel;
  message: string;
  status?: NotificationStatus;
  retryCount?: number;
  nextRetryAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Notification {
  readonly id?: string;
  userId: string;
  type: string;
  channel: NotificationChannel;
  message: string;
  status: NotificationStatus;
  retryCount: number;
  nextRetryAt: Date | null;
  readonly createdAt?: Date;
  updatedAt?: Date;

  constructor(props: NotificationProps) {
    if (!props.userId) {
      throw new Error('userId is required');
    }
    if (!props.type?.trim()) {
      throw new Error('type is required');
    }
    if (!props.message?.trim()) {
      throw new Error('message is required');
    }

    this.id = props.id;
    this.userId = props.userId;
    this.type = props.type.trim();
    this.channel = props.channel;
    this.message = props.message.trim();
    this.status = props.status ?? 'pending';
    this.retryCount = props.retryCount ?? 0;
    this.nextRetryAt = props.nextRetryAt ?? null;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  canRetry(maxAttempts: number): boolean {
    return this.status === 'failed' && this.retryCount < maxAttempts;
  }

  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      type: this.type,
      channel: this.channel,
      message: this.message,
      status: this.status,
      retryCount: this.retryCount,
      nextRetryAt: this.nextRetryAt?.toISOString() ?? null,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
