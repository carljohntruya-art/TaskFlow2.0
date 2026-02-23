import React, { useEffect, useState, useMemo } from 'react';
import { Menu, MoreHorizontal, Sun, Flame, ChevronRight, Calendar, Zap, Loader2 } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useAuthStore } from '../store/authStore';
import { taskService } from '../services/taskService';
import { Task } from '../types';

const LOGO_URL = "/assets/logo.png";

const AnalyticsScreen: React.FC = () => {
  const { user } = useAuthStore();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const data = await taskService.getTasks();
        setTasks(data);
      } catch (err) {
        // Handle error implicitly
      } finally {
        setIsLoading(false);
      }
    };
    fetchTasks();
  }, []);

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const completionRate = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Derive pie data implicitly via categories/priority or status
  const pieData = useMemo(() => {
    const counts = { pending: 0, 'in-progress': 0, completed: 0 };
    tasks.forEach(t => {
      counts[t.status] = (counts[t.status] || 0) + 1;
    });

    return [
      { name: 'Completed', value: counts.completed, color: '#10b981' }, // emerald-500
      { name: 'In Progress', value: counts['in-progress'], color: '#256af4' }, // primary
      { name: 'Pending', value: counts.pending, color: '#f59e0b' }, // amber-500
    ].filter(item => item.value > 0);
  }, [tasks]);

  // Derive simple area chart data
  const data = useMemo(() => {
    return [
      { name: 'Week 1', uv: 5 },
      { name: 'Week 2', uv: 12 },
      { name: 'Week 3', uv: completedTasks > 1 ? completedTasks - 2 : completedTasks },
      { name: 'Week 4', uv: completedTasks },
    ];
  }, [completedTasks]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  return (
    <div className="px-6 pt-6 pb-24">
      {/* Header */}
      <header className="flex items-center justify-between py-5 sticky top-0 z-50 glass-panel border-b border-white/5 -mx-6 px-6 bg-[#101622]/80 backdrop-blur-md">
        <button className="p-2 -ml-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white">
          <Menu size={24} />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center border border-white/5 p-1.5">
             <img src={LOGO_URL} alt="Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="font-bold text-lg tracking-tight text-white">TaskFlow</h1>
        </div>
        <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-primary/50 p-0.5">
          <img src={user?.avatar || "https://picsum.photos/100/100"} className="w-full h-full object-cover rounded-full" />
        </div>
      </header>

      {/* Title Area */}
      <div className="mt-6 flex flex-col gap-4 mb-6">
        <div>
           <h2 className="text-2xl font-semibold text-white">Performance</h2>
           <p className="text-sm text-slate-400 mt-1">Track your productivity metrics</p>
        </div>
        <button className="flex items-center gap-2 self-start px-4 py-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition-colors text-sm font-medium text-slate-200">
           <Calendar size={14} className="text-primary" />
           Live Data
           <ChevronRight size={14} className="text-slate-400 rotate-90" />
        </button>
      </div>

      {/* Main Chart */}
      <GlassCard className="rounded-xl p-5 mb-6 relative overflow-hidden">
         <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-slate-400 text-xs uppercase tracking-wider font-medium">Tasks Completed</p>
              <h3 className="text-3xl font-bold mt-1 text-white">{completedTasks} <span className="text-sm font-normal text-emerald-400 ml-1">{completionRate}% Done</span></h3>
            </div>
            <button className="p-1 rounded hover:bg-white/10 text-slate-400">
               <MoreHorizontal size={20} />
            </button>
         </div>
         
         <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#256af4" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#256af4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="uv" stroke="#256af4" strokeWidth={3} fillOpacity={1} fill="url(#colorUv)" />
              </AreaChart>
            </ResponsiveContainer>
         </div>
      </GlassCard>

      {/* Grid Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <GlassCard className="rounded-xl p-4 flex flex-col justify-between min-h-[140px]">
           <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center mb-2">
             <Sun size={20} className="text-yellow-500" />
           </div>
           <div>
             <p className="text-slate-400 text-xs font-medium mb-1">Peak Hours</p>
             <h4 className="text-white text-lg font-bold">10 AM - 2 PM</h4>
             <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
               <Zap size={10} /> Consistently active
             </p>
           </div>
        </GlassCard>

        <GlassCard className="rounded-xl p-4 flex flex-col justify-between min-h-[140px]">
           <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center mb-2">
             <Flame size={20} className="text-orange-500" />
           </div>
           <div>
             <p className="text-slate-400 text-xs font-medium mb-1">Total Created</p>
             <h4 className="text-white text-lg font-bold">{totalTasks} Tasks</h4>
             <p className="text-xs text-orange-400 mt-1">Across all categories</p>
           </div>
        </GlassCard>
      </div>

      {/* Donut Chart */}
      <GlassCard className="rounded-xl p-5">
         <div className="flex items-center justify-between mb-4">
           <h3 className="text-base font-semibold text-white">Task Distribution</h3>
         </div>
         <div className="flex items-center gap-6">
            <div className="w-32 h-32 relative">
               <ResponsiveContainer width="100%" height="100%">
                 {pieData.length > 0 ? (
                   <PieChart>
                     <Pie
                       data={pieData}
                       innerRadius={40}
                       outerRadius={60}
                       paddingAngle={5}
                       dataKey="value"
                       stroke="none"
                     >
                       {pieData.map((entry, index) => (
                         <Cell key={`cell-${index}`} fill={entry.color} />
                       ))}
                     </Pie>
                   </PieChart>
                 ) : (
                   <div className="w-full h-full rounded-full border-4 border-slate-700"></div>
                 )}
               </ResponsiveContainer>
               <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xl font-bold text-white">{totalTasks}</span>
                  <span className="text-[10px] text-slate-400 uppercase">Total</span>
               </div>
            </div>
            
            <div className="flex-1 space-y-3">
               {pieData.map((item) => (
                 <div key={item.name} className="flex items-center justify-between text-sm">
                   <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color, boxShadow: `0 0 8px ${item.color}80` }}></span>
                      <span className="text-slate-300">{item.name}</span>
                   </div>
                   <span className="font-medium text-white">
                      {totalTasks > 0 ? Math.round((item.value / totalTasks) * 100) : 0}%
                   </span>
                 </div>
               ))}
               {pieData.length === 0 && <p className="text-xs text-slate-500">No task data available.</p>}
            </div>
         </div>
      </GlassCard>
    </div>
  );
};

export default AnalyticsScreen;