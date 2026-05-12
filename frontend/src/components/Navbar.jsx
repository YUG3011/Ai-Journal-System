import { useState, useRef, useEffect } from 'react';

// Professional SVG logo mark
function LogoMark({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" rx="10" fill="url(#logo-grad)" />
      <path d="M12 13h10M12 18h16M12 23h13M12 28h8" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
      <circle cx="30" cy="13" r="4" fill="#f59e0b"/>
      <defs>
        <linearGradient id="logo-grad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6366f1"/>
          <stop offset="1" stopColor="#8b5cf6"/>
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function Navbar({ isAuthenticated, accountEmail, onLogout, onSignIn, interactionCount, freeLimit, isFreeLimitExceeded, theme, onThemeToggle, onNavigate }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const remaining = Math.max(freeLimit - interactionCount, 0);

  const getDefaultName = () => accountEmail ? accountEmail.split('@')[0].replace(/\d+/g, '') : '';
  const [displayName, setDisplayName] = useState(localStorage.getItem(`ai_journal_display_name_${accountEmail}`) || getDefaultName());

  useEffect(() => {
    setDisplayName(localStorage.getItem(`ai_journal_display_name_${accountEmail}`) || getDefaultName());
  }, [accountEmail]);

  useEffect(() => {
    const handleUpdate = () => {
      setDisplayName(localStorage.getItem(`ai_journal_display_name_${accountEmail}`) || getDefaultName());
    };
    window.addEventListener('profile-updated', handleUpdate);
    window.addEventListener('avatar-color-updated', handleUpdate);
    return () => {
      window.removeEventListener('profile-updated', handleUpdate);
      window.removeEventListener('avatar-color-updated', handleUpdate);
    };
  }, [accountEmail]);

  const avatarColors = [
    ['#6366f1', '#8b5cf6'],
    ['#06b6d4', '#3b82f6'],
    ['#10b981', '#059669'],
    ['#f59e0b', '#ef4444'],
    ['#ec4899', '#8b5cf6'],
  ];
  const [avatarColorIdx, setAvatarColorIdx] = useState(() => Number(localStorage.getItem(`ai_journal_avatar_color_${accountEmail}`) || 0));

  useEffect(() => {
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    function handleAvatarColorUpdate() {
      const nextIdx = Number(localStorage.getItem(`ai_journal_avatar_color_${accountEmail}`) || 0);
      setAvatarColorIdx(Number.isFinite(nextIdx) ? nextIdx : 0);
    }
    handleAvatarColorUpdate();
    window.addEventListener('storage', handleAvatarColorUpdate);
    window.addEventListener('avatar-color-updated', handleAvatarColorUpdate);
    return () => {
      window.removeEventListener('storage', handleAvatarColorUpdate);
      window.removeEventListener('avatar-color-updated', handleAvatarColorUpdate);
    };
  }, [accountEmail]);

  const [avatarStart, avatarEnd] = avatarColors[avatarColorIdx] || avatarColors[0];

  return (
    <nav className="navbar">
      {/* Brand */}
      <div className="navbar-brand" onClick={() => onNavigate('home')} style={{ cursor: 'pointer' }}>
        <LogoMark size={36} />
        <div>
          <div className="brand-title brand-title-sm">
            R<span className="brand-title-mark">Ξ</span>FLECT <span className="brand-title-ai">AI</span>
          </div>
          <div className="navbar-subtitle">Personal Intelligence Journal</div>
        </div>
      </div>

      {/* Center Status */}
      <div className="navbar-center">
      </div>

      {/* Right Actions */}
      <div className="navbar-actions">
        {!isAuthenticated && (
          <div className={`free-counter ${isFreeLimitExceeded ? 'exhausted' : ''}`}>
            <span className="free-counter-bar" style={{ width: `${(remaining / freeLimit) * 100}%` }}></span>
            <span className="free-counter-label">{remaining}/{freeLimit} free</span>
          </div>
        )}

        <button className="icon-btn" onClick={onThemeToggle} title="Toggle theme" aria-label="Toggle theme">
          {theme === 'dark'
            ? <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
            : <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>
          }
        </button>

        {isAuthenticated ? (
          <div className="account-menu" ref={dropdownRef}>
            <button className="avatar-btn" onClick={() => setDropdownOpen(!dropdownOpen)} aria-expanded={dropdownOpen}>
              <div className="avatar-circle" style={{ background: `linear-gradient(135deg, ${avatarStart}, ${avatarEnd})` }}>
                {displayName ? displayName[0].toUpperCase() : 'U'}
              </div>
              <svg className="avatar-chevron" viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>

            {dropdownOpen && (
              <div className="account-dropdown">
                <div className="dropdown-header">
                  <div className="dropdown-avatar" style={{ background: `linear-gradient(135deg, ${avatarStart}, ${avatarEnd})` }}>
                    {displayName ? displayName[0].toUpperCase() : 'U'}
                  </div>
                  <div>
                    <div className="dropdown-name">{displayName}</div>
                    <div className="dropdown-email">{accountEmail}</div>
                  </div>
                </div>
                <div className="dropdown-divider"></div>

                <button className="dropdown-item" onClick={() => { onNavigate('history'); setDropdownOpen(false); }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  History
                </button>

                <button className="dropdown-item" onClick={() => { onNavigate('profile'); setDropdownOpen(false); }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z"/></svg>
                  Profile
                </button>

                <button className="dropdown-item" onClick={() => { onNavigate('settings'); setDropdownOpen(false); }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
                  Settings
                </button>

                <button className="dropdown-item" onClick={onThemeToggle}>
                  {theme === 'dark'
                    ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2"/></svg>
                    : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>
                  }
                  {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                </button>

                <button className="dropdown-item" onClick={() => { onNavigate('help'); setDropdownOpen(false); }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01"/></svg>
                  Help & FAQ
                </button>

                <div className="dropdown-divider"></div>
                <button className="dropdown-item danger" onClick={() => { onLogout(); setDropdownOpen(false); }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>
                  Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <button className={`signin-btn ${isFreeLimitExceeded ? 'signin-btn-highlight' : ''}`} onClick={onSignIn}>
            Sign In
          </button>
        )}
      </div>
    </nav>
  );
}
