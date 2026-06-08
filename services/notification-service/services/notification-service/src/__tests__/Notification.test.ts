import { Notification } from '../domain/entities/Notification';

describe('Notification Entity', () => {
  it('should create a notification successfully', () => {
    const notification = new Notification({
      userId: 'user-123',
      type: 'SUBSCRIPTION_EXPIRY',
      channel: 'email',
      message: 'Your subscription is about to expire!',
      createdAt: new Date(),
    });

    expect(notification.userId).toBe('user-123');
    expect(notification.message).toBe('Your subscription is about to expire!');
    expect(notification.status).toBe('pending');
  });
});
