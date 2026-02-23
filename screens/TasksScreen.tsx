import React, { useState, useEffect, useRef } from 'react';
import { Clock, Edit2, Trash2, Calendar, Filter, Search, X, Sun, Moon, Bell, Check, History, Repeat, Paperclip, ListChecks, FolderInput, CheckCircle2, Image as ImageIcon, ArrowUpDown, Play, Circle } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import { Task } from '../types';
import NewTaskModal from '../components/NewTaskModal';

import { taskService } from '../services/taskService';

interface HistoryModalProps {
  tasks: Task[];
  onClose: () => void;
}

const HistoryModal: React.FC<HistoryModalProps> = ({ tasks, onClose }) => {
  const completedTasks = tasks.filter(t => t.status === 'completed').sort((a, b) => {
    const tA = a.completedAt ? new Date(a.completedAt).getTime() : 0;
    const tB = b.completedAt ? new Date(b.completedAt).getTime() : 0;
    return tB - tA;
  });

  return (
    <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease-out]">
      <GlassCard className="w-full max-w-md bg-white dark:bg-[#1e293b] rounded-2xl p-6 h-[70vh] flex flex-col animate-[slideUp_0.3s_ease-out] relative overflow-hidden shadow-2xl">
        <div className="flex justify-between items-center mb-6 shrink-0">
            <div className="flex items-center gap-2">
               <div className="p-2 bg-slate-100 dark:bg-white/10 rounded-lg text-slate-600 dark:text-slate-300">
                  <History size={20} />
               </div>
               <h2 className="text-xl font-bold text-slate-900 dark:text-white">Task History</h2>
            </div>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 transition-colors">
              <X size={20} />
            </button>
        </div>

        <div className="flex-1 overflow-y-auto hide-scrollbar space-y-3 pr-1">
          {completedTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
              <p>No completed tasks found.</p>
            </div>
          ) : (
            completedTasks.map(task => (
              <div key={task.id} className="group p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 hover:border-primary/30 transition-all">
                <div className="flex items-start gap-3">
                   <div className="mt-0.5 p-1 bg-green-500/10 text-green-500 rounded-full border border-green-500/20">
                      <Check size={12} strokeWidth={3} />
                   </div>
                   <div className="flex-1">
                      <h4 className="font-semibold text-slate-700 dark:text-slate-200 text-sm line-through decoration-slate-400/50">{task.title}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">{task.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                         <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-300 font-medium">
                            {task.category}
                         </span>
                         <span className="text-[10px] text-slate-400 ml-auto">
                            {task.completedAt ? new Date(task.completedAt).toLocaleString(undefined, {
                               month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                            }) : 'Unknown'}
                         </span>
                      </div>
                   </div>
                </div>
              </div>
            ))
          )}
        </div>
      </GlassCard>
    </div>
  );
};

type SortOption = 'newest' | 'priority' | 'dueDate';

