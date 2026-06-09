import { User } from '../entities/User';
import { Email } from '../value-objects/Email';
import { DocumentNumber } from '../value-objects/DocumentNumber';

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: Email): Promise<User | null>;
  findByDocumentNumber(documentNumber: DocumentNumber): Promise<User | null>;
  save(user: User): Promise<User>;
  update(user: User): Promise<User>;
  findAll(): Promise<User[]>;
}
