import { AuditLog } from '../../domain/entities/AuditLog';
import { IAuditLogRepository } from '../../domain/repositories/IAuditLogRepository';
import { query } from '../db';

interface AuditLogRow {
  id: string;
  user_id: string;
  action: string;
  resource: string;
  details: Record<string, unknown> | null;
  created_at: Date;
}

function mapRow(row: AuditLogRow): AuditLog {
  return new AuditLog({
    id: row.id,
    userId: row.user_id,
    action: row.action,
    resource: row.resource,
    details: row.details ?? undefined,
    createdAt: row.created_at,
  });
}

export class AuditLogRepository implements IAuditLogRepository {
  async findAll(limit = 100): Promise<AuditLog[]> {
    const { rows } = await query<AuditLogRow>(
      'SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT $1',
      [limit]
    );
    return rows.map(mapRow);
  }

  async create(auditLog: AuditLog): Promise<AuditLog> {
    const { rows } = await query<AuditLogRow>(
      `INSERT INTO audit_logs (user_id, action, resource, details)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [
        auditLog.userId,
        auditLog.action,
        auditLog.resource,
        auditLog.details ? JSON.stringify(auditLog.details) : null,
      ]
    );
    return mapRow(rows[0]);
  }
}
