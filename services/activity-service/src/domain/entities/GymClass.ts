export interface GymClassProps {
  id?: string;
  name: string;
  description?: string;
  instructor: string;
  capacity: number;
  createdAt?: Date;
}

export class GymClass {
  readonly id?: string;
  name: string;
  description?: string;
  instructor: string;
  capacity: number;
  readonly createdAt?: Date;

  constructor(props: GymClassProps) {
    if (!props.name?.trim()) {
      throw new Error('Class name is required');
    }
    if (!props.instructor?.trim()) {
      throw new Error('Instructor is required');
    }
    if (props.capacity <= 0) {
      throw new Error('Capacity must be positive');
    }

    this.id = props.id;
    this.name = props.name.trim();
    this.description = props.description;
    this.instructor = props.instructor.trim();
    this.capacity = props.capacity;
    this.createdAt = props.createdAt;
  }

  isFull(currentReservations: number): boolean {
    return currentReservations >= this.capacity;
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description ?? null,
      instructor: this.instructor,
      capacity: this.capacity,
      createdAt: this.createdAt,
    };
  }
}
