export type AttendanceType = 'check_in' | 'check_out';

export interface AttendanceProps {
  id?: string;
  userId: string;
  type: AttendanceType;
  idempotencyKey: string;
  subscriptionId?: string;
  createdAt?: Date;
}

export class Attendance {
  readonly id?: string;
  readonly userId: string;
  readonly type: AttendanceType;
  readonly idempotencyKey: string;
  readonly subscriptionId?: string;
  readonly createdAt?: Date;

  constructor(props: AttendanceProps) {
    if (!props.userId) throw new Error('userId is required');
    if (!props.idempotencyKey) throw new Error('idempotencyKey is required');
    if (!['check_in', 'check_out'].includes(props.type)) {
      throw new Error('type must be check_in or check_out');
    }

    this.id = props.id;
    this.userId = props.userId;
    this.type = props.type;
    this.idempotencyKey = props.idempotencyKey;
    this.subscriptionId = props.subscriptionId;
    this.createdAt = props.createdAt;
  }

  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      type: this.type,
      subscriptionId: this.subscriptionId ?? null,
      createdAt: this.createdAt,
    };
  }
}
