import { useState } from 'react';

export default function LoginPage({ onLogin, onTryFree, onSocial, error, isLoading }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showFreeTrialForm, setShowFreeTrialForm] = useState(false);
  const [freeName, setFreeName] = useState('');
  const [freeAge, setFreeAge] = useState('');

  // Detect if error is a network/backend connectivity issue
  const isNetworkError = error && (
    error.toLowerCase().includes('network') ||
    error.toLowerCase().includes('connection') ||
    error.toLowerCase().includes('econnrefused') ||
    error.toLowerCase().includes('failed to fetch') ||
    error.toLowerCase().includes('err_connection_refused')
  );
  const displayError = isNetworkError
    ? '⚠️ Cannot reach the server. Make sure the backend is running on port 4000.'
    : error;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    onLogin({ email, password, mode });
  };

  const handleFreeTrialSubmit = (e) => {
    e.preventDefault();
    if (!freeName.trim() || !freeAge.trim()) return;
    const ageValue = Number(freeAge);
    if (!Number.isFinite(ageValue) || ageValue <= 0) return;
    onTryFree({ name: freeName.trim(), age: ageValue });
  };

  return (
    <div className="login-page" style={{ alignItems: 'flex-start', paddingTop: '40px', paddingBottom: '40px' }}>
      <div className="login-container">
        {/* Left Side - Branding */}
        <div className="login-left">
          <div className="login-logo-section">
            <svg width="56" height="56" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="40" height="40" rx="10" fill="url(#lp-grad)" />
              <path d="M12 13h10M12 18h16M12 23h13M12 28h8" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
              <circle cx="30" cy="13" r="4" fill="#f59e0b"/>
              <defs>
                <linearGradient id="lp-grad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#6366f1"/><stop offset="1" stopColor="#8b5cf6"/>
                </linearGradient>
              </defs>
            </svg>
            <h1 className="brand-title brand-title-lg">
              R<span className="brand-title-mark">Ξ</span>FLECT <span className="brand-title-ai">AI</span>
            </h1>
            <p className="login-brand-subtitle">Your intelligent journaling companion — analyze emotions, track patterns, and grow with every entry.</p>
          </div>
          
          <div className="login-features">
            <div className="feature-item">
              <div className="feature-icon">✨</div>
              <div>
                <h4>AI-Powered Insights</h4>
                <p>Understand emotional patterns using advanced AI</p>
              </div>
            </div>
            <div className="feature-item">
              <div className="feature-icon">📊</div>
              <div>
                <h4>Track Progress</h4>
                <p>Monitor your mental wellness over time</p>
              </div>
            </div>
            <div className="feature-item">
              <div className="feature-icon">🔒</div>
              <div>
                <h4>Private & Secure</h4>
                <p>Your data is encrypted and belongs to you</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="login-right">
          <div className="login-form-wrapper" style={{ maxHeight: 'calc(100vh - 80px)', overflowY: 'auto', scrollbarWidth: 'none' }}>
            <div className="login-header">
              <h2 className="login-title">
                {showFreeTrialForm
                  ? 'Temporary Trial Access'
                  : mode === 'login'
                    ? 'Welcome Back'
                    : 'Create Account'}
              </h2>
              <p className="login-description">
                {showFreeTrialForm
                  ? 'This trial is temporary and includes 5 free interactions.'
                  : mode === 'login'
                    ? 'Sign in to your account to continue'
                    : 'Join our community of mindful journalers'}
              </p>
            </div>

            {displayError && (
              <div className="login-error-alert" style={isNetworkError ? { background: 'rgba(245,158,11,0.08)', borderColor: 'rgba(245,158,11,0.3)', color: '#f59e0b' } : {}}>
                <span className="error-icon">{isNetworkError ? '🔌' : '⚠️'}</span>
                <span>{displayError}</span>
              </div>
            )}

            {/* Divider */}
            <div className="login-divider">
              <span>{showFreeTrialForm ? 'Free trial details' : 'Or continue with email'}</span>
            </div>

            {showFreeTrialForm ? (
              <form className="login-free-form" onSubmit={handleFreeTrialSubmit}>
                <div className="form-group">
                  <label htmlFor="free-name" className="form-label">Name</label>
                  <input
                    id="free-name"
                    type="text"
                    className="form-input"
                    value={freeName}
                    onChange={(e) => setFreeName(e.target.value)}
                    placeholder="Your name"
                    autoComplete="name"
                    disabled={isLoading}
                  />
                </div>

                <div className="form-group age-container">
                  <label htmlFor="free-age" className="form-label">Age</label>
                  <input
                    id="free-age"
                    type="number"
                    className="form-input"
                    value={freeAge}
                    onChange={(e) => setFreeAge(e.target.value)}
                    placeholder="Your age"
                    min="1"
                    max="120"
                  />
                </div>

                <button type="submit" className="btn-primary-large" disabled={isLoading}>
                  Start Free Trial
                </button>
              </form>
            ) : (
              <form onSubmit={handleSubmit} className="login-form">
                <div className="form-group">
                  <label htmlFor="email" className="form-label">Email Address</label>
                  <input
                    id="email"
                    type="email"
                    className="form-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    required
                    autoComplete="email"
                    disabled={isLoading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="password" className="form-label">Password</label>
                  <input
                    id="password"
                    type="password"
                    className="form-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    disabled={isLoading}
                  />
                </div>

                <button type="submit" className="btn-primary-large" disabled={isLoading}>
                  {isLoading ? 'Loading...' : mode === 'login' ? 'Sign In' : 'Create Account'}
                </button>
              </form>
            )}

            {showFreeTrialForm ? (
              <div className="login-free-trial">
                <button
                  type="button"
                  className="btn-secondary-large"
                  onClick={() => setShowFreeTrialForm(false)}
                  disabled={isLoading}
                >
                  Back to Sign In
                </button>
              </div>
            ) : (
              <>
                {/* Mode Toggle */}
                <div className="login-mode-toggle">
                  <span className="toggle-text">
                    {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                  </span>
                  <button
                    type="button"
                    className="toggle-link"
                    onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                  >
                    {mode === 'login' ? 'Sign up' : 'Sign in'}
                  </button>
                </div>

                {/* Social Login */}
                <div className="login-social-section">
                  <button
                    type="button"
                    className="login-social-btn google"
                    onClick={() => onSocial('google')}
                    disabled={isLoading}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                      <defs>
                        <clipPath id="google-g-clip">
                          <path d="M12 2c5.52 0 10 4.48 10 10s-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2Z" />
                        </clipPath>
                      </defs>
                      <g clipPath="url(#google-g-clip)">
                        <path fill="#EA4335" d="M12 4.5c2.1 0 3.86.86 5.16 2.03l2.5-2.5C17.78 2.2 15.13 1.2 12 1.2 7.7 1.2 3.95 3.63 2.15 7.15l3 2.33C6.3 6.44 8.97 4.5 12 4.5Z"/>
                        <path fill="#FBBC05" d="M2.15 7.15C1.42 8.6 1 10.24 1 12c0 1.76.42 3.4 1.15 4.85l3-2.33A6.9 6.9 0 0 1 4.8 12c0-.92.19-1.8.35-2.52l-3-2.33Z"/>
                        <path fill="#34A853" d="M12 22.8c3.02 0 5.54-.99 7.38-2.7l-2.86-2.2c-.8.55-1.96 1.18-4.52 1.18-3.01 0-5.59-1.97-6.5-4.72l-3 2.33C3.95 20.37 7.7 22.8 12 22.8Z"/>
                        <path fill="#4285F4" d="M23 12c0-.94-.15-1.83-.38-2.68H12v4.54h6.54c-.35 1.68-1.43 3.11-3.04 4.04l2.86 2.2C20.85 18.3 23 15.6 23 12Z"/>
                      </g>
                    </svg>
                    <span>Continue with Google</span>
                  </button>
                  <button
                    type="button"
                    className="login-social-btn github"
                    onClick={() => onSocial('github')}
                    disabled={isLoading}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v 3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                    Continue with GitHub
                  </button>
                </div>

                <div className="login-free-trial">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '4px 0 8px', opacity: 0.45 }}>
                    <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
                    <span className="try-without-account-text" style={{ fontSize: '11px', whiteSpace: 'nowrap', color: '#ffffff', opacity: 1, fontWeight: 'bold' }}>or try without an account</span>
                    <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
                  </div>
                  <button
                    type="button"
                    className="btn-secondary-large"
                    onClick={() => setShowFreeTrialForm(true)}
                    disabled={isLoading}
                    style={{ marginBottom: 0 }}
                  >
                     Try Free — 5 Interactions
                  </button>
                  <p className="free-trial-note" style={{ marginTop: '6px' }}>No account needed · Limited to 5 AI interactions</p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
