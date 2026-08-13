// ── Analysis Service Unit Tests ─────────────────────────────────
// Tests the orchestration layer that coordinates all AI features.

process.env.OLLAMA_URL = 'http://localhost:11434';
process.env.OLLAMA_MODEL = 'mistral';

// ── Mock ProviderFactory before requiring analysis service ──────
jest.mock('../services/ai/providerFactory');
const ProviderFactory = require('../services/ai/providerFactory');

const mockGenerateAnalysis = jest.fn();
const mockProvider = { generateAnalysis: mockGenerateAnalysis };

const {
  runMatchScore,
  runBulletImprover,
  runInterviewQs,
  runRoadmap,
  runFullAnalysis,
} = require('../services/analysis.service');

// ── Reset mocks before each test ────────────────────────────────
beforeEach(() => {
  jest.clearAllMocks();
  ProviderFactory.getProvider.mockReturnValue(mockProvider);
});

// ════════════════════════════════════════════════════════════════
//  runMatchScore
// ════════════════════════════════════════════════════════════════
describe('runMatchScore', () => {
  const fakeResult = {
    match_score: 82,
    matched_skills: ['JavaScript', 'React'],
    missing_skills: ['Go'],
    experience_alignment: 'Strong alignment',
    overall_assessment: 'Good fit',
  };

  test('should call provider.generateAnalysis with matchScore prompts and return result', async () => {
    mockGenerateAnalysis.mockResolvedValue(fakeResult);

    const result = await runMatchScore('resume text', 'job description');

    expect(ProviderFactory.getProvider).toHaveBeenCalledWith('ollama');
    expect(mockGenerateAnalysis).toHaveBeenCalledTimes(1);

    const { systemPrompt, userPrompt } = mockGenerateAnalysis.mock.calls[0][0];
    expect(typeof systemPrompt).toBe('string');
    expect(systemPrompt).toContain('match_score');
    expect(userPrompt).toContain('resume text');
    expect(userPrompt).toContain('job description');
    expect(result).toEqual(fakeResult);
  });

  test('should propagate LLM_UNAVAILABLE errors', async () => {
    mockGenerateAnalysis.mockRejectedValue({ code: 'LLM_UNAVAILABLE', message: 'Ollama is not running' });

    await expect(runMatchScore('r', 'j')).rejects.toEqual(
      expect.objectContaining({ code: 'LLM_UNAVAILABLE' })
    );
  });
});

// ════════════════════════════════════════════════════════════════
//  runBulletImprover
// ════════════════════════════════════════════════════════════════
describe('runBulletImprover', () => {
  test('should call provider.generateAnalysis once per bullet and return improved bullets', async () => {
    mockGenerateAnalysis
      .mockResolvedValueOnce({ improved: 'Improved bullet 1' })
      .mockResolvedValueOnce({ improved: 'Improved bullet 2' });

    const bullets = ['Original bullet 1', 'Original bullet 2'];
    const result = await runBulletImprover(bullets, 'jd context');

    expect(mockGenerateAnalysis).toHaveBeenCalledTimes(2);
    expect(result).toEqual([
      { original: 'Original bullet 1', improved: 'Improved bullet 1' },
      { original: 'Original bullet 2', improved: 'Improved bullet 2' },
    ]);
  });

  test('should mark individual failed bullets with error: true', async () => {
    mockGenerateAnalysis
      .mockResolvedValueOnce({ improved: 'Improved bullet 1' })
      .mockRejectedValueOnce(new Error('LLM timeout'));

    const bullets = ['Good bullet', 'Bad bullet'];
    const result = await runBulletImprover(bullets, 'jd');

    expect(result).toEqual([
      { original: 'Good bullet', improved: 'Improved bullet 1' },
      { original: 'Bad bullet', improved: null, error: true },
    ]);
  });

  test('should return empty array when called with no bullets', async () => {
    const result = await runBulletImprover([], 'jd');

    expect(mockGenerateAnalysis).not.toHaveBeenCalled();
    expect(result).toEqual([]);
  });

  test('should handle all bullets failing gracefully', async () => {
    mockGenerateAnalysis.mockRejectedValue(new Error('All fail'));

    const bullets = ['Bullet A', 'Bullet B'];
    const result = await runBulletImprover(bullets, 'jd');

    expect(result).toEqual([
      { original: 'Bullet A', improved: null, error: true },
      { original: 'Bullet B', improved: null, error: true },
    ]);
  });
});

