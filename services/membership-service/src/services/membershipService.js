class MembershipService {
  constructor() {
    this.memberships = [
      { id: 'mem-1', name: 'Basic', price: 29.99, duration: 'monthly' },
      { id: 'mem-2', name: 'Premium', price: 59.99, duration: 'monthly' },
    ];
  }

  async list() {
    return this.memberships;
  }

  async create(data) {
    const membership = { id: `mem-${Date.now()}`, ...data };
    this.memberships.push(membership);
    return membership;
  }

  async getById(id) {
    const membership = this.memberships.find((m) => m.id === id);
    if (!membership) {
      const err = new Error('Membership not found');
      err.status = 404;
      throw err;
    }
    return membership;
  }

  async update(id, data) {
    const index = this.memberships.findIndex((m) => m.id === id);
    if (index === -1) {
      const err = new Error('Membership not found');
      err.status = 404;
      throw err;
    }
    this.memberships[index] = { ...this.memberships[index], ...data };
    return this.memberships[index];
  }

  async remove(id) {
    const index = this.memberships.findIndex((m) => m.id === id);
    if (index === -1) {
      const err = new Error('Membership not found');
      err.status = 404;
      throw err;
    }
    this.memberships.splice(index, 1);
  }
}

module.exports = new MembershipService();
