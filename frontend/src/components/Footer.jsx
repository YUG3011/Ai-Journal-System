import React from 'react';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-brand">
          <div className="brand-title">
            R<span className="brand-title-mark">Ξ</span>FLECT <span className="brand-title-ai">AI</span>
          </div>
          <p className="footer-tagline">Your intelligent companion for emotional growth and self-reflection.</p>
        </div>
        
        <div className="footer-links">
          <div className="footer-group">
            <h4>Product</h4>
            <ul>
              <li><a href="#home">Journal</a></li>
              <li><a href="#history">History</a></li>
              <li><a href="#insights">Insights</a></li>
            </ul>
          </div>
          <div className="footer-group">
            <h4>Company</h4>
            <ul>
              <li><a href="#about">About Us</a></li>
              <li><a href="#privacy">Privacy Policy</a></li>
              <li><a href="#terms">Terms of Service</a></li>
            </ul>
          </div>
          <div className="footer-group">
            <h4>Support</h4>
            <ul>
              <li><a href="#help">Help & FAQ</a></li>
              <li><a href="#contact">Contact</a></li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} RΞflectAI. All rights reserved.</p>
        <div className="social-links">
          <a href="#" aria-label="Twitter">𝕏</a>
          <a href="#" aria-label="Instagram">📸</a>
          <a href="#" aria-label="GitHub">💻</a>
        </div>
      </div>
    </footer>
  );
}
