import { Notification } from '../domain/entities/Notification';

describe('Notification Entity', () => {
  it('should create a notification with default status pending', () => {
    const notification = new Notification({
      userId: 'user-123',
      type: 'SUBSCRIPTION_EXPIRY',
      channel: 'email',
      message: 'Your subscription is about to expire!',
    });

    expect(notification.userId).toBe('user-123');
    expect(notification.status).toBe('pending');
    expect(notification.retryCount).toBe(0);
    expect(notification.nextRetryAt).toBeNull();
  });

  it('should throw if userId is missing', () => {
    expect(() => new Notification({
      userId: '',
      type: 'ALERT',
      channel: 'sms',
      message: 'Hello',
    })).toThrow('userId is required');
  });

  it('should throw if type is missing', () => {
    expect(() => new Notification({
      userId: 'user-1',
      type: '  ',
      channel: 'email',
      message: 'Hello',
    })).toThrow('type is required');
  });

  it('should throw if message is missing', () => {
    expect(() => new Notification({
      userId: 'user-1',
      type: 'ALERT',
      channel: 'push',
      message: '   ',
    })).toThrow('message is required');
  });

  it('should allow retry when status is failed and under max attempts', () => {
    const notification = new Notification({
      userId: 'user-1',
      type: 'ALERT',
      channel: 'email',
      message: 'Retry me',
      status: 'failed',
      retryCount: 2,
    });

    expect(notification.canRetry(5)).toBe(true);
  });

  it('should NOT allow retry when retryCount exceeds max', () => {
    const notification = new Notification({
      userId: 'user-1',
      type: 'ALERT',
      channel: 'email',
      message: 'No more retries',
      status: 'failed',
      retryCount: 5,
    });

    expect(notification.canRetry(5)).toBe(false);
  });

  it('should NOT allow retry when status is not failed', () => {
    const notification = new Notification({
      userId: 'user-1',
      type: 'ALERT',
      channel: 'email',
      message: 'Already sent',
      status: 'sent',
    });

    expect(notification.canRetry(5)).toBe(false);
  });
});