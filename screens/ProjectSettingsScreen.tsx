import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Fingerprint, GripVertical, Trash2, Edit2 } from 'lucide-react';
import GlassCard from '../components/GlassCard';

const ProjectSettingsScreen: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen pb-24 relative overflow-x-hidden">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-[#101622]/80 backdrop-blur-xl border-b border-white/5 pt-12 pb-4 px-4 shadow-lg max-w-md mx-auto">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate('/profile')} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 active:scale-95 transition-all text-white/80">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold text-white tracking-tight">Project Settings</h1>
          <button onClick={() => navigate('/profile')} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 active:scale-95 transition-all text-primary font-medium">
            <Check size={24} />
          </button>
        </div>
      </header>

      <main className="pt-32 px-4 space-y-6">
        {/* Tabs */}
        <div className="overflow-x-auto hide-scrollbar -mx-4 px-4 pb-2">
          <div className="flex space-x-3 min-w-max">
             <button className="px-5 py-2 rounded-full bg-primary text-white text-sm font-medium shadow-[0_0_20px_rgba(37,106,244,0.3)] transition-transform active:scale-95">General</button>
             <button className="px-5 py-2 rounded-full bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 text-sm font-medium backdrop-blur-md transition-all active:scale-95">Team</button>
             <button className="px-5 py-2 rounded-full bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 text-sm font-medium backdrop-blur-md transition-all active:scale-95">Integrations</button>
          </div>
        </div>

        {/* Project Identity */}
        <section className="space-y-4">
           <div className="flex items-center gap-2 px-1">
             <Fingerprint size={16} className="text-primary" />
             <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Project Identity</h2>
           </div>
           
           <GlassCard className="rounded-2xl p-5 space-y-5">
              <div className="flex items-center gap-4 mb-2">
                 <div className="relative w-16 h-16 rounded-xl overflow-hidden shadow-lg border border-white/10 group cursor-pointer">
                    <img src="https://picsum.photos/seed/project/100" alt="Icon" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                       <Edit2 size={16} className="text-white" />
                    </div>
                 </div>
                 <div>
                    <p className="text-xs text-slate-400 mb-1">Project Icon</p>
                    <button className="text-xs text-primary font-medium hover:text-primary/80 transition-colors">Change Icon</button>
                 </div>
              </div>

              <div className="space-y-1">
                 <label className="text-xs text-slate-400 ml-1">Project Name</label>
                 <input type="text" defaultValue="TaskFlow Redesign 2024" className="w-full bg-[#101622]/60 border border-white/10 rounded-lg px-4 py-3 text-sm placeholder-slate-500 focus:ring-1 focus:ring-primary focus:border-primary text-white transition-all" />
              </div>

              <div className="space-y-1">
                 <label className="text-xs text-slate-400 ml-1">Description</label>
                 <textarea rows={3} defaultValue="Overhaul the main dashboard UI to implement new glassmorphism guidelines and improve mobile responsiveness." className="w-full bg-[#101622]/60 border border-white/10 rounded-lg px-4 py-3 text-sm placeholder-slate-500 focus:ring-1 focus:ring-primary focus:border-primary text-white transition-all resize-none" />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/5">
                 <div>
                    <p className="text-sm font-medium text-white">Public Project</p>
                    <p className="text-xs text-slate-500">Visible to all team members</p>
                 </div>
                 <div className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                 </div>
              </div>
           </GlassCard>
        </section>

        {/* Workflow Statuses */}
        <section className="space-y-4">
           <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                 <div className="w-4 h-4 rounded grid grid-cols-2 gap-0.5">
                    <div className="bg-primary/50"></div><div className="bg-primary/50"></div><div className="bg-primary/50"></div><div className="bg-primary/50"></div>
                 </div>
                 <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Workflow Statuses</h2>
              </div>
              <button className="text-primary text-xs font-medium hover:text-white transition-colors">Edit</button>
           </div>
           
           <GlassCard className="rounded-2xl p-1 overflow-hidden">
              <ul className="divide-y divide-white/5">
                 {['To Do', 'In Progress', 'Review', 'Done'].map((status, idx) => (
                    <li key={status} className="flex items-center justify-between p-4 group active:bg-white/5 transition-colors">
                       <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${
                             status === 'Done' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]' :
                             status === 'Review' ? 'bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.6)]' :
                             status === 'In Progress' ? 'bg-primary shadow-[0_0_8px_rgba(37,106,244,0.6)]' : 
                             'bg-slate-400 shadow-[0_0_8px_rgba(148,163,184,0.6)]'
                          }`}></div>
                          <span className="text-sm font-medium text-slate-200">{status}</span>
                          {idx === 0 && <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-500 border border-white/5">Default</span>}
                       </div>
                       <GripVertical size={16} className="text-slate-600 cursor-grab" />
                    </li>
                 ))}
              </ul>
           </GlassCard>
        </section>

        {/* Danger Zone */}
        <section className="space-y-4 pt-4">
           <div className="bg-red-500/5 backdrop-blur-md border border-red-500/20 rounded-2xl p-5 shadow-[0_0_15px_rgba(239,68,68,0.1)]">
              <h3 className="text-white font-medium mb-1">Delete Project</h3>
              <p className="text-xs text-red-200/60 mb-4 leading-relaxed">Once you delete a project, there is no going back. Please be certain.</p>
              <button className="w-full py-3 px-4 rounded-lg bg-red-500/10 border border-red-500/50 text-red-500 text-sm font-medium hover:bg-red-500 hover:text-white transition-all duration-300 flex items-center justify-center gap-2 group">
                 <Trash2 size={16} className="group-hover:rotate-12 transition-transform" />
                 Delete this project
              </button>
           </div>
        </section>
      </main>

      <div className="fixed bottom-0 left-0 w-full p-4 z-40 bg-linear-to-t from-background-dark via-background-dark/95 to-transparent pt-10 max-w-md mx-auto">
         <button className="w-full py-3.5 rounded-xl bg-linear-to-r from-primary to-cyan-500 text-white font-semibold text-sm shadow-lg hover:shadow-cyan-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
            Save Changes
         </button>
      </div>
    </div>
  );
};

export default ProjectSettingsScreen;