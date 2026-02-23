
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import { authService } from '../services/authService';
import { useAuthStore } from '../store/authStore';

const LOGO_URL = "/assets/logo.png";

const RegisterScreen: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setUser = useAuthStore(state => state.setUser);

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

    // Password Strength Check
    if (strength < 2) {
       setError("Password is too weak. Include numbers or uppercase letters.");
       return;
    }
    
    setIsLoading(true);
    
    try {
       const res = await authService.register(formData.name, formData.email, formData.password);
       
       if (res.success && res.user) {
          setUser(res.user);
          navigate('/home');
       } else {
          setError(res.message || "Registration failed");
       }
    } catch (err) {
       setError("An unexpected error occurred");
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
          <form onSubmit={handleRegister} className="space-y-5">
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
        </GlassCard>

        <div className="mt-8 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">
                Already have an account? 
                <button onClick={() => navigate('/')} className="text-primary font-semibold hover:text-blue-500 transition-colors ml-1">Sign In</button>
            </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterScreen;
