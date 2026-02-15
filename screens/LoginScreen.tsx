
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, ShieldCheck, Eye, EyeOff, Globe, Github, AlertCircle, Bot, RefreshCw, Clock } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import { User } from '../types';
import { authService } from '../services/authService';

interface LoginScreenProps {
  onLogin: (user: User) => void;
}

const LOGO_URL = "/assets/logo.png";


const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shake, setShake] = useState(false);
  const [isRateLimited, setIsRateLimited] = useState(false);
  
  // Adaptive Security State
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [showCaptcha, setShowCaptcha] = useState(false);
  const [captcha, setCaptcha] = useState({ num1: 0, num2: 0, answer: 0 });
  const [captchaInput, setCaptchaInput] = useState('');

  useEffect(() => {
    if (failedAttempts >= 2) {
        setShowCaptcha(true);
        generateCaptcha();
    }
  }, [failedAttempts]);

  const generateCaptcha = () => {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    setCaptcha({ num1, num2, answer: num1 + num2 });
    setCaptchaInput('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    // Check CAPTCHA if enabled
    if (showCaptcha) {
        if (parseInt(captchaInput) !== captcha.answer) {
            setError("Incorrect security code.");
            setShake(true);
            setTimeout(() => setShake(false), 500);
            generateCaptcha();
            return;
        }
    }

    setIsLoading(true);
    setError(null);
    setIsRateLimited(false);

    // Simulate Network Latency
    await new Promise(r => setTimeout(r, 800));

    const res = await authService.login(email, password);
    setIsLoading(false);

    if (res.success && res.user) {
       setFailedAttempts(0);
       onLogin(res.user);
    } else {
       // Check if it's a rate limit error based on message content
       if (res.message?.includes('Too many')) {
         setIsRateLimited(true);
       } else {
         const newFailCount = failedAttempts + 1;
         setFailedAttempts(newFailCount);
       }
       
       setError(res.message || "Login failed");
       setShake(true);
       setTimeout(() => setShake(false), 500);

       if (res.requiresVerification) {
         setError("Please verify your email address.");
       }
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-slate-50 dark:bg-[#0f172a] transition-colors duration-500">
      
      {/* Animated Background Orbs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-500/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob dark:opacity-40"></div>
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-cyan-500/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000 dark:opacity-40"></div>
        <div className="absolute -bottom-32 left-[20%] w-96 h-96 bg-pink-500/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000 dark:opacity-40"></div>
      </div>

      {/* Main Content Container */}
      <div className="w-full max-w-md p-6 relative z-10">
        
        {/* Header Section */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative mb-6 group">
             <div className="absolute inset-0 bg-linear-to-tr from-primary to-cyan-400 rounded-2xl blur-lg opacity-40 group-hover:opacity-60 transition-opacity duration-500"></div>
             <div className="relative w-24 h-24 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center shadow-2xl p-4">
               <img src={LOGO_URL} alt="TaskFlow Logo" className="w-full h-full object-contain drop-shadow-md" />
             </div>
             <div className="absolute -top-2 -right-2 bg-linear-to-r from-primary to-cyan-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg border border-white/20">
                PRO
             </div>
          </div>
          
          <h2 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white mb-2 text-center">Welcome Back</h2>
          <p className="text-slate-500 dark:text-slate-400 text-center text-sm">Sign in to access your workspace</p>
        </div>

        {/* Glass Card Form */}
        <GlassCard className={`rounded-3xl p-8 backdrop-blur-2xl border border-white/40 dark:border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] ${shake ? 'animate-shake border-red-500/50' : ''}`}>
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Error Banner */}
            {error && (
               <div className={`p-3 rounded-lg border flex items-start gap-2 text-xs font-medium animate-[fadeIn_0.2s_ease-out] ${isRateLimited ? 'bg-orange-500/10 border-orange-500/20 text-orange-500' : 'bg-red-500/10 border-red-500/20 text-red-500'}`}>
                  {isRateLimited ? <Clock size={16} className="shrink-0 mt-0.5" /> : <AlertCircle size={16} className="shrink-0 mt-0.5" />}
                  <span>{error}</span>
               </div>
            )}

            {/* Email Input */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Email</label>
              <div className="group relative transition-all duration-300">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail size={18} className="text-slate-400 group-focus-within:text-primary transition-colors" />
                </div>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3.5 bg-slate-100/50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl text-sm placeholder-slate-400 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-300" 
                  placeholder="name@taskflow.com" 
                  required 
                  disabled={isRateLimited}
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Password</label>
                <a href="#" className="text-xs font-medium text-primary hover:text-cyan-400 transition-colors">Forgot?</a>
              </div>
              <div className="group relative transition-all duration-300">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock size={18} className="text-slate-400 group-focus-within:text-primary transition-colors" />
                </div>
                <input 
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-11 pr-11 py-3.5 bg-slate-100/50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl text-sm placeholder-slate-400 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-300" 
                  placeholder="••••••••" 
                  required 
                  disabled={isRateLimited}
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Adaptive CAPTCHA */}
            {showCaptcha && !isRateLimited && (
              <div className="space-y-2 animate-[slideDown_0.3s_ease-out]">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Security Check</label>
                  <div className="bg-slate-100/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                         <Bot size={18} />
                      </div>
                      <div className="flex items-center gap-2">
                         <span className="text-sm font-bold text-slate-900 dark:text-white font-mono">{captcha.num1} + {captcha.num2} = </span>
                         <input 
                            type="number" 
                            value={captchaInput}
                            onChange={(e) => setCaptchaInput(e.target.value)}
                            className="w-16 bg-white dark:bg-black/20 border border-slate-300 dark:border-white/10 rounded-lg px-2 py-1 text-center font-bold text-slate-900 dark:text-white focus:ring-1 focus:ring-primary outline-none"
                         />
                         <button type="button" onClick={generateCaptcha} className="p-1.5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-full text-slate-500 transition-colors">
                            <RefreshCw size={14} />
                         </button>
                      </div>
                  </div>
              </div>
            )}

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={isLoading || isRateLimited}
              className="w-full group relative overflow-hidden bg-linear-to-r from-primary to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold py-4 rounded-xl shadow-lg shadow-primary/25 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {isLoading ? 'Authenticating...' : (isRateLimited ? 'Locked' : 'Sign In')}
                {!isLoading && !isRateLimited && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
              </span>
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            </button>
            
            {/* Divider */}
            <div className="relative flex py-2 items-center">
              <div className="grow border-t border-slate-300 dark:border-white/10"></div>
              <span className="shrink-0 mx-4 text-xs font-medium text-slate-400">Or continue with</span>
              <div className="grow border-t border-slate-300 dark:border-white/10"></div>
            </div>

            {/* Social Login */}
            <div className="grid grid-cols-2 gap-4">
              <button type="button" disabled={isRateLimited} className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors disabled:opacity-50">
                 <Globe size={18} className="text-slate-700 dark:text-white" />
                 <span className="text-sm font-medium text-slate-700 dark:text-white">Google</span>
              </button>
              <button type="button" disabled={isRateLimited} className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors disabled:opacity-50">
                 <Github size={18} className="text-slate-700 dark:text-white" />
                 <span className="text-sm font-medium text-slate-700 dark:text-white">GitHub</span>
              </button>
            </div>

          </form>
        </GlassCard>

        {/* Footer */}
        <div className="mt-8 text-center space-y-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Don't have an account? 
            <button onClick={() => navigate('/register')} className="text-primary font-semibold hover:text-cyan-500 transition-colors ml-1">Create Account</button>
          </p>
        </div>

      </div>
    </div>
  );
};

export default LoginScreen;
