const { Pool } = require('pg');
const config = require('../config');

class Database {
  constructor() {
    this.pool = new Pool({
      host: config.dbHost,
      port: config.dbPort,
      database: config.dbName,
      user: config.dbUser,
      password: config.dbPassword,
    });
  }

  async query(text, params) {
    return this.pool.query(text, params);
  }
}

module.exports = new Database();
