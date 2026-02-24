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
    try {
      const response = await authService.getMe();
      if (response.success && response.data) {
        set({ user: response.data, isLoading: false });
      } else {
        // 401 / no session — silent fail, let routing handle redirect to login
        set({ user: null, isLoading: false });
      }
    } catch {
      // Network error or unexpected throw — still resolve cleanly
      set({ user: null, isLoading: false });
    }
  },
  logout: async () => {
    await authService.logout();
    set({ user: null });
  }
}));

// Set up interceptors:
// - 401: clear auth state only (no redirect — checkAuth handles it)
// - 403: redirect to /unauthorized
// - 5xx / network: show console warning
setupInterceptors(
  () => useAuthStore.getState().setUser(null),
  (path: string) => { window.location.href = path; },
  (msg: string) => { console.warn('[API Error]', msg); }
);
