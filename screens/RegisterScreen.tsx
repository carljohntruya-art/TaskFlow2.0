
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Lock, ArrowRight, Shield, Loader2, RefreshCw, Bot, AlertTriangle } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import { User as UserType } from '../types';
import { authService } from '../services/authService';

interface RegisterScreenProps {
  onLogin: (user: UserType) => void;
}

const LOGO_URL = "/asssets/logo.png";

const RegisterScreen: React.FC<RegisterScreenProps> = ({ onLogin }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState<'register' | 'verify'>('register');
  const [formData, setFormData] = useState({ name: '', email: '', password: '', honeypot: '' });
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFirstUser, setIsFirstUser] = useState(false);

  // Math CAPTCHA State
  const [captcha, setCaptcha] = useState({ num1: 0, num2: 0, answer: 0 });
  const [captchaInput, setCaptchaInput] = useState('');

  useEffect(() => {
    generateCaptcha();
    // Check if this is the first user
    const users = authService.getAllUsers();
    setIsFirstUser(users.length === 0);
  }, []);

  const generateCaptcha = () => {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    setCaptcha({ num1, num2, answer: num1 + num2 });
    setCaptchaInput('');
  };

  // Password Strength Logic
  const getPasswordStrength = (pass: string) => {
    let strength = 0;
    if (pass.length > 7) strength++; // Length
    if (/[A-Z]/.test(pass)) strength++; // Uppercase
    if (/[0-9]/.test(pass)) strength++; // Number
    if (/[^A-Za-z0-9]/.test(pass)) strength++; // Special char
    return strength;
  };
  
  const strength = getPasswordStrength(formData.password);
  const strengthColor = ['bg-slate-700', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500'][strength] || 'bg-slate-700';

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // 1. Honeypot Check (Silent Fail for Bots)
    if (formData.honeypot !== '') {
       console.warn("Bot detected via honeypot.");
       // Fake success to confuse bot
       return; 
    }

    // 2. Math CAPTCHA Check
    if (parseInt(captchaInput) !== captcha.answer) {
        setError("Incorrect math answer. Are you human?");
        generateCaptcha();
        return;
    }

    // 3. Password Strength Check
    if (strength < 2) {
       setError("Password is too weak. Include numbers or uppercase letters.");
       return;
    }
    
    setIsLoading(true);
    
    try {
       // Simulate network delay
       await new Promise(r => setTimeout(r, 1000));
       const res = await authService.register(formData.name, formData.email, formData.password);
       
       if (res.success && res.requiresVerification) {
          setStep('verify');
       } else {
          setError(res.message || "Registration failed");
       }
    } catch (err) {
       setError("An unexpected error occurred");
    } finally {
       setIsLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    const code = verificationCode.join('');
    // Simulate network delay
    await new Promise(r => setTimeout(r, 800));
    
    const res = authService.verifyEmail(formData.email, code);
    
    setIsLoading(false);
    if (res.success && res.user) {
       onLogin(res.user);
    } else {
       setError(res.message || "Invalid code");
    }
  };

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) return; // Only allow 1 char
    const newCode = [...verificationCode];
    newCode[index] = value;
    setVerificationCode(newCode);

    // Auto focus next
    if (value && index < 5) {
       const nextInput = document.getElementById(`otp-${index + 1}`);
       nextInput?.focus();
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-slate-50 dark:bg-[#0f172a] py-10">
      
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[10%] right-[10%] w-120 h-120 bg-blue-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob dark:opacity-30"></div>
        <div className="absolute bottom-[10%] left-[10%] w-100 h-100 bg-indigo-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob animation-delay-2000 dark:opacity-30"></div>
      </div>

      <div className="w-full max-w-md p-6 relative z-10">
        
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
           <div className="w-20 h-20 bg-linear-to-tr from-white/10 to-white/5 rounded-2xl backdrop-blur-md border border-white/20 flex items-center justify-center shadow-xl mb-6 p-3">
              <img src={LOGO_URL} alt="TaskFlow Logo" className="w-full h-full object-contain" />
           </div>
           <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight text-center">
             {step === 'register' ? 'Create Account' : 'Verify Email'}
           </h2>
           <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 text-center">
             {step === 'register' ? 'Join thousands of teams using TaskFlow' : `We sent a code to ${formData.email}`}
           </p>
        </div>

        {/* Register Card */}
        <GlassCard className="rounded-3xl p-8 backdrop-blur-2xl border border-white/40 dark:border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          
          {step === 'register' ? (
            <form onSubmit={handleRegister} className="space-y-5">
              
              {isFirstUser && (
                <div className="bg-amber-500/10 border border-amber-500/20 text-amber-500 p-3 rounded-xl text-xs flex items-start gap-2">
                    <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                    <p><strong>System Initialization:</strong> You are the first user. This account will be assigned <strong>Administrator</strong> privileges.</p>
                </div>
              )}

              {/* HONEYPOT FIELD (Invisible to humans) */}
              <div className="opacity-0 absolute -z-10 h-0 w-0 overflow-hidden">
                <input 
                  type="text" 
                  name="role_check" 
                  tabIndex={-1}
                  autoComplete="off"
                  value={formData.honeypot}
                  onChange={(e) => setFormData({...formData, honeypot: e.target.value})}
                />
              </div>

              {/* Name */}
              <div className="relative group">
                 <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User size={18} className="text-slate-400 group-focus-within:text-primary transition-colors" />
                 </div>
                 <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Full Name" 
                    className="block w-full pl-11 pr-4 py-3.5 bg-slate-100/50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl text-sm placeholder-slate-400 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-300" 
                    required 
                 />
              </div>

              {/* Email */}
              <div className="relative group">
                 <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail size={18} className="text-slate-400 group-focus-within:text-primary transition-colors" />
                 </div>
                 <input 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="name@company.com" 
                    className="block w-full pl-11 pr-4 py-3.5 bg-slate-100/50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl text-sm placeholder-slate-400 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-300" 
                    required 
                 />
              </div>

              {/* Password */}
              <div className="space-y-2">
                 <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                       <Lock size={18} className="text-slate-400 group-focus-within:text-primary transition-colors" />
                    </div>
                    <input 
                       type="password" 
                       value={formData.password}
                       onChange={(e) => setFormData({...formData, password: e.target.value})}
                       placeholder="Create a strong password" 
                       className="block w-full pl-11 pr-11 py-3.5 bg-slate-100/50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl text-sm placeholder-slate-400 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-300" 
                       required 
                    />
                 </div>
                 {/* Password Strength Meter */}
                 {formData.password && (
                    <div className="flex gap-1 h-1">
                       <div className={`flex-1 rounded-full transition-colors ${strength > 0 ? strengthColor : 'bg-slate-200 dark:bg-white/10'}`}></div>
                       <div className={`flex-1 rounded-full transition-colors ${strength > 1 ? strengthColor : 'bg-slate-200 dark:bg-white/10'}`}></div>
                       <div className={`flex-1 rounded-full transition-colors ${strength > 2 ? strengthColor : 'bg-slate-200 dark:bg-white/10'}`}></div>
                       <div className={`flex-1 rounded-full transition-colors ${strength > 3 ? strengthColor : 'bg-slate-200 dark:bg-white/10'}`}></div>
                    </div>
                 )}
              </div>

              {/* Bot Protection Challenge */}
              <div className="bg-slate-100/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                     <Bot size={18} />
                     <span className="text-xs font-semibold uppercase tracking-wider">Human Check</span>
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
              
              {error && <p className="text-red-500 text-xs text-center">{error}</p>}

              <button disabled={isLoading} type="submit" className="w-full group relative overflow-hidden bg-linear-to-r from-primary to-blue-600 hover:from-blue-600 hover:to-primary text-white font-semibold py-4 rounded-xl shadow-lg shadow-primary/20 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70">
                 <span className="relative z-10 flex items-center justify-center gap-2">
                    {isLoading ? <Loader2 className="animate-spin" size={20} /> : (
                        <>
                            Get Started
                            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </>
                    )}
                 </span>
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerify} className="space-y-6">
               <div className="flex justify-between gap-2">
                  {verificationCode.map((digit, idx) => (
                     <input
                        key={idx}
                        id={`otp-${idx}`}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleCodeChange(idx, e.target.value)}
                        className="w-12 h-14 text-center text-xl font-bold rounded-xl bg-slate-100/50 dark:bg-black/20 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                     />
                  ))}
               </div>
               
               <div className="text-center text-xs text-slate-500 dark:text-slate-400">
                  <p>Check your console log for the code (Demo Mode)</p>
               </div>

               {error && <p className="text-red-500 text-xs text-center">{error}</p>}

               <button disabled={isLoading} type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-4 rounded-xl shadow-lg shadow-emerald-500/20 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 flex justify-center items-center gap-2">
                  {isLoading ? <Loader2 className="animate-spin" /> : (
                     <>
                        <Shield size={18} />
                        Verify Securely
                     </>
                  )}
               </button>
               
               <button type="button" onClick={() => setStep('register')} className="w-full text-center text-xs text-slate-400 hover:text-white transition-colors">
                  Back to Registration
               </button>
            </form>
          )}

        </GlassCard>

        {step === 'register' && (
            <div className="mt-8 text-center">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    Already have an account? 
                    <button onClick={() => navigate('/')} className="text-primary font-semibold hover:text-blue-500 transition-colors ml-1">Sign In</button>
                </p>
            </div>
        )}
      </div>
    </div>
  );
};

export default RegisterScreen;
