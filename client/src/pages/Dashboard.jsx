import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { getHistory } from '../services/api';
import SkeletonCard from '../components/common/SkeletonCard';
import EmptyState from '../components/common/EmptyState';
import AnalysisCard from '../components/history/AnalysisCard';

// React Icons — already installed in this project
import {
  MdDashboard,
  MdHistory,
  MdMenuBook,
  MdHelpOutline,
  MdSettings,
  MdAdd,
  MdNotifications,
  MdLogout,
  MdPsychology,
  MdSchedule,
  MdArrowForward,
  MdChevronRight,
} from 'react-icons/md';

/* ─── helpers ─────────────────────────────────────────────── */
function getInitials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('');
}

/* Score ring matching the reference */
function ScoreRing({ score }) {
  const r = 26;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;

  let color = '#F87171'; // red for low
  if (score > 70) color = '#22D3EE';       // cyan high
  else if (score >= 40) color = '#91db2a'; // lime mid

  return (
    <div className="relative flex-shrink-0 w-[60px] h-[60px]">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 60 60">
        <circle cx="30" cy="30" r={r} fill="transparent" stroke="#2a292f" strokeWidth="4" />
        <circle
          cx="30" cy="30" r={r}
          fill="transparent"
          stroke={color}
          strokeWidth="4"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <span
        className="absolute inset-0 flex items-center justify-center text-[11px] font-bold"
        style={{ color, fontFamily: "'JetBrains Mono', monospace" }}
      >
        {score}%
      </span>
    </div>
  );
}

