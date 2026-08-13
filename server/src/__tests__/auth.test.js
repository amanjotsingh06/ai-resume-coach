const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// ── Test environment setup ──────────────────────────────────────
process.env.JWT_SECRET = 'test-secret-key-for-unit-tests';
process.env.NODE_ENV = 'test';

const app = require('../app');
const { User } = require('../models/User.model');
const { requireAuth } = require('../middleware/auth.middleware');

// ── Mock Mongoose methods ───────────────────────────────────────
jest.mock('../models/User.model');

// ── Helper ──────────────────────────────────────────────────────
const mockUser = {
  _id: '507f1f77bcf86cd799439011',
  email: 'test@example.com',
  password_hash: '$2b$12$hashedpassword',
  name: 'Test User',
  created_at: new Date().toISOString(),
  last_login: null,
  save: jest.fn().mockResolvedValue(true),
  toSafeObject: jest.fn().mockReturnValue({
    _id: '507f1f77bcf86cd799439011',
    email: 'test@example.com',
    name: 'Test User',
    created_at: new Date().toISOString(),
    last_login: null,
  }),
  toObject: jest.fn().mockReturnValue({
    _id: '507f1f77bcf86cd799439011',
    email: 'test@example.com',
    name: 'Test User',
    created_at: new Date().toISOString(),
    last_login: null,
  }),
};

// ── Reset mocks before each test ────────────────────────────────
beforeEach(() => {
  jest.clearAllMocks();
});

// ════════════════════════════════════════════════════════════════
//  REGISTER TESTS
// ════════════════════════════════════════════════════════════════
describe('POST /api/auth/register', () => {
  test('should register a new user successfully', async () => {
    User.findOne.mockResolvedValue(null);
    User.create.mockResolvedValue(mockUser);

    const res = await request(app).post('/api/auth/register').send({
      email: 'newuser@example.com',
      password: 'securePass123',
      name: 'New User',
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user).toBeDefined();
    expect(res.body.data.user.email).toBe('test@example.com');
    expect(res.body.data.user.password_hash).toBeUndefined();
  });

  test('should return 409 for duplicate email', async () => {
    User.findOne.mockResolvedValue(mockUser);

    const res = await request(app).post('/api/auth/register').send({
      email: 'test@example.com',
      password: 'securePass123',
      name: 'Duplicate User',
    });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('AUTH_DUPLICATE');
    expect(res.body.error.message).toBeDefined();
    expect(res.body.error.hint).toBeDefined();
  });

  test('should return 400 for missing required fields', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: 'test@example.com',
      // missing password and name
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  test('should return 400 for short password', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: 'test@example.com',
      password: 'short',
      name: 'Test',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.error.message).toContain('8 characters');
  });

  test('should handle Mongoose 11000 duplicate key race condition', async () => {
    User.findOne.mockResolvedValue(null);
    const duplicateKeyError = new Error('Duplicate key');
    duplicateKeyError.code = 11000;
    User.create.mockRejectedValue(duplicateKeyError);

    const res = await request(app).post('/api/auth/register').send({
      email: 'race@example.com',
      password: 'securePass123',
      name: 'Race Condition User',
    });

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('AUTH_DUPLICATE');
  });
});

// ════════════════════════════════════════════════════════════════
//  LOGIN TESTS
// ════════════════════════════════════════════════════════════════
describe('POST /api/auth/login', () => {
  test('should login successfully and return a JWT token', async () => {
    // Hash a known password for comparison
    const realHash = await bcrypt.hash('correctPassword123', 12);
    const loginUser = {
      ...mockUser,
      password_hash: realHash,
      save: jest.fn().mockResolvedValue(true),
      toSafeObject: mockUser.toSafeObject,
    };
    User.findOne.mockResolvedValue(loginUser);

    const res = await request(app).post('/api/auth/login').send({
      email: 'test@example.com',
      password: 'correctPassword123',
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user).toBeDefined();
    expect(res.body.data.user.password_hash).toBeUndefined();

    // Verify the token is a valid JWT
    const decoded = jwt.verify(res.body.data.token, process.env.JWT_SECRET);
    expect(decoded.email).toBe('test@example.com');
    expect(decoded._id).toBeDefined();
  });

  test('should return 401 for wrong password', async () => {
    const realHash = await bcrypt.hash('correctPassword123', 4); // low rounds for speed
    const loginUser = {
      ...mockUser,
      password_hash: realHash,
    };
    User.findOne.mockResolvedValue(loginUser);

    const res = await request(app).post('/api/auth/login').send({
      email: 'test@example.com',
      password: 'wrongPassword',
    });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('AUTH_INVALID');
    expect(res.body.error.message).toBeDefined();
    expect(res.body.error.hint).toBeDefined();
  });

  test('should return 401 for non-existent email', async () => {
    User.findOne.mockResolvedValue(null);

    const res = await request(app).post('/api/auth/login').send({
      email: 'nobody@example.com',
      password: 'somePassword123',
    });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('AUTH_INVALID');
  });

  test('should return 400 for missing credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({});

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});

// ════════════════════════════════════════════════════════════════
//  requireAuth MIDDLEWARE TESTS
// ════════════════════════════════════════════════════════════════
describe('requireAuth middleware', () => {
  const mockReq = (authHeader) => ({
    headers: { authorization: authHeader },
  });
  const mockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };
  const mockNext = jest.fn();

  beforeEach(() => {
    mockNext.mockClear();
  });

  test('should call next() with a valid token', () => {
    const token = jwt.sign(
      { _id: '123', email: 'test@example.com' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const req = mockReq(`Bearer ${token}`);
    const res = mockRes();

    requireAuth(req, res, mockNext);

    expect(mockNext).toHaveBeenCalledTimes(1);
    expect(req.user).toBeDefined();
    expect(req.user._id).toBe('123');
    expect(req.user.email).toBe('test@example.com');
  });

  test('should return 401 for expired token', () => {
    const token = jwt.sign(
      { _id: '123', email: 'test@example.com' },
      process.env.JWT_SECRET,
      { expiresIn: '0s' } // already expired
    );

    const req = mockReq(`Bearer ${token}`);
    const res = mockRes();

    requireAuth(req, res, mockNext);

    expect(mockNext).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({
          code: 'AUTH_INVALID',
          message: 'Token has expired',
        }),
      })
    );
  });

  test('should return 401 for missing token', () => {
    const req = mockReq(undefined);
    const res = mockRes();

    requireAuth(req, res, mockNext);

    expect(mockNext).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({
          code: 'AUTH_INVALID',
          message: 'Authentication required',
        }),
      })
    );
  });

  test('should return 401 for malformed token', () => {
    const req = mockReq('Bearer not-a-valid-jwt');
    const res = mockRes();

    requireAuth(req, res, mockNext);

    expect(mockNext).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({
          code: 'AUTH_INVALID',
          message: 'Invalid token',
        }),
      })
    );
  });

  test('should return 401 for token signed with wrong secret', () => {
    const token = jwt.sign(
      { _id: '123', email: 'test@example.com' },
      'wrong-secret-key',
      { expiresIn: '7d' }
    );

    const req = mockReq(`Bearer ${token}`);
    const res = mockRes();

    requireAuth(req, res, mockNext);

    expect(mockNext).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({
          code: 'AUTH_INVALID',
        }),
      })
    );
  });
});
