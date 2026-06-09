import PDFDocument from 'pdfkit';
import ExcelJS from 'exceljs';
import { Report, ReportFormat } from '../entities/Report';
import { AppError } from '../errors/AppError';
import {
  AttendanceRow,
  IReportRepository,
  RevenueRow,
} from '../repositories/IReportRepository';

export interface DateRangeFilter {
  fromDate: Date;
  toDate: Date;
  format?: ReportFormat;
}

export class ReportGenerationService {
  constructor(private readonly reportRepository: IReportRepository) {}

  private validateDateRange(fromDate?: string, toDate?: string): DateRangeFilter {
    if (!fromDate || !toDate) {
      throw AppError.badRequest('fromDate and toDate are required');
    }

    const from = new Date(fromDate);
    const to = new Date(toDate);

    if (isNaN(from.getTime()) || isNaN(to.getTime())) {
      throw AppError.badRequest('fromDate and toDate must be valid ISO dates');
    }

    return { fromDate: from, toDate: to };
  }

  async generateRevenueReport(
    fromDate?: string,
    toDate?: string,
    format: ReportFormat = 'pdf'
  ): Promise<Report> {
    const range = this.validateDateRange(fromDate, toDate);
    const data = await this.reportRepository.getRevenueData(range.fromDate, range.toDate);
    const contentBase64 = await this.renderReport('Revenue Report', data, format, (row) => [
      row.date,
      row.source,
      row.amount.toFixed(2),
    ]);

    const report = new Report({
      type: 'revenue',
      format,
      fromDate: range.fromDate,
      toDate: range.toDate,
      contentBase64,
      status: 'completed',
    });

    return this.reportRepository.save(report);
  }

  async generateAttendanceReport(
    fromDate?: string,
    toDate?: string,
    format: ReportFormat = 'pdf'
  ): Promise<Report> {
    const range = this.validateDateRange(fromDate, toDate);
    const data = await this.reportRepository.getAttendanceData(range.fromDate, range.toDate);
    const contentBase64 = await this.renderReport('Attendance Report', data, format, (row) => [
      row.date,
      row.userId,
      row.className,
      row.classId,
    ]);

    const report = new Report({
      type: 'attendance',
      format,
      fromDate: range.fromDate,
      toDate: range.toDate,
      contentBase64,
      status: 'completed',
    });

    return this.reportRepository.save(report);
  }

  async getReportById(id: string): Promise<Report> {
    const report = await this.reportRepository.findById(id);
    if (!report) {
      throw AppError.notFound('Report not found');
    }
    return report;
  }

  private async renderReport<T extends RevenueRow | AttendanceRow>(
    title: string,
    rows: T[],
    format: ReportFormat,
    mapRow: (row: T) => (string | number)[]
  ): Promise<string> {
    if (format === 'pdf') {
      return this.generatePdf(title, rows, mapRow);
    }
    return this.generateExcel(title, rows, mapRow);
  }

  private generatePdf<T>(
    title: string,
    rows: T[],
    mapRow: (row: T) => (string | number)[]
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks).toString('base64')));
      doc.on('error', reject);

      doc.fontSize(18).text(title, { align: 'center' });
      doc.moveDown();
      doc.fontSize(10).text(`Generated: ${new Date().toISOString()}`);
      doc.moveDown();

      rows.forEach((row, index) => {
        doc.text(`${index + 1}. ${mapRow(row).join(' | ')}`);
      });

      if (rows.length === 0) {
        doc.text('No data for the selected date range.');
      }

      doc.end();
    });
  }

  private async generateExcel<T>(
    title: string,
    rows: T[],
    mapRow: (row: T) => (string | number)[]
  ): Promise<string> {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet(title.slice(0, 31));

    if (rows.length === 0) {
      sheet.addRow(['No data for the selected date range.']);
    } else {
      const headers = mapRow(rows[0]).map((_, i) => `Column ${i + 1}`);
      sheet.addRow(['#', ...headers]);
      rows.forEach((row, index) => {
        sheet.addRow([index + 1, ...mapRow(row)]);
      });
    }

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer).toString('base64');
  }
}
