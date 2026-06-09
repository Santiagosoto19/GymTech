import jwt from 'jsonwebtoken';
import { User } from '../entities/User';
import { Role, RoleName } from '../entities/Role';
import { Email } from '../value-objects/Email';
import { PasswordHash } from '../value-objects/PasswordHash';
import { DocumentNumber } from '../value-objects/DocumentNumber';
import { IUserRepository } from '../repositories/IUserRepository';
import { AppError } from '../errors/AppError';

export interface JwtPayload {
  userId: string;
  email: string;
  role: RoleName;
}

export interface LoginResult {
  token: string;
  user: ReturnType<User['toPublicJSON']>;
}

export class AuthService {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly jwtSecret: string,
    private readonly jwtExpiresIn: string
  ) {}

  async login(emailRaw: string, password: string): Promise<LoginResult> {
    const email = Email.create(emailRaw);
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw AppError.unauthorized('Invalid credentials');
    }

    const valid = await user.verifyPassword(password);
    if (!valid) {
      throw AppError.unauthorized('Invalid credentials');
    }

    if (!user.isActive()) {
      throw AppError.forbidden('Account is inactive');
    }

    const token = this.generateToken(user);
    return { token, user: user.toPublicJSON() };
  }

  async createUser(data: {
    email: string;
    password: string;
    documentNumber: string;
    role: RoleName;
    firstName?: string;
    lastName?: string;
  }): Promise<User> {
    const email = Email.create(data.email);
    const documentNumber = DocumentNumber.create(data.documentNumber);
    const role = new Role(data.role);

    const existingEmail = await this.userRepository.findByEmail(email);
    if (existingEmail) {
      throw AppError.conflict('Email is already registered');
    }

    const existingDoc = await this.userRepository.findByDocumentNumber(documentNumber);
    if (existingDoc) {
      throw AppError.conflict('Document number is already registered');
    }

    const passwordHash = await PasswordHash.fromPlaintext(data.password);

    const user = new User({
      email,
      passwordHash,
      documentNumber,
      role,
      status: 'active',
      firstName: data.firstName,
      lastName: data.lastName,
    });

    return this.userRepository.save(user);
  }

  async updateUser(
    id: string,
    data: { email?: string; firstName?: string; lastName?: string; role?: RoleName; password?: string }
  ): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw AppError.notFound('User not found');
    }

    if (data.email) {
      const email = Email.create(data.email);
      const existing = await this.userRepository.findByEmail(email);
      if (existing && existing.id !== id) {
        throw AppError.conflict('Email is already registered');
      }
      user.updateProfile({ email });
    }

    if (data.firstName !== undefined || data.lastName !== undefined) {
      user.updateProfile({ firstName: data.firstName, lastName: data.lastName });
    }

    if (data.role) {
      user.changeRole(new Role(data.role));
    }

    if (data.password) {
      await user.changePassword(data.password);
    }

    return this.userRepository.update(user);
  }

  async updateUserStatus(id: string, status: 'active' | 'inactive'): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw AppError.notFound('User not found');
    }

    user.changeStatus(status);
    return this.userRepository.update(user);
  }

  async getUserById(id: string): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw AppError.notFound('User not found');
    }
    return user;
  }

  async listUsers(): Promise<User[]> {
    return this.userRepository.findAll();
  }

  async lookupByDocument(documentNumberRaw: string): Promise<User> {
    const documentNumber = DocumentNumber.create(documentNumberRaw);
    const user = await this.userRepository.findByDocumentNumber(documentNumber);
    if (!user) {
      throw AppError.notFound('User not found');
    }
    return user;
  }

  async validateUser(id: string): Promise<{ userId: string; active: boolean; status: string; role: RoleName }> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw AppError.notFound('User not found');
    }

    return {
      userId: user.id!,
      active: user.isActive(),
      status: user.getStatus(),
      role: user.getRoleName(),
    };
  }

  verifyToken(token: string): JwtPayload {
    try {
      const decoded = jwt.verify(token, this.jwtSecret) as JwtPayload;
      return decoded;
    } catch {
      throw AppError.unauthorized('Invalid or expired token');
    }
  }

  private generateToken(user: User): string {
    const payload: JwtPayload = {
      userId: user.id!,
      email: user.email.toString(),
      role: user.getRoleName(),
    };
    return jwt.sign(payload, this.jwtSecret, { expiresIn: this.jwtExpiresIn } as jwt.SignOptions);
  }
}
