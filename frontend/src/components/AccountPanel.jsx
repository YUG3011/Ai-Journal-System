export default function AccountPanel({ isAuthenticated, email, interactionCount, freeLimit, onLoginClick, onLogout }) {
  return (
    <div className="card card-strong" style={{ marginTop: '12px' }}>
      <div className="section-title">Account</div>
      {isAuthenticated ? (
        <div className="analysis-box">
          <div className="analysis-stat">Signed in as</div>
          <div className="section-title" style={{ margin: 0 }}>{email}</div>
          <div className="analysis-stat">Usage</div>
          <div>{interactionCount} interactions recorded</div>
          <div className="actions" style={{ marginTop: '8px' }}>
            <button className="btn btn-ghost" onClick={onLogout}>Log out</button>
          </div>
        </div>
      ) : (
        <div className="analysis-box">
          <div className="analysis-stat">You have {freeLimit - interactionCount >= 0 ? freeLimit - interactionCount : 0} free interactions left.</div>
          <div className="actions" style={{ marginTop: '8px' }}>
            <button className="btn btn-primary" onClick={onLoginClick}>Sign in</button>
          </div>
        </div>
      )}
    </div>
  );
}
