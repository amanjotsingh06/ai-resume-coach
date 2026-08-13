// ── App-level Integration Tests ─────────────────────────────────
// Tests the Express app setup: health check, 404 handling, and
// route mounting verification.

const request = require('supertest');

// ── Test environment setup ──────────────────────────────────────
process.env.JWT_SECRET = 'test-secret-key-for-unit-tests';
process.env.NODE_ENV = 'test';

// ── Mock dependencies that hit external services ────────────────
jest.mock('../models/User.model');
jest.mock('../models/Analysis.model');

const app = require('../app');

// ════════════════════════════════════════════════════════════════
//  Health check
// ════════════════════════════════════════════════════════════════
describe('GET /', () => {
  test('should return 200 with status ok', async () => {
    const res = await request(app).get('/');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.message).toBeDefined();
  });
});

// ════════════════════════════════════════════════════════════════
//  Route mounting verification
// ════════════════════════════════════════════════════════════════
describe('Route mounting', () => {
  test('/api/auth routes should be mounted', async () => {
    // Send an empty body → should get 400 (validation), not 404
    const res = await request(app).post('/api/auth/register').send({});

    expect(res.status).not.toBe(404);
  });

  test('/api/resume routes should be mounted', async () => {
    // No auth → 401, not 404
    const res = await request(app).post('/api/resume/upload');

    expect(res.status).toBe(401);
  });

  test('/api/analysis routes should be mounted', async () => {
    // No auth → 401, not 404
    const res = await request(app).post('/api/analysis/run').send({});

    expect(res.status).toBe(401);
  });

  test('/api/ai routes should be mounted', async () => {
    // No auth → 401, not 404
    const res = await request(app).post('/api/ai/match-score').send({});

    expect(res.status).toBe(401);
  });
});

// ════════════════════════════════════════════════════════════════
//  Security headers (helmet)
// ════════════════════════════════════════════════════════════════
describe('Security headers', () => {
  test('should include security headers from helmet', async () => {
    const res = await request(app).get('/');

    // Helmet sets several security headers; check a few key ones
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['x-frame-options']).toBeDefined();
  });
});

// ════════════════════════════════════════════════════════════════
//  JSON body parsing
// ════════════════════════════════════════════════════════════════
describe('JSON body parsing', () => {
  test('should parse JSON request bodies', async () => {
    // Register endpoint parses JSON body → if we get 400 validation, JSON was parsed
    const res = await request(app)
      .post('/api/auth/register')
      .set('Content-Type', 'application/json')
      .send(JSON.stringify({ email: 'x' }));

    // 400 means it parsed the body and ran validation
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});

// ════════════════════════════════════════════════════════════════
//  Unknown routes
// ════════════════════════════════════════════════════════════════
describe('Unknown routes', () => {
  test('GET to a completely unknown route should not return 200', async () => {
    const res = await request(app).get('/api/does-not-exist');

    // Should be 404 (Express default) — NOT 200
    expect(res.status).not.toBe(200);
    expect(res.status).toBe(404);
  });

  test('POST to a completely unknown route should not return 200', async () => {
    const res = await request(app).post('/api/nonexistent-endpoint').send({});

    expect(res.status).not.toBe(200);
    expect(res.status).toBe(404);
  });
});

// ════════════════════════════════════════════════════════════════
//  CORS headers
// ════════════════════════════════════════════════════════════════
describe('CORS headers', () => {
  test('should include Access-Control-Allow-Origin header', async () => {
    const res = await request(app).get('/');

    // cors() sets this header; in test env CLIENT_URL is not set so it defaults to "*"
    expect(res.headers['access-control-allow-origin']).toBeDefined();
  });
});
