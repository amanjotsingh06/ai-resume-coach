const { PDFParse } = require('pdf-parse');

/**
 * Extracts text content from a PDF buffer.
 *
 * @param {Buffer} buffer - Raw PDF file buffer
 * @returns {{ text: string, pages: number, wordCount: number }}
 * @throws {{ code: 'PARSE_FAILED', message: string }} if PDF is image-based or empty
 */
const extractTextFromPDF = async (buffer) => {
  if (!buffer || buffer.length < 4 || buffer.toString('utf8', 0, 4) !== '%PDF') {
    const error = new Error('Uploaded file does not have a valid PDF header signature');
    error.code = 'INVALID_TYPE';
    error.statusCode = 415;
    throw error;
  }

  let data;
  let parser;

  try {
    parser = new PDFParse({ data: buffer });
    data = await parser.getText();
  } catch (err) {
    const parseError = new Error(`PDF parsing failed: ${err.message}`);
    parseError.code = 'PARSE_FAILED';
    parseError.statusCode = 422;
    throw parseError;
  } finally {
    if (parser) {
      await parser.destroy();
    }
  }

  if (!data || !data.text || data.text.trim().length < 50) {
    const error = new Error('PDF appears to be image-based or empty');
    error.code = 'PARSE_FAILED';
    error.statusCode = 422;
    throw error;
  }

  const text = data.text.trim();

  return {
    text,
    pages: data.total,
    wordCount: text.split(/\s+/).filter(Boolean).length,
  };
};

module.exports = { extractTextFromPDF };
