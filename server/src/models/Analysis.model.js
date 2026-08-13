// ── Analysis Model ────────────────────────────────────────────────
// Persists the result of a single full AI analysis run.

const mongoose = require('mongoose');

const bulletImprovementSchema = new mongoose.Schema(
    {
        original: { type: String, default: '' },
        improved: { type: String, default: '' },
    },
    { _id: false }
);

const interviewQuestionSchema = new mongoose.Schema(
    {
        question: { type: String, default: '' },
        category: { type: String, default: '' },
        difficulty: { type: String, default: '' },
    },
    { _id: false }
);

const skillRoadmapItemSchema = new mongoose.Schema(
    {
        skill: { type: String, default: '' },
        resources: { type: [String], default: [] },
        weeks: { type: Number, default: 0 },
    },
    { _id: false }
);

const atsBreakdownSchema = new mongoose.Schema(
    {
        keyword_match:        { type: Number, default: 0 },
        skills_match:         { type: Number, default: 0 },
        experience_relevance: { type: Number, default: 0 },
        education_match:      { type: Number, default: 0 },
        formatting:           { type: Number, default: 0 },
    },
    { _id: false }
);

const analysisSchema = new mongoose.Schema(
    {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'user_id is required'],
            index: true,
        },

        // ── Metadata ──────────────────────────────────────────────
        resume_name: { type: String, default: '' },
        job_title:   { type: String, default: '' },
        ai_provider: { type: String, default: '' },
        ai_model:    { type: String, default: '' },

        resume_text: {
            type: String,
            required: [true, 'resume_text is required'],
        },

        job_description: {
            type: String,
            required: [true, 'job_description is required'],
        },

        match_score: {
            type: Number,
            required: [true, 'match_score is required'],
            min: [0, 'match_score must be >= 0'],
            max: [100, 'match_score must be <= 100'],
        },

        // ── ATS Breakdown (5 AI-evaluated dimensions) ─────────────
        ats_breakdown: {
            type: atsBreakdownSchema,
            default: () => ({}),
        },

        overall_assessment:   { type: String, default: '' },
        experience_alignment: { type: String, default: '' },
        education_match:      { type: String, default: '' },
        keyword_insights:     { type: String, default: '' },

        matched_skills: { type: [String], default: [] },
        missing_skills: { type: [String], default: [] },
        strengths:      { type: [String], default: [] },
        weaknesses:     { type: [String], default: [] },

        bullet_improvements: {
            type: [bulletImprovementSchema],
            default: [],
        },

        interview_questions: {
            type: [interviewQuestionSchema],
            default: [],
        },

        skill_roadmap: {
            type: [skillRoadmapItemSchema],
            default: [],
        },

        created_at: {
            type: Date,
            default: Date.now,
        },
    },
    {
        // Disable Mongoose's automatic timestamps so we control created_at ourselves
        timestamps: false,
    }
);

const Analysis = mongoose.model('Analysis', analysisSchema);

module.exports = { Analysis };
