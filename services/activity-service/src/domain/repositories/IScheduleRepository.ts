import { Schedule } from '../entities/Schedule';

export interface IScheduleRepository {
  findAll(): Promise<Schedule[]>;
  findByRoom(room: string): Promise<Schedule[]>;
  create(schedule: Schedule): Promise<Schedule>;
}
