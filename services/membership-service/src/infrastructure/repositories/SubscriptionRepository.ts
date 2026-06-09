import { ISubscriptionRepository } from '../../domain/repositories/ISubscriptionRepository';
import { Subscription, SubscriptionStatus } from '../../domain/entities/Subscription';
import { query } from '../db';

interface SubscriptionRow {
  id: string;
  user_id: string;
  plan_id: string;
  status: SubscriptionStatus;
  start_date: Date;
  end_date: Date;
  created_at: Date;
  updated_at: Date;
}

function mapRow(row: SubscriptionRow): Subscription {
  return new Subscription({
    id: row.id,
    userId: row.user_id,
    planId: row.plan_id,
    status: row.status,
    startDate: row.start_date,
    endDate: row.end_date,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  });
}

export class SubscriptionRepository implements ISubscriptionRepository {
  async findAll(): Promise<Subscription[]> {
    const { rows } = await query<SubscriptionRow>(
      `SELECT * FROM subscriptions ORDER BY created_at DESC`
    );
    return rows.map(mapRow);
  }

  async findById(id: string): Promise<Subscription | null> {
    const { rows } = await query<SubscriptionRow>(
      `SELECT * FROM subscriptions WHERE id = $1`,
      [id]
    );
    return rows[0] ? mapRow(rows[0]) : null;
  }

  async findActiveByUserId(userId: string): Promise<Subscription | null> {
    const { rows } = await query<SubscriptionRow>(
      `SELECT * FROM subscriptions
       WHERE user_id = $1 AND status = 'active' AND end_date >= NOW()
       ORDER BY end_date DESC
       LIMIT 1`,
      [userId]
    );
    return rows[0] ? mapRow(rows[0]) : null;
  }

  async save(subscription: Subscription): Promise<Subscription> {
    const { rows } = await query<SubscriptionRow>(
      `INSERT INTO subscriptions (user_id, plan_id, status, start_date, end_date)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        subscription.userId,
        subscription.planId,
        subscription.getStatus(),
        subscription.startDate,
        subscription.endDate,
      ]
    );
    return mapRow(rows[0]);
  }

  async update(subscription: Subscription): Promise<Subscription> {
    const { rows } = await query<SubscriptionRow>(
      `UPDATE subscriptions
       SET status = $1, end_date = $2, updated_at = NOW()
       WHERE id = $3
       RETURNING *`,
      [subscription.getStatus(), subscription.endDate, subscription.id]
    );
    if (!rows[0]) {
      throw new Error('Subscription not found during update');
    }
    return mapRow(rows[0]);
  }

  async expireOverdue(): Promise<number> {
    const result = await query(
      `UPDATE subscriptions
       SET status = 'expired', updated_at = NOW()
       WHERE status = 'active' AND end_date < NOW()`
    );
    return result.rowCount ?? 0;
  }
}
