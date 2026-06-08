import { IMembershipPlanRepository } from '../../domain/repositories/IMembershipPlanRepository';
import { Membership } from '../../domain/entities/Membership';
import { query } from '../db';

interface PlanRow {
  id: string;
  name: string;
  description: string | null;
  price: string;
  duration_days: number;
  max_occupancy: number | null;
  active: boolean;
  created_at: Date;
}

function mapRow(row: PlanRow): Membership {
  return new Membership({
    id: row.id,
    name: row.name,
    description: row.description ?? undefined,
    price: parseFloat(row.price),
    durationDays: row.duration_days,
    maxOccupancy: row.max_occupancy ?? undefined,
    active: row.active,
    createdAt: row.created_at,
  });
}

export class MembershipPlanRepository implements IMembershipPlanRepository {
  async findAll(): Promise<Membership[]> {
    const { rows } = await query<PlanRow>(
      `SELECT * FROM membership_plans ORDER BY created_at ASC`
    );
    return rows.map(mapRow);
  }

  async findById(id: string): Promise<Membership | null> {
    const { rows } = await query<PlanRow>(
      `SELECT * FROM membership_plans WHERE id = $1`,
      [id]
    );
    return rows[0] ? mapRow(rows[0]) : null;
  }

  async save(plan: Membership): Promise<Membership> {
    const { rows } = await query<PlanRow>(
      `INSERT INTO membership_plans (name, description, price, duration_days, max_occupancy, active)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        plan.name,
        plan.description ?? null,
        plan.price,
        plan.durationDays,
        plan.maxOccupancy ?? null,
        plan.active,
      ]
    );
    return mapRow(rows[0]);
  }
}
