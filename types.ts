
export enum Screen {
  LOGIN = 'LOGIN',
  REGISTER = 'REGISTER',
  HOME = 'HOME',
  TASKS = 'TASKS',
  ANALYTICS = 'ANALYTICS',
  CALENDAR = 'CALENDAR',
  PROFILE = 'PROFILE',
  PROJECT_SETTINGS = 'PROJECT_SETTINGS',
  ADMIN = 'ADMIN',
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'completed' | 'in-progress';
  priority: 'high' | 'medium' | 'low';
  dueDateStr: string;
  dueTime?: string;
  category: string;
  attendees?: string[];
  reminderTime?: string; // ISO string for the specific reminder time
  completedAt?: string; // ISO string for when the task was completed
  recurrence?: 'daily' | 'weekly' | 'monthly';
  attachments?: string[]; // Array of image URLs or base64 strings
  createdAt?: string; // ISO string for creation time
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'admin' | 'user';
}
