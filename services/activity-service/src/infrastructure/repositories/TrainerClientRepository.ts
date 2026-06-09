import { query } from '../db';

export interface TrainerClient {
  id: string;
  trainerId: string;
  clientId: string;
  assignedAt: string;
}

export class TrainerClientRepository {
  async assign(trainerId: string, clientId: string): Promise<TrainerClient> {
    const { rows } = await query<{
      id: string;
      trainer_id: string;
      client_id: string;
      assigned_at: Date;
    }>(
      `INSERT INTO trainer_client_assignments (trainer_id, client_id)
       VALUES ($1, $2) ON CONFLICT (trainer_id, client_id) DO UPDATE SET assigned_at = NOW()
       RETURNING *`,
      [trainerId, clientId]
    );
    const r = rows[0];
    return {
      id: r.id,
      trainerId: r.trainer_id,
      clientId: r.client_id,
      assignedAt: r.assigned_at.toISOString(),
    };
  }

  async findByTrainerId(trainerId: string): Promise<TrainerClient[]> {
    const { rows } = await query<{
      id: string;
      trainer_id: string;
      client_id: string;
      assigned_at: Date;
    }>(
      `SELECT * FROM trainer_client_assignments WHERE trainer_id = $1 ORDER BY assigned_at DESC`,
      [trainerId]
    );
    return rows.map((r) => ({
      id: r.id,
      trainerId: r.trainer_id,
      clientId: r.client_id,
      assignedAt: r.assigned_at.toISOString(),
    }));
  }
}
