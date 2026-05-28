require('dotenv').config();

module.exports = {
  port: process.env.PORT,
  nodeEnv: process.env.NODE_ENV || 'development',
  services: {
    auth: process.env.AUTH_SERVICE_URL,
    membership: process.env.MEMBERSHIP_SERVICE_URL,
    activity: process.env.ACTIVITY_SERVICE_URL,
    reporting: process.env.REPORTING_SERVICE_URL,
    notification: process.env.NOTIFICATION_SERVICE_URL,
  },
};
