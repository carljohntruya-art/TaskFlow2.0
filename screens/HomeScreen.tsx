import React, { useEffect, useState } from 'react';
import { Layers, CheckCircle2, Clock, TrendingUp, Calendar, Folder } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import { useAuthStore } from '../store/authStore';
import { taskService } from '../services/taskService';
import { Task } from '../types';

const HomeScreen: React.FC = () => {
  const { user } = useAuthStore();
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const data = await taskService.getTasks();
        setTasks(data);
      } catch (e) {
        // Suppress
      }
    };
    
    fetchTasks();
    const handleTaskUpdated = () => fetchTasks();
    window.addEventListener('task-updated', handleTaskUpdated);
    
    return () => window.removeEventListener('task-updated', handleTaskUpdated);
  }, []);

  const displayName = user?.name ? user.name.split(' ')[0] : 'Guest';
  const avatarUrl = user?.avatar || 'https://picsum.photos/100/100';

  const completedCount = tasks.filter(t => t.status === 'completed').length;
  const pendingCount = tasks.length - completedCount;
  const productivity = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <div className="px-6 pt-12 pb-6">
      {/* Header */}
      <header className="flex items-center justify-between mb-8">
        <button className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors text-slate-300">
          <Layers size={24} />
        </button>
        <div className="relative">
          <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-primary p-0.5">
            <img 
              alt="User" 
              className="h-full w-full rounded-full object-cover" 
              src={avatarUrl} 
            />
          </div>
          <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 border-2 border-background-dark rounded-full"></div>
        </div>
      </header>

      {/* Greeting */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-white">
          Good morning,<br/>
          <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-cyan-400">
            {displayName}
          </span>
        </h1>
        <p className="text-sm text-slate-400 mt-2">Here's your productivity overview for today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        {[
          { icon: Layers, label: 'Total Tasks', value: tasks.length.toString(), color: 'text-primary', bg: 'bg-white/10' },
          { icon: CheckCircle2, label: 'Completed', value: completedCount.toString(), color: 'text-green-400', bg: 'bg-white/10' },
          { icon: Clock, label: 'Pending', value: pendingCount.toString(), color: 'text-orange-400', bg: 'bg-white/10' },
          { icon: TrendingUp, label: 'Productivity', value: `${productivity}%`, color: 'text-cyan-400', bg: 'bg-white/10' }
        ].map((stat, idx) => (
          <GlassCard key={idx} className="rounded-2xl p-4 flex flex-col justify-between h-32 relative group overflow-hidden">
             <div className={`absolute -right-4 -top-4 w-16 h-16 ${stat.color.replace('text', 'bg')}/20 rounded-full blur-2xl group-hover:bg-opacity-30 transition-all`}></div>
             <div className="flex items-start justify-between">
                <div className={`p-2 rounded-lg ${stat.bg} ${stat.color}`}>
                  <stat.icon size={20} />
                </div>
             </div>
             <div>
               <h3 className="text-2xl font-bold text-white mb-1">{stat.value}</h3>
               <p className="text-xs font-medium text-slate-400">{stat.label}</p>
             </div>
          </GlassCard>
        ))}
      </div>

      {/* Recent Tasks */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Recent Tasks</h2>
        <button className="text-xs font-medium text-primary hover:text-cyan-400 transition-colors">View All</button>
      </div>

      <div className="space-y-3">
        {tasks.slice(0, 5).map((task, idx) => (
          <div key={idx} className="group relative rounded-2xl p-4 bg-[#1A202C] border border-white/5 shadow-sm hover:shadow-md transition-all active:scale-[0.98]">
             <div className={`absolute left-0 top-4 bottom-4 w-1 bg-${task.priority === 'high' ? 'red' : task.priority === 'medium' ? 'yellow' : 'green'}-500 rounded-r-lg`}></div>
             <div className="flex items-start gap-3 pl-2">
                <div className="pt-1">
                  <input readOnly checked={task.status === 'completed'} type="checkbox" className="h-5 w-5 rounded border-slate-600 text-primary bg-white/5 focus:ring-primary focus:ring-offset-0 cursor-pointer" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="text-base font-medium text-slate-200 leading-tight">{task.title}</h4>
                    <span className={`px-2 py-0.5 rounded-full bg-${task.priority === 'high' ? 'red' : task.priority === 'medium' ? 'orange' : 'green'}-500/10 text-${task.priority === 'high' ? 'red' : task.priority === 'medium' ? 'orange' : 'green'}-500 text-[10px] font-bold uppercase border border-${task.priority === 'high' ? 'red' : task.priority === 'medium' ? 'orange' : 'green'}-500/20`}>
                      {task.priority === 'medium' ? 'MED' : task.priority}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-400 mt-2">
                    <div className="flex items-center gap-1">
                      <Calendar size={12} />
                      <span>{task.dueDateStr}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Folder size={12} />
                      <span>{task.category}</span>
                    </div>
                  </div>
                </div>
             </div>
          </div>
        ))}
        {tasks.length === 0 && <p className="text-center text-sm text-slate-400 mt-4">No tasks found. Create one!</p>}
      </div>
    </div>
  );
};

export default HomeScreen;