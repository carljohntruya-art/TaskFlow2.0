import React from 'react';
import { ChevronDown, Search, Plus, ChevronRight } from 'lucide-react';
import GlassCard from '../components/GlassCard';

const CalendarScreen: React.FC = () => {
  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const dates = Array.from({ length: 35 }, (_, i) => i + 26); // Mock dates logic

  return (
    <div className="px-4 py-6 min-h-screen">
      {/* Header */}
      <header className="flex items-center justify-between mb-6">
         <div className="flex items-center gap-2 cursor-pointer group">
            <h1 className="text-lg font-semibold text-white">October 2023</h1>
            <ChevronDown size={18} className="text-slate-400" />
         </div>
         <div className="flex gap-2">
            <button className="p-2 rounded-full hover:bg-white/10 text-slate-400">
               <Search size={20} />
            </button>
            <button className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/30">
               <Plus size={18} />
            </button>
         </div>
      </header>

      {/* Calendar Grid */}
      <GlassCard className="rounded-2xl overflow-hidden p-1 mb-6">
         <div className="grid grid-cols-7 mb-2 py-3 border-b border-white/5">
            {days.map(d => (
               <div key={d} className="text-center text-xs font-medium text-slate-500">{d}</div>
            ))}
         </div>
         <div className="grid grid-cols-7 gap-[1px] bg-white/5 rounded-lg overflow-hidden border border-white/5">
            {dates.map((date, idx) => {
               // Pseudo-logic for date display
               const displayDate = date > 31 ? date - 31 : date;
               const isToday = displayDate === 14 && date <= 31;
               const hasDot = [2, 5, 9, 12, 17, 20, 27, 31].includes(displayDate);
               const dotColor = displayDate % 2 === 0 ? 'bg-primary' : 'bg-teal-500';

               return (
                  <div key={idx} className={`h-20 p-1 flex flex-col items-center relative ${isToday ? 'bg-slate-800/50' : ''}`}>
                     {isToday ? (
                        <div className="w-7 h-7 flex items-center justify-center rounded-full bg-primary text-white font-bold text-sm mb-1 shadow-[0_0_15px_rgba(37,106,244,0.4)]">
                           {displayDate}
                        </div>
                     ) : (
                        <span className={`text-xs mt-1 ${idx < 5 ? 'text-slate-600' : 'text-slate-300 font-medium'}`}>
                           {displayDate}
                        </span>
                     )}
                     
                     {hasDot && (
                        <div className={`w-full h-1 mt-2 rounded-full ${dotColor} opacity-70`}></div>
                     )}
                     {isToday && (
                        <div className="w-full h-1 mt-1 rounded-full bg-teal-500 opacity-70"></div>
                     )}
                  </div>
               );
            })}
         </div>
      </GlassCard>

      {/* Upcoming Deadlines */}
      <div className="flex items-center justify-between mb-4 px-1">
         <h2 className="text-lg font-semibold text-white tracking-wide">Upcoming Deadlines</h2>
         <button className="text-xs font-medium text-primary hover:text-primary-dark uppercase tracking-wider">View All</button>
      </div>

      <div className="space-y-3 pb-20">
         {[
            { date: '15', month: 'OCT', title: 'Q4 Financial Report', desc: 'Finalize spreadsheets', tag: 'High', color: 'primary' },
            { date: '17', month: 'OCT', title: 'UX Design Review', desc: 'Review wireframes', tag: 'Medium', color: 'teal-500' },
            { date: '20', month: 'OCT', title: 'Team Lunch Sync', desc: 'Discuss quarterly goals', tag: 'Low', color: 'purple-500' },
         ].map((item, idx) => (
            <GlassCard key={idx} className="rounded-xl p-4 flex items-center gap-4 relative overflow-hidden group cursor-pointer hover:bg-white/5">
               <div className={`absolute left-0 top-0 bottom-0 w-1 bg-${item.color}`}></div>
               <div className="flex-shrink-0 w-12 flex flex-col items-center justify-center bg-white/5 rounded-lg py-2 border border-white/5">
                  <span className="text-[10px] uppercase text-slate-400 font-semibold">{item.month}</span>
                  <span className="text-lg font-bold text-white leading-none mt-1">{item.date}</span>
               </div>
               <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                     <h3 className="text-sm font-semibold text-white truncate">{item.title}</h3>
                     <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium bg-${item.color}/20 text-${item.color} border border-${item.color}/20`}>
                        {item.tag}
                     </span>
                  </div>
                  <p className="text-xs text-slate-400 truncate">{item.desc}</p>
               </div>
               <ChevronRight size={18} className="text-slate-400" />
            </GlassCard>
         ))}
      </div>
    </div>
  );
};

export default CalendarScreen;