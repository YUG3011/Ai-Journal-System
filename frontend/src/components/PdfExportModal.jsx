import React, { useState, useEffect } from 'react';

export default function PdfExportModal({ isOpen, onClose, onGenerate, userId }) {
  const [timeFilter, setTimeFilter] = useState('this_week');
  const [options, setOptions] = useState({
    includeAiSummary: true,
    includeEmotionCharts: true,
    includeMoodTimeline: true,
    includeMoodStreaks: true,
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isBlocked, setIsBlocked] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setErrorMsg('');
      setIsBlocked(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleToggle = (key) => {
    setOptions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleGenerate = async () => {
    if (!userId) {
      setErrorMsg('Please login first to use more features.');
      setIsBlocked(true);
      return;
    }

    setIsGenerating(true);
    await onGenerate({ timeFilter, ...options });
    setIsGenerating(false);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content card" style={{ maxWidth: '400px', width: '100%', padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '20px', margin: 0 }}>📊 Emotion Insights PDF</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '20px' }}>✕</button>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label className="settings-label">Time Range</label>
          <select 
            className="select" 
            value={timeFilter} 
            onChange={(e) => setTimeFilter(e.target.value)}
          >
            <option value="today">Today's Report</option>
            <option value="this_week">This Week</option>
            <option value="this_month">This Month</option>
            <option value="this_year">This Year</option>
          </select>
        </div>

        <div style={{ marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <label className="settings-label">Include Sections</label>
          
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
            <input type="checkbox" checked={options.includeAiSummary} onChange={() => handleToggle('includeAiSummary')} />
            <span>AI Summary</span>
          </label>
          
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
            <input type="checkbox" checked={options.includeEmotionCharts} onChange={() => handleToggle('includeEmotionCharts')} />
            <span>Emotion Charts</span>
          </label>
          
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
            <input type="checkbox" checked={options.includeMoodTimeline} onChange={() => handleToggle('includeMoodTimeline')} />
            <span>Mood Timeline</span>
          </label>
          
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
            <input type="checkbox" checked={options.includeMoodStreaks} onChange={() => handleToggle('includeMoodStreaks')} />
            <span>Mood Streaks</span>
          </label>
        </div>

        {errorMsg && (
          <div className="error" style={{ color: '#ff6b6b', marginBottom: '16px', fontSize: '14px', textAlign: 'center', background: 'rgba(255, 107, 107, 0.1)', padding: '10px', borderRadius: '8px' }}>
            {errorMsg}
          </div>
        )}

        <button 
          className="btn btn-primary" 
          style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', opacity: isBlocked ? 0.5 : 1, cursor: isBlocked ? 'not-allowed' : 'pointer' }}
          onClick={handleGenerate}
          disabled={isGenerating || isBlocked}
        >
          {isGenerating ? (
            <>
              <span className="btn-spinner"></span> Generating...
            </>
          ) : (
            'Generate PDF'
          )}
        </button>
      </div>
      <style>{`
        .modal-overlay {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.6);
          backdrop-filter: blur(4px);
          display: flex; align-items: center; justify-content: center;
          z-index: 1000;
        }
      `}</style>
    </div>
  );
}
