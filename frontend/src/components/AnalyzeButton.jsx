import { useState } from 'react';

export default function AnalyzeButton({ onAnalyze, disabled, isFreeLimitExceeded }) {
  const [loading, setLoading] = useState(false);
  const handleClick = async () => {
    setLoading(true);
    try {
      await onAnalyze();
    } finally {
      setLoading(false);
    }
  };

  if (isFreeLimitExceeded) {
    return (
      <button
        type="button"
        className="btn btn-ghost"
        disabled={true}
        style={{ color: '#ff6b6b', borderColor: '#ff6b6b' }}
      >
        Login First to do more thing
      </button>
    );
  }

  return (
    <button
      type="button"
      className="btn btn-ghost"
      onClick={handleClick}
      disabled={disabled || loading}
    >
      {loading ? (
        <>
          <span className="btn-spinner" aria-hidden="true"></span>
          Running...
        </>
      ) : (
        'Analyze Emotion'
      )}
    </button>
  );
}
