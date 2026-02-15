import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Activity, Shield, AlertTriangle, Server, Lock, Zap, Terminal } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar } from 'recharts';
import { rateLimitService } from '../services/rateLimitService';
import { authService } from '../services/authService';


const CHART_DATA = [
  { time: '00:00', active: 120, load: 24, blocked: 2 },
  { time: '04:00', active: 80, load: 15, blocked: 0 },
  { time: '08:00', active: 250, load: 45, blocked: 5 },
  { time: '12:00', active: 980, load: 88, blocked: 12 },
  { time: '16:00', active: 850, load: 76, blocked: 8 },
  { time: '20:00', active: 400, load: 50, blocked: 4 },
  { time: '23:59', active: 180, load: 30, blocked: 1 },
];


const AdminDashboardScreen: React.FC = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<any[]>([]);
  const [filter, setFilter] = useState<'all' | 'online' | 'offline'>('all');
  const [serverLoad, setServerLoad] = useState(42);
  const [securityStats, setSecurityStats] = useState({ totalBlocked: 0, activeWindows: 0, logs: [] as any[] });

  // Simulate real-time updates and fetch security stats
  useEffect(() => {
    const fetchStats = () => {
        const stats = rateLimitService.getStats();
        setSecurityStats(stats);
        
        // Fetch users from Auth Service
        const allUsers = authService.getAllUsers();
        // Add mock status since our user model doesn't store presence
        const enrichedUsers = allUsers.map(u => ({
            ...u,
            status: Math.random() > 0.3 ? 'online' : 'offline'
        }));
        setUsers(enrichedUsers);
    };

    fetchStats(); // Initial fetch

    const interval = setInterval(() => {
      // Fluctuate server load
      setServerLoad(prev => {
        const change = Math.floor(Math.random() * 10) - 5; 
        const next = prev + change;
        return Math.min(Math.max(next, 20), 95);
      });

      // Refresh security stats
      const stats = rateLimitService.getStats();
      setSecurityStats(stats);

    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const filteredUsers = users.filter(u => filter === 'all' ? true : u.status === filter);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#101622] relative overflow-hidden flex flex-col transition-colors duration-300">
      
      {/* Header */}
      <header className="px-6 py-5 flex items-center justify-between sticky top-0 z-50 bg-[#101622]/80 backdrop-blur-md border-b border-white/5">
        <div className="flex items-center gap-3">
           <button onClick={() => navigate('/profile')} className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
              <ArrowLeft size={24} />
           </button>
           <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
             <Shield size={20} className="text-primary" />
             Admin Console
           </h1>
        </div>
        <div className="flex items-center gap-2">
           <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
           <span className="text-xs font-mono text-emerald-500">LIVE</span>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto hide-scrollbar p-6 space-y-6">
        
        {/* Top Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
           <GlassCard className="p-4 rounded-xl flex flex-col justify-between h-32 relative overflow-hidden group">
              <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                 <Users size={48} className="text-primary" />
              </div>
              <div className="p-2 w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                 <Users size={20} />
              </div>
              <div>
                 <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{users.length}</h3>
                 <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Users</p>
              </div>
           </GlassCard>

           <GlassCard className="p-4 rounded-xl flex flex-col justify-between h-32 relative overflow-hidden group">
              <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                 <Lock size={48} className="text-red-500" />
              </div>
              <div className="p-2 w-10 h-10 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center">
                 <AlertTriangle size={20} />
              </div>
              <div>
                 <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{securityStats.totalBlocked}</h3>
                 <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Blocked Requests</p>
              </div>
           </GlassCard>

           <GlassCard className="p-4 rounded-xl flex flex-col justify-between h-32 relative overflow-hidden group">
              <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                 <Server size={48} className={serverLoad > 80 ? 'text-red-500' : 'text-orange-500'} />
              </div>
              <div className={`p-2 w-10 h-10 rounded-lg flex items-center justify-center ${serverLoad > 80 ? 'bg-red-500/10 text-red-500' : 'bg-orange-500/10 text-orange-500'}`}>
                 <Server size={20} />
              </div>
              <div>
                 <h3 className={`text-3xl font-bold ${serverLoad > 80 ? 'text-red-500' : 'text-slate-900 dark:text-white'}`}>{serverLoad}%</h3>
                 <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Rate Limits Active</p>
              </div>
              {/* Progress Bar */}
              <div className="absolute bottom-0 left-0 w-full h-1 bg-slate-200 dark:bg-white/5">
                 <div className={`h-full transition-all duration-1000 ${serverLoad > 80 ? 'bg-red-500' : 'bg-orange-500'}`} style={{ width: `${serverLoad}%` }}></div>
              </div>
           </GlassCard>

           <GlassCard className="p-4 rounded-xl flex flex-col justify-between h-32 relative overflow-hidden group">
              <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                 <Zap size={48} className="text-cyan-500" />
              </div>
              <div className="p-2 w-10 h-10 rounded-lg bg-cyan-500/10 text-cyan-500 flex items-center justify-center">
                 <Zap size={20} />
              </div>
              <div>
                 <h3 className="text-3xl font-bold text-slate-900 dark:text-white">99.9%</h3>
                 <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Uptime</p>
              </div>
           </GlassCard>
        </div>

        {/* Analytics Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <GlassCard className="rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-900 dark:text-white">Traffic & Abuse</h3>
            </div>
            <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={CHART_DATA}>
                        <defs>
                        <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#256af4" stopOpacity={0.5}/>
                            <stop offset="95%" stopColor="#256af4" stopOpacity={0}/>
                        </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff10" />
                        <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10}} />
                        <Tooltip 
                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #ffffff10', borderRadius: '8px', color: '#fff' }}
                        itemStyle={{ color: '#fff' }}
                        />
                        <Area type="monotone" dataKey="active" stroke="#256af4" strokeWidth={2} fillOpacity={1} fill="url(#colorActive)" />
                        <Area type="step" dataKey="blocked" stroke="#ef4444" strokeWidth={2} fill="transparent" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
            </GlassCard>

            {/* Security Logs */}
            <div className="bg-black/90 rounded-xl p-4 font-mono text-xs border border-white/10 shadow-inner flex flex-col">
                <div className="flex items-center justify-between mb-3 text-slate-400 border-b border-white/10 pb-2">
                    <div className="flex items-center gap-2">
                        <Terminal size={14} />
                        <span>Security Event Log</span>
                    </div>
                    <span className="text-[10px] bg-red-500/20 text-red-400 px-1.5 rounded">{securityStats.logs.length} Events</span>
                </div>
                <div className="space-y-1.5 flex-1 overflow-y-auto hide-scrollbar max-h-48">
                    {securityStats.logs.map((log, i) => (
                        <div key={log.id} className="truncate animate-[fadeIn_0.2s_ease-out] flex gap-2">
                            <span className="text-slate-600">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                            <span className={`${
                                log.type === 'rate_limit' ? 'text-orange-400' : 
                                log.type === 'suspicious_activity' ? 'text-red-400' : 'text-slate-300'
                            }`}>
                                {log.message}
                            </span>
                        </div>
                    ))}
                    {securityStats.logs.length === 0 && (
                        <div className="text-slate-600 italic">No security events recorded.</div>
                    )}
                </div>
            </div>
        </div>

        {/* User Monitoring */}
        <div className="space-y-4">
           <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-900 dark:text-white">User Monitoring</h3>
              <div className="flex bg-slate-200 dark:bg-white/5 p-0.5 rounded-lg">
                 {(['all', 'online', 'offline'] as const).map(tab => (
                    <button
                       key={tab}
                       onClick={() => setFilter(tab)}
                       className={`px-3 py-1 text-xs font-medium rounded-md capitalize transition-all ${
                          filter === tab 
                          ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' 
                          : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                       }`}
                    >
                       {tab}
                    </button>
                 ))}
              </div>
           </div>

           <div className="space-y-2 max-h-80 overflow-y-auto hide-scrollbar">
              {filteredUsers.map(user => (
                 <GlassCard key={user.id} className="p-3 rounded-xl flex items-center justify-between group hover:bg-white/50 dark:hover:bg-white/5 transition-colors">
                    <div className="flex items-center gap-3">
                       <div className="relative">
                          <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-white/10" />
                          <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-[#1e293b] ${user.status === 'online' ? 'bg-emerald-500' : 'bg-slate-400'}`}></div>
                       </div>
                       <div>
                          <h4 className="text-sm font-semibold text-slate-900 dark:text-white">{user.name}</h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-3">
                       <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10 uppercase tracking-wide">
                          {user.role}
                       </span>
                    </div>
                 </GlassCard>
              ))}
              {filteredUsers.length === 0 && (
                 <div className="text-center py-8 text-slate-400 text-sm">No users found.</div>
              )}
           </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboardScreen;
