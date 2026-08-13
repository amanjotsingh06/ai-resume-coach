// ── Analysis & AI Route Integration Tests ───────────────────────
// Tests all endpoints on /api/analysis and /api/ai routers.

const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

// ── Test environment setup ──────────────────────────────────────
process.env.JWT_SECRET = 'test-secret-key-for-unit-tests';
process.env.NODE_ENV = 'test';

// ── Mock dependencies before requiring app ──────────────────────
jest.mock('../services/analysis.service');
jest.mock('../models/Analysis.model');

const app = require('../app');
const { Analysis } = require('../models/Analysis.model');
const {
  runFullAnalysis,
  runMatchScore,
  runBulletImprover,
  runInterviewQs,
  runRoadmap,
} = require('../services/analysis.service');

// ── Helpers ─────────────────────────────────────────────────────
const USER_ID = '507f1f77bcf86cd799439011';
const OTHER_USER_ID = '507f1f77bcf86cd799439022';
const ANALYSIS_ID = '60d5f484f1a2c8b1f8e4e1a1';

// Fixtures that satisfy the 50-char minimum validation
const VALID_RESUME = 'Experienced software engineer with 5 years building scalable Node.js APIs and React applications.';
const VALID_JD = 'We are hiring a senior backend engineer with Node.js experience and strong system design skills.';

