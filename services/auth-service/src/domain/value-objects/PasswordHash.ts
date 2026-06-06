import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;
const MIN_PASSWORD_LENGTH = 6;

export class PasswordHash {
  private constructor(private readonly hash: string) {}

  static async fromPlaintext(password: string): Promise<PasswordHash> {
    if (!password || password.length < MIN_PASSWORD_LENGTH) {
      throw new Error(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
    }
    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    return new PasswordHash(hash);
  }

  static fromHash(hash: string): PasswordHash {
    return new PasswordHash(hash);
  }

  async verify(plaintext: string): Promise<boolean> {
    return bcrypt.compare(plaintext, this.hash);
  }

  toString(): string {
    return this.hash;
  }
}
