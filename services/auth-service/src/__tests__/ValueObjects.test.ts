import { Email } from '../domain/value-objects/Email';
import { DocumentNumber } from '../domain/value-objects/DocumentNumber';
import { PasswordHash } from '../domain/value-objects/PasswordHash';
import { Role } from '../domain/entities/Role';

// ─── Email ────────────────────────────────────────────────
describe('Email Value Object', () => {
  it('should create a valid email', () => {
    const email = Email.create('  User@GymTech.COM  ');
    expect(email.toString()).toBe('user@gymtech.com');
  });

  it('should throw for invalid email format', () => {
    expect(() => Email.create('not-an-email')).toThrow('Invalid email format');
    expect(() => Email.create('')).toThrow('Invalid email format');
    expect(() => Email.create('missing@')).toThrow('Invalid email format');
  });

  it('should compare equality correctly', () => {
    const a = Email.create('test@gymtech.com');
    const b = Email.create('test@gymtech.com');
    const c = Email.create('other@gymtech.com');
    expect(a.equals(b)).toBe(true);
    expect(a.equals(c)).toBe(false);
  });
});

// ─── DocumentNumber ───────────────────────────────────────
describe('DocumentNumber Value Object', () => {
  it('should create a valid document number', () => {
    const doc = DocumentNumber.create('  abc123  ');
    expect(doc.toString()).toBe('ABC123');
  });

  it('should throw for too short document number', () => {
    expect(() => DocumentNumber.create('AB')).toThrow('between 3 and 20 characters');
  });

  it('should throw for too long document number', () => {
    expect(() => DocumentNumber.create('A'.repeat(21))).toThrow('between 3 and 20 characters');
  });

  it('should throw for invalid characters', () => {
    expect(() => DocumentNumber.create('ABC@123')).toThrow('invalid characters');
  });
});

// ─── PasswordHash ─────────────────────────────────────────
describe('PasswordHash Value Object', () => {
  it('should hash a plaintext password', async () => {
    const hash = await PasswordHash.fromPlaintext('MySecure123');
    expect(hash.toString()).toBeTruthy();
    expect(hash.toString().startsWith('$2')).toBe(true);
  });

  it('should throw for password shorter than 6 characters', async () => {
    await expect(PasswordHash.fromPlaintext('12345')).rejects.toThrow('at least 6 characters');
  });

  it('should throw for empty password', async () => {
    await expect(PasswordHash.fromPlaintext('')).rejects.toThrow('at least 6 characters');
  });

  it('should verify a correct password', async () => {
    const hash = await PasswordHash.fromPlaintext('MySecure123');
    expect(await hash.verify('MySecure123')).toBe(true);
    expect(await hash.verify('WrongPassword')).toBe(false);
  });

  it('should create from an existing hash', () => {
    const hash = PasswordHash.fromHash('$2b$10$existinghash');
    expect(hash.toString()).toBe('$2b$10$existinghash');
  });
});

// ─── Role ──────────────────────────────────────────────────
describe('Role Entity', () => {
  it('should create all roles via static factories', () => {
    expect(Role.admin().name).toBe('admin');
    expect(Role.receptionist().name).toBe('receptionist');
    expect(Role.trainer().name).toBe('trainer');
    expect(Role.client().name).toBe('client');
  });

  it('should throw for invalid role name', () => {
    expect(() => new Role('superadmin' as any)).toThrow('Invalid role');
  });

  it('should identify admin permissions correctly', () => {
    expect(Role.admin().isAdmin()).toBe(true);
    expect(Role.admin().canManageUsers()).toBe(true);
  });

  it('should deny admin permissions for non-admin roles', () => {
    expect(Role.client().isAdmin()).toBe(false);
    expect(Role.client().canManageUsers()).toBe(false);
    expect(Role.trainer().isAdmin()).toBe(false);
    expect(Role.receptionist().canManageUsers()).toBe(false);
  });
});