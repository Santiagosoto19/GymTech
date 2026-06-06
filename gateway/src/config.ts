import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || process.env.GATEWAY_PORT || '8080', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'your_jwt_secret_key',
  frontendOrigin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173',
  services: {
    auth: process.env.AUTH_SERVICE_URL || 'http://auth-service:3001',
    membership: process.env.MEMBERSHIP_SERVICE_URL || 'http://membership-service:3002',
    activity: process.env.ACTIVITY_SERVICE_URL || 'http://activity-service:3003',
    reporting: process.env.REPORTING_SERVICE_URL || 'http://reporting-service:3004',
    notification: process.env.NOTIFICATION_SERVICE_URL || 'http://notification-service:3005',
  },
} as const;
