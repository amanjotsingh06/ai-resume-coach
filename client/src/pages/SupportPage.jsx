import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import {
  MdDashboard, MdHistory, MdMenuBook, MdHelpOutline, MdSettings, MdAdd,
  MdOutlineUploadFile, MdOutlineTextSnippet, MdMemory, MdOutlineAutoAwesome, MdTrendingUp,
  MdKeyboardArrowDown, MdShield
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

const faqs = [
  {
    q: "How long does analysis take?",
    a: "Typically 30–60 seconds, depending on your resume size and the local AI processing speed."
  },
  {
    q: "Is my data safe?",
    a: "Yes, everything runs locally on your machine using Ollama. No data is sent to external servers."
  },
  {
    q: "Can I reuse results?",
    a: "Yes, all your previous analyses are stored securely in your dashboard under History."
  }
];

export default function SupportPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [openFaq, setOpenFaq] = useState(null);

  const sideLinks = [
    { Icon: MdDashboard, label: 'Dashboard', to: '/home' },
    { Icon: MdHistory, label: 'History', to: '/history' },
    { Icon: MdMenuBook, label: 'Resources', to: '/resources' },
    { Icon: MdHelpOutline, label: 'Support', to: '/support' },
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
            💬 Support & Help
          </h1>
          <p className="text-[#94A3B8] mt-2 text-sm">
            Understand how the system works and your data privacy
          </p>
        </header>

        <div className="flex flex-col gap-10 px-4 sm:px-8 max-w-4xl">
          
          {/* How It Works Section */}
          <section>
            <h2 className="text-xl font-bold text-white mb-6" style={{ fontFamily: "'Syne', sans-serif" }}>How It Works</h2>
            <div className="relative">
              {/* Vertical line connecting steps */}
              <div className="hidden md:block absolute left-6 top-6 bottom-6 w-0.5 bg-[#2D2D3F]"></div>
              
              <div className="flex flex-col gap-6">
                {[
                  { icon: MdOutlineUploadFile, title: "Step 1: Upload your resume", color: "text-[#6366F1]", bg: "bg-[#6366F1]/10" },
                  { icon: MdOutlineTextSnippet, title: "Step 2: Paste job description", color: "text-[#22D3EE]", bg: "bg-[#22D3EE]/10" },
                  { icon: MdMemory, title: "Step 3: AI analyzes your profile", color: "text-[#C084FC]", bg: "bg-[#C084FC]/10" },
                  { icon: MdOutlineAutoAwesome, title: "Step 4: Get skill gaps & recommendations", color: "text-[#F59E0B]", bg: "bg-[#F59E0B]/10" },
                  { icon: MdTrendingUp, title: "Step 5: Improve and apply", color: "text-[#10B981]", bg: "bg-[#10B981]/10" }
                ].map((step, idx) => (
                  <div key={idx} className="relative flex items-center gap-4 bg-[#1E1E2E] border border-[#2D2D3F] p-4 rounded-xl shadow-sm hover:border-[#464554] transition-colors z-10 md:ml-12">
                     <div className={`md:absolute md:-left-[58px] w-12 h-12 rounded-full flex items-center justify-center border-4 border-[#131318] ${step.bg}`}>
                        <step.icon className={step.color} size={24} />
                     </div>
                     <h3 className="text-white font-medium">{step.title}</h3>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Privacy First Section */}
          <section className="bg-gradient-to-br from-[#0A0A0F] to-[#131318] border border-[#2D2D3F] rounded-2xl p-6 md:p-8 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-[#10B981] opacity-5 blur-[100px] rounded-full pointer-events-none" />
             <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-[#10B981]/10 flex items-center justify-center">
                  <MdShield className="text-[#10B981]" size={28} />
                </div>
                <h2 className="text-xl font-bold text-white" style={{ fontFamily: "'Syne', sans-serif" }}>Privacy First</h2>
             </div>
             <p className="text-[#94A3B8] mb-4 text-sm leading-relaxed">
               We believe your data belongs to you. Here is our commitment to your privacy:
             </p>
             <ul className="space-y-3">
               {[
                 "Your data is processed locally using AI models (Ollama).",
                 "No resume or job data is sent to external servers.",
                 "Your data stays on your device."
               ].map((item, idx) => (
                 <li key={idx} className="flex items-start gap-3">
                   <div className="mt-1 w-2 h-2 rounded-full bg-[#10B981] shrink-0" />
                   <span className="text-[#e4e1e9] text-sm">{item}</span>
                 </li>
               ))}
             </ul>
          </section>

          {/* Common Questions */}
          <section>
            <h2 className="text-xl font-bold text-white mb-6" style={{ fontFamily: "'Syne', sans-serif" }}>Common Questions</h2>
            <div className="flex flex-col gap-3">
               {faqs.map((faq, idx) => {
                 const isOpen = openFaq === idx;
                 return (
                   <div key={idx} className="bg-[#1E1E2E] border border-[#2D2D3F] rounded-xl overflow-hidden transition-colors hover:border-[#464554]">
                     <button
                       className="w-full text-left px-5 py-4 flex items-center justify-between focus:outline-none"
                       onClick={() => setOpenFaq(isOpen ? null : idx)}
                     >
                       <span className="text-white font-medium text-sm">{faq.q}</span>
                       <MdKeyboardArrowDown 
                         size={20} 
                         className={`text-[#94A3B8] transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                       />
                     </button>
                     <div 
                       className={`px-5 overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-40 pb-4 opacity-100' : 'max-h-0 opacity-0'}`}
                     >
                       <p className="text-[#94A3B8] text-sm leading-relaxed">
                         {faq.a}
                       </p>
                     </div>
                   </div>
                 );
               })}
            </div>
          </section>

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
