class NotificationService {
  constructor() {
    this.notifications = [];
    this.templates = [
      { id: 'tpl-1', name: 'welcome', subject: 'Welcome to GymTech', channel: 'email' },
      { id: 'tpl-2', name: 'membership-renewal', subject: 'Renew your membership', channel: 'email' },
      { id: 'tpl-3', name: 'class-reminder', subject: 'Upcoming class reminder', channel: 'push' },
    ];
  }

  async send(data) {
    const notification = {
      id: `notif-${Date.now()}`,
      status: 'sent',
      sentAt: new Date(),
      ...data,
    };
    this.notifications.push(notification);
    console.log(`[Notification] ${data.channel} sent to ${data.recipient}`);
    return notification;
  }

  async list() {
    return this.notifications;
  }

  async getById(id) {
    const notification = this.notifications.find((n) => n.id === id);
    if (!notification) {
      const err = new Error('Notification not found');
      err.status = 404;
      throw err;
    }
    return notification;
  }

  async getTemplates() {
    return this.templates;
  }
}

module.exports = new NotificationService();
