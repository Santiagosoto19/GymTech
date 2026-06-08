import { AuditLog } from '../domain/entities/AuditLog';
import { Report } from '../domain/entities/Report';

// ─── AuditLog ─────────────────────────────────────────────
describe('AuditLog Entity', () => {
  it('should create an audit log entry successfully', () => {
    const auditLog = new AuditLog({
      userId: 'admin-1',
      action: 'UPDATE_MEMBERSHIP_PLAN',
      resource: 'MembershipPlan',
      createdAt: new Date(),
    });

    expect(auditLog.userId).toBe('admin-1');
    expect(auditLog.action).toBe('UPDATE_MEMBERSHIP_PLAN');
    expect(auditLog.resource).toBe('MembershipPlan');
  });

  it('should throw if userId is missing', () => {
    expect(() => new AuditLog({
      userId: '',
      action: 'DELETE_USER',
      resource: 'User',
    })).toThrow('userId is required');
  });

  it('should throw if action is missing', () => {
    expect(() => new AuditLog({
      userId: 'admin-1',
      action: '  ',
      resource: 'User',
    })).toThrow('action is required');
  });

  it('should throw if resource is missing', () => {
    expect(() => new AuditLog({
      userId: 'admin-1',
      action: 'DELETE_USER',
      resource: '  ',
    })).toThrow('resource is required');
  });

  it('should accept optional details', () => {
    const auditLog = new AuditLog({
      userId: 'admin-1',
      action: 'CREATE_USER',
      resource: 'User',
      details: { field: 'role', oldValue: 'client', newValue: 'trainer' },
    });

    expect(auditLog.details).toEqual({ field: 'role', oldValue: 'client', newValue: 'trainer' });
  });
});

// ─── Report ────────────────────────────────────────────────
describe('Report Entity', () => {
  it('should create a report with valid dates', () => {
    const report = new Report({
      type: 'revenue',
      format: 'pdf',
      fromDate: new Date('2026-01-01'),
      toDate: new Date('2026-06-01'),
    });

    expect(report.type).toBe('revenue');
    expect(report.format).toBe('pdf');
    expect(report.status).toBe('pending');
  });

  it('should throw if toDate is before fromDate', () => {
    expect(() => new Report({
      type: 'attendance',
      format: 'excel',
      fromDate: new Date('2026-06-01'),
      toDate: new Date('2026-01-01'),
    })).toThrow('toDate must be after fromDate');
  });

  it('should default status to pending', () => {
    const report = new Report({
      type: 'revenue',
      format: 'pdf',
      fromDate: new Date('2026-01-01'),
      toDate: new Date('2026-06-01'),
    });

    expect(report.status).toBe('pending');
  });

  it('should accept an explicit status', () => {
    const report = new Report({
      type: 'attendance',
      format: 'excel',
      fromDate: new Date('2026-01-01'),
      toDate: new Date('2026-06-01'),
      status: 'completed',
    });

    expect(report.status).toBe('completed');
  });
});