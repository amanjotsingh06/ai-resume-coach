// ── Error Middleware Unit Tests ──────────────────────────────────
// Tests the global error handler that normalises errors into the
// standard { success, error: { code, message, hint } } shape.

const { errorHandler } = require('../middleware/error.middleware');

// ── Helper to create mock req/res/next ──────────────────────────
const mockReq = () => ({});
const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};
const mockNext = jest.fn();

// Suppress console.error output during tests
beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});
afterAll(() => {
  console.error.mockRestore();
});

beforeEach(() => {
  jest.clearAllMocks();
});

// ════════════════════════════════════════════════════════════════
//  Mongoose ValidationError
// ════════════════════════════════════════════════════════════════
describe('errorHandler — Mongoose ValidationError', () => {
  test('should return 400 with VALIDATION_ERROR code', () => {
    const err = new Error('Validation failed');
    err.name = 'ValidationError';
    err.errors = {
      email: { message: 'Email is required' },
      name: { message: 'Name is required' },
    };

    const req = mockReq();
    const res = mockRes();

    errorHandler(err, req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({
          code: 'VALIDATION_ERROR',
        }),
      })
    );

    // Message should concatenate all validation messages
    const response = res.json.mock.calls[0][0];
    expect(response.error.message).toContain('Email is required');
    expect(response.error.message).toContain('Name is required');
  });
});

// ════════════════════════════════════════════════════════════════
//  Mongoose Duplicate Key Error (11000)
// ════════════════════════════════════════════════════════════════
describe('errorHandler — Duplicate key error (11000)', () => {
  test('should return 409 with AUTH_DUPLICATE code', () => {
    const err = new Error('Duplicate key');
    err.code = 11000;
    err.keyValue = { email: 'test@example.com' };

    const req = mockReq();
    const res = mockRes();

    errorHandler(err, req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({
          code: 'AUTH_DUPLICATE',
          message: 'Duplicate value for field: email',
        }),
      })
    );
  });
});

// ════════════════════════════════════════════════════════════════
//  Default 500 error
// ════════════════════════════════════════════════════════════════
describe('errorHandler — default fallback', () => {
  test('should return 500 with INTERNAL_ERROR for generic errors', () => {
    const err = new Error('Something went wrong');

    const req = mockReq();
    const res = mockRes();

    errorHandler(err, req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({
          code: 'INTERNAL_ERROR',
          message: 'Something went wrong',
        }),
      })
    );
  });

  test('should use custom statusCode when provided on the error', () => {
    const err = new Error('Not Found');
    err.statusCode = 404;
    err.code = 'CUSTOM_NOT_FOUND';
    err.hint = 'Check the resource ID';

    const req = mockReq();
    const res = mockRes();

    errorHandler(err, req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({
          code: 'CUSTOM_NOT_FOUND',
          message: 'Not Found',
          hint: 'Check the resource ID',
        }),
      })
    );
  });

  test('should fallback to defaults when error has no message/code/hint', () => {
    const err = {};

    const req = mockReq();
    const res = mockRes();

    errorHandler(err, req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(500);
    const response = res.json.mock.calls[0][0];
    expect(response.error.code).toBe('INTERNAL_ERROR');
    expect(response.error.message).toBe('An unexpected error occurred');
    expect(response.error.hint).toBe('Please try again later');
  });
});
