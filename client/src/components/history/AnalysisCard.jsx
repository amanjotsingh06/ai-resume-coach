import React from 'react';
import { useNavigate } from 'react-router-dom';
import HistoryPdfButton from './HistoryPdfButton';

/**
 * AnalysisCard — redesigned history card showing resume name, job title,
 * provider, model, score, and date.
 */
export default function AnalysisCard({ analysis }) {
  const navigate = useNavigate();
  if (!analysis) return null;

  const score = analysis.match_score ?? 0;

  const scoreColor =
    score > 70  ? '#84CC16'
    : score >= 40 ? '#F97316'
    : '#F43F5E';

  const scoreBg =
    score > 70  ? 'rgba(132,204,22,0.08)'
    : score >= 40 ? 'rgba(249,115,22,0.08)'
    : 'rgba(244,63,94,0.08)';

  const scoreLabel =
    score > 70  ? 'Strong match'
    : score >= 40 ? 'Partial match'
    : 'Low match';

  const resumeName = analysis.resume_name || 'Resume';
  const jobTitle   = analysis.job_title
    || (analysis.job_description ? analysis.job_description.substring(0, 55) + '…' : 'Untitled Role');

  const providerLabel = analysis.ai_provider === 'gemini'
    ? 'Gemini'
    : analysis.ai_provider === 'ollama'
      ? 'Ollama'
      : analysis.ai_provider || '—';

  const modelLabel = analysis.ai_model || '—';

  const dateStr = analysis.created_at
    ? new Date(analysis.created_at).toLocaleDateString(undefined, {
        year: 'numeric', month: 'short', day: 'numeric',
      })
    : '';

  return (
    <article
      className="group rounded-xl border transition-all duration-200 hover:border-[#6366F1]/50 hover:shadow-[0_4px_24px_rgba(99,102,241,0.08)] cursor-pointer"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)' }}
      onClick={() => navigate(`/results/${analysis._id}`)}
      role="button"
      tabIndex={0}
      aria-label={`View analysis: ${jobTitle}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          navigate(`/results/${analysis._id}`);
        }
      }}
    >
      <div className="p-5 flex flex-col sm:flex-row sm:items-center gap-4">
        {/* Score badge */}
        <div
          className="flex-shrink-0 flex flex-col items-center justify-center w-16 h-16 rounded-xl"
          style={{ background: scoreBg }}
        >
          <span
            className="font-['JetBrains_Mono'] font-bold text-xl leading-none"
            style={{ color: scoreColor }}
          >
            {score}
          </span>
          <span className="text-[10px] text-[#64748B] uppercase tracking-wide mt-0.5">ATS</span>
        </div>

        {/* Middle content */}
        <div className="flex-1 min-w-0">
          <h3 className="font-['Syne'] font-bold text-[#F1F5F9] text-base truncate mb-1">
            {jobTitle}
          </h3>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#64748B]">
            {/* Resume name */}
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-xs" aria-hidden="true">description</span>
              {resumeName}
            </span>

            {/* Provider + Model */}
            {(providerLabel !== '—' || modelLabel !== '—') && (
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-xs" aria-hidden="true">memory</span>
                {providerLabel}
                {modelLabel !== '—' && <span className="text-[#475569]">·</span>}
                {modelLabel !== '—' && modelLabel}
              </span>
            )}

            {/* Date */}
            {dateStr && (
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-xs" aria-hidden="true">calendar_today</span>
                {dateStr}
              </span>
            )}

            {/* Score label (text, not just color) */}
            <span
              className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide"
              style={{ color: scoreColor, background: scoreBg }}
            >
              {scoreLabel}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex-shrink-0 flex items-center gap-2">
          {/* PDF download — does not navigate */}
          <HistoryPdfButton
            analysisId={analysis._id}
            resumeName={resumeName}
            jobTitle={jobTitle}
          />

          {/* View report — navigates */}
          <span
            className="inline-flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-semibold text-[#94A3B8] border border-[#2D2D3F] group-hover:border-[#6366F1] group-hover:text-[#F1F5F9] transition-all"
            aria-hidden="true"
          >
            View Report
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </span>
        </div>
      </div>
    </article>
  );
}
