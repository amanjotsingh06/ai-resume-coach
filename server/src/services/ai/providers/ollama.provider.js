const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const TIMEOUT_MS = 60_000;

class OllamaProvider {
  /**
   * Strip markdown code fences and parse raw LLM output as JSON.
   */
  _parseJSONSafely(raw) {
    const clean = raw.replace(/```json|```/g, '').trim();
    try {
      return JSON.parse(clean);
    } catch {
      throw { code: 'LLM_PARSE_ERROR', message: 'LLM returned invalid JSON — retry the request' };
    }
  }

  async generateAnalysis({ systemPrompt, userPrompt, model }) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const res = await fetch(`${OLLAMA_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          model: model,
          stream: false,
          options: { temperature: 0.3 },
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
        }),
      });

      if (!res.ok) {
        throw { code: 'LLM_ERROR', message: 'Ollama API returned an error' };
      }

      const data = await res.json();
      return this._parseJSONSafely(data.message.content);
    } catch (err) {
      if (err && err.code && (err.code === 'LLM_ERROR' || err.code === 'LLM_PARSE_ERROR')) {
        throw err;
      }
      throw { code: 'LLM_UNAVAILABLE', message: 'Ollama is not running or unreachable' };
    } finally {
      clearTimeout(timeout);
    }
  }

  async healthCheck() {
    try {
      const res = await fetch(`${OLLAMA_URL}/api/tags`);
      return res.ok;
    } catch {
      return false;
    }
  }

  async listModels() {
    try {
      const res = await fetch(`${OLLAMA_URL}/api/tags`);
      const data = await res.json();
      return data.models.map(m => m.name);
    } catch {
      return [];
    }
  }
}

module.exports = OllamaProvider;