const TasksScreen: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'in-progress' | 'done'>('all');
  const [categoryFilters, setCategoryFilters] = useState<string[]>(['All']);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [notification, setNotification] = useState<{title: string, message: string} | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  
  // Sorting State
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const sortMenuRef = useRef<HTMLDivElement>(null);

  // Selection Mode State
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Fetch tasks on mount and listen for global updates
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const data = await taskService.getTasks();
        setTasks(data);
      } catch (error) {
        // Silently handle error
      }
    };
    
    fetchTasks();

    const handleTaskUpdated = () => fetchTasks();
    window.addEventListener('task-updated', handleTaskUpdated);
    
    return () => window.removeEventListener('task-updated', handleTaskUpdated);
  }, []);

  useEffect(() => {
    // Check initial class on mount
    setIsDarkMode(document.documentElement.classList.contains('dark'));
  }, []);

  // Close sort menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortMenuRef.current && !sortMenuRef.current.contains(event.target as Node)) {
        setShowSortMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reminder check loop
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const currentIso = now.toISOString().slice(0, 16); // Match datetime-local format 'YYYY-MM-DDTHH:mm'

      tasks.forEach(task => {
        if (task.reminderTime && task.status !== 'completed') {
           // Simple check: match exact minute
           if (task.reminderTime === currentIso) {
             triggerNotification(task.title, `Reminder: ${task.title} is due now!`);
           }
        }
      });
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [tasks]);

  const triggerNotification = (title: string, message: string) => {
     // Prevent duplicate toasts if already showing
     setNotification({ title, message });
     
     // Auto hide after 5 seconds
     setTimeout(() => {
        setNotification(null);
     }, 5000);
  };

  const toggleTheme = () => {
    const html = document.documentElement;
    if (html.classList.contains('dark')) {
      html.classList.remove('dark');
      setIsDarkMode(false);
    } else {
      html.classList.add('dark');
      setIsDarkMode(true);
    }
  };

  const categories = ['All', 'Finance', 'Design', 'Development', 'Sales', 'Marketing', 'General'];

  const filteredTasks = tasks.filter(task => {
    // 1. Status Filter
    const matchesStatus = filter === 'all' 
      ? true 
      : filter === 'done' 
        ? task.status === 'completed'
        : task.status === filter;
        
    // 2. Category Filter (Multi-select)
    const matchesCategory = categoryFilters.includes('All') || categoryFilters.includes(task.category);

    // 3. Search Filter
    const query = searchQuery.toLowerCase();
    const matchesSearch = task.title.toLowerCase().includes(query) || 
                          task.description.toLowerCase().includes(query);

    return matchesStatus && matchesCategory && matchesSearch;
  });

  // Sorting Logic
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === 'priority') {
      const priorityWeight = { high: 3, medium: 2, low: 1 };
      return priorityWeight[b.priority] - priorityWeight[a.priority];
    } 
    else if (sortBy === 'dueDate') {
      const getDateValue = (d: string) => {
         const now = new Date();
         const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
         if (d.toLowerCase() === 'today') return today;
         if (d.toLowerCase() === 'tomorrow') return today + 86400000;
         if (d.toLowerCase() === 'yesterday') return today - 86400000;
         const parsed = Date.parse(d);
         return isNaN(parsed) ? 9999999999999 : parsed;
      };
      return getDateValue(a.dueDateStr) - getDateValue(b.dueDateStr);
    }
    else {
      // Default: Newest (Creation Date)
      const tA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const tB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return tB - tA; 
    }
  });

  const pendingCount = tasks.filter(t => t.status !== 'completed').length;

  const handleTaskUpdate = async (updatedTask: Task) => {
    try {
      if (!tasks.some(t => t.id === updatedTask.id)) {
          // New task: ID handled by DB
          const newTask = await taskService.createTask(updatedTask);
          if (newTask) setTasks(prev => [newTask, ...prev]);
      } else {
          // Update existing
          const updated = await taskService.updateTask(updatedTask.id, updatedTask);
          if (updated) setTasks(prev => prev.map(t => t.id === updated.id ? updated : t));
      }
    } catch(err) {
      // Error handling
    }
    setEditingTask(null);
  };

  const toggleTaskStatus = async (taskId: string) => {
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) return;
    
    const task = tasks[taskIndex];
    let newStatus: Task['status'] = 'pending';
    if (task.status === 'pending') newStatus = 'in-progress';
    else if (task.status === 'in-progress') newStatus = 'completed';
    else newStatus = 'pending';

    const isComplete = task.status === 'completed';
    newStatus = isComplete ? 'pending' : 'completed';
    
    try {
      const updatedTask = await taskService.updateTask(taskId, { status: newStatus });
      if (updatedTask) {
        setTasks(prev => prev.map(t => t.id === taskId ? updatedTask : t));
      }

      if (newStatus === 'completed' && task.recurrence) {
         // simplified logic: let the backend handle this in real-world, or manually push a new one:
         const nextTask = { ...task, status: 'pending' as const };
         const createdRecurring = await taskService.createTask(nextTask);
         if (createdRecurring) {
            setTasks(prev => [createdRecurring, ...prev]);
         }
      }
    } catch (e) {
      // silent fail
    }
  };

  const toggleCategory = (cat: string) => {
    if (cat === 'All') {
      setCategoryFilters(['All']);
      return;
    }

    setCategoryFilters(prev => {
      let newFilters = prev.includes('All') ? [] : [...prev];

      if (newFilters.includes(cat)) {
        newFilters = newFilters.filter(c => c !== cat);
      } else {
        newFilters.push(cat);
      }

      if (newFilters.length === 0) return ['All'];
      return newFilters;
    });
  };

  // --- Bulk Selection Logic ---

  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    setSelectedTaskIds([]);
  };

  const toggleTaskSelection = (id: string) => {
    setSelectedTaskIds(prev => 
      prev.includes(id) ? prev.filter(tid => tid !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = async () => {
    if (confirm(`Are you sure you want to delete ${selectedTaskIds.length} tasks?`)) {
       try {
         await Promise.all(selectedTaskIds.map(id => taskService.deleteTask(id)));
         setTasks(prev => prev.filter(t => !selectedTaskIds.includes(t.id)));
         setIsSelectionMode(false);
         setSelectedTaskIds([]);
         triggerNotification('Deleted', 'Selected tasks have been removed.');
       } catch (e) {
         // handle error
       }
    }
  };

  const handleBulkComplete = async () => {
    try {
      const promises = selectedTaskIds.map(id => taskService.updateTask(id, { status: 'completed' }));
      const completedTasks = await Promise.all(promises);
      
      setTasks(prev => {
         let newTasksList = [...prev];
         completedTasks.forEach((updatedTask: any) => {
           if (updatedTask) {
             const idx = newTasksList.findIndex(t => t.id === updatedTask.id);
             if (idx !== -1) {
                newTasksList[idx] = updatedTask;
             }
           }
         });
         return newTasksList;
      });
      setIsSelectionMode(false);
      setSelectedTaskIds([]);
      triggerNotification('Completed', `${selectedTaskIds.length} tasks marked as done.`);
    } catch(e) {
      // suppress
    }
  };

  const handleBulkCategoryChange = (newCategory: string) => {
    setTasks(prev => prev.map(t => selectedTaskIds.includes(t.id) ? { ...t, category: newCategory } : t));
    setShowCategoryModal(false);
    setIsSelectionMode(false);
    setSelectedTaskIds([]);
    triggerNotification('Updated', 'Categories updated successfully.');
  };

  return (
    <div className="px-6 pt-12 pb-6 min-h-screen flex flex-col relative transition-colors duration-300">
      
      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-60 w-[90%] max-w-sm animate-[slideDown_0.3s_ease-out]">
          <GlassCard className="rounded-xl p-4 flex items-start gap-3 bg-white/90 dark:bg-[#1e293b]/90 border-l-4 border-l-yellow-500 shadow-2xl">
            <div className="p-2 bg-yellow-500/10 rounded-full text-yellow-500 shrink-0">
               <Bell size={20} />
            </div>
            <div className="flex-1">
               <h4 className="text-sm font-bold text-slate-900 dark:text-white">{notification.title}</h4>
               <p className="text-xs text-slate-500 dark:text-slate-300 mt-1">{notification.message}</p>
            </div>
            <button onClick={() => setNotification(null)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white">
               <X size={16} />
            </button>
          </GlassCard>
        </div>
      )}

      {/* History Modal */}
      {showHistory && (
        <HistoryModal tasks={tasks} onClose={() => setShowHistory(false)} />
      )}

      {/* Bulk Category Selection Modal */}
      {showCategoryModal && (
         <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease-out]">
            <GlassCard className="w-full max-w-xs bg-white dark:bg-[#1e293b] rounded-2xl p-4 animate-[slideUp_0.3s_ease-out]">
               <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-slate-900 dark:text-white">Move to...</h3>
                  <button onClick={() => setShowCategoryModal(false)} className="text-slate-400"><X size={20} /></button>
               </div>
               <div className="grid grid-cols-2 gap-2">
                  {categories.filter(c => c !== 'All').map(cat => (
                     <button 
                        key={cat}
                        onClick={() => handleBulkCategoryChange(cat)}
                        className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 hover:bg-primary/10 hover:border-primary/50 hover:text-primary text-sm font-medium text-slate-600 dark:text-slate-300 transition-all"
                     >
                        {cat}
                     </button>
                  ))}
               </div>
            </GlassCard>
         </div>
      )}

      {/* Header */}
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white transition-colors">
            {isSelectionMode ? `${selectedTaskIds.length} Selected` : 'My Tasks'}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 transition-colors">
            {isSelectionMode ? 'Select tasks to manage' : `${pendingCount} active tasks`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isSelectionMode ? (
             <button 
               onClick={toggleSelectionMode}
               className="px-4 py-2 rounded-full bg-slate-200 dark:bg-white/10 text-slate-900 dark:text-white font-medium hover:bg-slate-300 dark:hover:bg-white/20 transition-all text-sm"
             >
               Cancel
             </button>
          ) : (
            <>
               <button 
                 onClick={toggleSelectionMode}
                 className="p-2 rounded-full bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-white/20 transition-all"
                 title="Select Tasks"
               >
                 <ListChecks size={20} />
               </button>
               <button 
                 onClick={() => setShowHistory(true)}
                 className="p-2 rounded-full bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-white/20 transition-all"
                 title="View History"
               >
                 <History size={20} />
               </button>
               
               <button 
                 onClick={toggleTheme} 
                 className="p-2 rounded-full bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-yellow-300 hover:bg-slate-300 dark:hover:bg-white/20 transition-all"
                 title="Toggle Theme"
               >
                 {isDarkMode ? <Sun size={20} /> : <Moon size={20} className="text-slate-700" />}
               </button>
            </>
          )}
          
          <div className="relative group cursor-pointer ml-1">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary/30 p-0.5">
              <img src="https://picsum.photos/100/100" alt="Profile" className="w-full h-full object-cover rounded-full" />
            </div>
            <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-background-dark"></div>
          </div>
        </div>
      </header>

      {/* Search and Sort Row */}
      <div className="flex gap-3 mb-6 relative z-20">
        <div className="relative group flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white dark:bg-[#1e293b]/40 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-xl py-3 pl-10 pr-10 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all text-sm"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-full hover:bg-slate-100 dark:hover:bg-white/10"
            >
              <X size={14} />
            </button>
          )}
        </div>
        
        {/* Sort Button and Dropdown */}
        <div className="relative" ref={sortMenuRef}>
           <button 
             onClick={() => setShowSortMenu(!showSortMenu)}
             className={`h-full aspect-square flex items-center justify-center rounded-xl border transition-all ${
                showSortMenu 
                ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' 
                : 'bg-white dark:bg-[#1e293b]/40 border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5'
             }`}
             title="Sort Tasks"
           >
              <ArrowUpDown size={20} />
           </button>
           
           {showSortMenu && (
             <GlassCard className="absolute top-full right-0 mt-2 w-48 p-1.5 rounded-xl z-50 flex flex-col bg-white dark:bg-[#1e293b] animate-[slideDown_0.2s_ease-out]">
                <div className="px-2 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Sort by</div>
                {[
                   { id: 'newest', label: 'Creation Date' },
                   { id: 'priority', label: 'Priority' },
                   { id: 'dueDate', label: 'Due Date' }
                ].map((opt) => (
                   <button
                     key={opt.id}
                     onClick={() => { setSortBy(opt.id as SortOption); setShowSortMenu(false); }}
                     className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        sortBy === opt.id 
                        ? 'bg-primary/10 text-primary' 
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5'
                     }`}
                   >
                      {opt.label}
                      {sortBy === opt.id && <Check size={14} />}
                   </button>
                ))}
             </GlassCard>
           )}
        </div>
      </div>

      {/* Status Filter Tabs */}
      {!isSelectionMode && (
        <div className="mb-4 z-10">
          <GlassCard className="rounded-xl p-1.5 flex justify-between items-center relative">
            {['All', 'Pending', 'Done'].map((f) => {
              const isActive = filter === f.toLowerCase();
              return (
                <button
                  key={f}
                  onClick={() => setFilter(f.toLowerCase() as any)}
                  className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-300 ${
                    isActive 
                    ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/5'
                  }`}
                >
                  {f}
                </button>
              );
            })}
          </GlassCard>
        </div>
      )}

      {/* Category Filter Chips */}
      {!isSelectionMode && (
        <div className="flex gap-2 overflow-x-auto hide-scrollbar mb-6 pb-1 -mx-6 px-6">
           {categories.map(cat => {
              const isSelected = categoryFilters.includes(cat);
              return (
                <button
                   key={cat}
                   onClick={() => toggleCategory(cat)}
                   className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all whitespace-nowrap active:scale-95 ${
                      isSelected
                      ? 'bg-primary/20 border-primary text-primary shadow-[0_0_15px_rgba(37,106,244,0.2)]'
                      : 'bg-slate-200/50 dark:bg-white/5 border-slate-200 dark:border-white/5 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white'
                   }`}
                >
                   {cat}
                   {isSelected && cat !== 'All' && <span className="ml-1.5 text-[10px] opacity-60">×</span>}
                </button>
           )})}
        </div>
      )}

      {/* Task List */}
      <div className="flex-1 space-y-4 pb-24">
        <div className="flex items-center space-x-4 py-2 opacity-80">
          <div className="h-px flex-1 bg-linear-to-r from-transparent to-slate-200 dark:to-slate-700"></div>
          <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
             {sortedTasks.length} {filter === 'done' ? 'Completed' : 'Tasks'}
          </span>
          <div className="h-px flex-1 bg-linear-to-l from-transparent to-slate-200 dark:to-slate-700"></div>
        </div>

        {sortedTasks.length === 0 ? (
           <div className="text-center py-12 opacity-50 flex flex-col items-center">
              <div className="w-16 h-16 bg-slate-200 dark:bg-white/5 rounded-full flex items-center justify-center mb-4">
                 <Search size={32} className="text-slate-500 dark:text-slate-600" />
              </div>
              <p className="text-slate-500 dark:text-slate-400 font-medium">No tasks found</p>
              <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">Try adjusting your filters</p>
              <button 
                onClick={() => { setSearchQuery(''); setCategoryFilters(['All']); setFilter('all'); }}
                className="mt-4 text-primary text-sm font-medium hover:underline"
              >
                Clear all filters
              </button>
           </div>
        ) : (
           sortedTasks.map(task => (
             <TaskItemComponent 
                key={task.id} 
                task={task} 
                onClick={() => isSelectionMode ? toggleTaskSelection(task.id) : setEditingTask(task)} 
                onToggle={() => isSelectionMode ? toggleTaskSelection(task.id) : toggleTaskStatus(task.id)}
                isSelectionMode={isSelectionMode}
                isSelected={selectedTaskIds.includes(task.id)}
                onSelect={() => toggleTaskSelection(task.id)}
             />
           ))
        )}
      </div>

      {/* Floating Bulk Actions Bar */}
      {isSelectionMode && selectedTaskIds.length > 0 && (
         <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 w-[90%] max-w-sm z-50 animate-[slideUp_0.3s_ease-out]">
            <GlassCard className="rounded-2xl p-3 flex justify-around items-center bg-[#1e293b]/90 border-t border-white/10 shadow-2xl">
               <button onClick={handleBulkDelete} className="flex flex-col items-center gap-1 text-red-400 hover:text-red-300 transition-colors p-2">
                  <Trash2 size={20} />
                  <span className="text-[10px] font-medium">Delete</span>
               </button>
               <div className="w-px h-8 bg-white/10"></div>
               <button onClick={() => setShowCategoryModal(true)} className="flex flex-col items-center gap-1 text-slate-300 hover:text-white transition-colors p-2">
                  <FolderInput size={20} />
                  <span className="text-[10px] font-medium">Move</span>
               </button>
               <div className="w-px h-8 bg-white/10"></div>
               <button onClick={handleBulkComplete} className="flex flex-col items-center gap-1 text-green-400 hover:text-green-300 transition-colors p-2">
                  <CheckCircle2 size={20} />
                  <span className="text-[10px] font-medium">Complete</span>
               </button>
            </GlassCard>
         </div>
      )}

      {/* Edit Modal */}
      {editingTask && (
        <NewTaskModal 
          task={editingTask} 
          onClose={() => setEditingTask(null)} 
          onSave={handleTaskUpdate}
        />
      )}
    </div>
  );
};

interface TaskItemProps {
  task: Task;
  onClick: () => void;
  onToggle: () => void;
  isSelectionMode?: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
}

const TaskItemComponent: React.FC<TaskItemProps> = ({ task, onClick, onToggle, isSelectionMode, isSelected }) => {
   const { status } = task;
   const isCompleted = status === 'completed';
   
   // Priority visual mapping
   const priorityColors = {
      high: 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]',
      medium: 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.4)]',
      low: 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]'
   };

   // Check if due date is Today/Tomorrow for highlight
   const isUrgent = !isCompleted && (task.dueDateStr === 'Today' || task.dueDateStr === 'Tomorrow') && task.priority !== 'low';

   // Configuration for different statuses
   const getStatusConfig = () => {
       switch (status) {
           case 'completed':
               return {
                   checkboxClass: 'bg-emerald-500 border-emerald-500 scale-100',
                   icon: <Check size={14} strokeWidth={3} className="text-white" />,
                   textClass: 'line-through text-slate-500 decoration-slate-500/50',
                   descClass: 'text-slate-500',
                   cardClass: 'opacity-60 grayscale-[0.3] border-transparent'
               };
           case 'in-progress':
               return {
                   checkboxClass: 'bg-primary border-primary scale-100',
                   icon: <Play size={10} fill="currentColor" className="text-white ml-0.5" />,
                   textClass: 'text-slate-800 dark:text-slate-100',
                   descClass: 'text-slate-500 dark:text-slate-400',
                   cardClass: 'shadow-[0_0_15px_rgba(37,106,244,0.15)] border-primary/30'
               };
           default: // pending
               return {
                   checkboxClass: 'border-slate-300 dark:border-slate-600 bg-transparent group-hover:border-primary/50',
                   icon: null,
                   textClass: 'text-slate-800 dark:text-slate-100',
                   descClass: 'text-slate-500 dark:text-slate-400',
                   cardClass: 'hover:shadow-lg hover:border-primary/30 border-white/5'
               };
       }
   };

   const config = getStatusConfig();

   return (
     <div className="group relative transition-transform duration-200 active:scale-[0.99] mb-3" onClick={onClick}>
        <GlassCard className={`p-0 flex items-stretch overflow-hidden transition-all duration-300 ${config.cardClass}`}>
            
            {/* Left Color Strip for Priority */}
            <div className={`w-1.5 ${priorityColors[task.priority]} ${isCompleted ? 'opacity-30 shadow-none' : ''}`} />

            <div className="flex-1 p-4 flex gap-4 items-start relative bg-linear-to-br from-white/5 to-transparent">
                {/* Selection / Checkbox Area */}
                <div 
                   onClick={(e) => { e.stopPropagation(); onToggle(); }}
                   className={`mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 cursor-pointer transition-all duration-300 ${
                      isSelectionMode
                         ? (isSelected ? 'bg-primary border-primary scale-110 shadow-lg' : 'border-slate-300 dark:border-slate-600 bg-white/5')
                         : config.checkboxClass
                   }`}
                >
                    {isSelectionMode ? (
                        <Check size={14} strokeWidth={3} className={`text-white transition-all ${isSelected ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`} />
                    ) : (
                        <div className={`transition-all duration-300 transform ${isCompleted ? 'opacity-100 scale-100' : status === 'in-progress' ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`}>
                           {config.icon}
                        </div>
                    )}
                </div>

                {/* Main Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                        <h3 className={`font-semibold text-base leading-snug truncate ${config.textClass}`}>
                            {task.title}
                        </h3>
                        {/* Priority Label for clarity */}
                        <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${isCompleted ? 'border-slate-600 text-slate-500' : 'border-white/10 text-slate-400 bg-white/5'}`}>
                            {task.priority}
                        </span>
                    </div>

                    <p className={`text-sm mt-1.5 mb-3 line-clamp-2 leading-relaxed ${config.descClass}`}>
                        {task.description}
                    </p>

                    {/* Metadata Footer */}
                    <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                        {/* Status Badge - Only for In-Progress for extra clarity */}
                        {status === 'in-progress' && (
                           <div className="flex items-center gap-1 text-primary bg-primary/10 px-2 py-1 rounded-md border border-primary/10">
                              <Play size={10} fill="currentColor" />
                              <span className="font-medium">In Progress</span>
                           </div>
                        )}

                        {/* Due Date */}
                        <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md border border-transparent ${isUrgent ? 'text-orange-400 bg-orange-500/10 border-orange-500/10' : 'bg-slate-100 dark:bg-white/5'}`}>
                             <Calendar size={13} />
                             <span className="font-medium">{task.dueDateStr}</span>
                        </div>

                        {/* Due Time - New Distinct Element */}
                        {task.dueTime && (
                            <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md border border-transparent ${isUrgent ? 'text-orange-400 bg-orange-500/10 border-orange-500/10' : 'bg-slate-100 dark:bg-white/5'}`}>
                                <Clock size={13} />
                                <span className="font-medium">{task.dueTime}</span>
                            </div>
                        )}

                        {/* Recurrence Badge */}
                        {task.recurrence && (
                            <div className="flex items-center gap-1 text-cyan-400 bg-cyan-500/10 px-2 py-1 rounded-md border border-cyan-500/10">
                                <Repeat size={13} />
                                <span className="capitalize font-medium">{task.recurrence}</span>
                            </div>
                        )}

                        {/* Attachments Badge */}
                        {task.attachments && task.attachments.length > 0 && (
                            <div className="flex items-center gap-1 text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded-md border border-indigo-500/10">
                                <Paperclip size={13} />
                                <span className="font-medium">{task.attachments.length}</span>
                            </div>
                        )}

                        {/* Reminder Icon Only */}
                        {task.reminderTime && !isCompleted && (
                             <div title="Reminder Set">
                                <Bell size={14} className="text-yellow-500 fill-yellow-500/20" />
                             </div>
                        )}
                        
                        {/* Attendees Avatars (Right aligned if space permits) */}
                        {task.attendees && task.attendees.length > 0 && (
                           <div className="flex -space-x-2 ml-auto">
                              {task.attendees.map((src, i) => (
                                 <img key={i} src={src} className="w-5 h-5 rounded-full border-2 border-[#1e293b]" alt="Attendee" />
                              ))}
                           </div>
                        )}
                        
                        {/* Category Tag (If no attendees, push to right) */}
                         <div className={`flex items-center gap-1 opacity-60 ${(!task.attendees || task.attendees.length === 0) ? 'ml-auto' : 'ml-2'}`}>
                            <FolderInput size={12} />
                            <span>{task.category}</span>
                         </div>
                    </div>
                </div>

                {/* Edit Action (Visible on Hover for desktop, always rendered but hidden via opacity) */}
                {!isSelectionMode && !isCompleted && (
                   <button 
                      className="absolute top-3 right-3 p-1.5 text-slate-400 hover:text-white bg-black/20 hover:bg-black/40 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
                      onClick={(e) => { e.stopPropagation(); onClick(); }}
                   >
                     <Edit2 size={14} />
                   </button>
                )}
            </div>
        </GlassCard>
     </div>
   )
}

export default TasksScreen;