// ════════════════════════════════════════════════════════════════
//  runInterviewQs
// ════════════════════════════════════════════════════════════════
describe('runInterviewQs', () => {
  const fakeQuestions = {
    questions: [
      { question: 'What is React?', category: 'Technical', difficulty: 'Easy' },
    ],
  };

  test('should call provider.generateAnalysis with interviewQs prompts and return result', async () => {
    mockGenerateAnalysis.mockResolvedValue(fakeQuestions);

    const result = await runInterviewQs('resume', 'jd');

    expect(mockGenerateAnalysis).toHaveBeenCalledTimes(1);
    const { systemPrompt, userPrompt } = mockGenerateAnalysis.mock.calls[0][0];
    expect(systemPrompt).toContain('interview');
    expect(userPrompt).toContain('resume');
    expect(userPrompt).toContain('jd');
    expect(result).toEqual(fakeQuestions);
  });

  test('should propagate LLM errors', async () => {
    mockGenerateAnalysis.mockRejectedValue({ code: 'LLM_PARSE_ERROR', message: 'Bad JSON' });

    await expect(runInterviewQs('r', 'j')).rejects.toEqual(
      expect.objectContaining({ code: 'LLM_PARSE_ERROR' })
    );
  });
});

// ════════════════════════════════════════════════════════════════
//  runRoadmap
// ════════════════════════════════════════════════════════════════
describe('runRoadmap', () => {
  const fakeRoadmap = {
    roadmap: [
      { skill: 'Go', resources: ['Tour of Go'], weeks: 4 },
    ],
  };

  test('should call provider.generateAnalysis with roadmap prompts and return result', async () => {
    mockGenerateAnalysis.mockResolvedValue(fakeRoadmap);

    const result = await runRoadmap(['Go', 'Kubernetes']);

    expect(mockGenerateAnalysis).toHaveBeenCalledTimes(1);
    const { systemPrompt, userPrompt } = mockGenerateAnalysis.mock.calls[0][0];
    expect(systemPrompt).toContain('roadmap');
    expect(userPrompt).toContain('Go');
    expect(userPrompt).toContain('Kubernetes');
    expect(result).toEqual(fakeRoadmap);
  });

  test('should propagate LLM errors (runRoadmap)', async () => {
    mockGenerateAnalysis.mockRejectedValue({ code: 'LLM_UNAVAILABLE', message: 'Ollama down' });

    await expect(runRoadmap(['Go'])).rejects.toEqual(
      expect.objectContaining({ code: 'LLM_UNAVAILABLE' })
    );
  });
});

// ════════════════════════════════════════════════════════════════
//  runFullAnalysis
// ════════════════════════════════════════════════════════════════
describe('runFullAnalysis', () => {
  const unifiedResult = {
    atsScore: 75,
    atsBreakdown: {
      keywordMatch: 80,
      skillsMatch: 70,
      experienceRelevance: 75,
      educationMatch: 85,
      formatting: 90,
    },
    skills: {
      matched: ['React'],
      missing: ['Docker'],
    },
    strengths: ['Strong frontend skills'],
    weaknesses: ['Missing DevOps experience'],
    keywordAnalysis: {
      experienceAlignment: 'Good',
      educationMatch: 'Matches degree',
      keywordInsights: 'High relevance',
    },
    summary: 'Strong candidate',
    bulletImprovements: [],
    interviewQuestions: [{ question: 'Tell me about Docker' }],
    learningRoadmap: [{ skill: 'Docker' }],
  };

  test('should run full analysis with unified prompt and return formatted result', async () => {
    mockGenerateAnalysis.mockResolvedValue(unifiedResult);

    const result = await runFullAnalysis('resume text', 'job description');

    expect(ProviderFactory.getProvider).toHaveBeenCalledWith('ollama');
    expect(mockGenerateAnalysis).toHaveBeenCalledTimes(1);
    expect(result.match_score).toBe(75);
    expect(result.matched_skills).toEqual(['React']);
    expect(result.missing_skills).toEqual(['Docker']);
    expect(result.experience_alignment).toBe('Good');
    expect(result.overall_assessment).toBe('Strong candidate');
  });

  test('should propagate provider failures in full analysis', async () => {
    mockGenerateAnalysis.mockRejectedValue({ code: 'LLM_UNAVAILABLE', message: 'Provider offline' });

    await expect(runFullAnalysis('r', 'j')).rejects.toEqual(
      expect.objectContaining({ code: 'LLM_UNAVAILABLE' })
    );
  });
});
