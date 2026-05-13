import { useState } from 'react';
import { submitSupportTicket } from '../services/api';

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: '1px solid var(--border)' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '14px 0', background: 'none', border: 'none', cursor: 'pointer',
          textAlign: 'left', color: 'var(--text)', fontFamily: 'var(--font)',
          fontSize: 14, fontWeight: 600, gap: 12
        }}
      >
        {q}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          style={{ flexShrink: 0, transform: open ? 'rotate(180deg)' : 'rotate(0)', transition: '0.2s' }}>
          <path d="M6 9l6 6 6-6"/>
        </svg>
      </button>
      {open && (
        <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.7, paddingBottom: 14 }}>
          {a}
        </div>
      )}
    </div>
  );
}

export default function HelpPage({ onBack }) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState({ type: '', msg: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const faqs = [
    { q: 'How does the emotion analysis work?', a: 'RΞflectAI uses a large language model (LLM) to analyze the text you write and detect the dominant emotion, extract keywords, and generate a brief summary.' },
    { q: 'Is my journal data private?', a: 'Yes. Your entries are stored securely on the server and are only accessible to your account. We do not share your data with third parties.' },
    { q: 'What are the free interactions?', a: 'Without an account you get 5 free emotion analyses. After that, you need to create an account (free) to continue.' },
    { q: 'What ambience options mean?', a: 'Ambience sets the mood context for your entry — 🌲 Forest (grounded & calm), 🌊 Ocean (flowing & open), ⛰️ Mountain (focused & determined).' },
    { q: 'Can I export my journal entries?', a: 'Export from the History page is coming soon. For now you can view and delete individual entries.' },
    { q: 'What does the AI summary do?', a: 'The AI reads your journal text and generates a concise 1-3 sentence reflection that captures the essence of what you wrote.' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: '', msg: '' });
    try {
      await submitSupportTicket(formData);
      setStatus({ type: 'success', msg: 'Ticket submitted! We will get back to you soon.' });
      setFormData({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setShowForm(false), 3000);
    } catch (err) {
      setStatus({ type: 'error', msg: err.response?.data?.error || 'Failed to submit ticket.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="app-shell">
      <div className="page-header">
        <button className="btn btn-ghost" onClick={onBack}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Back
        </button>
        <div>
          <h1 className="page-title">Help & FAQ</h1>
          <p className="page-subtitle">Answers to common questions about RΞflectAI</p>
        </div>
      </div>

      {!showForm ? (
        <>
          <div className="settings-grid" style={{ marginBottom: 24 }}>
            {[
              { icon: '📘', title: 'Getting Started', desc: 'Write your first journal entry and run analysis.' },
              { icon: '🔒', title: 'Privacy & Security', desc: 'Your data is encrypted and private.' },
              { icon: '⚡', title: 'AI Features', desc: 'Emotion detection, keywords, streaming summaries.' },
              { icon: '📊', title: 'Insights', desc: 'See your emotional trends and patterns over time.' },
            ].map(item => (
              <div key={item.title} className="card" style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <div style={{ fontSize: 28, flexShrink: 0 }}>{item.icon}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{item.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="card">
            <div className="settings-section-title">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01"/></svg>
              Frequently Asked Questions
            </div>
            {faqs.map((faq, i) => <FaqItem key={i} q={faq.q} a={faq.a} />)}
          </div>

          <div className="card" style={{ marginTop: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>Still need help?</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>Fill out our support form and we'll get back to you.</div>
            </div>
            <button className="btn btn-primary" onClick={() => setShowForm(true)}>
              Contact Support
            </button>
          </div>
        </>
      ) : (
        <div className="card" style={{ maxWidth: 600, margin: '0 auto' }}>
          <div className="settings-section-title">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            Contact Support
          </div>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 12 }}>
            <div className="form-group">
              <label className="label">Full Name</label>
              <input 
                type="text" className="input" required 
                value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                placeholder="Enter your name"
              />
            </div>
            <div className="form-group">
              <label className="label">Email Address</label>
              <input 
                type="email" className="input" required 
                value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                placeholder="your@email.com"
              />
            </div>
            <div className="form-group">
              <label className="label">Subject</label>
              <input 
                type="text" className="input" required 
                value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})}
                placeholder="What can we help with?"
              />
            </div>
            <div className="form-group">
              <label className="label">Message</label>
              <textarea 
                className="textarea" rows={5} required 
                value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})}
                placeholder="Describe your issue in detail..."
              />
            </div>
            
            {status.msg && (
              <div style={{ 
                padding: '10px 14px', borderRadius: 8, fontSize: 13, 
                backgroundColor: status.type === 'success' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                color: status.type === 'success' ? 'var(--green)' : 'var(--red)',
                border: `1px solid ${status.type === 'success' ? 'var(--green)' : 'var(--red)'}`
              }}>
                {status.msg}
              </div>
            )}

            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? 'Sending...' : 'Submit Ticket'}
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
