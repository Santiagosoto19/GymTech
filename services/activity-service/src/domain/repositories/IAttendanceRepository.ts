export interface AttendanceRecord {
  id: string;
  userId: string;
  classId: string;
  idempotencyKey: string;
  createdAt: Date;
}

export interface IAttendanceRepository {
  findByIdempotencyKey(key: string): Promise<AttendanceRecord | null>;
  create(userId: string, classId: string, idempotencyKey: string): Promise<AttendanceRecord>;
}
