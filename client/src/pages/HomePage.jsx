import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function HomePage() {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="bg-background text-on-background dm-sans selection:bg-primary/30">
      {/* ── TopNavBar ── */}
      <nav className="fixed top-0 w-full z-50 bg-[#0A0A0F]">
        <div className="flex justify-between items-center w-full px-4 md:px-8 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <span className="text-xl md:text-2xl font-bold tracking-tight text-white font-headline syne-bold">
              AI Resume Coach
            </span>
            <div className="w-2 h-2 rounded-full bg-primary mt-1 md:mt-2"></div>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <a className="text-gray-400 font-medium hover:text-white transition-colors" href="#">
              Features
            </a>
            <a className="text-gray-400 font-medium hover:text-white transition-colors" href="#">
              Privacy
            </a>
            <a className="text-gray-400 font-medium hover:text-white transition-colors" href="#">
              Pricing
            </a>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={() => navigate('/login')}
              className="px-5 py-2 rounded-lg border border-outline-variant/30 text-white font-medium hover:bg-white/5 transition-all duration-200 active:scale-95"
            >
              Login
            </button>
            <button
              onClick={() => navigate('/signup')}
              className="px-5 py-2 rounded-lg gradient-primary text-white font-bold transition-all duration-200 hover:opacity-90 active:scale-95"
            >
              Get Started
            </button>
          </div>

          <button 
            className="md:hidden text-white flex items-center justify-center p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle Menu"
          >
            <span className="material-symbols-outlined text-3xl">
              {isMobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-[#0A0A0F] border-t border-[#2D2D3F] p-4 flex flex-col gap-4 shadow-2xl pb-6">
            <a className="text-gray-300 font-medium text-lg px-2 hover:text-white" href="#">Features</a>
            <a className="text-gray-300 font-medium text-lg px-2 hover:text-white" href="#">Privacy</a>
            <a className="text-gray-300 font-medium text-lg px-2 hover:text-white" href="#">Pricing</a>
            <div className="h-px w-full bg-white/10 my-2"></div>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => navigate('/login')}
                className="w-full px-5 py-3 rounded-lg border border-outline-variant/30 text-white font-medium hover:bg-white/5 text-center active:bg-white/10"
              >
                Login
              </button>
              <button
                onClick={() => navigate('/signup')}
                className="w-full px-5 py-3 rounded-lg gradient-primary text-white font-bold text-center active:opacity-90"
              >
                Get Started
              </button>
            </div>
          </div>
        )}
      </nav>

      <main className="pt-24">
        {/* ── Hero Section ── */}
        <section className="max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-20 flex flex-col md:flex-row items-center gap-12 md:gap-16">
          <div className="w-full md:w-[60%] space-y-8">
            <div className="inline-flex items-center px-3 py-1 rounded-sm bg-primary/10 border border-primary/20 text-primary text-xs font-bold tracking-widest uppercase">
              AI &amp; ML Powered
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-7xl syne-bold leading-[1.1] text-white">
              Your <span className="text-primary">Private</span> AI Career Coach
            </h1>

            <div className="space-y-4">
              <p className="text-secondary text-xl font-medium tracking-tight">
                No cloud. No data leaks. Just results.
              </p>
              <p className="text-on-surface-variant text-lg max-w-xl leading-relaxed">
                The world's first fully localized resume intelligence engine.
                We process your career data directly on your hardware, ensuring
                your professional history never leaves your sight.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                onClick={() => navigate('/signup')}
                className="w-full sm:w-auto px-8 py-4 rounded-lg gradient-primary text-on-primary-fixed font-bold text-lg hover:opacity-90 transition-all active:scale-95"
              >
                Start Free Analysis
              </button>
              <button
                onClick={() =>
                  document
                    .getElementById('how-it-works')
                    ?.scrollIntoView({ behavior: 'smooth' })
                }
                className="w-full sm:w-auto px-8 py-4 rounded-lg border border-outline-variant/30 text-white font-bold text-lg hover:bg-white/5 transition-all active:scale-95"
              >
                See How It Works
              </button>
            </div>
          </div>

          {/* Hero Card */}
          <div className="w-full md:w-[40%]">
            <div className="relative">
              <div className="absolute -inset-4 bg-primary/10 blur-3xl rounded-full"></div>
              <div className="relative p-8 bg-surface-container-high rounded-xl border border-outline-variant/20 shadow-2xl">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h3 className="text-sm font-bold text-outline uppercase tracking-wider mb-1">
                      Current Match Score
                    </h3>
                    <div className="text-5xl jetbrains font-bold text-tertiary">78%</div>
                  </div>
                  <span className="material-symbols-outlined text-primary text-3xl">analytics</span>
                </div>

                <div className="space-y-6">
                  <div>
                    <div className="text-xs font-bold text-outline-variant uppercase mb-3">
                      Identified Strengths
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1 bg-surface-container rounded text-xs text-secondary border border-secondary/20">
                        System Design
                      </span>
                      <span className="px-3 py-1 bg-surface-container rounded text-xs text-secondary border border-secondary/20">
                        Kubernetes
                      </span>
                      <span className="px-3 py-1 bg-surface-container rounded text-xs text-secondary border border-secondary/20">
                        React Architecture
                      </span>
                    </div>
                  </div>

                  <div className="p-4 bg-surface-container-lowest rounded-lg border-l-4 border-secondary">
                    <div className="jetbrains text-xs text-secondary mb-1">PROMPT_ENGINEER_ADVICE</div>
                    <p className="text-sm text-on-surface-variant italic">
                      "Quantify your impact in section 02. Suggesting: 'Optimized CI/CD pipeline reducing build times by 40%'"
                    </p>
                  </div>
                </div>
              </div>

              {/* Decorative element */}
              <div className="absolute -bottom-6 -right-6 p-4 bg-surface-container-highest rounded-lg border border-outline-variant/20 hidden lg:block">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center">
                    <span className="material-symbols-outlined text-secondary text-sm">security</span>
                  </div>
                  <div className="text-[10px] font-mono leading-tight">
                    <div className="text-white">ENCRYPTION ACTIVE</div>
                    <div className="text-outline">LOCAL_HOST_PROCESS</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Stats Row ── */}
        <section className="max-w-7xl mx-auto px-4 md:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-surface-container-high p-8 rounded-xl border border-outline-variant/20 flex flex-col items-center text-center">
              <div className="text-4xl jetbrains font-bold text-[#F43F5E] mb-2">75%</div>
              <p className="text-on-surface-variant font-medium">Higher Interview Rate</p>
            </div>
            <div className="bg-surface-container-high p-8 rounded-xl border border-outline-variant/20 flex flex-col items-center text-center">
              <div className="text-4xl jetbrains font-bold text-secondary mb-2">&lt; 30s</div>
              <p className="text-on-surface-variant font-medium">Analysis Speed</p>
            </div>
            <div className="bg-surface-container-high p-8 rounded-xl border border-outline-variant/20 flex flex-col items-center text-center">
              <div className="text-4xl jetbrains font-bold text-tertiary mb-2">100%</div>
              <p className="text-on-surface-variant font-medium">Data Privacy Guaranteed</p>
            </div>
          </div>
        </section>

        {/* ── Features Section ── */}
        <section className="max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-24">
          <div className="mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl syne-bold text-white mb-4">Engineered for Excellence</h2>
            <p className="text-on-surface-variant max-w-2xl">
              Advanced neural networks designed to think like a technical recruiter, giving you the edge without compromising your data.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group bg-surface-container-high p-8 rounded-xl border border-outline-variant/10 hover:border-primary/40 transition-all duration-300">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-primary">analytics</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Match Score</h3>
              <p className="text-on-surface-variant leading-relaxed">
                Instant scoring against 15,000+ job descriptions to see exactly where you stand in the applicant pool.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group bg-surface-container-high p-8 rounded-xl border border-outline-variant/10 hover:border-secondary/40 transition-all duration-300">
              <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-secondary">distance</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Skill Gap</h3>
              <p className="text-on-surface-variant leading-relaxed">
                Visual mapping of missing keywords and technologies required for your target senior positions.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group bg-surface-container-high p-8 rounded-xl border border-outline-variant/10 hover:border-tertiary/40 transition-all duration-300">
              <div className="w-12 h-12 bg-tertiary/10 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-tertiary">edit_note</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Bullet Rewriter</h3>
              <p className="text-on-surface-variant leading-relaxed">
                Transform passive duties into high-impact, quantified achievements using industry-standard action verbs.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="group bg-surface-container-high p-8 rounded-xl border border-outline-variant/10 hover:border-orange-400/40 transition-all duration-300">
              <div className="w-12 h-12 bg-orange-400/10 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-orange-400">forum</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Interview Prep</h3>
              <p className="text-on-surface-variant leading-relaxed">
                AI-generated behavioral questions based on your specific experience and the target job role.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="group bg-surface-container-high p-8 rounded-xl border border-outline-variant/10 hover:border-rose-400/40 transition-all duration-300">
              <div className="w-12 h-12 bg-rose-400/10 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-rose-400">map</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Learning Roadmap</h3>
              <p className="text-on-surface-variant leading-relaxed">
                Curated list of certifications and projects needed to close your technical gaps and boost your value.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="group bg-surface-container-high p-8 rounded-xl border border-outline-variant/10 hover:border-white/40 transition-all duration-300">
              <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-white">vpn_lock</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Zero Cloud Privacy</h3>
              <p className="text-on-surface-variant leading-relaxed">
                The only AI resume tool that runs 100% locally. Your data is encrypted and never touches our servers.
              </p>
            </div>
          </div>
        </section>

        {/* ── How It Works ── */}
        <section id="how-it-works" className="bg-surface-container-low py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="text-center mb-16 md:mb-20">
              <h2 className="text-3xl md:text-4xl syne-bold text-white mb-4">Four Steps to a Senior Offer</h2>
              <p className="text-on-surface-variant max-w-xl mx-auto">
                Our streamlined process is designed for technical professionals who value efficiency and privacy.
              </p>
            </div>

            <div className="relative flex flex-col md:flex-row justify-between gap-12">
              {/* Step 1 */}
              <div className="flex-1 relative z-10">
                <div className="jetbrains text-primary font-bold text-sm mb-4">STEP 01</div>
                <div className="p-6 bg-surface-container rounded-xl border border-outline-variant/20 h-full">
                  <h4 className="text-lg font-bold text-white mb-3">Secure Upload</h4>
                  <p className="text-sm text-on-surface-variant">
                    Drop your PDF or Word doc. It's instantly parsed and encrypted in your browser.
                  </p>
                </div>
              </div>

              <div className="hidden md:flex items-center text-outline-variant/30">
                <span className="material-symbols-outlined text-4xl">trending_flat</span>
              </div>

              {/* Step 2 */}
              <div className="flex-1 relative z-10">
                <div className="jetbrains text-secondary font-bold text-sm mb-4">STEP 02</div>
                <div className="p-6 bg-surface-container rounded-xl border border-outline-variant/20 h-full">
                  <h4 className="text-lg font-bold text-white mb-3">Target Match</h4>
                  <p className="text-sm text-on-surface-variant">
                    Paste the job description. Our AI analyzes the semantic overlap and latent requirements.
                  </p>
                </div>
              </div>

              <div className="hidden md:flex items-center text-outline-variant/30">
                <span className="material-symbols-outlined text-4xl">trending_flat</span>
              </div>

              {/* Step 3 */}
              <div className="flex-1 relative z-10">
                <div className="jetbrains text-tertiary font-bold text-sm mb-4">STEP 03</div>
                <div className="p-6 bg-surface-container rounded-xl border border-outline-variant/20 h-full">
                  <h4 className="text-lg font-bold text-white mb-3">AI Refinement</h4>
                  <p className="text-sm text-on-surface-variant">
                    Receive line-by-line critiques and re-writes to optimize for both ATS and human eyes.
                  </p>
                </div>
              </div>

              <div className="hidden md:flex items-center text-outline-variant/30">
                <span className="material-symbols-outlined text-4xl">trending_flat</span>
              </div>

              {/* Step 4 */}
              <div className="flex-1 relative z-10">
                <div className="jetbrains text-orange-400 font-bold text-sm mb-4">STEP 04</div>
                <div className="p-6 bg-surface-container rounded-xl border border-outline-variant/20 h-full">
                  <h4 className="text-lg font-bold text-white mb-3">Export &amp; Apply</h4>
                  <p className="text-sm text-on-surface-variant">
                    Download your optimized, ATS-ready resume and start applying with confidence.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA Area ── */}
        <section className="max-w-7xl mx-auto px-4 md:px-8 py-20 md:py-32">
          <div className="relative overflow-hidden bg-surface-container-high rounded-3xl p-8 md:p-20 border border-outline-variant/20">
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-primary/10 blur-[100px] rounded-full"></div>
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-secondary/10 blur-[100px] rounded-full"></div>

            <div className="relative z-10 flex flex-col items-center text-center max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-5xl syne-bold text-white mb-6 leading-tight">
                Ready to scale your career?
              </h2>
              <p className="text-on-surface-variant text-lg mb-10">
                Join 50,000+ developers who landed roles at FAANG, OpenAI, and high-growth startups using our private AI coach.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                <button
                  onClick={() => navigate('/signup')}
                  className="px-10 py-5 rounded-lg gradient-primary text-on-primary-fixed font-bold text-xl hover:opacity-90 transition-all active:scale-95 shadow-xl shadow-primary/20"
                >
                  Analyze My Resume Now
                </button>
              </div>
              <div className="mt-8 flex items-center gap-2 text-outline text-sm">
                <span className="material-symbols-outlined text-tertiary">check_circle</span>
                No credit card required for initial analysis
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="bg-[#0A0A0F] w-full border-t border-[#2D2D3F]/15">
        <div className="w-full px-4 md:px-8 py-12 flex flex-col md:flex-row justify-between items-center max-w-7xl mx-auto gap-8">
          <div className="space-y-4 text-center md:text-left">
            <div className="flex items-center gap-2 justify-center md:justify-start">
              <span className="text-lg font-bold text-white">AI Resume Coach</span>
              <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
            </div>
            <p className="text-xs text-gray-500 max-w-xs">
              Built with Next.js, Tailwind, and OpenAI. The ultimate privacy-first career advancement platform.
            </p>
          </div>

          <div className="flex items-center gap-8 text-sm">
            <a className="text-gray-500 hover:text-white transition-colors" href="#">GitHub</a>
            <a className="text-gray-500 hover:text-white transition-colors" href="#">Documentation</a>
            <a className="text-gray-500 hover:text-white transition-colors" href="#">Privacy Policy</a>
          </div>

          <div className="text-xs text-gray-500">
            © 2026 AI Resume Coach. Built with React.js, Tailwind, and Ollama
          </div>
        </div>
      </footer>
    </div>
  );
}
