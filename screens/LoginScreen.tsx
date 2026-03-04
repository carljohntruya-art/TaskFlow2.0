import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mail,
  Lock,
  Loader2,
  AlertCircle,
  Check,
  Github,
  Chrome,
} from 'lucide-react';
import { authService } from '../services/authService';
import { useAuthStore } from '../store/authStore';

// ─── Constants ─────────────────────────────────────────────────────────────
const LOGO_URL = '/assets/logo.png';
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ─── Feature bullets ────────────────────────────────────────────────────────
const FEATURES = [
  'AI-powered task prioritization',
  'Real-time team collaboration',
  'Advanced analytics & insights',
];

// ─── CSS-in-JS animations ──────────────────────────────────────────────────
const KEYFRAMES = `
  @keyframes logoFloat {
    0%, 100% { transform: translateY(0px); }
    50%       { transform: translateY(-4px); }
  }
  @keyframes fadeSlideDown {
    from { opacity: 0; transform: translateY(-16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeSlideUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes spin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }

  /* ── Responsive visibility ───────────────────────────────────────── */
  .lf-brand-panel  { display: none; }
  .lf-mobile-logo  { display: flex; flex-direction: column; align-items: center; margin-bottom: 32px; }

  @media (min-width: 768px) {
    .lf-brand-panel  { display: block !important; }
    .lf-mobile-logo  { display: none; }
    /* Strip glass card on desktop — form sits directly on the panel bg */
    .lf-form-shell {
      background: transparent !important;
      border: none !important;
      backdrop-filter: none !important;
      -webkit-backdrop-filter: none !important;
      padding: 0 !important;
      border-radius: 0 !important;
    }
  }

  @media (max-width: 768px) {
    .lf-brand-panel {
      display: none !important;
    }
    .lf-form-panel {
      width: 100vw !important;
      min-height: 100vh !important;
    }
  }

  /* ── Input focus glow ─────────────────────────────────────────────── */
  .lf-input {
    width: 100%;
    padding: 14px 16px 14px 44px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 12px;
    color: #fff;
    font-size: 15px;
    outline: none;
    transition: border 0.2s ease, background 0.2s ease, box-shadow 0.2s ease;
  }
  .lf-input::placeholder { color: #475569; }
  .lf-input:focus {
    border-color: rgba(59,130,246,0.5);
    background: rgba(59,130,246,0.05);
    box-shadow: 0 0 0 3px rgba(59,130,246,0.1);
  }
  .lf-input.error {
    border-color: rgba(248,113,113,0.5);
    box-shadow: 0 0 0 3px rgba(248,113,113,0.1);
  }

  /* ── Icon inside input colour change on focus ─────────────────────── */
  .lf-field:focus-within .lf-icon { color: #3b82f6; }

  /* ── OAuth button ─────────────────────────────────────────────────── */
  .lf-oauth {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 12px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 12px;
    color: #e2e8f0;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s ease, border-color 0.2s ease, transform 0.2s ease;
    min-height: 44px;
  }
  .lf-oauth:hover {
    background: rgba(255,255,255,0.08);
    border-color: rgba(255,255,255,0.15);
    transform: translateY(-1px);
  }
  .lf-oauth:active { transform: translateY(0); }

  /* ── Primary button ───────────────────────────────────────────────── */
  .lf-submit {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 14px;
    background: linear-gradient(135deg, #3b82f6, #2563eb);
    border-radius: 12px;
    color: #fff;
    font-size: 15px;
    font-weight: 600;
    letter-spacing: 0.01em;
    cursor: pointer;
    border: none;
    box-shadow: 0 4px 24px rgba(59,130,246,0.35);
    transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease;
    min-height: 48px;
  }
  .lf-submit:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 8px 32px rgba(59,130,246,0.45);
  }
  .lf-submit:active:not(:disabled) { transform: translateY(0); }
  .lf-submit:disabled { opacity: 0.8; cursor: not-allowed; }

  /* ── Entrance animations ──────────────────────────────────────────── */
  .lf-anim-logo    { animation: fadeSlideDown 0.4s ease both; }
  .lf-anim-heading { animation: fadeSlideUp   0.5s ease 0.1s both; }
  .lf-anim-fields  { animation: fadeSlideUp   0.5s ease 0.2s both; }
  .lf-anim-btn     { animation: fadeSlideUp   0.5s ease 0.3s both; }
  .lf-anim-panel   { animation: fadeIn        0.6s ease both; }
`;

