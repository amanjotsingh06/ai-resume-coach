const ProviderFactory = require('../services/ai/providerFactory');
const GeminiProvider = require('../services/ai/providers/gemini.provider');
const OllamaProvider = require('../services/ai/providers/ollama.provider');
const { runFullAnalysis } = require('../services/analysis.service');

describe('Provider Factory & Provider Resilience Tests', () => {
  test('ProviderFactory("gemini") returns GeminiProvider instance', () => {
    const provider = ProviderFactory.getProvider('gemini');
    expect(provider).toBeInstanceOf(GeminiProvider);
  });

  test('ProviderFactory("ollama") returns OllamaProvider instance', () => {
    const provider = ProviderFactory.getProvider('ollama');
    expect(provider).toBeInstanceOf(OllamaProvider);
  });

  test('ProviderFactory("invalid-provider") throws INVALID_PROVIDER error', () => {
    expect(() => ProviderFactory.getProvider('invalid-provider')).toThrow(
      expect.objectContaining({ code: 'INVALID_PROVIDER', statusCode: 400 })
    );
  });

  test('ProviderFactory(null) throws INVALID_PROVIDER error', () => {
    expect(() => ProviderFactory.getProvider(null)).toThrow(
      expect.objectContaining({ code: 'INVALID_PROVIDER', statusCode: 400 })
    );
  });

  test('NO SILENT FALLBACK: Gemini provider failure returns Gemini error and DOES NOT call Ollama', async () => {
    const geminiProvider = ProviderFactory.getProvider('gemini');
    const ollamaProvider = ProviderFactory.getProvider('ollama');

    const spyGemini = jest.spyOn(geminiProvider, 'generateAnalysis').mockRejectedValue({
      code: 'LLM_UNAVAILABLE',
      message: 'Gemini service unreachable',
    });
    const spyOllama = jest.spyOn(ollamaProvider, 'generateAnalysis');

    await expect(
      runFullAnalysis('resume text', 'job description', 'gemini', 'gemini-flash')
    ).rejects.toEqual(expect.objectContaining({ code: 'LLM_UNAVAILABLE' }));

    expect(spyGemini).toHaveBeenCalled();
    expect(spyOllama).not.toHaveBeenCalled();

    spyGemini.mockRestore();
    spyOllama.mockRestore();
  });
});
