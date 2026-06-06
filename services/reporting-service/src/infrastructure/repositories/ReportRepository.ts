import { Report, ReportFormat, ReportType } from '../../domain/entities/Report';
import {
  AttendanceRow,
  IReportRepository,
  RevenueRow,
} from '../../domain/repositories/IReportRepository';
import { query } from '../db';

interface ReportRow {
  id: string;
  type: ReportType;
  format: ReportFormat;
  from_date: Date;
  to_date: Date;
  content_base64: string | null;
  status: 'pending' | 'completed' | 'failed';
  created_at: Date;
}

function mapRow(row: ReportRow): Report {
  return new Report({
    id: row.id,
    type: row.type,
    format: row.format,
    fromDate: row.from_date,
    toDate: row.to_date,
    contentBase64: row.content_base64 ?? undefined,
    status: row.status,
    createdAt: row.created_at,
  });
}

export class ReportRepository implements IReportRepository {
  async save(report: Report): Promise<Report> {
    const { rows } = await query<ReportRow>(
      `INSERT INTO reports (type, format, from_date, to_date, content_base64, status)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [
        report.type,
        report.format,
        report.fromDate,
        report.toDate,
        report.contentBase64 ?? null,
        report.status,
      ]
    );
    return mapRow(rows[0]);
  }

  async findById(id: string): Promise<Report | null> {
    const { rows } = await query<ReportRow>('SELECT * FROM reports WHERE id = $1', [id]);
    return rows[0] ? mapRow(rows[0]) : null;
  }

  async findByType(type: ReportType): Promise<Report[]> {
    const { rows } = await query<ReportRow>(
      'SELECT * FROM reports WHERE type = $1 ORDER BY created_at DESC',
      [type]
    );
    return rows.map(mapRow);
  }

  async getRevenueData(fromDate: Date, toDate: Date): Promise<RevenueRow[]> {
    const { rows } = await query<{ date: string; amount: string; source: string }>(
      `SELECT TO_CHAR(recorded_at, 'YYYY-MM-DD') AS date,
              amount::text AS amount,
              source
       FROM revenue_entries
       WHERE recorded_at >= $1 AND recorded_at <= $2
       ORDER BY recorded_at ASC`,
      [fromDate, toDate]
    );
    return rows.map((r) => ({
      date: r.date,
      amount: parseFloat(r.amount),
      source: r.source,
    }));
  }

  async getAttendanceData(fromDate: Date, toDate: Date): Promise<AttendanceRow[]> {
    const { rows } = await query<{
      date: string;
      user_id: string;
      class_id: string;
      class_name: string;
    }>(
      `SELECT TO_CHAR(attended_at, 'YYYY-MM-DD') AS date,
              user_id,
              class_id,
              class_name
       FROM attendance_snapshots
       WHERE attended_at >= $1 AND attended_at <= $2
       ORDER BY attended_at ASC`,
      [fromDate, toDate]
    );
    return rows.map((r) => ({
      date: r.date,
      userId: r.user_id,
      classId: r.class_id,
      className: r.class_name,
    }));
  }
}
