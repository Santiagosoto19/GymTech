import { IAttendanceRepository } from '../../domain/repositories/IAttendanceRepository';
import { Attendance, AttendanceType } from '../../domain/entities/Attendance';
import { query } from '../db';

interface AttendanceRow {
  id: string;
  user_id: string;
  subscription_id: string | null;
  event_type: AttendanceType;
  idempotency_key: string;
  created_at: Date;
}

function mapRow(row: AttendanceRow): Attendance {
  return new Attendance({
    id: row.id,
    userId: row.user_id,
    type: row.event_type,
    idempotencyKey: row.idempotency_key,
    subscriptionId: row.subscription_id ?? undefined,
    createdAt: row.created_at,
  });
}

export class AttendanceRepository implements IAttendanceRepository {
  async findByIdempotencyKey(key: string): Promise<Attendance | null> {
    const { rows } = await query<AttendanceRow>(
      `SELECT * FROM attendance_records WHERE idempotency_key = $1`,
      [key]
    );
    return rows[0] ? mapRow(rows[0]) : null;
  }

  async save(attendance: Attendance): Promise<Attendance> {
    const { rows } = await query<AttendanceRow>(
      `INSERT INTO attendance_records (user_id, subscription_id, event_type, idempotency_key)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [
        attendance.userId,
        attendance.subscriptionId ?? null,
        attendance.type,
        attendance.idempotencyKey,
      ]
    );
    return mapRow(rows[0]);
  }

  async countLiveOccupancy(): Promise<number> {
    const { rows } = await query<{ count: string }>(`
      SELECT COUNT(*)::text AS count FROM (
        SELECT DISTINCT ON (user_id) user_id, event_type
        FROM attendance_records
        ORDER BY user_id, created_at DESC
      ) latest
      WHERE event_type = 'check_in'
    `);
    return parseInt(rows[0]?.count ?? '0', 10);
  }

  async hasOpenSession(userId: string): Promise<boolean> {
    const { rows } = await query<{ event_type: AttendanceType }>(`
      SELECT event_type FROM attendance_records
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT 1
    `, [userId]);
    return rows[0]?.event_type === 'check_in';
  }

  async countMonthlyCheckIns(userId: string): Promise<number> {
    const { rows } = await query<{ count: string }>(`
      SELECT COUNT(*)::text AS count FROM attendance_records
      WHERE user_id = $1 AND event_type = 'check_in'
        AND created_at >= date_trunc('month', NOW())
    `, [userId]);
    return parseInt(rows[0]?.count ?? '0', 10);
  }

  async countMonthlyEntriesUsed(userId: string): Promise<number> {
    const { rows } = await query<{ count: string }>(`
      SELECT COUNT(*)::text AS count FROM attendance_records
      WHERE user_id = $1 AND event_type IN ('check_in', 'check_out')
        AND created_at >= date_trunc('month', NOW())
    `, [userId]);
    return parseInt(rows[0]?.count ?? '0', 10);
  }
}
