// ── Prompt Template Structural Tests ────────────────────────────
// Validates that each prompt module exports the correct shape:
//   { system: string, user: function }

const matchScore = require('../prompts/matchScore.prompt');
const bulletImprover = require('../prompts/bulletImprover.prompt');
const interviewQs = require('../prompts/interviewQs.prompt');
const roadmap = require('../prompts/roadmap.prompt');

// ════════════════════════════════════════════════════════════════
//  matchScore.prompt
// ════════════════════════════════════════════════════════════════
describe('matchScore prompt', () => {
  test('should export a system string', () => {
    expect(typeof matchScore.system).toBe('string');
    expect(matchScore.system.length).toBeGreaterThan(0);
  });

  test('system prompt should mention match_score output key', () => {
    expect(matchScore.system).toContain('match_score');
  });

  test('system prompt should mention JSON', () => {
    expect(matchScore.system.toLowerCase()).toContain('json');
  });

  test('should export a user function that returns a string', () => {
    expect(typeof matchScore.user).toBe('function');
    const result = matchScore.user('resume text', 'job desc');
    expect(typeof result).toBe('string');
    expect(result).toContain('resume text');
    expect(result).toContain('job desc');
  });
});

// ════════════════════════════════════════════════════════════════
//  bulletImprover.prompt
// ════════════════════════════════════════════════════════════════
describe('bulletImprover prompt', () => {
  test('should export a system string', () => {
    expect(typeof bulletImprover.system).toBe('string');
    expect(bulletImprover.system.length).toBeGreaterThan(0);
  });

  test('system prompt should mention improved output key', () => {
    expect(bulletImprover.system).toContain('improved');
  });

  test('system prompt should mention XYZ formula', () => {
    expect(bulletImprover.system).toContain('XYZ');
  });

  test('should export a user function that returns a string', () => {
    expect(typeof bulletImprover.user).toBe('function');
    const result = bulletImprover.user('Built APIs', 'Backend role');
    expect(typeof result).toBe('string');
    expect(result).toContain('Built APIs');
    expect(result).toContain('Backend role');
  });
});

// ════════════════════════════════════════════════════════════════
//  interviewQs.prompt
// ════════════════════════════════════════════════════════════════
describe('interviewQs prompt', () => {
  test('should export a system string', () => {
    expect(typeof interviewQs.system).toBe('string');
    expect(interviewQs.system.length).toBeGreaterThan(0);
  });

  test('system prompt should mention questions array', () => {
    expect(interviewQs.system).toContain('questions');
  });

  test('system prompt should mention category and difficulty', () => {
    expect(interviewQs.system).toContain('category');
    expect(interviewQs.system).toContain('difficulty');
  });

  test('system prompt should mention all categories', () => {
    expect(interviewQs.system).toContain('Technical');
    expect(interviewQs.system).toContain('Behavioral');
    expect(interviewQs.system).toContain('Situational');
  });

  test('should export a user function that returns a string', () => {
    expect(typeof interviewQs.user).toBe('function');
    const result = interviewQs.user('resume', 'jd');
    expect(typeof result).toBe('string');
    expect(result).toContain('resume');
    expect(result).toContain('jd');
  });
});

// ════════════════════════════════════════════════════════════════
//  roadmap.prompt
// ════════════════════════════════════════════════════════════════
describe('roadmap prompt', () => {
  test('should export a system string', () => {
    expect(typeof roadmap.system).toBe('string');
    expect(roadmap.system.length).toBeGreaterThan(0);
  });

  test('system prompt should mention roadmap output key', () => {
    expect(roadmap.system).toContain('roadmap');
  });

  test('system prompt should mention resources and weeks', () => {
    expect(roadmap.system).toContain('resources');
    expect(roadmap.system).toContain('weeks');
  });

  test('should export a user function that returns a string', () => {
    expect(typeof roadmap.user).toBe('function');
    const result = roadmap.user(['Docker', 'AWS']);
    expect(typeof result).toBe('string');
    expect(result).toContain('Docker');
    expect(result).toContain('AWS');
  });

  test('user function should format skills as a numbered list', () => {
    const result = roadmap.user(['Go', 'Kubernetes', 'Terraform']);
    expect(result).toContain('1. Go');
    expect(result).toContain('2. Kubernetes');
    expect(result).toContain('3. Terraform');
  });

  test('user function should handle string input gracefully', () => {
    const result = roadmap.user('single skill string');
    expect(typeof result).toBe('string');
    expect(result).toContain('single skill string');
  });
});
