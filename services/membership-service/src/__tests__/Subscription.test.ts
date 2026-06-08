import { Subscription } from '../domain/entities/Subscription';

describe('Subscription Entity', () => {
  it('should be active when status is active and endDate is in the future', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);

    const subscription = new Subscription({
      userId: 'user-1',
      planId: 'plan-1',
      status: 'active',
      startDate: new Date(),
      endDate: futureDate,
    });

    expect(subscription.isActive()).toBe(true);
  });

  it('should not be active when status is expired', () => {
    const subscription = new Subscription({
      userId: 'user-1',
      planId: 'plan-1',
      status: 'expired',
      startDate: new Date(),
      endDate: new Date(),
    });

    expect(subscription.isActive()).toBe(false);
  });

  it('should not be active when date has passed', () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 7);

    const subscription = new Subscription({
      userId: 'user-1',
      planId: 'plan-1',
      status: 'active',
      startDate: new Date('2026-01-01'),
      endDate: pastDate,
    });

    expect(subscription.isActive()).toBe(false);
  });

  it('should update endDate when renewed', () => {
    const subscription = new Subscription({
      userId: 'user-1',
      planId: 'plan-1',
      status: 'active',
      startDate: new Date(),
      endDate: new Date(),
    });

    const oldEndDate = subscription.endDate.getTime();
    subscription.renew(30);

    expect(subscription.endDate.getTime()).toBeGreaterThan(oldEndDate);
    expect(subscription.getStatus()).toBe('active');
  });
});
