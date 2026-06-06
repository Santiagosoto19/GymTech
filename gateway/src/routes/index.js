const express = require('express');
const router = express.Router();

// Simple direct proxy using fetch (Node 18+)
async function proxyRequest(req, res, targetService, pathPrefix) {
  // Strip the path prefix from the URL before forwarding
  const strippedPath = req.originalUrl.replace(pathPrefix, '') || '/';
  const url = `${targetService}${strippedPath}`;
  console.log(`[PROXY] ${req.method} ${req.originalUrl} -> ${url}`);

  try {
    const fetchOptions = {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        ...(req.headers.authorization ? { 'Authorization': req.headers.authorization } : {}),
      },
    };

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      fetchOptions.body = JSON.stringify(req.body);
    }

    const response = await fetch(url, fetchOptions);
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    console.error(`[PROXY ERROR] ${req.method} ${req.originalUrl}: ${error.message}`);
    res.status(502).json({ success: false, error: { message: 'Service unavailable' } });
  }
}

// Auth Service
router.use('/auth', (req, res) => proxyRequest(req, res, 'http://auth-service:3001', '/auth'));

// Membership Service
router.use('/memberships', (req, res) => proxyRequest(req, res, 'http://membership-service:3002', '/memberships'));

// Activity Service
router.use('/activities', (req, res) => proxyRequest(req, res, 'http://activity-service:3003', '/activities'));

// Reporting Service
router.use('/reports', (req, res) => proxyRequest(req, res, 'http://reporting-service:3004', '/reports'));

// Notification Service
router.use('/notifications', (req, res) => proxyRequest(req, res, 'http://notification-service:3005', '/notifications'));

module.exports = router;
