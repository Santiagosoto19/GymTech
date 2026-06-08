import { Request, Response, NextFunction } from 'express';
import { Membership } from '../../../domain/entities/Membership';
import { Attendance } from '../../../domain/entities/Attendance';
import { AppError } from '../../../domain/errors/AppError';
import { MembershipPlanRepository } from '../../../infrastructure/repositories/MembershipPlanRepository';
import { SubscriptionRepository } from '../../../infrastructure/repositories/SubscriptionRepository';
import { AttendanceRepository } from '../../../infrastructure/repositories/AttendanceRepository';
import { PaymentRepository } from '../../../infrastructure/repositories/PaymentRepository';
import { SubscriptionStatus } from '../../../domain/entities/Subscription';
import { MembershipValidationService } from '../../../domain/services/MembershipValidationService';
import { SubscriptionRenewalService } from '../../../domain/services/SubscriptionRenewalService';

export class MembershipController {
  private readonly planRepo = new MembershipPlanRepository();
  private readonly subscriptionRepo = new SubscriptionRepository();
  private readonly attendanceRepo = new AttendanceRepository();
  private readonly paymentRepo = new PaymentRepository();
  private readonly validationService = new MembershipValidationService(
    this.planRepo,
    this.subscriptionRepo,
    this.attendanceRepo
  );
  private readonly renewalService = new SubscriptionRenewalService(
    this.subscriptionRepo,
    this.planRepo
  );

