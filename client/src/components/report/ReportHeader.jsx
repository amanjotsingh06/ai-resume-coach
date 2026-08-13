import React from 'react';

/**
 * ReportHeader — displays analysis metadata at the top of the report.
 * Shows: resume name, target role, AI provider + model, date, and ATS score.
 */
export default function ReportHeader({ data }) {
  if (!data) return null;

  const {
    resume_name,
    job_title,
    ai_provider,
    ai_model,
    match_score,
    created_at,
  } = data;

  const displayResume = resume_name || 'Resume';
  const displayRole   = job_title || (data.job_description?.substring(0, 60) + '…') || 'Target Role';
  const displayDate   = created_at
    ? new Date(created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
    : '—';

  const providerLabel = ai_provider === 'gemini' ? 'Google Gemini' : ai_provider === 'ollama' ? 'Local Ollama' : ai_provider || '—';
  const modelLabel    = ai_model || '—';

  const scoreColor =
    match_score > 70 ? '#84CC16'
    : match_score >= 40 ? '#F97316'
    : '#F43F5E';

  const metaItems = [
    { icon: 'description', label: 'Resume',      value: displayResume  },
    { icon: 'work',        label: 'Target Role', value: displayRole    },
    { icon: 'memory',      label: 'AI Provider', value: providerLabel  },
    { icon: 'psychology',  label: 'AI Model',    value: modelLabel     },
    { icon: 'calendar_today', label: 'Analyzed', value: displayDate    },
  ];

  return (
    <div
      className="rounded-xl p-6 lg:p-8 mb-8"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)' }}
    >
      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <p className="text-xs uppercase tracking-widest text-[#64748B] font-['JetBrains_Mono'] mb-1">
            AI Resume Coach — Analysis Report
          </p>
          <h2 className="font-['Syne'] font-bold text-2xl text-[#F1F5F9]">
            {displayRole}
          </h2>
        </div>
        {/* Prominent score badge */}
        <div className="flex flex-col items-center sm:items-end gap-1">
          <span
            className="font-['JetBrains_Mono'] font-bold text-4xl leading-none"
            style={{ color: scoreColor }}
            aria-label={`ATS Compatibility Score: ${match_score} out of 100`}
          >
            {match_score}%
          </span>
          <span className="text-xs text-[#64748B] uppercase tracking-wider">ATS Compatibility</span>
        </div>
      </div>

      {/* Metadata grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 border-t border-[#2D2D3F] pt-6">
        {metaItems.map(({ icon, label, value }) => (
          <div key={label} className="flex flex-col gap-1 min-w-0">
            <div className="flex items-center gap-1.5 text-[#64748B]">
              <span className="material-symbols-outlined text-sm" aria-hidden="true">{icon}</span>
              <span className="text-xs uppercase tracking-wider font-medium">{label}</span>
            </div>
            <p className="text-sm text-[#F1F5F9] font-medium truncate" title={value}>
              {value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
