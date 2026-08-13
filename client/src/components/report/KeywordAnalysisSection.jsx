import React from 'react';

/**
 * KeywordAnalysisSection — shows experience alignment, education match,
 * and keyword insights from the AI analysis.
 */
export default function KeywordAnalysisSection({ data }) {
  const {
    experience_alignment,
    education_match,
    keyword_insights,
  } = data ?? {};

  const hasAny = experience_alignment || education_match || keyword_insights;

  if (!hasAny) {
    return (
      <section
        role="tabpanel"
        id="tabpanel-keywords"
        aria-labelledby="tab-keywords"
        className="py-8"
      >
        <p className="text-sm text-[#64748B] italic text-center">
          Keyword analysis not available for this report.
        </p>
      </section>
    );
  }

  const cards = [
    {
      icon: 'work_history',
      title: 'Experience Alignment',
      body: experience_alignment,
      accent: '#6366F1',
    },
    {
      icon: 'school',
      title: 'Education Match',
      body: education_match,
      accent: '#A855F7',
    },
    {
      icon: 'manage_search',
      title: 'Keyword Insights',
      body: keyword_insights,
      accent: '#22D3EE',
    },
  ].filter((c) => c.body);

  return (
    <section
      role="tabpanel"
      id="tabpanel-keywords"
      aria-labelledby="tab-keywords"
      className="py-2 space-y-4"
    >
      <div className="grid grid-cols-1 gap-4">
        {cards.map(({ icon, title, body, accent }) => (
          <article
            key={title}
            className="rounded-xl p-5 border relative overflow-hidden transition-all"
            style={{ background: '#12121A', borderColor: `${accent}30` }}
          >
            {/* Accent top bar */}
            <div
              className="absolute top-0 left-0 w-full h-0.5"
              style={{ background: `linear-gradient(to right, ${accent}, transparent)` }}
              aria-hidden="true"
            />
            <header className="flex items-center gap-2 mb-3">
              <span
                className="material-symbols-outlined text-xl"
                style={{ color: accent }}
                aria-hidden="true"
              >
                {icon}
              </span>
              <h3 className="font-['Syne'] font-bold text-[#F1F5F9] text-base m-0">{title}</h3>
            </header>
            <p className="text-sm text-[#94A3B8] leading-relaxed m-0">{body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
