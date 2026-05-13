import { useState } from 'react';
import AnalyzeButton from './AnalyzeButton';
import PdfExportModal from './PdfExportModal';
import { generatePdf } from '../services/api';

export default function JournalForm({ userId, onSubmit, onAnalyze, isFreeLimitExceeded, isAnalyzing }) {
  const [text, setText] = useState('');
  const [ambience, setAmbience] = useState('forest');
  const [error, setError] = useState('');
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);

  const handleGeneratePdf = async (options) => {
    try {
      if (!userId) {
        setError('Please login first to generate reports.');
        return;
      }
      const blob = await generatePdf(options);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Emotion_Insights_${options.timeFilter}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err?.response?.data?.error || err.message || 'Failed to generate PDF');
    }
  };

  const handleSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!text.trim()) {
      setError('Please enter some text before saving.');
      return;
    }
    if (!userId) {
      setError('Please login first to save entries.');
      return;
    }
    setError('');
    onSubmit({ userId, text, ambience });
    setText('');
  };

  return (
    <form onSubmit={(e) => e.preventDefault()} className="form">
      <div>
        <div className="label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          Ambience
          <div className="tooltip-trigger">
            ⓘ
            <div className="tooltip-content">
              <div className="tooltip-item"><strong>⛰️ Mountain</strong> → Focus & Growth</div>
              <div className="tooltip-item"><strong>🌲 Forest</strong> → Calm & Creativity</div>
              <div className="tooltip-item"><strong>🌊 Ocean</strong> → Emotional Reflection</div>
            </div>
          </div>
        </div>
        <select
          className="select"
          value={ambience}
          onChange={(e) => setAmbience(e.target.value)}
          style={{ marginBottom: '14px' }}
        >
          <option value="forest">🌲 Forest</option>
          <option value="ocean">🌊 Ocean</option>
          <option value="mountain">⛰️ Mountain</option>
        </select>

        <div className="label">Journal Text</div>
        <textarea
          id="journal-text"
          className="textarea"
          rows={5}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            if (error) setError('');
          }}
          placeholder="Describe your session..."
        />
        {error && <div className="error" style={{color: '#ff6b6b', marginTop: '8px'}}>{error}</div>}
      </div>
      <div className="actions">
        {/* Analyze Button (now in Purple) */}
        {!isFreeLimitExceeded ? (
          <button 
            className="btn btn-primary" 
            type="button" 
            onClick={() => onAnalyze(text, true)}
            disabled={!text.trim() || isAnalyzing}
          >
            {isAnalyzing ? (
              <>
                <span className="btn-spinner" aria-hidden="true" style={{ marginRight: '8px' }}></span>
                Analyzing...
              </>
            ) : 'Analyze Emotion'}
          </button>
        ) : (
          <button
            type="button"
            className="btn btn-primary"
            disabled={true}
            style={{ opacity: 0.7, cursor: 'not-allowed' }}
          >
            Login to analyze
          </button>
        )}

        {/* Save Button (now in Glass/Ghost) */}
        <AnalyzeButton disabled={!text.trim()} onAnalyze={handleSubmit} />
        
        <button 
          type="button" 
          className="btn" 
          style={{ marginLeft: 'auto', background: 'var(--surface-light)', border: '1px solid var(--border)' }}
          onClick={() => setIsPdfModalOpen(true)}
        >
          📊 Emotion Insights
        </button>
      </div>

      <PdfExportModal 
        isOpen={isPdfModalOpen} 
        onClose={() => setIsPdfModalOpen(false)} 
        onGenerate={handleGeneratePdf} 
        userId={userId}
      />
    </form>
  );
}
