const multer = require('multer');

const FIVE_MB = 5 * 1024 * 1024; // 5 MB in bytes

/**
 * Multer instance configured with:
 * - memoryStorage (no disk writes)
 * - PDF-only mimetype filter
 * - 5 MB file size limit
 */
const upload = multer({
  storage: multer.memoryStorage(),

  fileFilter: (_req, file, cb) => {
    if (file.mimetype !== 'application/pdf') {
      const error = new Error('Only PDF files are accepted');
      error.code = 'INVALID_TYPE';
      error.statusCode = 415;
      return cb(error, false);
    }
    cb(null, true);
  },

  limits: {
    fileSize: FIVE_MB,
  },
});

/**
 * Express error-handling wrapper for multer errors.
 * Normalises multer-specific error codes into the project's error shape.
 */
const handleUploadError = (err, _req, res, next) => {
  if (!err) return next();

  // Multer size-limit error
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      success: false,
      error: {
        code: 'FILE_TOO_LARGE',
        message: 'File exceeds the 5 MB size limit',
        hint: 'Compress or split the PDF and try again',
      },
    });
  }

  // Custom mimetype error set in fileFilter
  if (err.code === 'INVALID_TYPE') {
    return res.status(415).json({
      success: false,
      error: {
        code: 'INVALID_TYPE',
        message: 'Only PDF files are accepted',
        hint: 'Ensure the uploaded file has Content-Type: application/pdf',
      },
    });
  }

  // Pass any other multer / unexpected errors to the global handler
  next(err);
};

module.exports = { upload, handleUploadError };
