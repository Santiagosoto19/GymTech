export interface MembershipProps {
  id?: string;
  name: string;
  description?: string;
  price: number;
  durationDays: number;
  maxOccupancy?: number;
  monthlyEntryLimit?: number;
  active?: boolean;
  createdAt?: Date;
}

export class Membership {
  readonly id?: string;
  name: string;
  description?: string;
  price: number;
  durationDays: number;
  maxOccupancy?: number;
  monthlyEntryLimit?: number;
  active: boolean;
  readonly createdAt?: Date;

  constructor(props: MembershipProps) {
    if (!props.name?.trim()) {
      throw new Error('Plan name is required');
    }
    if (props.price < 0) {
      throw new Error('Price cannot be negative');
    }
    if (props.durationDays <= 0) {
      throw new Error('Duration must be positive');
    }

    this.id = props.id;
    this.name = props.name.trim();
    this.description = props.description;
    this.price = props.price;
    this.durationDays = props.durationDays;
    this.maxOccupancy = props.maxOccupancy;
    this.monthlyEntryLimit = props.monthlyEntryLimit;
    this.active = props.active ?? true;
    this.createdAt = props.createdAt;
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description ?? null,
      price: this.price,
      durationDays: this.durationDays,
      maxOccupancy: this.maxOccupancy ?? null,
      monthlyEntryLimit: this.monthlyEntryLimit ?? null,
      active: this.active,
      createdAt: this.createdAt,
    };
  }
}
