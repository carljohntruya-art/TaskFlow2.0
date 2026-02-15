import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MoreVertical, Edit2, User, Bell, Palette, ChevronRight, LogOut, Settings, ShieldCheck } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import { User as UserType } from '../types';

interface ProfileScreenProps {
  user: UserType | null;
  onLogout: () => void;
}


const ProfileScreen: React.FC<ProfileScreenProps> = ({ user, onLogout }) => {
  const navigate = useNavigate();
  // Fallback if user is null (shouldn't happen in flow, but safe)
  const userData = user || { name: 'Guest', email: 'guest@taskflow.com', role: 'user', avatar: 'https://picsum.photos/200' };

  return (
    <div className="px-6 pt-6 pb-24">
      {/* Header */}
      <header className="flex items-center justify-between py-5 sticky top-0 z-50 glass-panel border-b border-white/5 -mx-6 px-6 bg-[#101622]/80 backdrop-blur-md">
         <button onClick={() => navigate('/home')} className="p-2 -ml-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white">
            <ArrowLeft size={24} />
         </button>
         <h1 className="font-bold text-lg tracking-tight text-white">Profile Settings</h1>
         <button className="p-2 -mr-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white">
            <MoreVertical size={24} />
         </button>
      </header>

      {/* Avatar Section */}
      <div className="flex flex-col items-center mt-8 mb-8">
         <div className="relative group cursor-pointer">
            <div className="w-28 h-28 rounded-full p-1 bg-linear-to-br from-primary/80 to-cyan-400/80 shadow-[0_0_20px_rgba(37,106,244,0.4)]">
               <img src={userData.avatar} alt="Avatar" className="w-full h-full object-cover rounded-full border-4 border-background-dark" />
            </div>
            <div className="absolute bottom-1 right-1 bg-background-dark rounded-full p-1.5 border border-white/10 shadow-lg">
               <Edit2 size={14} className="text-white" />
            </div>
         </div>
         <h2 className="mt-4 text-2xl font-bold text-white tracking-tight">{userData.name}</h2>
         <p className="text-slate-400 text-sm font-medium">{userData.email}</p>
         <div className="flex gap-3 mt-4">
            {userData.role === 'admin' && (
                <span className="px-3 py-1 rounded-full bg-primary/20 border border-primary/30 text-primary text-xs font-semibold shadow-[0_0_10px_rgba(37,106,244,0.3)]">Administrator</span>
            )}
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">Pro Plan</span>
         </div>
      </div>

      {/* Personal Info */}
      <GlassCard className="rounded-2xl p-6 mb-6">
         <div className="flex items-center gap-3 mb-5">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
               <User size={20} />
            </div>
            <h3 className="text-lg font-semibold text-white">Personal Information</h3>
         </div>
         <div className="space-y-5">
            <div className="space-y-1.5">
               <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">Full Name</label>
               <input type="text" defaultValue={userData.name} className="w-full bg-[#101622]/60 border border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-primary focus:border-primary text-white" />
            </div>
            <div className="space-y-1.5">
               <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">Bio</label>
               <textarea defaultValue="Product Designer focused on building clean and functional user interfaces." className="w-full bg-[#101622]/60 border border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-primary focus:border-primary text-white resize-none h-24" />
            </div>
         </div>
      </GlassCard>

      {/* Admin Access (Conditional) */}
      {userData.role === 'admin' && (
        <button 
            onClick={() => navigate('/admin')}
            className="w-full mb-3 flex items-center justify-between p-4 rounded-2xl bg-linear-to-r from-slate-800 to-slate-900 border border-primary/30 hover:border-primary/60 transition-all group shadow-[0_4px_20px_rgba(0,0,0,0.3)]"
        >
            <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/20 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                <ShieldCheck size={20} />
            </div>
            <div className="text-left">
                <span className="block font-semibold text-white group-hover:text-primary transition-colors">Admin Console</span>
                <span className="text-xs text-slate-400">Manage users & system health</span>
            </div>
            </div>
            <ChevronRight size={20} className="text-slate-500 group-hover:text-white transition-colors" />
        </button>
      )}

      {/* Project Settings Link */}
      <button 
        onClick={() => navigate('/settings')}
        className="w-full mb-6 flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400">
            <Settings size={20} />
          </div>
          <span className="font-semibold text-white">Project Settings</span>
        </div>
        <ChevronRight size={20} className="text-slate-500" />
      </button>

      {/* Notifications */}
      <GlassCard className="rounded-2xl p-6 mb-6">
         <div className="flex items-center gap-3 mb-5">
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
               <Bell size={20} />
            </div>
            <h3 className="text-lg font-semibold text-white">Notifications</h3>
         </div>
         <div className="space-y-4">
            <div className="flex items-center justify-between py-1">
               <div>
                  <p className="text-sm font-medium text-white">Email Notifications</p>
                  <p className="text-xs text-slate-400">Receive daily summaries</p>
               </div>
               <div className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
               </div>
            </div>
            <div className="w-full h-px bg-white/5"></div>
            <div className="flex items-center justify-between py-1">
               <div>
                  <p className="text-sm font-medium text-white">Push Alerts</p>
                  <p className="text-xs text-slate-400">Instant task updates</p>
               </div>
               <div className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
               </div>
            </div>
         </div>
      </GlassCard>

      {/* Logout */}
      <button 
        onClick={onLogout}
        className="w-full py-4 rounded-2xl border border-red-500/20 bg-red-500/5 text-red-500 font-medium hover:bg-red-500/10 transition-colors flex items-center justify-center gap-2"
      >
        <LogOut size={18} />
        Log Out
      </button>
    </div>
  );
};

export default ProfileScreen;