import { useState } from 'react';
import AnalyzeButton from './AnalyzeButton';

export default function JournalForm({ userId, onSubmit, onAnalyze }) {
  const [ambience, setAmbience] = useState('forest');
  const [text, setText] = useState('');
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
    onSubmit({ userId, ambience, text });
    setText('');
  };

  return (
    <form onSubmit={handleSubmit} className="form">
      <div className="row-inline">
        <div>
          <div className="label">Ambience</div>
          <select className="select" value={ambience} onChange={(e) => setAmbience(e.target.value)}>
            <option value="forest">Forest</option>
            <option value="ocean">Ocean</option>
            <option value="mountain">Mountain</option>
          </select>
        </div>
      </div>
      <div>
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
        <button className="btn btn-primary" type="submit">Save Entry</button>
        <AnalyzeButton disabled={!text.trim()} onAnalyze={() => onAnalyze(text, true)} />
      </div>
    </form>
  );
}
