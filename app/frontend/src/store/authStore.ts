import { create } from 'zustand';
import { api, tokenStore, ApiError } from '@/lib/api';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  status: 'idle' | 'loading' | 'authenticated' | 'unauthenticated';
  init: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (input: { name: string; email: string; password: string; phone?: string }) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
  isStaff: () => boolean;
}

/** Global authentication store backed by the API + access-token store. */
export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  status: 'idle',

  async init() {
    if (!tokenStore.get()) {
      set({ status: 'unauthenticated' });
      return;
    }
    set({ status: 'loading' });
    try {
      const res = await api.get<User>('/auth/me');
      set({ user: res.data, status: 'authenticated' });
    } catch {
      tokenStore.clear();
      set({ user: null, status: 'unauthenticated' });
    }
  },

  async login(email, password) {
    const res = await api.post<{ user: User; accessToken: string }>(
      '/auth/login',
      { email, password },
      { auth: false },
    );
    tokenStore.set(res.data.accessToken);
    set({ user: res.data.user, status: 'authenticated' });
  },

  async register(input) {
    const res = await api.post<{ user: User; accessToken: string }>('/auth/register', input, {
      auth: false,
    });
    tokenStore.set(res.data.accessToken);
    set({ user: res.data.user, status: 'authenticated' });
  },

  async logout() {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      if (!(err instanceof ApiError)) throw err;
    } finally {
      tokenStore.clear();
      set({ user: null, status: 'unauthenticated' });
    }
  },

  setUser(user) {
    set({ user });
  },

  isStaff() {
    const role = get().user?.role;
    return role === 'super_admin' || role === 'admin' || role === 'manager';
  },
}));
