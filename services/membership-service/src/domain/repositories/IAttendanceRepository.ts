import { Attendance } from '../entities/Attendance';

export interface IAttendanceRepository {
  findByIdempotencyKey(key: string): Promise<Attendance | null>;
  save(attendance: Attendance): Promise<Attendance>;
  countLiveOccupancy(): Promise<number>;
  hasOpenSession(userId: string): Promise<boolean>;
  countMonthlyCheckIns(userId: string): Promise<number>;
  countMonthlyEntriesUsed(userId: string): Promise<number>;
}
