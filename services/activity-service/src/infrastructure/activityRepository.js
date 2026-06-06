const db = require('./db');

class ActivityRepository {
  async findAll() {
    const res = await db.query('SELECT * FROM gym_classes');
    return res.rows;
  }

  async findById(id) {
    const res = await db.query('SELECT * FROM gym_classes WHERE id = $1', [id]);
    return res.rows[0];
  }

  async create(data) {
    const { name, description, instructor, schedule, capacity } = data;
    const res = await db.query(
      'INSERT INTO gym_classes (name, description, instructor, schedule, capacity) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, description, instructor, schedule, capacity]
    );
    return res.rows[0];
  }

  async update(id, data) {
    const { name, description, instructor, schedule, capacity } = data;
    const res = await db.query(
      'UPDATE gym_classes SET name = $1, description = $2, instructor = $3, schedule = $4, capacity = $5 WHERE id = $6 RETURNING *',
      [name, description, instructor, schedule, capacity, id]
    );
    return res.rows[0];
  }

  async delete(id) {
    await db.query('DELETE FROM gym_classes WHERE id = $1', [id]);
  }

  async registerAttendance(userId, classId) {
    const res = await db.query(
      'INSERT INTO attendance (user_id, class_id, timestamp) VALUES ($1, $2, NOW()) RETURNING *',
      [userId, classId]
    );
    return res.rows[0];
  }

  async checkCapacity(classId) {
    const res = await db.query(
      'SELECT COUNT(*) as count FROM attendance WHERE class_id = $1',
      [classId]
    );
    return parseInt(res.rows[0].count);
  }
}

module.exports = new ActivityRepository();
