export interface AuditLogProps {
  id?: string;
  userId: string;
  action: string;
  resource: string;
  details?: Record<string, unknown>;
  createdAt?: Date;
}

export class AuditLog {
  readonly id?: string;
  userId: string;
  action: string;
  resource: string;
  details?: Record<string, unknown>;
  readonly createdAt?: Date;

  constructor(props: AuditLogProps) {
    if (!props.userId) {
      throw new Error('userId is required');
    }
    if (!props.action?.trim()) {
      throw new Error('action is required');
    }
    if (!props.resource?.trim()) {
      throw new Error('resource is required');
    }

    this.id = props.id;
    this.userId = props.userId;
    this.action = props.action.trim();
    this.resource = props.resource.trim();
    this.details = props.details;
    this.createdAt = props.createdAt;
  }

  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      action: this.action,
      resource: this.resource,
      details: this.details ?? null,
      createdAt: this.createdAt,
    };
  }
}
