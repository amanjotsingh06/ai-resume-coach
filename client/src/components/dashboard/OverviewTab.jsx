import './OverviewTab.css';

/**
 * OverviewTab – two‑column assessment cards (Overview Stitch screen).
 *
 * @param {{ overall_assessment: string, experience_alignment: string }} data
 */
export default function OverviewTab({ data }) {
  const { overall_assessment, experience_alignment, strengths = [], weaknesses = [], education_match } = data ?? {};

  return (
    <section
      className="overview-tab space-y-6"
      role="tabpanel"
      id="tabpanel-overview"
      aria-labelledby="tab-overview"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left card – Overall Assessment */}
        <article className="bg-[#12121A] border border-[#2D2D3F] rounded-xl p-6 transition-shadow hover:shadow-[0_8px_32px_rgba(99,102,241,0.08)]">
          <header className="flex items-center gap-3 mb-4">
            <span className="text-2xl" aria-hidden="true">🧠</span>
            <h2 className="font-['Syne'] font-bold text-lg text-[#F1F5F9] m-0">Overall Assessment</h2>
          </header>
          <p className="font-['DM_Sans'] text-[#94A3B8] text-sm leading-relaxed m-0">
            {overall_assessment ?? 'No assessment available.'}
          </p>
        </article>

        {/* Right card – Experience Alignment */}
        <article className="bg-[#12121A] border border-[#2D2D3F] rounded-xl p-6 transition-shadow hover:shadow-[0_8px_32px_rgba(99,102,241,0.08)]">
          <header className="flex items-center gap-3 mb-4">
            <span className="text-2xl" aria-hidden="true">🎯</span>
            <h2 className="font-['Syne'] font-bold text-lg text-[#F1F5F9] m-0">Experience Alignment</h2>
          </header>
          <p className="font-['DM_Sans'] text-[#94A3B8] text-sm leading-relaxed m-0">
            {experience_alignment ?? 'No alignment data available.'}
          </p>
        </article>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Strengths */}
        <article className="bg-[#12121A] border border-[#10B981]/20 rounded-xl p-6 relative overflow-hidden transition-all hover:border-[#10B981]/50 group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#10B981] to-[#34D399] opacity-70"></div>
          <header className="flex items-center gap-3 mb-4">
            <span className="material-symbols-outlined text-[#10B981] text-xl">trending_up</span>
            <h2 className="font-['Syne'] font-bold text-md text-[#F1F5F9] m-0">Strengths</h2>
          </header>
          {strengths.length > 0 ? (
            <ul className="space-y-3 m-0 p-0 list-none">
              {strengths.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-[#94A3B8] font-['DM_Sans']">
                  <span className="text-[#10B981] mt-0.5">•</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-[#64748B] italic">No strengths identified.</p>
          )}
        </article>

        {/* Weaknesses */}
        <article className="bg-[#12121A] border border-[#F43F5E]/20 rounded-xl p-6 relative overflow-hidden transition-all hover:border-[#F43F5E]/50 group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#F43F5E] to-[#FB7185] opacity-70"></div>
          <header className="flex items-center gap-3 mb-4">
            <span className="material-symbols-outlined text-[#F43F5E] text-xl">trending_down</span>
            <h2 className="font-['Syne'] font-bold text-md text-[#F1F5F9] m-0">Weaknesses</h2>
          </header>
          {weaknesses.length > 0 ? (
            <ul className="space-y-3 m-0 p-0 list-none">
              {weaknesses.map((w, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-[#94A3B8] font-['DM_Sans']">
                  <span className="text-[#F43F5E] mt-0.5">•</span>
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-[#64748B] italic">No weaknesses identified.</p>
          )}
        </article>

        {/* Education Match */}
        <article className="bg-[#12121A] border border-[#6366F1]/20 rounded-xl p-6 relative overflow-hidden transition-all hover:border-[#6366F1]/50 group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#6366F1] to-[#818CF8] opacity-70"></div>
          <header className="flex items-center gap-3 mb-4">
            <span className="material-symbols-outlined text-[#6366F1] text-xl">school</span>
            <h2 className="font-['Syne'] font-bold text-md text-[#F1F5F9] m-0">Education Match</h2>
          </header>
          <p className="font-['DM_Sans'] text-[#94A3B8] text-sm leading-relaxed m-0">
            {education_match ?? 'No education matching data available.'}
          </p>
        </article>
      </div>
    </section>
  );
}
