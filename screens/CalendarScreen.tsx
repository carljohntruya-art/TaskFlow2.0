import React, { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Plus, Calendar, Clock } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import { Task } from '../types';
import { taskService } from '../services/taskService';
import NewTaskModal from '../components/NewTaskModal';
import toast from 'react-hot-toast';

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const priorityColors: Record<string, string> = {
  high: 'bg-red-500',
  medium: 'bg-orange-500',
  low: 'bg-emerald-500',
};

const toDateKey = (d: Date): string =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const CalendarScreen: React.FC = () => {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<string>(toDateKey(today));
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal state
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Fetch tasks
  useEffect(() => {
    const loadTasks = async () => {
      try {
        setIsLoading(true);
        const data = await taskService.getTasks();
        setTasks(data);
      } catch (err) {
        toast.error('Failed to load tasks.');
      } finally {
        setIsLoading(false);
      }
    };
    loadTasks();

    const handleTaskUpdated = () => loadTasks();
    window.addEventListener('task-updated', handleTaskUpdated);
    return () => window.removeEventListener('task-updated', handleTaskUpdated);
  }, []);

  // Build a map of dateKey -> tasks[]
  const tasksByDate = useMemo(() => {
    const map: Record<string, Task[]> = {};
    tasks.forEach((task) => {
      if (!task.dueDateStr) return;
      // dueDateStr might be an ISO string or YYYY-MM-DD
      const dateStr = task.dueDateStr.includes('T')
        ? task.dueDateStr.split('T')[0]
        : task.dueDateStr;
      if (!map[dateStr]) map[dateStr] = [];
      map[dateStr].push(task);
    });
    return map;
  }, [tasks]);

  // Generate calendar grid cells
  const calendarDays = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const startPad = firstDay.getDay(); // 0=Sun
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

    const cells: { day: number; month: number; year: number; isCurrentMonth: boolean; dateKey: string }[] = [];

    // Previous month padding
    for (let i = startPad - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      const m = currentMonth === 0 ? 11 : currentMonth - 1;
      const y = currentMonth === 0 ? currentYear - 1 : currentYear;
      cells.push({ day: d, month: m, year: y, isCurrentMonth: false, dateKey: `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}` });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({ day: d, month: currentMonth, year: currentYear, isCurrentMonth: true, dateKey: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}` });
    }

    // Next month padding to fill 6 rows (42 cells) or at least complete the row
    const remaining = 42 - cells.length;
    for (let d = 1; d <= remaining; d++) {
      const m = currentMonth === 11 ? 0 : currentMonth + 1;
      const y = currentMonth === 11 ? currentYear + 1 : currentYear;
      cells.push({ day: d, month: m, year: y, isCurrentMonth: false, dateKey: `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}` });
    }

    return cells;
  }, [currentMonth, currentYear]);

  const todayKey = toDateKey(today);

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const goToToday = () => {
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
    setSelectedDate(todayKey);
  };

  const selectedDateTasks = tasksByDate[selectedDate] || [];

  const handleTaskSave = async (updatedTask: Task) => {
    try {
      if (!tasks.some((t) => t.id === updatedTask.id)) {
        const created = await taskService.createTask(updatedTask);
        if (created) setTasks((prev) => [created, ...prev]);
        toast.success('Task created!');
      } else {
        const updated = await taskService.updateTask(updatedTask.id, updatedTask);
        if (updated) setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
        toast.success('Task updated!');
      }
    } catch (err) {
      toast.error('Failed to save task.');
    }
    setEditingTask(null);
    setShowNewTaskModal(false);
  };

  // Readable label for selected date
  const selectedDateLabel = (() => {
    if (selectedDate === todayKey) return 'Today';
    const [y, m, d] = selectedDate.split('-').map(Number);
    const dt = new Date(y, m - 1, d);
    return dt.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
  })();

  return (
    <div className="px-4 py-6 min-h-screen">
      {/* Header */}
      <header className="flex items-center justify-between mb-6">
         <div className="flex items-center gap-3">
            <button onClick={prevMonth} className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
               <ChevronLeft size={20} />
            </button>
            <h1 className="text-lg font-semibold text-slate-900 dark:text-white min-w-[160px] text-center">
              {MONTH_NAMES[currentMonth]} {currentYear}
            </h1>
            <button onClick={nextMonth} className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
               <ChevronRight size={20} />
            </button>
         </div>
         <div className="flex gap-2">
            <button onClick={goToToday} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-medium text-slate-300 hover:bg-white/10 transition-colors">
               Today
            </button>
            <button
              onClick={() => setShowNewTaskModal(true)}
              className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-shadow"
            >
               <Plus size={18} />
            </button>
         </div>
      </header>

      {/* Calendar Grid */}
      <GlassCard className="rounded-2xl overflow-hidden p-1 mb-6">
         {/* Day headers */}
         <div className="grid grid-cols-7 mb-1 py-3 border-b border-slate-200 dark:border-white/5">
            {DAYS_OF_WEEK.map((d) => (
               <div key={d} className="text-center text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{d}</div>
            ))}
         </div>

         {/* Day cells */}
         <div className="grid grid-cols-7 gap-[1px] bg-slate-100 dark:bg-white/5 rounded-lg overflow-hidden border border-slate-200 dark:border-white/5">
            {calendarDays.map((cell, idx) => {
               const isToday = cell.dateKey === todayKey;
               const isSelected = cell.dateKey === selectedDate;
               const cellTasks = tasksByDate[cell.dateKey] || [];
               const hasTasks = cellTasks.length > 0;

               return (
                  <div
                    key={idx}
                    onClick={() => setSelectedDate(cell.dateKey)}
                    className={`min-h-[56px] p-1 flex flex-col items-center cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? 'bg-primary/10 dark:bg-primary/20'
                        : cell.isCurrentMonth
                          ? 'bg-white dark:bg-[#0f172a] hover:bg-slate-50 dark:hover:bg-white/5'
                          : 'bg-slate-50 dark:bg-[#0b1120]'
                    }`}
                  >
                     {isToday ? (
                        <div className={`w-7 h-7 flex items-center justify-center rounded-full font-bold text-sm mb-0.5 shadow-[0_0_12px_rgba(37,106,244,0.4)] ${
                          isSelected ? 'bg-primary text-white' : 'bg-primary/80 text-white'
                        }`}>
                           {cell.day}
                        </div>
                     ) : (
                        <span className={`text-xs mt-1 font-medium ${
                          !cell.isCurrentMonth
                            ? 'text-slate-300 dark:text-slate-600'
                            : isSelected
                              ? 'text-primary font-bold'
                              : 'text-slate-600 dark:text-slate-300'
                        }`}>
                           {cell.day}
                        </span>
                     )}

                     {/* Task dots */}
                     {hasTasks && (
                        <div className="flex gap-0.5 mt-1">
                           {cellTasks.slice(0, 3).map((t, i) => (
                              <div key={i} className={`w-1.5 h-1.5 rounded-full ${priorityColors[t.priority] || 'bg-primary'}`} />
                           ))}
                           {cellTasks.length > 3 && (
                             <span className="text-[8px] text-slate-400 ml-0.5">+{cellTasks.length - 3}</span>
                           )}
                        </div>
                     )}
                  </div>
               );
            })}
         </div>
      </GlassCard>

      {/* Selected Date Tasks */}
      <div className="flex items-center justify-between mb-4 px-1">
         <div>
           <h2 className="text-lg font-semibold text-slate-900 dark:text-white tracking-wide">{selectedDateLabel}</h2>
           <p className="text-xs text-slate-400 mt-0.5">{selectedDateTasks.length} task{selectedDateTasks.length !== 1 ? 's' : ''}</p>
         </div>
         <button
           onClick={() => setShowNewTaskModal(true)}
           className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
         >
           <Plus size={14} />
           New Task
         </button>
      </div>

      <div className="space-y-3 pb-24">
         {isLoading ? (
           Array.from({ length: 3 }).map((_, i) => (
             <div key={i} className="animate-pulse flex gap-4 p-4 rounded-xl bg-white/5 border border-white/5">
               <div className="w-12 h-12 bg-slate-700 rounded-lg shrink-0" />
               <div className="flex-1 space-y-2">
                 <div className="h-4 bg-slate-700 rounded w-3/4" />
                 <div className="h-3 bg-slate-700/60 rounded w-full" />
               </div>
             </div>
           ))
         ) : selectedDateTasks.length === 0 ? (
           <div className="flex flex-col items-center justify-center py-16 text-center">
             <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-3">
               <Calendar size={24} className="text-slate-400 dark:text-slate-600" />
             </div>
             <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">No tasks due on this day</p>
             <button
               onClick={() => setShowNewTaskModal(true)}
               className="mt-3 text-primary text-sm font-medium hover:underline flex items-center gap-1"
             >
               <Plus size={14} />
               Add a task
             </button>
           </div>
         ) : (
           selectedDateTasks.map((task) => {
             const statusColor = task.status === 'completed'
               ? 'border-emerald-500/30'
               : task.status === 'in-progress'
                 ? 'border-primary/30'
                 : 'border-white/5';

             return (
               <GlassCard
                 key={task.id}
                 className={`rounded-xl p-4 flex items-center gap-4 relative overflow-hidden group cursor-pointer hover:bg-white/5 transition-all border-l-2 ${statusColor}`}
                 onClick={() => setEditingTask(task)}
               >
                  <div className={`flex-shrink-0 w-12 flex flex-col items-center justify-center rounded-lg py-2 border ${
                    task.status === 'completed' ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-white/5 border-white/5'
                  }`}>
                     <Clock size={14} className={task.status === 'completed' ? 'text-emerald-400' : 'text-slate-400'} />
                     <span className={`text-[10px] font-semibold mt-0.5 ${task.status === 'completed' ? 'text-emerald-400' : 'text-slate-300'}`}>
                       {task.dueTime || '—'}
                     </span>
                  </div>
                  <div className="flex-1 min-w-0">
                     <div className="flex items-center justify-between mb-1">
                        <h3 className={`text-sm font-semibold truncate ${task.status === 'completed' ? 'line-through text-slate-500' : 'text-slate-900 dark:text-white'}`}>
                          {task.title}
                        </h3>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                          task.priority === 'high'
                            ? 'bg-red-500/10 text-red-400 border-red-500/20'
                            : task.priority === 'medium'
                              ? 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        }`}>
                           {task.priority}
                        </span>
                     </div>
                     {task.description && (
                       <p className="text-xs text-slate-400 truncate">{task.description}</p>
                     )}
                  </div>
                  <ChevronRight size={16} className="text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
               </GlassCard>
             );
           })
         )}
      </div>

      {/* New Task Modal (with pre-filled date) */}
      {showNewTaskModal && (
        <NewTaskModal
          onClose={() => setShowNewTaskModal(false)}
          onSave={handleTaskSave}
          defaultDueDate={selectedDate}
        />
      )}

      {/* Edit Task Modal */}
      {editingTask && (
        <NewTaskModal
          task={editingTask}
          onClose={() => setEditingTask(null)}
          onSave={handleTaskSave}
        />
      )}
    </div>
  );
};

export default CalendarScreen;