/* ─── Sidebar link ────────────────────────────────────────── */
function SideLink({ Icon: IconComp, label, to, active }) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-4 py-[11px] rounded-lg text-sm font-medium transition-all duration-150 ${active
          ? 'bg-[#1f1f25] text-white font-bold'
          : 'text-[#a1a1aa] hover:bg-[#1f1f25] hover:text-white'
        }`}
    >
      <IconComp size={20} className={active ? 'text-[#c0c1ff]' : 'text-[#a1a1aa]'} />
      {label}
    </Link>
  );
}

/* ─── Top nav link ────────────────────────────────────────── */
function TopLink({ label, to, active }) {
  return (
    <Link
      to={to}
      className={`text-sm font-medium transition-colors duration-200 pb-[3px] ${active
          ? 'text-[#6366F1] border-b-2 border-[#6366F1]'
          : 'text-[#a1a1aa] hover:text-white'
        }`}
    >
      {label}
    </Link>
  );
}

/* ══════════════════════════════════════════════════════════ */
export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const [recentAnalyses, setRecentAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);

  const firstName = user?.name?.split(' ')[0] || 'there';
  const initials = getInitials(user?.name);

  useEffect(() => {
    getHistory()
      .then((res) => setRecentAnalyses(res.data.data.slice(0, 3)))
      .catch(() => setRecentAnalyses([]))
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = () => { logout(); navigate('/login'); };

  const sideLinks = [
    { Icon: MdDashboard, label: 'Dashboard', to: '/home' },
    { Icon: MdHistory, label: 'History', to: '/history' },
    { Icon: MdMenuBook, label: 'Resources', to: '/resources' },
    { Icon: MdHelpOutline, label: 'Support', to: '/support' },
  ];

  const topLinks = [
    { label: 'Dashboard', to: '/home' },
    { label: 'History', to: '/history' },
    { label: 'Resources', to: '/resources' },
    { label: 'Support', to: '/support' },
  ];

  return (
    <div
      className="min-h-screen bg-[#131318] text-[#e4e1e9]"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* ─── TOP NAVBAR ─────────────────────────────────────── */}
      <nav className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-4 md:px-8 h-[72px] bg-[#1b1b20] border-b border-white/[0.06]">
        {/* Brand */}
        <Link
          to="/home"
          className="text-[22px] font-black text-white tracking-tight leading-none"
          style={{ fontFamily: "'Syne', sans-serif" }}
        >
          AI Resume Coach
        </Link>

        {/* Centre nav */}
        <div className="hidden md:flex items-center gap-8">
          {topLinks.map((tl) => (
            <TopLink key={tl.label} {...tl} active={location.pathname === tl.to} />
          ))}
        </div>

        {/* Right cluster */}
        <div className="flex items-center gap-2">
          {/* Bell */}
          <button
            className="text-[#a1a1aa] hover:text-white p-2 rounded-lg transition-colors hidden sm:block"
            aria-label="Notifications"
          >
            <MdNotifications size={22} />
          </button>

          {/* Divider */}
          <div className="w-px h-8 bg-white/10 mx-1 md:mx-2 hidden sm:block" />

          {/* User block */}
          <div className="hidden sm:flex flex-col items-end leading-tight mr-3">
            <span
              className="text-white font-bold text-sm"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              {user?.name || 'User'}
            </span>
            <span className="text-[#a1a1aa] text-[11px]">Premium Plan</span>
          </div>

          {/* Avatar */}
          <div className="w-9 h-9 rounded-full bg-[#35343a] border border-white/10 flex items-center justify-center text-sm font-bold text-white select-none">
            {initials || '?'}
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-[#a1a1aa] hover:text-red-400 transition-colors ml-2"
            aria-label="Logout"
          >
            <MdLogout size={20} />
            <span className="text-xs font-medium hidden lg:inline">Logout</span>
          </button>
        </div>
      </nav>

      {/* ─── SIDEBAR ────────────────────────────────────────── */}
      <aside className="fixed left-0 top-[72px] bottom-0 hidden lg:flex flex-col w-[220px] bg-[#1b1b20] border-r border-white/[0.06] z-40">
        {/* Nav links */}
        <nav className="flex flex-col gap-[2px] px-3 pt-5 flex-1">
          {sideLinks.map((sl) => (
            <SideLink key={sl.label} {...sl} active={location.pathname === sl.to} />
          ))}
        </nav>

        {/* Bottom section */}
        <div className="px-3 pb-6 border-t border-white/[0.06] pt-5">
          {/* CTA */}
          <button
            onClick={() => navigate('/analyze')}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-bold text-[11px] uppercase tracking-wider mb-2 transition-opacity hover:opacity-90"
            style={{
              background: 'linear-gradient(135deg, #c0c1ff 0%, #8083ff 100%)',
              color: '#1000a9',
            }}
          >
            <MdAdd size={18} />
            Analyze New Resume
          </button>

          {/* Settings */}
          <Link
            to="/settings"
            className="flex items-center gap-3 px-4 py-[11px] rounded-lg text-sm text-[#a1a1aa] hover:bg-[#1f1f25] hover:text-white transition-all"
          >
            <MdSettings size={20} />
            Settings
          </Link>
        </div>
      </aside>

      {/* ─── MAIN CONTENT ───────────────────────────────────── */}
      <main className="lg:ml-[220px] pt-[88px] pb-28 lg:pb-20 px-4 sm:px-8 md:px-10">

        {/* Welcome */}
        <header className="mb-10">
          <h1
            className="text-4xl md:text-5xl font-black text-white tracking-tight mb-1"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            Welcome back, {firstName}
          </h1>
          <p className="text-[#94A3B8] text-sm mt-2">
            What would you like to do today?
          </p>
        </header>

        {/* ── ACTION CARDS ──────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">

          {/* Analyze Resume */}
          <div className="group relative overflow-hidden bg-[#1a1a3a] border border-[#6366F1]/40 rounded-2xl p-6 md:p-8 flex flex-col transition-all duration-300 hover:border-[#6366F1] hover:shadow-[0_0_40px_rgba(99,102,241,0.18)]">
            {/* Ghost icon — properly clipped */}
            <div
              className="absolute -right-6 -top-6 text-[#6366F1] opacity-[0.07] group-hover:opacity-[0.13] transition-opacity duration-300 pointer-events-none select-none"
              aria-hidden="true"
            >
              <MdPsychology size={180} />
            </div>

            <div className="relative z-10 flex flex-col h-full">
              {/* Icon badge */}
              <div className="w-[52px] h-[52px] rounded-xl bg-[#6366F1]/10 border border-[#6366F1]/20 flex items-center justify-center mb-6">
                <MdPsychology size={28} className="text-[#6366F1]" />
              </div>

              <h2
                className="text-2xl font-bold text-white mb-2"
                style={{ fontFamily: "'Syne', sans-serif" }}
              >
                Analyze Resume
              </h2>
              <p className="text-[#94A3B8] text-sm leading-relaxed mb-8">
                Upload your latest resume for a comprehensive AI scan. Match against specific job
                descriptions to find skill gaps.
              </p>

              <button
                onClick={() => navigate('/analyze')}
                className="mt-auto w-full flex items-center justify-center gap-2 bg-[#6366F1] hover:bg-[#4f46e5] text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 group-hover:translate-x-0.5"
              >
                Start New Analysis
                <MdArrowForward size={18} />
              </button>
            </div>
          </div>

          {/* Analysis History */}
          <div className="group relative overflow-hidden bg-[#1E1E2E] border border-[#2D2D3F] rounded-2xl p-6 md:p-8 flex flex-col transition-all duration-300 hover:border-[#464554] hover:bg-[#1f2030]">
            {/* Ghost icon */}
            <div
              className="absolute -right-6 -top-6 text-[#94A3B8] opacity-[0.05] group-hover:opacity-[0.10] transition-opacity duration-300 pointer-events-none select-none"
              aria-hidden="true"
            >
              <MdSchedule size={180} />
            </div>

            <div className="relative z-10 flex flex-col h-full">
              {/* Icon badge */}
              <div className="w-[52px] h-[52px] rounded-xl bg-[#2a292f] border border-white/[0.07] flex items-center justify-center mb-6">
                <MdSchedule size={28} className="text-[#94A3B8]" />
              </div>

              <h2
                className="text-2xl font-bold text-white mb-2"
                style={{ fontFamily: "'Syne', sans-serif" }}
              >
                Analysis History
              </h2>
              <p className="text-[#94A3B8] text-sm leading-relaxed mb-8">
                Track your progress over time. Revisit past feedback, scores, and specific role
                improvements from previous sessions.
              </p>

              <button
                onClick={() => navigate('/history')}
                className="mt-auto w-full flex items-center justify-center gap-2 bg-[#252536] border border-[#2D2D3F] hover:border-[#6366F1] hover:text-[#6366F1] text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 group-hover:translate-x-0.5"
              >
                View History
                <MdArrowForward size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* ── RECENT ANALYSES ───────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h3
              className="text-xl font-bold text-white"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              Recent Analyses
            </h3>
            <button
              onClick={() => navigate('/history')}
              className="flex items-center gap-0.5 text-[#6366F1] text-sm font-bold hover:underline underline-offset-4"
            >
              View all
              <MdChevronRight size={18} />
            </button>
          </div>

          {/* Loading skeletons */}
          {loading && (
            <div className="space-y-3">
              {[1, 2, 3].map((n) => (
                <SkeletonCard key={n} height="88px" />
              ))}
            </div>
          )}

          {/* Analysis list */}
          {!loading && recentAnalyses.length > 0 && (
            <div className="space-y-3">
              {recentAnalyses.map((a) => (
                <AnalysisCard
                  key={a._id}
                  analysis={a}
                  onClick={() => navigate(`/results/${a._id}`)}
                />
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && recentAnalyses.length === 0 && (
            <EmptyState
              title="No analyses yet"
              description="Complete your first resume analysis to see results here"
              buttonText="Start First Analysis"
              onButtonClick={() => navigate('/analyze')}
            />
          )}
        </section>

      </main>

      {/* ─── MOBILE BOTTOM NAV ──────────────────────────────── */}
      <nav
        className="lg:hidden fixed bottom-0 inset-x-0 z-50 flex items-center justify-around px-4 py-2 border-t border-white/10"
        style={{ background: 'rgba(27,27,32,0.92)', backdropFilter: 'blur(16px)' }}
      >
        {[
          { Icon: MdDashboard, label: 'Home', to: '/home' },
          { Icon: MdHistory, label: 'History', to: '/history' },
        ].map(({ Icon: IconComp, label, to }) => (
          <Link
            key={label}
            to={to}
            className={`flex flex-col items-center gap-1 p-2 ${location.pathname === to ? 'text-[#c0c1ff]' : 'text-[#a1a1aa]'
              }`}
          >
            <IconComp size={24} />
            <span className="text-[10px] font-bold uppercase">{label}</span>
          </Link>
        ))}

        {/* FAB */}
        <button
          onClick={() => navigate('/analyze')}
          className="w-12 h-12 rounded-full flex items-center justify-center -mt-7 shadow-lg"
          style={{
            background: 'linear-gradient(135deg,#c0c1ff,#8083ff)',
            boxShadow: '0 4px 20px rgba(99,102,241,0.45)',
            color: '#1000a9',
          }}
          aria-label="New Analysis"
        >
          <MdAdd size={26} />
        </button>

        {[
          { Icon: MdMenuBook, label: 'Library', to: '/resources' },
          { Icon: MdSettings, label: 'Settings', to: '/settings' },
        ].map(({ Icon: IconComp, label, to }) => (
          <Link key={label} to={to} className="flex flex-col items-center gap-1 p-2 text-[#a1a1aa]">
            <IconComp size={24} />
            <span className="text-[10px] font-bold uppercase">{label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
