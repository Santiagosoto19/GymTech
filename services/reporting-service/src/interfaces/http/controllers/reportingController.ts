import { Request, Response, NextFunction } from 'express';
import { ReportGenerationService } from '../../../domain/services/ReportGenerationService';
import { AuditLog } from '../../../domain/entities/AuditLog';
import { IAuditLogRepository } from '../../../domain/repositories/IAuditLogRepository';
import { AppError } from '../../../domain/errors/AppError';
import { ReportFormat } from '../../../domain/entities/Report';

export class ReportingController {
  constructor(
    private readonly reportGenerationService: ReportGenerationService,
    private readonly auditLogRepository: IAuditLogRepository
  ) {}

  generateRevenueReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { fromDate, toDate, format } = req.body;
      const report = await this.reportGenerationService.generateRevenueReport(
        fromDate,
        toDate,
        (format as ReportFormat) ?? 'pdf'
      );
      res.status(201).json({ success: true, data: report.toJSON() });
    } catch (error) {
      next(error);
    }
  };

  generateAttendanceReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { fromDate, toDate, format } = req.body;
      const report = await this.reportGenerationService.generateAttendanceReport(
        fromDate,
        toDate,
        (format as ReportFormat) ?? 'pdf'
      );
      res.status(201).json({ success: true, data: report.toJSON() });
    } catch (error) {
      next(error);
    }
  };

  listAuditLogs = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const logs = await this.auditLogRepository.findAll();
      res.status(200).json({ success: true, data: logs.map((l) => l.toJSON()) });
    } catch (error) {
      next(error);
    }
  };

  downloadReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const report = await this.reportGenerationService.getReportById(req.params.id);
      if (!report.contentBase64) {
        throw AppError.notFound('Report content not found');
      }
      const mime = report.format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      const ext = report.format === 'pdf' ? 'pdf' : 'xlsx';
      const buffer = Buffer.from(report.contentBase64, 'base64');
      res.setHeader('Content-Type', mime);
      res.setHeader('Content-Disposition', `attachment; filename="report-${report.type}.${ext}"`);
      res.send(buffer);
    } catch (error) {
      next(error);
    }
  };

  createAuditLog = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { userId, action, resource, details } = req.body;
      if (!userId || !action || !resource) {
        throw AppError.badRequest('userId, action, and resource are required');
      }

      const auditLog = new AuditLog({ userId, action, resource, details });
      const saved = await this.auditLogRepository.create(auditLog);
      res.status(201).json({ success: true, data: saved.toJSON() });
    } catch (error) {
      next(error);
    }
  };
}

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: { message: err.message, code: err.code },
    });
    return;
  }

  if (err.message.includes('required') || err.message.includes('must be')) {
    res.status(400).json({ success: false, error: { message: err.message } });
    return;
  }

  console.error('[reporting-service]', err);
  res.status(500).json({
    success: false,
    error: { message: 'Internal server error' },
  });
}
