export default function JournalList({ entries, onDelete, userId }) {
  if (!entries || !entries.length) {
    return (
      <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-faint)' }}>
        <div style={{ fontSize: 40, marginBottom: 10 }}>📭</div>
        <div style={{ fontWeight: 600, marginBottom: 4 }}>No entries yet</div>
        <div style={{ fontSize: 12 }}>Save your first journal entry to see it here.</div>
      </div>
    );
  }

  const ambienceEmoji = { forest: '🌲', ocean: '🌊', mountain: '⛰️' };

  return (
    <div className="list">
      {entries.map((entry) => (
        <div key={entry.id} className="entry-card">
          <div className="entry-meta">
            <span className="tag">{ambienceEmoji[entry.ambience] || '📔'} {entry.ambience}</span>
            <span className="entry-date">{new Date(entry.createdAt).toLocaleString()}</span>
          </div>
          <div className="entry-text">{entry.text}</div>
          <div className="meta-grid">
            {entry.emotion && <span>✦ {entry.emotion}</span>}
            {entry.keywords?.length > 0 && <span>🔑 {entry.keywords.join(', ')}</span>}
            {entry.summary && <span style={{ color: 'var(--text-muted)' }}>{entry.summary}</span>}
          </div>
          {onDelete && entry.userId === userId && (
            <div style={{ marginTop: 4, textAlign: 'right' }}>
              <button
                className="btn btn-ghost"
                style={{ fontSize: 12, padding: '6px 12px', color: 'var(--red)', borderColor: 'rgba(239,68,68,0.3)' }}
                onClick={() => { if (confirm('Delete this entry?')) onDelete(entry.id); }}
              >
                Delete
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
