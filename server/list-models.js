const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();

async function listModels() {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const models = await ai.models.list();
    for await (const model of models) {
      console.log(model.name);
    }
  } catch (err) {
    console.error("Error:", err);
  }
}
listModels();
