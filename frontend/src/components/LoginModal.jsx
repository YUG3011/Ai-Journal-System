import { useState } from 'react';

export default function LoginModal({ open, onClose, onLogin, onSocial, error }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    onLogin({ email, password, mode });
    setPassword('');
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <h3 className="section-title" style={{ marginBottom: '10px' }}>
          {mode === 'login' ? 'Sign in to continue' : 'Create your account'}
        </h3>
        <p className="analysis-stat" style={{ marginBottom: '14px' }}>
          You’ve used your 5 free interactions. {mode === 'login' ? 'Sign in' : 'Register'} to save and analyze more sessions.
        </p>
        {error && (
          <div className="error" style={{ marginTop: 0 }}>
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="form" style={{ gap: '10px' }}>
          <div>
            <div className="label">Email</div>
            <input
              className="input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
          </div>
          <div>
            <div className="label">Password</div>
            <input
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </div>
          <div className="actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">{mode === 'login' ? 'Sign in' : 'Register'}</button>
          </div>
        </form>
        <div style={{marginTop:12, display:'flex', gap:8, alignItems:'center'}}>
          <button className="btn btn-ghost" style={{flex:1}} onClick={() => onSocial('google')}>Continue with Google</button>
          <button className="btn btn-ghost" style={{flex:1}} onClick={() => onSocial('github')}>Continue with GitHub</button>
        </div>
        <div style={{marginTop:12, textAlign:'center', color:'var(--muted)'}}>
          {mode === 'login' ? 'No account yet?' : 'Already have an account?'}{' '}
          <button type="button" className="btn btn-ghost" style={{padding:'6px 10px'}} onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
            {mode === 'login' ? 'Create one' : 'Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
}
