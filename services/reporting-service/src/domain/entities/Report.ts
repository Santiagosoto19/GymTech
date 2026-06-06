export type ReportType = 'revenue' | 'attendance';
export type ReportFormat = 'pdf' | 'excel';

export interface ReportProps {
  id?: string;
  type: ReportType;
  format: ReportFormat;
  fromDate: Date;
  toDate: Date;
  contentBase64?: string;
  status?: 'pending' | 'completed' | 'failed';
  createdAt?: Date;
}

export class Report {
  readonly id?: string;
  type: ReportType;
  format: ReportFormat;
  fromDate: Date;
  toDate: Date;
  contentBase64?: string;
  status: 'pending' | 'completed' | 'failed';
  readonly createdAt?: Date;

  constructor(props: ReportProps) {
    if (props.toDate < props.fromDate) {
      throw new Error('toDate must be after fromDate');
    }

    this.id = props.id;
    this.type = props.type;
    this.format = props.format;
    this.fromDate = props.fromDate;
    this.toDate = props.toDate;
    this.contentBase64 = props.contentBase64;
    this.status = props.status ?? 'pending';
    this.createdAt = props.createdAt;
  }

  toJSON() {
    return {
      id: this.id,
      type: this.type,
      format: this.format,
      fromDate: this.fromDate.toISOString(),
      toDate: this.toDate.toISOString(),
      contentBase64: this.contentBase64 ?? null,
      status: this.status,
      createdAt: this.createdAt,
    };
  }
}
