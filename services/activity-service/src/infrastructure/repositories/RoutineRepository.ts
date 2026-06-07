import { Routine, Exercise } from '../../domain/entities/Routine';
import { IRoutineRepository, RoutineAssignment } from '../../domain/repositories/IRoutineRepository';
import { query } from '../db';

interface RoutineRow {
  id: string;
  name: string;
  description: string | null;
  exercises: Exercise[];
  difficulty_level: string | null;
  created_by: string | null;
  created_at: Date;
}

function mapRow(row: RoutineRow): Routine {
  return new Routine({
    id: row.id,
    name: row.name,
    description: row.description ?? undefined,
    exercises: row.exercises,
    difficultyLevel: (row.difficulty_level as Routine['difficultyLevel']) ?? 'beginner',
    createdBy: row.created_by ?? undefined,
    createdAt: row.created_at,
  });
}

export class RoutineRepository implements IRoutineRepository {
  async findAll(): Promise<Routine[]> {
    const { rows } = await query<RoutineRow>(
      'SELECT * FROM routines ORDER BY created_at DESC'
    );
    return rows.map(mapRow);
  }

  async findById(id: string): Promise<Routine | null> {
    const { rows } = await query<RoutineRow>(
      'SELECT * FROM routines WHERE id = $1',
      [id]
    );
    return rows[0] ? mapRow(rows[0]) : null;
  }

  async create(routine: Routine): Promise<Routine> {
    const { rows } = await query<RoutineRow>(
      `INSERT INTO routines (name, description, exercises, difficulty_level, created_by)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [
        routine.name,
        routine.description ?? null,
        JSON.stringify(routine.exercises),
        routine.difficultyLevel,
        routine.createdBy ?? null,
      ]
    );
    return mapRow(rows[0]);
  }

  async findAssignedByUserId(userId: string): Promise<Routine | null> {
    const { rows } = await query<RoutineRow>(
      `SELECT r.* FROM routines r
       JOIN routine_assignments ra ON ra.routine_id = r.id
       WHERE ra.user_id = $1
       ORDER BY ra.assigned_at DESC
       LIMIT 1`,
      [userId]
    );
    return rows[0] ? mapRow(rows[0]) : null;
  }

  async assign(routineId: string, userId: string): Promise<RoutineAssignment> {
    const { rows } = await query<{ id: string; routine_id: string; user_id: string; assigned_at: Date }>(
      `INSERT INTO routine_assignments (routine_id, user_id)
       VALUES ($1, $2) RETURNING *`,
      [routineId, userId]
    );
    const row = rows[0];
    return {
      id: row.id,
      routineId: row.routine_id,
      userId: row.user_id,
      assignedAt: row.assigned_at,
    };
  }
}
