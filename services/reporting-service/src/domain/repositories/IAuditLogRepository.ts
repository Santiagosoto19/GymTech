import { AuditLog } from '../entities/AuditLog';

export interface IAuditLogRepository {
  findAll(limit?: number): Promise<AuditLog[]>;
  create(auditLog: AuditLog): Promise<AuditLog>;
}
