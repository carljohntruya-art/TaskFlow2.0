import { create } from 'zustand';
import { User } from '../types';
import { authService } from '../services/authService';
import { setupInterceptors } from '../api/axiosInstance';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  checkAuth: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  checkAuth: async () => {
    set({ isLoading: true });
    const response = await authService.getMe();
    if (response.success && response.data) {
      set({ user: response.data, isLoading: false });
    } else {
      set({ user: null, isLoading: false });
    }
  },
  logout: async () => {
    await authService.logout();
    set({ user: null });
  }
}));

// Set up interceptors to clear auth on 401, redirect on 403, show toast on 5xx/network errors
setupInterceptors(
  () => useAuthStore.getState().setUser(null),
  (path: string) => { window.location.href = path; },
  (msg: string) => { console.warn('[API Error]', msg); }
);
