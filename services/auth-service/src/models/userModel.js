// Modelo de usuario para Auth Service
// En un caso real, aquí se usaría Sequelize, Mongoose, Prisma, etc.

class UserModel {
  constructor(data) {
    this.id = data.id;
    this.email = data.email;
    this.password = data.password;
    this.role = data.role || 'user';
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  static mockUsers = [];

  static async create(data) {
    const user = new UserModel({
      id: `user-${Date.now()}`,
      ...data,
    });
    UserModel.mockUsers.push(user);
    return user;
  }

  static async findByEmail(email) {
    return UserModel.mockUsers.find((u) => u.email === email);
  }

  static async findById(id) {
    return UserModel.mockUsers.find((u) => u.id === id);
  }
}

module.exports = UserModel;
