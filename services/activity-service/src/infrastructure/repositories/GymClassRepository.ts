import { GymClass } from '../../domain/entities/GymClass';
import { IGymClassRepository } from '../../domain/repositories/IGymClassRepository';
import { query } from '../db';

interface GymClassRow {
  id: string;
  name: string;
  description: string | null;
  instructor: string;
  capacity: number;
  created_at: Date;
}

function mapRow(row: GymClassRow): GymClass {
  return new GymClass({
    id: row.id,
    name: row.name,
    description: row.description ?? undefined,
    instructor: row.instructor,
    capacity: row.capacity,
    createdAt: row.created_at,
  });
}

export class GymClassRepository implements IGymClassRepository {
  async findAll(): Promise<GymClass[]> {
    const { rows } = await query<GymClassRow>(
      'SELECT * FROM gym_classes ORDER BY created_at DESC'
    );
    return rows.map(mapRow);
  }

  async findById(id: string): Promise<GymClass | null> {
    const { rows } = await query<GymClassRow>(
      'SELECT * FROM gym_classes WHERE id = $1',
      [id]
    );
    return rows[0] ? mapRow(rows[0]) : null;
  }

  async create(gymClass: GymClass): Promise<GymClass> {
    const { rows } = await query<GymClassRow>(
      `INSERT INTO gym_classes (name, description, instructor, capacity)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [gymClass.name, gymClass.description ?? null, gymClass.instructor, gymClass.capacity]
    );
    return mapRow(rows[0]);
  }

  async countReservations(classId: string): Promise<number> {
    const { rows } = await query<{ count: string }>(
      'SELECT COUNT(*)::text AS count FROM class_reservations WHERE class_id = $1',
      [classId]
    );
    return parseInt(rows[0]?.count ?? '0', 10);
  }

  async createReservation(
    classId: string,
    userId: string
  ): Promise<{ id: string; classId: string; userId: string; createdAt: Date }> {
    const { rows } = await query<{ id: string; class_id: string; user_id: string; created_at: Date }>(
      `INSERT INTO class_reservations (class_id, user_id)
       VALUES ($1, $2) RETURNING *`,
      [classId, userId]
    );
    const row = rows[0];
    return {
      id: row.id,
      classId: row.class_id,
      userId: row.user_id,
      createdAt: row.created_at,
    };
  }

  async findReservationsByUserId(
    userId: string
  ): Promise<Array<{ id: string; classId: string; userId: string; createdAt: Date }>> {
    const { rows } = await query<{ id: string; class_id: string; user_id: string; created_at: Date }>(
      'SELECT * FROM class_reservations WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    return rows.map((row) => ({
      id: row.id,
      classId: row.class_id,
      userId: row.user_id,
      createdAt: row.created_at,
    }));
  }
}
