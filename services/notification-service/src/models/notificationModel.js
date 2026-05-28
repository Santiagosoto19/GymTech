// Modelo de notificación para Notification Service
// En un caso real, aquí se usaría Sequelize, Mongoose, Prisma, etc.

class NotificationModel {
  constructor(data) {
    this.id = data.id;
    this.recipient = data.recipient;
    this.channel = data.channel;
    this.subject = data.subject;
    this.body = data.body;
    this.status = data.status || 'pending';
    this.sentAt = data.sentAt || null;
    this.createdAt = data.createdAt || new Date();
  }

  static mockNotifications = [];

  static async create(data) {
    const notification = new NotificationModel({
      id: `notif-${Date.now()}`,
      ...data,
    });
    NotificationModel.mockNotifications.push(notification);
    return notification;
  }

  static async findAll() {
    return NotificationModel.mockNotifications;
  }

  static async findById(id) {
    return NotificationModel.mockNotifications.find((n) => n.id === id);
  }
}

module.exports = NotificationModel;
