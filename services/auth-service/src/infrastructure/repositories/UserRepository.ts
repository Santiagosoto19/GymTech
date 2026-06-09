import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { User, UserStatus } from '../../domain/entities/User';
import { Role, RoleName } from '../../domain/entities/Role';
import { Email } from '../../domain/value-objects/Email';
import { PasswordHash } from '../../domain/value-objects/PasswordHash';
import { DocumentNumber } from '../../domain/value-objects/DocumentNumber';
import { query } from '../db';

interface UserRow {
  id: string;
  email: string;
  password_hash: string;
  document_number: string;
  role: RoleName;
  status: UserStatus;
  first_name: string | null;
  last_name: string | null;
  created_at: Date;
  updated_at: Date;
}

function mapRowToUser(row: UserRow): User {
  return new User({
    id: row.id,
    email: Email.create(row.email),
    passwordHash: PasswordHash.fromHash(row.password_hash),
    documentNumber: DocumentNumber.create(row.document_number),
    role: new Role(row.role),
    status: row.status,
    firstName: row.first_name ?? undefined,
    lastName: row.last_name ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  });
}

export class UserRepository implements IUserRepository {
  async findById(id: string): Promise<User | null> {
    const { rows } = await query<UserRow>(
      `SELECT * FROM users WHERE id = $1`,
      [id]
    );
    return rows[0] ? mapRowToUser(rows[0]) : null;
  }

  async findByEmail(email: Email): Promise<User | null> {
    const { rows } = await query<UserRow>(
      `SELECT * FROM users WHERE email = $1`,
      [email.toString()]
    );
    return rows[0] ? mapRowToUser(rows[0]) : null;
  }

  async findByDocumentNumber(documentNumber: DocumentNumber): Promise<User | null> {
    const { rows } = await query<UserRow>(
      `SELECT * FROM users WHERE document_number = $1`,
      [documentNumber.toString()]
    );
    return rows[0] ? mapRowToUser(rows[0]) : null;
  }

  async save(user: User): Promise<User> {
    const { rows } = await query<UserRow>(
      `INSERT INTO users (email, password_hash, document_number, role, status, first_name, last_name)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        user.email.toString(),
        user.getPasswordHash().toString(),
        user.documentNumber.toString(),
        user.getRoleName(),
        user.getStatus(),
        user.firstName ?? null,
        user.lastName ?? null,
      ]
    );
    return mapRowToUser(rows[0]);
  }

  async update(user: User): Promise<User> {
    const { rows } = await query<UserRow>(
      `UPDATE users
       SET email = $1, password_hash = $2, role = $3, status = $4,
           first_name = $5, last_name = $6, updated_at = NOW()
       WHERE id = $7
       RETURNING *`,
      [
        user.email.toString(),
        user.getPasswordHash().toString(),
        user.getRoleName(),
        user.getStatus(),
        user.firstName ?? null,
        user.lastName ?? null,
        user.id,
      ]
    );
    if (!rows[0]) {
      throw new Error('User not found during update');
    }
    return mapRowToUser(rows[0]);
  }

  async findAll(): Promise<User[]> {
    const { rows } = await query<UserRow>(`SELECT * FROM users ORDER BY created_at DESC`);
    return rows.map(mapRowToUser);
  }
}
