// ── Ollama Service Unit Tests ───────────────────────────────────

// ── Test environment setup ──────────────────────────────────────
process.env.OLLAMA_URL = 'http://localhost:11434';
process.env.OLLAMA_MODEL = 'mistral';

const { callOllama, parseJSONSafely } = require('../services/ollama.service');

// ── Mock global fetch ───────────────────────────────────────────
global.fetch = jest.fn();

// ── Reset mocks before each test ────────────────────────────────
beforeEach(() => {
  jest.clearAllMocks();
});

// ════════════════════════════════════════════════════════════════
//  parseJSONSafely TESTS
// ════════════════════════════════════════════════════════════════
describe('parseJSONSafely', () => {
  test('should parse valid JSON string', () => {
    const raw = '{"score": 85, "feedback": "Great resume"}';
    const result = parseJSONSafely(raw);

    expect(result).toEqual({ score: 85, feedback: 'Great resume' });
  });

  test('should strip markdown fences and parse JSON', () => {
    const raw = '```json\n{"score": 90, "sections": ["experience", "skills"]}\n```';
    const result = parseJSONSafely(raw);

    expect(result).toEqual({ score: 90, sections: ['experience', 'skills'] });
  });

  test('should strip markdown fences without json label', () => {
    const raw = '```\n{"valid": true}\n```';
    const result = parseJSONSafely(raw);

    expect(result).toEqual({ valid: true });
  });

  test('should throw LLM_PARSE_ERROR for malformed JSON', () => {
    const raw = '{ this is not valid json at all }';

    expect(() => parseJSONSafely(raw)).toThrow(
      expect.objectContaining({
        code: 'LLM_PARSE_ERROR',
        message: 'LLM returned invalid JSON — retry the request',
      })
    );
  });

  test('should throw LLM_PARSE_ERROR for empty string', () => {
    expect(() => parseJSONSafely('')).toThrow(
      expect.objectContaining({ code: 'LLM_PARSE_ERROR' })
    );
  });

  test('should throw LLM_PARSE_ERROR for whitespace-only string', () => {
    expect(() => parseJSONSafely('   ')).toThrow(
      expect.objectContaining({ code: 'LLM_PARSE_ERROR' })
    );
  });
});

// ════════════════════════════════════════════════════════════════
//  callOllama TESTS
// ════════════════════════════════════════════════════════════════
describe('callOllama', () => {
  const systemPrompt = 'You are a professional resume reviewer.';
  const userPrompt = 'Review this resume.';

  test('should return parsed JSON on valid response', async () => {
    const mockResponse = {
      ok: true,
      json: jest.fn().mockResolvedValue({
        message: {
          content: '{"score": 85, "feedback": "Well structured resume"}',
        },
      }),
    };
    global.fetch.mockResolvedValue(mockResponse);

    const result = await callOllama(systemPrompt, userPrompt);

    expect(result).toEqual({ score: 85, feedback: 'Well structured resume' });
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:11434/api/chat',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: expect.any(String),
      })
    );

    // Verify the request body structure
    const callArgs = global.fetch.mock.calls[0][1];
    const body = JSON.parse(callArgs.body);
    expect(body.model).toBe('mistral');
    expect(body.stream).toBe(false);
    expect(body.options.temperature).toBe(0.3);
    expect(body.messages).toEqual([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ]);
  });

  test('should strip markdown fences from LLM response and parse', async () => {
    const mockResponse = {
      ok: true,
      json: jest.fn().mockResolvedValue({
        message: {
          content: '```json\n{"score": 92, "notes": "Excellent"}\n```',
        },
      }),
    };
    global.fetch.mockResolvedValue(mockResponse);

    const result = await callOllama(systemPrompt, userPrompt);

    expect(result).toEqual({ score: 92, notes: 'Excellent' });
  });

  test('should throw LLM_PARSE_ERROR when LLM returns malformed JSON', async () => {
    const mockResponse = {
      ok: true,
      json: jest.fn().mockResolvedValue({
        message: {
          content: 'Sure! Here is your analysis: { broken json',
        },
      }),
    };
    global.fetch.mockResolvedValue(mockResponse);

    await expect(callOllama(systemPrompt, userPrompt)).rejects.toEqual(
      expect.objectContaining({
        code: 'LLM_PARSE_ERROR',
        message: 'LLM returned invalid JSON — retry the request',
      })
    );
  });

  test('should throw LLM_ERROR when Ollama returns non-ok status', async () => {
    const mockResponse = {
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    };
    global.fetch.mockResolvedValue(mockResponse);

    await expect(callOllama(systemPrompt, userPrompt)).rejects.toEqual(
      expect.objectContaining({
        code: 'LLM_ERROR',
        message: 'Ollama API returned an error',
      })
    );
  });

  test('LLM_ERROR rejection should not be reclassified as LLM_UNAVAILABLE', async () => {
    // Verify the catch block preserves LLM_ERROR (not swallowed into LLM_UNAVAILABLE)
    const mockResponse = { ok: false, status: 400 };
    global.fetch.mockResolvedValue(mockResponse);

    const error = await callOllama(systemPrompt, userPrompt).catch((e) => e);
    expect(error.code).toBe('LLM_ERROR');
  });

  test('should throw LLM_UNAVAILABLE when Ollama is down (fetch rejects)', async () => {
    global.fetch.mockRejectedValue(new Error('connect ECONNREFUSED 127.0.0.1:11434'));

    await expect(callOllama(systemPrompt, userPrompt)).rejects.toEqual(
      expect.objectContaining({
        code: 'LLM_UNAVAILABLE',
        message: 'Ollama is not running or unreachable',
      })
    );
  });

  test('should throw LLM_UNAVAILABLE when request exceeds 60s timeout', async () => {
    // Simulate an AbortError (what fetch throws when AbortController fires)
    const abortError = new DOMException('The operation was aborted.', 'AbortError');
    global.fetch.mockRejectedValue(abortError);

    await expect(callOllama(systemPrompt, userPrompt)).rejects.toEqual(
      expect.objectContaining({
        code: 'LLM_UNAVAILABLE',
        message: 'Ollama is not running or unreachable',
      })
    );
  });

  test('should pass AbortController signal to fetch', async () => {
    const mockResponse = {
      ok: true,
      json: jest.fn().mockResolvedValue({
        message: { content: '{"ok": true}' },
      }),
    };
    global.fetch.mockResolvedValue(mockResponse);

    await callOllama(systemPrompt, userPrompt);

    const callArgs = global.fetch.mock.calls[0][1];
    expect(callArgs.signal).toBeDefined();
    expect(callArgs.signal).toBeInstanceOf(AbortSignal);
  });
});
