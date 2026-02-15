import React from 'react';
import { Menu, MoreHorizontal, Sun, Flame, ChevronRight, Calendar, Zap } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const data = [
  { name: 'Nov 1', uv: 20 },
  { name: 'Nov 8', uv: 35 },
  { name: 'Nov 15', uv: 50 },
  { name: 'Nov 22', uv: 55 },
  { name: 'Nov 29', uv: 80 },
];

const pieData = [
  { name: 'Design', value: 400, color: '#256af4' },
  { name: 'Dev', value: 300, color: '#a855f7' },
  { name: 'Admin', value: 300, color: '#ec4899' },
  { name: 'Other', value: 200, color: '#334155' },
];

const LOGO_URL = "/asssets/logo.png";

const AnalyticsScreen: React.FC = () => {
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
          <img src="https://picsum.photos/100/100" className="w-full h-full object-cover rounded-full" />
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
           Last 30 Days
           <ChevronRight size={14} className="text-slate-400 rotate-90" />
        </button>
      </div>

      {/* Main Chart */}
      <GlassCard className="rounded-xl p-5 mb-6 relative overflow-hidden">
         <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-slate-400 text-xs uppercase tracking-wider font-medium">Tasks Completed</p>
              <h3 className="text-3xl font-bold mt-1 text-white">142 <span className="text-sm font-normal text-emerald-400 ml-1">+12%</span></h3>
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
               <Zap size={10} /> 14 tasks/hr
             </p>
           </div>
        </GlassCard>

        <GlassCard className="rounded-xl p-4 flex flex-col justify-between min-h-[140px]">
           <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center mb-2">
             <Flame size={20} className="text-orange-500" />
           </div>
           <div>
             <p className="text-slate-400 text-xs font-medium mb-1">Current Streak</p>
             <h4 className="text-white text-lg font-bold">12 Days</h4>
             <p className="text-xs text-orange-400 mt-1">Best: 18 Days</p>
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
               </ResponsiveContainer>
               <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xl font-bold text-white">142</span>
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
                      {Math.round((item.value / 1200) * 100)}%
                   </span>
                 </div>
               ))}
            </div>
         </div>
      </GlassCard>
    </div>
  );
};

export default AnalyticsScreen;