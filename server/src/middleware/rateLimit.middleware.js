/**
 * Lightweight, in-memory rate limiting middleware.
 * Stores request timestamps per client key (IP or User ID).
 */

const createRateLimiter = ({ windowMs, maxRequests, keyPrefix, message }) => {
  const store = new Map();

  // Periodically clean up expired entries to prevent memory leaks
  setInterval(() => {
    const now = Date.now();
    for (const [key, timestamps] of store.entries()) {
      const valid = timestamps.filter((time) => now - time < windowMs);
      if (valid.length === 0) {
        store.delete(key);
      } else {
        store.set(key, valid);
      }
    }
  }, windowMs).unref();

  return (req, res, next) => {
    // Disable rate limiting during automated unit/integration tests
    if (process.env.NODE_ENV === 'test') {
      return next();
    }

    const clientId = req.user ? req.user._id : req.ip || req.connection.remoteAddress;
    const key = `${keyPrefix}:${clientId}`;
    const now = Date.now();

    const timestamps = store.get(key) || [];
    const recent = timestamps.filter((t) => now - t < windowMs);

    if (recent.length >= maxRequests) {
      return res.status(429).json({
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: message || 'Too many requests. Please try again later.',
          hint: `Limit is ${maxRequests} requests per ${Math.ceil(windowMs / 60000)} minutes.`,
        },
      });
    }

    recent.push(now);
    store.set(key, recent);
    next();
  };
};

const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 10,
  keyPrefix: 'auth',
  message: 'Too many authentication attempts. Please try again in 15 minutes.',
});

const analysisRateLimiter = createRateLimiter({
  windowMs: 10 * 60 * 1000, // 10 minutes
  maxRequests: 5,
  keyPrefix: 'analysis',
  message: 'Analysis rate limit exceeded. Please wait a few minutes before analyzing another resume.',
});

module.exports = {
  createRateLimiter,
  authRateLimiter,
  analysisRateLimiter,
};
