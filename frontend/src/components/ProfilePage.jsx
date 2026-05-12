import { useState } from 'react';

export default function ProfilePage({ accountEmail, onBack, onNavigate }) {
  const username = accountEmail ? accountEmail.split('@')[0].replace(/\d+/g, '') : '';
  const [displayName, setDisplayName] = useState(localStorage.getItem('ai_journal_display_name') || username);
  const initial = displayName ? displayName[0].toUpperCase() : 'U';
  const [bio, setBio] = useState(localStorage.getItem('ai_journal_bio') || '');
  const [saved, setSaved] = useState(false);

  const avatarColors = [
    ['#6366f1', '#8b5cf6'],
    ['#06b6d4', '#3b82f6'],
    ['#10b981', '#059669'],
    ['#f59e0b', '#ef4444'],
    ['#ec4899', '#8b5cf6'],
  ];
  const savedColorIdx = Number(localStorage.getItem('ai_journal_avatar_color') || 0);
  const [colorIdx, setColorIdx] = useState(savedColorIdx);

  const handleSave = () => {
    localStorage.setItem('ai_journal_bio', bio);
    localStorage.setItem('ai_journal_display_name', displayName);
    localStorage.setItem('ai_journal_avatar_color', colorIdx);
    window.dispatchEvent(new Event('profile-updated'));
    window.dispatchEvent(new Event('avatar-color-updated'));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const [c1, c2] = avatarColors[colorIdx];

  return (
    <div className="app-shell">
      {/* Back header */}
      <div className="page-header">
        <button className="btn btn-ghost" onClick={onBack}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Back
        </button>
        <div>
          <h1 className="page-title">Profile</h1>
          <p className="page-subtitle">Manage your personal information</p>
        </div>
      </div>

      <div className="account-layout">
        {/* Avatar Card */}
        <div className="card account-card-left">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 88, height: 88, borderRadius: '50%',
              background: `linear-gradient(135deg, ${c1}, ${c2})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 34, fontWeight: 800, color: '#fff',
              boxShadow: `0 0 30px ${c1}50`
            }}>{initial}</div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 700, fontSize: 16 }}>{displayName || username}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 2 }}>{accountEmail}</div>
            </div>

            {/* Color picker */}
            <div style={{ width: '100%' }}>
              <div className="settings-label">Avatar Color</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginTop: 8 }}>
                {avatarColors.map(([a, b], i) => (
                  <button key={i} onClick={() => setColorIdx(i)} style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: `linear-gradient(135deg, ${a}, ${b})`,
                    border: colorIdx === i ? '2px solid var(--text)' : '2px solid transparent',
                    cursor: 'pointer', transition: 'transform 0.15s',
                    transform: colorIdx === i ? 'scale(1.2)' : 'scale(1)'
                  }} />
                ))}
              </div>
            </div>

            <div className="account-stat-row">
              <div className="account-stat">
                <div className="account-stat-val">—</div>
                <div className="account-stat-label">Entries</div>
              </div>
              <div className="account-stat">
                <div className="account-stat-val">—</div>
                <div className="account-stat-label">Streak</div>
              </div>
              <div className="account-stat">
                <div className="account-stat-val">—</div>
                <div className="account-stat-label">Days</div>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Card */}
        <div className="card account-card-right">
          <div className="settings-section-title">Personal Info</div>

          <div className="settings-field">
            <label className="settings-label">Display Name</label>
            <input
              className="settings-input"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              placeholder="Your name"
              maxLength={40}
            />
          </div>

          <div className="settings-field">
            <label className="settings-label">Email</label>
            <input className="settings-input" value={accountEmail} disabled style={{ opacity: 0.5, cursor: 'not-allowed' }} />
            <span className="settings-hint">Email cannot be changed here</span>
          </div>

          <div className="settings-field">
            <label className="settings-label">Bio</label>
            <textarea
              className="settings-input"
              value={bio}
              onChange={e => setBio(e.target.value)}
              placeholder="Tell us a little about yourself..."
              rows={3}
              maxLength={200}
              style={{ resize: 'vertical' }}
            />
            <span className="settings-hint">{bio.length}/200 characters</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
            <button className="btn btn-primary" onClick={handleSave}>Save Changes</button>
            {saved && <span style={{ color: 'var(--green)', fontSize: 13, fontWeight: 600 }}>✓ Saved!</span>}
          </div>

          <div className="settings-divider" />

          <div className="settings-section-title">Danger Zone</div>
          <div className="danger-zone-box">
            <div>
              <div style={{ fontWeight: 600, fontSize: 13 }}>Delete Account</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Permanently remove your account and all data. This cannot be undone.</div>
            </div>
            <button className="btn btn-danger" disabled title="Coming soon">Delete Account</button>
          </div>
        </div>
      </div>
    </div>
  );
}
