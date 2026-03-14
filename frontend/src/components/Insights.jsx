export default function Insights({ data }) {
  if (!data) return null;
  const { totalEntries, topEmotion, mostUsedAmbience, recentKeywords } = data;
  return (
    <div className="insights-grid">
      <div className="insight-tile">
        <div className="insight-label">Total entries</div>
        <div className="insight-value">{totalEntries ?? 0}</div>
      </div>
      <div className="insight-tile">
        <div className="insight-label">Top emotion</div>
        <div className="insight-value">{topEmotion || 'N/A'}</div>
      </div>
      <div className="insight-tile">
        <div className="insight-label">Most used ambience</div>
        <div className="insight-value">{mostUsedAmbience || 'N/A'}</div>
      </div>
      <div className="insight-tile">
        <div className="insight-label">Recent keywords</div>
        <div className="insight-value">{(recentKeywords || []).join(', ') || 'N/A'}</div>
      </div>
    </div>
  );
}
