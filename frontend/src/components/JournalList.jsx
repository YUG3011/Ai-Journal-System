export default function JournalList({ entries, onDelete, userId }) {
  if (!entries || !entries.length) {
    return (
      <div className="card" style={{ padding: 18 }}>
        <div>
          <div className="section-title">Your Entries</div>
          <div className="analysis-stat">No entries yet. Save an entry to see analysis and insights here.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="list">
      {entries.map((entry) => (
        <div key={entry.id} className="entry-card">
          <div className="entry-meta">
            <span className="tag">{entry.ambience}</span>
            <span>{new Date(entry.createdAt).toLocaleString()}</span>
          </div>
          <div className="entry-text">{entry.text}</div>
          <div className="meta-grid">
            <span>Emotion: {entry.emotion || 'N/A'}</span>
            <span>Keywords: {(entry.keywords || []).join(', ') || 'N/A'}</span>
            <span>Summary: {entry.summary || 'N/A'}</span>
          </div>
          {onDelete && entry.userId === userId && (
            <div style={{marginTop:10, textAlign:'right'}}>
              <button
                className="btn btn-ghost"
                onClick={() => {
                  if (confirm('Delete this entry? This cannot be undone.')) {
                    onDelete(entry.id);
                  }
                }}
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
