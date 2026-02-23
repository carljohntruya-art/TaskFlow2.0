import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Lock, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import { authService } from '../services/authService';
import { useAuthStore } from '../store/authStore';

const LOGO_URL = '/assets/logo.png';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const RegisterScreen: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; email?: string; password?: string }>({});

  const setUser = useAuthStore(state => state.setUser);

  // Password Strength Logic
  const getPasswordStrength = (pass: string) => {
    let strength = 0;
    if (pass.length > 7) strength++;
    if (/[A-Z]/.test(pass)) strength++;
    if (/[0-9]/.test(pass)) strength++;
    if (/[^A-Za-z0-9]/.test(pass)) strength++;
    return strength;
  };

  const strength = getPasswordStrength(formData.password);
  const strengthColor = ['bg-slate-700', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500'][strength] ?? 'bg-slate-700';

  const validate = (): boolean => {
    const errors: { name?: string; email?: string; password?: string } = {};

    if (!formData.name.trim()) {
      errors.name = 'Full name is required.';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required.';
    } else if (!EMAIL_REGEX.test(formData.email)) {
      errors.email = 'Enter a valid email address.';
    }

    if (!formData.password) {
      errors.password = 'Password is required.';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters.';
    } else if (strength < 2) {
      errors.password = 'Too weak — add uppercase letters or numbers.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (field: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    if (fieldErrors[field]) setFieldErrors(fe => ({ ...fe, [field]: undefined }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!validate()) return;

    setIsLoading(true);
    try {
      const res = await authService.register(formData.name, formData.email, formData.password);

      if (res.success && res.user) {
        setUser(res.user);
        navigate('/home');
      } else {
        setServerError(res.message || 'Registration failed. Please try again.');
      }
    } catch {
      setServerError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-slate-50 dark:bg-[#0f172a] py-10">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[10%] right-[10%] w-[300px] h-[300px] bg-blue-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-60 dark:opacity-30"></div>
        <div className="absolute bottom-[10%] left-[10%] w-[300px] h-[300px] bg-indigo-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-60 dark:opacity-30"></div>
      </div>

      <div className="w-full max-w-md p-6 relative z-10">
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 bg-linear-to-tr from-white/10 to-white/5 rounded-2xl backdrop-blur-md border border-white/20 flex items-center justify-center shadow-xl mb-6 p-3">
            <img src={LOGO_URL} alt="TaskFlow Logo" className="w-full h-full object-contain" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight text-center">
            Create Account
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 text-center">
            Join thousands of teams using TaskFlow
          </p>
        </div>

        {/* Register Card */}
        <GlassCard className="rounded-3xl p-8 backdrop-blur-2xl border border-white/40 dark:border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          <form onSubmit={handleRegister} className="space-y-5" noValidate>

            {/* Name */}
            <div className="space-y-1">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User
                    size={18}
                    className={`transition-colors ${fieldErrors.name ? 'text-red-400' : 'text-slate-400 group-focus-within:text-primary'}`}
                  />
                </div>
                <input
                  id="register-name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange('name')}
                  placeholder="Full Name"
                  className={`block w-full pl-11 pr-4 py-3.5 bg-slate-100/50 dark:bg-black/20 border rounded-xl text-sm placeholder-slate-400 text-slate-900 dark:text-white focus:outline-none focus:ring-2 transition-all duration-300 ${
                    fieldErrors.name
                      ? 'border-red-400 focus:ring-red-400/30'
                      : 'border-slate-200 dark:border-white/10 focus:ring-primary/50 focus:border-primary'
                  }`}
                  autoComplete="name"
                />
              </div>
              {fieldErrors.name && (
                <p className="flex items-center gap-1 text-red-400 text-xs pl-1">
                  <AlertCircle size={12} /> {fieldErrors.name}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-1">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail
                    size={18}
                    className={`transition-colors ${fieldErrors.email ? 'text-red-400' : 'text-slate-400 group-focus-within:text-primary'}`}
                  />
                </div>
                <input
                  id="register-email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange('email')}
                  placeholder="name@company.com"
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

            {/* Password */}
            <div className="space-y-2">
              <div className="space-y-1">
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock
                      size={18}
                      className={`transition-colors ${fieldErrors.password ? 'text-red-400' : 'text-slate-400 group-focus-within:text-primary'}`}
                    />
                  </div>
                  <input
                    id="register-password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange('password')}
                    placeholder="Create a strong password (min 8 chars)"
                    className={`block w-full pl-11 pr-4 py-3.5 bg-slate-100/50 dark:bg-black/20 border rounded-xl text-sm placeholder-slate-400 text-slate-900 dark:text-white focus:outline-none focus:ring-2 transition-all duration-300 ${
                      fieldErrors.password
                        ? 'border-red-400 focus:ring-red-400/30'
                        : 'border-slate-200 dark:border-white/10 focus:ring-primary/50 focus:border-primary'
                    }`}
                    autoComplete="new-password"
                  />
                </div>
                {fieldErrors.password && (
                  <p className="flex items-center gap-1 text-red-400 text-xs pl-1">
                    <AlertCircle size={12} /> {fieldErrors.password}
                  </p>
                )}
              </div>

              {/* Password Strength Meter */}
              {formData.password && (
                <div className="flex gap-1 h-1">
                  {[0, 1, 2, 3].map(i => (
                    <div
                      key={i}
                      className={`flex-1 rounded-full transition-colors ${strength > i ? strengthColor : 'bg-slate-200 dark:bg-white/10'}`}
                    />
                  ))}
                </div>
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
              id="register-submit"
              disabled={isLoading}
              type="submit"
              className="w-full group relative overflow-hidden bg-linear-to-r from-primary to-blue-600 hover:from-blue-600 hover:to-primary text-white font-semibold py-4 rounded-xl shadow-lg shadow-primary/20 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:scale-100"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {isLoading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    Get Started
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </span>
            </button>
          </form>
        </GlassCard>

        <div className="mt-8 text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Already have an account?{' '}
            <button
              onClick={() => navigate('/')}
              className="text-primary font-semibold hover:text-blue-500 transition-colors ml-1"
            >
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterScreen;
