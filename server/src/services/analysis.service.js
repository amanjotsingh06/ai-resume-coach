// ── Analysis Orchestration Service ──────────────────────────────
// Coordinates all AI-powered resume analysis features.

const ProviderFactory = require('./ai/providerFactory');
const { buildAnalysisSystemPrompt, buildAnalysisUserPrompt } = require('./ai/promptBuilder');

const matchScore = require('../prompts/matchScore.prompt');
const bulletImprover = require('../prompts/bulletImprover.prompt');
const interviewQs = require('../prompts/interviewQs.prompt');
const roadmap = require('../prompts/roadmap.prompt');

/**
 * Run the match-score analysis.
 */
const runMatchScore = async (resumeText, jd, providerName = 'ollama', model = 'mistral') => {
  const provider = ProviderFactory.getProvider(providerName);
  return provider.generateAnalysis({
    systemPrompt: matchScore.system,
    userPrompt: matchScore.user(resumeText, jd),
    model,
  });
};

/**
 * Improve a list of resume bullet points.
 */
const runBulletImprover = async (bullets, jd, providerName = 'ollama', model = 'mistral') => {
  const provider = ProviderFactory.getProvider(providerName);
  const results = await Promise.allSettled(
    bullets.map((bullet) =>
      provider.generateAnalysis({
        systemPrompt: bulletImprover.system,
        userPrompt: bulletImprover.user(bullet, jd),
        model,
      })
    )
  );

  return results.map((result, i) => {
    if (result.status === 'fulfilled') {
      return { original: bullets[i], improved: result.value.improved };
    }
    return { original: bullets[i], improved: null, error: true };
  });
};

/**
 * Generate tailored interview questions.
 */
const runInterviewQs = async (resumeText, jd, providerName = 'ollama', model = 'mistral') => {
  const provider = ProviderFactory.getProvider(providerName);
  return provider.generateAnalysis({
    systemPrompt: interviewQs.system,
    userPrompt: interviewQs.user(resumeText, jd),
    model,
  });
};

/**
 * Build a personalised learning roadmap for missing skills.
 */
const runRoadmap = async (missingSkills, providerName = 'ollama', model = 'mistral') => {
  const provider = ProviderFactory.getProvider(providerName);
  return provider.generateAnalysis({
    systemPrompt: roadmap.system,
    userPrompt: roadmap.user(missingSkills),
    model,
  });
};

/**
 * Run the full analysis pipeline using a single unified prompt.
 */
const runFullAnalysis = async (resumeText, jd, providerName = 'ollama', model = 'mistral') => {
  const provider = ProviderFactory.getProvider(providerName);
  
  const systemPrompt = buildAnalysisSystemPrompt();
  const userPrompt = buildAnalysisUserPrompt(resumeText, jd);

  const result = await provider.generateAnalysis({ systemPrompt, userPrompt, model });

  // Map the new unified AI schema back to the MongoDB/API format
  return {
    match_score: result.atsScore || 0,
    ats_breakdown: {
      keyword_match:        result.atsBreakdown?.keywordMatch        ?? 0,
      skills_match:         result.atsBreakdown?.skillsMatch         ?? 0,
      experience_relevance: result.atsBreakdown?.experienceRelevance ?? 0,
      education_match:      result.atsBreakdown?.educationMatch      ?? 0,
      formatting:           result.atsBreakdown?.formatting          ?? 0,
    },
    matched_skills:       result.skills?.matched || [],
    missing_skills:       result.skills?.missing || [],
    strengths:            result.strengths || [],
    weaknesses:           result.weaknesses || [],
    experience_alignment: result.keywordAnalysis?.experienceAlignment || '',
    education_match:      result.keywordAnalysis?.educationMatch || '',
    keyword_insights:     result.keywordAnalysis?.keywordInsights || '',
    overall_assessment:   result.summary || '',
    bullet_improvements:  result.bulletImprovements || [],
    interview_questions:  result.interviewQuestions || [],
    roadmap:              result.learningRoadmap || [],
  };
};

module.exports = { runMatchScore, runBulletImprover, runInterviewQs, runRoadmap, runFullAnalysis };
