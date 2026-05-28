// Modelo de actividad para Activity Service
// En un caso real, aquí se usaría Sequelize, Mongoose, Prisma, etc.

class ActivityModel {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    this.instructor = data.instructor;
    this.schedule = data.schedule;
    this.capacity = data.capacity;
    this.isActive = data.isActive !== undefined ? data.isActive : true;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  static mockActivities = [];

  static async create(data) {
    const activity = new ActivityModel({
      id: `act-${Date.now()}`,
      ...data,
    });
    ActivityModel.mockActivities.push(activity);
    return activity;
  }

  static async findAll() {
    return ActivityModel.mockActivities;
  }

  static async findById(id) {
    return ActivityModel.mockActivities.find((a) => a.id === id);
  }
}

module.exports = ActivityModel;
