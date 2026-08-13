const { GoogleGenAI } = require('@google/genai');

// Initialize outside of request if possible, but allow missing env var for users who don't use it
let ai = null;
try {
  if (process.env.GEMINI_API_KEY) {
    ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
} catch (e) {
  // Will be handled during generation
}

class GeminiProvider {
  /**
   * Parse LLM output safely.
   */
  _parseJSONSafely(raw) {
    const clean = raw.replace(/```json|```/g, '').trim();
    try {
      return JSON.parse(clean);
    } catch {
      throw { code: 'LLM_PARSE_ERROR', message: 'Gemini returned invalid JSON — retry the request' };
    }
  }

  async generateAnalysis({ systemPrompt, userPrompt, model }) {
    if (!ai) {
      if (!process.env.GEMINI_API_KEY) {
        throw { code: 'LLM_UNAVAILABLE', message: 'GEMINI_API_KEY is not configured in .env' };
      }
      try {
        ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      } catch (e) {
        if (process.env.NODE_ENV !== 'test') console.error('Gemini Init Error:', e.message || e);
        throw { code: 'LLM_UNAVAILABLE', message: 'Failed to initialize Gemini Client: ' + e.message };
      }
    }

    try {
      // Use configured model or fallback
      const geminiModel = model === 'gemini' ? 'gemini-flash-latest' : model || 'gemini-flash-latest';

      const response = await ai.models.generateContent({
        model: geminiModel,
        contents: [
          { role: 'user', parts: [{ text: userPrompt }] } // Gemini handles system instructions separately
        ],
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.3,
          responseMimeType: 'application/json',
        }
      });

      if (!response.text) {
        throw { code: 'LLM_ERROR', message: 'Gemini API returned an empty response' };
      }

      return this._parseJSONSafely(response.text);
    } catch (err) {
      if (process.env.NODE_ENV !== 'test') console.error('Gemini Provider Error:', err.message || err.code || err);
      if (err && err.code && (err.code === 'LLM_ERROR' || err.code === 'LLM_PARSE_ERROR' || err.code === 'LLM_UNAVAILABLE')) {
        throw err;
      }
      throw { code: 'LLM_ERROR', message: err.message || 'Gemini API request failed' };
    }
  }

  async healthCheck() {
    return !!process.env.GEMINI_API_KEY;
  }

  async listModels() {
    if (!process.env.GEMINI_API_KEY) return [];
    return ['gemini-2.5-flash', 'gemini-2.5-pro'];
  }
}

module.exports = GeminiProvider;