// ─── Testimonial ─────────────────────────────────────────────────────────
const Testimonial: React.FC = () => (
  <div
    style={{
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: '16px',
      padding: '16px',
      maxWidth: '100%',
      overflowWrap: 'break-word',
    }}
  >
    <p
      style={{
        color: '#94a3b8',
        fontSize: '14px',
        lineHeight: '1.6',
        marginBottom: '16px',
        wordWrap: 'normal',
        whiteSpace: 'normal',
        overflowWrap: 'break-word',
      }}
    >
      "TaskFlow transformed how our team ships. We cut planning overhead by 40% in the first
      month alone."
    </p>
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      {/* Avatar */}
      <div
        style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '14px',
          fontWeight: 700,
          color: '#fff',
          flexShrink: 0,
        }}
      >
        AK
      </div>
      <div>
        <p style={{ color: '#e2e8f0', fontSize: '13px', fontWeight: 600, margin: 0 }}>
          Alex Kim
        </p>
        <p style={{ color: '#475569', fontSize: '12px', margin: 0 }}>
          Head of Product, Novex Labs
        </p>
      </div>
    </div>
  </div>
);

// ─── Left brand panel ─────────────────────────────────────────────────────
const BrandPanel: React.FC = () => (
  <div
    className="lf-anim-panel"
    style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      padding: '48px 40px',
      background: 'rgba(255,255,255,0.02)',
      borderRight: '1px solid rgba(255,255,255,0.06)',
      height: '100%',
      minHeight: '100vh',
      width: '100%',
      overflowY: 'auto',
      overflowX: 'hidden',
    }}
  >
    {/* Logo */}
    <div style={{ marginBottom: '48px' }}>
      <div
        style={{
          width: '64px',
          height: '64px',
          background: 'linear-gradient(135deg, #1e3a6e, #0f2040)',
          border: '1px solid rgba(99,179,255,0.2)',
          borderRadius: '16px',
          boxShadow:
            '0 0 0 1px rgba(99,179,255,0.1), 0 8px 32px rgba(0,0,0,0.4), 0 0 60px rgba(59,130,246,0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          padding: '12px',
          animation: 'logoFloat 3s ease-in-out infinite',
        }}
      >
        <img
          src={LOGO_URL}
          alt="TaskFlow Logo"
          style={{ width: '100%', height: '100%', objectFit: 'contain', filter: 'drop-shadow(0 2px 8px rgba(99,179,255,0.4))' }}
        />
        {/* PRO badge */}
        <div
          style={{
            position: 'absolute',
            top: '-8px',
            right: '-8px',
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            borderRadius: '999px',
            padding: '2px 7px',
            fontSize: '9px',
            fontWeight: 700,
            color: '#fff',
            letterSpacing: '0.08em',
            boxShadow: '0 2px 8px rgba(59,130,246,0.5)',
          }}
        >
          PRO
        </div>
      </div>

      {/* Wordmark */}
      <div style={{ marginTop: '20px' }}>
        <span
          style={{
            fontSize: '22px',
            fontWeight: 700,
            background: 'linear-gradient(135deg, #fff 30%, #94a3b8)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.02em',
          }}
        >
          TaskFlow
        </span>
        <span
          style={{
            marginLeft: '6px',
            fontSize: '11px',
            fontWeight: 600,
            color: '#3b82f6',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            verticalAlign: 'middle',
          }}
        >
          Pro
        </span>
      </div>
    </div>

    {/* Headline */}
    <h1
      style={{
        fontSize: '26px',
        fontWeight: 700,
        lineHeight: 1.3,
        letterSpacing: '-0.03em',
        background: 'linear-gradient(135deg, #ffffff 0%, #94a3b8 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        marginBottom: '16px',
        wordWrap: 'normal',
        whiteSpace: 'normal',
        wordBreak: 'break-word',
        overflowWrap: 'break-word',
        maxWidth: '100%',
      }}
    >
      Everything you need to get things done.
    </h1>
    <p
      style={{
        color: '#64748b',
        fontSize: '15px',
        lineHeight: 1.6,
        marginBottom: '36px',
        wordWrap: 'normal',
        whiteSpace: 'normal',
        overflowWrap: 'break-word',
        maxWidth: '100%',
      }}
    >
      Join 10,000+ professionals managing their work with TaskFlow Pro.
    </p>

    {/* Feature bullets */}
    <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 40px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {FEATURES.map((feat) => (
        <li key={feat} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '22px',
              height: '22px',
              borderRadius: '50%',
              background: 'rgba(59,130,246,0.15)',
              border: '1px solid rgba(59,130,246,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Check size={12} style={{ color: '#3b82f6' }} />
          </div>
          <span style={{ color: '#cbd5e1', fontSize: '14px', fontWeight: 500 }}>{feat}</span>
        </li>
      ))}
    </ul>

    {/* Testimonial */}
    <Testimonial />
  </div>
);

