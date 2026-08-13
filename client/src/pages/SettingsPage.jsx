import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { toast } from 'react-hot-toast';
import { updateProfile, updatePassword, deleteAllAnalyses } from '../services/api';
import Navbar from '../components/common/Navbar';

import {
  MdDashboard,
  MdHistory,
  MdMenuBook,
  MdHelpOutline,
  MdSettings,
  MdAdd,
  MdNotifications,
  MdLogout,
  MdVisibility,
  MdVisibilityOff,
  MdLock,
  MdShield,
  MdCheckCircle,
} from 'react-icons/md';

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
export default function SettingsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();

  /* ── Profile state ─────────────────────────────────────── */
  const [name, setName] = useState(user?.name || '');
  const [profileLoading, setProfileLoading] = useState(false);

  /* ── Password state ────────────────────────────────────── */
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  /* ── Theme state ───────────────────────────────────────── */
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    localStorage.setItem('theme', theme);
    if (theme === 'light') {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    }
  }, [theme]);

  /* ── Handlers ──────────────────────────────────────────── */
  const handleUpdateProfile = async () => {
    if (name.trim() === '') {
      toast.error('Name cannot be empty');
      return;
    }
    setProfileLoading(true);
    try {
      const res = await updateProfile({ name });
      useAuthStore.getState().setAuth(useAuthStore.getState().token, {
        ...user,
        name: res.data.data.name,
      });
      toast.success('Profile updated successfully');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Please fill all password fields');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    setPasswordLoading(true);
    try {
      await updatePassword({ currentPassword, newPassword });
      toast.success('Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.error(
        err?.response?.data?.error?.message || 'Current password is incorrect'
      );
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleDeleteAll = async () => {
    const confirmed = window.confirm(
      'Are you sure? This will permanently delete all your analysis history. This cannot be undone.'
    );
    if (!confirmed) return;
    try {
      await deleteAllAnalyses();
      toast.success('All analyses deleted');
    } catch {
      toast.error('Failed to delete analyses');
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  /* ── Nav config ────────────────────────────────────────── */
  const sideLinks = [
    { Icon: MdDashboard, label: 'Dashboard', to: '/home' },
    { Icon: MdHistory, label: 'History', to: '/history' },
    { Icon: MdMenuBook, label: 'Resources', to: '/resources' },
    { Icon: MdHelpOutline, label: 'Support', to: '/support' },
  ];

  /* ── Render ────────────────────────────────────────────── */
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
            className="flex items-center gap-3 px-4 py-[11px] rounded-lg text-sm bg-[#1f1f25] text-white font-bold transition-all"
          >
            <MdSettings size={20} className="text-[#c0c1ff]" />
            Settings
          </Link>
        </div>
      </aside>

      {/* ─── MAIN CONTENT ───────────────────────────────────── */}
      <main className="lg:ml-[220px] max-w-5xl lg:max-w-none mx-auto">
        {/* Page Header */}
        <header className="px-4 sm:px-8 pt-8 pb-6">
          <h1
            className="text-[28px] font-bold text-white leading-none"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            Settings
          </h1>
          <p className="text-[#94A3B8] mt-2 text-sm">
            Manage your account and preferences
          </p>
        </header>

        <div className="flex flex-col gap-6 px-4 sm:px-8 pb-8 max-w-5xl">

          {/* ══ SECTION 1: Account ══════════════════════════════ */}
          <section className="bg-[#1E1E2E] border border-[#2D2D3F] rounded-2xl p-8 shadow-sm">
            <div className="mb-4">
              <h2
                className="text-lg font-bold text-white"
                style={{ fontFamily: "'Syne', sans-serif" }}
              >
                Account
              </h2>
              <p className="text-[#94A3B8] text-sm mt-1">
                Update your personal information
              </p>
            </div>

            <div className="h-px bg-[#2D2D3F] w-full mt-4 mb-6" />

            {/* Name + Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-white text-sm block font-medium">
                  Display name
                </label>
                <input
                  id="settings-display-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-[#13131A] border border-[#2D2D3F] text-white rounded-lg px-4 py-3 w-full focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1] transition-all outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-white text-sm block font-medium">
                  Email address
                </label>
                <div className="relative">
                  <input
                    id="settings-email"
                    type="email"
                    value={user?.email || ''}
                    readOnly
                    disabled
                    className="bg-[#13131A] border border-[#2D2D3F] text-white rounded-lg px-4 py-3 w-full opacity-50 cursor-not-allowed outline-none"
                  />
                  <MdLock className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 text-lg" size={18} />
                </div>
                <p
                  className="text-[#94A3B8] text-[10px] uppercase tracking-wider"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  Email cannot be changed
                </p>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                id="settings-update-profile-btn"
                onClick={handleUpdateProfile}
                disabled={profileLoading}
                className="bg-[#6366F1] text-white px-6 py-2.5 rounded-lg font-medium text-sm hover:brightness-110 active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {profileLoading ? 'Saving…' : 'Update Profile'}
              </button>
            </div>

            <div className="h-px bg-[#2D2D3F] w-full my-6" />

            {/* ── Change Password ──────────────────────────────── */}
            <div>
              <h3 className="text-white font-semibold text-[15px]">
                Change Password
              </h3>
              <p className="text-[#94A3B8] text-xs mt-1 mb-4">
                Leave blank to keep current password
              </p>

              <div className="flex flex-col gap-4 max-w-md">
                {/* Current password */}
                <div className="space-y-1.5">
                  <label className="text-[#94A3B8] text-xs font-medium">
                    Current password
                  </label>
                  <div className="relative">
                    <input
                      id="settings-current-password"
                      type={showPasswords.current ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      className="bg-[#13131A] border border-[#2D2D3F] text-white rounded-lg px-4 py-3 w-full focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1] transition-all outline-none pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('current')}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                      aria-label="Toggle current password visibility"
                    >
                      {showPasswords.current ? (
                        <MdVisibilityOff size={20} />
                      ) : (
                        <MdVisibility size={20} />
                      )}
                    </button>
                  </div>
                </div>

                {/* New password */}
                <div className="space-y-1.5">
                  <label className="text-[#94A3B8] text-xs font-medium">
                    New password
                  </label>
                  <div className="relative">
                    <input
                      id="settings-new-password"
                      type={showPasswords.new ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="bg-[#13131A] border border-[#2D2D3F] text-white rounded-lg px-4 py-3 w-full focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1] transition-all outline-none pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('new')}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                      aria-label="Toggle new password visibility"
                    >
                      {showPasswords.new ? (
                        <MdVisibilityOff size={20} />
                      ) : (
                        <MdVisibility size={20} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirm password */}
                <div className="space-y-1.5">
                  <label className="text-[#94A3B8] text-xs font-medium">
                    Confirm new password
                  </label>
                  <div className="relative">
                    <input
                      id="settings-confirm-password"
                      type={showPasswords.confirm ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="bg-[#13131A] border border-[#2D2D3F] text-white rounded-lg px-4 py-3 w-full focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1] transition-all outline-none pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('confirm')}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                      aria-label="Toggle confirm password visibility"
                    >
                      {showPasswords.confirm ? (
                        <MdVisibilityOff size={20} />
                      ) : (
                        <MdVisibility size={20} />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                id="settings-update-password-btn"
                onClick={handleUpdatePassword}
                disabled={passwordLoading}
                className="bg-[#6366F1] text-white px-6 py-2.5 rounded-lg font-medium text-sm hover:brightness-110 active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {passwordLoading ? 'Saving…' : 'Update Password'}
              </button>
            </div>

            <div className="h-px bg-[#2D2D3F] w-full my-6" />

            {/* ── Danger Zone ─────────────────────────────────── */}
            <div>
              <label
                className="text-[#F43F5E] text-xs block mb-3 font-bold uppercase tracking-[0.2em]"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                Danger Zone
              </label>
              <div className="flex flex-col items-start gap-3">
                <button
                  id="settings-delete-analyses-btn"
                  onClick={handleDeleteAll}
                  className="border border-[#F43F5E] text-[#F43F5E] px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-[#F43F5E] hover:text-white transition-all active:scale-95"
                >
                  Delete all analyses
                </button>
                <p className="text-[#94A3B8] text-xs italic">
                  Permanently deletes all your resume analysis history. This cannot be undone.
                </p>
              </div>
            </div>
          </section>

          {/* ══ SECTION 2: Appearance ═══════════════════════════ */}
          <section className="bg-[#1E1E2E] border border-[#2D2D3F] rounded-2xl p-8 shadow-sm">
            <div className="mb-4">
              <h2
                className="text-lg font-bold text-white"
                style={{ fontFamily: "'Syne', sans-serif" }}
              >
                Appearance
              </h2>
              <p className="text-[#94A3B8] text-sm mt-1">
                Choose how AI Resume Coach looks for you
              </p>
            </div>

            <div className="h-px bg-[#2D2D3F] w-full mt-4 mb-6" />

            <div className="space-y-4">
              <p className="text-white text-sm font-medium">Theme</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Dark Theme Card */}
                <div
                  id="settings-theme-dark"
                  onClick={() => setTheme('dark')}
                  className={`relative rounded-xl p-4 bg-[#0A0A0F] cursor-pointer transition-all ${theme === 'dark'
                      ? 'border-2 border-[#6366F1]'
                      : 'border border-[#2D2D3F] hover:border-[#464554]'
                    }`}
                >
                  {theme === 'dark' && (
                    <div className="absolute top-2 right-2 text-[#6366F1]">
                      <MdCheckCircle size={22} />
                    </div>
                  )}
                  <div className="aspect-video bg-[#1E1E2E] rounded-lg p-3 flex flex-col gap-2 overflow-hidden shadow-inner">
                    <div className="w-1/2 h-2 bg-[#2D2D3F] rounded" />
                    <div className="w-full h-8 bg-[#131318] rounded flex items-center px-2 gap-2">
                      <div className="w-4 h-4 rounded-full bg-[#6366F1]/20" />
                      <div className="flex-1 h-1.5 bg-[#2D2D3F] rounded" />
                    </div>
                    <div className="w-full grid grid-cols-3 gap-1.5 mt-1">
                      <div className="h-10 bg-[#2D2D3F] rounded-sm" />
                      <div className="h-10 bg-[#2D2D3F] rounded-sm" />
                      <div className="h-10 bg-[#2D2D3F] rounded-sm" />
                    </div>
                  </div>
                  <p className="text-white text-sm font-medium text-center mt-3">Dark</p>
                </div>

                {/* Light Theme Card */}
                <div
                  id="settings-theme-light"
                  onClick={() => setTheme('light')}
                  className={`rounded-xl p-4 bg-[#F8FAFC] cursor-pointer transition-all ${theme === 'light'
                      ? 'border-2 border-[#6366F1]'
                      : 'border border-[#2D2D3F] hover:bg-white'
                    }`}
                >
                  {theme === 'light' && (
                    <div className="absolute top-2 right-2 text-[#6366F1]">
                      <MdCheckCircle size={22} />
                    </div>
                  )}
                  <div className="aspect-video bg-white rounded-lg p-3 flex flex-col gap-2 overflow-hidden shadow-inner border border-slate-100">
                    <div className="w-1/2 h-2 bg-slate-100 rounded" />
                    <div className="w-full h-8 bg-slate-50 rounded flex items-center px-2 gap-2 border border-slate-100">
                      <div className="w-4 h-4 rounded-full bg-indigo-50" />
                      <div className="flex-1 h-1.5 bg-slate-200 rounded" />
                    </div>
                    <div className="w-full grid grid-cols-3 gap-1.5 mt-1">
                      <div className="h-10 bg-slate-100 rounded-sm" />
                      <div className="h-10 bg-slate-100 rounded-sm" />
                      <div className="h-10 bg-slate-100 rounded-sm" />
                    </div>
                  </div>
                  <p className="text-[#1E1E2E] text-sm font-medium text-center mt-3">Light</p>
                </div>
              </div>

              <p className="text-[#94A3B8] text-xs">
                Theme preference is saved automatically
              </p>
            </div>
          </section>

          {/* ══ SECTION 3: About ════════════════════════════════ */}
          <section className="bg-[#1E1E2E] border border-[#2D2D3F] rounded-2xl p-8 shadow-sm">
            <h2
              className="text-lg font-bold text-white mb-4"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              About
            </h2>

            <div className="h-px bg-[#2D2D3F] w-full mt-4 mb-2" />

            <div className="divide-y divide-[#2D2D3F]">
              <div className="flex justify-between py-4 items-center">
                <span className="text-[#94A3B8] text-sm">Version</span>
                <span
                  className="text-white text-sm"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  v1.0.0
                </span>
              </div>
              <div className="flex justify-between py-4 items-center">
                <span className="text-[#94A3B8] text-sm">AI Engine</span>
                <span className="text-[#6366F1] text-sm font-medium">
                  Mistral via Ollama
                </span>
              </div>
              <div className="flex justify-between py-4 items-center">
                <span className="text-[#94A3B8] text-sm">Data storage</span>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#84CC16]" />
                  <span className="text-[#84CC16] text-sm font-medium">
                    Local · Your data never leaves this device
                  </span>
                </div>
              </div>
            </div>

            {/* Privacy card */}
            <div className="bg-[#0A0A0F] border border-[#2D2D3F] rounded-xl p-5 mt-6 relative overflow-hidden">
              <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-[#6366F1] opacity-5 blur-3xl rounded-full" />
              <div className="relative z-10">
                <h4 className="text-white text-sm font-bold flex items-center gap-2">
                  <MdShield className="text-indigo-400" size={20} />
                  Built for developers who value privacy
                </h4>
                <p className="text-[#94A3B8] text-xs leading-relaxed mt-2 max-w-2xl">
                  AI Resume Coach runs entirely on your machine. No data is sent to any
                  server. Your resume, job descriptions, and your analysis results are
                  stored locally using indexedDB and local file system access.
                </p>
              </div>
            </div>
          </section>

        </div>
      </main>

      {/* ─── FOOTER ─────────────────────────────────────────── */}
      <footer className="lg:ml-[220px] py-12 px-8 text-center">
        <p
          className="text-[#464554] text-xs uppercase tracking-widest"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          AI Resume Coach
        </p>
      </footer>
    </div>
  );
}
