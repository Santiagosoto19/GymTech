import { Email } from '../value-objects/Email';
import { PasswordHash } from '../value-objects/PasswordHash';
import { DocumentNumber } from '../value-objects/DocumentNumber';
import { Role, RoleName } from './Role';

export type UserStatus = 'active' | 'inactive';

export interface UserProps {
  id?: string;
  email: Email;
  passwordHash: PasswordHash;
  documentNumber: DocumentNumber;
  role: Role;
  status: UserStatus;
  firstName?: string;
  lastName?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class User {
  readonly id?: string;
  email: Email;
  private passwordHash: PasswordHash;
  readonly documentNumber: DocumentNumber;
  private role: Role;
  private status: UserStatus;
  firstName?: string;
  lastName?: string;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;

  constructor(props: UserProps) {
    this.id = props.id;
    this.email = props.email;
    this.passwordHash = props.passwordHash;
    this.documentNumber = props.documentNumber;
    this.role = props.role;
    this.status = props.status;
    this.firstName = props.firstName;
    this.lastName = props.lastName;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  getRole(): Role {
    return this.role;
  }

  getRoleName(): RoleName {
    return this.role.name;
  }

  getStatus(): UserStatus {
    return this.status;
  }

  isActive(): boolean {
    return this.status === 'active';
  }

  async verifyPassword(plaintext: string): Promise<boolean> {
    return this.passwordHash.verify(plaintext);
  }

  getPasswordHash(): PasswordHash {
    return this.passwordHash;
  }

  updateProfile(data: { firstName?: string; lastName?: string; email?: Email }): void {
    if (data.firstName !== undefined) this.firstName = data.firstName;
    if (data.lastName !== undefined) this.lastName = data.lastName;
    if (data.email !== undefined) {
      this.email = data.email;
    }
  }

  changeRole(role: Role): void {
    this.role = role;
  }

  changeStatus(status: UserStatus): void {
    this.status = status;
  }

  async changePassword(plaintext: string): Promise<void> {
    this.passwordHash = await PasswordHash.fromPlaintext(plaintext);
  }

  toPublicJSON() {
    return {
      id: this.id,
      email: this.email.toString(),
      documentNumber: this.documentNumber.toString(),
      role: this.getRoleName(),
      status: this.status,
      firstName: this.firstName ?? null,
      lastName: this.lastName ?? null,
    };
  }
}