  listPlans = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const plans = await this.planRepo.findAll();
      res.status(200).json({ success: true, data: plans.map((p) => p.toJSON()) });
    } catch (error) {
      next(error);
    }
  };

  createPlan = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { name, description, price, durationDays, maxOccupancy, monthlyEntryLimit } = req.body;
      const plan = new Membership({
        name,
        description,
        price: parseFloat(price),
        durationDays: parseInt(durationDays, 10),
        maxOccupancy: maxOccupancy ? parseInt(maxOccupancy, 10) : undefined,
        monthlyEntryLimit: monthlyEntryLimit ? parseInt(monthlyEntryLimit, 10) : undefined,
      });
      const saved = await this.planRepo.save(plan);
      res.status(201).json({ success: true, data: saved.toJSON() });
    } catch (error) {
      next(error);
    }
  };

  listSubscriptions = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const subscriptions = await this.subscriptionRepo.findAll();
      res.status(200).json({ success: true, data: subscriptions.map((s) => s.toJSON()) });
    } catch (error) {
      next(error);
    }
  };

  createSubscription = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { userId, planId } = req.body;
      if (!userId || !planId) {
        throw AppError.badRequest('userId and planId are required');
      }
      const subscription = await this.renewalService.createSubscription(userId, planId);
      res.status(201).json({ success: true, data: subscription.toJSON() });
    } catch (error) {
      next(error);
    }
  };

  validateSubscription = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const subscription = await this.validationService.validateActiveSubscription(req.params.userId);
      res.status(200).json({
        success: true,
        data: {
          valid: true,
          subscription: subscription.toJSON(),
        },
      });
    } catch (error) {
      next(error);
    }
  };

  private async buildAttendanceStats(userId: string) {
    const monthlyCheckIns = await this.attendanceRepo.countMonthlyCheckIns(userId);
    const entriesUsed = await this.attendanceRepo.countMonthlyEntriesUsed(userId);
    const isCheckedIn = await this.attendanceRepo.hasOpenSession(userId);
    const subscription = await this.subscriptionRepo.findActiveByUserId(userId);
    let limit: number | null = null;
    if (subscription) {
      const plan = await this.planRepo.findById(subscription.planId);
      limit = plan?.monthlyEntryLimit ?? null;
    }
    const remainingEntries = limit !== null ? Math.max(0, limit - entriesUsed) : null;
    return { monthlyCheckIns, monthlyEntryLimit: limit, remainingEntries, isCheckedIn };
  }

  getAttendanceStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const stats = await this.buildAttendanceStats(req.params.userId);
      res.status(200).json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  };

  getLiveOccupancy = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const current = await this.attendanceRepo.countLiveOccupancy();
      const plans = await this.planRepo.findAll();
      const max = plans.reduce((m, p) => Math.max(m, p.maxOccupancy ?? 100), 100);
      res.status(200).json({
        success: true,
        data: { current, max, timestamp: new Date().toISOString() },
      });
    } catch (error) {
      next(error);
    }
  };

  recordAttendance = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const idempotencyKey = req.headers['idempotency-key'] as string | undefined;
      if (!idempotencyKey) {
        throw AppError.badRequest('Idempotency-Key header is required');
      }

      const existing = await this.attendanceRepo.findByIdempotencyKey(idempotencyKey);
      if (existing) {
        const occupancy = await this.attendanceRepo.countLiveOccupancy();
        const stats = await this.buildAttendanceStats(existing.userId);
        res.status(200).json({
          success: true,
          data: { attendance: existing.toJSON(), occupancy, stats, duplicate: true },
        });
        return;
      }

      const { userId, type = 'check_in' } = req.body;
      if (!userId) {
        throw AppError.badRequest('userId is required');
      }
      if (!['check_in', 'check_out'].includes(type)) {
        throw AppError.badRequest('type must be check_in or check_out');
      }

      let subscriptionId: string | undefined;

      if (type === 'check_in') {
        const occupancy = await this.attendanceRepo.countLiveOccupancy();
        const subscription = await this.validationService.assertCanCheckIn(userId, occupancy);
        subscriptionId = subscription.id;

        const hasOpen = await this.attendanceRepo.hasOpenSession(userId);
        if (hasOpen) {
          throw AppError.conflict('User already checked in');
        }
      } else {
        const hasOpen = await this.attendanceRepo.hasOpenSession(userId);
        if (!hasOpen) {
          throw AppError.badRequest('User is not checked in');
        }
      }

      const attendance = new Attendance({
        userId,
        type,
        idempotencyKey,
        subscriptionId,
      });

      const saved = await this.attendanceRepo.save(attendance);
      const occupancy = await this.attendanceRepo.countLiveOccupancy();
      const stats = await this.buildAttendanceStats(userId);

      res.status(201).json({
        success: true,
        data: { attendance: saved.toJSON(), occupancy, stats, duplicate: false },
      });
    } catch (error) {
      next(error);
    }
  };

  updateSubscriptionStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { status } = req.body as { status: SubscriptionStatus };
      if (!['active', 'suspended', 'canceled', 'expired'].includes(status)) {
        throw AppError.badRequest('Invalid subscription status');
      }
      const subscription = await this.subscriptionRepo.findById(req.params.id);
      if (!subscription) {
        throw AppError.notFound('Subscription not found');
      }
      if (status === 'suspended') subscription.suspend();
      else if (status === 'canceled') subscription.cancel();
      else if (status === 'expired') subscription.expire();
      else subscription.activate();
      const updated = await this.subscriptionRepo.update(subscription);
      res.status(200).json({ success: true, data: updated.toJSON() });
    } catch (error) {
      next(error);
    }
  };

  recordPayment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { userId, planId, amount, method } = req.body;
      if (!userId || amount === undefined) {
        throw AppError.badRequest('userId and amount are required');
      }
      const payment = await this.paymentRepo.create({
        userId,
        planId,
        amount: parseFloat(amount),
        method: method || 'cash',
        recordedBy: req.headers['x-user-id'] as string,
      });
      res.status(201).json({ success: true, data: payment });
    } catch (error) {
      next(error);
    }
  };

  listPayments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { fromDate, toDate } = req.query;
      if (!fromDate || !toDate) {
        throw AppError.badRequest('fromDate and toDate query params are required');
      }
      const payments = await this.paymentRepo.findByDateRange(
        new Date(fromDate as string),
        new Date(toDate as string)
      );
      res.status(200).json({ success: true, data: payments });
    } catch (error) {
      next(error);
    }
  };

  getDashboardStats = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const occupancy = await this.attendanceRepo.countLiveOccupancy();
      const monthlyRevenue = await this.paymentRepo.getMonthlyTotal();
      const subscriptions = await this.subscriptionRepo.findAll();
      const active = subscriptions.filter((s) => s.getStatus() === 'active').length;
      const expired = subscriptions.filter((s) => s.getStatus() === 'expired').length;
      const churnRate = active + expired > 0 ? Math.round((expired / (active + expired)) * 100) : 0;
      res.status(200).json({
        success: true,
        data: { occupancy, monthlyRevenue, churnRate, activeSubscriptions: active },
      });
    } catch (error) {
      next(error);
    }
  };

  getRenewalService(): SubscriptionRenewalService {
    return this.renewalService;
  }
}

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: { message: err.message, code: err.code },
    });
    return;
  }

  if (err.message.includes('required') || err.message.includes('must be') || err.message.includes('Invalid')) {
    res.status(400).json({ success: false, error: { message: err.message } });
    return;
  }

  console.error('[membership-service]', err);
  res.status(500).json({
    success: false,
    error: { message: 'Internal server error' },
  });
}