const makeToken = (overrides = {}) =>
  jwt.sign(
    { _id: USER_ID, email: 'tester@example.com', ...overrides },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

const authHeader = () => ({ Authorization: `Bearer ${makeToken()}` });

// ── Reset mocks ─────────────────────────────────────────────────
beforeEach(() => {
  jest.clearAllMocks();
});

// ════════════════════════════════════════════════════════════════
//  POST /api/analysis/run
// ════════════════════════════════════════════════════════════════
describe('POST /api/analysis/run', () => {
  const fullResult = {
    match_score: 85,
    matched_skills: ['React', 'Node.js'],
    missing_skills: ['Go'],
    experience_alignment: 'Strong',
    overall_assessment: 'Good fit',
    bullet_improvements: [{ original: 'Did stuff', improved: 'Accomplished X' }],
    interview_questions: { questions: [{ question: 'Why React?', category: 'Technical', difficulty: 'Easy' }] },
    roadmap: { roadmap: [{ skill: 'Go', resources: ['Tour of Go'], weeks: 4 }] },
  };

  // ── Auth guard ───────────────────────────────────────────────
  test('should return 401 without authentication', async () => {
    const res = await request(app)
      .post('/api/analysis/run')
      .send({ resumeText: VALID_RESUME, jobDescription: VALID_JD });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('AUTH_INVALID');
  });

  // ── Missing fields ───────────────────────────────────────────
  test('should return 400 when resumeText is missing', async () => {
    const res = await request(app)
      .post('/api/analysis/run')
      .set(authHeader())
      .send({ jobDescription: VALID_JD });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  test('should return 400 when jobDescription is missing', async () => {
    const res = await request(app)
      .post('/api/analysis/run')
      .set(authHeader())
      .send({ resumeText: VALID_RESUME });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  test('should return 400 when both fields are missing', async () => {
    const res = await request(app)
      .post('/api/analysis/run')
      .set(authHeader())
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  // ── Type validation ──────────────────────────────────────────
  test('should return 400 when resumeText is a number (wrong type)', async () => {
    const res = await request(app)
      .post('/api/analysis/run')
      .set(authHeader())
      .send({ resumeText: 12345, jobDescription: VALID_JD });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  test('should return 400 when resumeText is an array (wrong type)', async () => {
    const res = await request(app)
      .post('/api/analysis/run')
      .set(authHeader())
      .send({ resumeText: ['a', 'b'], jobDescription: VALID_JD });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  test('should return 400 when jobDescription is a number (wrong type)', async () => {
    const res = await request(app)
      .post('/api/analysis/run')
      .set(authHeader())
      .send({ resumeText: VALID_RESUME, jobDescription: 999 });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  // ── Minimum length validation ────────────────────────────────
  test('should return 400 when resumeText is a string but < 50 chars', async () => {
    const res = await request(app)
      .post('/api/analysis/run')
      .set(authHeader())
      .send({ resumeText: 'Too short', jobDescription: VALID_JD });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  test('should return 400 when jobDescription is a string but < 50 chars', async () => {
    const res = await request(app)
      .post('/api/analysis/run')
      .set(authHeader())
      .send({ resumeText: VALID_RESUME, jobDescription: 'Short JD' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  // ── Success path ─────────────────────────────────────────────
  test('should return 200 and analysisId on success', async () => {
    runFullAnalysis.mockResolvedValue(fullResult);
    Analysis.create.mockResolvedValue({ _id: ANALYSIS_ID });

    const res = await request(app)
      .post('/api/analysis/run')
      .set(authHeader())
      .send({ resumeText: VALID_RESUME, jobDescription: VALID_JD });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.analysisId).toBe(ANALYSIS_ID);

    // Verify Analysis.create was called with correct shape
    expect(Analysis.create).toHaveBeenCalledTimes(1);
    const createArg = Analysis.create.mock.calls[0][0];
    expect(createArg.user_id).toBe(USER_ID);
    expect(createArg.resume_text).toBe(VALID_RESUME);
    expect(createArg.job_description).toBe(VALID_JD);
    expect(createArg.match_score).toBe(85);
  });

  // ── LLM failure ──────────────────────────────────────────────
  test('should return 503 when LLM is unavailable', async () => {
    const llmError = { code: 'LLM_UNAVAILABLE', message: 'Ollama is not running' };
    runFullAnalysis.mockRejectedValue(llmError);

    const res = await request(app)
      .post('/api/analysis/run')
      .set(authHeader())
      .send({ resumeText: VALID_RESUME, jobDescription: VALID_JD });

    expect(res.status).toBe(503);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('LLM_UNAVAILABLE');
    expect(res.body.error.hint).toBeDefined();
  });

  // ── DB failure ───────────────────────────────────────────────
  test('should propagate to error handler when Analysis.create throws', async () => {
    runFullAnalysis.mockResolvedValue(fullResult);
    Analysis.create.mockRejectedValue(new Error('MongoDB connection lost'));

    const res = await request(app)
      .post('/api/analysis/run')
      .set(authHeader())
      .send({ resumeText: VALID_RESUME, jobDescription: VALID_JD });

    // Default error handler returns 500
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

// ════════════════════════════════════════════════════════════════
//  GET /api/analysis/history
// ════════════════════════════════════════════════════════════════
describe('GET /api/analysis/history', () => {
  test('should return 401 without authentication', async () => {
    const res = await request(app).get('/api/analysis/history');

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('AUTH_INVALID');
  });

  test('should return 200 with analysis history array', async () => {
    const mockHistory = [
      { _id: 'a1', match_score: 90, created_at: '2026-04-01' },
      { _id: 'a2', match_score: 75, created_at: '2026-03-30' },
    ];

    // Build a chainable mock: .find().sort().select().lean()
    const mockLean = jest.fn().mockResolvedValue(mockHistory);
    const mockSelect = jest.fn().mockReturnValue({ lean: mockLean });
    const mockSort = jest.fn().mockReturnValue({ select: mockSelect });
    Analysis.find.mockReturnValue({ sort: mockSort });

    const res = await request(app)
      .get('/api/analysis/history')
      .set(authHeader());

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data).toHaveLength(2);

    // Verify correct query filter
    expect(Analysis.find).toHaveBeenCalledWith({ user_id: USER_ID });
    expect(mockSort).toHaveBeenCalledWith({ created_at: -1 });
    expect(mockSelect).toHaveBeenCalledWith('-resume_text');
  });

  test('should return empty array when no analyses exist', async () => {
    const mockLean = jest.fn().mockResolvedValue([]);
    const mockSelect = jest.fn().mockReturnValue({ lean: mockLean });
    const mockSort = jest.fn().mockReturnValue({ select: mockSelect });
    Analysis.find.mockReturnValue({ sort: mockSort });

    const res = await request(app)
      .get('/api/analysis/history')
      .set(authHeader());

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
  });

  test('should propagate to error handler when DB query throws', async () => {
    // Simulate the chain throwing at .lean()
    const mockLean = jest.fn().mockRejectedValue(new Error('DB timeout'));
    const mockSelect = jest.fn().mockReturnValue({ lean: mockLean });
    const mockSort = jest.fn().mockReturnValue({ select: mockSelect });
    Analysis.find.mockReturnValue({ sort: mockSort });

    const res = await request(app)
      .get('/api/analysis/history')
      .set(authHeader());

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

// ════════════════════════════════════════════════════════════════
//  GET /api/analysis/:id
// ════════════════════════════════════════════════════════════════
describe('GET /api/analysis/:id', () => {
  test('should return 401 without authentication', async () => {
    const res = await request(app).get(`/api/analysis/${ANALYSIS_ID}`);

    expect(res.status).toBe(401);
  });

  test('should return 404 for invalid ObjectId format', async () => {
    const res = await request(app)
      .get('/api/analysis/not-a-valid-id')
      .set(authHeader());

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  test('should return 404 when analysis does not exist', async () => {
    const mockLean = jest.fn().mockResolvedValue(null);
    Analysis.findById.mockReturnValue({ lean: mockLean });

    const validId = new mongoose.Types.ObjectId().toString();
    const res = await request(app)
      .get(`/api/analysis/${validId}`)
      .set(authHeader());

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  test('should return 403 when analysis belongs to different user', async () => {
    const doc = {
      _id: ANALYSIS_ID,
      user_id: new mongoose.Types.ObjectId(OTHER_USER_ID),
      match_score: 80,
    };
    const mockLean = jest.fn().mockResolvedValue(doc);
    Analysis.findById.mockReturnValue({ lean: mockLean });

    const validId = new mongoose.Types.ObjectId().toString();
    const res = await request(app)
      .get(`/api/analysis/${validId}`)
      .set(authHeader());

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  test('should return 200 with analysis data when user owns the document', async () => {
    const doc = {
      _id: ANALYSIS_ID,
      user_id: new mongoose.Types.ObjectId(USER_ID),
      match_score: 88,
      matched_skills: ['JS'],
      resume_text: 'My resume',
    };
    const mockLean = jest.fn().mockResolvedValue(doc);
    Analysis.findById.mockReturnValue({ lean: mockLean });

    const validId = new mongoose.Types.ObjectId().toString();
    const res = await request(app)
      .get(`/api/analysis/${validId}`)
      .set(authHeader());

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.match_score).toBe(88);
  });

  test('should propagate to error handler when DB query throws', async () => {
    const mockLean = jest.fn().mockRejectedValue(new Error('DB error'));
    Analysis.findById.mockReturnValue({ lean: mockLean });

    const validId = new mongoose.Types.ObjectId().toString();
    const res = await request(app)
      .get(`/api/analysis/${validId}`)
      .set(authHeader());

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

// ════════════════════════════════════════════════════════════════
//  POST /api/ai/match-score
// ════════════════════════════════════════════════════════════════
describe('POST /api/ai/match-score', () => {
  test('should return 401 without authentication', async () => {
    const res = await request(app)
      .post('/api/ai/match-score')
      .send({ resumeText: VALID_RESUME, jobDescription: VALID_JD });

    expect(res.status).toBe(401);
  });

  test('should return 400 when resumeText is missing', async () => {
    const res = await request(app)
      .post('/api/ai/match-score')
      .set(authHeader())
      .send({ jobDescription: VALID_JD });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  test('should return 400 when jobDescription is missing', async () => {
    const res = await request(app)
      .post('/api/ai/match-score')
      .set(authHeader())
      .send({ resumeText: VALID_RESUME });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  test('should return 400 when resumeText is a number (wrong type)', async () => {
    const res = await request(app)
      .post('/api/ai/match-score')
      .set(authHeader())
      .send({ resumeText: 42, jobDescription: VALID_JD });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  test('should return 400 when resumeText is a string but < 50 chars', async () => {
    const res = await request(app)
      .post('/api/ai/match-score')
      .set(authHeader())
      .send({ resumeText: 'Short', jobDescription: VALID_JD });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  test('should return 400 when jobDescription is a string but < 50 chars', async () => {
    const res = await request(app)
      .post('/api/ai/match-score')
      .set(authHeader())
      .send({ resumeText: VALID_RESUME, jobDescription: 'Too short' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  test('should return 200 with match score result', async () => {
    const mockResult = { match_score: 90, matched_skills: ['React'], missing_skills: [] };
    runMatchScore.mockResolvedValue(mockResult);

    const res = await request(app)
      .post('/api/ai/match-score')
      .set(authHeader())
      .send({ resumeText: VALID_RESUME, jobDescription: VALID_JD });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual(mockResult);
  });

  test('should return 503 when LLM is unavailable', async () => {
    runMatchScore.mockRejectedValue({ code: 'LLM_UNAVAILABLE', message: 'Down' });

    const res = await request(app)
      .post('/api/ai/match-score')
      .set(authHeader())
      .send({ resumeText: VALID_RESUME, jobDescription: VALID_JD });

    expect(res.status).toBe(503);
    expect(res.body.error.code).toBe('LLM_UNAVAILABLE');
    expect(res.body.error.hint).toBeDefined();
  });
});

// ════════════════════════════════════════════════════════════════
//  POST /api/ai/improve-bullets
// ════════════════════════════════════════════════════════════════
describe('POST /api/ai/improve-bullets', () => {
  test('should return 401 without authentication', async () => {
    const res = await request(app)
      .post('/api/ai/improve-bullets')
      .send({ bullets: ['bullet'] });

    expect(res.status).toBe(401);
  });

  test('should return 400 when bullets is missing', async () => {
    const res = await request(app)
      .post('/api/ai/improve-bullets')
      .set(authHeader())
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  test('should return 400 when bullets is not an array', async () => {
    const res = await request(app)
      .post('/api/ai/improve-bullets')
      .set(authHeader())
      .send({ bullets: 'not an array' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  test('should return 400 when bullets is an empty array', async () => {
    const res = await request(app)
      .post('/api/ai/improve-bullets')
      .set(authHeader())
      .send({ bullets: [] });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  test('should return 400 when bullets array contains non-string elements', async () => {
    const res = await request(app)
      .post('/api/ai/improve-bullets')
      .set(authHeader())
      .send({ bullets: [42, null, 'valid bullet'] });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  test('should return 400 when bullets array contains empty strings', async () => {
    const res = await request(app)
      .post('/api/ai/improve-bullets')
      .set(authHeader())
      .send({ bullets: ['   ', 'valid bullet'] });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  test('should return 200 with improved bullets', async () => {
    const mockResult = [
      { original: 'Did stuff', improved: 'Accomplished X as measured by Y' },
    ];
    runBulletImprover.mockResolvedValue(mockResult);

    const res = await request(app)
      .post('/api/ai/improve-bullets')
      .set(authHeader())
      .send({ bullets: ['Did stuff'], jobDescription: 'Engineer' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual(mockResult);
  });

  test('should return 503 when LLM is unavailable', async () => {
    runBulletImprover.mockRejectedValue({ code: 'LLM_UNAVAILABLE', message: 'Down' });

    const res = await request(app)
      .post('/api/ai/improve-bullets')
      .set(authHeader())
      .send({ bullets: ['bullet'] });

    expect(res.status).toBe(503);
    expect(res.body.error.code).toBe('LLM_UNAVAILABLE');
    expect(res.body.error.hint).toBeDefined();
  });
});

// ════════════════════════════════════════════════════════════════
//  POST /api/ai/interview-questions
// ════════════════════════════════════════════════════════════════
describe('POST /api/ai/interview-questions', () => {
  test('should return 401 without authentication', async () => {
    const res = await request(app)
      .post('/api/ai/interview-questions')
      .send({ resumeText: VALID_RESUME, jobDescription: VALID_JD });

    expect(res.status).toBe(401);
  });

  test('should return 400 when resumeText is missing', async () => {
    const res = await request(app)
      .post('/api/ai/interview-questions')
      .set(authHeader())
      .send({ jobDescription: VALID_JD });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  test('should return 400 when jobDescription is missing', async () => {
    const res = await request(app)
      .post('/api/ai/interview-questions')
      .set(authHeader())
      .send({ resumeText: VALID_RESUME });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  test('should return 400 when resumeText is a string but < 50 chars', async () => {
    const res = await request(app)
      .post('/api/ai/interview-questions')
      .set(authHeader())
      .send({ resumeText: 'Short', jobDescription: VALID_JD });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  test('should return 400 when jobDescription is a non-string type', async () => {
    const res = await request(app)
      .post('/api/ai/interview-questions')
      .set(authHeader())
      .send({ resumeText: VALID_RESUME, jobDescription: { key: 'value' } });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  test('should return 200 with interview questions', async () => {
    const mockResult = {
      questions: [{ question: 'Why?', category: 'Behavioral', difficulty: 'Easy' }],
    };
    runInterviewQs.mockResolvedValue(mockResult);

    const res = await request(app)
      .post('/api/ai/interview-questions')
      .set(authHeader())
      .send({ resumeText: VALID_RESUME, jobDescription: VALID_JD });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.questions).toHaveLength(1);
  });

  test('should return 503 when LLM is unavailable', async () => {
    runInterviewQs.mockRejectedValue({ code: 'LLM_UNAVAILABLE', message: 'Down' });

    const res = await request(app)
      .post('/api/ai/interview-questions')
      .set(authHeader())
      .send({ resumeText: VALID_RESUME, jobDescription: VALID_JD });

    expect(res.status).toBe(503);
    expect(res.body.error.code).toBe('LLM_UNAVAILABLE');
    expect(res.body.error.hint).toBeDefined();
  });
});

// ════════════════════════════════════════════════════════════════
//  POST /api/ai/skill-roadmap
// ════════════════════════════════════════════════════════════════
describe('POST /api/ai/skill-roadmap', () => {
  test('should return 401 without authentication', async () => {
    const res = await request(app)
      .post('/api/ai/skill-roadmap')
      .send({ missingSkills: ['Go'] });

    expect(res.status).toBe(401);
  });

  test('should return 400 when missingSkills is missing', async () => {
    const res = await request(app)
      .post('/api/ai/skill-roadmap')
      .set(authHeader())
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  test('should return 400 when missingSkills is not an array', async () => {
    const res = await request(app)
      .post('/api/ai/skill-roadmap')
      .set(authHeader())
      .send({ missingSkills: 'Go' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  test('should return 400 when missingSkills is an empty array', async () => {
    const res = await request(app)
      .post('/api/ai/skill-roadmap')
      .set(authHeader())
      .send({ missingSkills: [] });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  test('should return 200 with skill roadmap', async () => {
    const mockResult = {
      roadmap: [{ skill: 'Go', resources: ['Tour of Go'], weeks: 4 }],
    };
    runRoadmap.mockResolvedValue(mockResult);

    const res = await request(app)
      .post('/api/ai/skill-roadmap')
      .set(authHeader())
      .send({ missingSkills: ['Go', 'Kubernetes'] });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.roadmap).toHaveLength(1);
  });

  test('should return 503 when LLM is unavailable', async () => {
    runRoadmap.mockRejectedValue({ code: 'LLM_UNAVAILABLE', message: 'Down' });

    const res = await request(app)
      .post('/api/ai/skill-roadmap')
      .set(authHeader())
      .send({ missingSkills: ['Go'] });

    expect(res.status).toBe(503);
    expect(res.body.error.code).toBe('LLM_UNAVAILABLE');
    expect(res.body.error.hint).toBeDefined();
  });
});
