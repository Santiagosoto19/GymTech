import { query } from '../db';

export interface PaymentRecord {
  id: string;
  userId: string;
  planId?: string;
  amount: number;
  method: string;
  recordedBy?: string;
  recordedAt: string;
}

export class PaymentRepository {
  async create(data: {
    userId: string;
    planId?: string;
    amount: number;
    method: string;
    recordedBy?: string;
  }): Promise<PaymentRecord> {
    const { rows } = await query<{
      id: string;
      user_id: string;
      plan_id: string | null;
      amount: string;
      method: string;
      recorded_by: string | null;
      recorded_at: Date;
    }>(
      `INSERT INTO payment_transactions (user_id, plan_id, amount, method, recorded_by)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [data.userId, data.planId ?? null, data.amount, data.method, data.recordedBy ?? null]
    );
    const r = rows[0];
    return {
      id: r.id,
      userId: r.user_id,
      planId: r.plan_id ?? undefined,
      amount: parseFloat(r.amount),
      method: r.method,
      recordedBy: r.recorded_by ?? undefined,
      recordedAt: r.recorded_at.toISOString(),
    };
  }

  async findByDateRange(fromDate: Date, toDate: Date): Promise<PaymentRecord[]> {
    const { rows } = await query<{
      id: string;
      user_id: string;
      plan_id: string | null;
      amount: string;
      method: string;
      recorded_by: string | null;
      recorded_at: Date;
    }>(
      `SELECT * FROM payment_transactions
       WHERE recorded_at >= $1 AND recorded_at <= $2
       ORDER BY recorded_at DESC`,
      [fromDate, toDate]
    );
    return rows.map((r) => ({
      id: r.id,
      userId: r.user_id,
      planId: r.plan_id ?? undefined,
      amount: parseFloat(r.amount),
      method: r.method,
      recordedBy: r.recorded_by ?? undefined,
      recordedAt: r.recorded_at.toISOString(),
    }));
  }

  async getMonthlyTotal(): Promise<number> {
    const { rows } = await query<{ total: string }>(
      `SELECT COALESCE(SUM(amount), 0)::text AS total
       FROM payment_transactions
       WHERE recorded_at >= date_trunc('month', NOW())`
    );
    return parseFloat(rows[0]?.total ?? '0');
  }
}
