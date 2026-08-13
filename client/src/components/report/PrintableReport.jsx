/**
 * PrintableReport.jsx
 * ───────────────────
 * Print-oriented representation of a completed AI Resume Coach analysis.
 *
 * This component:
 *  - Is hidden from normal screen view (display:none) and only rendered
 *    by react-to-print when the user clicks "Download PDF".
 *  - Receives the EXISTING analysis data — it does NOT re-run AI analysis,
 *    does NOT call Gemini/Ollama, does NOT modify MongoDB.
 *  - Contains all 11 report sections matching the Phase 4 web report.
 *  - Uses print-specific CSS from PrintableReport.css for A4 layout,
 *    page breaks, and high-contrast document typography.
 *
 * Usage:
 *   const printRef = useRef(null);
 *   <PrintableReport ref={printRef} data={analysisResult} />
 *
 * Then trigger via:
 *   useReactToPrint({ contentRef: printRef, documentTitle: filename });
 */

import React, { forwardRef } from 'react';
import './PrintableReport.css';

// ─────────────────────────────────────────────────────────────────────────────
// ATS Breakdown dimension definitions (same order as ScoreBreakdown.jsx)
// ─────────────────────────────────────────────────────────────────────────────
const BREAKDOWN_DIMENSIONS = [
  { key: 'keyword_match',        label: 'Keyword Match'        },
  { key: 'skills_match',         label: 'Skills Match'         },
  { key: 'experience_relevance', label: 'Experience Relevance' },
  { key: 'education_match',      label: 'Education Match'      },
  { key: 'formatting',           label: 'Formatting'           },
];

// ─────────────────────────────────────────────────────────────────────────────
// Helper components (print-only)
// ─────────────────────────────────────────────────────────────────────────────

/** Score bar row for the ATS breakdown table. */
function BreakdownRow({ label, score }) {
  const pct = Math.max(0, Math.min(100, score ?? 0));
  const hasData = score != null && score > 0;
  return (
    <div className="pr-breakdown-row">
      <span className="pr-breakdown-label">{label}</span>
      <div className="pr-breakdown-bar-track">
        <div
          className="pr-breakdown-bar-fill"
          style={{ width: hasData ? `${pct}%` : '0%' }}
          aria-hidden="true"
        />
      </div>
      <span className="pr-breakdown-score">
        {hasData ? `${pct}%` : '—'}
      </span>
    </div>
  );
}

/** Labelled text card for summary/alignment/keyword sections. */
function TextCard({ title, body, accentColor = '#6366f1' }) {
  if (!body) return null;
  return (
    <div className="pr-text-card" style={{ borderLeftColor: accentColor }}>
      {title && <h3 className="pr-text-card-title">{title}</h3>}
      <p className="pr-text-card-body">{body}</p>
    </div>
  );
}

/** Difficulty badge for interview questions. */
function DifficultyBadge({ difficulty }) {
  const d = (difficulty ?? '').toLowerCase();
  const cls =
    d === 'hard'   ? 'pr-difficulty-badge--hard'
    : d === 'easy' ? 'pr-difficulty-badge--easy'
    :                'pr-difficulty-badge--medium';
  return (
    <span className={`pr-difficulty-badge ${cls}`}>
      {difficulty || 'Unknown'}
    </span>
  );
}

