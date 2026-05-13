import { useEffect, useState } from 'react';
import { Analytics } from '@vercel/analytics/react';
import LoginPage from './components/LoginPage';
import JournalForm from './components/JournalForm';
import JournalList from './components/JournalList';
import Insights from './components/Insights';
import Navbar from './components/Navbar';
import HistoryPage from './components/HistoryPage';
import ProfilePage from './components/ProfilePage';
import SettingsPage from './components/SettingsPage';
import HelpPage from './components/HelpPage';
import Footer from './components/Footer';
import {
  createJournal, getEntries, analyzeText, getInsights,
  login, register, deleteJournal, setAuthToken,
  getGoogleAuthUrl, getGithubAuthUrl, getMe, registerFreeTrial
} from './services/api';

function App() {
  const [userId, setUserId] = useState('');
  const [entries, setEntries] = useState([]);
  const [insights, setInsights] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [interactionCount, setInteractionCount] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accountEmail, setAccountEmail] = useState('');
  const [userProfile, setUserProfile] = useState(null);
  const [isUsingFreeTrial, setIsUsingFreeTrial] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [loginPageLoading, setLoginPageLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [theme, setTheme] = useState('dark');
  const [page, setPage] = useState('home');
  const [compactMode, setCompactMode] = useState(localStorage.getItem('ai_journal_compact') === 'true');

  const FREE_INTERACTIONS = 5;

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    if (compactMode) document.body.classList.add('compact-mode');
    else document.body.classList.remove('compact-mode');
  }, [compactMode]);

  const handleThemeToggle = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

  const fetchData = async () => {
    if (!userId || !isAuthenticated) return;
    try {
      setLoading(true);
      const [entryData, insightsData] = await Promise.all([getEntries(), getInsights()]);
      setEntries(entryData.entries || entryData);
      setInsights(insightsData);
    } catch (err) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    try {
      const token = localStorage.getItem('ai_journal_token');
      const raw = localStorage.getItem('ai_journal_auth');
      const savedTheme = localStorage.getItem('ai_journal_theme');
      if (savedTheme) setTheme(savedTheme);
      if (localStorage.getItem('ai_journal_free_trial') === 'true') setIsUsingFreeTrial(true);
      if (token) { setAuthToken(token); setIsAuthenticated(true); }
      if (raw) {
        const parsed = JSON.parse(raw);
        setAccountEmail(parsed?.email || '');
        setUserId(parsed?.userId || '');
        setInteractionCount(Number(parsed?.interactionCount) || 0);
        if (parsed?.isAuthenticated && token) setIsAuthenticated(true);
      }
    } catch (e) {}
    finally { setIsLoadingAuth(false); }
  }, []);

  useEffect(() => {
    localStorage.setItem('ai_journal_theme', theme);
  }, [theme]);

  useEffect(() => {
    const token = localStorage.getItem('ai_journal_token');
    if (!token || (accountEmail && userId)) return;
    (async () => {
      try {
        const { user } = await getMe();
        setAccountEmail(user.email); setUserId(user.id); setIsAuthenticated(true); setUserProfile(user);
      } catch { setAuthToken(null); setIsAuthenticated(false); setAccountEmail(''); setUserId(''); }
    })();
  }, [accountEmail, userId]);

  useEffect(() => {
    try {
      localStorage.setItem('ai_journal_auth', JSON.stringify({ isAuthenticated, email: accountEmail, userId, interactionCount }));
      localStorage.setItem('ai_journal_free_trial', String(isUsingFreeTrial));
    } catch {}
  }, [isAuthenticated, accountEmail, userId, interactionCount, isUsingFreeTrial]);

  useEffect(() => {
    if (isAuthenticated && userId) fetchData();
    else { setEntries([]); setInsights(null); }
  }, [isAuthenticated, userId]);

  const requiresLoginForAnalyze = () => !isAuthenticated && interactionCount >= FREE_INTERACTIONS;
  const isFreeLimitExceeded = !isAuthenticated && interactionCount >= FREE_INTERACTIONS;

  const handleTryFree = () => { setIsUsingFreeTrial(true); setInteractionCount(0); };

  const handleStartFreeTrial = (profile) => {
    setIsUsingFreeTrial(true); 
    setInteractionCount(0);
    
    // Store profile locally
    if (profile?.name || profile?.age) {
      localStorage.setItem('ai_journal_free_trial_profile', JSON.stringify({ name: profile?.name || '', age: profile?.age || null }));
      
      // Send to database
      registerFreeTrial(profile.name, profile.age)
        .then(() => {
          console.log('Free trial registered successfully');
        })
        .catch((error) => {
          console.error('Error registering free trial:', error);
        });
    }
    setLoginPageLoading(false);
  };

  const handleLoginFromPage = async ({ email, password, mode }) => {
    setLoginPageLoading(true); setLoginError('');
    try {
      const fn = mode === 'register' ? register : login;
      const authResponse = await fn(email, password);
      setAuthToken(authResponse.token);
      setIsAuthenticated(true); setAccountEmail(authResponse.user.email);
      setUserId(authResponse.user.id); setIsUsingFreeTrial(false);
      setUserProfile(authResponse.user);
      setInteractionCount(0); setError('');
      await fetchData();
    } catch (err) {
      const msg = err?.response?.data?.error || err?.message || 'Login failed';
      const isNetwork = !err?.response && (msg.toLowerCase().includes('network') || msg.toLowerCase().includes('connection'));
      setLoginError(isNetwork ? 'Network Error: Backend server is not running. Please start it on port 4000.' : msg);
    } finally { setLoginPageLoading(false); }
  };

  const handleSocialLoginFromPage = async (provider) => {
    setLoginPageLoading(true);
    try {
      const getUrl = provider === 'google' ? getGoogleAuthUrl : getGithubAuthUrl;
      const popup = window.open('about:blank', 'oauth', 'width=480,height=640');
      const url = await getUrl();
      if (!popup || popup.closed) throw new Error('Popup blocked');
      popup.location.href = url;
      const listener = (event) => {
        if (!event.data?.token || !event.data?.user) return;
        setAuthToken(event.data.token); setIsAuthenticated(true);
        setAccountEmail(event.data.user.email); setUserId(event.data.user.id);
        setUserProfile(event.data.user);
        setIsUsingFreeTrial(false); setInteractionCount(0);
        setError(''); setLoginError('');
        window.removeEventListener('message', listener);
        popup?.close(); fetchData();
      };
      window.addEventListener('message', listener);
    } catch (err) {
      const msg = err?.response?.data?.error || err?.message || 'Social login failed';
      const isNetwork = !err?.response && (msg.toLowerCase().includes('network') || msg.toLowerCase().includes('connection'));
      setLoginError(isNetwork ? 'Network Error: Backend server is not running. Please start it on port 4000.' : msg);
    } finally { setLoginPageLoading(false); }
  };

  const handleSubmit = async (payload) => {
    try {
      setError('');
      if (!isAuthenticated) { setError('Sign in to save your journal entries.'); return; }
      await createJournal(payload);
      await fetchData();
      setInteractionCount(c => c + 1);
    } catch (err) { setError(err?.response?.data?.error || err.message || 'Failed to save entry'); }
  };

  const handleDelete = async (id) => {
    try {
      setError(''); await deleteJournal(id); await fetchData();
    } catch (err) { setError(err?.response?.data?.error || err.message || 'Failed to delete entry'); }
  };

  const handleAnalyze = async (text, stream = false) => {
    try {
      setIsAnalyzing(true);
      setError('');
      if (requiresLoginForAnalyze()) return;
      if (!stream) {
        const result = await analyzeText(text); setAnalysis(result);
        setInteractionCount(c => c + 1); return;
      }
      setAnalysis({ emotion: null, keywords: [], summary: '' });
      const resp = await fetch(`${import.meta.env.VITE_API_URL || 'https://ai-journal-system-2.onrender.com/api'}/journal/analyze/stream`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text })
      });
      if (!resp.ok) throw new Error(await resp.text() || 'Streaming analyze failed');
      const reader = resp.body.getReader(); const decoder = new TextDecoder();
      let buf = ''; let fullAnalysis = null;
      while (true) {
        const { value, done } = await reader.read(); if (done) break;
        buf += decoder.decode(value, { stream: true });
        let idx;
        while ((idx = buf.indexOf('\n')) >= 0) {
          const line = buf.slice(0, idx).trim(); buf = buf.slice(idx + 1);
          if (!line) continue;
          try {
            const msg = JSON.parse(line);
            if (msg.type === 'meta') setAnalysis(a => ({ ...a, emotion: msg.emotion, keywords: msg.keywords }));
            else if (msg.type === 'chunk') setAnalysis(a => ({ ...a, summary: (a.summary || '') + (msg.text || '') }));
            else if (msg.type === 'end') { fullAnalysis = msg.analysis; setAnalysis(fullAnalysis); }
          } catch { setAnalysis(a => ({ ...a, summary: (a.summary || '') + line })); }
        }
      }
      if (fullAnalysis) setAnalysis(fullAnalysis);
      setInteractionCount(c => c + 1);
    } catch (err) { setError(err.message || 'Analysis failed'); }
    finally { setIsAnalyzing(false); }
  };

  const handleLogout = () => {
    setIsAuthenticated(false); setAccountEmail(''); setUserId('');
    setInteractionCount(0); setAuthToken(null);
    setAnalysis(null); setEntries([]); setInsights(null); setPage('home'); setError('');
    localStorage.removeItem('ai_journal_auth'); localStorage.removeItem('ai_journal_free_trial');
  };

  if (!isLoadingAuth && !isAuthenticated && !isUsingFreeTrial) {
    return (
      <>
        <style>{`body{background-image:var(--gradient-bg)}`}</style>
        <LoginPage
          onLogin={handleLoginFromPage} onTryFree={handleStartFreeTrial}
          onSocial={handleSocialLoginFromPage} error={loginError} isLoading={loginPageLoading}
        />
      </>
    );
  }

  return (
    <div>
      <Navbar
        isAuthenticated={isAuthenticated}
        accountEmail={accountEmail}
        onLogout={handleLogout}
        onSignIn={() => setIsUsingFreeTrial(false)}
        interactionCount={interactionCount}
        freeLimit={FREE_INTERACTIONS}
        isFreeLimitExceeded={isFreeLimitExceeded}
        theme={theme}
        onThemeToggle={handleThemeToggle}
        onNavigate={setPage}
      />

      {page === 'history' ? (
        <HistoryPage entries={entries} onBack={() => setPage('home')} onDelete={handleDelete} userId={userId} />
      ) : page === 'profile' ? (
        <ProfilePage accountEmail={accountEmail} userProfile={userProfile} onBack={() => setPage('home')} onNavigate={setPage} entries={entries} />
      ) : page === 'settings' ? (
        <SettingsPage 
          theme={theme} 
          onThemeToggle={handleThemeToggle} 
          onBack={() => setPage('home')} 
          onLogout={handleLogout}
          compactMode={compactMode}
          onCompactToggle={() => setCompactMode(!compactMode)}
        />
      ) : page === 'help' ? (
        <HelpPage onBack={() => setPage('home')} />
      ) : (
        <div className="app-shell">
          {isFreeLimitExceeded && (
            <div className="limit-banner">
              ⚠️ You've used all 5 free interactions.
              <button className="signin-btn" style={{ marginLeft: 'auto' }} onClick={() => setIsUsingFreeTrial(false)}>
                Sign In to Continue
              </button>
            </div>
          )}

          {error && <div className="error" style={{ marginBottom: 16 }}>{error}</div>}

          <div className="grid">
            <section className="card card-strong">
              <div className="section-title">New Entry</div>
              <JournalForm userId={userId} onSubmit={handleSubmit} onAnalyze={handleAnalyze} isFreeLimitExceeded={isFreeLimitExceeded} isAnalyzing={isAnalyzing} />
            </section>

            <section className={`card ${analysis?.cached ? 'card-cache-hit' : ''}`}>
              <div className="section-title">Latest Analysis</div>
              {analysis ? (
                <div className="analysis-box">
                  {isAnalyzing && (
                    <div className="analysis-progress">
                      <span className="btn-spinner" aria-hidden="true"></span>
                      Running analysis...
                    </div>
                  )}
                  <div>
                    <div className="analysis-stat">Emotion</div>
                    <div className="emotion-badge">✦ {analysis.emotion || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="analysis-stat">Keywords</div>
                    <div className="keyword-tags">
                      {(analysis.keywords || []).length
                        ? analysis.keywords.map((k, i) => <span key={i} className="keyword-tag">{k}</span>)
                        : <span className="loading">—</span>}
                    </div>
                  </div>
                  <div>
                    <div className="analysis-stat">Summary</div>
                    <div style={{ fontSize: 13, lineHeight: 1.7, color: 'var(--text-muted)' }}>{analysis.summary || '—'}</div>
                  </div>
                  {analysis.cached && <div className="badge-cache">⚡ Served from cache</div>}
                </div>
              ) : (
                <div className="loading">{isAnalyzing ? 'Running analysis...' : 'Run an analysis to see results here.'}</div>
              )}
            </section>
          </div>

          <section className="card" style={{ marginBottom: 20 }}>
            <div className="section-title">Your Entries</div>
            {loading ? <div className="loading">Loading entries…</div> : <JournalList entries={entries.slice(0, 3)} onDelete={handleDelete} userId={userId} />}
          </section>

          <section className="card">
            <div className="section-title">Insights</div>
            <Insights data={insights} />
          </section>
        </div>
      )}
      <Footer />
      <Analytics />
    </div>
  );
}

export default App;
