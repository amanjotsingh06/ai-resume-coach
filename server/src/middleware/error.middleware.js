/**
 * Global error handler middleware.
 * Must be registered LAST with app.use().
 */
const errorHandler = (err, req, res, _next) => {
  if (process.env.NODE_ENV !== 'test') {
    console.error('Unhandled error:', err.message || err.code || 'Internal Error');
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: messages.join('; '),
        hint: 'Check the request body for validation issues',
      },
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({
      success: false,
      error: {
        code: 'AUTH_DUPLICATE',
        message: `Duplicate value for field: ${field}`,
        hint: `A record with this ${field} already exists`,
      },
    });
  }

  // Default 500
  const statusCode = err.statusCode || 500;
  return res.status(statusCode).json({
    success: false,
    error: {
      code: err.code || 'INTERNAL_ERROR',
      message: err.message || 'An unexpected error occurred',
      hint: err.hint || 'Please try again later',
    },
  });
};

module.exports = { errorHandler };