/** Priority badge for roadmap items. */
function PriorityBadge({ priority }) {
  const p = (priority ?? '').toLowerCase();
  const cls =
    p === 'high'  ? 'pr-roadmap-badge--high'
    : p === 'low' ? 'pr-roadmap-badge--low'
    :               'pr-roadmap-badge--medium';
  return (
    <span className={`pr-roadmap-badge ${cls}`}>{priority} priority</span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PrintableReport — main printable document
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @param {{ data: object }} props
 * @param {React.Ref} ref - Forwarded ref attached to the root div; passed to useReactToPrint.
 */
const PrintableReport = forwardRef(function PrintableReport({ data }, ref) {
  if (!data) return null;

  const {
    resume_name,
    job_title,
    ai_provider,
    ai_model,
    match_score,
    created_at,
    ats_breakdown,
    overall_assessment,
    experience_alignment,
    education_match,
    keyword_insights,
    matched_skills = [],
    missing_skills = [],
    strengths = [],
    weaknesses = [],
    bullet_improvements = [],
    interview_questions = [],
    skill_roadmap = [],
  } = data;

  // ── Derived display values ────────────────────────────────────────────────
  const displayResume = resume_name || 'Resume';
  const displayRole   = job_title   || 'Target Role';
  const displayDate   = created_at
    ? new Date(created_at).toLocaleDateString(undefined, {
        year: 'numeric', month: 'long', day: 'numeric',
      })
    : '—';

  const providerLabel =
    ai_provider === 'gemini' ? 'Google Gemini'
    : ai_provider === 'ollama' ? 'Local Ollama (Offline)'
    : ai_provider || '—';

  const modelLabel = ai_model || '—';

  const score = match_score ?? 0;

  // ATS breakdown availability
  const hasBreakdown =
    ats_breakdown &&
    Object.values(ats_breakdown).some((v) => v > 0);

  // Skills progress
  const totalSkills = matched_skills.length + missing_skills.length;
  const skillPct    = totalSkills > 0
    ? Math.round((matched_skills.length / totalSkills) * 100)
    : 0;

  // Interview questions grouped by category
  const groupedQuestions = interview_questions.reduce((acc, q) => {
    acc[q.category] = [...(acc[q.category] || []), q];
    return acc;
  }, {});
  const interviewCategories = Object.keys(groupedQuestions);

  // Document generation timestamp
  const generatedAt = new Date().toLocaleString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  return (
    <div className="printable-report" ref={ref} aria-label="Printable report">

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 1 — Document Header
          ════════════════════════════════════════════════════════════════ */}
      <header className="pr-doc-header">
        <h1 className="pr-doc-title">AI Resume Coach</h1>
        <p className="pr-doc-subtitle">AI-Powered Resume Analysis &amp; ATS Evaluation System</p>

        <div className="pr-meta-grid">
          <div className="pr-meta-item">
            <span className="pr-meta-label">Resume</span>
            <span className="pr-meta-value">{displayResume}</span>
          </div>
          <div className="pr-meta-item">
            <span className="pr-meta-label">Target Role</span>
            <span className="pr-meta-value">{displayRole}</span>
          </div>
          <div className="pr-meta-item">
            <span className="pr-meta-label">Analysis Date</span>
            <span className="pr-meta-value">{displayDate}</span>
          </div>
          <div className="pr-meta-item">
            <span className="pr-meta-label">AI Provider</span>
            <span className="pr-meta-value">{providerLabel}</span>
          </div>
          <div className="pr-meta-item">
            <span className="pr-meta-label">AI Model</span>
            <span className="pr-meta-value">{modelLabel}</span>
          </div>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 2 — ATS Compatibility Overview
          ════════════════════════════════════════════════════════════════ */}
      <div className="pr-ats-hero">
        <div className="pr-ats-score-block">
          <span className="pr-ats-score-value">{score}%</span>
          <span className="pr-ats-score-label">ATS Compatibility</span>
        </div>
        <p className="pr-ats-disclaimer">
          <strong>ATS Compatibility Score</strong><br />
          This score represents an AI-assisted evaluation of how well this
          resume aligns with the target job description across keyword usage,
          skills coverage, experience relevance, education, and formatting.
          It is not the output of any commercial ATS product.
        </p>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 3 — ATS Score Breakdown
          ════════════════════════════════════════════════════════════════ */}
      <section className="pr-section">
        <h2 className="pr-section-heading">ATS Score Breakdown</h2>
        <div className="pr-breakdown-card">
          <p className="pr-breakdown-disclaimer">
            AI-assisted evaluation across 5 dimensions — not the algorithm
            of any commercial ATS platform.
          </p>
          {hasBreakdown ? (
            BREAKDOWN_DIMENSIONS.map(({ key, label }) => (
              <BreakdownRow key={key} label={label} score={ats_breakdown?.[key]} />
            ))
          ) : (
            <p className="pr-no-data">Score breakdown not available for this analysis.</p>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 4 — Resume Summary (Overall Assessment)
          ════════════════════════════════════════════════════════════════ */}
      {overall_assessment && (
        <section className="pr-section">
          <h2 className="pr-section-heading">Resume Summary</h2>
          <TextCard body={overall_assessment} accentColor="#3730a3" />
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 5 — Skills Analysis (Matched + Missing)
          ════════════════════════════════════════════════════════════════ */}
      <section className="pr-section">
        <h2 className="pr-section-heading">Skills Analysis</h2>
        <div className="pr-skills-grid">
          {/* Matched Skills */}
          <div className="pr-skills-col">
            <h3 className="pr-skills-col-heading pr-skills-col-heading--matched">
              <span className="pr-skills-col-dot pr-skills-col-dot--matched" aria-hidden="true" />
              Matched Skills ({matched_skills.length})
            </h3>
            {matched_skills.length > 0 ? (
              <div className="pr-skills-badges">
                {matched_skills.map((skill, i) => (
                  <span key={i} className="pr-skill-badge pr-skill-badge--matched">
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="pr-skills-empty">No matched skills found.</p>
            )}
          </div>

          {/* Missing Skills */}
          <div className="pr-skills-col">
            <h3 className="pr-skills-col-heading pr-skills-col-heading--missing">
              <span className="pr-skills-col-dot pr-skills-col-dot--missing" aria-hidden="true" />
              Missing Skills ({missing_skills.length})
            </h3>
            {missing_skills.length > 0 ? (
              <div className="pr-skills-badges">
                {missing_skills.map((skill, i) => (
                  <span key={i} className="pr-skill-badge pr-skill-badge--missing">
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="pr-skills-empty">No missing skills — great match!</p>
            )}
          </div>
        </div>

        {/* Overall skill match progress */}
        {totalSkills > 0 && (
          <div className="pr-skill-progress">
            <div className="pr-skill-progress-meta">
              <span>Overall Skill Match</span>
              <span>{skillPct}% ({matched_skills.length} of {totalSkills})</span>
            </div>
            <div className="pr-skill-progress-track">
              <div
                className="pr-skill-progress-fill"
                style={{ width: `${skillPct}%` }}
                aria-hidden="true"
              />
            </div>
          </div>
        )}
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 6 — Keyword Analysis
          ════════════════════════════════════════════════════════════════ */}
      {(experience_alignment || education_match || keyword_insights) && (
        <section className="pr-section">
          <h2 className="pr-section-heading">Keyword Analysis</h2>
          {experience_alignment && (
            <TextCard
              title="Experience Alignment"
              body={experience_alignment}
              accentColor="#6366f1"
            />
          )}
          {education_match && (
            <TextCard
              title="Education Match"
              body={education_match}
              accentColor="#a855f7"
            />
          )}
          {keyword_insights && (
            <TextCard
              title="Keyword Insights"
              body={keyword_insights}
              accentColor="#0891b2"
            />
          )}
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 7 — Strengths & Weaknesses
          ════════════════════════════════════════════════════════════════ */}
      {(strengths.length > 0 || weaknesses.length > 0) && (
        <section className="pr-section">
          <h2 className="pr-section-heading">Strengths &amp; Weaknesses</h2>
          <div className="pr-sw-grid">
            {/* Strengths */}
            <div className="pr-sw-col">
              <h3 className="pr-sw-col-heading pr-sw-col-heading--strengths">
                ✓ Strengths ({strengths.length})
              </h3>
              {strengths.length > 0 ? (
                <ul className="pr-sw-list">
                  {strengths.map((s, i) => (
                    <li key={i} className="pr-sw-item">
                      <span className="pr-sw-bullet--strength" aria-hidden="true">+</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="pr-no-data">No strengths identified.</p>
              )}
            </div>

            {/* Weaknesses */}
            <div className="pr-sw-col">
              <h3 className="pr-sw-col-heading pr-sw-col-heading--weaknesses">
                ✗ Weaknesses ({weaknesses.length})
              </h3>
              {weaknesses.length > 0 ? (
                <ul className="pr-sw-list">
                  {weaknesses.map((w, i) => (
                    <li key={i} className="pr-sw-item">
                      <span className="pr-sw-bullet--weakness" aria-hidden="true">−</span>
                      <span>{w}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="pr-no-data">No weaknesses identified.</p>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 8 — Bullet Point Improvements
          ════════════════════════════════════════════════════════════════ */}
      {bullet_improvements.length > 0 && (
        <section className="pr-section">
          <h2 className="pr-section-heading">
            Bullet Point Improvements (XYZ Framework)
          </h2>
          {bullet_improvements.map((item, idx) => (
            <div key={idx} className="pr-bullet-pair">
              <p className="pr-bullet-before-label">Original</p>
              <p className="pr-bullet-before-text">{item.original}</p>
              <hr className="pr-bullet-divider" />
              <p className="pr-bullet-after-label">AI-Improved</p>
              <p className="pr-bullet-after-text">{item.improved}</p>
            </div>
          ))}
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 9 — Interview Preparation
          ════════════════════════════════════════════════════════════════ */}
      {interviewCategories.length > 0 && (
        <section className="pr-section">
          <h2 className="pr-section-heading">Interview Preparation</h2>
          {interviewCategories.map((cat) => (
            <div key={cat} className="pr-interview-category">
              <h3 className="pr-interview-category-heading">{cat}</h3>
              {groupedQuestions[cat].map((q, idx) => (
                <div key={idx} className="pr-interview-question">
                  <div className="pr-question-row">
                    <DifficultyBadge difficulty={q.difficulty} />
                    <p className="pr-question-text">{q.question}</p>
                  </div>
                  {q.hint && (
                    <p className="pr-question-hint">
                      <strong>💡 Tip:</strong> {q.hint}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ))}
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 10 — Learning Roadmap
          ════════════════════════════════════════════════════════════════ */}
      {skill_roadmap.length > 0 && (
        <section className="pr-section">
          <h2 className="pr-section-heading">Learning Roadmap</h2>
          <ol className="pr-roadmap-list">
            {skill_roadmap.map((item, idx) => {
              return (
                <li key={idx} className="pr-roadmap-item">
                  <div className="pr-roadmap-step-num" aria-hidden="true">
                    {idx + 1}
                  </div>
                  <div className="pr-roadmap-card">
                    <div className="pr-roadmap-card-top">
                      <span className="pr-roadmap-skill">{item.skill}</span>
                      {item.weeks != null && (
                        <span className="pr-roadmap-badge pr-roadmap-badge--weeks">
                          {item.weeks} {item.weeks === 1 ? 'week' : 'weeks'}
                        </span>
                      )}
                      {item.priority && (
                        <PriorityBadge priority={item.priority} />
                      )}
                    </div>
                    {Array.isArray(item.resources) && item.resources.length > 0 && (
                      <ul className="pr-roadmap-resources">
                        {item.resources.map((res, rIdx) => (
                          <li key={rIdx} className="pr-roadmap-resource">{res}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          Document Footer
          ════════════════════════════════════════════════════════════════ */}
      <footer className="pr-doc-footer">
        <span className="pr-doc-footer-text">
          AI Resume Coach — Confidential Analysis Report
        </span>
        <span className="pr-doc-footer-text">
          Generated: {generatedAt}
        </span>
      </footer>
    </div>
  );
});

export default PrintableReport;
