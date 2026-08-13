const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('../app');
const { User } = require('../models/User.model');
const { Analysis } = require('../models/Analysis.model');
const ProviderFactory = require('../services/ai/providerFactory');

process.env.JWT_SECRET = 'test-secret-key-for-pdf-no-ai';

const makeToken = (userId, email) =>
  jwt.sign({ _id: userId, email }, process.env.JWT_SECRET, { expiresIn: '1h' });

describe('PDF Export & Report Retrieval — Zero AI Call Verification', () => {
  let user, token, analysis;

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

    user = await User.create({
      email: 'pdfuser@example.com',
      password_hash: 'hashedpassword',
      name: 'PDF User',
    });

    token = makeToken(user._id, user.email);

    analysis = await Analysis.create({
      user_id: user._id,
      resume_name: 'Existing_Resume.pdf',
      job_title: 'Senior Engineer',
      ai_provider: 'gemini',
      ai_model: 'gemini-flash-latest',
      resume_text: 'Saved resume content from past analysis run...',
      job_description: 'Saved job description content from past analysis run...',
      match_score: 88,
      matched_skills: ['React', 'Node.js'],
      missing_skills: ['GraphQL'],
    });

    jest.spyOn(ProviderFactory, 'getProvider');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('Fetching analysis by ID for report display/export triggers ZERO AI provider calls', async () => {
    const res = await request(app)
      .get(`/api/analysis/${analysis._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.match_score).toBe(88);
    expect(res.body.data.ai_provider).toBe('gemini');

    // CRITICAL: Zero AI provider calls made
    expect(ProviderFactory.getProvider).not.toHaveBeenCalled();
  });

  test('Fetching analysis history list triggers ZERO AI provider calls', async () => {
    const res = await request(app)
      .get('/api/analysis/history')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBe(1);

    // CRITICAL: Zero AI provider calls made
    expect(ProviderFactory.getProvider).not.toHaveBeenCalled();
  });
});
