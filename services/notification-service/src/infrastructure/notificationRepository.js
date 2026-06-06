const db = require('./db');

class NotificationRepository {
  async findAll() {
    const res = await db.query('SELECT * FROM notifications ORDER BY sent_at DESC');
    return res.rows;
  }

  async findById(id) {
    const res = await db.query('SELECT * FROM notifications WHERE id = $1', [id]);
    return res.rows[0];
  }

  async create(data) {
    const { userId, message, type, status = 'pending' } = data;
    const res = await db.query(
      'INSERT INTO notifications (user_id, message, type, status, sent_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING *',
      [userId, message, type, status]
    );
    return res.rows[0];
  }

  async getTemplates() {
    const res = await db.query('SELECT * FROM notification_templates');
    return res.rows;
  }
}

module.exports = new NotificationRepository();
