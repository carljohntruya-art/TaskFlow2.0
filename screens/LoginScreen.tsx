import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import { authService } from '../services/authService';
import { useAuthStore } from '../store/authStore';

const LOGO_URL = '/assets/logo.png';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const LoginScreen: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Inline field errors
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  const setUser = useAuthStore(state => state.setUser);

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

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-slate-50 dark:bg-[#0f172a] py-10">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[300px] h-[300px] bg-primary/20 rounded-full blur-[100px] opacity-60 dark:opacity-30"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[300px] h-[300px] bg-cyan-500/20 rounded-full blur-[100px] opacity-60 dark:opacity-30"></div>
      </div>

      <div className="w-full max-w-md p-6 relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="relative inline-flex items-center justify-center mb-6">
            {/* PRO Badge */}
            <div
              className="absolute -top-2 -right-2 z-20 px-2 py-0.5 rounded-full text-white font-bold tracking-wider shadow-lg"
              style={{
                background: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
                fontSize: '10px',
                boxShadow: '0 2px 8px rgba(59, 130, 246, 0.5)',
              }}
            >
              PRO
            </div>

            {/* Logo Container */}
            <div
              className="w-20 h-20 flex items-center justify-center overflow-hidden border"
              style={{
                background: 'linear-gradient(to bottom, #1e3a5f, #0f2340)',
                borderColor: 'rgba(255, 255, 255, 0.15)',
                borderRadius: '20px',
                boxShadow:
                  '0 0 0 1px rgba(99, 179, 255, 0.2), 0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255,255,255,0.08)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                padding: '16px',
                animation: 'logoFloat 3s ease-in-out infinite',
              }}
            >
              <img
                src={LOGO_URL}
                alt="TaskFlow Logo"
                className="w-full h-full object-contain"
                style={{ filter: 'drop-shadow(0 2px 8px rgba(99, 179, 255, 0.4))' }}
              />
            </div>
          </div>

          <style>{`
            @keyframes logoFloat {
              0%, 100% { transform: translateY(0px); }
              50% { transform: translateY(-4px); }
            }
          `}</style>

          <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Welcome Back</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 text-center">
            Enter your details to access your account
          </p>
        </div>

        <GlassCard className="rounded-3xl p-8 backdrop-blur-2xl border border-white/40 dark:border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          <form onSubmit={handleLogin} className="space-y-5" noValidate>
            {/* Email Field */}
            <div className="space-y-1">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail
                    size={18}
                    className={`transition-colors ${fieldErrors.email ? 'text-red-400' : 'text-slate-400 group-focus-within:text-primary'}`}
                  />
                </div>
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (fieldErrors.email) setFieldErrors(fe => ({ ...fe, email: undefined }));
                  }}
                  placeholder="Email Address"
                  className={`block w-full pl-11 pr-4 py-3.5 bg-slate-100/50 dark:bg-black/20 border rounded-xl text-sm placeholder-slate-400 text-slate-900 dark:text-white focus:outline-none focus:ring-2 transition-all duration-300 ${
                    fieldErrors.email
                      ? 'border-red-400 focus:ring-red-400/30'
                      : 'border-slate-200 dark:border-white/10 focus:ring-primary/50 focus:border-primary'
                  }`}
                  autoComplete="email"
                />
              </div>
              {fieldErrors.email && (
                <p className="flex items-center gap-1 text-red-400 text-xs pl-1">
                  <AlertCircle size={12} /> {fieldErrors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-1">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock
                    size={18}
                    className={`transition-colors ${fieldErrors.password ? 'text-red-400' : 'text-slate-400 group-focus-within:text-primary'}`}
                  />
                </div>
                <input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password) setFieldErrors(fe => ({ ...fe, password: undefined }));
                  }}
                  placeholder="Password"
                  className={`block w-full pl-11 pr-4 py-3.5 bg-slate-100/50 dark:bg-black/20 border rounded-xl text-sm placeholder-slate-400 text-slate-900 dark:text-white focus:outline-none focus:ring-2 transition-all duration-300 ${
                    fieldErrors.password
                      ? 'border-red-400 focus:ring-red-400/30'
                      : 'border-slate-200 dark:border-white/10 focus:ring-primary/50 focus:border-primary'
                  }`}
                  autoComplete="current-password"
                />
              </div>
              {fieldErrors.password && (
                <p className="flex items-center gap-1 text-red-400 text-xs pl-1">
                  <AlertCircle size={12} /> {fieldErrors.password}
                </p>
              )}
            </div>

            {/* Server Error */}
            {serverError && (
              <div className="flex items-center gap-2 text-red-400 text-xs bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
                <AlertCircle size={14} className="shrink-0" />
                {serverError}
              </div>
            )}

            <button
              id="login-submit"
              disabled={isLoading}
              type="submit"
              className="w-full group relative overflow-hidden bg-linear-to-r from-primary to-blue-600 hover:from-blue-600 hover:to-primary text-white font-semibold flex items-center justify-center py-4 rounded-xl shadow-lg shadow-primary/20 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:scale-100"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  Sign In
                  <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </GlassCard>

        <div className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
          Don't have an account?{' '}
          <button
            onClick={() => navigate('/register')}
            className="text-primary font-semibold hover:text-blue-500 transition-colors ml-1"
          >
            Create one
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
