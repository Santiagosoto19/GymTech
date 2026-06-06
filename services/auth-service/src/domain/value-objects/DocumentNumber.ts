export class DocumentNumber {
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static create(raw: string): DocumentNumber {
    const normalized = raw.trim().toUpperCase();
    if (!normalized || normalized.length < 3 || normalized.length > 20) {
      throw new Error('Document number must be between 3 and 20 characters');
    }
    if (!/^[A-Z0-9-]+$/.test(normalized)) {
      throw new Error('Document number contains invalid characters');
    }
    return new DocumentNumber(normalized);
  }

  toString(): string {
    return this.value;
  }

  equals(other: DocumentNumber): boolean {
    return this.value === other.value;
  }
}
