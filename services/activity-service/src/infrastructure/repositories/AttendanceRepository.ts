import {
  AttendanceRecord,
  IAttendanceRepository,
} from '../../domain/repositories/IAttendanceRepository';
import { query } from '../db';

interface AttendanceRow {
  id: string;
  user_id: string;
  class_id: string;
  idempotency_key: string;
  created_at: Date;
}

function mapRow(row: AttendanceRow): AttendanceRecord {
  return {
    id: row.id,
    userId: row.user_id,
    classId: row.class_id,
    idempotencyKey: row.idempotency_key,
    createdAt: row.created_at,
  };
}

export class AttendanceRepository implements IAttendanceRepository {
  async findByIdempotencyKey(key: string): Promise<AttendanceRecord | null> {
    const { rows } = await query<AttendanceRow>(
      'SELECT * FROM attendance_records WHERE idempotency_key = $1',
      [key]
    );
    return rows[0] ? mapRow(rows[0]) : null;
  }

  async create(userId: string, classId: string, idempotencyKey: string): Promise<AttendanceRecord> {
    const { rows } = await query<AttendanceRow>(
      `INSERT INTO attendance_records (user_id, class_id, idempotency_key)
       VALUES ($1, $2, $3) RETURNING *`,
      [userId, classId, idempotencyKey]
    );
    return mapRow(rows[0]);
  }
}