// ─── Main Login Screen ────────────────────────────────────────────────────
const LoginScreen: React.FC = () => {
  const navigate = useNavigate();

  // ── Form state (unchanged logic) ─────────────────────────────────
  const [email, setEmail]             = useState('');
  const [password, setPassword]       = useState('');
  const [isLoading, setIsLoading]     = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  const setUser = useAuthStore((state) => state.setUser);

  const validate = (): boolean => {
    const errors: { email?: string; password?: string } = {};
    if (!email.trim()) {
      errors.email = 'Email is required.';
    } else if (!EMAIL_REGEX.test(email)) {
      errors.email = 'Enter a valid email address.';
    }
    if (!password) {
      errors.password = 'Password is required.';
    } else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters.';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    if (!validate()) return;
    setIsLoading(true);
    try {
      const res = await authService.login(email, password);
      if (res.success && res.user) {
        setUser(res.user);
        navigate('/home');
      } else {
        setServerError(res.message || 'Login failed. Please try again.');
      }
    } catch {
      setServerError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  // ─────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Global keyframes + component-scoped styles */}
      <style>{KEYFRAMES}</style>

      {/* ── Page shell ───────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          width: '100vw',
          minHeight: '100vh',
          background: '#050810',
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        {/* ── Background layers ────────────────────────────────── */}
        <div
          aria-hidden="true"
          style={{
            position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
            background: [
              'radial-gradient(ellipse at 20% 20%, rgba(59,130,246,0.15) 0%, transparent 60%)',
              'radial-gradient(ellipse at 80% 10%, rgba(139,92,246,0.10) 0%, transparent 50%)',
              'radial-gradient(ellipse at 50% 90%, rgba(6,182,212,0.08) 0%, transparent 50%)',
            ].join(', '),
          }}
        />
        {/* Dot grid overlay */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none',
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        {/* ── Split layout container ───────────────────────────── */}
        <div
          style={{
            position: 'relative',
            zIndex: 1,
            display: 'flex',
            width: '100%',
            minHeight: '100vh',
          }}
        >
          {/* ── LEFT BRAND PANEL (desktop only) ─────────────────── */}
          <div className="lf-brand-panel" style={{
            width: '45%',
            minWidth: '420px',
            maxWidth: '520px',
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '48px 40px',
            position: 'relative',
            zIndex: 1,
            borderRight: '1px solid rgba(255,255,255,0.06)',
            background: 'rgba(255,255,255,0.02)',
            flexShrink: 0,
            overflowY: 'auto',
            overflowX: 'hidden',
          }}>
            <BrandPanel />
          </div>

          {/* ── RIGHT FORM PANEL ─────────────────────────────────── */}
          <div
            className="lf-form-panel"
            style={{
              flex: 1,
              minWidth: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '100vh',
              padding: '48px 32px',
              position: 'relative',
              zIndex: 1
            }}
          >
            <div style={{ width: '100%', maxWidth: '400px' }}>

              {/* ── Mobile-only logo ──────────────────────────────── */}
              <div className="lf-mobile-logo lf-anim-logo">
                <div style={{ position: 'relative', display: 'inline-flex' }}>
                  <div
                    style={{
                      width: '64px',
                      height: '64px',
                      background: 'linear-gradient(135deg, #1e3a6e, #0f2040)',
                      border: '1px solid rgba(99,179,255,0.2)',
                      borderRadius: '16px',
                      boxShadow:
                        '0 0 0 1px rgba(99,179,255,0.1), 0 8px 32px rgba(0,0,0,0.4), 0 0 60px rgba(59,130,246,0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '12px',
                      animation: 'logoFloat 3s ease-in-out infinite',
                    }}
                  >
                    <img
                      src={LOGO_URL}
                      alt="TaskFlow Logo"
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                    {/* PRO badge */}
                    <div
                      style={{
                        position: 'absolute',
                        top: '-8px',
                        right: '-8px',
                        background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                        borderRadius: '999px',
                        padding: '2px 7px',
                        fontSize: '9px',
                        fontWeight: 700,
                        color: '#fff',
                        letterSpacing: '0.08em',
                        boxShadow: '0 2px 8px rgba(59,130,246,0.5)',
                      }}
                    >
                      PRO
                    </div>
                  </div>
                </div>
                <span
                  style={{
                    marginTop: '14px',
                    fontSize: '20px',
                    fontWeight: 700,
                    background: 'linear-gradient(135deg, #fff 30%, #94a3b8)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    letterSpacing: '-0.02em',
                  }}
                >
                  TaskFlow Pro
                </span>
              </div>

              {/* ── Glass card wrapper (mobile only, strips on desktop) ── */}
              <div
                className="lf-form-shell"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '24px',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  padding: '32px 24px',
                }}
              >
                {/* Heading */}
                <div className="lf-anim-heading" style={{ marginBottom: '28px' }}>
                  <h2
                    style={{
                      fontSize: '32px',
                      fontWeight: 700,
                      letterSpacing: '-0.03em',
                      background: 'linear-gradient(135deg, #ffffff 0%, #94a3b8 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      margin: 0,
                    }}
                  >
                    Welcome Back
                  </h2>
                  <p style={{ color: '#64748b', fontSize: '14px', marginTop: '8px' }}>
                    Enter your details to access your account
                  </p>
                </div>

                {/* ── Form ─────────────────────────────────────────── */}
                <form onSubmit={handleLogin} noValidate>
                  <div className="lf-anim-fields" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                    {/* Email */}
                    <div>
                      <label
                        htmlFor="login-email"
                        style={{
                          display: 'block',
                          color: '#94a3b8',
                          fontSize: '12px',
                          fontWeight: 500,
                          letterSpacing: '0.05em',
                          textTransform: 'uppercase',
                          marginBottom: '8px',
                        }}
                      >
                        Email
                      </label>
                      <div className="lf-field" style={{ position: 'relative' }}>
                        <div
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            height: '100%',
                            paddingLeft: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            pointerEvents: 'none',
                          }}
                        >
                          <Mail
                            size={17}
                            className="lf-icon"
                            style={{
                              color: fieldErrors.email ? '#f87171' : '#475569',
                              transition: 'color 0.2s',
                            }}
                          />
                        </div>
                        <input
                          id="login-email"
                          type="email"
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            if (fieldErrors.email) setFieldErrors((fe) => ({ ...fe, email: undefined }));
                          }}
                          placeholder="you@company.com"
                          className={`lf-input${fieldErrors.email ? ' error' : ''}`}
                          autoComplete="email"
                        />
                      </div>
                      {fieldErrors.email && (
                        <p
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            color: '#f87171',
                            fontSize: '12px',
                            marginTop: '6px',
                          }}
                        >
                          <AlertCircle size={12} /> {fieldErrors.email}
                        </p>
                      )}
                    </div>

                    {/* Password */}
                    <div>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: '8px',
                        }}
                      >
                        <label
                          htmlFor="login-password"
                          style={{
                            color: '#94a3b8',
                            fontSize: '12px',
                            fontWeight: 500,
                            letterSpacing: '0.05em',
                            textTransform: 'uppercase',
                          }}
                        >
                          Password
                        </label>
                        <button
                          type="button"
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#3b82f6',
                            fontSize: '13px',
                            cursor: 'pointer',
                            padding: 0,
                            textDecoration: 'none',
                          }}
                          onMouseEnter={(e) =>
                            ((e.target as HTMLButtonElement).style.textDecoration = 'underline')
                          }
                          onMouseLeave={(e) =>
                            ((e.target as HTMLButtonElement).style.textDecoration = 'none')
                          }
                        >
                          Forgot?
                        </button>
                      </div>
                      <div className="lf-field" style={{ position: 'relative' }}>
                        <div
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            height: '100%',
                            paddingLeft: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            pointerEvents: 'none',
                          }}
                        >
                          <Lock
                            size={17}
                            className="lf-icon"
                            style={{
                              color: fieldErrors.password ? '#f87171' : '#475569',
                              transition: 'color 0.2s',
                            }}
                          />
                        </div>
                        <input
                          id="login-password"
                          type="password"
                          value={password}
                          onChange={(e) => {
                            setPassword(e.target.value);
                            if (fieldErrors.password)
                              setFieldErrors((fe) => ({ ...fe, password: undefined }));
                          }}
                          placeholder="Min. 8 characters"
                          className={`lf-input${fieldErrors.password ? ' error' : ''}`}
                          autoComplete="current-password"
                        />
                      </div>
                      {fieldErrors.password && (
                        <p
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            color: '#f87171',
                            fontSize: '12px',
                            marginTop: '6px',
                          }}
                        >
                          <AlertCircle size={12} /> {fieldErrors.password}
                        </p>
                      )}
                    </div>

                    {/* Server error */}
                    {serverError && (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          color: '#f87171',
                          fontSize: '13px',
                          background: 'rgba(248,113,113,0.08)',
                          border: '1px solid rgba(248,113,113,0.2)',
                          borderRadius: '10px',
                          padding: '10px 14px',
                        }}
                      >
                        <AlertCircle size={14} style={{ flexShrink: 0 }} />
                        {serverError}
                      </div>
                    )}
                  </div>

                  {/* Sign-in button */}
                  <div className="lf-anim-btn" style={{ marginTop: '24px' }}>
                    <button
                      id="login-submit"
                      type="submit"
                      disabled={isLoading}
                      className="lf-submit"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                          Signing in…
                        </>
                      ) : (
                        'Sign In'
                      )}
                    </button>
                  </div>
                </form>

                {/* ── Divider ─────────────────────────────────────── */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    margin: '24px 0',
                  }}
                >
                  <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
                  <span style={{ color: '#475569', fontSize: '12px', whiteSpace: 'nowrap' }}>
                    Or continue with
                  </span>
                  <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
                </div>

                {/* ── OAuth buttons ───────────────────────────────── */}
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button type="button" className="lf-oauth" aria-label="Sign in with Google">
                    <Chrome size={16} />
                    Google
                  </button>
                  <button type="button" className="lf-oauth" aria-label="Sign in with GitHub">
                    <Github size={16} />
                    GitHub
                  </button>
                </div>

                {/* ── Footer link ─────────────────────────────────── */}
                <p
                  style={{
                    textAlign: 'center',
                    marginTop: '24px',
                    color: '#64748b',
                    fontSize: '14px',
                  }}
                >
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => navigate('/register')}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#3b82f6',
                      fontWeight: 500,
                      cursor: 'pointer',
                      padding: 0,
                      fontSize: '14px',
                    }}
                  >
                    Create one
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginScreen;
