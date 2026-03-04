import axiosInstance from '../api/axiosInstance';
import { User } from '../types';

export interface AuthResponse {
  success: boolean;
  message?: string;
  data?: any;
  user?: User;
}

export const authService = {
  async register(name: string, email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await axiosInstance.post('/api/auth/register', { name, email, password });
      return { success: true, user: response.data.data };
    } catch (error: any) {
      return error.response?.data || { success: false, message: 'Registration failed' };
    }
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await axiosInstance.post('/api/auth/login', { email, password });
      return { success: true, user: response.data.data };
    } catch (error: any) {
      return error.response?.data || { success: false, message: 'Login failed' };
    }
  },

  async logout(): Promise<AuthResponse> {
    try {
      const response = await axiosInstance.post('/api/auth/logout');
      return response.data;
    } catch (error: any) {
      return error.response?.data || { success: false, message: 'Logout failed' };
    }
  },

  async getMe(): Promise<AuthResponse> {
    try {
      const response = await axiosInstance.get('/api/auth/me');
      return { success: true, data: response.data.data };
    } catch (error: any) {
      return error.response?.data || { success: false, message: 'Not authenticated' };
    }
  },

  async getAllUsers(): Promise<User[]> {
    try {
      const response = await axiosInstance.get('/api/auth/users');
      const users = response.data.data;
      return users.map((u: any) => ({
        ...u,
        avatar: u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.name}`
      }));
    } catch (error: any) {
      console.error('Failed to fetch users:', error);
      return [];
    }
  },

  async updateProfile(name: string): Promise<AuthResponse> {
    try {
      const response = await axiosInstance.patch('/api/auth/profile', { name });
      return { success: true, data: response.data.data };
    } catch (error: any) {
      return error.response?.data || { success: false, message: 'Profile update failed' };
    }
  }
};
