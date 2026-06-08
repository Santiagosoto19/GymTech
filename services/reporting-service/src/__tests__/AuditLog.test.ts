import { AuditLog } from '../domain/entities/AuditLog';

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
  });
});
