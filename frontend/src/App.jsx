import { useEffect, useState } from 'react';
import JournalForm from './components/JournalForm';
import JournalList from './components/JournalList';
import Insights from './components/Insights';
import LoginModal from './components/LoginModal';
import {
  createJournal,
  getEntries,
  analyzeText,
  getInsights,
  login,
  register,
  deleteJournal,
  setAuthToken,
  getGoogleAuthUrl,
  getGithubAuthUrl,
  getMe
} from './services/api';

function App() {
  const [userId, setUserId] = useState('');
  const [entries, setEntries] = useState([]);
  const [insights, setInsights] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [interactionCount, setInteractionCount] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accountEmail, setAccountEmail] = useState('');
  const [showLogin, setShowLogin] = useState(false);
  const [loginError, setLoginError] = useState('');

  const FREE_INTERACTIONS = 5;

  const fetchData = async () => {
    if (!userId || !isAuthenticated) return;
    try {
      setLoading(true);
      const [entryData, insightsData] = await Promise.all([
        getEntries(),
        getInsights()
      ]);
      setEntries(entryData.entries || entryData);
      setInsights(insightsData);
    } catch (err) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Load auth/token/interaction state from localStorage so login persists across refreshes
  useEffect(() => {
    try {
      const token = localStorage.getItem('ai_journal_token');
      const raw = localStorage.getItem('ai_journal_auth');
      if (token) {
        setAuthToken(token);
        setIsAuthenticated(true);
      }
      if (raw) {
        const parsed = JSON.parse(raw);
        setAccountEmail(parsed?.email || '');
        setUserId(parsed?.userId || '');
        setInteractionCount(Number(parsed?.interactionCount) || 0);
        if (parsed?.isAuthenticated && token) {
          setIsAuthenticated(true);
        }
      }
    } catch (e) {
      // ignore
    }
  }, []);

  // If token exists but we lack user details, fetch /auth/me to hydrate header on refresh
  useEffect(() => {
    const token = localStorage.getItem('ai_journal_token');
    const hasUser = accountEmail && userId;
    if (!token || hasUser) return;
    (async () => {
      try {
        const { user } = await getMe();
        setAccountEmail(user.email);
        setUserId(user.id);
        setIsAuthenticated(true);
      } catch (err) {
        // if token invalid, clear it
        setAuthToken(null);
        setIsAuthenticated(false);
        setAccountEmail('');
        setUserId('');
      }
    })();
  }, [accountEmail, userId]);

  // Persist auth state to localStorage
  useEffect(() => {
    try {
      const payload = { isAuthenticated, email: accountEmail, userId, interactionCount };
      localStorage.setItem('ai_journal_auth', JSON.stringify(payload));
    } catch (e) {
      // ignore
    }
  }, [isAuthenticated, accountEmail, userId, interactionCount]);

  // Fetch data when authenticated user is ready
  useEffect(() => {
    if (isAuthenticated && userId) {
      fetchData();
    } else {
      setEntries([]);
      setInsights(null);
    }
  }, [isAuthenticated, userId]);

  const requiresLoginForAnalyze = () => {
    const exceeded = interactionCount >= FREE_INTERACTIONS && !isAuthenticated;
    if (exceeded) {
      setShowLogin(true);
      setError('Login required to continue after 5 free interactions.');
    }
    return exceeded;
  };

  const handleSubmit = async (payload) => {
    try {
      setError('');
      if (!isAuthenticated) {
        setShowLogin(true);
        setError('Sign in to save your journal entries.');
        return;
      }
      await createJournal(payload);
      await fetchData();
      setInteractionCount((c) => c + 1);
    } catch (err) {
      setError(err.message || 'Failed to save entry');
    }
  };

  const handleDelete = async (id) => {
    try {
      setError('');
      await deleteJournal(id);
      await fetchData();
    } catch (err) {
      setError(err?.response?.data?.error || err.message || 'Failed to delete entry');
    }
  };

  const handleAnalyze = async (text, stream = false) => {
    try {
      setError('');
      if (requiresLoginForAnalyze()) return;
      if (!stream) {
        const result = await analyzeText(text);
        setAnalysis(result);
        setInteractionCount((c) => c + 1);
        return;
      }

      // Streaming path: POST to /journal/analyze/stream and consume text lines
      setAnalysis({ emotion: null, keywords: [], summary: '' });
      const resp = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000/api'}/journal/analyze/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      if (!resp.ok) {
        const errText = await resp.text();
        throw new Error(errText || 'Streaming analyze failed');
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buf = '';
      let fullAnalysis = null;
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        let idx;
        while ((idx = buf.indexOf('\n')) >= 0) {
          const line = buf.slice(0, idx).trim();
          buf = buf.slice(idx + 1);
          if (!line) continue;
          try {
            const msg = JSON.parse(line);
            if (msg.type === 'meta') {
              setAnalysis((a) => ({ ...a, emotion: msg.emotion, keywords: msg.keywords }));
            } else if (msg.type === 'chunk') {
              setAnalysis((a) => ({ ...a, summary: (a.summary || '') + (msg.text || '') }));
            } else if (msg.type === 'end') {
              fullAnalysis = msg.analysis;
              setAnalysis(fullAnalysis);
            }
          } catch (e) {
            // non-JSON line, append
            setAnalysis((a) => ({ ...a, summary: (a.summary || '') + line }));
          }
        }
      }
      if (fullAnalysis) {
        setAnalysis(fullAnalysis);
      }
      setInteractionCount((c) => c + 1);
    } catch (err) {
      setError(err.message || 'Analysis failed');
    }
  };

  const handleLogin = async ({ email, password, mode }) => {
    setLoginError('');
    try {
      let authResponse;
      if (mode === 'register') {
        authResponse = await register(email, password);
      } else {
        authResponse = await login(email, password);
      }
      setAuthToken(authResponse.token);
      setIsAuthenticated(true);
      setAccountEmail(authResponse.user.email);
      setUserId(authResponse.user.id);
      setShowLogin(false);
      setError('');
      await fetchData();
    } catch (err) {
      setLoginError(err?.response?.data?.error || err.message || 'Login failed');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setAccountEmail('');
    setUserId('');
    setInteractionCount(0);
    setAuthToken(null);
    localStorage.removeItem('ai_journal_auth');
  };

  const handleSocialLogin = async (provider) => {
    try {
      const getUrl = provider === 'google' ? getGoogleAuthUrl : getGithubAuthUrl;
      // Open popup immediately to avoid popup blockers
      const popup = window.open('about:blank', 'oauth', 'width=480,height=640');
      const url = await getUrl();
      if (!popup || popup.closed) {
        throw new Error('Popup blocked');
      }
      // Navigate popup to provider URL
      popup.location.href = url;

      const listener = (event) => {
        if (!event.data?.token || !event.data?.user) return;
        setAuthToken(event.data.token);
        setIsAuthenticated(true);
        setAccountEmail(event.data.user.email);
        setUserId(event.data.user.id);
        setShowLogin(false);
        setError('');
        setLoginError('');
        window.removeEventListener('message', listener);
        popup?.close();
        fetchData();
      };
      window.addEventListener('message', listener);
    } catch (err) {
      setLoginError(err?.response?.data?.error || err.message || 'Social login failed');
    }
  };

  return (
    <div className="app-shell">
      <header className="header card">
        <div style={{display:'flex', alignItems:'center', gap:12}}>
          <div className="header-title">
            <span>AI-Assisted Journal</span>
          </div>
          <div className="header-sub">
            Capture your reflections, analyze emotions instantly, and track insights over time. A calm, focused workspace designed for production use.
          </div>
        </div>

        <div className="header-right">
          {isAuthenticated ? (
            <div style={{display:'flex', alignItems:'center', gap:10}}>
              <div className="avatar">{accountEmail ? accountEmail.charAt(0).toUpperCase() : 'U'}</div>
              <div style={{textAlign:'right'}}>
                <div style={{fontWeight:700}}>{accountEmail}</div>
                <button className="btn btn-ghost" onClick={handleLogout} style={{marginTop:6}}>Log out</button>
              </div>
            </div>
          ) : (
            <div style={{display:'flex', alignItems:'center', gap:12}}>
                  {(() => {
                      const remaining = Math.max(FREE_INTERACTIONS - interactionCount, 0);
                      const colorMap = {
                        5: '#2ecc71', // green
                        4: '#1fa97a', // dark green
                        3: '#f1c40f', // yellow
                        2: '#d6a70f', // dark yellow
                        1: '#ff8c42', // orange
                        0: '#ff6b6b'  // red
                      };
                      const color = colorMap[remaining] || 'var(--primary)';
                    return (
                      <div style={{color, fontSize:'.95rem', fontWeight:600}}>
                        You have {remaining} free interactions left
                      </div>
                    );
                  })()}
                  <button className="btn btn-ghost" onClick={() => setShowLogin(true)}>Sign in</button>
                </div>
          )}
        </div>
      </header>

      {error && <div className="error">{error}</div>}

      <div className="grid">
        <section className="card card-strong">
          <h2 className="section-title">New Entry</h2>
          <JournalForm
            userId={userId}
            onSubmit={handleSubmit}
            onAnalyze={handleAnalyze}
          />
        </section>

        <section className="card">
          <h2 className="section-title">Latest Analysis</h2>
          {analysis ? (
            <div className="analysis-box">
              <div className="analysis-stat">Emotion</div>
              <div className="section-title" style={{ margin: 0 }}>{analysis.emotion || 'N/A'}</div>
              <div className="analysis-stat">Keywords</div>
              <div>{(analysis.keywords || []).join(', ') || '—'}</div>
              <div className="analysis-stat">Summary</div>
              <div>{analysis.summary || '—'}</div>
              {analysis.cached && <div className="badge-cache">Served from cache</div>}
            </div>
          ) : (
            <div className="analysis-stat">Run an analysis to see results here.</div>
          )}
        </section>
      </div>

      <section className="card">
        <div className="section-title">Your Entries</div>
        {loading ? <div className="loading">Loading...</div> : <JournalList entries={entries} onDelete={handleDelete} userId={userId} />}
      </section>

      <section className="card">
        <div className="section-title">Insights</div>
        <Insights data={insights} />
      </section>

      <LoginModal
        open={showLogin}
        onClose={() => {
          setShowLogin(false);
          setLoginError('');
        }}
        onLogin={handleLogin}
        onSocial={handleSocialLogin}
        error={loginError}
      />
    </div>
  );
}

export default App;
