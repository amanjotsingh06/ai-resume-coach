const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('../app');
const { User } = require('../models/User.model');
const { Analysis } = require('../models/Analysis.model');
const ProviderFactory = require('../services/ai/providerFactory');

process.env.JWT_SECRET = 'test-secret-key-for-concurrent-tests';

const makeToken = (userId, email) =>
  jwt.sign({ _id: userId, email }, process.env.JWT_SECRET, { expiresIn: '1h' });

describe('Concurrent Analysis Submissions & Provider Isolation Tests', () => {
  let userA, userB;
  let tokenA, tokenB;

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

    userA = await User.create({ email: 'concurrentA@example.com', password_hash: 'h', name: 'User A' });
    userB = await User.create({ email: 'concurrentB@example.com', password_hash: 'h', name: 'User B' });

    tokenA = makeToken(userA._id, userA.email);
    tokenB = makeToken(userB._id, userB.email);
  });

  test('Concurrent analysis submissions retain separate provider metadata and user ownership', async () => {
    const mockGemini = {
      generateAnalysis: jest.fn().mockResolvedValue({
        atsScore: 92,
        skills: { matched: ['Python'], missing: ['Rust'] },
        summary: 'Gemini Candidate Summary',
      }),
    };

    const mockOllama = {
      generateAnalysis: jest.fn().mockResolvedValue({
        atsScore: 78,
        skills: { matched: ['JavaScript'], missing: ['Go'] },
        summary: 'Ollama Candidate Summary',
      }),
    };

    jest.spyOn(ProviderFactory, 'getProvider').mockImplementation((providerName) => {
      if (providerName === 'gemini') return mockGemini;
      if (providerName === 'ollama') return mockOllama;
      throw new Error('Unknown provider');
    });

    const payloadA = {
      resumeText: 'User A resume text containing at least 50 characters for validation',
      jobDescription: 'User A job description containing at least 50 characters for validation',
      provider: 'gemini',
      model: 'gemini-flash-latest',
    };

    const payloadB = {
      resumeText: 'User B resume text containing at least 50 characters for validation',
      jobDescription: 'User B job description containing at least 50 characters for validation',
      provider: 'ollama',
      model: 'mistral',
    };

    // Execute concurrent HTTP requests
    const [resA, resB] = await Promise.all([
      request(app).post('/api/analysis/run').set('Authorization', `Bearer ${tokenA}`).send(payloadA),
      request(app).post('/api/analysis/run').set('Authorization', `Bearer ${tokenB}`).send(payloadB),
    ]);

    expect(resA.status).toBe(200);
    expect(resB.status).toBe(200);

    const docA = await Analysis.findById(resA.body.data.analysisId);
    const docB = await Analysis.findById(resB.body.data.analysisId);

    expect(docA.user_id.toString()).toBe(userA._id.toString());
    expect(docA.ai_provider).toBe('gemini');
    expect(docA.match_score).toBe(92);
    expect(docA.overall_assessment).toBe('Gemini Candidate Summary');

    expect(docB.user_id.toString()).toBe(userB._id.toString());
    expect(docB.ai_provider).toBe('ollama');
    expect(docB.match_score).toBe(78);
    expect(docB.overall_assessment).toBe('Ollama Candidate Summary');

    ProviderFactory.getProvider.mockRestore();
  });
});
