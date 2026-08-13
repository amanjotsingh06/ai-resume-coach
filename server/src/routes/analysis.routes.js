// ── Analysis Routes ──────────────────────────────────────────────
// POST /api/analysis/run      — full AI analysis pipeline + persist
// GET  /api/analysis/history  — list past analyses for authed user
// GET  /api/analysis/:id      — fetch a single analysis (owner-gated)
//
// AI-only endpoints (no persistence):
// POST /api/ai/match-score
// POST /api/ai/improve-bullets
// POST /api/ai/interview-questions
// POST /api/ai/skill-roadmap

const express = require('express');
const mongoose = require('mongoose');
const { requireAuth } = require('../middleware/auth.middleware');
const { analysisRateLimiter } = require('../middleware/rateLimit.middleware');
const { runFullAnalysis, runMatchScore, runBulletImprover, runInterviewQs, runRoadmap } = require('../services/analysis.service');
const { Analysis } = require('../models/Analysis.model');

const analysisRouter = express.Router();
const aiRouter = express.Router();

// ── Shared validation helpers ────────────────────────────────────

/**
 * Validate a text field: must be a string with at least `minLen` non-whitespace characters.
 * @param {*}      value  - The value from req.body
 * @param {number} minLen - Minimum trimmed length
 * @returns {boolean} true if valid
 */
const isValidText = (value, minLen = 50) =>
  typeof value === 'string' && value.trim().length >= minLen;

// ── POST /api/analysis/run ──────────────────────────────────────
analysisRouter.post('/run', requireAuth, analysisRateLimiter, async (req, res, next) => {
  const { resumeText, jobDescription, resumeName = '', jobTitle = '', provider = 'ollama', model = 'mistral' } = req.body;

  // Validate required fields — type and minimum meaningful length
  if (!isValidText(resumeText)) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'resumeText must be a string with at least 50 characters',
        hint: 'Provide the full resume content (at least 50 characters)',
      },
    });
  }

  if (!isValidText(jobDescription)) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'jobDescription must be a string with at least 50 characters',
        hint: 'Provide the full job description (at least 50 characters)',
      },
    });
  }

  // Strict Provider/Model validation
  const validProviders = {
    ollama: ['mistral', 'llama3', 'llama3.2', 'deepseek-r1'],
    gemini: ['gemini-flash-latest', 'gemini-pro-latest']
  };

  if (!validProviders[provider]) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: `Provider '${provider}' is not supported.`,
      }
    });
  }

  if (!validProviders[provider].includes(model)) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: `Model '${model}' is not supported for provider '${provider}'.`,
      }
    });
  }

  try {
    const result = await runFullAnalysis(resumeText, jobDescription, provider, model);

    // ── Persist the analysis result ─────────────────────────────
    const doc = await Analysis.create({
      user_id:     req.user._id,
      resume_name: resumeName || '',
      job_title:   jobTitle || '',
      ai_provider: provider,
      ai_model:    model,
      resume_text: resumeText,
      job_description: jobDescription,
      match_score: result.match_score ?? 0,
      ats_breakdown: result.ats_breakdown || {},
      overall_assessment:   result.overall_assessment || '',
      experience_alignment: result.experience_alignment || '',
      education_match:      result.education_match || '',
      keyword_insights:     result.keyword_insights || '',
      matched_skills: Array.isArray(result.matched_skills) ? result.matched_skills : [],
      missing_skills: Array.isArray(result.missing_skills) ? result.missing_skills : [],
      strengths:      Array.isArray(result.strengths)      ? result.strengths      : [],
      weaknesses:     Array.isArray(result.weaknesses)     ? result.weaknesses     : [],
      // bullet_improvements may be an array of { original, improved } objects
      bullet_improvements: Array.isArray(result.bullet_improvements)
        ? result.bullet_improvements.filter((b) => typeof b === 'object' && !b.error)
        : [],
      // interview_questions may be nested under .questions
      interview_questions: Array.isArray(result.interview_questions?.questions)
        ? result.interview_questions.questions
        : Array.isArray(result.interview_questions)
          ? result.interview_questions
          : [],
      // skill_roadmap may be nested under .roadmap
      skill_roadmap: Array.isArray(result.roadmap?.roadmap)
        ? result.roadmap.roadmap
        : Array.isArray(result.roadmap)
          ? result.roadmap
          : [],
    });

    return res.status(200).json({ success: true, data: { analysisId: doc._id } });
  } catch (err) {
    // Ollama is down or unreachable
    if (err && err.code === 'LLM_UNAVAILABLE') {
      return res.status(503).json({
        success: false,
        error: {
          code: 'LLM_UNAVAILABLE',
          message: err.message || 'AI service is currently unavailable',
          hint: 'Ensure Ollama is running locally on port 11434',
        },
      });
    }
    // All other errors → global error handler
    next(err);
  }
});

// ── GET /api/analysis/history ────────────────────────────────────
// Returns all analyses for the authenticated user, newest first.
// resume_text is excluded to keep the payload light.
analysisRouter.get('/history', requireAuth, async (req, res, next) => {
  try {
    const analyses = await Analysis
      .find({ user_id: req.user._id })
      .sort({ created_at: -1 })
      .select('-resume_text')
      .lean();

    return res.status(200).json({ success: true, data: analyses });
  } catch (err) {
    next(err);
  }
});

