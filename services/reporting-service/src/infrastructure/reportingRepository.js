const db = require('./db');

class ReportingRepository {
  async findAllReports() {
    const res = await db.query('SELECT * FROM reports ORDER BY generated_at DESC');
    return res.rows;
  }

  async findReportById(id) {
    const res = await db.query('SELECT * FROM reports WHERE id = $1', [id]);
    return res.rows[0];
  }

  async createReport(data) {
    const { type, title, description, data_json } = data;
    const res = await db.query(
      'INSERT INTO reports (type, title, description, data, generated_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING *',
      [type, title, description, data_json]
    );
    return res.rows[0];
  }

  async getDashboardStats() {
    // Query compleja de agregación para el dashboard
    const stats = await db.query(`
      SELECT
        (SELECT COUNT(*) FROM auth_db.users) as total_users,
        (SELECT COUNT(*) FROM membership_db.subscriptions WHERE estate = 'active') as active_memberships,
        (SELECT COUNT(*) FROM activity_db.attendance WHERE timestamp::date = CURRENT_DATE) as today_attendance
    `);
    return stats.rows[0];
  }
}

module.exports = new ReportingRepository();
