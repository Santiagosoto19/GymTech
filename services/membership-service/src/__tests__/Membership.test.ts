import { Membership } from '../domain/entities/Membership';
import { Attendance } from '../domain/entities/Attendance';

// ─── Membership ───────────────────────────────────────────
describe('Membership Entity', () => {
  it('should create a membership with valid data', () => {
    const plan = new Membership({
      name: '  Plan Gold  ',
      price: 50,
      durationDays: 30,
    });

    expect(plan.name).toBe('Plan Gold');
    expect(plan.price).toBe(50);
    expect(plan.durationDays).toBe(30);
    expect(plan.active).toBe(true);
  });

  it('should throw if name is empty', () => {
    expect(() => new Membership({ name: '   ', price: 50, durationDays: 30 }))
      .toThrow('Plan name is required');
  });

  it('should throw if price is negative', () => {
    expect(() => new Membership({ name: 'Plan', price: -10, durationDays: 30 }))
      .toThrow('Price cannot be negative');
  });

  it('should throw if duration is zero or negative', () => {
    expect(() => new Membership({ name: 'Plan', price: 50, durationDays: 0 }))
      .toThrow('Duration must be positive');

    expect(() => new Membership({ name: 'Plan', price: 50, durationDays: -5 }))
      .toThrow('Duration must be positive');
  });

  it('should accept optional fields', () => {
    const plan = new Membership({
      name: 'Premium',
      price: 100,
      durationDays: 90,
      description: 'Full access',
      maxOccupancy: 50,
      monthlyEntryLimit: 30,
      active: false,
    });

    expect(plan.description).toBe('Full access');
    expect(plan.maxOccupancy).toBe(50);
    expect(plan.monthlyEntryLimit).toBe(30);
    expect(plan.active).toBe(false);
  });

  it('should default active to true when not provided', () => {
    const plan = new Membership({ name: 'Basic', price: 20, durationDays: 15 });
    expect(plan.active).toBe(true);
  });
});

// ─── Attendance ───────────────────────────────────────────
describe('Attendance Entity', () => {
  it('should create a check_in attendance', () => {
    const attendance = new Attendance({
      userId: 'user-1',
      type: 'check_in',
      idempotencyKey: 'key-123',
      subscriptionId: 'sub-1',
    });

    expect(attendance.userId).toBe('user-1');
    expect(attendance.type).toBe('check_in');
    expect(attendance.idempotencyKey).toBe('key-123');
  });

  it('should create a check_out attendance', () => {
    const attendance = new Attendance({
      userId: 'user-1',
      type: 'check_out',
      idempotencyKey: 'key-456',
    });

    expect(attendance.type).toBe('check_out');
  });

  it('should throw if userId is missing', () => {
    expect(() => new Attendance({ userId: '', type: 'check_in', idempotencyKey: 'k' }))
      .toThrow('userId is required');
  });

  it('should throw if idempotencyKey is missing', () => {
    expect(() => new Attendance({ userId: 'user-1', type: 'check_in', idempotencyKey: '' }))
      .toThrow('idempotencyKey is required');
  });

  it('should throw if type is invalid', () => {
    expect(() => new Attendance({ userId: 'user-1', type: 'invalid' as any, idempotencyKey: 'k' }))
      .toThrow('type must be check_in or check_out');
  });
});