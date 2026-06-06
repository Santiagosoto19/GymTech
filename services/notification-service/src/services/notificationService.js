const notificationRepo = require('../infrastructure/notificationRepository');

class NotificationService {
  async send(data) {
    // Aquí se integraría el envío real vía AWS SES, Twilio o Firebase
    console.log(`[Notification] Sending ${data.type} to ${data.userId}...`);
    return await notificationRepo.create(data);
  }

  async list() {
    return await notificationRepo.findAll();
  }

  async getById(id) {
    const notification = await notificationRepo.findById(id);
    if (!notification) {
      const err = new Error('Notification not found');
      err.status = 404;
      throw err;
    }
    return notification;
  }

  async getTemplates() {
    return await notificationRepo.getTemplates();
  }
}

module.exports = new NotificationService();
