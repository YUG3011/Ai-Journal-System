export default function HistoryPage({ entries, onBack, onDelete, userId }) {
  const ambienceEmoji = { forest: '🌲', ocean: '🌊', mountain: '⛰️' };
  const emotionColor = (e) => {
    const map = { happy: '#10b981', sad: '#6366f1', angry: '#ef4444', anxious: '#f59e0b', neutral: '#94a3b8', calm: '#06b6d4' };
    return map[(e || '').toLowerCase()] || 'var(--primary-light)';
  };

  return (
    <div className="app-shell">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
        <button className="btn btn-ghost" onClick={onBack} style={{ padding: '8px 12px' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Back
        </button>
        <div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 24, fontWeight: 800, margin: 0 }}>
            Journal History
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: 0 }}>
            {entries.length} {entries.length === 1 ? 'entry' : 'entries'} saved
          </p>
        </div>
      </div>

      {/* Empty state */}
      {!entries.length && (
        <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>📭</div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, marginBottom: 8 }}>No History Yet</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Start journaling to build your history.</p>
          <button className="btn btn-primary" style={{ marginTop: 20 }} onClick={onBack}>Write First Entry</button>
        </div>
      )}

      {/* Timeline */}
      {entries.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {entries.map((entry, idx) => {
            const date = new Date(entry.createdAt);
            const dateStr = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
            const timeStr = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
            const color = emotionColor(entry.emotion);

            return (
              <div key={entry.id} className="history-card card" style={{ borderLeft: `3px solid ${color}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: `${color}1a`, border: `1px solid ${color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                      {ambienceEmoji[entry.ambience] || '📔'}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text)' }}>{dateStr}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-faint)' }}>{timeStr} · {entry.ambience}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {entry.emotion && (
                      <span style={{ padding: '4px 12px', borderRadius: 999, fontSize: 11, fontWeight: 700, background: `${color}18`, color, border: `1px solid ${color}33` }}>
                        {entry.emotion}
                      </span>
                    )}
                    {onDelete && entry.userId === userId && (
                      <button
                        className="btn btn-ghost"
                        style={{ padding: '4px 10px', fontSize: 11, color: 'var(--red)', borderColor: 'rgba(239,68,68,0.25)' }}
                        onClick={() => { if (confirm('Delete this entry?')) onDelete(entry.id); }}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>

                <p style={{ fontSize: 14, lineHeight: 1.75, color: 'var(--text-muted)', margin: '0 0 12px' }}>
                  {entry.text}
                </p>

                {(entry.keywords?.length > 0 || entry.summary) && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                    {entry.keywords?.length > 0 && (
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                        <span style={{ fontSize: 11, color: 'var(--text-faint)', marginRight: 4 }}>Keywords:</span>
                        {entry.keywords.map((k, i) => (
                          <span key={i} className="keyword-tag">{k}</span>
                        ))}
                      </div>
                    )}
                    {entry.summary && (
                      <div style={{ fontSize: 12, color: 'var(--text-faint)', lineHeight: 1.6, fontStyle: 'italic' }}>
                        "{entry.summary}"
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
