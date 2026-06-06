import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { ReportGenerationService } from './domain/services/ReportGenerationService';
import { ReportRepository } from './infrastructure/repositories/ReportRepository';
import { AuditLogRepository } from './infrastructure/repositories/AuditLogRepository';
import { ReportingController, errorHandler } from './interfaces/http/controllers/reportingController';
import { createReportingRoutes } from './interfaces/http/routes/reportingRoutes';

export function createApp(): express.Application {
  const app = express();

  const reportRepository = new ReportRepository();
  const auditLogRepository = new AuditLogRepository();
  const reportGenerationService = new ReportGenerationService(reportRepository);

  const controller = new ReportingController(reportGenerationService, auditLogRepository);

  app.use(helmet());
  app.use(cors());
  app.use(morgan('combined'));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'UP', service: 'reporting-service' });
  });

  app.use('/api/v1/reporting', createReportingRoutes(controller));
  app.use(errorHandler);

  return app;
}
