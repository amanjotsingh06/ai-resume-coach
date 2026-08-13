const OllamaProvider = require('./providers/ollama.provider');
const GeminiProvider = require('./providers/gemini.provider');

const providers = {
  ollama: new OllamaProvider(),
  gemini: new GeminiProvider(),
};

class ProviderFactory {
  static getProvider(providerName) {
    if (!providerName || typeof providerName !== 'string') {
      const err = new Error('AI Provider is required and must be a string.');
      err.code = 'INVALID_PROVIDER';
      err.statusCode = 400;
      throw err;
    }
    const key = providerName.toLowerCase().trim();
    const provider = providers[key];
    if (!provider) {
      const err = new Error(`AI Provider '${providerName}' is not supported.`);
      err.code = 'INVALID_PROVIDER';
      err.statusCode = 400;
      throw err;
    }
    return provider;
  }
}

module.exports = ProviderFactory;
