const request = require('supertest');
const jwt = require('jsonwebtoken');

// ── Test environment setup ──────────────────────────────────────
process.env.JWT_SECRET = 'test-secret-key-for-unit-tests';
process.env.NODE_ENV = 'test';

const app = require('../app');

// ── Mock pdf-parse before requiring the service ─────────────────
const mockGetText = jest.fn();
const mockDestroy = jest.fn().mockResolvedValue(undefined);

jest.mock('pdf-parse', () => ({
  PDFParse: jest.fn().mockImplementation(() => ({
    getText: mockGetText,
    destroy: mockDestroy,
  })),
}));

// ── Helpers ─────────────────────────────────────────────────────

/** Generate a valid Bearer token for route protection tests */
const makeToken = () =>
  jwt.sign(
    { _id: 'user123', email: 'tester@example.com' },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

/**
 * Build a minimal PDF buffer.
 * Real pdf-parse is mocked, so the actual bytes don't matter —
 * we just need a Buffer-like payload.
 */
const fakePdfBuffer = () => Buffer.from('%PDF-1.4 fake content');

// ════════════════════════════════════════════════════════════════
//  POST /api/resume/upload — AUTHENTICATION GUARD
// ════════════════════════════════════════════════════════════════
describe('POST /api/resume/upload — auth guard', () => {
  test('should return 401 when no token is supplied', async () => {
    const res = await request(app)
      .post('/api/resume/upload')
      .attach('resume', fakePdfBuffer(), {
        filename: 'cv.pdf',
        contentType: 'application/pdf',
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('AUTH_INVALID');
  });
});

// ════════════════════════════════════════════════════════════════
//  POST /api/resume/upload — VALID PDF
// ════════════════════════════════════════════════════════════════
describe('POST /api/resume/upload — valid PDF', () => {
  beforeEach(() => {
    mockGetText.mockResolvedValue({
      text: 'John Doe — Senior Software Engineer with 10 years of experience in building scalable systems.',
      total: 2,
    });
  });

  test('should return 200 with text, pages, and wordCount', async () => {
    const res = await request(app)
      .post('/api/resume/upload')
      .set('Authorization', `Bearer ${makeToken()}`)
      .attach('resume', fakePdfBuffer(), {
        filename: 'cv.pdf',
        contentType: 'application/pdf',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.text).toBeDefined();
    expect(typeof res.body.data.pages).toBe('number');
    expect(res.body.data.pages).toBe(2);
    expect(typeof res.body.data.wordCount).toBe('number');
    expect(res.body.data.wordCount).toBeGreaterThan(0);
  });
});

// ════════════════════════════════════════════════════════════════
//  POST /api/resume/upload — IMAGE-BASED PDF (no extractable text)
// ════════════════════════════════════════════════════════════════
describe('POST /api/resume/upload — image-based PDF', () => {
  beforeEach(() => {
    mockGetText.mockResolvedValue({
      text: 'scan',   // < 50 chars → PARSE_FAILED
      total: 1,
    });
  });

  test('should return 422 with PARSE_FAILED for image-based PDF', async () => {
    const res = await request(app)
      .post('/api/resume/upload')
      .set('Authorization', `Bearer ${makeToken()}`)
      .attach('resume', fakePdfBuffer(), {
        filename: 'scanned.pdf',
        contentType: 'application/pdf',
      });

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('PARSE_FAILED');
    expect(res.body.error.message).toBeDefined();
  });
});

// ════════════════════════════════════════════════════════════════
//  POST /api/resume/upload — EMPTY PDF (blank pages, no text)
// ════════════════════════════════════════════════════════════════
describe('POST /api/resume/upload — empty PDF', () => {
  beforeEach(() => {
    mockGetText.mockResolvedValue({
      text: '',        // completely empty → PARSE_FAILED
      total: 1,
    });
  });

  test('should return 422 with PARSE_FAILED for an empty PDF', async () => {
    const res = await request(app)
      .post('/api/resume/upload')
      .set('Authorization', `Bearer ${makeToken()}`)
      .attach('resume', fakePdfBuffer(), {
        filename: 'empty.pdf',
        contentType: 'application/pdf',
      });

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('PARSE_FAILED');
  });
});

// ════════════════════════════════════════════════════════════════
//  POST /api/resume/upload — FILE TOO LARGE (> 5 MB)
// ════════════════════════════════════════════════════════════════
describe('POST /api/resume/upload — file too large', () => {
  test('should return 413 with FILE_TOO_LARGE for a file > 5 MB', async () => {
    const oversizedBuffer = Buffer.alloc(5 * 1024 * 1024 + 1, 'x');

    const res = await request(app)
      .post('/api/resume/upload')
      .set('Authorization', `Bearer ${makeToken()}`)
      .attach('resume', oversizedBuffer, {
        filename: 'huge.pdf',
        contentType: 'application/pdf',
      });

    expect(res.status).toBe(413);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('FILE_TOO_LARGE');
  });
});

// ════════════════════════════════════════════════════════════════
//  POST /api/resume/upload — NON-PDF FILE
// ════════════════════════════════════════════════════════════════
describe('POST /api/resume/upload — non-PDF file', () => {
  test('should return 415 with INVALID_TYPE for a .docx file', async () => {
    const wordBuffer = Buffer.from('PK fake docx content');

    const res = await request(app)
      .post('/api/resume/upload')
      .set('Authorization', `Bearer ${makeToken()}`)
      .attach('resume', wordBuffer, {
        filename: 'resume.docx',
        contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });

    expect(res.status).toBe(415);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INVALID_TYPE');
  });

  test('should return 415 with INVALID_TYPE for a plain text file', async () => {
    const textBuffer = Buffer.from('Just plain text');

    const res = await request(app)
      .post('/api/resume/upload')
      .set('Authorization', `Bearer ${makeToken()}`)
      .attach('resume', textBuffer, {
        filename: 'resume.txt',
        contentType: 'text/plain',
      });

    expect(res.status).toBe(415);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INVALID_TYPE');
  });
});

// ════════════════════════════════════════════════════════════════
//  POST /api/resume/upload — NO FILE ATTACHED
// ════════════════════════════════════════════════════════════════
describe('POST /api/resume/upload — no file', () => {
  test('should return 400 with VALIDATION_ERROR when no file is attached', async () => {
    const res = await request(app)
      .post('/api/resume/upload')
      .set('Authorization', `Bearer ${makeToken()}`)
      .field('_dummy', 'value');

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});

// ════════════════════════════════════════════════════════════════
//  extractTextFromPDF — unit tests (service layer)
// ════════════════════════════════════════════════════════════════
describe('extractTextFromPDF (service unit tests)', () => {
  const { extractTextFromPDF } = require('../services/pdf.service');

  beforeEach(() => jest.clearAllMocks());

  test('should return text, pages, and wordCount for valid input', async () => {
    mockGetText.mockResolvedValue({
      text: 'Jane Smith — Product Manager with extensive background in agile methodology.',
      total: 3,
    });

    const result = await extractTextFromPDF(Buffer.from('%PDF-1.4 dummy'));

    expect(result).toMatchObject({
      pages: 3,
    });
    expect(typeof result.text).toBe('string');
    expect(result.text.length).toBeGreaterThanOrEqual(50);
    expect(result.wordCount).toBeGreaterThan(0);
  });

  test('should throw PARSE_FAILED when text is shorter than 50 chars', async () => {
    mockGetText.mockResolvedValue({ text: 'Too short', total: 1 });

    await expect(extractTextFromPDF(Buffer.from('%PDF-1.4 dummy'))).rejects.toMatchObject({
      code: 'PARSE_FAILED',
    });
  });

  test('should throw PARSE_FAILED when pdf-parse itself throws', async () => {
    mockGetText.mockRejectedValue(new Error('Corrupt PDF'));

    await expect(extractTextFromPDF(Buffer.from('%PDF-1.4 dummy'))).rejects.toMatchObject({
      code: 'PARSE_FAILED',
      message: expect.stringContaining('Corrupt PDF'),
    });
  });

  test('wordCount should not count empty tokens from split', async () => {
    mockGetText.mockResolvedValue({
      text: '  Leading and trailing   spaces   around every single word in this sentence  ',
      total: 1,
    });

    const result = await extractTextFromPDF(Buffer.from('%PDF-1.4 dummy'));
    const manualCount = result.text.split(/\s+/).filter(Boolean).length;
    expect(result.wordCount).toBe(manualCount);
  });
});
