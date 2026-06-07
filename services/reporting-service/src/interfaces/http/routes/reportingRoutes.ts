import { Router } from 'express';
import { ReportingController } from '../controllers/reportingController';
import { requireAdmin } from '../middlewares/requireAdmin';

export function createReportingRoutes(controller: ReportingController): Router {
  const router = Router();

  router.post('/reports/revenue', requireAdmin, controller.generateRevenueReport);
  router.post('/reports/attendance', requireAdmin, controller.generateAttendanceReport);
  router.get('/reports/:id/download', requireAdmin, controller.downloadReport);
  router.get('/audit-logs', requireAdmin, controller.listAuditLogs);
  router.post('/audit-logs', controller.createAuditLog);

  return router;
}
