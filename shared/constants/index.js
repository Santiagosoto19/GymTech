const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
};

const ERROR_MESSAGES = {
  NOT_FOUND: 'Resource not found',
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'Forbidden access',
  VALIDATION_ERROR: 'Validation error',
  INTERNAL_ERROR: 'Internal server error',
  SERVICE_UNAVAILABLE: 'Service temporarily unavailable',
};

const SERVICES = {
  AUTH: 'auth-service',
  MEMBERSHIP: 'membership-service',
  ACTIVITY: 'activity-service',
  REPORTING: 'reporting-service',
  NOTIFICATION: 'notification-service',
  GATEWAY: 'gateway',
};

const DB_TYPES = {
  POSTGRES: 'postgres',
  MONGO: 'mongodb',
  MYSQL: 'mysql',
};

module.exports = {
  HTTP_STATUS,
  ERROR_MESSAGES,
  SERVICES,
  DB_TYPES,
};
