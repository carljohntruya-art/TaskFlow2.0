import axiosInstance from '../api/axiosInstance';
import { Task } from '../types';

const mapToFrontendStatus = (backendStatus: string): Task['status'] => {
  if (backendStatus === 'done') return 'completed';
  if (backendStatus === 'in_progress') return 'in-progress';
  return 'pending'; // Default for 'todo'
};

const mapToBackendStatus = (frontendStatus: Task['status']): string => {
  if (frontendStatus === 'completed') return 'done';
  if (frontendStatus === 'in-progress') return 'in_progress';
  return 'todo';
};

const mapBackendToTask = (raw: any): Task => ({
  id: raw.id,
  title: raw.title,
  description: raw.description || '',
  status: mapToFrontendStatus(raw.status),
  priority: raw.priority || 'medium',
  dueDateStr: raw.due_date ? new Date(raw.due_date).toISOString() : 'Today',
  createdAt: raw.created_at,
  category: 'General', // Backend doesn't have category yet
  attendees: [],
});

export const taskService = {
  async createTask(data: Task) {
    const response = await axiosInstance.post('/api/tasks', {
      title: data.title,
      description: data.description,
      status: mapToBackendStatus(data.status),
      priority: data.priority,
      dueDate: data.dueDateStr !== 'Today' && data.dueDateStr !== 'Tomorrow' && data.dueDateStr !== 'Yesterday' ? data.dueDateStr : new Date().toISOString()
    });
    return response.data.data ? mapBackendToTask(response.data.data) : null;
  },

  async getTasks(): Promise<Task[]> {
    const response = await axiosInstance.get('/api/tasks');
    return Array.isArray(response.data.data) ? response.data.data.map(mapBackendToTask) : [];
  },

  async updateTask(id: string, data: Partial<Task>) {
    const backendData: any = {};
    if (data.title) backendData.title = data.title;
    if (data.description !== undefined) backendData.description = data.description;
    if (data.status) backendData.status = mapToBackendStatus(data.status);
    if (data.priority) backendData.priority = data.priority;

    const response = await axiosInstance.patch(`/api/tasks/${id}`, backendData);
    return response.data.data ? mapBackendToTask(response.data.data) : null;
  },

  async deleteTask(id: string) {
    const response = await axiosInstance.delete(`/api/tasks/${id}`);
    return response.data.success;
  }
};
