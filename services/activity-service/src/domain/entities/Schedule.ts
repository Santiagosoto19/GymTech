export interface ScheduleProps {
  id?: string;
  classId: string;
  startTime: Date;
  endTime: Date;
  room: string;
  createdAt?: Date;
}

export class Schedule {
  readonly id?: string;
  classId: string;
  startTime: Date;
  endTime: Date;
  room: string;
  readonly createdAt?: Date;

  constructor(props: ScheduleProps) {
    if (!props.classId) {
      throw new Error('Class ID is required');
    }
    if (!props.room?.trim()) {
      throw new Error('Room is required');
    }
    if (props.endTime <= props.startTime) {
      throw new Error('End time must be after start time');
    }

    this.id = props.id;
    this.classId = props.classId;
    this.startTime = props.startTime;
    this.endTime = props.endTime;
    this.room = props.room.trim();
    this.createdAt = props.createdAt;
  }

  overlaps(other: Schedule): boolean {
    if (this.room !== other.room) {
      return false;
    }
    return this.startTime < other.endTime && this.endTime > other.startTime;
  }

  toJSON() {
    return {
      id: this.id,
      classId: this.classId,
      startTime: this.startTime.toISOString(),
      endTime: this.endTime.toISOString(),
      room: this.room,
      createdAt: this.createdAt,
    };
  }
}
