const rateLimit = new Map();

const rateLimiter = (maxRequests = 100, windowMs = 60000) => {
  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();

    if (!rateLimit.has(ip)) {
      rateLimit.set(ip, { count: 1, resetTime: now + windowMs });
      return next();
    }

    const record = rateLimit.get(ip);

    if (now > record.resetTime) {
      rateLimit.set(ip, { count: 1, resetTime: now + windowMs });
      return next();
    }

    if (record.count >= maxRequests) {
      return res.status(429).json({
        success: false,
        error: { message: 'Too many requests, please try again later.' },
      });
    }

    record.count += 1;
    next();
  };
};

module.exports = rateLimiter;
