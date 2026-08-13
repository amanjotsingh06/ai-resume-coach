const jwt = require('jsonwebtoken');

/**
 * Middleware: requireAuth
 * Extracts Bearer token from Authorization header, verifies it,
 * attaches decoded payload to req.user, and calls next().
 */
const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'AUTH_INVALID',
        message: 'Authentication required',
        hint: 'Include a valid Bearer token in the Authorization header',
      },
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    const isExpired = err.name === 'TokenExpiredError';
    return res.status(401).json({
      success: false,
      error: {
        code: 'AUTH_INVALID',
        message: isExpired ? 'Token has expired' : 'Invalid token',
        hint: isExpired
          ? 'Please log in again to obtain a new token'
          : 'Ensure you are sending a valid JWT',
      },
    });
  }
};

module.exports = { requireAuth };
