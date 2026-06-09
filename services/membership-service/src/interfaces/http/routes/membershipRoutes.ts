import { Router } from 'express';
import { MembershipController } from '../controllers/membershipController';
import { requireRoles } from '../middlewares/requireRoles';

export function createMembershipRoutes(controller: MembershipController): Router {
  const router = Router();
  const staff = requireRoles('admin', 'receptionist');

  router.get('/plans', controller.listPlans);
  router.post('/plans', requireRoles('admin'), controller.createPlan);

  router.get('/subscriptions', staff, controller.listSubscriptions);
  router.post('/subscriptions', staff, controller.createSubscription);
  router.patch('/subscriptions/:id/status', staff, controller.updateSubscriptionStatus);
  router.get('/subscriptions/validate/:userId', controller.validateSubscription);

  router.get('/occupancy/live', controller.getLiveOccupancy);
  router.post('/attendance', staff, controller.recordAttendance);

  router.post('/payments', staff, controller.recordPayment);
  router.get('/payments', staff, controller.listPayments);

  router.get('/dashboard/stats', requireRoles('admin'), controller.getDashboardStats);

  return router;
}
