// ── Ollama LLM Integration Service ─────────────────────────────
// Core service for communicating with a local Ollama instance.
// Every LLM call in the app flows through callOllama().

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const MODEL = process.env.OLLAMA_MODEL || 'mistral';
const TIMEOUT_MS = 60_000; // 60-second hard timeout

/**
 * Strip markdown code fences and parse raw LLM output as JSON.
 * @param {string} raw - Raw string returned by the LLM.
 * @returns {object} Parsed JSON object.
 * @throws {{ code: string, message: string }} On invalid JSON.
 */
const parseJSONSafely = (raw) => {
  const clean = raw.replace(/```json|```/g, '').trim();
  try {
    return JSON.parse(clean);
  } catch {
    throw { code: 'LLM_PARSE_ERROR', message: 'LLM returned invalid JSON — retry the request' };
  }
};

/**
 * Send a chat completion request to the local Ollama instance.
 * @param {string} systemPrompt - System-role prompt (persona, instructions).
 * @param {string} userPrompt   - User-role prompt (the actual query / data).
 * @returns {Promise<object>} Parsed JSON response from the LLM.
 * @throws {{ code: string, message: string }} On network, timeout, or parse errors.
 */
const callOllama = async (systemPrompt, userPrompt) => {
  // AbortController for 60-second timeout
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        model: MODEL,
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
    return parseJSONSafely(data.message.content);
  } catch (err) {
    // Re-throw our own structured errors untouched
    if (err && err.code && (err.code === 'LLM_ERROR' || err.code === 'LLM_PARSE_ERROR')) {
      throw err;
    }
    // Network failures, DNS errors, abort signals → LLM_UNAVAILABLE
    throw { code: 'LLM_UNAVAILABLE', message: 'Ollama is not running or unreachable' };
  } finally {
    clearTimeout(timeout);
  }
};

module.exports = { callOllama, parseJSONSafely };
