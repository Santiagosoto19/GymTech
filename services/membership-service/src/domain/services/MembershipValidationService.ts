import { IMembershipPlanRepository } from '../repositories/IMembershipPlanRepository';
import { ISubscriptionRepository } from '../repositories/ISubscriptionRepository';
import { IAttendanceRepository } from '../repositories/IAttendanceRepository';
import { AppError } from '../errors/AppError';
import { Membership } from '../entities/Membership';
import { Subscription } from '../entities/Subscription';

export class MembershipValidationService {
  constructor(
    private readonly planRepository: IMembershipPlanRepository,
    private readonly subscriptionRepository: ISubscriptionRepository,
    private readonly attendanceRepository?: IAttendanceRepository
  ) {}

  async getPlanOrThrow(planId: string): Promise<Membership> {
    const plan = await this.planRepository.findById(planId);
    if (!plan) {
      throw AppError.notFound('Membership plan not found');
    }
    if (!plan.active) {
      throw AppError.badRequest('Membership plan is not active');
    }
    return plan;
  }

  async validateActiveSubscription(userId: string): Promise<Subscription> {
    const subscription = await this.subscriptionRepository.findActiveByUserId(userId);
    if (!subscription) {
      throw AppError.notFound('No active subscription found for this user');
    }
    if (!subscription.isActive()) {
      throw AppError.forbidden('Subscription is not valid for gym access');
    }
    return subscription;
  }

  async assertCanCheckIn(userId: string, currentOccupancy: number): Promise<Subscription> {
    const subscription = await this.validateActiveSubscription(userId);
    const plan = await this.getPlanOrThrow(subscription.planId);

    if (plan.maxOccupancy !== undefined && currentOccupancy >= plan.maxOccupancy) {
      throw AppError.forbidden('Gym has reached maximum occupancy');
    }

    if (plan.monthlyEntryLimit !== undefined && this.attendanceRepository) {
      const used = await this.attendanceRepository.countMonthlyEntriesUsed(userId);
      if (used >= plan.monthlyEntryLimit) {
        throw AppError.forbidden('Monthly entry limit reached');
      }
    }

    return subscription;
  }
}
