const { createProxyMiddleware } = require('http-proxy-middleware');
const config = require('./config');
const express = require('express');
const router = express.Router();

const createServiceProxy = (target, pathRewrite) => {
  return createProxyMiddleware({
    target,
    changeOrigin: true,
    pathRewrite,
    onError: (err, req, res) => {
      console.error(`Proxy error: ${err.message}`);
      res.status(502).json({ error: 'Service unavailable', message: err.message });
    },
  });
};

// Auth Service
router.use('/auth', createServiceProxy(config.services.auth, { '^/auth': '' }));

// Membership Service
router.use('/memberships', createServiceProxy(config.services.membership, { '^/memberships': '' }));

// Activity Service
router.use('/activities', createServiceProxy(config.services.activity, { '^/activities': '' }));

// Reporting Service
router.use('/reports', createServiceProxy(config.services.reporting, { '^/reports': '' }));

// Notification Service
router.use('/notifications', createServiceProxy(config.services.notification, { '^/notifications': '' }));

module.exports = router;
