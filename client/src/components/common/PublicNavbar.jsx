import { Link } from 'react-router-dom';
import './PublicNavbar.css';

export default function PublicNavbar() {
  return (
    <nav className="public-navbar">
      <div className="public-navbar__inner">
        {/* Brand */}
        <Link to="/" className="public-navbar__brand">
          <span className="public-navbar__brand-text">AI Resume Coach</span>
          <span className="public-navbar__brand-dot" aria-hidden="true">.</span>
        </Link>

        {/* Actions */}
        <div className="public-navbar__actions">
          <Link to="/login" className="btn-ghost">
            Login
          </Link>
          <Link to="/signup" className="btn-filled">
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  );
}
