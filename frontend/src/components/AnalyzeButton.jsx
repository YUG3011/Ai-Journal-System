import { useState } from 'react';

export default function AnalyzeButton({ onAnalyze, disabled }) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      await onAnalyze();
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      className="btn btn-ghost"
      onClick={handleClick}
      disabled={disabled || loading}
    >
      {loading ? 'Analyzing...' : 'Analyze Emotion'}
    </button>
  );
}
