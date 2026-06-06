export const ROLES = ['admin', 'receptionist', 'trainer', 'client'] as const;

export type RoleName = (typeof ROLES)[number];

export class Role {
  constructor(public readonly name: RoleName) {
    if (!ROLES.includes(name)) {
      throw new Error(`Invalid role: ${name}`);
    }
  }

  static admin(): Role {
    return new Role('admin');
  }

  static receptionist(): Role {
    return new Role('receptionist');
  }

  static trainer(): Role {
    return new Role('trainer');
  }

  static client(): Role {
    return new Role('client');
  }

  isAdmin(): boolean {
    return this.name === 'admin';
  }

  canManageUsers(): boolean {
    return this.name === 'admin';
  }
}
