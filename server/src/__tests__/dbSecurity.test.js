const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('../app');
const { User } = require('../models/User.model');
const { Analysis } = require('../models/Analysis.model');

process.env.JWT_SECRET = 'test-secret-key-for-db-security-tests';

const makeToken = (userId, email) =>
  jwt.sign(
    { _id: userId, email },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

describe('Database Security, Injection & Ownership Isolation Tests', () => {
  let userA, userB;
  let tokenA, tokenB;
  let analysisA, analysisB;

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-resume-coach-test');
    }
  });

  afterAll(async () => {
    await User.deleteMany({});
    await Analysis.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await Analysis.deleteMany({});

    userA = await User.create({
      email: 'usera@example.com',
      password_hash: 'hashA',
      name: 'User A',
    });

    userB = await User.create({
      email: 'userb@example.com',
      password_hash: 'hashB',
      name: 'User B',
    });

    tokenA = makeToken(userA._id, userA.email);
    tokenB = makeToken(userB._id, userB.email);

    analysisA = await Analysis.create({
      user_id: userA._id,
      resume_name: 'Resume A.pdf',
      job_title: 'Developer A',
      ai_provider: 'ollama',
      ai_model: 'mistral',
      resume_text: 'Full resume text for User A at least 50 characters long for valid data',
      job_description: 'Job description for User A at least 50 characters long for valid data',
      match_score: 85,
    });

    analysisB = await Analysis.create({
      user_id: userB._id,
      resume_name: 'Resume B.pdf',
      job_title: 'Developer B',
      ai_provider: 'gemini',
      ai_model: 'gemini-flash-latest',
      resume_text: 'Full resume text for User B at least 50 characters long for valid data',
      job_description: 'Job description for User B at least 50 characters long for valid data',
      match_score: 90,
    });
  });

  test('User A can access Analysis A', async () => {
    const res = await request(app)
      .get(`/api/analysis/${analysisA._id}`)
      .set('Authorization', `Bearer ${tokenA}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data._id).toBe(analysisA._id.toString());
  });

  test('SECURITY: User A CANNOT access Analysis B (returns 403)', async () => {
    const res = await request(app)
      .get(`/api/analysis/${analysisB._id}`)
      .set('Authorization', `Bearer ${tokenA}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  test('SECURITY: User A history contains ONLY Analysis A (no Analysis B leakage)', async () => {
    const res = await request(app)
      .get('/api/analysis/history')
      .set('Authorization', `Bearer ${tokenA}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0]._id).toBe(analysisA._id.toString());
  });

  test('SECURITY: User A bulk delete deletes ONLY Analysis A (Analysis B preserved)', async () => {
    const res = await request(app)
      .delete('/api/analysis/all')
      .set('Authorization', `Bearer ${tokenA}`);

    expect(res.status).toBe(200);
    expect(res.body.data.deletedCount).toBe(1);

    const bStillExists = await Analysis.findById(analysisB._id);
    expect(bStillExists).not.toBeNull();
  });

  test('INJECTION SAFETY: Malformed/injected ObjectId param returns 404 cleanly', async () => {
    const res = await request(app)
      .get('/api/analysis/123-not-an-object-id')
      .set('Authorization', `Bearer ${tokenA}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  test('DB FAILURE SAFETY: Handles database query failure gracefully with 500 JSON response', async () => {
    const spy = jest.spyOn(Analysis, 'find').mockImplementationOnce(() => {
      throw new Error('Database connection lost');
    });

    const res = await request(app)
      .get('/api/analysis/history')
      .set('Authorization', `Bearer ${tokenA}`);

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');

    spy.mockRestore();
  });
});
