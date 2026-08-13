import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiLogOut, FiZap, FiMenu, FiX } from 'react-icons/fi';
import { useAuthStore } from '../../store/authStore';
import './Navbar.css';

function getInitials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
}

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = getInitials(user?.name);

  return (
    <nav className="navbar">
      <div className="navbar__inner">
        {/* Brand */}
        <Link to="/home" className="navbar__brand">
          <span className="navbar__brand-text">AI Resume Coach</span>
          <span className="navbar__brand-dot" aria-hidden="true">.</span>
        </Link>

        {/* Right side */}
        <div className="navbar__right hidden md:flex">
          {/* Dashboard — hide when already on dashboard */}
          {path !== '/home' && (
            <Link to="/home" className="navbar__link font-medium hover:text-[#22D3EE] transition-colors" style={{ marginRight: '1rem' }}>
              Dashboard
            </Link>
          )}

          {/* History — hide when already on history */}
          {path !== '/history' && (
            <Link to="/history" className="navbar__link font-medium hover:text-[#22D3EE] transition-colors" style={{ marginRight: '1rem' }}>
              History
            </Link>
          )}

          {/* Analysis — hide when already on analysis */}
          {path !== '/analyze' && (
            <Link to="/analyze" className="navbar__link font-medium hover:text-[#22D3EE] transition-colors" style={{ marginRight: '1rem' }}>
              Analysis
            </Link>
          )}

          {/* New Analysis CTA */}
          <Link to="/analyze" className="navbar__cta">
            <FiZap className="navbar__cta-icon" />
            <span>New Analysis</span>
          </Link>

          {/* User info */}
          <div className="navbar__user">
            <div className="navbar__avatar" title={user?.name}>
              {initials || '?'}
            </div>
            <span className="navbar__username">{user?.name ?? 'User'}</span>
          </div>

          {/* Logout */}
          <button
            className="navbar__logout"
            onClick={handleLogout}
            title="Logout"
            aria-label="Log out"
          >
            <FiLogOut />
          </button>
        </div>

        {/* Mobile Toggle Button */}
        <div className="md:hidden flex items-center gap-4">
          <div className="navbar__avatar w-8 h-8 text-xs" title={user?.name}>
            {initials || '?'}
          </div>
          <button 
            className="text-white p-1"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden flex flex-col bg-[#0A0A0F] border-t border-[#2D2D3F] px-4 py-4 gap-4 shadow-xl absolute top-[64px] left-0 w-full z-40">
          {path !== '/home' && (
            <Link to="/home" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-300 font-medium hover:text-white px-2 py-1">
              Dashboard
            </Link>
          )}
          {path !== '/history' && (
            <Link to="/history" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-300 font-medium hover:text-white px-2 py-1">
              History
            </Link>
          )}
          {path !== '/analyze' && (
            <Link to="/analyze" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-300 font-medium hover:text-white px-2 py-1">
              Analysis
            </Link>
          )}
          <Link to="/analyze" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2 text-[#22D3EE] font-medium px-2 py-1">
            <FiZap /> New Analysis
          </Link>
          <div className="w-full h-px bg-white/10 my-1"></div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-red-400 font-medium px-2 py-1"
          >
            <FiLogOut /> Logout
          </button>
        </div>
      )}
    </nav>
  );
}
