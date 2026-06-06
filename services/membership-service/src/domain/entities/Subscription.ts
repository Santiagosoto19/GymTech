export const SUBSCRIPTION_STATES = ['expired', 'active', 'suspended', 'canceled'] as const;
export type SubscriptionStatus = (typeof SUBSCRIPTION_STATES)[number];

export interface SubscriptionProps {
  id?: string;
  userId: string;
  planId: string;
  status: SubscriptionStatus;
  startDate: Date;
  endDate: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Subscription {
  readonly id?: string;
  readonly userId: string;
  readonly planId: string;
  private status: SubscriptionStatus;
  readonly startDate: Date;
  endDate: Date;
  readonly createdAt?: Date;
  updatedAt?: Date;

  constructor(props: SubscriptionProps) {
    if (!props.userId) throw new Error('userId is required');
    if (!props.planId) throw new Error('planId is required');
    if (!SUBSCRIPTION_STATES.includes(props.status)) {
      throw new Error(`Invalid subscription status: ${props.status}`);
    }

    this.id = props.id;
    this.userId = props.userId;
    this.planId = props.planId;
    this.status = props.status;
    this.startDate = props.startDate;
    this.endDate = props.endDate;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  getStatus(): SubscriptionStatus {
    return this.status;
  }

  isActive(): boolean {
    return this.status === 'active' && this.endDate >= new Date();
  }

  activate(): void {
    this.status = 'active';
  }

  suspend(): void {
    this.status = 'suspended';
  }

  cancel(): void {
    this.status = 'canceled';
  }

  expire(): void {
    this.status = 'expired';
  }

  renew(additionalDays: number): void {
    const base = this.endDate > new Date() ? this.endDate : new Date();
    this.endDate = new Date(base.getTime() + additionalDays * 24 * 60 * 60 * 1000);
    this.status = 'active';
  }

  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      planId: this.planId,
      status: this.status,
      startDate: this.startDate.toISOString(),
      endDate: this.endDate.toISOString(),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
