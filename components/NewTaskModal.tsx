import React, { useState, useEffect, useRef } from 'react';
import { X, Calendar, AlignLeft, BarChart2, Folder, ChevronDown, Bell, Repeat, Image as ImageIcon, Upload, Trash2 } from 'lucide-react';
import DOMPurify from 'dompurify';
import GlassCard from './GlassCard';
import { Task } from '../types';

interface NewTaskModalProps {
  onClose: () => void;
  task?: Task; // Optional task for editing mode
  onSave?: (task: Task) => void;
}

const CATEGORIES = ['Finance', 'Design', 'Development', 'Sales', 'Marketing', 'General'];
const RECURRENCE_OPTIONS = [
  { value: '', label: 'No Repeat' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
];

const NewTaskModal: React.FC<NewTaskModalProps> = ({ onClose, task, onSave }) => {
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [priority, setPriority] = useState<Task['priority']>(task?.priority || 'medium');
  const [category, setCategory] = useState(task?.category || 'General');
  const [reminderTime, setReminderTime] = useState(task?.reminderTime || '');
  const [recurrence, setRecurrence] = useState<Task['recurrence'] | ''>(task?.recurrence || '');
  const [attachments, setAttachments] = useState<string[]>(task?.attachments || []);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description);
      setPriority(task.priority);
      setCategory(task.category);
      setReminderTime(task.reminderTime || '');
      setRecurrence(task.recurrence || '');
      setAttachments(task.attachments || []);
    }
  }, [task]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const sanitizedTitle = DOMPurify.sanitize(title);
    const sanitizedDescription = DOMPurify.sanitize(description);

    const updatedTask: Task = {
      id: task?.id || Math.random().toString(36).substr(2, 9),
      title: sanitizedTitle,
      description: sanitizedDescription,
      priority,
      status: task?.status || 'pending',
      dueDateStr: task?.dueDateStr || 'Today',
      dueTime: task?.dueTime,
      category: category,
      attendees: task?.attendees,
      reminderTime: reminderTime || undefined,
      recurrence: recurrence || undefined,
      attachments: attachments,
    };

    if (onSave) {
      onSave(updatedTask);
    } else {
      // Create directly using API if accessed from global BottomNav
      try {
         const { taskService } = await import('../services/taskService');
         await taskService.createTask(updatedTask);
         window.dispatchEvent(new Event('task-updated'));
      } catch (err) {
         // Silently fail for now
      }
    }
    onClose();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(Array.from(e.target.files));
    }
  };

  const processFiles = (files: File[]) => {
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setAttachments(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(Array.from(e.dataTransfer.files));
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-[fadeIn_0.2s_ease-out]">
       <div className="w-full sm:max-w-md bg-white dark:bg-[#101622]/90 backdrop-blur-xl border-t sm:border border-slate-200 dark:border-white/10 rounded-t-2xl sm:rounded-2xl p-6 shadow-2xl relative overflow-hidden animate-[slideUp_0.3s_ease-out] transition-colors duration-300 max-h-[90vh] overflow-y-auto hide-scrollbar">
          {/* Background Glows */}
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="flex justify-between items-start mb-6 relative z-10">
             <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{task ? 'Edit Task' : 'New Task'}</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{task ? 'Update task details' : 'Create a new ticket for your team'}</p>
             </div>
             <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors p-1 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full">
                <X size={24} />
             </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
             <div className="space-y-1.5">
                <label className="text-xs font-semibold text-primary uppercase tracking-wider ml-1">Title</label>
                <input 
                  type="text" 
                  autoFocus={!task}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="What needs to be done?" 
                  className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 rounded-lg px-4 py-3 focus:ring-1 focus:ring-primary focus:border-primary transition-all text-base"
                />
             </div>

             <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Description</label>
                <textarea 
                   rows={3}
                   value={description}
                   onChange={(e) => setDescription(e.target.value)}
                   placeholder="Add details regarding this task..." 
                   className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 rounded-lg px-4 py-3 focus:ring-1 focus:ring-primary focus:border-primary transition-all text-sm resize-none"
                />
             </div>

             {/* Image Upload Section */}
             <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Attachments</label>
                
                {/* Drag and Drop Area */}
                <div 
                   className={`relative w-full border-2 border-dashed rounded-xl p-4 transition-all duration-300 flex flex-col items-center justify-center text-center cursor-pointer ${
                      isDragging 
                        ? 'border-primary bg-primary/10' 
                        : 'border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-white/5 hover:border-primary/50 hover:bg-slate-100 dark:hover:bg-white/10'
                   }`}
                   onDragOver={handleDragOver}
                   onDragLeave={handleDragLeave}
                   onDrop={handleDrop}
                   onClick={() => fileInputRef.current?.click()}
                >
                   <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="image/*" 
                      multiple 
                      onChange={handleFileSelect}
                   />
                   
                   <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-white/10 flex items-center justify-center mb-2 text-slate-500 dark:text-slate-400">
                      <Upload size={20} />
                   </div>
                   <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                      Click or drag images here
                   </p>
                   <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Supports JPG, PNG, GIF
                   </p>
                </div>

                {/* Preview List */}
                {attachments.length > 0 && (
                   <div className="flex gap-2 overflow-x-auto hide-scrollbar pt-2 pb-1">
                      {attachments.map((src, index) => (
                         <div key={index} className="relative group shrink-0 w-20 h-20 rounded-lg overflow-hidden border border-slate-200 dark:border-white/10">
                            <img src={src} alt={`Attachment ${index}`} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                               <button 
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); removeAttachment(index); }}
                                  className="p-1.5 bg-red-500 rounded-full text-white hover:bg-red-600 transition-colors"
                               >
                                  <Trash2 size={14} />
                               </button>
                            </div>
                         </div>
                      ))}
                   </div>
                )}
             </div>

             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                   <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Due Date</label>
                   <div className="relative group">
                      <input 
                        type="text" 
                        readOnly 
                        value={task?.dueDateStr || "Today, 5:00 PM"} 
                        className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white cursor-pointer rounded-lg pl-10 pr-4 py-3 focus:ring-1 focus:ring-primary focus:border-primary text-sm truncate"
                      />
                      <Calendar size={18} className="absolute left-3 top-3 text-primary" />
                   </div>
                </div>

                <div className="space-y-1.5">
                   <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Category</label>
                   <div className="relative group">
                      <select 
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white cursor-pointer rounded-lg pl-10 pr-8 py-3 focus:ring-1 focus:ring-primary focus:border-primary text-sm appearance-none outline-none"
                      >
                        {CATEGORIES.map(cat => (
                          <option key={cat} value={cat} className="bg-white dark:bg-[#1e293b] text-slate-900 dark:text-white py-1">{cat}</option>
                        ))}
                      </select>
                      <Folder size={18} className="absolute left-3 top-3 text-slate-400" />
                      <ChevronDown size={16} className="absolute right-3 top-3.5 text-slate-500 pointer-events-none" />
                   </div>
                </div>
             </div>

             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                   <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Set Reminder</label>
                   <div className="relative group">
                      <input 
                        type="datetime-local" 
                        value={reminderTime} 
                        onChange={(e) => setReminderTime(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-lg pl-10 pr-4 py-3 focus:ring-1 focus:ring-primary focus:border-primary text-sm placeholder-slate-400 dark:placeholder-slate-500 [color-scheme:light] dark:[color-scheme:dark]"
                      />
                      <Bell size={18} className={`absolute left-3 top-3 ${reminderTime ? 'text-yellow-500' : 'text-slate-400'}`} />
                   </div>
                </div>

                <div className="space-y-1.5">
                   <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Recurring</label>
                   <div className="relative group">
                      <select 
                        value={recurrence}
                        onChange={(e) => setRecurrence(e.target.value as Task['recurrence'] | '')}
                        className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white cursor-pointer rounded-lg pl-10 pr-8 py-3 focus:ring-1 focus:ring-primary focus:border-primary text-sm appearance-none outline-none"
                      >
                        {RECURRENCE_OPTIONS.map(opt => (
                          <option key={opt.value} value={opt.value} className="bg-white dark:bg-[#1e293b] text-slate-900 dark:text-white py-1">{opt.label}</option>
                        ))}
                      </select>
                      <Repeat size={18} className={`absolute left-3 top-3 ${recurrence ? 'text-cyan-500' : 'text-slate-400'}`} />
                      <ChevronDown size={16} className="absolute right-3 top-3.5 text-slate-500 pointer-events-none" />
                   </div>
                </div>
             </div>

             <div className="space-y-1.5">
               <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Priority</label>
               <div className="grid grid-cols-3 gap-3 p-1 bg-slate-100 dark:bg-black/20 rounded-xl border border-slate-200 dark:border-white/5">
                 {(['low', 'medium', 'high'] as const).map((p, idx) => (
                   <label key={p} className="cursor-pointer relative">
                      <input 
                        type="radio" 
                        name="priority" 
                        className="peer sr-only" 
                        checked={priority === p}
                        onChange={() => setPriority(p)}
                      />
                      <div className={`flex flex-col items-center justify-center py-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all peer-checked:bg-white dark:peer-checked:bg-white/10 peer-checked:text-slate-900 dark:peer-checked:text-white border border-transparent peer-checked:border-slate-200 dark:peer-checked:border-white/10 shadow-sm dark:shadow-none`}>
                         <BarChart2 size={16} className={`mb-0.5 ${p === 'high' ? 'text-red-500 dark:text-red-400' : p === 'medium' ? 'text-yellow-500 dark:text-yellow-400' : 'text-green-500 dark:text-green-400'}`} />
                         <span className="text-[10px] font-bold uppercase tracking-wide">{p}</span>
                      </div>
                   </label>
                 ))}
               </div>
             </div>

             <div className="pt-2 flex gap-3">
                <button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-primary to-cyan-500 hover:to-cyan-400 text-white font-semibold py-3.5 px-6 rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 active:scale-[0.98] transition-all transform flex justify-center items-center gap-2"
                >
                  {task ? 'Save Changes' : 'Create Task'}
                </button>
             </div>
          </form>
       </div>
    </div>
  );
};

export default NewTaskModal;