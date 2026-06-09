import { ISubscriptionRepository } from '../repositories/ISubscriptionRepository';
import { IMembershipPlanRepository } from '../repositories/IMembershipPlanRepository';
import { Subscription } from '../entities/Subscription';
import { AppError } from '../errors/AppError';

export class SubscriptionRenewalService {
  constructor(
    private readonly subscriptionRepository: ISubscriptionRepository,
    private readonly planRepository: IMembershipPlanRepository
  ) {}

  async createSubscription(userId: string, planId: string): Promise<Subscription> {
    const plan = await this.planRepository.findById(planId);
    if (!plan || !plan.active) {
      throw AppError.notFound('Membership plan not found');
    }

    const existing = await this.subscriptionRepository.findActiveByUserId(userId);
    if (existing) {
      throw AppError.conflict('User already has an active subscription');
    }

    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + plan.durationDays * 24 * 60 * 60 * 1000);

    const subscription = new Subscription({
      userId,
      planId,
      status: 'active',
      startDate,
      endDate,
    });

    return this.subscriptionRepository.save(subscription);
  }

  async renewSubscription(subscriptionId: string): Promise<Subscription> {
    const subscription = await this.subscriptionRepository.findById(subscriptionId);
    if (!subscription) {
      throw AppError.notFound('Subscription not found');
    }

    const plan = await this.planRepository.findById(subscription.planId);
    if (!plan) {
      throw AppError.notFound('Associated plan not found');
    }

    subscription.renew(plan.durationDays);
    return this.subscriptionRepository.update(subscription);
  }

  async expireOverdueSubscriptions(): Promise<number> {
    const count = await this.subscriptionRepository.expireOverdue();
    if (count > 0) {
      console.log(`[membership-service] Marked ${count} subscription(s) as expired`);
    }
    return count;
  }
}
