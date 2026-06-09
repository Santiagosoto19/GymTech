import { Schedule } from '../../domain/entities/Schedule';
import { IScheduleRepository } from '../../domain/repositories/IScheduleRepository';
import { query } from '../db';

interface ScheduleRow {
  id: string;
  class_id: string;
  start_time: Date;
  end_time: Date;
  room: string;
  created_at: Date;
}

function mapRow(row: ScheduleRow): Schedule {
  return new Schedule({
    id: row.id,
    classId: row.class_id,
    startTime: row.start_time,
    endTime: row.end_time,
    room: row.room,
    createdAt: row.created_at,
  });
}

export class ScheduleRepository implements IScheduleRepository {
  async findAll(): Promise<Schedule[]> {
    const { rows } = await query<ScheduleRow>(
      'SELECT * FROM schedules ORDER BY start_time ASC'
    );
    return rows.map(mapRow);
  }

  async findByRoom(room: string): Promise<Schedule[]> {
    const { rows } = await query<ScheduleRow>(
      'SELECT * FROM schedules WHERE room = $1',
      [room]
    );
    return rows.map(mapRow);
  }

  async create(schedule: Schedule): Promise<Schedule> {
    const { rows } = await query<ScheduleRow>(
      `INSERT INTO schedules (class_id, start_time, end_time, room)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [schedule.classId, schedule.startTime, schedule.endTime, schedule.room]
    );
    return mapRow(rows[0]);
  }
}