// ── DELETE /api/analysis/all ─────────────────────────────────────
// Deletes ALL past analyses for the authenticated user.
analysisRouter.delete('/all', requireAuth, async (req, res, next) => {
  try {
    const result = await Analysis.deleteMany({ user_id: req.user._id });
    return res.status(200).json({
      success: true,
      data: {
        message: `Successfully deleted ${result.deletedCount} analyses.`,
        deletedCount: result.deletedCount
      }
    });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/analysis/:id ────────────────────────────────────────
// Returns a single analysis document owned by the authenticated user.
// 403 if the doc exists but belongs to another user; 404 if it doesn't exist.
// NOTE: this route must be declared AFTER /history to avoid ":id" capturing "history".
analysisRouter.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params;

    // Malformed ObjectId → treat as 404 immediately
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: `Analysis ${id} not found` },
      });
    }

    // Look up by _id only first so we can distinguish 404 vs 403
    const doc = await Analysis.findById(id).lean();

    if (!doc) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: `Analysis ${id} not found` },
      });
    }

    // Doc exists but belongs to a different user
    if (doc.user_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'You do not have access to this analysis' },
      });
    }

    return res.status(200).json({ success: true, data: doc });
  } catch (err) {
    next(err);
  }
});

// ── POST /api/ai/match-score ──────────────────────────────────────
aiRouter.post('/match-score', requireAuth, async (req, res, next) => {
  const { resumeText, jobDescription } = req.body;

  if (!isValidText(resumeText)) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'resumeText must be a string with at least 50 characters',
        hint: 'Provide the full resume content (at least 50 characters)',
      },
    });
  }

  if (!isValidText(jobDescription)) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'jobDescription must be a string with at least 50 characters',
        hint: 'Provide the full job description (at least 50 characters)',
      },
    });
  }

  try {
    const result = await runMatchScore(resumeText, jobDescription);
    return res.status(200).json({ success: true, data: result });
  } catch (err) {
    if (err && err.code === 'LLM_UNAVAILABLE') {
      return res.status(503).json({
        success: false,
        error: {
          code: 'LLM_UNAVAILABLE',
          message: err.message || 'AI service is currently unavailable',
          hint: 'Ensure Ollama is running locally on port 11434',
        },
      });
    }
    next(err);
  }
});

// ── POST /api/ai/improve-bullets ──────────────────────────────────
aiRouter.post('/improve-bullets', requireAuth, async (req, res, next) => {
  const { bullets, jobDescription } = req.body;

  if (!Array.isArray(bullets) || bullets.length === 0) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'bullets must be a non-empty array',
        hint: 'Provide an array of resume bullet point strings',
      },
    });
  }

  // Each element must be a non-empty string
  if (!bullets.every((b) => typeof b === 'string' && b.trim().length > 0)) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Each bullet must be a non-empty string',
        hint: 'Ensure every element in the bullets array is a non-empty string',
      },
    });
  }

  try {
    const result = await runBulletImprover(bullets, jobDescription);
    return res.status(200).json({ success: true, data: result });
  } catch (err) {
    if (err && err.code === 'LLM_UNAVAILABLE') {
      return res.status(503).json({
        success: false,
        error: {
          code: 'LLM_UNAVAILABLE',
          message: err.message || 'AI service is currently unavailable',
          hint: 'Ensure Ollama is running locally on port 11434',
        },
      });
    }
    next(err);
  }
});

// ── POST /api/ai/interview-questions ──────────────────────────────
aiRouter.post('/interview-questions', requireAuth, async (req, res, next) => {
  const { resumeText, jobDescription } = req.body;

  if (!isValidText(resumeText)) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'resumeText must be a string with at least 50 characters',
        hint: 'Provide the full resume content (at least 50 characters)',
      },
    });
  }

  if (!isValidText(jobDescription)) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'jobDescription must be a string with at least 50 characters',
        hint: 'Provide the full job description (at least 50 characters)',
      },
    });
  }

  try {
    const result = await runInterviewQs(resumeText, jobDescription);
    return res.status(200).json({ success: true, data: result });
  } catch (err) {
    if (err && err.code === 'LLM_UNAVAILABLE') {
      return res.status(503).json({
        success: false,
        error: {
          code: 'LLM_UNAVAILABLE',
          message: err.message || 'AI service is currently unavailable',
          hint: 'Ensure Ollama is running locally on port 11434',
        },
      });
    }
    next(err);
  }
});

// ── POST /api/ai/skill-roadmap ────────────────────────────────────
aiRouter.post('/skill-roadmap', requireAuth, async (req, res, next) => {
  const { missingSkills } = req.body;

  if (!Array.isArray(missingSkills) || missingSkills.length === 0) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'missingSkills must be a non-empty array',
        hint: 'Provide an array of skill name strings',
      },
    });
  }

  try {
    const result = await runRoadmap(missingSkills);
    return res.status(200).json({ success: true, data: result });
  } catch (err) {
    if (err && err.code === 'LLM_UNAVAILABLE') {
      return res.status(503).json({
        success: false,
        error: {
          code: 'LLM_UNAVAILABLE',
          message: err.message || 'AI service is currently unavailable',
          hint: 'Ensure Ollama is running locally on port 11434',
        },
      });
    }
    next(err);
  }
});

module.exports = { analysisRouter, aiRouter };
