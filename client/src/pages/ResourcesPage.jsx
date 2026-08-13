import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import {
  MdDashboard, MdHistory, MdMenuBook, MdHelpOutline, MdSettings, MdAdd, MdOpenInNew
} from 'react-icons/md';

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

export default function ResourcesPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const sideLinks = [
    { Icon: MdDashboard, label: 'Dashboard', to: '/home' },
    { Icon: MdHistory, label: 'History', to: '/history' },
    { Icon: MdMenuBook, label: 'Resources', to: '/resources' },
    { Icon: MdHelpOutline, label: 'Support', to: '/support' },
  ];

  const resources = [
    {
      category: "Frontend Development",
      items: [
        { title: "React Docs", desc: "The official guide to React.", link: "https://react.dev" },
        { title: "JavaScript Guide", desc: "MDN Web Docs for JS.", link: "https://developer.mozilla.org/en-US/docs/Web/JavaScript" },
        { title: "CSS Tricks", desc: "Tips, tricks, and techniques on using Cascading Style Sheets.", link: "https://css-tricks.com" },
      ]
    },
    {
      category: "Backend Development",
      items: [
        { title: "Node.js Docs", desc: "Official Node.js documentation.", link: "https://nodejs.org/en/docs" },
        { title: "Express Guide", desc: "Fast, unopinionated, minimalist web framework for Node.js.", link: "https://expressjs.com" },
      ]
    },
    {
      category: "DevOps & Tools",
      items: [
        { title: "Docker Docs", desc: "Learn how to build, share, and run applications with Docker.", link: "https://docs.docker.com" },
        { title: "AWS Getting Started", desc: "Start building on AWS today.", link: "https://aws.amazon.com/getting-started" },
      ]
    },
    {
      category: "Interview Preparation",
      items: [
        { title: "LeetCode", desc: "Platform to help you enhance your skills, expand your knowledge.", link: "https://leetcode.com" },
        { title: "GeeksforGeeks", desc: "A computer science portal for geeks.", link: "https://geeksforgeeks.org" },
      ]
    }
  ];

  return (
    <div
      className="min-h-screen bg-[#131318] text-[#e4e1e9]"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <Navbar />

      {/* ─── SIDEBAR ────────────────────────────────────────── */}
      <aside className="fixed left-0 top-[72px] bottom-0 hidden lg:flex flex-col w-[220px] bg-[#1b1b20] border-r border-white/[0.06] z-40">
        <nav className="flex flex-col gap-[2px] px-3 pt-5 flex-1">
          {sideLinks.map((sl) => (
            <SideLink key={sl.label} {...sl} active={location.pathname === sl.to} />
          ))}
        </nav>

        <div className="px-3 pb-6 border-t border-white/[0.06] pt-5">
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
      <main className="lg:ml-[220px] max-w-5xl lg:max-w-none mx-auto pb-20">
        <header className="px-4 sm:px-8 pt-8 pb-6">
          <h1
            className="text-[28px] font-bold text-white leading-none"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            📚 Learning Resources
          </h1>
          <p className="text-[#94A3B8] mt-2 text-sm">
            Improve your skills with curated recommendations
          </p>
        </header>

        <div className="flex flex-col gap-10 px-4 sm:px-8 max-w-5xl">
          {/* Recommended Section (Optional Enhancement) */}
          <section className="bg-gradient-to-r from-[#1E1E2E] to-[#131318] border border-[#6366F1]/30 rounded-2xl p-6 md:p-8 shadow-sm">
            <h2 className="text-xl font-bold text-white mb-2" style={{ fontFamily: "'Syne', sans-serif" }}>
              Recommended for you
            </h2>
            <p className="text-[#94A3B8] text-sm mb-6">Based on your recent resume analysis, here are some hand-picked resources to level up.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
               {/* Static placeholder */}
               <a href="https://react.dev" target="_blank" rel="noreferrer" className="group block bg-[#1a1a24] border border-[#2D2D3F] hover:border-[#6366F1] rounded-xl p-5 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(99,102,241,0.15)] relative overflow-hidden">
                 <div className="absolute top-0 left-0 w-1 h-full bg-[#6366F1]"></div>
                 <h3 className="text-white font-medium mb-1 group-hover:text-[#6366F1] transition-colors flex items-center justify-between">
                   Advanced React Patterns
                   <MdOpenInNew className="opacity-0 group-hover:opacity-100 transition-opacity" />
                 </h3>
                 <p className="text-[#94A3B8] text-xs">Master modern React architecture</p>
               </a>
               <a href="https://nodejs.org" target="_blank" rel="noreferrer" className="group block bg-[#1a1a24] border border-[#2D2D3F] hover:border-[#22D3EE] rounded-xl p-5 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(34,211,238,0.15)] relative overflow-hidden">
                 <div className="absolute top-0 left-0 w-1 h-full bg-[#22D3EE]"></div>
                 <h3 className="text-white font-medium mb-1 group-hover:text-[#22D3EE] transition-colors flex items-center justify-between">
                   Node.js Performance
                   <MdOpenInNew className="opacity-0 group-hover:opacity-100 transition-opacity" />
                 </h3>
                 <p className="text-[#94A3B8] text-xs">Optimize your backend execution</p>
               </a>
            </div>
          </section>

          {/* Categorized Resources */}
          {resources.map((section, idx) => (
            <section key={idx}>
              <div className="mb-4 flex items-center gap-3">
                <h2
                  className="text-lg font-bold text-white bg-[#1E1E2E] px-4 py-2 rounded-lg border border-[#2D2D3F] inline-block"
                >
                  {section.category}
                </h2>
                <div className="h-px bg-[#2D2D3F] flex-1" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {section.items.map((item, itemIdx) => (
                  <a
                    key={itemIdx}
                    href={item.link}
                    target="_blank"
                    rel="noreferrer"
                    className="group block bg-[#1E1E2E] border border-[#2D2D3F] hover:border-[#6366F1] rounded-xl p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_4px_20px_rgba(99,102,241,0.12)]"
                  >
                    <div className="flex justify-between items-start mb-2">
                       <h3 className="text-white font-medium text-sm transition-colors group-hover:text-[#c0c1ff]">{item.title}</h3>
                       <MdOpenInNew className="text-[#464554] group-hover:text-[#6366F1] transition-colors" size={16} />
                    </div>
                    <p className="text-[#94A3B8] text-xs leading-relaxed line-clamp-2">
                      {item.desc}
                    </p>
                  </a>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>
      
      {/* ─── MOBILE BOTTOM NAV ──────────────────────────────── */}
      <nav
        className="lg:hidden fixed bottom-0 inset-x-0 z-50 flex items-center justify-around px-4 py-2 border-t border-white/10 mt-20"
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
          <Link key={label} to={to} className={`flex flex-col items-center gap-1 p-2 ${location.pathname === to ? 'text-[#c0c1ff]' : 'text-[#a1a1aa]'}`}>
            <IconComp size={24} />
            <span className="text-[10px] font-bold uppercase">{label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
