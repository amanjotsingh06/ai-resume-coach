import React from 'react';

const DIMENSIONS = [
  { key: 'keyword_match',        label: 'Keyword Match',          color: '#6366F1' },
  { key: 'skills_match',         label: 'Skills Match',           color: '#22D3EE' },
  { key: 'experience_relevance', label: 'Experience Relevance',   color: '#F97316' },
  { key: 'education_match',      label: 'Education Match',        color: '#A855F7' },
  { key: 'formatting',           label: 'Formatting',             color: '#10B981' },
];

function ScoreBar({ label, score, color }) {
  const pct = Math.max(0, Math.min(100, score ?? 0));
  const hasData = score != null && score > 0;

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="text-sm text-[#94A3B8] font-medium">{label}</span>
        <span
          className="text-sm font-bold font-['JetBrains_Mono']"
          style={{ color: hasData ? color : '#475569' }}
          aria-label={`${label}: ${hasData ? pct + '%' : 'no data'}`}
        >
          {hasData ? `${pct}%` : '—'}
        </span>
      </div>
      <div
        className="h-2 bg-[#1E1E2E] rounded-full overflow-hidden"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${pct}%`,
            background: hasData ? color : 'transparent',
          }}
        />
      </div>
    </div>
  );
}

/**
 * ScoreBreakdown — shows the 5 AI-evaluated ATS dimensions as progress bars.
 * These are the application's own evaluation methodology, not scores from any
 * commercial ATS platform.
 */
export default function ScoreBreakdown({ breakdown }) {
  const hasAnyData = breakdown && Object.values(breakdown).some((v) => v > 0);

  return (
    <div
      className="rounded-xl p-6 lg:p-8 mb-8"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)' }}
    >
      <div className="mb-6">
        <h2 className="font-['Syne'] font-bold text-lg text-[#F1F5F9] mb-1">
          ATS Score Breakdown
        </h2>
        <p className="text-xs text-[#64748B]">
          AI-assisted evaluation across 5 dimensions — not the algorithm of any commercial ATS platform.
        </p>
      </div>

      {hasAnyData ? (
        <div className="space-y-4">
          {DIMENSIONS.map(({ key, label, color }) => (
            <ScoreBar
              key={key}
              label={label}
              score={breakdown?.[key]}
              color={color}
            />
          ))}
        </div>
      ) : (
        <p className="text-sm text-[#64748B] italic">
          Score breakdown not available for this analysis. Run a new analysis to see the breakdown.
        </p>
      )}
    </div>
  );
}
