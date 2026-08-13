const request = require('supertest');
const mongoose = require('mongoose');
const { OAuth2Client } = require('google-auth-library');
const app = require('../app');
const { User } = require('../models/User.model');

process.env.JWT_SECRET = 'test-secret-key-for-oauth-tests';
process.env.GOOGLE_CLIENT_ID = 'test-google-client-id.apps.googleusercontent.com';

// Mock google-auth-library
jest.mock('google-auth-library');

describe('Google OAuth Security & Boundary Tests', () => {
  let mockVerifyIdToken;

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-resume-coach-test');
    }
  });

  afterAll(async () => {
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await User.deleteMany({});
    jest.clearAllMocks();

    mockVerifyIdToken = jest.fn();
    OAuth2Client.prototype.verifyIdToken = mockVerifyIdToken;
  });

  test('Valid Google ID token → User created, JWT issued', async () => {
    mockVerifyIdToken.mockResolvedValue({
      getPayload: () => ({
        email: 'newuser@example.com',
        sub: 'google-uid-123',
        name: 'New Google User',
        email_verified: true,
      }),
    });

    const res = await request(app)
      .post('/api/auth/google')
      .send({ idToken: 'valid-google-id-token' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.email).toBe('newuser@example.com');
    expect(res.body.data.user.password_hash).toBeUndefined();

    const dbUser = await User.findOne({ email: 'newuser@example.com' });
    expect(dbUser).not.toBeNull();
    expect(dbUser.google_id).toBe('google-uid-123');
  });

  test('Invalid Google ID token → 401 Unauthorized', async () => {
    mockVerifyIdToken.mockRejectedValue(new Error('Invalid token signature'));

    const res = await request(app)
      .post('/api/auth/google')
      .send({ idToken: 'invalid-token' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('AUTH_INVALID');
  });

  test('Expired Google ID token → 401 Unauthorized', async () => {
    mockVerifyIdToken.mockRejectedValue(new Error('Token used too late'));

    const res = await request(app)
      .post('/api/auth/google')
      .send({ idToken: 'expired-token' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('AUTH_INVALID');
  });

  test('Wrong audience/client ID → 401 Unauthorized', async () => {
    mockVerifyIdToken.mockRejectedValue(new Error('Wrong recipient, payload audience != client id'));

    const res = await request(app)
      .post('/api/auth/google')
      .send({ idToken: 'token-for-wrong-app' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('AUTH_INVALID');
  });

  test('Unverified email claim → 401 Unauthorized', async () => {
    mockVerifyIdToken.mockResolvedValue({
      getPayload: () => ({
        email: 'unverified@example.com',
        sub: 'google-uid-456',
        name: 'Unverified User',
        email_verified: false,
      }),
    });

    const res = await request(app)
      .post('/api/auth/google')
      .send({ idToken: 'token-unverified-email' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('AUTH_INVALID');
  });

  test('Missing required claims → 401 Unauthorized', async () => {
    mockVerifyIdToken.mockResolvedValue({
      getPayload: () => null,
    });

    const res = await request(app)
      .post('/api/auth/google')
      .send({ idToken: 'malformed-payload-token' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('AUTH_INVALID');
  });

  test('CRITICAL SECURITY: Client sends body with email: "victim@example.com" without valid token → MUST REJECT 401', async () => {
    await User.create({
      email: 'victim@example.com',
      password_hash: 'hashedpass',
      name: 'Victim User',
    });

    mockVerifyIdToken.mockRejectedValue(new Error('Fake token'));

    const res = await request(app)
      .post('/api/auth/google')
      .send({
        idToken: 'fake-token-attempting-spoof',
        email: 'victim@example.com',
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);

    const victimInDb = await User.findOne({ email: 'victim@example.com' });
    expect(victimInDb.google_id).toBeUndefined();
  });

  test('Account Linking: Verified Google identity with existing email → Links account to single user', async () => {
    const existing = await User.create({
      email: 'existing@example.com',
      password_hash: 'hashedpassword',
      name: 'Existing User',
      auth_provider: 'email',
    });

    mockVerifyIdToken.mockResolvedValue({
      getPayload: () => ({
        email: 'existing@example.com',
        sub: 'google-sub-789',
        name: 'Existing User Google Name',
        email_verified: true,
      }),
    });

    const res = await request(app)
      .post('/api/auth/google')
      .send({ idToken: 'valid-linking-token' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const users = await User.find({ email: 'existing@example.com' });
    expect(users.length).toBe(1);
    expect(users[0]._id.toString()).toBe(existing._id.toString());
    expect(users[0].google_id).toBe('google-sub-789');
  });
});
