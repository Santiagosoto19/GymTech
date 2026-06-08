import { User } from '../domain/entities/User';
import { Role } from '../domain/entities/Role';
import { Email } from '../domain/value-objects/Email';
import { PasswordHash } from '../domain/value-objects/PasswordHash';
import { DocumentNumber } from '../domain/value-objects/DocumentNumber';

describe('User Entity', () => {
  it('should create a user successfully', async () => {
    const passwordHash = await PasswordHash.fromPlaintext('Password123!');

    const user = new User({
      email: Email.create('test@gymtech.com'),
      passwordHash: passwordHash,
      documentNumber: DocumentNumber.create('12345678'),
      role: Role.client(),
      status: 'active',
      firstName: 'John',
      lastName: 'Doe',
    });

    expect(user.email.toString()).toBe('test@gymtech.com');
    expect(user.isActive()).toBe(true);
  });

  it('should correctly identify admin role', () => {
    const adminRole = Role.admin();
    expect(adminRole.isAdmin()).toBe(true);
    expect(adminRole.canManageUsers()).toBe(true);
  });

  it('should correctly identify client role', () => {
    const clientRole = Role.client();
    expect(clientRole.isAdmin()).toBe(false);
    expect(clientRole.canManageUsers()).toBe(false);
  });
});
