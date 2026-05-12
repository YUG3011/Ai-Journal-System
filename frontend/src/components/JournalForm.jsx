import { useState } from 'react';
import AnalyzeButton from './AnalyzeButton';

export default function JournalForm({ userId, onSubmit, onAnalyze, isFreeLimitExceeded }) {
  const [text, setText] = useState('');
  const [ambience, setAmbience] = useState('forest');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
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
    <form onSubmit={handleSubmit} className="form">
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
        {!isFreeLimitExceeded && (
          <button className="btn btn-primary" type="submit">Save Entry</button>
        )}
        <AnalyzeButton disabled={!text.trim()} onAnalyze={() => onAnalyze(text, true)} isFreeLimitExceeded={isFreeLimitExceeded} />
      </div>
    </form>
  );
}
