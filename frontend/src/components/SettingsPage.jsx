import { useState } from 'react';

function Toggle({ value, onChange, label, description }) {
  return (
    <div className="settings-toggle-row">
      <div>
        <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text)' }}>{label}</div>
        {description && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{description}</div>}
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`toggle-switch ${value ? 'toggle-on' : ''}`}
        aria-pressed={value}
      >
        <span className="toggle-thumb" />
      </button>
    </div>
  );
}

export default function SettingsPage({ theme, onThemeToggle, onBack, onLogout }) {
  const isDark = theme === 'dark';
  const [notifications, setNotifications] = useState(
    localStorage.getItem('ai_journal_notifs') !== 'false'
  );
  const [autoAnalyze, setAutoAnalyze] = useState(
    localStorage.getItem('ai_journal_auto_analyze') === 'true'
  );
  const [compactMode, setCompactMode] = useState(
    localStorage.getItem('ai_journal_compact') === 'true'
  );
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    localStorage.setItem('ai_journal_notifs', notifications);
    localStorage.setItem('ai_journal_auto_analyze', autoAnalyze);
    localStorage.setItem('ai_journal_compact', compactMode);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleExport = () => {
    const data = {
      exportedAt: new Date().toISOString(),
      settings: { theme, notifications, autoAnalyze, compactMode }
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'reflectai-settings.json'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="app-shell">
      <div className="page-header">
        <button className="btn btn-ghost" onClick={onBack}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Back
        </button>
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Customize your RΞflectAI experience</p>
        </div>
      </div>

      <div className="settings-grid">
        {/* Appearance */}
        <div className="card">
          <div className="settings-section-title">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
            Appearance
          </div>

          <Toggle
            value={isDark}
            onChange={onThemeToggle}
            label="Dark Mode"
            description="Use dark background across the app"
          />

          <Toggle
            value={compactMode}
            onChange={setCompactMode}
            label="Compact Mode"
            description="Show more content with reduced spacing"
          />
        </div>

        {/* Journal Preferences */}
        <div className="card">
          <div className="settings-section-title">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            Journal Preferences
          </div>

          <Toggle
            value={autoAnalyze}
            onChange={setAutoAnalyze}
            label="Auto-Analyze on Save"
            description="Automatically run emotion analysis when you save an entry"
          />

          <Toggle
            value={notifications}
            onChange={setNotifications}
            label="Daily Reminders"
            description="Get reminded to journal every day"
          />
        </div>

        {/* Data & Privacy */}
        <div className="card">
          <div className="settings-section-title">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
            Data & Privacy
          </div>

          <div className="settings-row">
            <div>
              <div style={{ fontWeight: 600, fontSize: 13 }}>Export Settings</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Download your preferences as JSON</div>
            </div>
            <button className="btn btn-ghost" onClick={handleExport} style={{ fontSize: 12 }}>Export</button>
          </div>

          <div className="settings-row" style={{ marginTop: 12 }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 13 }}>Clear Local Cache</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Remove cached data stored in browser</div>
            </div>
            <button className="btn btn-ghost" style={{ fontSize: 12 }} onClick={() => {
              const keep = ['ai_journal_token', 'ai_journal_auth', 'ai_journal_theme'];
              Object.keys(localStorage).forEach(k => { if (!keep.includes(k) && k.startsWith('ai_journal')) localStorage.removeItem(k); });
              alert('Cache cleared.');
            }}>Clear</button>
          </div>
        </div>

        {/* Account */}
        <div className="card">
          <div className="settings-section-title">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z"/></svg>
            Account
          </div>

          <div className="settings-row">
            <div>
              <div style={{ fontWeight: 600, fontSize: 13 }}>Sign Out</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Log out from this device</div>
            </div>
            <button className="btn btn-ghost" style={{ fontSize: 12, color: 'var(--red)', borderColor: 'rgba(239,68,68,0.3)' }} onClick={onLogout}>Sign Out</button>
          </div>
        </div>
      </div>

      {/* Save button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 24 }}>
        <button className="btn btn-primary" onClick={handleSave}>Save Preferences</button>
        {saved && <span style={{ color: 'var(--green)', fontSize: 13, fontWeight: 600 }}>✓ Preferences saved!</span>}
      </div>
    </div>
  );
}
