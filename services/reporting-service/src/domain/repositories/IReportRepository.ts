import { Report, ReportType } from '../entities/Report';

export interface RevenueRow {
  date: string;
  amount: number;
  source: string;
}

export interface AttendanceRow {
  date: string;
  userId: string;
  classId: string;
  className: string;
}

export interface IReportRepository {
  save(report: Report): Promise<Report>;
  getRevenueData(fromDate: Date, toDate: Date): Promise<RevenueRow[]>;
  getAttendanceData(fromDate: Date, toDate: Date): Promise<AttendanceRow[]>;
  findById(id: string): Promise<Report | null>;
  findByType(type: ReportType): Promise<Report[]>;
}
