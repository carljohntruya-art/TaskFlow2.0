import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, CheckCircle2, ArrowRight, Chrome, Github } from 'lucide-react';
import { authService } from '../services/authService';
import { useAuthStore } from '../store/authStore';

// ── Inject global styles ──────────────────────────────────────────────────────
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=Inter:wght@300;400;500;600&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .tf-root {
    display: flex;
    flex-direction: row;
    width: 100vw;
    min-height: 100vh;
    background: #060912;
    font-family: 'Inter', sans-serif;
    overflow: hidden;
    position: relative;
  }

  /* ── Background ── */
  .tf-bg {
    position: fixed;
    inset: 0;
    z-index: 0;
    pointer-events: none;
    background:
      radial-gradient(ellipse 60% 50% at 15% 15%, rgba(59,130,246,0.13) 0%, transparent 70%),
      radial-gradient(ellipse 50% 40% at 85% 8%,  rgba(139,92,246,0.09) 0%, transparent 60%),
      radial-gradient(ellipse 70% 50% at 50% 95%, rgba(6,182,212,0.07)  0%, transparent 60%);
  }
  .tf-bg::after {
    content: '';
    position: absolute;
    inset: 0;
    background-image: radial-gradient(circle, rgba(255,255,255,0.025) 1px, transparent 1px);
    background-size: 28px 28px;
  }

  /* ── Left panel ── */
  .tf-left {
    width: 45%;
    min-width: 420px;
    max-width: 540px;
    min-height: 100vh;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 52px 48px;
    border-right: 1px solid rgba(255,255,255,0.055);
    background: rgba(255,255,255,0.018);
    position: relative;
    z-index: 1;
    overflow: hidden;
  }
  .tf-left::before {
    content: '';
    position: absolute;
    top: -120px; left: -120px;
    width: 400px; height: 400px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(59,130,246,0.07) 0%, transparent 70%);
    pointer-events: none;
  }

  /* ── Right panel ── */
  .tf-right {
    flex: 1;
    min-width: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: 48px 32px;
    position: relative;
    z-index: 1;
  }

  .tf-form-wrap {
    width: 100%;
    max-width: 400px;
  }

  /* ── Logo ── */
  .tf-logo-wrap {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 68px;
    height: 68px;
    border-radius: 18px;
    background: linear-gradient(145deg, #1a3a6e 0%, #0d1f3c 100%);
    border: 1px solid rgba(99,179,255,0.22);
    box-shadow:
      0 0 0 1px rgba(99,179,255,0.08),
      0 8px 32px rgba(0,0,0,0.45),
      0 0 60px rgba(59,130,246,0.12);
    animation: logoFloat 3.5s ease-in-out infinite;
  }
  .tf-logo-wrap img {
    width: 42px;
    height: 42px;
    object-fit: contain;
    filter: drop-shadow(0 2px 8px rgba(99,179,255,0.35));
  }
  .tf-pro-badge {
    position: absolute;
    top: -8px; right: -8px;
    background: linear-gradient(135deg, #3b82f6, #8b5cf6);
    border-radius: 999px;
    padding: 3px 7px;
    font-size: 9px;
    font-weight: 700;
    color: white;
    letter-spacing: 0.06em;
    box-shadow: 0 2px 10px rgba(59,130,246,0.5);
    font-family: 'Syne', sans-serif;
  }

  /* ── Left panel content ── */
  .tf-brand-name {
    font-family: 'Syne', sans-serif;
    font-size: 20px;
    font-weight: 700;
    color: #e2e8f0;
    margin-top: 20px;
    letter-spacing: -0.01em;
  }
  .tf-brand-name span {
    color: #3b82f6;
    font-size: 11px;
    font-weight: 600;
    background: rgba(59,130,246,0.15);
    border: 1px solid rgba(59,130,246,0.25);
    border-radius: 4px;
    padding: 2px 6px;
    margin-left: 8px;
    vertical-align: middle;
    letter-spacing: 0.05em;
  }

  .tf-headline {
    font-family: 'Syne', sans-serif;
    font-size: 36px;
    font-weight: 800;
    line-height: 1.15;
    letter-spacing: -0.02em;
    background: linear-gradient(135deg, #ffffff 0%, #94a3b8 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-top: 40px;
    max-width: 340px;
  }

  .tf-subtext {
    color: #4b5c73;
    font-size: 14px;
    line-height: 1.6;
    margin-top: 14px;
    max-width: 320px;
  }

  .tf-features {
    margin-top: 36px;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }
  .tf-feature {
    display: flex;
    align-items: center;
    gap: 12px;
    color: #94a3b8;
    font-size: 14px;
    font-weight: 500;
  }
  .tf-feature svg {
    color: #3b82f6;
    flex-shrink: 0;
  }

  .tf-testimonial {
    margin-top: 48px;
    padding: 20px 22px;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 16px;
    backdrop-filter: blur(10px);
  }
  .tf-testimonial p {
    color: #94a3b8;
    font-size: 13px;
    line-height: 1.65;
    font-style: italic;
  }
  .tf-testimonial-author {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-top: 14px;
  }
  .tf-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: linear-gradient(135deg, #3b82f6, #8b5cf6);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    font-weight: 700;
    color: white;
    flex-shrink: 0;
    font-family: 'Syne', sans-serif;
  }
  .tf-author-name {
    font-size: 13px;
    font-weight: 600;
    color: #e2e8f0;
  }
  .tf-author-role {
    font-size: 11px;
    color: #4b5c73;
    margin-top: 1px;
  }

  /* ── Form ── */
  .tf-welcome {
    font-family: 'Syne', sans-serif;
    font-size: 30px;
    font-weight: 800;
    letter-spacing: -0.02em;
    background: linear-gradient(135deg, #ffffff 0%, #94a3b8 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: fadeUp 0.5s ease both;
    animation-delay: 0.1s;
  }
  .tf-welcome-sub {
    color: #4b5c73;
    font-size: 14px;
    margin-top: 6px;
    animation: fadeUp 0.5s ease both;
    animation-delay: 0.15s;
  }

  .tf-field-group {
    margin-top: 28px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    animation: fadeUp 0.5s ease both;
    animation-delay: 0.2s;
  }

  .tf-label-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 6px;
  }
  .tf-label {
    font-size: 11px;
    font-weight: 600;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.07em;
  }
  .tf-forgot {
    font-size: 12px;
    color: #3b82f6;
    text-decoration: none;
    font-weight: 500;
    cursor: pointer;
    background: none;
    border: none;
    padding: 0;
  }
  .tf-forgot:hover { text-decoration: underline; }

  .tf-input-wrap {
    position: relative;
  }
  .tf-input-icon {
    position: absolute;
    left: 14px;
    top: 50%;
    transform: translateY(-50%);
    color: #3d4f63;
    transition: color 0.2s;
    pointer-events: none;
  }
  .tf-input-icon-right {
    position: absolute;
    right: 14px;
    top: 50%;
    transform: translateY(-50%);
    color: #3d4f63;
    cursor: pointer;
    background: none;
    border: none;
    padding: 0;
    display: flex;
    align-items: center;
    transition: color 0.2s;
  }
  .tf-input-icon-right:hover { color: #94a3b8; }

  .tf-input {
    width: 100%;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 12px;
    padding: 13px 16px 13px 42px;
    color: #e2e8f0;
    font-size: 14px;
    font-family: 'Inter', sans-serif;
    transition: all 0.2s ease;
    outline: none;
  }
  .tf-input::placeholder { color: #2d3d52; }
  .tf-input:focus {
    border-color: rgba(59,130,246,0.5);
    background: rgba(59,130,246,0.05);
    box-shadow: 0 0 0 3px rgba(59,130,246,0.1);
  }
  .tf-input:focus + .tf-input-icon,
  .tf-input-wrap:focus-within .tf-input-icon { color: #3b82f6; }

  .tf-btn {
    width: 100%;
    margin-top: 8px;
    padding: 14px;
    background: linear-gradient(135deg, #3b82f6, #2563eb);
    border: none;
    border-radius: 12px;
    color: white;
    font-size: 15px;
    font-weight: 600;
    font-family: 'Inter', sans-serif;
    cursor: pointer;
    box-shadow: 0 4px 24px rgba(59,130,246,0.35);
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    animation: fadeUp 0.5s ease both;
    animation-delay: 0.3s;
  }
  .tf-btn:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 8px 32px rgba(59,130,246,0.45);
  }
  .tf-btn:active:not(:disabled) { transform: translateY(0); }
  .tf-btn:disabled { opacity: 0.7; cursor: not-allowed; }

  .tf-divider {
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 24px 0;
    animation: fadeUp 0.5s ease both;
    animation-delay: 0.35s;
  }
  .tf-divider-line {
    flex: 1;
    height: 1px;
    background: rgba(255,255,255,0.07);
  }
  .tf-divider span {
    color: #3d4f63;
    font-size: 12px;
    white-space: nowrap;
  }

  .tf-oauth {
    display: flex;
    gap: 12px;
    animation: fadeUp 0.5s ease both;
    animation-delay: 0.4s;
  }
  .tf-oauth-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 12px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 12px;
    color: #94a3b8;
    font-size: 13px;
    font-weight: 500;
    font-family: 'Inter', sans-serif;
    cursor: pointer;
    transition: all 0.2s ease;
    min-height: 44px;
  }
  .tf-oauth-btn:hover {
    background: rgba(255,255,255,0.08);
    border-color: rgba(255,255,255,0.14);
    transform: translateY(-1px);
    color: #e2e8f0;
  }

  .tf-footer {
    text-align: center;
    margin-top: 24px;
    color: #3d4f63;
    font-size: 13px;
    animation: fadeUp 0.5s ease both;
    animation-delay: 0.45s;
  }
  .tf-footer a {
    color: #3b82f6;
    font-weight: 500;
    text-decoration: none;
    cursor: pointer;
  }
  .tf-footer a:hover { text-decoration: underline; }

  /* ── Spinner ── */
  .tf-spinner {
    width: 16px; height: 16px;
    border: 2px solid rgba(255,255,255,0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
  }

  /* ── Animations ── */
  @keyframes logoFloat {
    0%, 100% { transform: translateY(0px); }
    50%       { transform: translateY(-5px); }
  }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  /* ── Mobile ── */
  @media (max-width: 768px) {
    .tf-left { display: none !important; }
    .tf-right { width: 100vw; padding: 32px 20px; }
    .tf-form-wrap {
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.07);
      border-radius: 24px;
      padding: 32px 24px;
      backdrop-filter: blur(20px);
    }
    .tf-mobile-logo {
      display: flex !important;
      flex-direction: column;
      align-items: center;
      margin-bottom: 28px;
    }
  }
  .tf-mobile-logo { display: none; }
`;

// ── Component ──────────────────────────────────────────────────────────────────
const LoginScreen: React.FC = () => {
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    setError('');
    setLoading(true);
    try {
      const res = await authService.login(email, password);
      if (res.success && res.user) {
        setUser(res.user);
        navigate('/home');
      } else {
        setError(res.message || 'Invalid credentials. Please try again.');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{STYLES}</style>

      <div className="tf-root">
        {/* Background */}
        <div className="tf-bg" />

        {/* ── LEFT BRAND PANEL ── */}
        <div className="tf-left">
          {/* Logo */}
          <div>
            <div className="tf-logo-wrap">
              <img
                src="/assets/logo.png"
                alt="TaskFlow"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                  const parent = (e.target as HTMLImageElement).parentElement;
                  if (parent) {
                    const span = document.createElement('span');
                    span.style.cssText = 'font-family:Syne,sans-serif;font-size:22px;font-weight:800;color:#3b82f6';
                    span.textContent = 'TF';
                    parent.appendChild(span);
                  }
                }}
              />
              <span className="tf-pro-badge">PRO</span>
            </div>
            <div className="tf-brand-name">
              TaskFlow <span>PRO</span>
            </div>

            <h1 className="tf-headline">
              Everything you need to get things done.
            </h1>
            <p className="tf-subtext">
              Join 10,000+ professionals managing their work smarter with TaskFlow Pro.
            </p>

            <div className="tf-features">
              {[
                'AI-powered task prioritization',
                'Real-time team collaboration',
                'Advanced analytics & insights',
              ].map((f) => (
                <div className="tf-feature" key={f}>
                  <CheckCircle2 size={16} />
                  {f}
                </div>
              ))}
            </div>
          </div>

          {/* Testimonial */}
          <div className="tf-testimonial" style={{ animation: 'fadeIn 0.8s ease both', animationDelay: '0.3s' }}>
            <p>
              "TaskFlow transformed how our team ships. We cut planning overhead by 40% in the first month alone."
            </p>
            <div className="tf-testimonial-author">
              <div className="tf-avatar">CJ</div>
              <div>
                <div className="tf-author-name">Cee Jay</div>
                <div className="tf-author-role">Full Stack Dev, CS 3-B</div>
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT FORM PANEL ── */}
        <div className="tf-right">
          <div className="tf-form-wrap">

            {/* Mobile-only logo */}
            <div className="tf-mobile-logo">
              <div className="tf-logo-wrap">
                <span style={{ fontFamily: 'Syne,sans-serif', fontSize: 22, fontWeight: 800, color: '#3b82f6' }}>TF</span>
                <span className="tf-pro-badge">PRO</span>
              </div>
            </div>

            <h2 className="tf-welcome">Welcome Back</h2>
            <p className="tf-welcome-sub">Enter your details to access your account</p>

            {error && (
              <div style={{
                marginTop: 16, padding: '10px 14px',
                background: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.2)',
                borderRadius: 10, color: '#f87171', fontSize: 13,
              }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="tf-field-group">
                {/* Email */}
                <div>
                  <div className="tf-label-row">
                    <label className="tf-label">Email</label>
                  </div>
                  <div className="tf-input-wrap">
                    <Mail size={15} className="tf-input-icon" />
                    <input
                      id="login-email"
                      className="tf-input"
                      type="email"
                      placeholder="you@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <div className="tf-label-row">
                    <label className="tf-label">Password</label>
                    <button type="button" className="tf-forgot">Forgot?</button>
                  </div>
                  <div className="tf-input-wrap">
                    <Lock size={15} className="tf-input-icon" />
                    <input
                      id="login-password"
                      className="tf-input"
                      type={showPass ? 'text' : 'password'}
                      placeholder="Min. 8 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      style={{ paddingRight: 42 }}
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      className="tf-input-icon-right"
                      onClick={() => setShowPass(!showPass)}
                      aria-label={showPass ? 'Hide password' : 'Show password'}
                    >
                      {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Sign In */}
              <button
                id="login-submit"
                className="tf-btn"
                type="submit"
                disabled={loading}
                style={{ marginTop: 24 }}
              >
                {loading ? (
                  <><div className="tf-spinner" /> Signing in...</>
                ) : (
                  <>Sign In <ArrowRight size={16} /></>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="tf-divider">
              <div className="tf-divider-line" />
              <span>Or continue with</span>
              <div className="tf-divider-line" />
            </div>

            {/* OAuth */}
            <div className="tf-oauth">
              <button className="tf-oauth-btn" type="button" aria-label="Sign in with Google">
                <Chrome size={15} /> Google
              </button>
              <button className="tf-oauth-btn" type="button" aria-label="Sign in with GitHub">
                <Github size={15} /> GitHub
              </button>
            </div>

            {/* Footer */}
            <p className="tf-footer">
              Don't have an account?{' '}
              <a onClick={() => navigate('/register')}>Create one</a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginScreen;
