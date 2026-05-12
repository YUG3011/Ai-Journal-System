export default function Insights({ data }) {
  if (!data) return (
    <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-faint)' }}>
      <div style={{ fontSize: 36, marginBottom: 8 }}>📊</div>
      <div style={{ fontSize: 13 }}>Save entries to unlock insights.</div>
    </div>
  );
  const { totalEntries, topEmotion, mostUsedAmbience, recentKeywords } = data;
  const recentKeywordList = (recentKeywords || []).slice(-12);
  const ambienceEmoji = { forest: '🌲', ocean: '🌊', mountain: '⛰️' };
  const tiles = [
    { label: 'Total Entries', value: totalEntries ?? 0, icon: '📝' },
    { label: 'Top Emotion', value: topEmotion || 'N/A', icon: '✦' },
    { label: 'Favourite Ambience', value: `${ambienceEmoji[mostUsedAmbience] || ''} ${mostUsedAmbience || 'N/A'}`, icon: '🌿' },
    { label: 'Recent Keywords', value: recentKeywordList.join(', ') || 'N/A', icon: '🔑', small: true },
  ];
  return (
    <div className="insights-grid">
      {tiles.map(t => (
        <div key={t.label} className="insight-tile">
          <div style={{ fontSize: 22, marginBottom: 8 }}>{t.icon}</div>
          <div className="insight-label">{t.label}</div>
          <div className="insight-value" style={t.small ? { fontSize: 13, fontFamily: 'var(--font)', fontWeight: 500, color: 'var(--text-muted)' } : {}}>{t.value}</div>
        </div>
      ))}
    </div>
  );
}
