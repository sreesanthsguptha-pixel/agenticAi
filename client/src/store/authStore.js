import { create } from 'zustand';
import api from '../services/api';

export const useAuthStore = create((set) => ({
  user: null,
  token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post('/auth/login', { email, password });
      const { user, token } = res.data.data;
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', token);
      }
      set({ user, token, isAuthenticated: true, isLoading: false });
      return user;
    } catch (err) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  register: async (name, email, password, role = 'operator') => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post('/auth/register', { name, email, password, role });
      const { user, token } = res.data.data;
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', token);
      }
      set({ user, token, isAuthenticated: true, isLoading: false });
      return user;
    } catch (err) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  fetchMe: async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
      return;
    }

    set({ isLoading: true });
    try {
      const res = await api.get('/auth/me');
      set({ user: res.data.data, token, isAuthenticated: true, isLoading: false });
    } catch (err) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
      }
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
    }
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
    set({ user: null, token: null, isAuthenticated: false, isLoading: false });
  }
}));
