// Modelo de membresía para Membership Service
// En un caso real, aquí se usaría Sequelize, Mongoose, Prisma, etc.

class MembershipModel {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    this.price = data.price;
    this.duration = data.duration;
    this.features = data.features || [];
    this.isActive = data.isActive !== undefined ? data.isActive : true;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  static mockMemberships = [];

  static async create(data) {
    const membership = new MembershipModel({
      id: `mem-${Date.now()}`,
      ...data,
    });
    MembershipModel.mockMemberships.push(membership);
    return membership;
  }

  static async findAll() {
    return MembershipModel.mockMemberships;
  }

  static async findById(id) {
    return MembershipModel.mockMemberships.find((m) => m.id === id);
  }
}

module.exports = MembershipModel;
