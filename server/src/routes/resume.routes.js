const express = require('express');
const { requireAuth } = require('../middleware/auth.middleware');
const { upload, handleUploadError } = require('../middleware/upload.middleware');
const { extractTextFromPDF } = require('../services/pdf.service');

const resumeRouter = express.Router();

/**
 * POST /api/resume/upload
 * Protected: requires a valid Bearer JWT.
 * Accepts a single PDF (field name: "resume") up to 5 MB.
 * Returns extracted text, page count, and word count.
 */
resumeRouter.post(
  '/upload',
  requireAuth,
  // multer parses the multipart form; handleUploadError converts its errors
  (req, res, next) => {
    upload.single('resume')(req, res, (err) => {
      if (err) return handleUploadError(err, req, res, next);
      next();
    });
  },
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'No file uploaded',
            hint: 'Attach a PDF under the "resume" form-data field',
          },
        });
      }

      const result = await extractTextFromPDF(req.file.buffer);

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      if (err.code === 'INVALID_TYPE') {
        return res.status(415).json({
          success: false,
          error: {
            code: 'INVALID_TYPE',
            message: err.message,
            hint: 'Ensure the file is a valid PDF document',
          },
        });
      }
      // PARSE_FAILED comes with a statusCode already set
      if (err.code === 'PARSE_FAILED') {
        return res.status(err.statusCode || 422).json({
          success: false,
          error: {
            code: err.code,
            message: err.message,
            hint: 'Ensure the PDF contains selectable text (not scanned images)',
          },
        });
      }
      next(err);
    }
  }
);

module.exports = { resumeRouter };
